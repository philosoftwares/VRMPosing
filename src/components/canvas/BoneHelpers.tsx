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
    isSelected: boolean
    onClick: () => void
}

const BoneHelper = ({ bone, isMajor, isSelected, onClick }: BoneHelperProps) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const size = isMajor ? 0.025 : 0.012
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
            setIsDraggingGlobal(false)
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
                color={isDragging ? '#00aaff' : isSelected ? '#00ff88' : isMajor ? '#ff6b6b' : '#ffd93d'}
                transparent
                opacity={isDragging ? 1 : isSelected ? 0.95 : 0.7}
                depthTest={false}
                depthWrite={false}
            />
        </mesh>
    )
}

export const BoneHelpers = () => {
    const vrm = useStore((state) => state.vrm)
    const selectedBone = useStore((state) => state.selectedBone)
    const setSelectedBone = useStore((state) => state.setSelectedBone)

    if (!vrm?.humanoid) return null

    const bones: { bone: THREE.Object3D; name: string; isMajor: boolean }[] = []

    for (const boneName of Object.values(VRMHumanBoneName)) {
        const boneNode = vrm.humanoid.getNormalizedBoneNode(boneName)
        if (boneNode) {
            bones.push({
                bone: boneNode,
                name: boneName,
                isMajor: MAJOR_BONES.has(boneName),
            })
        }
    }

    return (
        <group>
            {bones.map(({ bone, name, isMajor }) => (
                <BoneHelper
                    key={name}
                    bone={bone}
                    isMajor={isMajor}
                    isSelected={selectedBone === bone}
                    onClick={() => setSelectedBone(bone, name)}
                />
            ))}
        </group>
    )
}
