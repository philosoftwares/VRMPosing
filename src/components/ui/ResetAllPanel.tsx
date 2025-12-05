import { useStore } from '../../store/useStore'
import { VRMHumanBoneName } from '@pixiv/three-vrm'

export const ResetAllPanel = () => {
    const vrm = useStore((state) => state.vrm)
    const initialSceneQuat = useStore((state) => state.initialSceneQuat)

    if (!vrm) return null

    // Detect VRM version
    const isVRM1 = vrm?.meta && 'metaVersion' in vrm.meta

    // Reset all bones helper
    const resetAllBones = (options: { resetRootRotation: boolean, resetRootDrag: boolean }) => {
        if (!vrm) return

        // Reset all humanoid bones (except Hips if we're handling it separately for root rotation)
        const boneNames = Object.values(VRMHumanBoneName)
        for (const boneName of boneNames) {
            // Skip Hips if resetRootRotation is true and it's VRM 0.0 (we'll handle it below)
            if (boneName === VRMHumanBoneName.Hips && options.resetRootRotation && !isVRM1) {
                continue
            }
            const bone = vrm.humanoid?.getNormalizedBoneNode(boneName)
            if (bone) {
                bone.quaternion.set(0, 0, 0, 1)
            }
        }

        // Handle Root bone rotation
        if (options.resetRootRotation && vrm.scene) {
            vrm.scene.quaternion.copy(initialSceneQuat)

            // For VRM 0.0, also reset Hips bone to match scene
            if (!isVRM1) {
                const hips = vrm.humanoid?.getNormalizedBoneNode(VRMHumanBoneName.Hips)
                if (hips) {
                    hips.quaternion.set(0, 0, 0, 1)
                }
            }
        }

        // Handle Root drag (position)
        if (options.resetRootDrag && vrm.scene) {
            vrm.scene.position.set(0, 0, 0)
        }
    }

    // 4 Reset All variants
    const resetAllExceptRoot = () => resetAllBones({ resetRootRotation: false, resetRootDrag: false })
    const resetAllExceptRootDrag = () => resetAllBones({ resetRootRotation: true, resetRootDrag: false })
    const resetAllExceptRootRotation = () => resetAllBones({ resetRootRotation: false, resetRootDrag: true })
    const resetAllIncludingRoot = () => resetAllBones({ resetRootRotation: true, resetRootDrag: true })

    return (
        <div className="absolute bottom-4 left-4 p-3 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg z-10">
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
        </div>
    )
}
