# Changelog

## 2025-12-06 - Session 8

### New Feature: Drag Position Panel
- **DragPanel.tsx**: New separate panel at bottom-left
- **LOCAL Drag**: X/Y/Z sliders move bone along its local axes (orange theme)
- **WORLD Drag**: X/Y/Z sliders move bone along world axes (yellow theme)
- **Absolute Offset**: Fixed accumulation issue - slider now uses absolute offset from initial position
- **Root Bone**: Translates `vrm.scene.position` directly

### Axis Visualization on Hover
- **Rotation Sliders**: Show ring gizmo on hovered axis
- **Drag Sliders**: Show line with arrows on hovered axis
- **Color Coded**: Red=X, Green=Y, Blue=Z

### UI Layout Reorganization
- **Upload Panel**: Top-left with model info beside it (no box)
- **Undo/Redo Panel**: Below Upload, buttons with icon above text
- **Rotation Panel**: Top-right (scrollable)
- **Drag Panel**: Bottom-left
- **Reset All Panel**: Bottom-right
- **Camera Panel**: Next to Reset All (horizontal layout)

### Camera Panel
- **Focus**: Pan to center on model, keeps current viewing angle, default distance
- **Reset Position**: Reset to default distance, keep viewing angle
- **Reset Rotation**: Orbit to front view (+Z), keep distance
- **Reset All**: Reset position and rotation to defaults

### Eye Direction Panel (Hidden)
- **EyePanel.tsx**: Hidden for now, functions preserved
- **Horizontal Slider**: Control eye yaw (±90°)
- **Vertical Slider**: Control eye pitch (±90°)
- **Undo/Redo Support**: Eye direction saved in snapshot, syncs with history

### Camera Panel (Unified)
- **CameraPanel.tsx**: Merged CameraResetPanel + CameraInfoPanel into single component
- **Reset Buttons**: Focus, Reset Pos, Reset Rot, Reset All (at bottom)
- **Position (X, Y, Z)**: Editable camera coordinates
- **Orbit (Azimuth, Elevation, Distance)**: Editable spherical coordinates

### Bone Mirroring
- **Mirror Button**: In RotationPanel, copies single bone to opposite side
- **Mirror All Button**: In ResetAllPanel, copies ALL bones from selected side (L→R or R→L)
  - Only visible when Left/Right bone is selected
- **Swap L↔R Button**: In ResetAllPanel, exchanges all Left↔Right bones bidirectionally
- **60+ Bone Pairs**: Arms, legs, fingers, eyes fully mapped
- **Quaternion X-flip**: Proper mirroring with Y/Z negation

### Bug Fixes
- **VRM Version Detection**: Fixed to check `metaVersion === '1'` specifically
- **DragPanel Close Button**: Added close button like RotationPanel
- **Eye Reset on Load**: Eye direction resets when loading new model
- **Hips Bone Drag**: Now translates model like Root instead of rotating parent
- **Bone Sphere Sync**: Added `updateMatrixWorld(true)` to keep spheres synced during drag
- **Hips LOCAL Drag**: Uses Hips bone world quaternion for proper local orientation

### UI Layout Improvements
- **Selected Bone Label**: Moved to Upload panel below model info
- **Rotation Panel**: Removed section headers, slider labels now "Local X/Y/Z" and "World X/Y/Z"
- **Drag Panel**: Same slider label format, simplified header to "DRAG"
- **Camera Panel**: Two-row layout with X/Y/Z and Az/El/Dist aligned vertically
- **Reset All Panel**: Flex layout with equal-width buttons, simplified labels

---

## 2025-12-05 - Session 7

### Undo/Redo System
- **HistoryPanel**: New component with Undo/Redo buttons and keyboard shortcuts (Ctrl+Z/Y)
- **Snapshot System**: Captures all bone rotations and root position/rotation
- **History Counter**: Shows action count (0/0 initially, increments per action)

### Bug Fixes
- **Fixed**: Reset Rotation and Reset Drag buttons now save to history
- **Fixed**: Duplicate snapshot on bone drag (was counting 2 for 1 drag)
- **Fixed**: Corrupted BoneHelpers.tsx from interrupted edit

---

## 2025-12-05 - Session 6

### Reset All Panel
- **ResetAllPanel.tsx**: New component with 4 reset variants
- **Layout**: Positioned at bottom-left (now bottom-right)

---

## 2025-12-05 - Session 5

### Local Rotation Slider Fix
- Changed from Euler angle sliders to incremental local-axis rotation
- Spring-back to 0 on release
- 3x sensitivity for responsive control

### World Rotation Fix
- Proper world-space rotation with parent quaternion compensation

---

## 2025-12-05 - Session 4

### VRM 0.0 Root Bone Fixes
- Relative rotation from initial position
- Reset restores to original VRM rotation
- Gizmo positions correctly at model origin

---

## 2025-12-05 - Session 3
- Global Rotation Sliders with spring-back

## 2025-12-05 - Session 2  
- Performance optimizations, viewport controls

## 2025-12-05 - Session 1
- Initial VRM 1.0 support, bone controls