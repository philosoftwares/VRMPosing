import { create } from 'zustand'
import { VRM } from '@pixiv/three-vrm'
import * as THREE from 'three'

interface AppState {
    vrm: VRM | null
    setVrm: (vrm: VRM | null) => void
    selectedBone: THREE.Object3D | null
    selectedBoneName: string | null
    setSelectedBone: (bone: THREE.Object3D | null, name: string | null) => void
}

export const useStore = create<AppState>((set) => ({
    vrm: null,
    setVrm: (vrm) => set({ vrm, selectedBone: null, selectedBoneName: null }),
    selectedBone: null,
    selectedBoneName: null,
    setSelectedBone: (bone, name) => set({ selectedBone: bone, selectedBoneName: name }),
}))
