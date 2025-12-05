import { create } from 'zustand'
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import * as THREE from 'three'

type AxisType = 'localX' | 'localY' | 'localZ' | 'globalX' | 'globalY' | 'globalZ' | null

// Snapshot of all bone rotations
interface PoseSnapshot {
    bones: Map<string, THREE.Quaternion>
    sceneQuat: THREE.Quaternion
    scenePos: THREE.Vector3
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
    return {
        bones,
        sceneQuat: vrm.scene.quaternion.clone(),
        scenePos: vrm.scene.position.clone()
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
}

export const useStore = create<AppState>((set, get) => ({
    vrm: null,
    setVrm: (vrm) => set({
        vrm,
        selectedBone: null,
        selectedBoneName: null,
        isVRM1: vrm?.meta && 'metaVersion' in vrm.meta ? true : false,
        history: vrm ? [createSnapshot(vrm)] : [],
        historyIndex: 0
    }),
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

