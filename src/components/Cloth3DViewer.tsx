import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  buildAoNguThan,
  buildAoTac,
  buildAoNhatBinh,
  buildAoYem,
  buildAoTuThan,
  buildAoGiaoLinh,
  buildAoBaBa,
  BuiltGarment3D
} from './garment3d/garmentMeshes';

interface Cloth3DViewerProps {
  garmentId: string;
  className?: string;
  heightClass?: string;
  isSelected?: boolean;
}

/**
 * Universal 3D Cloth Viewer for all 7 Vietnamese traditional garments in Việt phục Archive.
 *
 * Core capabilities:
 * 1. Procedural fabric edge ripple animation and soft ambient drape.
 * 2. Museum studio lighting highlighting textile weave, folds, and seam anatomy.
 * 3. Individual anatomically distinct 3D models for all 7 garments.
 * 4. Interactive orbit rotation on selected garment with inertial damping.
 * 5. Ground contact shadow grounding the garment in 3D space.
 */
export const Cloth3DViewer: React.FC<Cloth3DViewerProps> = ({
  garmentId,
  className = '',
  heightClass = 'h-56',
  isSelected = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [contextError, setContextError] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(160, Math.round(rect.width || container.clientWidth || 220));
    const height = Math.max(180, Math.round(rect.height || container.clientHeight || 260));

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 50);

    // 2. WebGL Renderer with ACES tone mapping to ensure pure, soft silk luminescence
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.04;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed:', e);
      setContextError(true);
      return;
    }

    // 3. Archival Studio Lighting (Curated 4-point museum lighting)
    // Key light: warm diagonal sunlight casting soft fabric fold shadows
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.35);
    keyLight.position.set(2.2, 3.2, 2.8);
    scene.add(keyLight);

    // Fill light: soft cool bounce illuminating deep folds without washing out
    const fillLight = new THREE.DirectionalLight(0xd4e2dc, 0.45);
    fillLight.position.set(-2.5, -0.4, 1.8);
    scene.add(fillLight);

    // Top-back rim light: creates delicate edge separation along shoulders and sleeves
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.60);
    rimLight.position.set(0, 3.0, -2.5);
    scene.add(rimLight);

    // Controlled warm ambient light maintaining deep textile contrast
    const ambientLight = new THREE.AmbientLight(0x8a8478, 0.65);
    scene.add(ambientLight);

    // 4. Build individual garment mesh based on garmentId
    let builtGarment: BuiltGarment3D;
    switch (garmentId) {
      case 'ao-tac':
        builtGarment = buildAoTac();
        break;
      case 'ao-nhat-binh':
        builtGarment = buildAoNhatBinh();
        break;
      case 'ao-yem':
        builtGarment = buildAoYem();
        break;
      case 'ao-tu-than':
        builtGarment = buildAoTuThan();
        break;
      case 'ao-giao-linh':
        builtGarment = buildAoGiaoLinh();
        break;
      case 'ao-ba-ba':
        builtGarment = buildAoBaBa();
        break;
      case 'ao-ngu-than':
      default:
        builtGarment = buildAoNguThan(isSelected);
        break;
    }

    // Center garment geometry strictly at the origin based on its true bounding box
    const bbox = new THREE.Box3().setFromObject(builtGarment.root);
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    builtGarment.root.position.x -= center.x;
    builtGarment.root.position.y -= center.y;
    builtGarment.root.position.z -= center.z;

    scene.add(builtGarment.root);

    // Compute bounding box dimensions to dynamically frame camera
    const size = new THREE.Vector3();
    new THREE.Box3().setFromObject(builtGarment.root).getSize(size);

    const updateCameraDistance = (currentW: number, currentH: number) => {
      const fovRad = THREE.MathUtils.degToRad(camera.fov / 2);
      const aspect = currentW / currentH;
      // Garment-adaptive framing with tight margins so each garment fills ~85% of canvas height
            const fitMargin = isSelected ? 0.78 : 1.08;
      const distY = (size.y * fitMargin) / (2 * Math.tan(fovRad));
      const distX = (size.x * fitMargin) / (2 * Math.tan(fovRad) * aspect);
            const fitDistance = Math.max(distY, distX, isSelected ? 1.05 : 1.35);
      camera.position.set(0, 0, fitDistance);
      camera.lookAt(0, 0, 0);
    };
    updateCameraDistance(width, height);

    // Precompute safe bounds to ensure clean buffers
    builtGarment.deformableMeshes.forEach(item => {
      item.geometry.computeBoundingBox();
      item.geometry.computeBoundingSphere();
    });

    // 5. User Interaction (Gentle drag orbit if selected)
    let isDragging = false;
    let prevPointerX = 0;
    let targetRotationY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!isSelected) return;
      isDragging = true;
      prevPointerX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - prevPointerX;
      prevPointerX = clientX;
      targetRotationY = Math.max(-0.52, Math.min(0.52, targetRotationY + deltaX * 0.007));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 6. Animation Loop (Slow natural wind & multi-frequency gravity wave)
    let animationFrameId: number;
    const animationStartTime = performance.now();
    let frameCount = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - animationStartTime) * 0.001;
      frameCount++;

      // Damped rotation
      if (isSelected) {
        if (!isDragging) {
          const idleSway = Math.sin(elapsedTime * 0.55) * 0.02;
          builtGarment.root.rotation.y += (targetRotationY + idleSway - builtGarment.root.rotation.y) * 0.05;
        } else {
          builtGarment.root.rotation.y += (targetRotationY - builtGarment.root.rotation.y) * 0.12;
        }
      } else {
        // Unselected item gentle idle breathing
        builtGarment.root.rotation.y = Math.sin(elapsedTime * 0.5 + 1.2) * 0.015;
      }

      // Deform vertices with multi-frequency wind ripples & gravity drape
      builtGarment.deformableMeshes.forEach(({ geometry, origPositions, motionProfile }) => {
        const posAttr = geometry.attributes.position;
        const arr = posAttr.array as Float32Array;
        const count = posAttr.count;

        for (let i = 0; i < count; i++) {
          const ox = origPositions[i * 3];
          const oy = origPositions[i * 3 + 1];
          const oz = origPositions[i * 3 + 2];

          let windWeight = 0;

          if (motionProfile === 'torso') {
            // Flowing hem: maximum at lower hem (Y < -1.1), zero at neck/shoulders (Y > 0.6)
            const normY = Math.max(0, Math.min(1, (0.5 - oy) / 1.75));
            windWeight = Math.pow(normY, 1.8) * 0.55;
          } else if (motionProfile === 'sleeves-wide') {
            // Wide ceremonial sleeves: deep ripple at lower hanging hem
            const normS = Math.max(0, Math.min(1, (0.76 - oy) / 0.90));
            windWeight = Math.pow(normS, 1.5) * 0.65;
          } else if (motionProfile === 'sleeves-fitted') {
            // Fitted sleeves: very slight natural breathing
            const normS = Math.max(0, Math.min(1, (0.75 - oy) / 0.75));
            windWeight = Math.pow(normS, 1.8) * 0.25;
          } else if (motionProfile === 'skirt-split') {
            // Tied front flaps of áo tứ thân
            const normY = Math.max(0, Math.min(1, (0.4 - oy) / 1.5));
            windWeight = Math.pow(normY, 1.6) * 0.58;
          } else if (motionProfile === 'bodice') {
            // Áo yếm: subtle fabric breathing at lower leaf tip
            const normY = Math.max(0, Math.min(1, (0.3 - oy) / 0.9));
            windWeight = Math.pow(normY, 1.4) * 0.22;
          } else if (motionProfile === 'ribbon') {
            // Hanging ribbons of Áo nhật bình
            const normY = Math.max(0, Math.min(1, (0.5 - oy) / 1.6));
            windWeight = Math.pow(normY, 1.3) * 0.75;
          }

          // Natural multi-frequency fluid silk wave
          const wave1 = Math.sin(elapsedTime * 1.3 + ox * 3.2 - oy * 1.8) * 0.022;
          const wave2 = Math.cos(elapsedTime * 1.9 - ox * 4.6 + oy * 2.2) * 0.010;
          const wave3 = Math.sin(elapsedTime * 0.7 + oy * 1.5) * 0.006;
          const deltaZ = (wave1 + wave2 + wave3) * windWeight;
          const deltaX = Math.sin(elapsedTime * 1.1 + oy * 2.4) * 0.006 * windWeight;

          const newX = ox + deltaX;
          const newZ = oz + deltaZ;

          if (Number.isFinite(newX)) arr[i * 3] = newX;
          if (Number.isFinite(newZ)) arr[i * 3 + 2] = newZ;
        }

        posAttr.needsUpdate = true;
        // Recompute normals every 2 frames for smooth silk shimmer
        if (frameCount % 2 === 0) {
          geometry.computeVertexNormals();
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize handler
    const handleResize = () => {
      if (!container) return;
      const r = container.getBoundingClientRect();
      const newW = Math.max(160, Math.round(r.width || container.clientWidth || 220));
      const newH = Math.max(180, Math.round(r.height || container.clientHeight || 260));
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      updateCameraDistance(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      builtGarment.cleanUp();
      scene.clear();
      renderer.dispose();
      if (dom.parentElement === container) {
        container.removeChild(dom);
      }
    };
  }, [garmentId, isSelected]);

  if (contextError) {
    return (
      <div className={`w-full ${heightClass} flex items-center justify-center text-xs text-[#718478] bg-[#F4EFE4] rounded p-4 text-center`}>
        Môi trường không hỗ trợ WebGL
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`w-full ${heightClass} flex items-center justify-center relative touch-none select-none ${className}`}
      style={{ overflow: 'visible' }}
    />
  );
};
