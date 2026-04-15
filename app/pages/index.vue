<template>
  <div class="relative">
    <!-- Shader Background -->
    <canvas ref="bg" class="fixed inset-0 -z-10"></canvas>

    <!-- Content -->
    <div
      class="container mx-auto md:px-4 h-screen flex flex-col justify-center items-center text-center gap-12"
    >
      <noir-basel-logo class="logo text-neutral-700 w-48" />
      <div>
        <span class="animated-text uppercase text-xs text-neutral-500">
          Coming Soon...
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import * as THREE from "three";
import gsap from "gsap";
import { onMounted, ref } from "vue";

const bg = ref(null);

onMounted(() => {
  // ------------------------
  // THREE SETUP
  // ------------------------
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const renderer = new THREE.WebGLRenderer({
    canvas: bg.value,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ------------------------
  // SHADER
  // ------------------------
  const material = new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0 },
      u_resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    },
    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

// sehr feines Noise
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f*f*(3.0-2.0*f);

  return mix(a, b, u.x) +
         (c - a)* u.y * (1.0 - u.x) +
         (d - b) * u.x * u.y;
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;

  // SEHR langsame Bewegung
  float t = u_time * 0.02;

  // ultra helle Farben (fast gleich!)
  vec3 colorA = vec3(0.97, 0.97, 0.97); // ~ #f8f8f8
  vec3 colorB = vec3(0.94, 0.94, 0.96); // minimal kühler Ton

  // super subtiler Verlauf
  float gradient = st.y + 0.03 * sin(st.x * 2.0 + t);

  vec3 color = mix(colorA, colorB, gradient);

  // feines Film-Grain (wirklich minimal halten!)
  float grain = noise(st * 1200.0 + u_time) * 0.1;

  color += grain;

  gl_FragColor = vec4(color, 1.0);
}
    `,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // ------------------------
  // ANIMATION LOOP
  // ------------------------
  const clock = new THREE.Clock();

  function animate() {
    material.uniforms.u_time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  // ------------------------
  // RESIZE
  // ------------------------
  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.u_resolution.value.set(
      window.innerWidth,
      window.innerHeight,
    );
  });

  // ------------------------
  // GSAP (dein bestehendes)
  // ------------------------
  const tl = gsap.timeline({ defaults: { duration: 1, ease: "power3.out" } });

  tl.from(".logo", {
    y: 40,
    opacity: 0,
    scale: 0.95,
    filter: "blur(10px)",
  });

  tl.to(".logo", {
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    duration: 0.6,
    ease: "power2.out",
  });

  tl.from(
    ".animated-text",
    {
      y: 20,
      opacity: 0,
      filter: "blur(5px)",
      duration: 0.8,
    },
    "-=0.5",
  );
});
</script>
