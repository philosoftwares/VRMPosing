import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { VRMModel } from './VRMModel'
import { BoneGizmo } from './BoneGizmo'
import { BoneHelpers } from './BoneHelpers'
import { RotationGizmo } from './RotationGizmo'
import { useStore } from '../../store/useStore'

export const Scene = () => {
    const isDragging = useStore((state) => state.isDragging)
    const setSelectedBone = useStore((state) => state.setSelectedBone)

    return (
        <Canvas
            camera={{ position: [0, 1.5, 2], fov: 50 }}
            onPointerMissed={() => setSelectedBone(null, null)}
        >
            <color attach="background" args={['#1a1a1a']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[1, 1, 1]} intensity={1} />
            <Grid infiniteGrid sectionColor="#444" cellColor="#222" fadeDistance={20} />
            <OrbitControls
                makeDefault
                target={[0, 1, 0]}
                enabled={!isDragging}
                zoomSpeed={2}
                enableDamping={false}
            />
            <VRMModel />
            <BoneHelpers />
            <BoneGizmo />
            <RotationGizmo />
        </Canvas>
    )
}
