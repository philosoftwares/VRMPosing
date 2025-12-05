# Progress Log

## Achieved Features (Stable State - 2025-12-05)

### Core Functionality
- [x] **VRM 1.0 Support**: Normalized bone rotations with proper propagation
- [x] **Bone Selection**: Priority for humanoid bones, 30ms delay fix
- [x] **Rotation Panel**: X/Y/Z sliders, Reset Rotation, Reset Drag buttons
- [x] **Bone Dragging**: IK-like rotation, Root bone translates model
- [x] **Root Bone**: Slider rotates `vrm.scene`, drag moves position

### Visuals
- [x] **Sphere Sizes**: Major (0.025), Hand (0.015), Minor (0.012), Finger (0.006)
- [x] **Sphere Segments**: 12×12 (optimized)
- [x] **Colors**: Red (Major), Yellow (Minor), Blue (Selected/Dragging)

### Viewport Controls
- [x] **Zoom Speed**: 2x faster scroll zoom
- [x] **No Damping**: Viewport stops immediately on mouse release
- [x] **OrbitControls**: Disabled during bone drag

### Performance Optimizations
- [x] Removed 8 debug `console.log` statements
- [x] Reuse Vector3/Quaternion in drag calculations
- [x] Memoized bone collection with `useMemo`
- [x] Reduced sphere polygon count (~44% less)
- [x] Global pointerup listener for reliable drag stop

### Bug Fixes
- [x] Selection stable on mouse release
- [x] Hand bones don't overlap thumb
- [x] Reset Drag for Root only resets position

---
*Last Updated: 2025-12-05 10:55*
