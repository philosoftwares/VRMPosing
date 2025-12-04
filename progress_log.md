# Progress Log

## Achieved Features (Current Stable State)

### Core Functionality
- [x] **VRM 1.0 Support**: Correctly handles VRM 1.0 normalized bone rotations while updating the underlying raw bones.
- [x] **Bone Selection**:
    - Implemented raycasting for bone selection.
    - **Priority Fix**: Prioritized "Humanoid Bones" (e.g., UpperChest) over secondary bones (e.g., Bust) to prevent accidental selection of overlapping bones.
- [x] **Rotation Panel**:
    - Slider controls for X, Y, Z rotation.
    - Real-time synchronization with selected bone.
- [x] **Bone Dragging**:
    - Dragging bone spheres updates the bone orientation/position.
    - Uses **Raw Bones** for direct mesh manipulation (fixing the issue where only spheres moved).
- [x] **Root Bone Rotation Fix**: Rotating 'hips' now also rotates the whole model scene.

### Visuals
- [x] **Bone Helpers**:
    - Renders spheres at bone locations.
    - Color coding: Red (Major), Yellow (Minor), Blue (Selected/Dragging).
    - **Selection State**: Fixed issue where selection color didn't update correctly when switching bones.
- [x] **Bone Visibility Filtering**:
    - Hide general minor bones (yellow spheres).
    - **Exception**: Keep Fingers and Eyes visible.
    - Bust bones are hidden by this filtering.

## Pending Implementation

- [ ] **Reset Drag Position**: Add button/mechanism to reset bone position after drag.

---
*Last Updated: 2025-12-05*
