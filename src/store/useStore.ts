import { create } from 'zustand'
import { VRM } from '@pixiv/three-vrm'
import * as THREE from 'three'

type AxisType = 'localX' | 'localY' | 'localZ' | 'globalX' | 'globalY' | 'globalZ' | null

interface AppState {
    vrm: VRM | null
    setVrm: (vrm: VRM | null) => void
    initialSceneQuat: THREE.Quaternion
    setInitialSceneQuat: (quat: THREE.Quaternion) => void
    selectedBone: THREE.Object3D | null
    selectedBoneName: string | null
    setSelectedBone: (bone: THREE.Object3D | null, name: string | null) => void
    isDragging: boolean
    setIsDragging: (isDragging: boolean) => void
    hoveredAxis: AxisType
    setHoveredAxis: (axis: AxisType) => void
}

export const useStore = create<AppState>((set) => ({
    vrm: null,
    setVrm: (vrm) => set({ vrm, selectedBone: null, selectedBoneName: null }),
    initialSceneQuat: new THREE.Quaternion(),
    setInitialSceneQuat: (quat) => set({ initialSceneQuat: quat.clone() }),
    selectedBone: null,
    selectedBoneName: null,
    setSelectedBone: (bone, name) => set({ selectedBone: bone, selectedBoneName: name }),
    isDragging: false,
    setIsDragging: (isDragging) => set({ isDragging }),
    hoveredAxis: null,
    setHoveredAxis: (hoveredAxis) => set({ hoveredAxis }),
}))
