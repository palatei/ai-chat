import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext.jsx';
import styles from './ChatBackground3D.module.css';

const PALETTE = {
  light: {
    fog: 0xf4f6f9,
    particle: 0x2dbe60,
    wire: 0x2dbe60,
    glow: 0xa8e6c0,
  },
  dark: {
    fog: 0x242f3f,
    particle: 0x4ade80,
    wire: 0x86efac,
    glow: 0x1e4d32,
  },
};

export function ChatBackground3D() {
  const hostRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const palette = isDark ? PALETTE.dark : PALETTE.light;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(palette.fog, 0.12);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 40);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = styles.canvas;
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const wireMat = new THREE.MeshBasicMaterial({
      color: palette.wire,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.2 : 0.12,
    });

    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 1), wireMat);
    ico.position.set(-1.8, 0.6, -1);
    group.add(ico);

    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.28, 12, 36), wireMat.clone());
    torus.position.set(2.1, -0.9, -1.5);
    group.add(torus);

    const glowMat = new THREE.MeshBasicMaterial({
      color: palette.glow,
      transparent: true,
      opacity: isDark ? 0.35 : 0.2,
    });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), glowMat);
    orb.position.set(0.4, 1.4, -2);
    group.add(orb);

    const particleCount = reducedMotion ? 48 : 140;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: palette.particle,
      size: 0.055,
      transparent: true,
      opacity: isDark ? 0.45 : 0.28,
      depthWrite: false,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width < 1 || height < 1) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const clock = new THREE.Clock();
    let frameId = 0;
    const motion = reducedMotion ? 0 : 1;

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      group.rotation.y = t * 0.14 * motion;
      group.rotation.x = Math.sin(t * 0.35) * 0.12 * motion;
      ico.rotation.z = t * 0.25 * motion;
      torus.rotation.x = t * 0.32 * motion;
      orb.position.y = 1.4 + Math.sin(t * 0.9) * 0.25 * motion;
      particles.rotation.y = t * 0.05 * motion;

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      host.removeChild(renderer.domElement);
      ico.geometry.dispose();
      torus.geometry.dispose();
      orb.geometry.dispose();
      wireMat.dispose();
      torus.material.dispose();
      glowMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, [isDark]);

  return (
    <div className={styles.root} aria-hidden>
      <div ref={hostRef} className={styles.host} />
      <div className={styles.scrim} />
    </div>
  );
}
