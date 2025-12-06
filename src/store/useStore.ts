import { create } from 'zustand'
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import * as THREE from 'three'

type AxisType = 'localX' | 'localY' | 'localZ' | 'globalX' | 'globalY' | 'globalZ' |
    'localDragX' | 'localDragY' | 'localDragZ' | 'worldDragX' | 'worldDragY' | 'worldDragZ' | null

// Snapshot of all bone rotations
interface PoseSnapshot {
    bones: Map<string, THREE.Quaternion>
    sceneQuat: THREE.Quaternion
    scenePos: THREE.Vector3
    eyeYaw: number
    eyePitch: number
}

interface AppState {
    vrm: VRM | null
    setVrm: (vrm: VRM | null) => void
    vrmFileName: string | null
    setVrmFileName: (name: string | null) => void
    isVRM1: boolean
    initialSceneQuat: THREE.Quaternion
    setInitialSceneQuat: (quat: THREE.Quaternion) => void
    selectedBone: THREE.Object3D | null
    selectedBoneName: string | null
    setSelectedBone: (bone: THREE.Object3D | null, name: string | null) => void
    isDragging: boolean
    setIsDragging: (isDragging: boolean) => void
    hoveredAxis: AxisType
    setHoveredAxis: (axis: AxisType) => void
    // Eye direction
    eyeYaw: number
    eyePitch: number
    setEyeDirection: (yaw: number, pitch: number) => void
    // Camera controls
    cameraResetCallbacks: {
        focusToModel?: () => void
        resetPosition?: () => void
        resetRotation?: () => void
        resetAll?: () => void
    }
    setCameraResetCallbacks: (callbacks: AppState['cameraResetCallbacks']) => void
    // Camera state (for info panel)
    cameraState: {
        position: { x: number; y: number; z: number }
        spherical: { azimuth: number; elevation: number; distance: number }
    }
    setCameraState: (state: AppState['cameraState']) => void
    applyCameraPosition?: (x: number, y: number, z: number) => void
    setApplyCameraPosition: (fn: (x: number, y: number, z: number) => void) => void
    applyCameraSpherical?: (azimuth: number, elevation: number, distance: number) => void
    setApplyCameraSpherical: (fn: (azimuth: number, elevation: number, distance: number) => void) => void
    // History for undo/redo
    history: PoseSnapshot[]
    historyIndex: number
    saveSnapshot: () => void
    undo: () => void
    redo: () => void
    canUndo: () => boolean
    canRedo: () => boolean
}

const createSnapshot = (vrm: VRM): PoseSnapshot => {
    const bones = new Map<string, THREE.Quaternion>()
    const boneNames = Object.values(VRMHumanBoneName)
    for (const boneName of boneNames) {
        const bone = vrm.humanoid?.getNormalizedBoneNode(boneName)
        if (bone) {
            bones.set(boneName, bone.quaternion.clone())
        }
    }

    // Get current eye direction from store
    const state = useStore.getState()

    return {
        bones,
        sceneQuat: vrm.scene.quaternion.clone(),
        scenePos: vrm.scene.position.clone(),
        eyeYaw: state.eyeYaw,
        eyePitch: state.eyePitch
    }
}

const applySnapshot = (vrm: VRM, snapshot: PoseSnapshot) => {
    for (const [boneName, quat] of snapshot.bones) {
        const bone = vrm.humanoid?.getNormalizedBoneNode(boneName as VRMHumanBoneName)
        if (bone) {
            bone.quaternion.copy(quat)
        }
    }
    vrm.scene.quaternion.copy(snapshot.sceneQuat)
    vrm.scene.position.copy(snapshot.scenePos)

    // Restore eye direction
    useStore.setState({ eyeYaw: snapshot.eyeYaw, eyePitch: snapshot.eyePitch })

    // Apply to VRM lookAt
    if (vrm.lookAt?.applier && 'applyYawPitch' in vrm.lookAt.applier) {
        (vrm.lookAt.applier as any).applyYawPitch(snapshot.eyeYaw, snapshot.eyePitch)
    }
}

export const useStore = create<AppState>((set, get) => ({
    vrm: null,
    setVrm: (vrm) => {
        // VRM 1.0 has meta.metaVersion === '1', VRM 0.x has different meta structure
        const isVRM1 = vrm?.meta ? (
            'metaVersion' in vrm.meta && vrm.meta.metaVersion === '1'
        ) : false

        // Reset eye direction first so snapshot captures correct values
        set({ eyeYaw: 0, eyePitch: 0 })

        set({
            vrm,
            selectedBone: null,
            selectedBoneName: null,
            isVRM1,
            history: vrm ? [createSnapshot(vrm)] : [],
            historyIndex: 0
        })
    },
    vrmFileName: null,
    setVrmFileName: (vrmFileName) => set({ vrmFileName }),
    isVRM1: false,
    initialSceneQuat: new THREE.Quaternion(),
    setInitialSceneQuat: (quat) => set({ initialSceneQuat: quat.clone() }),
    selectedBone: null,
    selectedBoneName: null,
    setSelectedBone: (bone, name) => set({ selectedBone: bone, selectedBoneName: name }),
    isDragging: false,
    setIsDragging: (isDragging) => set({ isDragging }),
    hoveredAxis: null,
    setHoveredAxis: (hoveredAxis) => set({ hoveredAxis }),
    // Eye direction
    eyeYaw: 0,
    eyePitch: 0,
    setEyeDirection: (yaw, pitch) => set({ eyeYaw: yaw, eyePitch: pitch }),
    // Camera reset
    cameraResetCallbacks: {},
    setCameraResetCallbacks: (callbacks) => set({ cameraResetCallbacks: callbacks }),
    // Camera state (for info panel)
    cameraState: { position: { x: 0, y: 1.5, z: 2 }, spherical: { azimuth: 0, elevation: 0, distance: 2 } },
    setCameraState: (state) => set({ cameraState: state }),
    applyCameraPosition: undefined,
    setApplyCameraPosition: (fn) => set({ applyCameraPosition: fn }),
    applyCameraSpherical: undefined,
    setApplyCameraSpherical: (fn: (azimuth: number, elevation: number, distance: number) => void) => set({ applyCameraSpherical: fn }),
    // History
    history: [],
    historyIndex: -1,
    saveSnapshot: () => {
        const { vrm, history, historyIndex } = get()
        if (!vrm) return

        const newSnapshot = createSnapshot(vrm)
        // Remove any future history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(newSnapshot)

        set({
            history: newHistory,
            historyIndex: newHistory.length - 1
        })
    },
    undo: () => {
        const { vrm, history, historyIndex } = get()
        if (!vrm || historyIndex <= 0) return

        const newIndex = historyIndex - 1
        applySnapshot(vrm, history[newIndex])
        set({ historyIndex: newIndex })
    },
    redo: () => {
        const { vrm, history, historyIndex } = get()
        if (!vrm || historyIndex >= history.length - 1) return

        const newIndex = historyIndex + 1
        applySnapshot(vrm, history[newIndex])
        set({ historyIndex: newIndex })
    },
    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,
}))

