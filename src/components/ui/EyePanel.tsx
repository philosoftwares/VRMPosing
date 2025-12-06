import { useStore } from '../../store/useStore'
import { useRef, useCallback, useEffect } from 'react'

const MAX_ANGLE = 90 // Maximum angle in degrees

export const EyePanel = () => {
    const vrm = useStore((state) => state.vrm)
    const saveSnapshot = useStore((state) => state.saveSnapshot)
    const eyeYaw = useStore((state) => state.eyeYaw)
    const eyePitch = useStore((state) => state.eyePitch)
    const setEyeDirection = useStore((state) => state.setEyeDirection)

    const isDraggingRef = useRef(false)

    // Apply yaw/pitch to VRM lookAt
    const applyLookAt = useCallback((yaw: number, pitch: number) => {
        if (!vrm?.lookAt?.applier) return
        if ('applyYawPitch' in vrm.lookAt.applier) {
            (vrm.lookAt.applier as any).applyYawPitch(yaw, pitch)
        }
    }, [vrm])

    // Apply current eye direction on VRM change or when values change from undo/redo
    useEffect(() => {
        applyLookAt(eyeYaw, eyePitch)
    }, [eyeYaw, eyePitch, applyLookAt])

    const handleSliderChange = (axis: 'yaw' | 'pitch', value: number) => {
        const newYaw = axis === 'yaw' ? value : eyeYaw
        const newPitch = axis === 'pitch' ? value : eyePitch

        setEyeDirection(newYaw, newPitch)
        applyLookAt(newYaw, newPitch)
    }

    const handlePointerDown = () => {
        isDraggingRef.current = true
    }

    const handlePointerUp = () => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false
            saveSnapshot()
        }
    }

    const resetEyes = () => {
        setEyeDirection(0, 0)
        applyLookAt(0, 0)
        saveSnapshot()
    }

    if (!vrm) return null

    // Check if VRM has lookAt support
    const hasLookAt = vrm.lookAt?.applier && 'applyYawPitch' in vrm.lookAt.applier
    if (!hasLookAt) return null

    return (
        <div className="absolute bottom-4 left-64 p-3 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg z-10 w-44">
            <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-500 font-medium">EYE DIRECTION</p>
                <button
                    onClick={resetEyes}
                    className="text-xs text-purple-400 hover:text-purple-300"
                >
                    Reset
                </button>
            </div>

            {/* Horizontal (Yaw) */}
            <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Horizontal</span>
                    <span>{eyeYaw.toFixed(0)}°</span>
                </div>
                <input
                    type="range"
                    min={-MAX_ANGLE}
                    max={MAX_ANGLE}
                    value={eyeYaw}
                    onChange={(e) => handleSliderChange('yaw', Number(e.target.value))}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    className="w-full h-2 bg-purple-900 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:bg-purple-500
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:hover:bg-purple-400"
                />
            </div>

            {/* Vertical (Pitch) */}
            <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Vertical</span>
                    <span>{eyePitch.toFixed(0)}°</span>
                </div>
                <input
                    type="range"
                    min={-MAX_ANGLE}
                    max={MAX_ANGLE}
                    value={eyePitch}
                    onChange={(e) => handleSliderChange('pitch', Number(e.target.value))}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    className="w-full h-2 bg-purple-900 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:bg-purple-500
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:hover:bg-purple-400"
                />
            </div>
        </div>
    )
}
