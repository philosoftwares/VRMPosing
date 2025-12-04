import { Scene } from './components/canvas/Scene'
import { Upload } from './components/ui/Upload'
import { RotationPanel } from './components/ui/RotationPanel'

function App() {
    return (
        <div className="w-full h-screen bg-gray-900 overflow-hidden relative">
            <Upload />
            <RotationPanel />
            <Scene />
        </div>
    )
}

export default App
