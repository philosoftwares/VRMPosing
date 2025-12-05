# Progress Log

## Achieved Features (Stable State - 2025-12-05)

### Core Functionality
- [x] **VRM 1.0 Support**: Normalized bone rotations with proper propagation
- [x] **Bone Selection**: Priority for humanoid bones, 30ms delay fix
- [x] **Rotation Panel**: Local & Global rotation sliders (bottom-right)
- [x] **Bone Dragging**: IK-like rotation, Root bone translates model
- [x] **Root Bone**: Slider rotates `vrm.scene`, drag moves position

### Rotation Controls
- [x] **Local Rotation**: Spring-back sliders, rotate around bone's current local axis
- [x] **Global Rotation**: World-space rotation with parent quaternion compensation
- [x] **Euler Display**: Read-only X°/Y°/Z° display for reference
- [x] **Reset Buttons**: Reset Rotation, Reset Drag (per bone)

### Reset All Panel (bottom-left)
- [x] **All (Keep Pos)**: Reset all + rotasi Root, tapi bukan posisi
- [x] **All (Keep Rot)**: Reset all + posisi Root, tapi bukan rotasi
- [x] **All (Keep Root)**: Reset semua bone kecuali Root
- [x] **All + Root**: Reset SEMUA termasuk Root

### Visuals
- [x] **Sphere Sizes**: Major (0.025), Hand (0.015), Minor (0.012), Finger (0.006)
- [x] **Sphere Segments**: 12×12 (optimized)
- [x] **Colors**: Red (Major), Yellow (Minor), Blue (Selected/Dragging)
- [x] **Rotation Gizmo**: Local follows bone, Global fixed in world space

### Viewport Controls
- [x] **Zoom Speed**: 2x faster scroll zoom
- [x] **No Damping**: Viewport stops immediately on mouse release

### Undo/Redo System
- [x] **Unlimited History**: All actions saved as snapshots
- [x] **Keyboard Shortcuts**: Ctrl+Z (undo), Ctrl+Y (redo)
- [x] **UI Buttons**: Undo/Redo buttons with disabled state
- [x] **Action Counter**: Shows 0/0 initially, increments per action

### Performance Optimizations
- [x] Removed debug console.log statements
- [x] Reuse Vector3/Quaternion in drag calculations
- [x] Memoized bone collection with useMemo
- [x] Reduced sphere polygon count

---
*Last Updated: 2025-12-05 21:55*
