import { useStore } from '../../store/useStore'
import { VRMHumanBoneName } from '@pixiv/three-vrm'

// Bone pairs for mirroring [Left, Right]
const BONE_MIRROR_PAIRS: [string, string][] = [
    // Arms
    [VRMHumanBoneName.LeftShoulder, VRMHumanBoneName.RightShoulder],
    [VRMHumanBoneName.LeftUpperArm, VRMHumanBoneName.RightUpperArm],
    [VRMHumanBoneName.LeftLowerArm, VRMHumanBoneName.RightLowerArm],
    [VRMHumanBoneName.LeftHand, VRMHumanBoneName.RightHand],
    // Legs
    [VRMHumanBoneName.LeftUpperLeg, VRMHumanBoneName.RightUpperLeg],
    [VRMHumanBoneName.LeftLowerLeg, VRMHumanBoneName.RightLowerLeg],
    [VRMHumanBoneName.LeftFoot, VRMHumanBoneName.RightFoot],
    [VRMHumanBoneName.LeftToes, VRMHumanBoneName.RightToes],
    // Eyes
    [VRMHumanBoneName.LeftEye, VRMHumanBoneName.RightEye],
    // Fingers - Thumb
    [VRMHumanBoneName.LeftThumbMetacarpal, VRMHumanBoneName.RightThumbMetacarpal],
    [VRMHumanBoneName.LeftThumbProximal, VRMHumanBoneName.RightThumbProximal],
    [VRMHumanBoneName.LeftThumbDistal, VRMHumanBoneName.RightThumbDistal],
    // Fingers - Index
    [VRMHumanBoneName.LeftIndexProximal, VRMHumanBoneName.RightIndexProximal],
    [VRMHumanBoneName.LeftIndexIntermediate, VRMHumanBoneName.RightIndexIntermediate],
    [VRMHumanBoneName.LeftIndexDistal, VRMHumanBoneName.RightIndexDistal],
    // Fingers - Middle
    [VRMHumanBoneName.LeftMiddleProximal, VRMHumanBoneName.RightMiddleProximal],
    [VRMHumanBoneName.LeftMiddleIntermediate, VRMHumanBoneName.RightMiddleIntermediate],
    [VRMHumanBoneName.LeftMiddleDistal, VRMHumanBoneName.RightMiddleDistal],
    // Fingers - Ring
    [VRMHumanBoneName.LeftRingProximal, VRMHumanBoneName.RightRingProximal],
    [VRMHumanBoneName.LeftRingIntermediate, VRMHumanBoneName.RightRingIntermediate],
    [VRMHumanBoneName.LeftRingDistal, VRMHumanBoneName.RightRingDistal],
    // Fingers - Little
    [VRMHumanBoneName.LeftLittleProximal, VRMHumanBoneName.RightLittleProximal],
    [VRMHumanBoneName.LeftLittleIntermediate, VRMHumanBoneName.RightLittleIntermediate],
    [VRMHumanBoneName.LeftLittleDistal, VRMHumanBoneName.RightLittleDistal],
]

export const ResetAllPanel = () => {
    const vrm = useStore((state) => state.vrm)
    const initialSceneQuat = useStore((state) => state.initialSceneQuat)
    const saveSnapshot = useStore((state) => state.saveSnapshot)
    const selectedBoneName = useStore((state) => state.selectedBoneName)

    if (!vrm) return null

    // Detect VRM version
    const isVRM1 = vrm?.meta && 'metaVersion' in vrm.meta

    // Detect if selected bone is Left or Right
    const isLeftBoneSelected = selectedBoneName?.toLowerCase().includes('left')
    const isRightBoneSelected = selectedBoneName?.toLowerCase().includes('right')
    const hasLRBoneSelected = isLeftBoneSelected || isRightBoneSelected

    // Reset all bones helper
    const resetAllBones = (options: { resetRootRotation: boolean, resetRootDrag: boolean }) => {
        if (!vrm) return

        const boneNames = Object.values(VRMHumanBoneName)
        for (const boneName of boneNames) {
            if (boneName === VRMHumanBoneName.Hips && options.resetRootRotation && !isVRM1) {
                continue
            }
            const bone = vrm.humanoid?.getNormalizedBoneNode(boneName)
            if (bone) {
                bone.quaternion.set(0, 0, 0, 1)
            }
        }

        if (options.resetRootRotation && vrm.scene) {
            vrm.scene.quaternion.copy(initialSceneQuat)
            if (!isVRM1) {
                const hips = vrm.humanoid?.getNormalizedBoneNode(VRMHumanBoneName.Hips)
                if (hips) {
                    hips.quaternion.set(0, 0, 0, 1)
                }
            }
        }

        if (options.resetRootDrag && vrm.scene) {
            vrm.scene.position.set(0, 0, 0)
        }
    }

    // Mirror helper: copy source quaternion to target with X-axis flip
    const mirrorQuaternion = (srcX: number, srcY: number, srcZ: number, srcW: number) => {
        return { x: srcX, y: -srcY, z: -srcZ, w: srcW }
    }

    // Mirror All: Copy from one side to the other
    const mirrorAllBones = (direction: 'left-to-right' | 'right-to-left') => {
        if (!vrm) return

        for (const [leftName, rightName] of BONE_MIRROR_PAIRS) {
            const leftBone = vrm.humanoid?.getNormalizedBoneNode(leftName as VRMHumanBoneName)
            const rightBone = vrm.humanoid?.getNormalizedBoneNode(rightName as VRMHumanBoneName)

            if (!leftBone || !rightBone) continue

            if (direction === 'left-to-right') {
                const mirrored = mirrorQuaternion(
                    leftBone.quaternion.x,
                    leftBone.quaternion.y,
                    leftBone.quaternion.z,
                    leftBone.quaternion.w
                )
                rightBone.quaternion.set(mirrored.x, mirrored.y, mirrored.z, mirrored.w)
            } else {
                const mirrored = mirrorQuaternion(
                    rightBone.quaternion.x,
                    rightBone.quaternion.y,
                    rightBone.quaternion.z,
                    rightBone.quaternion.w
                )
                leftBone.quaternion.set(mirrored.x, mirrored.y, mirrored.z, mirrored.w)
            }
        }

        saveSnapshot()
    }

    // Swap All: Exchange Left <-> Right bones
    const swapAllBones = () => {
        if (!vrm) return

        for (const [leftName, rightName] of BONE_MIRROR_PAIRS) {
            const leftBone = vrm.humanoid?.getNormalizedBoneNode(leftName as VRMHumanBoneName)
            const rightBone = vrm.humanoid?.getNormalizedBoneNode(rightName as VRMHumanBoneName)

            if (!leftBone || !rightBone) continue

            const leftQuat = leftBone.quaternion.clone()

            const rightMirrored = mirrorQuaternion(
                rightBone.quaternion.x,
                rightBone.quaternion.y,
                rightBone.quaternion.z,
                rightBone.quaternion.w
            )
            leftBone.quaternion.set(rightMirrored.x, rightMirrored.y, rightMirrored.z, rightMirrored.w)

            const leftMirrored = mirrorQuaternion(leftQuat.x, leftQuat.y, leftQuat.z, leftQuat.w)
            rightBone.quaternion.set(leftMirrored.x, leftMirrored.y, leftMirrored.z, leftMirrored.w)
        }

        saveSnapshot()
    }

    // Handle Mirror All click - based on selected bone
    const handleMirrorAll = () => {
        if (isLeftBoneSelected) {
            mirrorAllBones('left-to-right')
        } else if (isRightBoneSelected) {
            mirrorAllBones('right-to-left')
        }
    }

    // 4 Reset All variants
    const resetAllExceptRoot = () => { resetAllBones({ resetRootRotation: false, resetRootDrag: false }); saveSnapshot() }
    const resetAllExceptRootDrag = () => { resetAllBones({ resetRootRotation: true, resetRootDrag: false }); saveSnapshot() }
    const resetAllExceptRootRotation = () => { resetAllBones({ resetRootRotation: false, resetRootDrag: true }); saveSnapshot() }
    const resetAllIncludingRoot = () => { resetAllBones({ resetRootRotation: true, resetRootDrag: true }); saveSnapshot() }

    // Mirror button label based on selected bone
    const getMirrorLabel = () => {
        if (isLeftBoneSelected) return '→ Mirror All (L→R)'
        if (isRightBoneSelected) return '← Mirror All (R→L)'
        return ''
    }

    return (
        <div className="absolute bottom-4 right-4 p-3 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg z-10">
            <p className="text-xs text-gray-500 mb-2 font-medium">RESET ALL BONES</p>
            <div className="grid grid-cols-2 gap-2 w-56">
                <button onClick={resetAllExceptRootDrag} className="px-2 py-2 text-xs bg-purple-700 hover:bg-purple-600 text-white rounded" title="Reset semua + rotasi Root, tapi bukan posisi">
                    All (Keep Pos)
                </button>
                <button onClick={resetAllExceptRootRotation} className="px-2 py-2 text-xs bg-purple-700 hover:bg-purple-600 text-white rounded" title="Reset semua + posisi Root, tapi bukan rotasi">
                    All (Keep Rot)
                </button>
                <button onClick={resetAllExceptRoot} className="px-2 py-2 text-xs bg-purple-800 hover:bg-purple-700 text-white rounded" title="Reset semua bone kecuali Root">
                    All (Keep Root)
                </button>
                <button onClick={resetAllIncludingRoot} className="px-2 py-2 text-xs bg-red-800 hover:bg-red-700 text-white rounded" title="Reset SEMUA termasuk Root">
                    All + Root
                </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
                {hasLRBoneSelected && (
                    <button
                        onClick={handleMirrorAll}
                        className="px-2 py-2 text-xs bg-cyan-700 hover:bg-cyan-600 text-white rounded"
                        title="Copy pose dari sisi yang dipilih ke sisi berlawanan"
                    >
                        {getMirrorLabel()}
                    </button>
                )}
                <button
                    onClick={swapAllBones}
                    className={`px-2 py-2 text-xs bg-teal-700 hover:bg-teal-600 text-white rounded ${!hasLRBoneSelected ? 'col-span-2' : ''}`}
                    title="Tukar pose kiri dan kanan"
                >
                    ↔ Swap L↔R
                </button>
            </div>
        </div>
    )
}
