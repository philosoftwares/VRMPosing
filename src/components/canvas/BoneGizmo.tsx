import { useStore } from '../../store/useStore'
import { TransformControls } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export const BoneGizmo = () => {
    const selectedBone = useStore((state) => state.selectedBone)
    const transformRef = useRef<THREE.Object3D>(null)

    // Disable orbit controls when using gizmo
    useEffect(() => {
        const controls = transformRef.current
        if (!controls) return

        const callback = (event: THREE.Event & { value?: boolean }) => {
            const orbitControls = document.querySelector('canvas')
            if (orbitControls) {
                // Signal to disable orbit controls while dragging
                orbitControls.style.pointerEvents = event.value ? 'none' : 'auto'
            }
        }

        // @ts-ignore - TransformControls has dragging-changed event
        controls.addEventListener?.('dragging-changed', callback)
        return () => {
            // @ts-ignore
            controls.removeEventListener?.('dragging-changed', callback)
        }
    }, [])

    if (!selectedBone) return null

    return (
        <TransformControls
            ref={transformRef as any}
            object={selectedBone}
            mode="rotate"
            size={0.8}
            showX
            showY
            showZ
        />
    )
}
