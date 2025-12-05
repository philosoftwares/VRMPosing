import { useStore } from '../../store/useStore'

export const CameraResetPanel = () => {
    const vrm = useStore((state) => state.vrm)
    const cameraResetCallbacks = useStore((state) => state.cameraResetCallbacks)

    if (!vrm) return null

    return (
        <div className="absolute bottom-4 right-72 p-3 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg z-10">
            <p className="text-xs text-gray-500 mb-2 font-medium">CAMERA</p>
            <div className="flex gap-2">
                <button
                    onClick={() => cameraResetCallbacks.focusToModel?.()}
                    className="px-3 py-2 text-xs bg-green-700 hover:bg-green-600 text-white rounded"
                    title="Focus camera on model (F)"
                >
                    Focus
                </button>
                <button
                    onClick={() => cameraResetCallbacks.resetPosition?.()}
                    className="px-3 py-2 text-xs bg-cyan-700 hover:bg-cyan-600 text-white rounded"
                    title="Reset camera position to default"
                >
                    Reset Pos
                </button>
                <button
                    onClick={() => cameraResetCallbacks.resetRotation?.()}
                    className="px-3 py-2 text-xs bg-cyan-700 hover:bg-cyan-600 text-white rounded"
                    title="Reset camera rotation to front view"
                >
                    Reset Rot
                </button>
                <button
                    onClick={() => cameraResetCallbacks.resetAll?.()}
                    className="px-3 py-2 text-xs bg-cyan-800 hover:bg-cyan-700 text-white rounded"
                    title="Reset camera position and rotation"
                >
                    Reset All
                </button>
            </div>
        </div>
    )
}
