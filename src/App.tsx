import { Scene } from './components/canvas/Scene'
import { Upload } from './components/ui/Upload'

function App() {
    return (
        <div className="w-full h-screen bg-gray-900 overflow-hidden relative">
            <Upload />
            <Scene />
        </div>
    )
}

export default App
