import { useStore } from '../../store/useStore'
import { useState, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { VRMHumanBoneName } from '@pixiv/three-vrm'

export const DragPanel = () => {
    const vrm = useStore((state) => state.vrm)
    const selectedBone = useStore((state) => state.selectedBone)
    const selectedBoneName = useStore((state) => state.selectedBoneName)
    const setSelectedBone = useStore((state) => state.setSelectedBone)
    const saveSnapshot = useStore((state) => state.saveSnapshot)
    const setHoveredAxis = useStore((state) => state.setHoveredAxis)

    const [localDragSlider, setLocalDragSlider] = useState({ x: 0, y: 0, z: 0 })
    const [worldDragSlider, setWorldDragSlider] = useState({ x: 0, y: 0, z: 0 })

    // Store initial state when drag starts
    const dragStartRef = useRef<{
        parentQuat: THREE.Quaternion | null
        scenePos: THREE.Vector3 | null
    }>({ parentQuat: null, scenePos: null })

    // Reusable vectors for drag calculations
    const dragCalcRefs = useRef({
        boneWorldPos: new THREE.Vector3(),
        parentWorldPos: new THREE.Vector3(),
        currentDir: new THREE.Vector3(),
        targetDir: new THREE.Vector3(),
        rotationQuat: new THREE.Quaternion(),
        parentWorldQuat: new THREE.Quaternion(),
        grandparentWorldQuat: new THREE.Quaternion(),
        boneWorldQuat: new THREE.Quaternion(),
        localAxis: new THREE.Vector3(),
    })

    const getNormalizedBone = () => {
        if (!vrm || !selectedBoneName) return null
        return vrm.humanoid?.getNormalizedBoneNode(selectedBoneName as VRMHumanBoneName)
    }

    useEffect(() => {
        setLocalDragSlider({ x: 0, y: 0, z: 0 })
        setWorldDragSlider({ x: 0, y: 0, z: 0 })
    }, [selectedBone, selectedBoneName])

    // Capture initial state when starting drag
    const captureInitialState = useCallback(() => {
        if (selectedBoneName === 'Root' && vrm?.scene) {
            dragStartRef.current.scenePos = vrm.scene.position.clone()
            return
        }
        const normalizedBone = getNormalizedBone()
        const bone = normalizedBone || selectedBone
        if (bone?.parent) {
            dragStartRef.current.parentQuat = bone.parent.quaternion.clone()
        }
    }, [vrm, selectedBone, selectedBoneName])

    // Apply IK-like rotation to move bone toward target position
    const applyDragToTarget = (bone: THREE.Object3D, targetPos: THREE.Vector3): boolean => {
        if (!bone.parent) return false

        const calc = dragCalcRefs.current

        bone.parent.getWorldPosition(calc.parentWorldPos)
        bone.getWorldPosition(calc.boneWorldPos)

        calc.currentDir.subVectors(calc.boneWorldPos, calc.parentWorldPos).normalize()
        calc.targetDir.subVectors(targetPos, calc.parentWorldPos).normalize()

        // If directions are too similar, movement has saturated
        if (calc.currentDir.dot(calc.targetDir) > 0.9999) return false

        calc.rotationQuat.setFromUnitVectors(calc.currentDir, calc.targetDir)
        bone.parent.getWorldQuaternion(calc.parentWorldQuat)

        calc.rotationQuat.multiply(calc.parentWorldQuat)

        if (bone.parent.parent) {
            bone.parent.parent.getWorldQuaternion(calc.grandparentWorldQuat)
            calc.grandparentWorldQuat.invert()
            bone.parent.quaternion.copy(calc.rotationQuat.premultiply(calc.grandparentWorldQuat))
        } else {
            bone.parent.quaternion.copy(calc.rotationQuat)
        }
        return true
    }

    // Handle LOCAL drag - move along bone's local axes
    // Uses absolute slider value as offset, not delta
    const handleLocalDragChange = (axis: 'x' | 'y' | 'z', sliderValue: number) => {
        if (!selectedBone) return

        const sensitivity = 0.01
        const offset = sliderValue * sensitivity

        // For Root bone: translate in local space
        if (selectedBoneName === 'Root' && vrm?.scene && dragStartRef.current.scenePos) {
            const localAxis = axis === 'x' ? new THREE.Vector3(1, 0, 0) :
                axis === 'y' ? new THREE.Vector3(0, 1, 0) :
                    new THREE.Vector3(0, 0, 1)
            localAxis.applyQuaternion(vrm.scene.quaternion)
            vrm.scene.position.copy(dragStartRef.current.scenePos).add(localAxis.multiplyScalar(offset))
            return
        }

        const normalizedBone = getNormalizedBone()
        const bone = normalizedBone || selectedBone

        if (!bone.parent || !dragStartRef.current.parentQuat) return

        // Restore parent to initial state first
        bone.parent.quaternion.copy(dragStartRef.current.parentQuat)

        const calc = dragCalcRefs.current

        bone.getWorldPosition(calc.boneWorldPos)
        bone.getWorldQuaternion(calc.boneWorldQuat)

        calc.localAxis.set(
            axis === 'x' ? 1 : 0,
            axis === 'y' ? 1 : 0,
            axis === 'z' ? 1 : 0
        )
        calc.localAxis.applyQuaternion(calc.boneWorldQuat)

        const targetPos = calc.boneWorldPos.clone().add(calc.localAxis.multiplyScalar(offset))
        applyDragToTarget(bone, targetPos)
    }

    // Handle WORLD drag - move along world axes
    const handleWorldDragChange = (axis: 'x' | 'y' | 'z', sliderValue: number) => {
        if (!selectedBone) return

        const sensitivity = 0.01
        const offset = sliderValue * sensitivity

        if (selectedBoneName === 'Root' && vrm?.scene && dragStartRef.current.scenePos) {
            const newPos = dragStartRef.current.scenePos.clone()
            if (axis === 'x') newPos.x += offset
            else if (axis === 'y') newPos.y += offset
            else newPos.z += offset
            vrm.scene.position.copy(newPos)
            return
        }

        const normalizedBone = getNormalizedBone()
        const bone = normalizedBone || selectedBone

        if (!bone.parent || !dragStartRef.current.parentQuat) return

        // Restore parent to initial state first
        bone.parent.quaternion.copy(dragStartRef.current.parentQuat)

        const calc = dragCalcRefs.current
        bone.getWorldPosition(calc.boneWorldPos)

        const targetPos = calc.boneWorldPos.clone()
        if (axis === 'x') targetPos.x += offset
        else if (axis === 'y') targetPos.y += offset
        else targetPos.z += offset

        applyDragToTarget(bone, targetPos)
    }

    if (!selectedBone || !selectedBoneName) return null

    return (
        <div className="absolute bottom-4 left-4 p-3 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg z-10 w-56">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-xs text-gray-400 font-medium">DRAG POSITION</p>
                    <p className="text-xs text-gray-600">{selectedBoneName}</p>
                </div>
                <button onClick={() => setSelectedBone(null, null)} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded">✕</button>
            </div>

            {/* LOCAL DRAG */}
            <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2 font-medium">LOCAL</p>
                <div className="space-y-2">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-orange-400 font-medium">X</span>
                        </div>
                        <input type="range" min="-15" max="15" step="1" value={localDragSlider.x}
                            onPointerDown={captureInitialState}
                            onChange={(e) => { const val = parseFloat(e.target.value); setLocalDragSlider(p => ({ ...p, x: val })); handleLocalDragChange('x', val) }}
                            onPointerUp={() => { setLocalDragSlider(p => ({ ...p, x: 0 })); saveSnapshot() }}
                            onMouseEnter={() => setHoveredAxis('localDragX')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-400" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-orange-300 font-medium">Y</span>
                        </div>
                        <input type="range" min="-15" max="15" step="1" value={localDragSlider.y}
                            onPointerDown={captureInitialState}
                            onChange={(e) => { const val = parseFloat(e.target.value); setLocalDragSlider(p => ({ ...p, y: val })); handleLocalDragChange('y', val) }}
                            onPointerUp={() => { setLocalDragSlider(p => ({ ...p, y: 0 })); saveSnapshot() }}
                            onMouseEnter={() => setHoveredAxis('localDragY')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-300" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-orange-200 font-medium">Z</span>
                        </div>
                        <input type="range" min="-15" max="15" step="1" value={localDragSlider.z}
                            onPointerDown={captureInitialState}
                            onChange={(e) => { const val = parseFloat(e.target.value); setLocalDragSlider(p => ({ ...p, z: val })); handleLocalDragChange('z', val) }}
                            onPointerUp={() => { setLocalDragSlider(p => ({ ...p, z: 0 })); saveSnapshot() }}
                            onMouseEnter={() => setHoveredAxis('localDragZ')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-200" />
                    </div>
                </div>
            </div>

            {/* WORLD DRAG */}
            <div className="pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-2 font-medium">WORLD</p>
                <div className="space-y-2">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-yellow-400 font-medium">X</span>
                            <span className="text-gray-600 text-[10px]">Left/Right</span>
                        </div>
                        <input type="range" min="-15" max="15" step="1" value={worldDragSlider.x}
                            onPointerDown={captureInitialState}
                            onChange={(e) => { const val = parseFloat(e.target.value); setWorldDragSlider(p => ({ ...p, x: val })); handleWorldDragChange('x', val) }}
                            onPointerUp={() => { setWorldDragSlider(p => ({ ...p, x: 0 })); saveSnapshot() }}
                            onMouseEnter={() => setHoveredAxis('worldDragX')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-yellow-300 font-medium">Y</span>
                            <span className="text-gray-600 text-[10px]">Up/Down</span>
                        </div>
                        <input type="range" min="-15" max="15" step="1" value={worldDragSlider.y}
                            onPointerDown={captureInitialState}
                            onChange={(e) => { const val = parseFloat(e.target.value); setWorldDragSlider(p => ({ ...p, y: val })); handleWorldDragChange('y', val) }}
                            onPointerUp={() => { setWorldDragSlider(p => ({ ...p, y: 0 })); saveSnapshot() }}
                            onMouseEnter={() => setHoveredAxis('worldDragY')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-300" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="text-yellow-200 font-medium">Z</span>
                            <span className="text-gray-600 text-[10px]">Front/Back</span>
                        </div>
                        <input type="range" min="-15" max="15" step="1" value={worldDragSlider.z}
                            onPointerDown={captureInitialState}
                            onChange={(e) => { const val = parseFloat(e.target.value); setWorldDragSlider(p => ({ ...p, z: val })); handleWorldDragChange('z', val) }}
                            onPointerUp={() => { setWorldDragSlider(p => ({ ...p, z: 0 })); saveSnapshot() }}
                            onMouseEnter={() => setHoveredAxis('worldDragZ')} onMouseLeave={() => setHoveredAxis(null)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-200" />
                    </div>
                </div>
            </div>
        </div>
    )
}
