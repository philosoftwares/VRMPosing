Web VRM Posing App - Implementation Plan (v1.0)
Goal
Create a web-based application to upload and view VRM models. v1.0 Scope: Upload and View only. Posing and Export are deferred.

User Review Required
Scope Change: Focusing on VRM Upload/View for v1.0.
Proposed Changes
Project Structure
src/components/canvas: Contains the 3D scene and VRM logic.
src/components/ui: Contains the upload interface.
src/store: Zustand store for managing the loaded model.
Core Features
1. Project Setup
Initialize Vite project.
Configure TailwindCSS.
Install three, @pixiv/three-vrm, @react-three/fiber, @react-three/drei, leva, zustand.
2. VRM Loading
Use GLTFLoader with VRMLoaderPlugin to load .vrm files.
Handle drag-and-drop or file input.
Validation: Ensure the file is a valid VRM.
3. UI
Upload Screen: Simple drag & drop area or button.
Viewer: Fullscreen 3D canvas.
Verification Plan
Manual Verification
Load Model: Drag and drop a VRM file.
View: Ensure model appears and can be rotated/zoomed (OrbitControls).