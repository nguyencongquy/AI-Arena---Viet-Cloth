import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildFemaleAvatar3D, BuiltAvatarModel } from './avatarModel';
import {
  RotateCcw,
  Sun,
  Moon,
  Download,
  AlertCircle,
  Eye,
  Camera,
  Layers,
  Palette,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';

export type LightingMode = 'day' | 'night';
export type ViewAngle = 'front' | 'angle45' | 'side' | 'back' | 'closeup' | 'fullbody';

export interface GarmentColorOption {
  id: string;
  name: string;
  hex: string;
  description: string;
}

export const ROBE_COLOR_PRESETS: GarmentColorOption[] = [
  { id: 'jade-teal', name: 'Xanh ngọc bích', hex: '#1B6B68', description: 'Sắc ngọc di sản đài các quý phái' },
  { id: 'imperial-yellow', name: 'Vàng hoàng yến', hex: '#D4A017', description: 'Ánh lụa tơ tằm cung đình ấm áp' },
  { id: 'cinnabar-red', name: 'Đỏ chu sa', hex: '#9E2A2B', description: 'Màu cát tường hỷ sự truyền thống' },
  { id: 'indigo-blue', name: 'Xanh lam chàm', hex: '#264653', description: 'Sắc chàm trầm mặc thanh nhã' },
  { id: 'plum-violet', name: 'Tím hoa cà', hex: '#6B4C6A', description: 'Sắc tím xứ Huế mộng mơ tao nhã' },
  { id: 'pure-ivory', name: 'Trắng lụa mộc', hex: '#FAF7F0', description: 'Lụa tơ sống thanh khiết tự nhiên' },
];

export const AvatarLabApp: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [lightingMode, setLightingMode] = useState<LightingMode>('day');
  const [selectedColor, setSelectedColor] = useState<string>('#1B6B68');
  const [currentView, setCurrentView] = useState<ViewAngle>('front');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // References for Three.js instance
  const avatarInstanceRef = useRef<BuiltAvatarModel | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);

  // Switch camera viewpoints smoothly
  const applyCameraView = useCallback((view: ViewAngle) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    setCurrentView(view);

    switch (view) {
      case 'front':
        camera.position.set(0, 1.25, 2.55);
        controls.target.set(0, 1.05, 0);
        break;
      case 'angle45':
        camera.position.set(1.75, 1.30, 1.75);
        controls.target.set(0, 1.05, 0);
        break;
      case 'side':
        camera.position.set(2.45, 1.25, 0);
        controls.target.set(0, 1.05, 0);
        break;
      case 'back':
        camera.position.set(0, 1.25, -2.55);
        controls.target.set(0, 1.05, 0);
        break;
      case 'closeup':
        camera.position.set(0, 1.62, 0.68);
        controls.target.set(0, 1.58, 0.05);
        break;
      case 'fullbody':
        camera.position.set(0, 1.15, 3.25);
        controls.target.set(0, 0.95, 0);
        break;
    }
    controls.update();
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    setIsLoading(true);
    setErrorMessage(null);

    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number = 0;

    try {
      // 1. Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color(0xF5EFE3); // Cream studio gallery tone

      // 2. Camera
      const aspect = container.clientWidth / (container.clientHeight || 600);
      const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 20);
      camera.position.set(0, 1.25, 2.55);
      cameraRef.current = camera;

      // 3. Renderer with high color fidelity
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // 4. Controls
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 0.45; // allows close inspection of face without clipping
      controls.maxDistance = 5.5;  // prevents zooming out into the void
      controls.maxPolarAngle = Math.PI * 0.52; // slightly below floor level
      controls.target.set(0, 1.05, 0);
      controlsRef.current = controls;

      // 5. Lighting Setup (Soft Studio Key + Fill + Rim + Hemisphere)
      const ambient = new THREE.AmbientLight(0xFFF9F0, 0.75);
      scene.add(ambient);
      ambientLightRef.current = ambient;

      const hemi = new THREE.HemisphereLight(0xFFFFFF, 0xE0D4C3, 0.65);
      scene.add(hemi);
      hemiLightRef.current = hemi;

      // Key light at 45 degrees
      const dirLight = new THREE.DirectionalLight(0xFFFAF2, 1.2);
      dirLight.position.set(2.0, 3.2, 2.5);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.0001;
      scene.add(dirLight);
      dirLightRef.current = dirLight;

      // Fill light on opposite side
      const fillLight = new THREE.DirectionalLight(0xEAE2D5, 0.65);
      fillLight.position.set(-2.0, 2.0, 1.8);
      scene.add(fillLight);
      fillLightRef.current = fillLight;

      // Rim light for hair silhouette and shoulder separation
      const rimLight = new THREE.DirectionalLight(0xFFEEDD, 0.55);
      rimLight.position.set(0, 2.8, -2.5);
      scene.add(rimLight);
      rimLightRef.current = rimLight;

      // 6. Contact Shadow & Gallery Floor
      const floorGeo = new THREE.PlaneGeometry(12, 12);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0xEEE7DA,
        roughness: 0.85,
        metalness: 0.05,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = 0;
      floor.receiveShadow = true;
      scene.add(floor);
      floorMeshRef.current = floor;

      // Contact shadow disc under feet
      const discGeo = new THREE.CircleGeometry(0.55, 32);
      const discMat = new THREE.MeshBasicMaterial({
        color: 0x3A3228,
        transparent: true,
        opacity: 0.18,
      });
      const shadowDisc = new THREE.Mesh(discGeo, discMat);
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.y = 0.002;
      scene.add(shadowDisc);

      // 7. Build Model
      const avatar = buildFemaleAvatar3D();
      avatarInstanceRef.current = avatar;
      scene.add(avatar.root);

      setIsLoading(false);

      // Render loop
      const animate = () => {
        animId = requestAnimationFrame(animate);
        controls.update();
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };
      animate();

      // Window resize listener
      const handleResize = () => {
        if (!containerRef.current || !renderer || !camera) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight || 600;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        controls.dispose();

        // Clean up model geometries, textures, materials
        if (avatar) {
          avatar.texturesToDispose.forEach((t) => t.dispose());
          avatar.geometriesToDispose.forEach((g) => g.dispose());
          avatar.materialsToDispose.forEach((m) => m.dispose());
        }

        floorGeo.dispose();
        floorMat.dispose();
        discGeo.dispose();
        discMat.dispose();

        if (renderer) {
          renderer.dispose();
        }
      };
    } catch (err: any) {
      console.error('AvatarLab initialization error:', err);
      setErrorMessage(err.message || 'Lỗi khởi tạo WebGL 3D context.');
      setIsLoading(false);
    }
  }, []);

  // Lighting Mode effect
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (lightingMode === 'day') {
      // Warm Gallery Daylight
      scene.background = new THREE.Color(0xF5EFE3);
      if (ambientLightRef.current) {
        ambientLightRef.current.color.set(0xFFF9F0);
        ambientLightRef.current.intensity = 0.75;
      }
      if (hemiLightRef.current) {
        hemiLightRef.current.color.set(0xFFFFFF);
        hemiLightRef.current.groundColor.set(0xE0D4C3);
        hemiLightRef.current.intensity = 0.65;
      }
      if (dirLightRef.current) {
        dirLightRef.current.color.set(0xFFFAF2);
        dirLightRef.current.intensity = 1.2;
      }
      if (fillLightRef.current) {
        fillLightRef.current.color.set(0xEAE2D5);
        fillLightRef.current.intensity = 0.65;
      }
      if (rimLightRef.current) {
        rimLightRef.current.color.set(0xFFEEDD);
        rimLightRef.current.intensity = 0.55;
      }
      if (floorMeshRef.current) {
        (floorMeshRef.current.material as THREE.MeshStandardMaterial).color.set(0xEEE7DA);
      }
    } else {
      // Midnight Atelier Evening Light (Chế độ tối: vẫn nhìn rõ khuôn mặt và vật liệu nhờ đèn bảo tồn)
      scene.background = new THREE.Color(0x181C1D);
      if (ambientLightRef.current) {
        ambientLightRef.current.color.set(0x9BB0A8);
        ambientLightRef.current.intensity = 0.55;
      }
      if (hemiLightRef.current) {
        hemiLightRef.current.color.set(0xA7C4BC);
        hemiLightRef.current.groundColor.set(0x2A3230);
        hemiLightRef.current.intensity = 0.5;
      }
      if (dirLightRef.current) {
        dirLightRef.current.color.set(0xFDF5E6);
        dirLightRef.current.intensity = 1.05;
      }
      if (fillLightRef.current) {
        fillLightRef.current.color.set(0x65857C);
        fillLightRef.current.intensity = 0.55;
      }
      if (rimLightRef.current) {
        rimLightRef.current.color.set(0x8EE0D5);
        rimLightRef.current.intensity = 0.75;
      }
      if (floorMeshRef.current) {
        (floorMeshRef.current.material as THREE.MeshStandardMaterial).color.set(0x232929);
      }
    }
  }, [lightingMode]);

  // Robe Color Preset Change
  const handleColorChange = (hex: string) => {
    setSelectedColor(hex);
    if (avatarInstanceRef.current) {
      avatarInstanceRef.current.updateRobeColor(hex);
    }
  };

  // Export Real GLB
  const handleExportGLB = () => {
    if (!avatarInstanceRef.current) return;
    setIsExporting(true);
    setExportSuccess(null);

    const exporter = new GLTFExporter();
    exporter.parse(
      avatarInstanceRef.current.root,
      (gltf) => {
        const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `v-styler-female-avatar-ngu-than-${Date.now()}.glb`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setExportSuccess('File GLB đã được trích xuất thành công và tương thích chuẩn Khronos glTF 2.0.');
        setTimeout(() => setExportSuccess(null), 5000);
      },
      (error) => {
        console.error('GLTFExporter error:', error);
        setIsExporting(false);
        setErrorMessage('Không thể xuất GLB: ' + error.message);
      },
      { binary: true }
    );
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1C2421] font-body flex flex-col">
      {/* Top Header */}
      <header className="border-b border-[rgba(26,36,33,0.12)] bg-[#FAF7F0] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-xs font-ui text-[#4E6258] hover:text-[#11383A] flex items-center gap-1.5 transition-colors"
          >
            ← V-Styler Atelier Chính
          </a>
          <span className="text-[#A2B3AA] text-xs">|</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-ui font-semibold bg-[#11383A] text-[#F8F5EE]">
              AVATAR QUALITY LAB
            </span>
            <h1 className="text-base sm:text-lg font-serif font-medium text-[#11383A]">
              Thử Nghiệm Người Mẫu 3D Nữ (~25 Tuổi) · Áo Ngũ Thân
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Lighting toggle */}
          <div className="flex items-center bg-[#ECE5D8] p-1 rounded font-ui text-xs">
            <button
              onClick={() => setLightingMode('day')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                lightingMode === 'day'
                  ? 'bg-[#11383A] text-[#F8F5EE] shadow-xs'
                  : 'text-[#4A5D53] hover:text-[#11383A]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Ngày (Daylight)</span>
            </button>
            <button
              onClick={() => setLightingMode('night')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                lightingMode === 'night'
                  ? 'bg-[#11383A] text-[#F8F5EE] shadow-xs'
                  : 'text-[#4A5D53] hover:text-[#11383A]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Tối (Night/Atelier)</span>
            </button>
          </div>

          {/* Direct download for pre-verified GLB */}
          <a
            href="/v-styler-female-avatar.glb"
            download="v-styler-female-avatar.glb"
            className="px-3 py-1.5 bg-[#11383A] hover:bg-[#0c2a2b] text-[#F8F5EE] rounded text-xs font-ui flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Tải trực tiếp file GLB đã kiểm chứng (292 KB)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải GLB (292KB)</span>
          </a>

          {/* Direct download for Source Code ZIP */}
          <a
            href="/v-styler-source-code.zip"
            download="v-styler-source-code.zip"
            className="px-3 py-1.5 bg-[#FAF7F0] hover:bg-[#EAE3D4] text-[#11383A] border border-[rgba(26,36,33,0.18)] rounded text-xs font-ui flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Tải toàn bộ mã nguồn dự án file ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải ZIP Mã Nguồn</span>
          </a>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left 3D Viewport (8 Columns) */}
        <div ref={containerRef} className="lg:col-span-8 relative min-h-[520px] lg:min-h-full bg-[#EFE8DC]">
          <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-[#F5EFE3]/90 flex flex-col items-center justify-center gap-3 z-10">
              <div className="w-8 h-8 border-2 border-[#11383A] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-ui text-[#11383A]">Đang khởi tạo WebGL renderer và dựng khối người mẫu 3D...</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs flex items-start gap-2 z-10">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Lỗi hiển thị: </strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Export Success Notification */}
          {exportSuccess && (
            <div className="absolute top-4 left-4 right-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded text-xs flex items-center gap-2 z-10 shadow-md">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{exportSuccess}</span>
            </div>
          )}

          {/* Floating Viewpoint Controls Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#FAF7F0]/95 backdrop-blur-sm border border-[rgba(26,36,33,0.16)] px-2 py-1.5 rounded-md shadow-md flex items-center gap-1 z-10 max-w-[94%] overflow-x-auto">
            <span className="text-[11px] font-ui text-[#60766B] px-1 hidden sm:inline">Góc nhìn:</span>

            <button
              onClick={() => applyCameraView('front')}
              className={`px-2.5 py-1 text-xs font-ui rounded transition-colors cursor-pointer ${
                currentView === 'front'
                  ? 'bg-[#11383A] text-[#F8F5EE]'
                  : 'text-[#3E5247] hover:bg-[#ECE5D8]'
              }`}
            >
              Mặt trước
            </button>
            <button
              onClick={() => applyCameraView('angle45')}
              className={`px-2.5 py-1 text-xs font-ui rounded transition-colors cursor-pointer ${
                currentView === 'angle45'
                  ? 'bg-[#11383A] text-[#F8F5EE]'
                  : 'text-[#3E5247] hover:bg-[#ECE5D8]'
              }`}
            >
              Góc 45°
            </button>
            <button
              onClick={() => applyCameraView('side')}
              className={`px-2.5 py-1 text-xs font-ui rounded transition-colors cursor-pointer ${
                currentView === 'side'
                  ? 'bg-[#11383A] text-[#F8F5EE]'
                  : 'text-[#3E5247] hover:bg-[#ECE5D8]'
              }`}
            >
              Nhìn bên
            </button>
            <button
              onClick={() => applyCameraView('back')}
              className={`px-2.5 py-1 text-xs font-ui rounded transition-colors cursor-pointer ${
                currentView === 'back'
                  ? 'bg-[#11383A] text-[#F8F5EE]'
                  : 'text-[#3E5247] hover:bg-[#ECE5D8]'
              }`}
            >
              Mặt sau
            </button>
            <button
              onClick={() => applyCameraView('closeup')}
              className={`px-2.5 py-1 text-xs font-ui rounded transition-colors cursor-pointer font-medium ${
                currentView === 'closeup'
                  ? 'bg-[#11383A] text-[#F8F5EE]'
                  : 'text-[#3E5247] hover:bg-[#ECE5D8]'
              }`}
            >
              Cận mặt (Khuôn mặt & Mắt)
            </button>
            <button
              onClick={() => applyCameraView('fullbody')}
              className={`px-2.5 py-1 text-xs font-ui rounded transition-colors cursor-pointer ${
                currentView === 'fullbody'
                  ? 'bg-[#11383A] text-[#F8F5EE]'
                  : 'text-[#3E5247] hover:bg-[#ECE5D8]'
              }`}
            >
              Toàn thân
            </button>
            <button
              onClick={() => applyCameraView('front')}
              className="p-1 text-[#3E5247] hover:text-[#11383A] rounded hover:bg-[#ECE5D8] transition-colors cursor-pointer ml-1"
              title="Đặt lại góc nhìn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Hint */}
          <div className="absolute top-4 left-4 bg-black/40 text-white text-[11px] font-ui px-2.5 py-1 rounded pointer-events-none">
            Chuột trái kéo xoay 360° · Cuộn chuột zoom · Chuột phải di chuyển
          </div>
        </div>

        {/* Right Inspection & Control Panel (4 Columns) */}
        <div className="lg:col-span-4 bg-[#FAF7F0] border-l border-[rgba(26,36,33,0.12)] p-5 overflow-y-auto space-y-6">
          {/* Garment Color Swatches */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 border-b border-[rgba(26,36,33,0.08)] pb-1.5 font-ui">
              <Palette className="w-4 h-4 text-[#11383A]" />
              <h2 className="text-xs font-semibold text-[#11383A]">
                Vòng Chọn Màu Áo Ngũ Thân
              </h2>
            </div>
            <p className="text-[11px] text-[#55695E] leading-relaxed">
              Chỉ thay đổi vật liệu lụa của áo ngũ thân. Màu da, tóc, mắt, quần kem và giày được bảo toàn nguyên trạng để kiểm chứng độ tách lớp.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {ROBE_COLOR_PRESETS.map((color) => {
                const isSelected = selectedColor === color.hex;
                return (
                  <button
                    key={color.id}
                    onClick={() => handleColorChange(color.hex)}
                    className={`p-2 rounded border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#11383A] ring-1 ring-[#11383A] bg-white shadow-xs'
                        : 'border-[rgba(26,36,33,0.1)] hover:border-[#11383A] bg-[#FCFAF6]'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-[rgba(0,0,0,0.15)] shadow-xs shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-ui font-medium text-[#11383A] truncate">
                        {color.name}
                      </div>
                      <div className="text-[9px] text-[#718478] truncate">
                        {color.hex}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality Checklist & Inspection Results */}
          <div className="space-y-3 border-t border-[rgba(26,36,33,0.08)] pt-4">
            <div className="flex items-center gap-1.5 font-ui">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <h2 className="text-xs font-semibold text-[#11383A]">
                Bảng Tiêu Chuẩn Thẩm Định Thị Giác
              </h2>
            </div>

            <div className="space-y-2 text-xs font-ui">
              <div className="p-2.5 bg-white rounded border border-[rgba(26,36,33,0.08)] space-y-1">
                <span className="font-medium text-[#11383A] block">1. Cận Mặt & Mắt (Không kinh dị)</span>
                <p className="text-[11px] text-[#516358] font-body leading-relaxed">
                  Lòng trắng ngà tự nhiên, tròng đen nâu sẫm hổ phách (East Asian iris), đồng tử đen tròn và điểm phản quang catchlight rõ rệt. Đôi môi ửng hồng phớt nhẹ, đường viền mũi thanh thoát.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded border border-[rgba(26,36,33,0.08)] space-y-1">
                <span className="font-medium text-[#11383A] block">2. Chiều Sâu 360° & Gáy</span>
                <p className="text-[11px] text-[#516358] font-body leading-relaxed">
                  Không mất nửa mặt hoặc hở gáy khi xoay nhìn từ bên hoặc sau. Búi tóc trễ (low chignon) đặc trưng ôm sát gáy, tai và cổ kết nối mượt mà không phân mảnh.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded border border-[rgba(26,36,33,0.08)] space-y-1">
                <span className="font-medium text-[#11383A] block">3. Áo Ngũ Thân & Phom Dáng</span>
                <p className="text-[11px] text-[#516358] font-body leading-relaxed">
                  Áo ngũ thân là mesh riêng: cổ đứng lập lĩnh, vạt hò cài 5 nút ngũ khuy sang phải. Thân áo suông truyền thống (không siết eo thành đồng hồ cát), tay chẽn nối liền với vai không có khe hở nách.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded border border-[rgba(26,36,33,0.08)] space-y-1">
                <span className="font-medium text-[#11383A] block">4. Tỉ Lệ Toàn Thân & Chân Thực</span>
                <p className="text-[11px] text-[#516358] font-body leading-relaxed">
                  Tỷ lệ 7.2 đầu/chiều cao chuẩn nữ 25 tuổi. Cổ tay thon lộ bàn tay có ngón tay tự nhiên, quần lụa suông màu kem che xuống mắt cá, hài tối giản tiếp xúc sàn vững chắc.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Environment & Transparency */}
          <div className="border-t border-[rgba(26,36,33,0.08)] pt-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-ui font-semibold text-[#765D39]">
              <Info className="w-3.5 h-3.5" />
              <span>Báo Cáo Môi Trường & Giới Hạn Kỹ Thuật</span>
            </div>

            <ul className="text-[11px] text-[#5C7165] font-body space-y-1.5 leading-relaxed bg-[#F3ECE0] p-3 rounded border border-[rgba(26,36,33,0.08)]">
              <li>
                <strong>Tài nguyên có sẵn:</strong> Không tìm thấy thư mục <code className="text-[#11383A] font-mono">public/studio3d/female.json</code> trong dự án AI Studio hiện tại.
              </li>
              <li>
                <strong>Giải pháp tạo dựng:</strong> Xây dựng parametric continuous mesh bằng Three.js procedurally với vật liệu MeshStandardMaterial, map texture da, mắt, tóc chân thực tạo từ Canvas 2D độ nét cao (sRGBColorSpace).
              </li>
              <li>
                <strong>Bảo toàn ứng dụng:</strong> Toàn bộ mã thử nghiệm nằm cô lập trong <code className="text-[#11383A] font-mono">avatar-lab.html</code> và <code className="text-[#11383A] font-mono">src/avatar-lab/</code>, không can thiệp <code className="text-[#11383A] font-mono">App.tsx</code> hay dữ liệu gốc.
              </li>
              <li>
                <strong>Tính trung thực:</strong> Không tự nhận photorealistic 100 điểm. Đây là bản thử nghiệm giải phẫu và tỉ lệ đạt chuẩn phục vụ bước đánh giá mắt nhìn tiếp theo của Atelier.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
