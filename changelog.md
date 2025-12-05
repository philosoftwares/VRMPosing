# Changelog

## 2025-12-05 - Session 3

### Features
- **Global Rotation Sliders**: Added World X/Y/Z sliders for world-space rotation
  - Sliders follow mouse during drag
  - Spring-back to center (0) on release
  - 3x sensitivity multiplier for responsive control


## 2025-12-05 - Session 2

### Performance Optimizations
- Removed all debug `console.log` statements (8 total)
- Reuse Vector3/Quaternion in `handlePointerMove` via refs
- Memoized bone collection with `useMemo`
- Reduced sphere geometry from 16×16 to 12×12 segments

### Viewport Improvements
- Added `zoomSpeed={2}` for faster scroll zoom
- Disabled damping (`enableDamping={false}`) - no sliding effect
- Tuned drag release delay to 30ms

### Interaction Fixes
- Added global pointerup listener for reliable drag stop
- Added `stopImmediatePropagation` to prevent OrbitControls conflict

### Features
- **Root Bone Drag**: Translates model position
- **Reset Drag for Root**: Only resets position, not rotation
- **Bone Sphere Sizes**: Hand (0.015), Finger (0.006)


## 2025-12-05 - Session 1

### Features
- VRM 1.0 support with normalized bone rotation
- Bone rotation slider controls (X, Y, Z)
- Bone drag with IK-like rotation
- Reset Rotation and Reset Drag buttons
- Bone sphere helpers with color coding
- Click empty area to deselect bone