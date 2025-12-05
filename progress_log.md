# Progress Log

## Achieved Features (Stable State - 2025-12-05)

### Core Functionality
- [x] **VRM 1.0 Support**: Handles normalized bone rotations with proper propagation to raw bones.
- [x] **Bone Selection**:
    - Raycasting for bone selection via model click.
    - **Priority Fix**: Humanoid bones prioritized over secondary bones (e.g., Bust).
    - **Click Fix**: 100ms delay prevents accidental re-selection on mouse release.
- [x] **Rotation Panel**:
    - X, Y, Z slider controls.
    - Real-time sync with selected bone.
    - Reset Rotation button.
    - Reset Drag button.
- [x] **Bone Dragging**: IK-like rotation drag on bone spheres.
- [x] **Root Bone Rotation**: Rotating 'Root' or 'hips' rotates the entire model.

### Visuals
- [x] **Bone Helpers**:
    - Sphere sizes: Major (0.025), Hand (0.015), Minor (0.012), Finger (0.006)
    - Color: Red (Major), Yellow (Minor), Blue (Selected/Dragging)
- [x] **Visibility Filtering**:
    - Major bones + Fingers + Eyes + Root visible.
    - Bust and other secondary bones hidden.

### Bug Fixes
- [x] Selection doesn't change when releasing mouse after clicking sphere.
- [x] Hand bones don't overlap with thumb metacarpal.

---
*Last Updated: 2025-12-05 08:11*
