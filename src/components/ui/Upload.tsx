import { useStore } from '../../store/useStore'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import { useCallback, useState } from 'react'

export const Upload = () => {
    const setVrm = useStore((state) => state.setVrm)
    const setVrmFileName = useStore((state) => state.setVrmFileName)
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
                console.log('VRM loaded', vrm)
                setLoading(false)
            },
            (xhr: ProgressEvent) => {
                setProgress(100.0 * (xhr.loaded / xhr.total))
                console.log('Loading...', 100.0 * (xhr.loaded / xhr.total), '%')
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
        <div
            className="absolute top-4 left-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg z-10 w-64"
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
    )
}
