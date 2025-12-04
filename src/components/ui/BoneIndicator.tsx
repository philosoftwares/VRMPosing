import { useStore } from '../../store/useStore'

export const BoneIndicator = () => {
    const selectedBoneName = useStore((state) => state.selectedBoneName)
    const setSelectedBone = useStore((state) => state.setSelectedBone)

    if (!selectedBoneName) return null

    return (
        <div className="absolute bottom-4 left-4 p-3 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg z-10">
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <div>
                    <p className="text-xs text-gray-400">Selected Bone</p>
                    <p className="text-sm font-bold text-white">{selectedBoneName}</p>
                </div>
                <button
                    onClick={() => setSelectedBone(null, null)}
                    className="ml-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                    Clear
                </button>
            </div>
        </div>
    )
}
