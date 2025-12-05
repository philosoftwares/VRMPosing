import { useStore } from '../../store/useStore'
import { useEffect } from 'react'

export const HistoryPanel = () => {
    const vrm = useStore((state) => state.vrm)
    const history = useStore((state) => state.history)
    const historyIndex = useStore((state) => state.historyIndex)
    const undo = useStore((state) => state.undo)
    const redo = useStore((state) => state.redo)

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault()
                undo()
            }
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault()
                redo()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [undo, redo])

    if (!vrm) return null

    const canUndo = historyIndex > 0
    const canRedo = historyIndex < history.length - 1

    return (
        <div className="absolute top-44 left-4 p-3 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg z-10">
            {/* Undo/Redo */}
            <div className="flex gap-2">
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={`flex-1 px-4 py-2 text-xs rounded flex flex-col items-center justify-center
                        ${canUndo ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                    title="Undo (Ctrl+Z)"
                >
                    <span className="text-lg">↩</span>
                    <span>Undo</span>
                </button>
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className={`flex-1 px-4 py-2 text-xs rounded flex flex-col items-center justify-center
                        ${canRedo ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                    title="Redo (Ctrl+Y)"
                >
                    <span className="text-lg">↪</span>
                    <span>Redo</span>
                </button>
            </div>

            {/* History count */}
            <p className="text-xs text-gray-600 mt-2 text-center">
                {historyIndex} / {Math.max(0, history.length - 1)}
            </p>
        </div>
    )
}
