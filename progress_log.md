# Progress Log

## Achieved Features (Stable State - 2025-12-05)

### Core Functionality
- [x] **VRM 1.0 Support**: Normalized bone rotations with proper propagation
- [x] **Bone Selection**: Priority for humanoid bones, 30ms delay fix
- [x] **Rotation Panel**: Local & Global rotation sliders
- [x] **Bone Dragging**: IK-like rotation, Root bone translates model
- [x] **Root Bone**: Slider rotates `vrm.scene`, drag moves position

### Rotation Controls
- [x] **Local Rotation**: Spring-back sliders, rotate around bone's local axis
- [x] **Global Rotation**: World X/Y/Z sliders with spring-back behavior
- [x] **Euler Display**: Read-only X°/Y°/Z° display for reference
- [x] **Reset Buttons**: Reset Rotation, Reset Drag

### Visuals
- [x] **Sphere Sizes**: Major (0.025), Hand (0.015), Minor (0.012), Finger (0.006)
- [x] **Sphere Segments**: 12×12 (optimized)
- [x] **Colors**: Red (Major), Yellow (Minor), Blue (Selected/Dragging)
- [x] **Rotation Gizmo**: Shows local/global axis ring on slider hover

### Viewport Controls
- [x] **Zoom Speed**: 2x faster scroll zoom
- [x] **No Damping**: Viewport stops immediately on mouse release

### Performance Optimizations
- [x] Removed debug console.log statements
- [x] Reuse Vector3/Quaternion in drag calculations
- [x] Memoized bone collection with useMemo
- [x] Reduced sphere polygon count

---
*Last Updated: 2025-12-05 20:17*

