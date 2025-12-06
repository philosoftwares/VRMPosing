import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { VRMModel } from './VRMModel'
import { BoneGizmo } from './BoneGizmo'
import { BoneHelpers } from './BoneHelpers'
import { RotationGizmo } from './RotationGizmo'
import { useStore } from '../../store/useStore'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

// Default camera settings
const DEFAULT_POSITION = new THREE.Vector3(0, 1.5, 2)
const DEFAULT_TARGET = new THREE.Vector3(0, 1, 0)
const DEFAULT_DISTANCE = DEFAULT_POSITION.distanceTo(DEFAULT_TARGET)

const CameraController = () => {
    const { camera } = useThree()
    const controlsRef = useRef<OrbitControlsImpl>(null)
    const setCameraResetCallbacks = useStore((state) => state.setCameraResetCallbacks)
    const isDragging = useStore((state) => state.isDragging)

    useEffect(() => {
        const controls = controlsRef.current
        if (!controls) return

        setCameraResetCallbacks({
            focusToModel: () => {
                // Pan to center on model, keep current viewing angle, default distance
                const vrm = useStore.getState().vrm
                if (!vrm) return

                // Model's current center
                const modelCenter = new THREE.Vector3(
                    vrm.scene.position.x,
                    vrm.scene.position.y + 1,
                    vrm.scene.position.z
                )

                // Current viewing direction (from target to camera)
                const currentDirection = new THREE.Vector3()
                    .subVectors(camera.position, controls.target)
                    .normalize()

                // Move target to model, camera at default distance keeping same direction
                controls.target.copy(modelCenter)
                camera.position.copy(modelCenter).add(currentDirection.multiplyScalar(DEFAULT_DISTANCE))
                controls.update()
            },
            resetPosition: () => {
                // Reset to default distance, but keep same viewing ANGLE
                const direction = new THREE.Vector3()
                    .subVectors(camera.position, controls.target)
                    .normalize()

                // Reset target to default
                controls.target.copy(DEFAULT_TARGET)

                // Position camera at default distance, same angle
                camera.position.copy(DEFAULT_TARGET).add(direction.multiplyScalar(DEFAULT_DISTANCE))
                controls.update()
            },
            resetRotation: () => {
                // Orbit camera to front view (+Z), keeping same distance and target
                const currentDistance = camera.position.distanceTo(controls.target)
                // Position camera directly in front of target (along +Z)
                camera.position.set(
                    controls.target.x,
                    controls.target.y,
                    controls.target.z + currentDistance
                )
                controls.update()
            },
            resetAll: () => {
                // Reset both to defaults
                camera.position.copy(DEFAULT_POSITION)
                controls.target.copy(DEFAULT_TARGET)
                controls.update()
            }
        })

        // Register camera position callback
        useStore.getState().setApplyCameraPosition((x, y, z) => {
            camera.position.set(x, y, z)
            controls.update()
        })

        // Register camera spherical callback
        useStore.getState().setApplyCameraSpherical((azimuth, elevation, distance) => {
            // Convert spherical to cartesian (relative to target)
            const azimuthRad = THREE.MathUtils.degToRad(azimuth)
            const elevationRad = THREE.MathUtils.degToRad(elevation)

            // Calculate camera position from spherical coordinates
            const x = distance * Math.sin(azimuthRad) * Math.cos(elevationRad)
            const y = distance * Math.sin(elevationRad)
            const z = distance * Math.cos(azimuthRad) * Math.cos(elevationRad)

            camera.position.set(
                controls.target.x + x,
                controls.target.y + y,
                controls.target.z + z
            )
            controls.update()
        })
    }, [camera, setCameraResetCallbacks])

    // Sync camera state to store every frame
    useFrame(() => {
        const controls = controlsRef.current
        if (!controls) return

        // Calculate spherical coordinates from camera and target
        const offset = new THREE.Vector3().subVectors(camera.position, controls.target)
        const distance = offset.length()
        const azimuth = THREE.MathUtils.radToDeg(Math.atan2(offset.x, offset.z))
        const elevation = THREE.MathUtils.radToDeg(Math.asin(offset.y / distance))

        useStore.setState({
            cameraState: {
                position: {
                    x: camera.position.x,
                    y: camera.position.y,
                    z: camera.position.z
                },
                spherical: {
                    azimuth,
                    elevation,
                    distance
                }
            }
        })
    })

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            target={DEFAULT_TARGET.toArray() as [number, number, number]}
            enabled={!isDragging}
            zoomSpeed={2}
            enableDamping={false}
        />
    )
}

export const Scene = () => {
    const setSelectedBone = useStore((state) => state.setSelectedBone)

    return (
        <Canvas
            camera={{ position: DEFAULT_POSITION.toArray() as [number, number, number], fov: 50 }}
            onPointerMissed={() => setSelectedBone(null, null)}
        >
            <color attach="background" args={['#1a1a1a']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[1, 1, 1]} intensity={1} />
            <Grid infiniteGrid sectionColor="#444" cellColor="#222" fadeDistance={20} />
            <CameraController />
            <VRMModel />
            <BoneHelpers />
            <BoneGizmo />
            <RotationGizmo />
        </Canvas>
    )
}
