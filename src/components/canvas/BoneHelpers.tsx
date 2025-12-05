import { useStore } from '../../store/useStore'
import { useRef, useState, useCallback } from 'react'
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { VRMHumanBoneName } from '@pixiv/three-vrm'

// Major bones = large spheres
const MAJOR_BONES: Set<string> = new Set([
    VRMHumanBoneName.Hips,
    VRMHumanBoneName.Spine,
    VRMHumanBoneName.Chest,
    VRMHumanBoneName.UpperChest,
    VRMHumanBoneName.Neck,
    VRMHumanBoneName.Head,
    VRMHumanBoneName.LeftShoulder,
    VRMHumanBoneName.LeftUpperArm,
    VRMHumanBoneName.LeftLowerArm,
    VRMHumanBoneName.LeftHand,
    VRMHumanBoneName.RightShoulder,
    VRMHumanBoneName.RightUpperArm,
    VRMHumanBoneName.RightLowerArm,
    VRMHumanBoneName.RightHand,
    VRMHumanBoneName.LeftUpperLeg,
    VRMHumanBoneName.LeftLowerLeg,
    VRMHumanBoneName.LeftFoot,
    VRMHumanBoneName.LeftToes,
    VRMHumanBoneName.RightUpperLeg,
    VRMHumanBoneName.RightLowerLeg,
    VRMHumanBoneName.RightFoot,
    VRMHumanBoneName.RightToes,
])

interface BoneHelperProps {
    bone: THREE.Object3D
    isMajor: boolean
    isFinger: boolean
    isSelected: boolean
    onClick: () => void
}

const BoneHelper = ({ bone, isMajor, isFinger, isSelected, onClick }: BoneHelperProps) => {
    const meshRef = useRef<THREE.Mesh>(null)
    // Finger bones are smaller (0.006), minor bones (0.012), major bones (0.025)
    const size = isMajor ? 0.025 : isFinger ? 0.006 : 0.012
    const [isDragging, setIsDragging] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane())
    const dragOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3())
    const { camera, raycaster, pointer } = useThree()
    const setIsDraggingGlobal = useStore((state) => state.setIsDragging)

    useFrame(() => {
        if (meshRef.current && bone) {
            const pos = new THREE.Vector3()
            bone.getWorldPosition(pos)
            meshRef.current.position.copy(pos)
        }
    })

    const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        setIsDragging(true)
        setIsDraggingGlobal(true)
        onClick()

        const boneWorldPos = new THREE.Vector3()
        bone.getWorldPosition(boneWorldPos)

        const cameraDir = new THREE.Vector3()
        camera.getWorldDirection(cameraDir)
        dragPlaneRef.current.setFromNormalAndCoplanarPoint(cameraDir, boneWorldPos)

        raycaster.setFromCamera(pointer, camera)
        const intersection = new THREE.Vector3()
        raycaster.ray.intersectPlane(dragPlaneRef.current, intersection)
        dragOffsetRef.current.subVectors(boneWorldPos, intersection)

        const target = e.target as HTMLElement
        if (target.setPointerCapture) {
            target.setPointerCapture(e.pointerId)
        }
    }, [bone, onClick, camera, raycaster, pointer, setIsDraggingGlobal])

    const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
        if (!isDragging || !bone.parent) return

        e.stopPropagation()

        raycaster.setFromCamera(pointer, camera)
        const targetPos = new THREE.Vector3()
        raycaster.ray.intersectPlane(dragPlaneRef.current, targetPos)
        targetPos.add(dragOffsetRef.current)

        const parentWorldPos = new THREE.Vector3()
        bone.parent.getWorldPosition(parentWorldPos)

        const boneWorldPos = new THREE.Vector3()
        bone.getWorldPosition(boneWorldPos)

        const currentDir = new THREE.Vector3().subVectors(boneWorldPos, parentWorldPos).normalize()
        const targetDir = new THREE.Vector3().subVectors(targetPos, parentWorldPos).normalize()

        if (currentDir.dot(targetDir) > 0.9999) return

        const rotationQuat = new THREE.Quaternion()
        rotationQuat.setFromUnitVectors(currentDir, targetDir)

        const parentWorldQuat = new THREE.Quaternion()
        bone.parent.getWorldQuaternion(parentWorldQuat)

        const newWorldQuat = rotationQuat.multiply(parentWorldQuat)

        if (bone.parent.parent) {
            const grandparentWorldQuat = new THREE.Quaternion()
            bone.parent.parent.getWorldQuaternion(grandparentWorldQuat)
            grandparentWorldQuat.invert()
            bone.parent.quaternion.copy(newWorldQuat.premultiply(grandparentWorldQuat))
        } else {
            bone.parent.quaternion.copy(newWorldQuat)
        }
    }, [isDragging, bone, camera, raycaster, pointer])

    const handlePointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
        if (isDragging) {
            e.stopPropagation()
            setIsDragging(false)
            // Delay resetting global dragging state to prevent VRMModel from processing the click
            setTimeout(() => {
                setIsDraggingGlobal(false)
            }, 100)
            const target = e.target as HTMLElement
            if (target.releasePointerCapture) {
                target.releasePointerCapture(e.pointerId)
            }
        }
    }, [isDragging, setIsDraggingGlobal])

    return (
        <mesh
            ref={meshRef}
            renderOrder={999}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
            scale={isHovered || isDragging ? 1.3 : 1}
        >
            <sphereGeometry args={[size, 16, 16]} />
            <meshBasicMaterial
                color={(isDragging || isSelected) ? '#00aaff' : isMajor ? '#ff6b6b' : '#ffd93d'}
                transparent
                opacity={isDragging ? 1 : isSelected ? 0.95 : 0.7}
                depthTest={false}
                depthWrite={false}
            />
        </mesh>
    )
}
// Bones that should be visible even if they are not major (fingers, eyes, root)
const VISIBLE_MINOR_BONES: Set<string> = new Set([
    'Root', // VRM model root bone (capital R)
    VRMHumanBoneName.LeftEye,
    VRMHumanBoneName.RightEye,
    // Left Fingers
    VRMHumanBoneName.LeftThumbMetacarpal,
    VRMHumanBoneName.LeftThumbProximal,
    VRMHumanBoneName.LeftThumbDistal,
    VRMHumanBoneName.LeftIndexProximal,
    VRMHumanBoneName.LeftIndexIntermediate,
    VRMHumanBoneName.LeftIndexDistal,
    VRMHumanBoneName.LeftMiddleProximal,
    VRMHumanBoneName.LeftMiddleIntermediate,
    VRMHumanBoneName.LeftMiddleDistal,
    VRMHumanBoneName.LeftRingProximal,
    VRMHumanBoneName.LeftRingIntermediate,
    VRMHumanBoneName.LeftRingDistal,
    VRMHumanBoneName.LeftLittleProximal,
    VRMHumanBoneName.LeftLittleIntermediate,
    VRMHumanBoneName.LeftLittleDistal,
    // Right Fingers
    VRMHumanBoneName.RightThumbMetacarpal,
    VRMHumanBoneName.RightThumbProximal,
    VRMHumanBoneName.RightThumbDistal,
    VRMHumanBoneName.RightIndexProximal,
    VRMHumanBoneName.RightIndexIntermediate,
    VRMHumanBoneName.RightIndexDistal,
    VRMHumanBoneName.RightMiddleProximal,
    VRMHumanBoneName.RightMiddleIntermediate,
    VRMHumanBoneName.RightMiddleDistal,
    VRMHumanBoneName.RightRingProximal,
    VRMHumanBoneName.RightRingIntermediate,
    VRMHumanBoneName.RightRingDistal,
    VRMHumanBoneName.RightLittleProximal,
    VRMHumanBoneName.RightLittleIntermediate,
    VRMHumanBoneName.RightLittleDistal,
])

export const BoneHelpers = () => {
    const vrm = useStore((state) => state.vrm)
    const selectedBoneName = useStore((state) => state.selectedBoneName)
    const setSelectedBone = useStore((state) => state.setSelectedBone)

    if (!vrm?.humanoid) return null

    const bones: { bone: THREE.Object3D; name: string; isMajor: boolean; isFinger: boolean }[] = []

    // Check if a bone name is a finger bone
    const isFingerBone = (name: string) => {
        return name.includes('Thumb') || name.includes('Index') ||
            name.includes('Middle') || name.includes('Ring') ||
            name.includes('Little')
    }

    // First, add bones from VRMHumanBoneName (using normalized if available, otherwise raw)
    for (const boneName of Object.values(VRMHumanBoneName)) {
        const normalizedBone = vrm.humanoid.getNormalizedBoneNode(boneName)
        const rawBone = vrm.humanoid.getRawBoneNode(boneName)
        const boneNode = normalizedBone || rawBone
        if (boneNode) {
            bones.push({
                bone: boneNode,
                name: boneName,
                isMajor: MAJOR_BONES.has(boneName),
                isFinger: isFingerBone(boneName),
            })
        }
    }

    // Then, traverse the whole scene to find any additional bones not covered above (e.g., J_Sec_L_Bust1/2)
    const existingNames = new Set(bones.map((b) => b.name))
    vrm.scene.traverse((obj) => {
        if ((obj as any).isBone) {
            const name = obj.name
            console.log('Found bone:', name) // Debug: show all bone names
            if (!existingNames.has(name) && name) {
                bones.push({
                    bone: obj,
                    name,
                    isMajor: false,
                    isFinger: isFingerBone(name),
                })
                existingNames.add(name)
            }
        }
    })

    return (
        <group>
            {bones.map(({ bone, name, isMajor, isFinger }) => {
                // Hide non-major bones unless they are in the visible minor list (fingers, eyes)
                if (!isMajor && !VISIBLE_MINOR_BONES.has(name)) return null

                return (
                    <BoneHelper
                        key={name}
                        bone={bone}
                        isMajor={isMajor}
                        isFinger={isFinger}
                        isSelected={selectedBoneName === name}
                        onClick={() => setSelectedBone(bone, name)}
                    />
                )
            })}
        </group>
    )
}
