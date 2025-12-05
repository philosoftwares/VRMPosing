import { useStore } from '../../store/useStore'
import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

export const RotationGizmo = () => {
    const selectedBone = useStore((state) => state.selectedBone)
    const selectedBoneName = useStore((state) => state.selectedBoneName)
    const hoveredAxis = useStore((state) => state.hoveredAxis)
    const vrm = useStore((state) => state.vrm)
    const ringRef = useRef<THREE.Mesh>(null)
    const lineGroupRef = useRef<THREE.Group>(null)

    useFrame(() => {
        // Update rotation ring position/orientation
        if (ringRef.current && selectedBone && hoveredAxis && !hoveredAxis.includes('Drag')) {
            if (selectedBoneName === 'Root' && vrm?.scene) {
                ringRef.current.position.copy(vrm.scene.position)
                if (hoveredAxis?.startsWith('global')) {
                    ringRef.current.quaternion.set(0, 0, 0, 1)
                    if (hoveredAxis === 'globalX') ringRef.current.rotation.set(0, Math.PI / 2, 0)
                    else if (hoveredAxis === 'globalY') ringRef.current.rotation.set(Math.PI / 2, 0, 0)
                } else {
                    ringRef.current.quaternion.copy(vrm.scene.quaternion)
                    if (hoveredAxis === 'localX') ringRef.current.rotateY(Math.PI / 2)
                    else if (hoveredAxis === 'localY') ringRef.current.rotateX(Math.PI / 2)
                }
                return
            }

            selectedBone.getWorldPosition(ringRef.current.position)
            if (hoveredAxis?.startsWith('local')) {
                selectedBone.getWorldQuaternion(ringRef.current.quaternion)
                if (hoveredAxis === 'localX') ringRef.current.rotateY(Math.PI / 2)
                else if (hoveredAxis === 'localY') ringRef.current.rotateX(Math.PI / 2)
            } else {
                ringRef.current.quaternion.set(0, 0, 0, 1)
                if (hoveredAxis === 'globalX') ringRef.current.rotation.set(0, Math.PI / 2, 0)
                else if (hoveredAxis === 'globalY') ringRef.current.rotation.set(Math.PI / 2, 0, 0)
            }
        }

        // Update drag line position/orientation
        if (lineGroupRef.current && selectedBone && hoveredAxis?.includes('Drag')) {
            if (selectedBoneName === 'Root' && vrm?.scene) {
                lineGroupRef.current.position.copy(vrm.scene.position)
                if (hoveredAxis.startsWith('world')) {
                    lineGroupRef.current.quaternion.set(0, 0, 0, 1)
                } else {
                    lineGroupRef.current.quaternion.copy(vrm.scene.quaternion)
                }
            } else {
                selectedBone.getWorldPosition(lineGroupRef.current.position)
                if (hoveredAxis.startsWith('world')) {
                    lineGroupRef.current.quaternion.set(0, 0, 0, 1)
                } else {
                    selectedBone.getWorldQuaternion(lineGroupRef.current.quaternion)
                }
            }
        }
    })

    // Create line geometry
    const lineGeometry = useMemo(() => {
        if (!hoveredAxis?.includes('Drag')) return null
        const dir = hoveredAxis.endsWith('X') ? [0.3, 0, 0] :
            hoveredAxis.endsWith('Y') ? [0, 0.3, 0] : [0, 0, 0.3]
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute([
            -dir[0], -dir[1], -dir[2],
            dir[0], dir[1], dir[2]
        ], 3))
        return geo
    }, [hoveredAxis])

    if (!selectedBone || !hoveredAxis) return null

    const isDragAxis = hoveredAxis.includes('Drag')

    const getColor = () => {
        if (hoveredAxis.endsWith('X')) return '#ff4444'
        if (hoveredAxis.endsWith('Y')) return '#44ff44'
        return '#4444ff'
    }

    if (isDragAxis && lineGeometry) {
        const dir = hoveredAxis.endsWith('X') ? [0.3, 0, 0] :
            hoveredAxis.endsWith('Y') ? [0, 0.3, 0] : [0, 0, 0.3]
        const color = getColor()

        // Cone rotation based on axis
        const coneRotation: [number, number, number] = hoveredAxis.endsWith('X') ? [0, 0, -Math.PI / 2] :
            hoveredAxis.endsWith('Y') ? [0, 0, 0] : [Math.PI / 2, 0, 0]
        const coneRotationNeg: [number, number, number] = hoveredAxis.endsWith('X') ? [0, 0, Math.PI / 2] :
            hoveredAxis.endsWith('Y') ? [Math.PI, 0, 0] : [-Math.PI / 2, 0, 0]

        return (
            <group ref={lineGroupRef}>
                <lineSegments geometry={lineGeometry} renderOrder={1000}>
                    <lineBasicMaterial color={color} depthTest={false} />
                </lineSegments>
                <mesh position={[dir[0], dir[1], dir[2]]} rotation={coneRotation} renderOrder={1001}>
                    <coneGeometry args={[0.02, 0.05, 8]} />
                    <meshBasicMaterial color={color} depthTest={false} />
                </mesh>
                <mesh position={[-dir[0], -dir[1], -dir[2]]} rotation={coneRotationNeg} renderOrder={1001}>
                    <coneGeometry args={[0.02, 0.05, 8]} />
                    <meshBasicMaterial color={color} depthTest={false} />
                </mesh>
            </group>
        )
    }

    return (
        <mesh ref={ringRef} renderOrder={1000}>
            <torusGeometry args={[0.15, 0.005, 16, 64]} />
            <meshBasicMaterial color={getColor()} transparent opacity={0.8} depthTest={false} depthWrite={false} />
        </mesh>
    )
}
