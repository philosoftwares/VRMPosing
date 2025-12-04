import { useStore } from '../../store/useStore'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { VRMHumanBoneName } from '@pixiv/three-vrm'

// Major bones = large spheres
const MAJOR_BONES: Set<string> = new Set([
    // Spine
    VRMHumanBoneName.Hips,
    VRMHumanBoneName.Spine,
    VRMHumanBoneName.Chest,
    VRMHumanBoneName.UpperChest,
    VRMHumanBoneName.Neck,
    VRMHumanBoneName.Head,
    // Left Arm
    VRMHumanBoneName.LeftShoulder,
    VRMHumanBoneName.LeftUpperArm,
    VRMHumanBoneName.LeftLowerArm,
    VRMHumanBoneName.LeftHand,
    // Right Arm
    VRMHumanBoneName.RightShoulder,
    VRMHumanBoneName.RightUpperArm,
    VRMHumanBoneName.RightLowerArm,
    VRMHumanBoneName.RightHand,
    // Left Leg
    VRMHumanBoneName.LeftUpperLeg,
    VRMHumanBoneName.LeftLowerLeg,
    VRMHumanBoneName.LeftFoot,
    VRMHumanBoneName.LeftToes,
    // Right Leg
    VRMHumanBoneName.RightUpperLeg,
    VRMHumanBoneName.RightLowerLeg,
    VRMHumanBoneName.RightFoot,
    VRMHumanBoneName.RightToes,
])

interface BoneHelperProps {
    bone: THREE.Object3D
    boneName: string
    isMajor: boolean
    isSelected: boolean
    onClick: () => void
}

const BoneHelper = ({ bone, isMajor, isSelected, onClick }: BoneHelperProps) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const size = isMajor ? 0.025 : 0.012

    // Update position every frame to follow bone
    useFrame(() => {
        if (meshRef.current && bone) {
            const pos = new THREE.Vector3()
            bone.getWorldPosition(pos)
            meshRef.current.position.copy(pos)
        }
    })

    return (
        <mesh
            ref={meshRef}
            renderOrder={999}
            onClick={(e) => {
                e.stopPropagation()
                onClick()
            }}
        >
            <sphereGeometry args={[size, 16, 16]} />
            <meshBasicMaterial
                color={isSelected ? '#00ff88' : isMajor ? '#ff6b6b' : '#ffd93d'}
                transparent
                opacity={isSelected ? 0.95 : 0.7}
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
                    boneName={name}
                    isMajor={isMajor}
                    isSelected={selectedBone === bone}
                    onClick={() => setSelectedBone(bone, name)}
                />
            ))}
        </group>
    )
}
