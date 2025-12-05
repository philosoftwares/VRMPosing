# VRMPosing Project Context

## Project Overview
VRM model posing tool built with React + Three.js + TypeScript.

## Tech Stack
- React 18 + Vite
- Three.js + React Three Fiber
- @pixiv/three-vrm (VRM 0.0 & 1.0 support)
- Zustand (state management)
- TailwindCSS

## Key Files

### State Management
- `src/store/useStore.ts` - Global state (vrm, selectedBone, initialSceneQuat, etc.)

### Components
- `src/components/canvas/VRMModel.tsx` - VRM model display & bone click detection
- `src/components/canvas/BoneHelpers.tsx` - Bone sphere helpers for selection
- `src/components/canvas/RotationGizmo.tsx` - Visual rotation ring gizmo
- `src/components/ui/RotationPanel.tsx` - Rotation sliders (local & global)
- `src/components/ui/Upload.tsx` - VRM file upload

### Scene
- `src/components/canvas/Scene.tsx` - Three.js canvas setup

## Architecture Notes

### VRM Version Detection
```typescript
const isVRM1 = vrm?.meta && 'metaVersion' in vrm.meta
```

### Root Bone Rotation (Important!)
- Root bone uses **relative rotation** from initial position
- `initialQuat` ref stores quaternion when bone is selected
- Slider values are delta: `finalQuat = initialQuat * deltaQuat`
- This prevents "jumping" issues with VRM 0.0

### Reset Behavior
- `initialSceneQuat` in store = rotation when VRM first loads
- Reset restores to this original state

## Known Issues / Quirks
- VRM 0.0 models may have different default orientations
- Gimbal lock can cause weird Euler values (±180° patterns)
- "J_Sec_L_Bust1/2" bones sometimes behave oddly with gizmo

## How to Continue Work
1. Run `npm run dev` to start dev server
2. Open http://localhost:5173
3. Load a VRM file to test
4. Check `changelog.md` for recent changes
5. Check `nextrequest.md` for pending tasks

## Commands
```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # Run ESLint
```
