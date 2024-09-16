import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import fragmentShader from "./fragment-shader.glsl";
import vertexShader from "./vertex-shader.glsl";

function scene() {
  const helperOpacity = 0;

  // Setup basic scene, camera, renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e1b4b); // Indigo-950
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("background").appendChild(renderer.domElement);
  renderer.outputEncoding = THREE.LinearEncoding;

  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true; // Enable damping (inertia)
  // controls.dampingFactor = 0.25; // Damping factor
  // controls.screenSpacePanning = true; // Disable panning

  camera.position.x = -50;
  camera.position.y = 7;
  camera.position.z = -15;
  camera.rotation.x = -2.61; // -2.36;
  camera.rotation.y = -1.23; // -1.11:
  camera.rotation.z = -2.63; // -2.36;

  const gridSizeX = 125;
  const gridSizeZ = 125;
  const gridSpacing = 0.5;

  // Create a flat array to store x, y, z values
  const vertexCount = (gridSizeX * 2 + 1) * (gridSizeZ * 2 + 1);
  const vertices = new Float32Array(vertexCount * 3);

  // Generate initial grid points with fixed x and z (initial y is 0)
  let index = 0;
  for (let z = -gridSizeZ; z <= gridSizeZ; z++) {
    for (let x = -gridSizeX; x <= gridSizeX; x++) {
      vertices[index] = x * gridSpacing; // x
      vertices[index + 1] = 0; // y (initially 0, will be updated by shader)
      vertices[index + 2] = z * gridSpacing; // z
      index += 3;
    }
  }

  console.log(vertices.length);

  const fogColor = new THREE.Color(0x1e1b4b); // Indigo-200
  scene.fog = new THREE.Fog(fogColor, 0, 100); // Indigo-950

  // Set up geometry and point cloud
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  // Load circular texture
  const textureLoader = new THREE.TextureLoader();
  const circleTexture = textureLoader.load("point.png");
  const color = new THREE.Color(0xc7d2fe); // Indigo-200

  // Load the noiseMap
  const noiseMap = textureLoader.load("noiseMap.png");

  const material = new THREE.ShaderMaterial({
    uniforms: {
      intersectionPoint: { value: new THREE.Vector3(0, 0, 0) }, // Intersection point uniform
      color: { value: color.convertLinearToSRGB() }, // Indigo-200
      pointSize: { value: 8.0 }, // Point size
      pointTexture: { value: circleTexture }, // Circle texture
      map: { value: circleTexture }, // Circle texture
      noiseMap: { value: noiseMap }, // Noise map
      noiseIntensity: { value: 10.0 }, // Noise intensity
      time: { value: 0.0 }, // Time uniform
      gridSize: { value: new THREE.Vector2(gridSizeX, gridSizeZ) }, // Grid size
      fogColor: { value: fogColor.convertLinearToSRGB() }, // Fog color
      fogNear: { value: scene.fog.near }, // Fog near distance
      fogFar: { value: scene.fog.far }, // Fog far distance
      sigma: { value: 1.5 }, // Sigma for Gaussian function
      amplitude: { value: 2.0 }, // Amplitude for Gaussian function
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });

  const pointCloud = new THREE.Points(geometry, material);
  scene.add(pointCloud);

  // Create a plane to interact with the mouse (will be invisible)
  const pGeometry = new THREE.PlaneGeometry(gridSizeX, gridSizeZ, 1, 1)
    .rotateX(Math.PI / 2)
    .translate(0, 0, 0);
  const pMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: helperOpacity,
  });
  const plane = new THREE.Mesh(pGeometry, pMaterial);
  scene.add(plane);

  // Set up raycaster and pointer for mouse interaction
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let intersectionPoint = new THREE.Vector3();

  // Create a sphere to mark the intersection point
  let sphere;
  const sphereGeometry = new THREE.SphereGeometry(1, 6, 6);
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: helperOpacity,
  });

  // Set up clock for smooth time management
  const clock = new THREE.Clock();

  // Event listener for mouse movement
  window.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0) {
      intersectionPoint = intersects[0].point;

      // Create sphere if it doesn't exist
      if (!sphere) {
        sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);
      }

      // Move sphere to intersection point
      sphere.position.copy(intersectionPoint);

      // Pass the intersection point to the shader
      pointCloud.material.uniforms.intersectionPoint.value.copy(
        intersectionPoint
      );
    }
  });

  // Handle window resize
  window.addEventListener("resize", onWindowResize, false);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Recalculate the point size based on the new window size
    const newPointSize = Math.min(window.innerWidth, window.innerHeight) * 0.01;
    material.uniforms.pointSize.value = newPointSize;
  }

  function animate() {
    const delta = clock.getDelta();
    material.uniforms.time.value += delta;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

// Initialize the scene
scene();

export default scene;
