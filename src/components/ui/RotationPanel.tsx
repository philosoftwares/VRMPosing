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
    const [globalSlider, setGlobalSlider] = useState({ x: 0, y: 0, z: 0 })

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

    // Local rotation handler - rotates in bone's local space
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

        const normalizedBone = getNormalizedBone()
        if (normalizedBone) {
            normalizedBone.quaternion.setFromEuler(euler)
            if (selectedBoneName === VRMHumanBoneName.Hips && vrm?.scene) {
                vrm.scene.quaternion.setFromEuler(euler)
            }
        } else {
            if (selectedBoneName === 'Root' && vrm?.scene) {
                vrm.scene.quaternion.setFromEuler(euler)
            } else {
                selectedBone.quaternion.setFromEuler(euler)
            }
        }
    }

    // Global rotation handler - rotates in world space
    const handleGlobalRotationChange = (axis: 'x' | 'y' | 'z', deltaDeg: number) => {
        if (!selectedBone) return

        const normalizedBone = getNormalizedBone()
        const targetBone = normalizedBone || selectedBone

        // Multiply by 3 for more responsive rotation
        const deltaRad = THREE.MathUtils.degToRad(deltaDeg * 3)
        const worldAxis = axis === 'x' ? new THREE.Vector3(1, 0, 0) :
            axis === 'y' ? new THREE.Vector3(0, 1, 0) :
                new THREE.Vector3(0, 0, 1)

        const deltaQuat = new THREE.Quaternion().setFromAxisAngle(worldAxis, deltaRad)
        targetBone.quaternion.premultiply(deltaQuat)

        // Sync local rotation display
        const euler = new THREE.Euler().setFromQuaternion(targetBone.quaternion, 'XYZ')
        setRotation({
            x: THREE.MathUtils.radToDeg(euler.x),
            y: THREE.MathUtils.radToDeg(euler.y),
            z: THREE.MathUtils.radToDeg(euler.z),
        })
    }

    const resetRotation = () => {
        if (!selectedBone) return
        setRotation({ x: 0, y: 0, z: 0 })

        const normalizedBone = getNormalizedBone()
        if (normalizedBone) {
            normalizedBone.quaternion.set(0, 0, 0, 1)
        } else {
            selectedBone.quaternion.set(0, 0, 0, 1)
        }

        if ((selectedBoneName === 'Root' || selectedBoneName === VRMHumanBoneName.Hips) && vrm?.scene) {
            vrm.scene.quaternion.set(0, 0, 0, 1)
        }
    }

    const resetDrag = () => {
        if (!selectedBone) return

        if (selectedBoneName === 'Root' && vrm?.scene) {
            vrm.scene.position.set(0, 0, 0)
            return
        }

        selectedBone.quaternion.set(0, 0, 0, 1)

        if (selectedBone.parent) {
            selectedBone.parent.quaternion.set(0, 0, 0, 1)
        }

        const normalizedBone = getNormalizedBone()
        if (normalizedBone && normalizedBone !== selectedBone) {
            normalizedBone.quaternion.set(0, 0, 0, 1)
            if (normalizedBone.parent) {
                normalizedBone.parent.quaternion.set(0, 0, 0, 1)
            }
        }

        setRotation({ x: 0, y: 0, z: 0 })
    }

    if (!selectedBone || !selectedBoneName) return null

    return (
        <div className="absolute bottom-4 left-4 p-4 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg z-10 w-80">
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

            {/* Local Rotation Section */}
            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">LOCAL ROTATION</p>
                <div className="space-y-2">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-red-400 font-medium">X</span>
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
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-green-400 font-medium">Y</span>
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
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-blue-400 font-medium">Z</span>
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
            </div>

            {/* Global Rotation Section */}
            <div className="mb-4 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-2 font-medium">GLOBAL ROTATION</p>
                <div className="space-y-2">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-red-300 font-medium">World X</span>
                        </div>
                        <input
                            type="range"
                            min="-15"
                            max="15"
                            step="1"
                            value={globalSlider.x}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value)
                                setGlobalSlider(prev => ({ ...prev, x: val }))
                                if (val !== 0) handleGlobalRotationChange('x', val - globalSlider.x)
                            }}
                            onPointerUp={() => setGlobalSlider(prev => ({ ...prev, x: 0 }))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-300"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-green-300 font-medium">World Y</span>
                        </div>
                        <input
                            type="range"
                            min="-15"
                            max="15"
                            step="1"
                            value={globalSlider.y}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value)
                                setGlobalSlider(prev => ({ ...prev, y: val }))
                                if (val !== 0) handleGlobalRotationChange('y', val - globalSlider.y)
                            }}
                            onPointerUp={() => setGlobalSlider(prev => ({ ...prev, y: 0 }))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-300"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-blue-300 font-medium">World Z</span>
                        </div>
                        <input
                            type="range"
                            min="-15"
                            max="15"
                            step="1"
                            value={globalSlider.z}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value)
                                setGlobalSlider(prev => ({ ...prev, z: val }))
                                if (val !== 0) handleGlobalRotationChange('z', val - globalSlider.z)
                            }}
                            onPointerUp={() => setGlobalSlider(prev => ({ ...prev, z: 0 }))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-300"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
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
