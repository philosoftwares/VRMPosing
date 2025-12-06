import { useStore } from '../../store/useStore'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import { useCallback, useState } from 'react'

export const Upload = () => {
    const vrm = useStore((state) => state.vrm)
    const vrmFileName = useStore((state) => state.vrmFileName)
    const isVRM1 = useStore((state) => state.isVRM1)
    const setVrm = useStore((state) => state.setVrm)
    const setVrmFileName = useStore((state) => state.setVrmFileName)
    const selectedBoneName = useStore((state) => state.selectedBoneName)
    const setSelectedBone = useStore((state) => state.setSelectedBone)
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleFile = useCallback((file: File) => {
        if (!file.name.endsWith('.vrm')) {
            alert('Please upload a .vrm file')
            return
        }

        setLoading(true)
        const url = URL.createObjectURL(file)
        const loader = new GLTFLoader()
        loader.register((parser) => new VRMLoaderPlugin(parser))

        loader.load(
            url,
            (gltf: GLTF) => {
                const vrm = gltf.userData.vrm
                VRMUtils.removeUnnecessaryVertices(gltf.scene)
                VRMUtils.combineSkeletons(gltf.scene)
                VRMUtils.rotateVRM0(vrm)

                setVrm(vrm)
                setVrmFileName(file.name)
                setLoading(false)
            },
            (xhr: ProgressEvent) => {
                setProgress(100.0 * (xhr.loaded / xhr.total))
            },
            (error: unknown) => {
                console.error(error)
                setLoading(false)
                alert('Error loading VRM file')
            }
        )
    }, [setVrm, setVrmFileName])

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }

    const onDragOver = (e: React.DragEvent) => e.preventDefault()

    return (
        <div className="absolute top-4 left-4 flex items-start gap-3 z-10">
            {/* Upload Panel */}
            <div
                className="p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg w-64"
                onDrop={onDrop}
                onDragOver={onDragOver}
            >
                <h2 className="text-lg font-bold mb-2 text-gray-800">VRM Viewer</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept=".vrm"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <p className="text-sm text-gray-500">
                        {loading ? `Loading... ${Math.round(progress)}%` : 'Drag & Drop VRM or Click to Upload'}
                    </p>
                </div>
            </div>

            {/* Model Info + Selected Bone */}
            {vrm && (
                <div className="pt-2 text-xs">
                    <p className="text-gray-300 truncate max-w-40" title={vrmFileName || ''}>
                        📁 {vrmFileName || 'Unknown'}
                    </p>
                    <p className="text-gray-500">
                        VRM {isVRM1 ? '1.0' : '0.x'}
                    </p>
                    {selectedBoneName && (
                        <div className="mt-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                            <span className="text-blue-300 font-medium">{selectedBoneName}</span>
                            <button
                                onClick={() => setSelectedBone(null, null)}
                                className="text-gray-500 hover:text-white text-xs"
                                title="Clear selection"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
