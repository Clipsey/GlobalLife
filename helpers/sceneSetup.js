import * as THREE from 'three';
import * as d3 from 'd3';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export var canvas = d3.select("body").append("canvas")
  .attr("width", window.innerWidth)
  .attr("height", window.innerHeight);

canvas.node().getContext("webgl");

export var renderer = new THREE.WebGLRenderer({ canvas: canvas.node(), antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

export var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.z = 1000;
export let controls = new OrbitControls(camera, renderer.domElement);
// // controls.autoRotate = true;


export var scene = new THREE.Scene();

export var light = new THREE.HemisphereLight('#ffffff', '#666666', 1.5);
light.position.set(0, 1000, 0);
scene.add(light);

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}