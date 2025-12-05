import { useStore } from '../../store/useStore'
import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { VRMHumanBoneName } from '@pixiv/three-vrm'

// Helper to find bone from clicked mesh
const findParentBone = (object: THREE.Object3D | null): THREE.Object3D | null => {
    if (!object) return null
    if (object.userData?.isBone || object.type === 'Bone') return object
    return findParentBone(object.parent)
}

// Get bone name from VRM humanoid
const getBoneName = (vrm: ReturnType<typeof useStore.getState>['vrm'], bone: THREE.Object3D): string | null => {
    if (!vrm) return null

    for (const boneName of Object.values(VRMHumanBoneName)) {
        // Check both normalized and raw bones
        const normalizedBone = vrm.humanoid?.getNormalizedBoneNode(boneName)
        const rawBone = vrm.humanoid?.getRawBoneNode(boneName)
        if (normalizedBone === bone || rawBone === bone) {
            return boneName
        }
    }
    return bone.name || null
}

export const VRMModel = () => {
    const vrm = useStore((state) => state.vrm)
    const setSelectedBone = useStore((state) => state.setSelectedBone)
    const groupRef = useRef<THREE.Group>(null)
    const { raycaster, camera, pointer } = useThree()

    useEffect(() => {
        if (vrm) {
            console.log('VRM Model mounted', vrm)
        }
    }, [vrm])

    // Update VRM every frame to apply bone rotations to the mesh
    useFrame((_, delta) => {
        if (vrm) {
            vrm.humanoid?.update()
            vrm.lookAt?.update(delta)
            vrm.expressionManager?.update()
            // vrm.springBoneManager?.update(delta) // Disabled for manual posing
        }
    })

    const handleClick = (e: THREE.Event & { stopPropagation: () => void }) => {
        e.stopPropagation()

        if (!vrm) return

        // Don't process clicks if we just finished dragging a bone sphere
        const isDragging = useStore.getState().isDragging
        if (isDragging) return

        raycaster.setFromCamera(pointer, camera)
        const intersects = raycaster.intersectObject(vrm.scene, true)

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object
            let bone: THREE.Object3D | null = null

            if (clickedObject instanceof THREE.SkinnedMesh && clickedObject.skeleton) {
                const skeleton = clickedObject.skeleton
                const point = intersects[0].point

                let minDist = Infinity
                for (const b of skeleton.bones) {
                    const boneWorldPos = new THREE.Vector3()
                    b.getWorldPosition(boneWorldPos)
                    const dist = point.distanceTo(boneWorldPos)

                    const isHumanoid = getBoneName(vrm, b) !== null && Object.values(VRMHumanBoneName).includes(getBoneName(vrm, b) as any)
                    const effectiveDist = isHumanoid ? dist * 0.5 : dist

                    if (effectiveDist < minDist) {
                        minDist = effectiveDist
                        bone = b
                    }
                }
            } else {
                bone = findParentBone(clickedObject)
            }

            if (bone) {
                const boneName = getBoneName(vrm, bone)
                console.log('Selected bone:', boneName, bone)
                setSelectedBone(bone, boneName)
            }
        }
    }

    if (!vrm) return null

    return (
        <primitive
            ref={groupRef}
            object={vrm.scene}
            onClick={handleClick}
        />
    )
}
