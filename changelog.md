# Changelog

## 2025-12-05 - Session 7

### Undo/Redo System
- **HistoryPanel**: New component with Undo/Redo buttons and keyboard shortcuts (Ctrl+Z/Y)
- **Snapshot System**: Captures all bone rotations and root position/rotation
- **History Counter**: Shows action count (0/0 initially, increments per action)

### Bug Fixes
- **Fixed**: Reset Rotation and Reset Drag buttons now save to history
- **Fixed**: Duplicate snapshot on bone drag (was counting 2 for 1 drag)
- **Fixed**: Corrupted BoneHelpers.tsx from interrupted edit

### Files Changed
- `useStore.ts`: Added history state, saveSnapshot, undo, redo, canUndo, canRedo
- `HistoryPanel.tsx`: New component for undo/redo UI
- `BoneHelpers.tsx`: Fixed global pointer handler, single saveSnapshot on drag end
- `RotationPanel.tsx`: Added saveSnapshot to reset buttons

## 2025-12-05 - Session 6

### Reset All Buttons
- **New Component**: `ResetAllPanel.tsx` - separate panel for reset all functions
- **4 Reset Buttons**:
  - `All (Keep Pos)` - Reset all bones + rotasi Root, tapi bukan posisi
  - `All (Keep Rot)` - Reset all bones + posisi Root, tapi bukan rotasi
  - `All (Keep Root)` - Reset semua bone kecuali Root
  - `All + Root` - Reset SEMUA termasuk Root (warna merah)
- **VRM 0.0 Fix**: Reset root rotation now properly resets Hips bone

### UI Layout Changes
- **ResetAllPanel**: Positioned at bottom-left
- **RotationPanel**: Moved to bottom-right

### Technical Changes
- `ResetAllPanel.tsx`: New component with VRM version detection
- `App.tsx`: Added ResetAllPanel import
- `RotationPanel.tsx`: Moved to right side, removed duplicate reset all code


## 2025-12-05 - Session 5

### Local Rotation Slider Fix
- **Issue**: Local X/Y/Z sliders didn't match gizmo visual after rotating other axes
- **Fix**: Changed from Euler angle sliders to incremental local-axis rotation
  - Sliders now rotate around bone's **current local axis** (matches gizmo ring)
  - Spring-back to 0 on release (like global sliders)
  - 3x sensitivity for responsive control
  - Uses `quaternion.multiply()` for local-space rotation

### World Rotation Fix
- **Issue**: World rotation didn't follow gizmo ring path for bones with parents
- **Fix**: Proper world-space rotation with parent quaternion compensation
  - Get world quaternion → apply world delta → convert back to local
  - Rotation now exactly follows the fixed world gizmo ring

### UI Changes
- **Euler Display**: Read-only display showing current X/Y/Z Euler angles
- **Local Sliders**: Changed from absolute (-180° to 180°) to relative (-15 to 15)

### Technical Changes
- `RotationPanel.tsx`:
  - Added `handleLocalRotationChange()` using `quaternion.multiply(deltaQuat)`
  - Fixed `handleGlobalRotationChange()` with proper world→local conversion
  - Added `eulerDisplay` state for read-only angle display
  - Added `localSlider` state with spring-back behavior


## 2025-12-05 - Session 4

### VRM 0.0 Root Bone Fixes
- **Relative Rotation System**: Root bone now uses relative rotation from initial position
  - Stores initial quaternion when Root bone is selected
  - Slider values represent delta from initial position (no jumping)
  - Fixes the "model snaps backward" issue when starting to rotate

- **Reset Rotation Fix**: Now restores to original VRM rotation
  - Added `initialSceneQuat` to global store
  - Saves VRM scene quaternion when model loads
  - Reset button restores to this original state

- **Rotation Gizmo for Root**: 
  - Gizmo now correctly positions at model origin for Root bone
  - Proper orientation for both local and global rotation modes

### Technical Changes
- `useStore.ts`: Added `initialSceneQuat` and `setInitialSceneQuat`
- `VRMModel.tsx`: Saves initial scene quaternion on VRM load
- `RotationPanel.tsx`: 
  - Refactored Root bone rotation to use relative quaternion math
  - `handleRotationChange`: Uses `initialQuat * deltaQuat` for Root
  - `handleGlobalRotationChange`: Updates `initialQuat` after world rotation
  - `resetRotation`: Restores to `initialSceneQuat` for Root/Hips


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