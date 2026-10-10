import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext.jsx';
import styles from './BackgroundScene3D.module.css';

const PALETTE = {
  light: {
    fog: 0xeef1f6,
    particle: 0x2dbe60,
    accent: 0x2dbe60,
    meshA: 0x7dd3a0,
    meshB: 0xa8e6c0,
    wire: 0x2dbe60,
  },
  dark: {
    fog: 0x0f1419,
    particle: 0x4ade80,
    accent: 0x2dbe60,
    meshA: 0x1e4d32,
    meshB: 0x2dbe60,
    wire: 0x86efac,
  },
};

function createFloatingShape(type, material) {
  let geometry;
  switch (type) {
    case 'torus':
      geometry = new THREE.TorusGeometry(1.1, 0.32, 16, 48);
      break;
    case 'octa':
      geometry = new THREE.OctahedronGeometry(1.15, 0);
      break;
    case 'ico':
      geometry = new THREE.IcosahedronGeometry(1, 1);
      break;
    default:
      geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  }
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}

export function BackgroundScene3D() {
  const mountRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const palette = isDark ? PALETTE.dark : PALETTE.light;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(palette.fog, 0.045);

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      120,
    );
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, isDark ? 0.55 : 0.85);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(palette.accent, isDark ? 1.1 : 0.65);
    keyLight.position.set(6, 8, 10);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(palette.wire, isDark ? 0.9 : 0.45, 40);
    fillLight.position.set(-8, -4, 6);
    scene.add(fillLight);

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: palette.meshA,
      metalness: 0.15,
      roughness: 0.35,
      transmission: isDark ? 0.35 : 0.25,
      transparent: true,
      opacity: isDark ? 0.75 : 0.55,
      wireframe: false,
    });

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: palette.wire,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.22 : 0.14,
    });

    const shapesGroup = new THREE.Group();
    const shapeConfigs = [
      { type: 'torus', pos: [-5.5, 1.2, -2], scale: 1.15, speed: 0.35 },
      { type: 'ico', pos: [5.8, -0.8, -3], scale: 1.05, speed: 0.28 },
      { type: 'octa', pos: [-3.2, -2.5, -1], scale: 0.85, speed: 0.42 },
      { type: 'torus', pos: [3.5, 2.8, -4], scale: 0.75, speed: 0.31 },
      { type: 'ico', pos: [0.5, -3.2, -2.5], scale: 0.65, speed: 0.38 },
    ];

    const floaters = shapeConfigs.map((cfg) => {
      const solid = createFloatingShape(cfg.type, glassMaterial);
      const wire = createFloatingShape(cfg.type, wireMaterial);
      solid.position.set(...cfg.pos);
      wire.position.copy(solid.position);
      solid.scale.setScalar(cfg.scale);
      wire.scale.copy(solid.scale);
      shapesGroup.add(solid);
      shapesGroup.add(wire);
      return { solid, wire, cfg };
    });

    scene.add(shapesGroup);

    const particleCount = reducedMotion ? 120 : 420;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 38;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 28 - 4;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: palette.particle,
      size: isDark ? 0.06 : 0.05,
      transparent: true,
      opacity: isDark ? 0.55 : 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const ringGeometry = new THREE.RingGeometry(6.5, 6.7, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: palette.accent,
      transparent: true,
      opacity: isDark ? 0.08 : 0.06,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2.4;
    ring.position.z = -8;
    scene.add(ring);

    let targetRotX = 0;
    let targetRotY = 0;
    let pointerX = 0;
    let pointerY = 0;

    const onPointerMove = (event) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const motion = reducedMotion ? 0 : 1;

      targetRotY += (pointerX * 0.35 - targetRotY) * 0.04;
      targetRotX += (pointerY * 0.22 - targetRotX) * 0.04;
      shapesGroup.rotation.y = t * 0.06 * motion + targetRotY;
      shapesGroup.rotation.x = targetRotX * 0.4;

      floaters.forEach(({ solid, wire, cfg }, index) => {
        const bob = Math.sin(t * cfg.speed + index) * 0.35 * motion;
        solid.position.y = cfg.pos[1] + bob;
        wire.position.y = solid.position.y;
        solid.rotation.x = t * 0.25 * cfg.speed * motion;
        solid.rotation.z = t * 0.18 * cfg.speed * motion;
        wire.rotation.copy(solid.rotation);
      });

      particles.rotation.y = t * 0.02 * motion;
      ring.rotation.z = t * 0.04 * motion;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);

      ringGeometry.dispose();
      ringMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      glassMaterial.dispose();
      wireMaterial.dispose();
      floaters.forEach(({ solid, wire }) => {
        solid.geometry.dispose();
        wire.geometry.dispose();
      });
      renderer.dispose();
    };
  }, [isDark]);

  return (
    <div className={styles.root} aria-hidden>
      <div ref={mountRef} className={styles.canvasHost} />
      <div className={styles.vignette} />
    </div>
  );
}
