import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const OROTINA_CENTER = [9.9112, -84.5239];
const POINT_COLORS = [0x178c83, 0xd85f4a, 0xd28a25, 0x477d9e];
const BLOCK_COLORS = [0xb7c8ab, 0xd9c6a5, 0xc4b9d0, 0xd8aaa0, 0x9bb9b1];

function getPointName(point, language) {
  if (language === 'en') return point.nombreEn ?? point.nombre;
  if (language === 'zh') return point.nombreZh ?? point.nombre;
  return point.nombre;
}

function addBox(scene, width, height, depth, x, y, z, color, materialOptions = {}) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color, roughness: 0.88, ...materialOptions }),
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function createLandmark(scene, point, index, position) {
  const group = new THREE.Group();
  const color = POINT_COLORS[index % POINT_COLORS.length];
  group.position.set(position.x, 0.02, position.z);
  group.userData.pointId = point.id;

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.2, 0.07, 24),
    new THREE.MeshStandardMaterial({ color: 0xfff9e9, roughness: 0.55 }),
  );
  base.position.y = 0.035;
  base.castShadow = true;
  group.add(base);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.065, 0.34, 16),
    new THREE.MeshStandardMaterial({ color, roughness: 0.48, metalness: 0.08 }),
  );
  stem.position.y = 0.22;
  stem.castShadow = true;
  group.add(stem);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 20, 16),
    new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.08, emissive: color, emissiveIntensity: 0.1 }),
  );
  head.position.y = 0.47;
  head.castShadow = true;
  group.add(head);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.018, 8, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.76 }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.075;
  group.add(ring);

  group.traverse((object) => {
    if (object.isMesh) object.userData.pointId = point.id;
  });
  scene.add(group);
  return { group, head, ring, color };
}

function addTown(scene) {
  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0xf8f1df, roughness: 1 });
  [-1.5, -0.65, 0.2, 1.05, 1.9].forEach((x) => {
    const road = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 4.4), roadMaterial);
    road.position.set(x, 0.012, 0.1);
    scene.add(road);
  });
  [-1.7, -0.85, 0, 0.85, 1.7].forEach((z) => {
    const road = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.025, 0.12), roadMaterial);
    road.position.set(0.05, 0.013, z);
    scene.add(road);
  });

  const blocks = [
    [-1.1, -1.25, 0.32, 0.2], [-0.2, -1.25, 0.25, 0.3], [0.7, -1.25, 0.38, 0.22], [1.5, -1.25, 0.28, 0.32],
    [-1.1, -0.4, 0.25, 0.3], [-0.2, -0.4, 0.38, 0.22], [0.7, -0.4, 0.26, 0.27], [1.5, -0.4, 0.35, 0.24],
    [-1.1, 0.45, 0.36, 0.22], [-0.2, 0.45, 0.26, 0.32], [0.7, 0.45, 0.34, 0.22], [1.5, 0.45, 0.25, 0.3],
    [-1.1, 1.3, 0.25, 0.26], [-0.2, 1.3, 0.38, 0.2], [0.7, 1.3, 0.25, 0.3], [1.5, 1.3, 0.35, 0.2],
  ];

  blocks.forEach(([x, z, width, depth], index) => {
    const height = 0.18 + (index % 4) * 0.055;
    addBox(scene, width, height, depth, x, height / 2 + 0.035, z, BLOCK_COLORS[index % BLOCK_COLORS.length]);
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.82, 0.025, depth * 0.82),
      new THREE.MeshStandardMaterial({ color: 0xf6ead3, roughness: 0.9 }),
    );
    roof.position.set(x, height + 0.05, z);
    scene.add(roof);
  });
}

function addRailway(scene, station) {
  const start = new THREE.Vector3(station.x, 0.055, station.z);
  const finish = new THREE.Vector3(0, 0.055, 0);
  const curve = new THREE.CatmullRomCurve3([
    start,
    new THREE.Vector3(station.x * 0.68, 0.055, station.z * 0.7),
    new THREE.Vector3(station.x * 0.34, 0.055, station.z * 0.38),
    finish,
  ]);
  const bed = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 36, 0.075, 8, false),
    new THREE.MeshStandardMaterial({ color: 0xb88957, roughness: 1 }),
  );
  scene.add(bed);

  const rails = [-0.065, 0.065].map((offset) => {
    const railPoints = curve.getPoints(36).map((point, index, allPoints) => {
      const tangent = curve.getTangent(index / (allPoints.length - 1));
      return new THREE.Vector3(point.x + tangent.z * offset, point.y + 0.035, point.z - tangent.x * offset);
    });
    const railCurve = new THREE.CatmullRomCurve3(railPoints);
    const rail = new THREE.Mesh(
      new THREE.TubeGeometry(railCurve, 36, 0.018, 6, false),
      new THREE.MeshStandardMaterial({ color: 0x5a6262, metalness: 0.5, roughness: 0.45 }),
    );
    scene.add(rail);
  });

  const ties = 30;
  for (let index = 0; index <= ties; index += 1) {
    const progress = index / ties;
    const position = curve.getPoint(progress);
    const tangent = curve.getTangent(progress);
    const tie = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.035, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x6c5143, roughness: 1 }),
    );
    tie.position.set(position.x, 0.035, position.z);
    tie.rotation.y = Math.atan2(tangent.x, tangent.z);
    scene.add(tie);
  }

  return rails;
}

function addPointLeader(scene, point) {
  const distance = Math.hypot(point.position.x - point.anchor.x, point.position.z - point.anchor.z);
  if (distance < 0.02) return;

  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(point.anchor.x, 0.045, point.anchor.z),
    new THREE.Vector3(point.position.x, 0.045, point.position.z),
  ]);
  const line = new THREE.Line(geometry, new THREE.LineDashedMaterial({
    color: 0x766d5c,
    dashSize: 0.11,
    gapSize: 0.06,
    transparent: true,
    opacity: 0.8,
  }));
  line.computeLineDistances();
  scene.add(line);
}

export default function OrotinaMap3D({ points, language, selectedPointId, onSelect, reducedMotion }) {
  const mountRef = useRef(null);
  const pointVisualsRef = useRef([]);
  const selectedPointRef = useRef(selectedPointId);
  const onSelectRef = useRef(onSelect);
  const [webglError, setWebglError] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const shouldReduceMotion = reducedMotion || systemReducedMotion;
  const pointName = language === 'en'
    ? '3D cultural map of Orotina. Drag to rotate, use the wheel or pinch to zoom, and use arrow keys to select points.'
    : language === 'zh'
      ? '奧羅蒂納文化 3D 地圖。拖曳以旋轉，使用滾輪或雙指縮放，使用方向鍵選擇地點。'
      : 'Mapa cultural 3D de Orotina. Arrastra para rotar, usa la rueda o pellizca para acercar y las flechas para elegir puntos.';
  const selectedPoint = points.find((point) => point.id === selectedPointId);

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!preference) return undefined;

    const updatePreference = (event) => setSystemReducedMotion(event.matches);
    setSystemReducedMotion(preference.matches);
    preference.addEventListener?.('change', updatePreference);
    return () => preference.removeEventListener?.('change', updatePreference);
  }, []);

  selectedPointRef.current = selectedPointId;
  onSelectRef.current = onSelect;

  const scenePoints = useMemo(() => {
    const centerLatitude = THREE.MathUtils.degToRad(OROTINA_CENTER[0]);
    const metersPerDegree = 111_320;
    const positioned = points.map((point) => ({
      point,
      east: (point.posicion[1] - OROTINA_CENTER[1]) * metersPerDegree * Math.cos(centerLatitude),
      north: (point.posicion[0] - OROTINA_CENTER[0]) * metersPerDegree,
    }));
    const span = Math.max(
      Math.max(...positioned.map(({ east }) => east)) - Math.min(...positioned.map(({ east }) => east)),
      Math.max(...positioned.map(({ north }) => north)) - Math.min(...positioned.map(({ north }) => north)),
      1,
    );
    const scale = 9 / span;
    const anchoredPoints = positioned.map(({ point, east, north }) => {
      const anchor = { x: east * scale, z: -north * scale };
      return { point, anchor, position: anchor };
    });
    const proximityLimit = 0.48;

    return anchoredPoints.map((entry) => {
      const nearbyPoints = anchoredPoints.filter((candidate) => (
        Math.hypot(candidate.anchor.x - entry.anchor.x, candidate.anchor.z - entry.anchor.z) < proximityLimit
      ));
      if (nearbyPoints.length < 2) return entry;

      const center = nearbyPoints.reduce((sum, candidate) => ({
        x: sum.x + candidate.anchor.x / nearbyPoints.length,
        z: sum.z + candidate.anchor.z / nearbyPoints.length,
      }), { x: 0, z: 0 });
      const positionInCluster = nearbyPoints.findIndex((candidate) => candidate.point.id === entry.point.id);
      const angle = -Math.PI / 2 + (positionInCluster / nearbyPoints.length) * Math.PI * 2;
      const radius = Math.max(0.74, nearbyPoints.length * 0.2);

      return {
        ...entry,
        position: {
          x: center.x + Math.cos(angle) * radius,
          z: center.z + Math.sin(angle) * radius,
        },
      };
    });
  }, [points]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    let controls;
    let frameId;
    let resizeObserver;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe7eee5);
    scene.fog = new THREE.Fog(0xe7eee5, 19, 36);

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    } catch {
      setWebglError(true);
      return undefined;
    }

    setWebglError(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'orotina-map-3d__canvas';
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', pointName);
    mount.appendChild(renderer.domElement);

    const width = Math.max(mount.clientWidth, 1);
    const height = Math.max(mount.clientHeight, 1);
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const minX = Math.min(...scenePoints.map(({ position }) => position.x));
    const maxX = Math.max(...scenePoints.map(({ position }) => position.x));
    const minZ = Math.min(...scenePoints.map(({ position }) => position.z));
    const maxZ = Math.max(...scenePoints.map(({ position }) => position.z));
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const mapWidth = Math.max(maxX - minX + 3.5, 10);
    const mapDepth = Math.max(maxZ - minZ + 3.5, 7);

    camera.position.set(centerX + 1.5, 10.5, centerZ + 12.5);
    camera.lookAt(centerX, 0, centerZ);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(centerX, 0, centerZ);
    controls.enableDamping = !shouldReduceMotion;
    controls.dampingFactor = 0.075;
    controls.enablePan = true;
    controls.minDistance = 7;
    controls.maxDistance = 25;
    controls.minPolarAngle = 0.18;
    controls.maxPolarAngle = 1.25;
    controls.rotateSpeed = 0.55;
    controls.update();

    scene.add(new THREE.HemisphereLight(0xffffff, 0x66735b, 2.2));
    const sunlight = new THREE.DirectionalLight(0xfff1d5, 3.2);
    sunlight.position.set(centerX + 4, 12, centerZ + 7);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(1024, 1024);
    scene.add(sunlight);

    const boardCenterX = centerX;
    const boardCenterZ = centerZ;
    addBox(scene, mapWidth, 0.32, mapDepth, boardCenterX, -0.2, boardCenterZ, 0xcab99d);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(mapWidth - 0.16, mapDepth - 0.16),
      new THREE.MeshStandardMaterial({ color: 0xe4eadb, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(boardCenterX, -0.035, boardCenterZ);
    ground.receiveShadow = true;
    scene.add(ground);

    for (let index = 0; index < 18; index += 1) {
      const x = boardCenterX - mapWidth / 2 + ((index * 37) % 97) / 97 * mapWidth;
      const z = boardCenterZ - mapDepth / 2 + ((index * 53) % 89) / 89 * mapDepth;
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.055, 0.22, 7),
        new THREE.MeshStandardMaterial({ color: 0x89684d, roughness: 1 }),
      );
      trunk.position.y = 0.1;
      tree.add(trunk);
      const crown = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.18 + (index % 3) * 0.025, 1),
        new THREE.MeshStandardMaterial({ color: index % 2 ? 0x6f9b72 : 0x82a77c, roughness: 0.9 }),
      );
      crown.position.y = 0.3;
      crown.castShadow = true;
      tree.add(crown);
      tree.position.set(x, 0, z);
      scene.add(tree);
    }

    addTown(scene);
    const station = scenePoints.find(({ point }) => point.id === points.at(-1)?.id)?.position ?? scenePoints[0].position;
    addRailway(scene, station);

    scenePoints.forEach((point) => addPointLeader(scene, point));
    pointVisualsRef.current = scenePoints.map(({ point, position }, index) => createLandmark(scene, point, index, position));

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerStart = null;
    const pointGroups = pointVisualsRef.current.map(({ group }) => group);

    const handlePointerDown = (event) => {
      pointerStart = { x: event.clientX, y: event.clientY };
    };
    const handlePointerUp = (event) => {
      if (!pointerStart || Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) {
        pointerStart = null;
        return;
      }
      pointerStart = null;
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pointGroups, true)[0]?.object;
      const pointId = hit?.userData.pointId ?? hit?.parent?.userData.pointId;
      if (pointId) onSelectRef.current(pointId);
    };
    const handleKeyDown = (event) => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      const currentIndex = scenePoints.findIndex(({ point }) => point.id === selectedPointRef.current);
      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = (currentIndex + direction + scenePoints.length) % scenePoints.length;
      onSelectRef.current(scenePoints[nextIndex].point.id);
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('keydown', handleKeyDown);

    const resize = () => {
      const nextWidth = Math.max(mount.clientWidth, 1);
      const nextHeight = Math.max(mount.clientHeight, 1);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight, false);
      renderer.render(scene, camera);
    };
    const renderOnControlChange = () => renderer.render(scene, camera);
    controls.addEventListener('change', renderOnControlChange);
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const animate = (time) => {
      frameId = window.requestAnimationFrame(animate);
      controls.update();
      if (!shouldReduceMotion) {
        pointVisualsRef.current.forEach(({ head, ring, group }) => {
          const active = group.userData.pointId === selectedPointRef.current;
          ring.scale.setScalar(active ? 1.2 + Math.sin(time * 0.0024) * 0.1 : 1);
          head.position.y = active ? 0.47 + Math.sin(time * 0.0024) * 0.025 : 0.47;
        });
      }
      renderer.render(scene, camera);
    };
    if (shouldReduceMotion) renderer.render(scene, camera);
    else frameId = window.requestAnimationFrame(animate);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      controls.removeEventListener('change', renderOnControlChange);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('keydown', handleKeyDown);
      controls.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
      pointVisualsRef.current = [];
    };
  }, [language, pointName, points, reducedMotion, scenePoints, shouldReduceMotion]);

  useEffect(() => {
    pointVisualsRef.current.forEach(({ group, head, ring, color }) => {
      const active = group.userData.pointId === selectedPointId;
      group.scale.setScalar(active ? 1.08 : 1);
      ring.material.color.setHex(active ? 0x312342 : color);
      ring.material.opacity = active ? 0.95 : 0.58;
      head.material.emissiveIntensity = active ? 0.42 : 0.1;
      head.material.needsUpdate = true;
    });
  }, [selectedPointId]);

  const failureText = language === 'en'
    ? '3D view is not available in this browser.'
    : language === 'zh'
      ? '此瀏覽器無法使用 3D 檢視。'
      : 'La vista 3D no está disponible en este navegador.';

  return (
    <div ref={mountRef} className="relative h-full min-h-80 w-full overflow-hidden bg-[#e7eee5]">
      {selectedPoint && (
        <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[min(20rem,calc(100%-2rem))] rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-jade-700">
            {language === 'en' ? 'Selected point' : language === 'zh' ? '已選地點' : 'Punto seleccionado'}
          </p>
          <p className="mt-0.5 text-sm font-semibold leading-snug text-ink-900">{getPointName(selectedPoint, language)}</p>
        </div>
      )}
      {webglError && (
        <div role="alert" className="absolute inset-0 z-20 grid place-items-center bg-ink-100 p-6 text-center text-sm font-medium text-ink-800">
          {failureText}
        </div>
      )}
    </div>
  );
}
