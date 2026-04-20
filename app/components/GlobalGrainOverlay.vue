<template>
  <canvas ref="canvasRef" class="grain-overlay" aria-hidden="true" />
</template>

<script setup>
import * as THREE from "three";

const canvasRef = ref(null);

let renderer;
let scene;
let camera;
let material;
let frameId;
let clock;
let onResize;

onMounted(() => {
  scene = new THREE.Scene();
  camera = new THREE.Camera();
  clock = new THREE.Clock();

  material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uStrength: { value: 0.042 },
    },
    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uStrength;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / uResolution.xy;
        float grain = random(st * uResolution.xy + uTime * 60.0);
        float alpha = (grain - 0.5) * uStrength + (uStrength * 0.5);
        gl_FragColor = vec4(vec3(grain), alpha);
      }
    `,
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(plane);

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: false,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const animate = () => {
    material.uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    frameId = requestAnimationFrame(animate);
  };
  animate();

  onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  };

  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  if (frameId) {
    cancelAnimationFrame(frameId);
  }

  if (onResize) {
    window.removeEventListener("resize", onResize);
  }

  if (material) {
    material.dispose();
  }

  if (renderer) {
    renderer.dispose();
  }
});
</script>

<style scoped>
.grain-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.11;
  mix-blend-mode: soft-light;
}
</style>
