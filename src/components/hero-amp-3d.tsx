'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type PointerState = {
  x: number;
  y: number;
};

function createStarShape(outer = 0.05, inner = 0.022) {
  const shape = new THREE.Shape();
  const points = 10;

  for (let i = 0; i <= points; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i / points) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }

  shape.closePath();
  return shape;
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function drawStar(context: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  context.beginPath();
  for (let i = 0; i <= 10; i += 1) {
    const r = i % 2 === 0 ? radius : radius * 0.45;
    const angle = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.closePath();
  context.fill();
}

function drawFallback(canvas: HTMLCanvasElement, pointer: PointerState, reducedMotion: boolean) {
  const context = canvas.getContext('2d');
  if (!context) return () => {};

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  let raf = 0;
  const render = (time: number) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const centerX = width * 0.84 + pointer.x * 22;
    const centerY = height * 0.42 + pointer.y * 14;
    const bodyW = Math.min(width * 0.34, 390);
    const bodyH = bodyW * 0.34;
    const bodyX = centerX - bodyW / 2;
    const bodyY = centerY - bodyH / 2;

    context.clearRect(0, 0, width, height);
    context.save();
    context.globalAlpha = 0.42;
    context.translate(pointer.x * 12, pointer.y * 8);

    const glow = context.createRadialGradient(centerX, centerY, 20, centerX, centerY, bodyW * 0.9);
    glow.addColorStop(0, 'rgba(255,184,0,0.16)');
    glow.addColorStop(0.52, 'rgba(199,32,49,0.08)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    context.fillStyle = 'rgba(115,9,18,0.18)';
    context.strokeStyle = 'rgba(255,184,0,0.18)';
    context.lineWidth = 1;
    roundRect(context, bodyX, bodyY, bodyW, bodyH, 18);
    context.fill();
    context.stroke();

    context.fillStyle = 'rgba(225,218,197,0.18)';
    roundRect(context, bodyX + bodyW * 0.07, bodyY + bodyH * 0.58, bodyW * 0.86, bodyH * 0.22, 8);
    context.fill();

    context.fillStyle = 'rgba(255,184,0,0.22)';
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 16; col += 1) {
        drawStar(
          context,
          bodyX + bodyW * 0.14 + col * bodyW * 0.045,
          bodyY + bodyH * 0.23 + row * bodyH * 0.14,
          bodyW * 0.012
        );
      }
    }

    context.fillStyle = 'rgba(255,184,0,0.52)';
    for (let i = 0; i < 5; i += 1) {
      const pulse = reducedMotion ? 0.5 : 0.45 + Math.sin(time * 0.002 + i) * 0.18;
      context.globalAlpha = pulse;
      context.beginPath();
      context.arc(bodyX + bodyW * (0.46 + i * 0.07), bodyY + bodyH * 0.67, bodyW * 0.012, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
    if (!reducedMotion) raf = requestAnimationFrame(render);
  };

  resize();
  window.addEventListener('resize', resize);
  render(0);
  if (!reducedMotion) raf = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
}

function canUseWebGL() {
  if (typeof document === 'undefined') return false;

  try {
    const testCanvas = document.createElement('canvas');
    const context =
      testCanvas.getContext('webgl2') ||
      testCanvas.getContext('webgl') ||
      testCanvas.getContext('experimental-webgl');

    return Boolean(context);
  } catch {
    return false;
  }
}

function createThreeScene(canvas: HTMLCanvasElement, pointer: PointerState, reducedMotion: boolean) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);

  const root = new THREE.Group();
  root.position.set(2.28, -0.12, 0);
  root.rotation.set(-0.08, -0.32, 0.04);
  scene.add(root);

  scene.add(new THREE.AmbientLight(0xfff0d1, 0.75));

  const key = new THREE.DirectionalLight(0xffc04a, 2.2);
  key.position.set(3.2, 2.8, 4.2);
  scene.add(key);

  const redLight = new THREE.PointLight(0xff2540, 2.4, 6);
  redLight.position.set(0.6, -0.8, 1.6);
  scene.add(redLight);

  const blueLight = new THREE.PointLight(0x3c74ff, 0.75, 5);
  blueLight.position.set(-1.6, 0.8, 1.8);
  scene.add(blueLight);

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x9e1024,
    roughness: 0.38,
    metalness: 0.58,
    emissive: 0x240008,
    emissiveIntensity: 0.16,
  });
  const faceMaterial = new THREE.MeshStandardMaterial({
    color: 0xd7c9a2,
    roughness: 0.32,
    metalness: 0.72,
    emissive: 0x20170a,
    emissiveIntensity: 0.1,
  });
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.55,
    metalness: 0.25,
  });
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffb800,
    transparent: true,
    opacity: 0.58,
  });

  const ampBody = new THREE.Mesh(new THREE.BoxGeometry(3.25, 1.08, 0.42, 8, 2, 2), bodyMaterial);
  ampBody.position.set(0, 0.08, 0);
  root.add(ampBody);

  const facePlate = new THREE.Mesh(new THREE.BoxGeometry(2.78, 0.24, 0.05), faceMaterial);
  facePlate.position.set(0, -0.28, 0.24);
  root.add(facePlate);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 12, 48, Math.PI), darkMaterial);
  handle.position.set(0, 0.77, 0.02);
  handle.rotation.set(Math.PI, 0, 0);
  root.add(handle);

  const starGeometry = new THREE.ShapeGeometry(createStarShape());
  const starMaterial = new THREE.MeshStandardMaterial({
    color: 0x070707,
    roughness: 0.8,
    metalness: 0.05,
    transparent: true,
    opacity: 0.76,
  });

  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 18; col += 1) {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(-1.32 + col * 0.155, 0.12 + row * 0.145, 0.238);
      star.rotation.z = ((row + col) % 2) * 0.12;
      root.add(star);
    }
  }

  const knobGeometry = new THREE.CylinderGeometry(0.045, 0.06, 0.055, 28);
  for (let i = 0; i < 7; i += 1) {
    const knob = new THREE.Mesh(knobGeometry, darkMaterial);
    knob.position.set(-0.72 + i * 0.22, -0.28, 0.3);
    knob.rotation.x = Math.PI / 2;
    root.add(knob);
  }

  const tubeFilaments: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>[] = [];
  for (let i = 0; i < 4; i += 1) {
    const tubeGroup = new THREE.Group();
    tubeGroup.position.set(-0.62 + i * 0.42, 0.56, 0.14);

    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.34, 32, 1, true),
      new THREE.MeshPhysicalMaterial({
        color: 0xbfe2ff,
        roughness: 0.04,
        metalness: 0,
        transmission: 0.72,
        transparent: true,
        opacity: 0.3,
        thickness: 0.05,
      })
    );
    tubeGroup.add(glass);

    const filament = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.25, 20), glowMaterial.clone());
    filament.position.y = -0.01;
    tubeGroup.add(filament);
    tubeFilaments.push(filament);

    root.add(tubeGroup);
  }

  const signalGroup = new THREE.Group();
  const particles: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>[] = [];
  for (let i = 0; i < 18; i += 1) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffc33f, transparent: true, opacity: 0.68 })
    );
    particles.push(particle);
    signalGroup.add(particle);
  }
  signalGroup.position.set(0, -0.04, 0.44);
  root.add(signalGroup);

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    camera.aspect = width / height;
    camera.position.set(0, 0, width < 700 ? 5.9 : 4.7);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    root.scale.setScalar(width < 700 ? 0.66 : 1);
    root.position.set(width < 700 ? 0.5 : 2.28, width < 700 ? -0.78 : -0.12, 0);
  };

  let raf = 0;
  const render = (time: number) => {
    const seconds = time * 0.001;
    const pointerX = reducedMotion ? 0 : pointer.x;
    const pointerY = reducedMotion ? 0 : pointer.y;

    root.rotation.y = -0.32 + pointerX * 0.14 + (reducedMotion ? 0 : Math.sin(seconds * 0.35) * 0.03);
    root.rotation.x = -0.08 - pointerY * 0.07 + (reducedMotion ? 0 : Math.sin(seconds * 0.5) * 0.016);
    redLight.intensity = reducedMotion ? 2.1 : 2.1 + Math.sin(seconds * 1.8) * 0.38;

    tubeFilaments.forEach((tube, index) => {
      tube.material.opacity = reducedMotion ? 0.52 : 0.42 + Math.sin(seconds * 2.2 + index * 0.7) * 0.16;
      tube.scale.y = reducedMotion ? 0.9 : 0.86 + Math.sin(seconds * 2.5 + index) * 0.08;
    });

    particles.forEach((particle, index) => {
      const progress = reducedMotion ? index / particles.length : (seconds * 0.11 + index / particles.length) % 1;
      particle.position.x = -1.35 + progress * 2.7;
      particle.position.y = Math.sin(progress * Math.PI * 2) * 0.08 - 0.02;
      particle.position.z = 0.03 + Math.cos(progress * Math.PI * 2) * 0.035;
      particle.material.opacity = 0.12 + Math.sin(progress * Math.PI) * 0.62;
    });

    renderer.render(scene, camera);
    if (!reducedMotion) raf = requestAnimationFrame(render);
  };

  resize();
  window.addEventListener('resize', resize);
  render(0);
  if (!reducedMotion) raf = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    renderer.dispose();
  };
}

export function HeroAmp3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<PointerState>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cleanup = () => {};

    const handlePointer = (event: PointerEvent) => {
      pointerRef.current.x = event.clientX / window.innerWidth - 0.5;
      pointerRef.current.y = event.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener('pointermove', handlePointer, { passive: true });

    try {
      cleanup = canUseWebGL()
        ? createThreeScene(canvas, pointerRef.current, reducedMotion)
        : drawFallback(canvas, pointerRef.current, reducedMotion);
    } catch {
      cleanup = drawFallback(canvas, pointerRef.current, reducedMotion);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointer);
      cleanup();
    };
  }, []);

  return (
    <div className="hero-amp-3d" aria-hidden="true">
      <canvas ref={canvasRef} className="hero-amp-3d-canvas" />
      <div className="hero-amp-3d-haze" />
    </div>
  );
}
