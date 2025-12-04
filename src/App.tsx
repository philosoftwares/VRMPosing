import { Scene } from './components/canvas/Scene'
import { Upload } from './components/ui/Upload'
import { BoneIndicator } from './components/ui/BoneIndicator'

function App() {
    return (
        <div className="w-full h-screen bg-gray-900 overflow-hidden relative">
            <Upload />
            <BoneIndicator />
            <Scene />
        </div>
    )
}

export default App
