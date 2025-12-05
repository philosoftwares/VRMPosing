# Changelog

## 2025-12-05 - Session 2

### Performance Optimizations
- Removed all debug `console.log` statements (8 total across files)
- Optimized `useFrame` in BoneHelper to reuse Vector3 object
- Memoized bone collection with `useMemo` to avoid recalculation every render
- Reduced sphere geometry from 16×16 to 12×12 segments (~44% less faces)
- Fixed React hooks order violation in BoneHelpers

### Features
- **Root Bone Drag**: Drag on Root bone now moves model position (translation)
- **Reset Drag for Root**: Only resets position (0,0,0), not rotation
- **Bone Sphere Sizes**: Hand bones (0.015), Finger bones (0.006) for better selection

### Bug Fixes
- Fixed selection changing when releasing mouse after clicking bone sphere (100ms delay)
- Fixed hand bones overlapping with thumb metacarpal


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