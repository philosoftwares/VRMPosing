import { Scene } from './components/canvas/Scene'
import { Upload } from './components/ui/Upload'
import { RotationPanel } from './components/ui/RotationPanel'
import { ResetAllPanel } from './components/ui/ResetAllPanel'
import { HistoryPanel } from './components/ui/HistoryPanel'

function App() {
    return (
        <div className="w-full h-screen bg-gray-900 overflow-hidden relative">
            <Upload />
            <HistoryPanel />
            <ResetAllPanel />
            <RotationPanel />
            <Scene />
        </div>
    )
}

export default App


