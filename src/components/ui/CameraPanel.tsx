import { useStore } from '../../store/useStore'
import { useState, useRef, useCallback, useEffect } from 'react'

export const CameraPanel = () => {
    const vrm = useStore((state) => state.vrm)
    const cameraState = useStore((state) => state.cameraState)
    const cameraResetCallbacks = useStore((state) => state.cameraResetCallbacks)
    const applyCameraPosition = useStore((state) => state.applyCameraPosition)
    const applyCameraSpherical = useStore((state) => state.applyCameraSpherical)

    // Position
    const [posX, setPosX] = useState('')
    const [posY, setPosY] = useState('')
    const [posZ, setPosZ] = useState('')

    // Spherical
    const [azimuth, setAzimuth] = useState('')
    const [elevation, setElevation] = useState('')
    const [distance, setDistance] = useState('')

    const isEditingRef = useRef(false)
    const applyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Sync with camera state when not editing
    useEffect(() => {
        if (isEditingRef.current) return
        if (!cameraState?.position || !cameraState?.spherical) return

        setPosX(cameraState.position.x.toFixed(2))
        setPosY(cameraState.position.y.toFixed(2))
        setPosZ(cameraState.position.z.toFixed(2))
        setAzimuth(cameraState.spherical.azimuth.toFixed(1))
        setElevation(cameraState.spherical.elevation.toFixed(1))
        setDistance(cameraState.spherical.distance.toFixed(2))
    }, [cameraState])

    const handleFocus = () => {
        isEditingRef.current = true
        if (applyTimeoutRef.current) {
            clearTimeout(applyTimeoutRef.current)
        }
    }

    const applyPosition = useCallback(() => {
        if (!applyCameraPosition) return
        const x = parseFloat(posX) || 0
        const y = parseFloat(posY) || 1.5
        const z = parseFloat(posZ) || 2
        applyCameraPosition(x, y, z)

        applyTimeoutRef.current = setTimeout(() => {
            isEditingRef.current = false
        }, 100)
    }, [applyCameraPosition, posX, posY, posZ])

    const applySpherical = useCallback(() => {
        if (!applyCameraSpherical) return
        const a = parseFloat(azimuth) || 0
        const e = parseFloat(elevation) || 0
        const d = parseFloat(distance) || 2
        applyCameraSpherical(a, e, d)

        applyTimeoutRef.current = setTimeout(() => {
            isEditingRef.current = false
        }, 100)
    }, [applyCameraSpherical, azimuth, elevation, distance])

    const handleKeyDown = (e: React.KeyboardEvent, applyFn: () => void) => {
        if (e.key === 'Enter') {
            applyFn()
                ; (e.target as HTMLInputElement).blur()
        }
    }

    if (!vrm) return null

    const inputClass = "w-14 px-1 py-0.5 text-xs bg-gray-800 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none text-center"
    const labelClass = "text-xs text-gray-500 w-3"

    return (
        <div className="absolute bottom-4 left-64 p-3 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg z-10">
            <p className="text-xs text-gray-500 mb-2 font-medium">CAMERA</p>

            {/* Position */}
            <div className="mb-2">
                <p className="text-xs text-gray-400 mb-1">Position</p>
                <div className="flex gap-1 items-center">
                    <span className={labelClass}>X</span>
                    <input
                        type="text"
                        value={posX}
                        onChange={(e) => setPosX(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={applyPosition}
                        onKeyDown={(e) => handleKeyDown(e, applyPosition)}
                        className={inputClass}
                    />
                    <span className={labelClass}>Y</span>
                    <input
                        type="text"
                        value={posY}
                        onChange={(e) => setPosY(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={applyPosition}
                        onKeyDown={(e) => handleKeyDown(e, applyPosition)}
                        className={inputClass}
                    />
                    <span className={labelClass}>Z</span>
                    <input
                        type="text"
                        value={posZ}
                        onChange={(e) => setPosZ(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={applyPosition}
                        onKeyDown={(e) => handleKeyDown(e, applyPosition)}
                        className={inputClass}
                    />
                </div>
            </div>

            {/* Orbit Angle */}
            <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">Orbit (°)</p>
                <div className="flex gap-1 items-center text-xs">
                    <span className="text-gray-500 w-8">Az</span>
                    <input
                        type="text"
                        value={azimuth}
                        onChange={(e) => setAzimuth(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={applySpherical}
                        onKeyDown={(e) => handleKeyDown(e, applySpherical)}
                        className={inputClass}
                        title="Azimuth: horizontal angle (0° = front)"
                    />
                    <span className="text-gray-500 w-8">El</span>
                    <input
                        type="text"
                        value={elevation}
                        onChange={(e) => setElevation(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={applySpherical}
                        onKeyDown={(e) => handleKeyDown(e, applySpherical)}
                        className={inputClass}
                        title="Elevation: vertical angle (0° = eye level)"
                    />
                    <span className="text-gray-500 w-8">Dist</span>
                    <input
                        type="text"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={applySpherical}
                        onKeyDown={(e) => handleKeyDown(e, applySpherical)}
                        className={inputClass}
                        title="Distance from target"
                    />
                </div>
            </div>

            {/* Reset Buttons */}
            <div className="flex gap-1">
                <button
                    onClick={() => cameraResetCallbacks.focusToModel?.()}
                    className="px-2 py-1.5 text-xs bg-green-700 hover:bg-green-600 text-white rounded"
                    title="Focus camera on model (F)"
                >
                    Focus
                </button>
                <button
                    onClick={() => cameraResetCallbacks.resetPosition?.()}
                    className="px-2 py-1.5 text-xs bg-cyan-700 hover:bg-cyan-600 text-white rounded"
                    title="Reset camera position to default"
                >
                    Reset Pos
                </button>
                <button
                    onClick={() => cameraResetCallbacks.resetRotation?.()}
                    className="px-2 py-1.5 text-xs bg-cyan-700 hover:bg-cyan-600 text-white rounded"
                    title="Reset camera rotation to front view"
                >
                    Reset Rot
                </button>
                <button
                    onClick={() => cameraResetCallbacks.resetAll?.()}
                    className="px-2 py-1.5 text-xs bg-cyan-800 hover:bg-cyan-700 text-white rounded"
                    title="Reset camera position and rotation"
                >
                    Reset All
                </button>
            </div>
        </div>
    )
}
