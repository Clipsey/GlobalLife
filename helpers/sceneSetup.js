import * as THREE from 'three';
import * as d3 from 'd3';

let canvas = d3.select("body").append("canvas")
  .attr("width", window.innerWidth)
  .attr("height", window.innerHeight);

canvas.node().getContext("webgl");

// Define place to put objects, or cameras/light sources.
export const scene = new THREE.Scene();

//Field of Vision, AspectRatio, frustrum 'base' and frustrum 'top'
//75 represents how tall the frustrums
//Aspect Ration determines how wide the frustrums are
//1 represents the min distance from the camera in which Three.js renders the scene
//500 represents the max distance once can see the scne from the position of the camera.
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
// How far the globe is
camera.position.z = 500;

// Set WebGLRender and size
export const renderer = new THREE.WebGLRenderer({canvas: canvas.node()});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Light source, hex of ckye, hex of ground, intensity
//Ignored, overriden with texture
const light = new THREE.HemisphereLight('#fff', '#666', 1.5);
light.position.set(0, 500, 0);
scene.add(light);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})