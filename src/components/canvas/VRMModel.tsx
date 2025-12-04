import { useStore } from '../../store/useStore'

import { useEffect } from 'react'

export const VRMModel = () => {
    const vrm = useStore((state) => state.vrm)

    useEffect(() => {
        if (vrm) {
            // Cleanup or initial setup if needed
            console.log('VRM Model mounted', vrm)
        }
    }, [vrm])

    if (!vrm) return null

    return <primitive object={vrm.scene} />
}
