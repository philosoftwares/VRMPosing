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

### Visuals
- [x] **Bone Helpers**:
    - Renders spheres at bone locations.
    - Color coding: Red (Major), Yellow (Minor), Blue (Selected/Dragging).
    - **Selection State**: Fixed issue where selection color didn't update correctly when switching bones.

## Pending Re-implementation (Requested)

The following features were implemented but reverted to ensure a clean base. They will be re-implemented now:

1.  **Bone Visibility Filtering**:
    - Hide general minor bones (yellow spheres).
    - **Exception**: Keep Fingers and Eyes visible.
    - Explicitly hide Bust bones (`J_Sec_...`).
2.  **Visual Debugging**:
    - Add `AxesHelper` (X/Y/Z lines) to the selected bone to visualize local rotation axes.
3.  **Stability Fixes**:
    - **Scale Lock**: Enforce scale `(1, 1, 1)` during rotation to prevent "kembang kempis" (deflating) artifacts on secondary bones.
4.  **New Feature**:
    - **Reset Drag Position**: Functionality to reset the position/translation of a bone.

---
*Last Updated: 2025-12-05*
