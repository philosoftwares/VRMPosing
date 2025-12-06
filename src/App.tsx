import { Scene } from './components/canvas/Scene'
import { Upload } from './components/ui/Upload'
import { RotationPanel } from './components/ui/RotationPanel'
import { ResetAllPanel } from './components/ui/ResetAllPanel'
import { HistoryPanel } from './components/ui/HistoryPanel'
import { DragPanel } from './components/ui/DragPanel'
import { CameraResetPanel } from './components/ui/CameraResetPanel'
import { CameraInfoPanel } from './components/ui/CameraInfoPanel'
// import { EyePanel } from './components/ui/EyePanel' // Hidden for now

function App() {
    return (
        <div className="w-full h-screen bg-gray-900 overflow-hidden relative">
            <Upload />
            <HistoryPanel />
            <CameraInfoPanel />
            {/* <EyePanel /> */}
            <CameraResetPanel />
            <ResetAllPanel />
            <DragPanel />
            <RotationPanel />
            <Scene />
        </div>
    )
}

export default App
