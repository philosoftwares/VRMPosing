import { useStore } from '../../store/useStore'
import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { VRMHumanBoneName } from '@pixiv/three-vrm'

export const RotationPanel = () => {
    const vrm = useStore((state) => state.vrm)
    const selectedBone = useStore((state) => state.selectedBone)
    const selectedBoneName = useStore((state) => state.selectedBoneName)
    const setSelectedBone = useStore((state) => state.setSelectedBone)
    const setHoveredAxis = useStore((state) => state.setHoveredAxis)
    const initialSceneQuat = useStore((state) => state.initialSceneQuat)

    const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
    const [globalSlider, setGlobalSlider] = useState({ x: 0, y: 0, z: 0 })

    // Store initial quaternion when Root bone is selected
    const initialQuat = useRef(new THREE.Quaternion())

    const getNormalizedBone = () => {
        if (!vrm || !selectedBoneName) return null
        return vrm.humanoid?.getNormalizedBoneNode(selectedBoneName as VRMHumanBoneName)
    }

    useEffect(() => {
        // For Root bone: store initial quaternion and show (0,0,0)
        if (selectedBoneName === 'Root' && vrm?.scene) {
            initialQuat.current.copy(vrm.scene.quaternion)
            setRotation({ x: 0, y: 0, z: 0 })
            return
        }

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

        // For Root bone: apply rotation relative to initial quaternion
        if (selectedBoneName === 'Root' && vrm?.scene) {
            const deltaEuler = new THREE.Euler(
                THREE.MathUtils.degToRad(newRotation.x),
                THREE.MathUtils.degToRad(newRotation.y),
                THREE.MathUtils.degToRad(newRotation.z),
                'XYZ'
            )
            const deltaQuat = new THREE.Quaternion().setFromEuler(deltaEuler)
            // Final = initial * delta
            vrm.scene.quaternion.copy(initialQuat.current).multiply(deltaQuat)
            return
        }

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
            selectedBone.quaternion.setFromEuler(euler)
        }
    }

    const handleGlobalRotationChange = (axis: 'x' | 'y' | 'z', deltaDeg: number) => {
        if (!selectedBone) return

        const deltaRad = THREE.MathUtils.degToRad(deltaDeg * 3)
        const worldAxis = axis === 'x' ? new THREE.Vector3(1, 0, 0) :
            axis === 'y' ? new THREE.Vector3(0, 1, 0) :
                new THREE.Vector3(0, 0, 1)

        const deltaQuat = new THREE.Quaternion().setFromAxisAngle(worldAxis, deltaRad)

        if (selectedBoneName === 'Root' && vrm?.scene) {
            vrm.scene.quaternion.premultiply(deltaQuat)
            // Update initial quaternion so local rotation stays consistent
            initialQuat.current.copy(vrm.scene.quaternion)
            setRotation({ x: 0, y: 0, z: 0 })
            return
        }

        const normalizedBone = getNormalizedBone()
        const targetBone = normalizedBone || selectedBone

        targetBone.quaternion.premultiply(deltaQuat)

        const euler = new THREE.Euler().setFromQuaternion(targetBone.quaternion, 'XYZ')
        setRotation({
            x: THREE.MathUtils.radToDeg(euler.x),
            y: THREE.MathUtils.radToDeg(euler.y),
            z: THREE.MathUtils.radToDeg(euler.z),
        })
    }

    const resetRotation = () => {
        if (!selectedBone) return

        if ((selectedBoneName === 'Root' || selectedBoneName === VRMHumanBoneName.Hips) && vrm?.scene) {
            // Reset to initial rotation (what it was when VRM loaded)
            vrm.scene.quaternion.copy(initialSceneQuat)
            initialQuat.current.copy(vrm.scene.quaternion)
            setRotation({ x: 0, y: 0, z: 0 })
            return
        }

        setRotation({ x: 0, y: 0, z: 0 })
        const normalizedBone = getNormalizedBone()
        if (normalizedBone) {
            normalizedBone.quaternion.set(0, 0, 0, 1)
        } else {
            selectedBone.quaternion.set(0, 0, 0, 1)
        }
    }

    const resetDrag = () => {
        if (!selectedBone) return
        if (selectedBoneName === 'Root' && vrm?.scene) {
            vrm.scene.position.set(0, 0, 0)
            return
        }
        selectedBone.quaternion.set(0, 0, 0, 1)
        if (selectedBone.parent) selectedBone.parent.quaternion.set(0, 0, 0, 1)
        const normalizedBone = getNormalizedBone()
        if (normalizedBone && normalizedBone !== selectedBone) {
            normalizedBone.quaternion.set(0, 0, 0, 1)
            if (normalizedBone.parent) normalizedBone.parent.quaternion.set(0, 0, 0, 1)
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
                <button onClick={() => setSelectedBone(null, null)} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded">✕</button>
            </div>

            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">LOCAL ROTATION</p>
                <div className="space-y-2">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-red-400 font-medium">X</span>
                            <span>{rotation.x.toFixed(1)}°</span>
                        </div>
                        <input type="range" min="-180" max="180" step="1" value={rotation.x}
                            onChange={(e) => handleRotationChange('x', parseFloat(e.target.value))}
                            onMouseEnter={() => setHoveredAxis('localX')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-green-400 font-medium">Y</span>
                            <span>{rotation.y.toFixed(1)}°</span>
                        </div>
                        <input type="range" min="-180" max="180" step="1" value={rotation.y}
                            onChange={(e) => handleRotationChange('y', parseFloat(e.target.value))}
                            onMouseEnter={() => setHoveredAxis('localY')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-blue-400 font-medium">Z</span>
                            <span>{rotation.z.toFixed(1)}°</span>
                        </div>
                        <input type="range" min="-180" max="180" step="1" value={rotation.z}
                            onChange={(e) => handleRotationChange('z', parseFloat(e.target.value))}
                            onMouseEnter={() => setHoveredAxis('localZ')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    </div>
                </div>
            </div>

            <div className="mb-4 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-2 font-medium">GLOBAL ROTATION</p>
                <div className="space-y-2">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-red-300 font-medium">World X</span>
                        </div>
                        <input type="range" min="-15" max="15" step="1" value={globalSlider.x}
                            onChange={(e) => { const val = parseFloat(e.target.value); setGlobalSlider(p => ({ ...p, x: val })); if (val !== 0) handleGlobalRotationChange('x', val - globalSlider.x) }}
                            onPointerUp={() => setGlobalSlider(p => ({ ...p, x: 0 }))}
                            onMouseEnter={() => setHoveredAxis('globalX')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-300" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-green-300 font-medium">World Y</span>
                        </div>
                        <input type="range" min="-15" max="15" step="1" value={globalSlider.y}
                            onChange={(e) => { const val = parseFloat(e.target.value); setGlobalSlider(p => ({ ...p, y: val })); if (val !== 0) handleGlobalRotationChange('y', val - globalSlider.y) }}
                            onPointerUp={() => setGlobalSlider(p => ({ ...p, y: 0 }))}
                            onMouseEnter={() => setHoveredAxis('globalY')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-300" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-blue-300 font-medium">World Z</span>
                        </div>
                        <input type="range" min="-15" max="15" step="1" value={globalSlider.z}
                            onChange={(e) => { const val = parseFloat(e.target.value); setGlobalSlider(p => ({ ...p, z: val })); if (val !== 0) handleGlobalRotationChange('z', val - globalSlider.z) }}
                            onPointerUp={() => setGlobalSlider(p => ({ ...p, z: 0 }))}
                            onMouseEnter={() => setHoveredAxis('globalZ')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-300" />
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <button onClick={resetRotation} className="flex-1 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded">Reset Rotation</button>
                <button onClick={resetDrag} className="flex-1 px-3 py-2 text-xs bg-orange-700 hover:bg-orange-600 text-white rounded">Reset Drag</button>
            </div>
        </div>
    )
}
