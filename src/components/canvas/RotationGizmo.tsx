import { useStore } from '../../store/useStore'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export const RotationGizmo = () => {
    const selectedBone = useStore((state) => state.selectedBone)
    const selectedBoneName = useStore((state) => state.selectedBoneName)
    const hoveredAxis = useStore((state) => state.hoveredAxis)
    const vrm = useStore((state) => state.vrm)
    const ringRef = useRef<THREE.Mesh>(null)

    useFrame(() => {
        if (ringRef.current && selectedBone) {
            // Special case for Root bone: use vrm.scene position (origin)
            if (selectedBoneName === 'Root' && vrm?.scene) {
                // Position at scene origin
                ringRef.current.position.copy(vrm.scene.position)

                // For global, use world orientation (fixed)
                if (hoveredAxis?.startsWith('global')) {
                    ringRef.current.quaternion.set(0, 0, 0, 1)
                    if (hoveredAxis === 'globalX') {
                        ringRef.current.rotation.set(0, Math.PI / 2, 0)
                    } else if (hoveredAxis === 'globalY') {
                        ringRef.current.rotation.set(Math.PI / 2, 0, 0)
                    }
                } else {
                    // For local, follow scene rotation
                    ringRef.current.quaternion.copy(vrm.scene.quaternion)
                    if (hoveredAxis === 'localX') {
                        ringRef.current.rotateY(Math.PI / 2)
                    } else if (hoveredAxis === 'localY') {
                        ringRef.current.rotateX(Math.PI / 2)
                    }
                }
                return
            }

            // Normal bone: position at bone's world position
            selectedBone.getWorldPosition(ringRef.current.position)

            // For local axes, copy the bone's world rotation
            if (hoveredAxis?.startsWith('local')) {
                selectedBone.getWorldQuaternion(ringRef.current.quaternion)

                if (hoveredAxis === 'localX') {
                    ringRef.current.rotateY(Math.PI / 2)
                } else if (hoveredAxis === 'localY') {
                    ringRef.current.rotateX(Math.PI / 2)
                }
            } else {
                // For global axes, use world orientation (fixed)
                ringRef.current.quaternion.set(0, 0, 0, 1)

                if (hoveredAxis === 'globalX') {
                    ringRef.current.rotation.set(0, Math.PI / 2, 0)
                } else if (hoveredAxis === 'globalY') {
                    ringRef.current.rotation.set(Math.PI / 2, 0, 0)
                }
            }
        }
    })

    if (!selectedBone || !hoveredAxis) return null

    // Determine color based on axis
    const getColor = () => {
        if (hoveredAxis.endsWith('X')) return '#ff4444'
        if (hoveredAxis.endsWith('Y')) return '#44ff44'
        return '#4444ff'
    }

    return (
        <mesh ref={ringRef} renderOrder={1000}>
            <torusGeometry args={[0.15, 0.005, 16, 64]} />
            <meshBasicMaterial
                color={getColor()}
                transparent
                opacity={0.8}
                depthTest={false}
                depthWrite={false}
            />
        </mesh>
    )
}

