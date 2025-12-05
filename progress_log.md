# Progress Log

## Achieved Features (Stable State - 2025-12-05)

### Core Functionality
- [x] **VRM 1.0 Support**: Handles normalized bone rotations with proper propagation to raw bones.
- [x] **Bone Selection**:
    - Raycasting for bone selection via model click.
    - Priority for humanoid bones over secondary bones.
    - 100ms delay prevents accidental re-selection on mouse release.
- [x] **Rotation Panel**:
    - X, Y, Z slider controls.
    - Real-time sync with selected bone.
    - Reset Rotation button.
    - Reset Drag button (position only for Root, quaternion for others).
- [x] **Bone Dragging**:
    - IK-like rotation drag on bone spheres.
    - **Root bone drag**: Moves model position (translation).
- [x] **Root Bone Rotation**: Slider rotation on 'Root' rotates `vrm.scene`.

### Visuals
- [x] **Bone Helpers**:
    - Sphere sizes: Major (0.025), Hand (0.015), Minor (0.012), Finger (0.006)
    - Sphere segments: 12×12 (optimized from 16×16)
    - Color: Red (Major), Yellow (Minor), Blue (Selected/Dragging)
- [x] **Visibility Filtering**:
    - Major bones + Fingers + Eyes + Root visible.
    - Bust and other secondary bones hidden.

### Performance Optimizations (2025-12-05)
- [x] Removed all debug `console.log` statements (8 total)
- [x] Reuse `Vector3` in `useFrame` to reduce garbage collection
- [x] Memoized bone collection with `useMemo`
- [x] Reduced sphere polygon count (16→12 segments, ~44% less faces)

### Bug Fixes
- [x] Selection doesn't change when releasing mouse after clicking sphere.
- [x] Hand bones don't overlap with thumb metacarpal.
- [x] Reset Drag for Root only resets position, not rotation.
- [x] Fixed React hooks order violation in BoneHelpers.

---
*Last Updated: 2025-12-05 09:46*
