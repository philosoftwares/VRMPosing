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

    // Current Euler angles (read-only display)
    const [eulerDisplay, setEulerDisplay] = useState({ x: 0, y: 0, z: 0 })
    // Local slider values (spring-back to 0)
    const [localSlider, setLocalSlider] = useState({ x: 0, y: 0, z: 0 })
    const [globalSlider, setGlobalSlider] = useState({ x: 0, y: 0, z: 0 })

    // Store initial quaternion when Root bone is selected
    const initialQuat = useRef(new THREE.Quaternion())

    const getNormalizedBone = () => {
        if (!vrm || !selectedBoneName) return null
        return vrm.humanoid?.getNormalizedBoneNode(selectedBoneName as VRMHumanBoneName)
    }

    // Update Euler display when bone changes or after rotation
    const updateEulerDisplay = () => {
        if (selectedBoneName === 'Root' && vrm?.scene) {
            const euler = new THREE.Euler().setFromQuaternion(vrm.scene.quaternion, 'XYZ')
            setEulerDisplay({
                x: THREE.MathUtils.radToDeg(euler.x),
                y: THREE.MathUtils.radToDeg(euler.y),
                z: THREE.MathUtils.radToDeg(euler.z),
            })
            return
        }

        const normalizedBone = getNormalizedBone()
        const boneToRead = normalizedBone || selectedBone

        if (boneToRead) {
            const euler = new THREE.Euler().setFromQuaternion(boneToRead.quaternion, 'XYZ')
            setEulerDisplay({
                x: THREE.MathUtils.radToDeg(euler.x),
                y: THREE.MathUtils.radToDeg(euler.y),
                z: THREE.MathUtils.radToDeg(euler.z),
            })
        }
    }

    useEffect(() => {
        // Store initial quaternion for Root
        if (selectedBoneName === 'Root' && vrm?.scene) {
            initialQuat.current.copy(vrm.scene.quaternion)
        }
        // Reset sliders when bone changes
        setLocalSlider({ x: 0, y: 0, z: 0 })
        updateEulerDisplay()
    }, [selectedBone, selectedBoneName, vrm])

    // Handle local rotation - incremental around current local axis
    const handleLocalRotationChange = (axis: 'x' | 'y' | 'z', deltaDeg: number) => {
        if (!selectedBone) return

        const deltaRad = THREE.MathUtils.degToRad(deltaDeg * 3) // 3x sensitivity

        // Local axis in bone's local space
        const localAxis = axis === 'x' ? new THREE.Vector3(1, 0, 0) :
            axis === 'y' ? new THREE.Vector3(0, 1, 0) :
                new THREE.Vector3(0, 0, 1)

        const deltaQuat = new THREE.Quaternion().setFromAxisAngle(localAxis, deltaRad)

        if (selectedBoneName === 'Root' && vrm?.scene) {
            // For Root: multiply (local rotation)
            vrm.scene.quaternion.multiply(deltaQuat)
            initialQuat.current.copy(vrm.scene.quaternion)
            updateEulerDisplay()
            return
        }

        const normalizedBone = getNormalizedBone()
        const targetBone = normalizedBone || selectedBone

        // multiply for local-space rotation (rotates around bone's own axis)
        targetBone.quaternion.multiply(deltaQuat)

        updateEulerDisplay()
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
            initialQuat.current.copy(vrm.scene.quaternion)
            updateEulerDisplay()
            return
        }

        const normalizedBone = getNormalizedBone()
        const targetBone = normalizedBone || selectedBone

        // Get current world quaternion
        const worldQuat = new THREE.Quaternion()
        targetBone.getWorldQuaternion(worldQuat)

        // Apply world rotation: newWorld = delta * currentWorld
        const newWorldQuat = deltaQuat.clone().multiply(worldQuat)

        // Convert back to local space
        if (targetBone.parent) {
            const parentWorldQuat = new THREE.Quaternion()
            targetBone.parent.getWorldQuaternion(parentWorldQuat)
            // localQuat = inverse(parentWorld) * newWorld
            const parentInverse = parentWorldQuat.clone().invert()
            targetBone.quaternion.copy(parentInverse.multiply(newWorldQuat))
        } else {
            targetBone.quaternion.copy(newWorldQuat)
        }

        updateEulerDisplay()
    }

    const resetRotation = () => {
        if (!selectedBone) return

        if ((selectedBoneName === 'Root' || selectedBoneName === VRMHumanBoneName.Hips) && vrm?.scene) {
            // Reset to initial rotation (what it was when VRM loaded)
            vrm.scene.quaternion.copy(initialSceneQuat)
            initialQuat.current.copy(vrm.scene.quaternion)
            updateEulerDisplay()
            return
        }

        const normalizedBone = getNormalizedBone()
        if (normalizedBone) {
            normalizedBone.quaternion.set(0, 0, 0, 1)
        } else {
            selectedBone.quaternion.set(0, 0, 0, 1)
        }
        updateEulerDisplay()
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
        updateEulerDisplay()
    }

    if (!selectedBone || !selectedBoneName) return null

    return (
        <div className="absolute bottom-4 right-4 p-4 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg z-10 w-80">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-xs text-gray-400">Selected Bone</p>
                    <p className="text-sm font-bold text-white">{selectedBoneName}</p>
                </div>
                <button onClick={() => setSelectedBone(null, null)} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded">✕</button>
            </div>

            {/* Euler angle display (read-only) */}
            <div className="mb-3 text-xs text-gray-500">
                <span>Euler: </span>
                <span className="text-red-400">{eulerDisplay.x.toFixed(1)}°</span>
                <span> / </span>
                <span className="text-green-400">{eulerDisplay.y.toFixed(1)}°</span>
                <span> / </span>
                <span className="text-blue-400">{eulerDisplay.z.toFixed(1)}°</span>
            </div>

            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">LOCAL ROTATION</p>
                <div className="space-y-2">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-red-400 font-medium">X</span>
                        </div>
                        <input type="range" min="-15" max="15" step="1" value={localSlider.x}
                            onChange={(e) => { const val = parseFloat(e.target.value); setLocalSlider(p => ({ ...p, x: val })); if (val !== 0) handleLocalRotationChange('x', val - localSlider.x) }}
                            onPointerUp={() => setLocalSlider(p => ({ ...p, x: 0 }))}
                            onMouseEnter={() => setHoveredAxis('localX')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-green-400 font-medium">Y</span>
                        </div>
                        <input type="range" min="-15" max="15" step="1" value={localSlider.y}
                            onChange={(e) => { const val = parseFloat(e.target.value); setLocalSlider(p => ({ ...p, y: val })); if (val !== 0) handleLocalRotationChange('y', val - localSlider.y) }}
                            onPointerUp={() => setLocalSlider(p => ({ ...p, y: 0 }))}
                            onMouseEnter={() => setHoveredAxis('localY')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-blue-400 font-medium">Z</span>
                        </div>
                        <input type="range" min="-15" max="15" step="1" value={localSlider.z}
                            onChange={(e) => { const val = parseFloat(e.target.value); setLocalSlider(p => ({ ...p, z: val })); if (val !== 0) handleLocalRotationChange('z', val - localSlider.z) }}
                            onPointerUp={() => setLocalSlider(p => ({ ...p, z: 0 }))}
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
