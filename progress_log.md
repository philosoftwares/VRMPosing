# Progress Log

## Achieved Features (Stable State - 2025-12-05)

### Core Functionality
- [x] **VRM 1.0 Support**: Normalized bone rotations with proper propagation
- [x] **Bone Selection**: Priority for humanoid bones, click fix with 50ms delay
- [x] **Rotation Panel**: X/Y/Z sliders, Reset Rotation, Reset Drag buttons
- [x] **Bone Dragging**: IK-like rotation, Root bone translates model
- [x] **Root Bone**: Slider rotates `vrm.scene`, drag moves position

### Visuals
- [x] **Sphere Sizes**: Major (0.025), Hand (0.015), Minor (0.012), Finger (0.006)
- [x] **Sphere Segments**: 12×12 (optimized from 16×16)
- [x] **Colors**: Red (Major), Yellow (Minor), Blue (Selected/Dragging)
- [x] **Visibility**: Major bones + Fingers + Eyes + Root visible

### Performance Optimizations
- [x] Removed 8 debug `console.log` statements
- [x] Reuse `Vector3` in `useFrame` (reduce GC)
- [x] Memoized bone collection with `useMemo`
- [x] Reduced sphere polygon count (~44% less)
- [x] Global pointerup listener for reliable drag stop
- [x] `stopImmediatePropagation` to prevent OrbitControls conflict

### Bug Fixes
- [x] Selection stable on mouse release
- [x] Hand bones don't overlap thumb
- [x] Reset Drag for Root only resets position
- [x] Fixed React hooks order violation

### Known Minor Issues
- Occasional slight delay on viewport movement (acceptable)

---
*Last Updated: 2025-12-05 10:34*
