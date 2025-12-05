# Progress Log

## Achieved Features (Stable State - 2025-12-06)

### Core Functionality
- [x] **VRM 0.0 & 1.0 Support**: Proper version detection and handling
- [x] **Bone Selection**: Priority for humanoid bones, 30ms delay fix
- [x] **Bone Dragging**: IK-like rotation, Root bone translates model
- [x] **Root Bone**: Slider rotates `vrm.scene`, drag moves position

### Rotation Panel (top-right)
- [x] **Local Rotation**: Spring-back sliders, rotate around bone's current local axis
- [x] **Global Rotation**: World-space rotation with parent quaternion compensation
- [x] **Euler Display**: Read-only X°/Y°/Z° display for reference
- [x] **Reset Buttons**: Reset Rotation, Reset Drag (per bone)
- [x] **Axis Gizmo**: Ring appears on hovered slider axis

### Drag Panel (bottom-left)
- [x] **LOCAL Drag**: X/Y/Z sliders move bone along local axes
- [x] **WORLD Drag**: X/Y/Z sliders move bone along world axes
- [x] **Absolute Offset**: No accumulation issues
- [x] **Axis Lines**: Arrow lines appear on hovered slider axis

### Reset All Panel (bottom-right)
- [x] **All (Keep Pos)**: Reset all + rotasi Root, tapi bukan posisi
- [x] **All (Keep Rot)**: Reset all + posisi Root, tapi bukan rotasi
- [x] **All (Keep Root)**: Reset semua bone kecuali Root
- [x] **All + Root**: Reset SEMUA termasuk Root

### Undo/Redo System
- [x] **Unlimited History**: All actions saved as snapshots
- [x] **Keyboard Shortcuts**: Ctrl+Z (undo), Ctrl+Y (redo)
- [x] **UI Buttons**: Icon above text, disabled state styling

### Visuals
- [x] **Bone Spheres**: Size-coded by bone type
- [x] **Colors**: Red (Major), Yellow (Minor), Blue (Selected)
- [x] **Rotation Gizmo**: Ring for rotation, lines for drag

### UI Layout
- [x] **Upload Panel**: Top-left with model info beside it
- [x] **Undo/Redo**: Below Upload panel
- [x] **Rotation Panel**: Top-right (scrollable)
- [x] **Drag Panel**: Bottom-left
- [x] **Reset All**: Bottom-right

---
*Last Updated: 2025-12-06 04:31*
