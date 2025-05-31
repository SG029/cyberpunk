import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import './style.css';
const scene = new THREE.Scene();
import gsap from 'gsap';  
import LocomotiveScroll from 'locomotive-scroll';

const locomotiveScroll = new LocomotiveScroll();


const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);

// Load HDRI environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load('../public/newhdri.hdr', function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  // scene.background = texture;
});

const loader = new GLTFLoader();
let helmet;

loader.load('/DamagedHelmet.gltf', (gltf) => {
  helmet = gltf.scene;
  scene.add(helmet);
}, undefined, (error) => {
  console.error('An error occurred loading the model:', error);
});

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
camera.position.z = 5;

// Post processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.003;
composer.addPass(rgbShiftPass);

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

// Mouse movement handling
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - window.innerWidth / 2) / window.innerWidth;
  mouseY = (event.clientY - window.innerHeight / 2) / window.innerHeight;
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Smooth interpolation with reduced rotation amount
  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;
  
  if (helmet) {
    gsap.to(helmet.rotation, {
      y: targetX * 0.5,
      x: targetY * 0.3,
      duration: 0.5,
      ease: "power2.out"
    });
  }
  
  composer.render();
}
animate();