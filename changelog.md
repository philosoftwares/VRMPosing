# Changelog

## 2025-12-05 - Session 2

### Performance Optimizations
- Removed all debug `console.log` statements (8 total)
- Optimized `useFrame` to reuse Vector3 object
- Memoized bone collection with `useMemo`
- Reduced sphere geometry from 16×16 to 12×12 segments

### Interaction Fixes
- Added global pointerup listener for reliable drag stop
- Added `stopImmediatePropagation` to prevent OrbitControls conflict
- Tuned drag release delay to 50ms for responsive viewport

### Features
- **Root Bone Drag**: Translates model position
- **Reset Drag for Root**: Only resets position, not rotation
- **Bone Sphere Sizes**: Hand (0.015), Finger (0.006) for better selection

### Bug Fixes
- Fixed selection changing on mouse release (delay mechanism)
- Fixed hand bones overlapping with thumb metacarpal
- Fixed React hooks order violation in BoneHelpers


## 2025-12-05 - Session 1

### Features
- VRM 1.0 support with normalized bone rotation
- Bone rotation slider controls (X, Y, Z)
- Bone drag with IK-like rotation
- Reset Rotation and Reset Drag buttons
- Bone sphere helpers (Major: red, Minor: yellow, Selected: blue)
- Visibility filtering (Major bones + Fingers + Eyes + Root)
- Click empty area to deselect bone

### Bug Fixes
- Fixed slider rotation not applying to VRM 1.0 models
- Fixed bust bone selection priority