import { useStore } from '../../store/useStore'
import { useState, useEffect } from 'react'
import * as THREE from 'three'
import { VRMHumanBoneName } from '@pixiv/three-vrm'

export const RotationPanel = () => {
    const vrm = useStore((state) => state.vrm)
    const selectedBone = useStore((state) => state.selectedBone)
    const selectedBoneName = useStore((state) => state.selectedBoneName)
    const setSelectedBone = useStore((state) => state.setSelectedBone)

    const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })

    // Get the normalized bone for VRM 1.0
    const getNormalizedBone = () => {
        if (!vrm || !selectedBoneName) return null
        return vrm.humanoid?.getNormalizedBoneNode(selectedBoneName as VRMHumanBoneName)
    }

    // Sync rotation state with selected bone (use normalized bone for reading)
    useEffect(() => {
        const normalizedBone = getNormalizedBone()
        const boneToRead = normalizedBone || selectedBone

        if (boneToRead) {
            const euler = new THREE.Euler().setFromQuaternion(boneToRead.quaternion, 'XYZ')
            setRotation({
                x: THREE.MathUtils.radToDeg(euler.x),
                y: THREE.MathUtils.radToDeg(euler.y),
                z: THREE.MathUtils.radToDeg(euler.z),
            })
        }
    }, [selectedBone, selectedBoneName, vrm])

    const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
        if (!selectedBone) return

        const newRotation = { ...rotation, [axis]: value }
        setRotation(newRotation)

        const euler = new THREE.Euler(
            THREE.MathUtils.degToRad(newRotation.x),
            THREE.MathUtils.degToRad(newRotation.y),
            THREE.MathUtils.degToRad(newRotation.z),
            'XYZ'
        )

        // For VRM 1.0: apply to normalized bone, vrm.update() will propagate to raw bone
        const normalizedBone = getNormalizedBone()
        if (normalizedBone) {
            console.log('Setting normalized bone rotation:', selectedBoneName, newRotation)
            normalizedBone.quaternion.setFromEuler(euler)

            // Special case: if rotating 'hips' (root bone), also rotate the whole model scene
            if (selectedBoneName === VRMHumanBoneName.Hips && vrm?.scene) {
                vrm.scene.quaternion.setFromEuler(euler)
            }
        } else {
            // Fallback for VRM 0.0 or non-humanoid bones
            console.log('Setting raw bone rotation:', selectedBone.name, newRotation)

            // Special case: if rotating 'Root' bone, ONLY rotate the whole model scene (not the bone itself)
            if (selectedBoneName === 'Root' && vrm?.scene) {
                vrm.scene.quaternion.setFromEuler(euler)
            } else {
                selectedBone.quaternion.setFromEuler(euler)
            }
        }
    }

    const resetRotation = () => {
        if (!selectedBone) return
        setRotation({ x: 0, y: 0, z: 0 })

        // For VRM 1.0: reset normalized bone
        const normalizedBone = getNormalizedBone()
        if (normalizedBone) {
            normalizedBone.quaternion.set(0, 0, 0, 1)
        } else {
            selectedBone.quaternion.set(0, 0, 0, 1)
        }

        // Also reset vrm.scene for Root/Hips
        if ((selectedBoneName === 'Root' || selectedBoneName === VRMHumanBoneName.Hips) && vrm?.scene) {
            vrm.scene.quaternion.set(0, 0, 0, 1)
        }
    }

    const resetDrag = () => {
        if (!selectedBone) return

        console.log('Reset Drag for:', selectedBoneName, selectedBone.name)

        // Special case for Root bone: only reset position, not rotation
        if (selectedBoneName === 'Root' && vrm?.scene) {
            vrm.scene.position.set(0, 0, 0)
            return
        }

        // Reset the selected bone's quaternion
        selectedBone.quaternion.set(0, 0, 0, 1)

        // Reset the parent bone's rotation (which is what drag affects)
        if (selectedBone.parent) {
            console.log('Resetting parent:', selectedBone.parent.name)
            selectedBone.parent.quaternion.set(0, 0, 0, 1)
        }

        // For normalized bones, also reset the normalized bone
        const normalizedBone = getNormalizedBone()
        if (normalizedBone && normalizedBone !== selectedBone) {
            normalizedBone.quaternion.set(0, 0, 0, 1)
            if (normalizedBone.parent) {
                normalizedBone.parent.quaternion.set(0, 0, 0, 1)
            }
        }

        // Sync rotation state
        setRotation({ x: 0, y: 0, z: 0 })
    }

    if (!selectedBone || !selectedBoneName) return null

    return (
        <div className="absolute bottom-4 left-4 p-4 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg z-10 w-72">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-xs text-gray-400">Selected Bone</p>
                    <p className="text-sm font-bold text-white">{selectedBoneName}</p>
                </div>
                <button
                    onClick={() => setSelectedBone(null, null)}
                    className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-3">
                {/* X Rotation */}
                <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span className="text-red-400 font-medium">X Rotation</span>
                        <span>{rotation.x.toFixed(1)}°</span>
                    </div>
                    <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={rotation.x}
                        onChange={(e) => handleRotationChange('x', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                </div>

                {/* Y Rotation */}
                <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span className="text-green-400 font-medium">Y Rotation</span>
                        <span>{rotation.y.toFixed(1)}°</span>
                    </div>
                    <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={rotation.y}
                        onChange={(e) => handleRotationChange('y', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                </div>

                {/* Z Rotation */}
                <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span className="text-blue-400 font-medium">Z Rotation</span>
                        <span>{rotation.z.toFixed(1)}°</span>
                    </div>
                    <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={rotation.z}
                        onChange={(e) => handleRotationChange('z', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
            </div>

            <div className="mt-3 flex gap-2">
                <button
                    onClick={resetRotation}
                    className="flex-1 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                    Reset Rotation
                </button>
                <button
                    onClick={resetDrag}
                    className="flex-1 px-3 py-2 text-xs bg-orange-700 hover:bg-orange-600 text-white rounded transition-colors"
                >
                    Reset Drag
                </button>
            </div>
        </div>
    )
}
