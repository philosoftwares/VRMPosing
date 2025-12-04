import { create } from 'zustand'
import { VRM } from '@pixiv/three-vrm'

interface AppState {
    vrm: VRM | null
    setVrm: (vrm: VRM | null) => void
}

export const useStore = create<AppState>((set) => ({
    vrm: null,
    setVrm: (vrm) => set({ vrm }),
}))
