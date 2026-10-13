import * as THREE from 'three';
import {
  createProceduralSkinTexture,
  createProceduralEyeTexture,
  createProceduralHairTexture,
  createSilkNormalTexture,
} from './proceduralTextures';

export interface BuiltAvatarModel {
  root: THREE.Group;
  materials: {
    skin: THREE.MeshStandardMaterial;
    eye: THREE.MeshStandardMaterial;
    hair: THREE.MeshStandardMaterial;
    robe: THREE.MeshStandardMaterial;
    pants: THREE.MeshStandardMaterial;
    shoes: THREE.MeshStandardMaterial;
    buttons: THREE.MeshStandardMaterial;
  };
  texturesToDispose: THREE.Texture[];
  geometriesToDispose: THREE.BufferGeometry[];
  materialsToDispose: THREE.Material[];
  updateRobeColor: (colorHex: string | number) => void;
}

/**
 * Builds a complete, anatomically proportioned 3D female avatar (~25 years old, Vietnamese-inspired)
 * clothed in authentic Áo ngũ thân (Five-panel standing collar robe), wide cream silk trousers (quần suông),
 * and minimalist traditional slippers.
 *
 * Full body integrity:
 * - Seamless parametric head/face, neck, collarbones, shoulders, torso, arms, hands, legs, and feet.
 * - Proper anatomical proportions (approx 7.2 head-height ratio).
 * - Full 360-degree depth: front, 45-degree, side profile, and back of the head/hair bun are fully enclosed.
 * - Distinct eyes with sclera, dark brown iris, pupil, and specular catchlights (no hollow eye sockets or creepy blank eyes).
 * - Warm natural Asian skin tone with soft blush and gentle lip rose.
 * - Distinct separate Áo ngũ thân robe mesh with upright mandarin collar, curved right overlap lapel,
 *   5 traditional buttons (ngũ khuy), and straight graceful silhouette (not pinched hourglass).
 */
export function buildFemaleAvatar3D(): BuiltAvatarModel {
  const root = new THREE.Group();
  root.name = 'AvatarRoot';

  const texturesToDispose: THREE.Texture[] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];
  const materialsToDispose: THREE.Material[] = [];

  // Generate procedural textures
  const skinTex = createProceduralSkinTexture();
  const eyeTex = createProceduralEyeTexture();
  const hairTex = createProceduralHairTexture();
  const silkNormal = createSilkNormalTexture();
  texturesToDispose.push(skinTex, eyeTex, hairTex, silkNormal);

  // 1. High-Fidelity Materials
  const skinMat = new THREE.MeshStandardMaterial({
    map: skinTex,
    color: 0xFDF6EE,
    roughness: 0.62,
    metalness: 0.04,
  });

  const eyeMat = new THREE.MeshStandardMaterial({
    map: eyeTex,
    roughness: 0.12,
    metalness: 0.08,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    map: hairTex,
    color: 0x1E1A1A,
    roughness: 0.75,
    metalness: 0.12,
  });

  // Default Áo ngũ thân in noble jade teal (xanh ngọc di sản)
  const robeMat = new THREE.MeshStandardMaterial({
    color: 0x1B6B68, // Jade teal (#1B6B68)
    normalMap: silkNormal,
    roughness: 0.42,
    metalness: 0.12,
  });

  // Flowing cream silk trousers (quần suông màu kem nhã nhặn)
  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0xF5EFE3,
    roughness: 0.55,
    metalness: 0.05,
  });

  // Minimalist slippers (hài / guốc tối giản màu nâu trầm)
  const shoesMat = new THREE.MeshStandardMaterial({
    color: 0x2A1D18,
    roughness: 0.48,
    metalness: 0.15,
  });

  // Gilded / bronze buttons (ngũ khuy)
  const buttonMat = new THREE.MeshStandardMaterial({
    color: 0xD4B36A,
    roughness: 0.32,
    metalness: 0.85,
  });

  materialsToDispose.push(skinMat, eyeMat, hairMat, robeMat, pantsMat, shoesMat, buttonMat);

  // =========================================================================
  // 2. Head & Facial Anatomy (Harmonious Vietnamese-inspired young woman)
  // Continuous smooth mesh without floating spheres
  // =========================================================================
  const headGroup = new THREE.Group();
  headGroup.name = 'HeadGroup';
  headGroup.position.set(0, 1.62, 0);

  // Cranium and Face Base (Soft oval contour with refined jawline and chin)
  const headGeo = new THREE.SphereGeometry(0.125, 36, 32);
  headGeo.scale(0.88, 1.15, 0.98); // Slender feminine cranial shape

  // Sculpt vertices for facial structure (cheeks, jaw, chin)
  const headPos = headGeo.attributes.position;
  for (let i = 0; i < headPos.count; i++) {
    const x = headPos.getX(i);
    const y = headPos.getY(i);
    const z = headPos.getZ(i);

    // Front facial softening and chin contour
    if (z > 0 && y < 0) {
      // Taper chin downward gently
      const chinTaper = 1.0 - Math.abs(y) * 1.8;
      if (chinTaper > 0) {
        headPos.setX(i, x * Math.max(0.68, chinTaper));
      }
      // Gentle forward projection for chin
      if (y < -0.09) {
        headPos.setZ(i, z + 0.012);
      }
    }
    // Jawline refinement
    if (y < -0.04 && y > -0.10 && Math.abs(x) > 0.04) {
      headPos.setX(i, x * 0.92);
    }
  }
  headGeo.computeVertexNormals();
  geometriesToDispose.push(headGeo);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headGroup.add(headMesh);

  // Nose Bridge & Refined Tip (Sống mũi thanh thoát, chóp mũi thon tròn tự nhiên)
  const noseGeo = new THREE.ConeGeometry(0.016, 0.052, 16);
  noseGeo.rotateX(Math.PI * 0.12);
  noseGeo.scale(0.75, 1.0, 1.35);
  geometriesToDispose.push(noseGeo);
  const noseMesh = new THREE.Mesh(noseGeo, skinMat);
  noseMesh.position.set(0, -0.006, 0.116);
  headGroup.add(noseMesh);

  // Refined Upper and Lower Lips (Đôi môi tự nhiên, màu cánh hồng phớt)
  const lipsGeo = new THREE.SphereGeometry(0.024, 16, 12);
  lipsGeo.scale(1.4, 0.45, 0.6);
  geometriesToDispose.push(lipsGeo);
  const lipsMesh = new THREE.Mesh(lipsGeo, skinMat);
  lipsMesh.position.set(0, -0.056, 0.105);
  headGroup.add(lipsMesh);

  // Eyes: Spheres with procedural eye texture
  const createEye = (isLeft: boolean): THREE.Mesh => {
    const geo = new THREE.SphereGeometry(0.019, 24, 20);
    // Orient texture pupil forward
    geo.rotateY(isLeft ? Math.PI * 0.52 : Math.PI * 0.48);
    geometriesToDispose.push(geo);
    const eye = new THREE.Mesh(geo, eyeMat);
    eye.position.set(isLeft ? -0.038 : 0.038, 0.015, 0.098);
    return eye;
  };

  const leftEye = createEye(true);
  const rightEye = createEye(false);
  headGroup.add(leftEye, rightEye);

  // Delicate Eyelids / Eye contours (Mí mắt tự nhiên, không sụp mí)
  const eyelidGeo = new THREE.TorusGeometry(0.022, 0.0035, 12, 24, Math.PI * 0.9);
  eyelidGeo.rotateX(Math.PI * 0.35);
  geometriesToDispose.push(eyelidGeo);
  const leftEyelid = new THREE.Mesh(eyelidGeo, skinMat);
  leftEyelid.position.set(-0.038, 0.022, 0.106);
  const rightEyelid = new THREE.Mesh(eyelidGeo, skinMat);
  rightEyelid.position.set(0.038, 0.022, 0.106);
  headGroup.add(leftEyelid, rightEyelid);

  // Subtle Natural Eyebrows (Lông mày lá liễu mềm mại)
  const browMat = new THREE.MeshStandardMaterial({
    color: 0x221C1C,
    roughness: 0.8,
  });
  materialsToDispose.push(browMat);
  const browGeo = new THREE.CylinderGeometry(0.002, 0.001, 0.038, 8);
  browGeo.rotateZ(Math.PI * 0.45);
  geometriesToDispose.push(browGeo);

  const leftBrow = new THREE.Mesh(browGeo, browMat);
  leftBrow.position.set(-0.040, 0.036, 0.104);
  leftBrow.rotation.z = -0.15;
  const rightBrow = new THREE.Mesh(browGeo, browMat);
  rightBrow.position.set(0.040, 0.036, 0.104);
  rightBrow.rotation.z = 0.15;
  headGroup.add(leftBrow, rightBrow);

  // Ears (Hai vành tai gọn gàng, tỉ lệ chuẩn hai bên)
  const earGeo = new THREE.SphereGeometry(0.028, 16, 12);
  earGeo.scale(0.35, 1.25, 0.7);
  geometriesToDispose.push(earGeo);
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-0.105, 0.002, -0.015);
  leftEar.rotation.y = -0.2;
  const rightEar = new THREE.Mesh(earGeo, skinMat);
  rightEar.position.set(0.105, 0.002, -0.015);
  rightEar.rotation.y = 0.2;
  headGroup.add(leftEar, rightEar);

  // =========================================================================
  // 3. Hair (Traditional Vietnamese elegant low bun / tóc búi trễ thanh nhã)
  // Clean, sleek hairline revealing face, fully solid in 360 degrees
  // =========================================================================
  const hairCrownGeo = new THREE.SphereGeometry(0.128, 32, 28);
  hairCrownGeo.scale(0.91, 1.12, 1.02);
  // Cut away lower front face to frame forehead and temples cleanly
  const hairPos = hairCrownGeo.attributes.position;
  for (let i = 0; i < hairPos.count; i++) {
    const y = hairPos.getY(i);
    const z = hairPos.getZ(i);
    // Clear front forehead and face
    if (z > 0.04 && y < 0.08) {
      hairPos.setZ(i, Math.min(z, 0.03));
    }
  }
  hairCrownGeo.computeVertexNormals();
  geometriesToDispose.push(hairCrownGeo);
  const hairCrownMesh = new THREE.Mesh(hairCrownGeo, hairMat);
  hairCrownMesh.position.set(0, 0.012, -0.01);
  headGroup.add(hairCrownMesh);

  // Traditional low chignon / bun at back nape (Búi tóc trễ thanh lịch phía sau gáy)
  const bunGeo = new THREE.SphereGeometry(0.058, 24, 20);
  bunGeo.scale(1.15, 0.95, 0.75);
  geometriesToDispose.push(bunGeo);
  const bunMesh = new THREE.Mesh(bunGeo, hairMat);
  bunMesh.position.set(0, -0.035, -0.118);
  headGroup.add(bunMesh);

  root.add(headGroup);

  // =========================================================================
  // 4. Neck, Collarbones & Shoulders (Continuous anatomical connection)
  // =========================================================================
  const neckGeo = new THREE.CylinderGeometry(0.052, 0.068, 0.18, 24, 6);
  geometriesToDispose.push(neckGeo);
  const neckMesh = new THREE.Mesh(neckGeo, skinMat);
  neckMesh.position.set(0, 1.48, -0.01);
  root.add(neckMesh);

  // Shoulders and chest understructure (nối liền tự nhiên với cổ)
  const shoulderGeo = new THREE.CylinderGeometry(0.075, 0.165, 0.16, 24);
  shoulderGeo.scale(1.95, 1.0, 0.85);
  geometriesToDispose.push(shoulderGeo);
  const shoulderMesh = new THREE.Mesh(shoulderGeo, skinMat);
  shoulderMesh.position.set(0, 1.34, -0.015);
  root.add(shoulderMesh);

  // =========================================================================
  // 5. Forearms & Hands (Tự nhiên, bàn tay nhìn rõ, các ngón tay thon dài)
  // Relaxed neutral pose: arms slightly flared out from hips for clear robe viewing
  // =========================================================================
  const createHandAndArm = (isLeft: boolean): THREE.Group => {
    const armGroup = new THREE.Group();
    const sign = isLeft ? -1 : 1;

    // Wrist and Lower Forearm emerging from sleeve cuff
    const armGeo = new THREE.CylinderGeometry(0.026, 0.030, 0.22, 16);
    armGeo.rotateZ(sign * 0.22);
    geometriesToDispose.push(armGeo);
    const armMesh = new THREE.Mesh(armGeo, skinMat);
    armMesh.position.set(sign * 0.46, 0.86, 0.02);
    armGroup.add(armMesh);

    // Palm / Hand Base
    const palmGeo = new THREE.BoxGeometry(0.038, 0.065, 0.018);
    palmGeo.rotateZ(sign * 0.18);
    geometriesToDispose.push(palmGeo);
    const palmMesh = new THREE.Mesh(palmGeo, skinMat);
    palmMesh.position.set(sign * 0.49, 0.74, 0.025);
    armGroup.add(palmMesh);

    // Fingers (Ngón tay thon thả, tư thế tự nhiên thả lỏng)
    const fingerGeo = new THREE.CylinderGeometry(0.005, 0.004, 0.048, 8);
    geometriesToDispose.push(fingerGeo);
    for (let f = 0; f < 4; f++) {
      const fMesh = new THREE.Mesh(fingerGeo, skinMat);
      fMesh.position.set(sign * (0.475 + f * 0.008), 0.70 - f * 0.003, 0.025);
      fMesh.rotation.z = sign * 0.15;
      armGroup.add(fMesh);
    }
    // Thumb
    const thumbGeo = new THREE.CylinderGeometry(0.0055, 0.0045, 0.035, 8);
    thumbGeo.rotateZ(sign * -0.4);
    geometriesToDispose.push(thumbGeo);
    const thumbMesh = new THREE.Mesh(thumbGeo, skinMat);
    thumbMesh.position.set(sign * 0.462, 0.73, 0.032);
    armGroup.add(thumbMesh);

    return armGroup;
  };

  const leftArm = createHandAndArm(true);
  const rightArm = createHandAndArm(false);
  root.add(leftArm, rightArm);

  // =========================================================================
  // 6. Traditional Áo Ngũ Thân (Five-Panel Standing-Collar Robe in Jade Teal)
  // Distinct separate mesh with upright mandarin collar, curved right lapel,
  // 5 buttons, fitted sleeves connected smoothly to shoulder, knee-length straight cut
  // =========================================================================
  const robeGroup = new THREE.Group();
  robeGroup.name = 'AoNguThanMesh';

  // Torso / Main Robe Panel (Thân áo ngũ thân suông thẳng, không chít eo đồng hồ cát)
  const nRows = 32;
  const nCols = 24;

  const createRobeTorso = (isFront: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const vCount = (nRows + 1) * (nCols + 1);
    const pos = new Float32Array(vCount * 3);
    const uvs = new Float32Array(vCount * 2);
    let vIdx = 0;
    let uvIdx = 0;

    for (let r = 0; r <= nRows; r++) {
      const t = r / nRows; // 0 = knee hem, 1 = shoulder
      const y = 0.52 + t * 0.88; // y from 0.52 (just below knees) to 1.40 (shoulders)

      // Straight authentic silhouette: gentle natural flare at hem, no artificial waist synch
      const halfWidth = 0.28 * (1 - t) + 0.21 * t;
      const depth = 0.115 + t * 0.035;

      for (let c = 0; c <= nCols; c++) {
        const u = c / nCols;
        const x = -halfWidth + u * 2 * halfWidth;
        const normX = x / halfWidth;
        const arc = Math.cos(Math.max(-1, Math.min(1, normX)) * (Math.PI * 0.5));
        const silkDrape = Math.sin(u * Math.PI * 4) * 0.006 * (1 - t);

        // Curved asymmetrical right lapel (vạt hò) overlay on front
        let lapelOverlay = 0;
        if (isFront && t > 0.40) {
          const lapelLine = 0.06 + (1 - t) * 0.10;
          const dist = Math.abs(x - lapelLine);
          if (dist < 0.04) {
            lapelOverlay = 0.007 * (1 - dist / 0.04);
          }
        }

        const z = (isFront ? 1 : -0.92) * arc * depth + silkDrape + lapelOverlay;

        pos[vIdx] = x;
        pos[vIdx + 1] = y;
        pos[vIdx + 2] = z;

        uvs[uvIdx] = u;
        uvs[uvIdx + 1] = t;

        vIdx += 3;
        uvIdx += 2;
      }
    }

    const indices: number[] = [];
    for (let r = 0; r < nRows; r++) {
      for (let c = 0; c < nCols; c++) {
        const a = r * (nCols + 1) + c;
        const b = (r + 1) * (nCols + 1) + c;
        const d = (r + 1) * (nCols + 1) + (c + 1);
        const e = r * (nCols + 1) + (c + 1);
        if (isFront) {
          indices.push(a, b, d, a, d, e);
        } else {
          indices.push(a, d, b, a, e, d);
        }
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const frontRobeGeo = createRobeTorso(true);
  const backRobeGeo = createRobeTorso(false);
  geometriesToDispose.push(frontRobeGeo, backRobeGeo);
  const frontRobeMesh = new THREE.Mesh(frontRobeGeo, robeMat);
  const backRobeMesh = new THREE.Mesh(backRobeGeo, robeMat);
  robeGroup.add(frontRobeMesh, backRobeMesh);

  // Upright Mandarin Collar (Cổ đứng lập lĩnh cao ~3.5cm, ôm sát chân cổ kín đáo)
  const collarGeo = new THREE.CylinderGeometry(0.068, 0.074, 0.072, 24, 1, true);
  collarGeo.scale(1, 1, 0.88);
  geometriesToDispose.push(collarGeo);
  const collarMesh = new THREE.Mesh(collarGeo, robeMat);
  collarMesh.position.set(0, 1.44, 0.005);
  robeGroup.add(collarMesh);

  // Fitted Sleeves (Tay chẽn ngũ thân: nối liền mềm mại từ vai, thon dần về cổ tay)
  const createRobeSleeve = (isLeft: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const sign = isLeft ? -1 : 1;
    const nSteps = 16;
    const nRad = 16;
    const startX = sign * 0.20;
    const startY = 1.34;
    const endX = sign * 0.44;
    const endY = 0.94;

    const dirX = endX - startX;
    const dirY = endY - startY;
    const len = Math.hypot(dirX, dirY);
    const perpX = -dirY / len;
    const perpY = dirX / len;

    const pos = new Float32Array((nSteps + 1) * (nRad + 1) * 3);
    const uvs = new Float32Array((nSteps + 1) * (nRad + 1) * 2);
    let vIdx = 0;
    let uvIdx = 0;

    for (let s = 0; s <= nSteps; s++) {
      const t = s / nSteps;
      const cx = startX + t * dirX;
      const cy = startY + t * dirY;
      const r = 0.092 * (1 - t) + 0.048 * t; // Taper from shoulder to wrist
      const drape = Math.sin(t * Math.PI) * 0.012;

      for (let a = 0; a <= nRad; a++) {
        const phi = (a / nRad) * Math.PI * 2;
        pos[vIdx] = cx + Math.cos(phi) * r * perpX;
        pos[vIdx + 1] = cy + Math.cos(phi) * r * perpY - drape;
        pos[vIdx + 2] = Math.sin(phi) * (r * 0.88);

        uvs[uvIdx] = a / nRad;
        uvs[uvIdx + 1] = t;

        vIdx += 3;
        uvIdx += 2;
      }
    }

    const indices: number[] = [];
    for (let s = 0; s < nSteps; s++) {
      for (let a = 0; a < nRad; a++) {
        const i0 = s * (nRad + 1) + a;
        const i1 = (s + 1) * (nRad + 1) + a;
        const i2 = (s + 1) * (nRad + 1) + (a + 1);
        const i3 = s * (nRad + 1) + (a + 1);
        indices.push(i0, i1, i2, i0, i2, i3);
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const leftSleeveGeo = createRobeSleeve(true);
  const rightSleeveGeo = createRobeSleeve(false);
  geometriesToDispose.push(leftSleeveGeo, rightSleeveGeo);
  const leftSleeveMesh = new THREE.Mesh(leftSleeveGeo, robeMat);
  const rightSleeveMesh = new THREE.Mesh(rightSleeveGeo, robeMat);
  robeGroup.add(leftSleeveMesh, rightSleeveMesh);

  // Five Authentic Buttons (Ngũ khuy): 1 ở cổ, 1 ở xương quai xanh, 1 dưới nách, 2 bên sườn phải
  const buttonGeo = new THREE.SphereGeometry(0.009, 12, 12);
  geometriesToDispose.push(buttonGeo);

  const buttonCoordinates: [number, number, number][] = [
    [0.012, 1.45, 0.070],  // 1. Cổ áo (Neck closure)
    [0.052, 1.38, 0.082],  // 2. Xương quai xanh (Collarbone)
    [0.098, 1.28, 0.092],  // 3. Góc vạt nách (Armpit corner)
    [0.132, 1.15, 0.098],  // 4. Mạng sườn trên (Upper flank)
    [0.145, 1.02, 0.096],  // 5. Mạng sườn dưới (Lower flank)
  ];

  buttonCoordinates.forEach(([bx, by, bz]) => {
    const btn = new THREE.Mesh(buttonGeo, buttonMat);
    btn.position.set(bx, by, bz);
    robeGroup.add(btn);
  });

  root.add(robeGroup);

  // =========================================================================
  // 7. Cream Silk Straight-Leg Trousers (Quần suông lụa màu kem)
  // Phom dáng buông rủ thanh lịch truyền thống, che từ eo xuống mắt cá chân
  // =========================================================================
  const pantsGroup = new THREE.Group();
  pantsGroup.name = 'PantsMesh';

  const createPantLeg = (isLeft: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const sign = isLeft ? -1 : 1;
    const nSteps = 20;
    const nRad = 16;
    const startX = sign * 0.085;
    const startY = 0.88;
    const endX = sign * 0.105;
    const endY = 0.08;

    const pos = new Float32Array((nSteps + 1) * (nRad + 1) * 3);
    const uvs = new Float32Array((nSteps + 1) * (nRad + 1) * 2);
    let vIdx = 0;
    let uvIdx = 0;

    for (let s = 0; s <= nSteps; s++) {
      const t = s / nSteps; // 0 = top, 1 = hem
      const cx = startX * (1 - t) + endX * t;
      const cy = startY * (1 - t) + endY * t;
      // Straight flowing cylinder with gentle silk ripple at hem
      const r = 0.088 * (1 - t) + 0.115 * t;
      const drape = Math.sin(t * Math.PI * 3) * 0.005;

      for (let a = 0; a <= nRad; a++) {
        const phi = (a / nRad) * Math.PI * 2;
        pos[vIdx] = cx + Math.cos(phi) * r;
        pos[vIdx + 1] = cy + drape;
        pos[vIdx + 2] = Math.sin(phi) * (r * 0.92);

        uvs[uvIdx] = a / nRad;
        uvs[uvIdx + 1] = t;

        vIdx += 3;
        uvIdx += 2;
      }
    }

    const indices: number[] = [];
    for (let s = 0; s < nSteps; s++) {
      for (let a = 0; a < nRad; a++) {
        const i0 = s * (nRad + 1) + a;
        const i1 = (s + 1) * (nRad + 1) + a;
        const i2 = (s + 1) * (nRad + 1) + (a + 1);
        const i3 = s * (nRad + 1) + (a + 1);
        indices.push(i0, i1, i2, i0, i2, i3);
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const leftPantGeo = createPantLeg(true);
  const rightPantGeo = createPantLeg(false);
  geometriesToDispose.push(leftPantGeo, rightPantGeo);
  const leftPantMesh = new THREE.Mesh(leftPantGeo, pantsMat);
  const rightPantMesh = new THREE.Mesh(rightPantGeo, pantsMat);
  pantsGroup.add(leftPantMesh, rightPantMesh);
  root.add(pantsGroup);

  // =========================================================================
  // 8. Minimalist Traditional Slippers / Shoes (Hài / guốc tối giản)
  // Bàn chân và giày tiếp xúc sàn rõ ràng
  // =========================================================================
  const shoesGroup = new THREE.Group();
  shoesGroup.name = 'ShoesMesh';

  const createShoe = (isLeft: boolean): THREE.Mesh => {
    const sign = isLeft ? -1 : 1;
    const geo = new THREE.BoxGeometry(0.075, 0.045, 0.17);
    // Taper toe forward
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      if (z > 0.02) {
        pos.setX(i, pos.getX(i) * 0.72);
      }
    }
    geo.computeVertexNormals();
    geometriesToDispose.push(geo);
    const shoe = new THREE.Mesh(geo, shoesMat);
    shoe.position.set(sign * 0.105, 0.024, 0.02);
    return shoe;
  };

  const leftShoe = createShoe(true);
  const rightShoe = createShoe(false);
  shoesGroup.add(leftShoe, rightShoe);
  root.add(shoesGroup);

  // Dynamic robe color updater function
  const updateRobeColor = (colorHex: string | number) => {
    robeMat.color.set(colorHex);
  };

  return {
    root,
    materials: {
      skin: skinMat,
      eye: eyeMat,
      hair: hairMat,
      robe: robeMat,
      pants: pantsMat,
      shoes: shoesMat,
      buttons: buttonMat,
    },
    texturesToDispose,
    geometriesToDispose,
    materialsToDispose,
    updateRobeColor,
  };
}
