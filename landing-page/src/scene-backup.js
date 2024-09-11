import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function scene() {
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

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Enable damping (inertia)
  controls.dampingFactor = 0.25; // Damping factor
  controls.screenSpacePanning = true; // Disable panning

  // Create noise function
  const noise2D = createNoise2D();
  const gridSizeX = 250;
  const gridSizeZ = 250;
  const gridSpacing = 0.5;
  const amplitude = 4;
  let zOffset = 0; // Initial z-offset for noise

  // Parameters for Gaussian falloff
  const centerX = 0; // Center of the falloff in the x-axis
  const sigma = 35; // Standard deviation of the Gaussian

  // Create a flat array to store x, y, z values
  const vertexCount = (gridSizeX * 2 + 1) * (gridSizeZ * 2 + 1); // Total number of points
  const vertices = new Float32Array(vertexCount * 3); // Each point has x, y, z

  // Additional arrays to track separate z positions for rendering and noise
  const zPositions = new Float32Array(vertexCount); // For rendering positions
  const zNoiseOffsets = new Float32Array(vertexCount); // For noise calculation offsets

  // Generate initial grid points with fixed x and z
  let index = 0;
  for (let z = -gridSizeZ; z <= gridSizeZ; z++) {
    for (let x = -gridSizeX; x <= gridSizeX; x++) {
      vertices[index] = x * gridSpacing; // x
      const noiseY = noise2D(x / 20, z / 20) * amplitude; // y (height from noise)
      const falloff = invertedGaussianFalloff(x, centerX, sigma); // Inverted Gaussian falloff factor
      vertices[index + 1] = noiseY * falloff; // Apply falloff to y
      vertices[index + 2] = z * gridSpacing; // z
      index += 3;
    }
  }

  // Initialize the zPositions and zNoiseOffsets arrays
  index = 0;
  for (let z = -gridSizeZ; z <= gridSizeZ; z++) {
    for (let x = -gridSizeX; x <= gridSizeX; x++) {
      const initialZ = z * gridSpacing;
      zPositions[index] = initialZ; // Initial z positions for rendering
      zNoiseOffsets[index] = initialZ; // Initial z positions for noise calculation
      index++;
    }
  }

  // Set up geometry and point cloud
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  // Load circular texture
  const textureLoader = new THREE.TextureLoader();
  const circleTexture = textureLoader.load("point.png");
  
  //const material = new THREE.PointsMaterial({ color: 0xf87171, size: 0.1 });
  const material = new THREE.PointsMaterial({
    color: 0xc7d2fe, // Indigo-200
    size: 0.1,
    map: circleTexture,
    transparent: true,
    alphaTest: 0.5,
    sizeAttenuation: true, // Enable size attenuation
  });
  const pointCloud = new THREE.Points(geometry, material);
  scene.add(pointCloud);

  // Add fog to the scene
  scene.fog = new THREE.Fog(0x1e1b4b, 0, 100); // Indigo-950

  // Create a plane to interact with the mouse (will be invisible)
  const pGeometry = new THREE.PlaneGeometry( gridSizeX, gridSizeZ, gridSizeX, gridSizeZ ).rotateX(Math.PI/2);
  const pMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, wireframe: true, transparent:true, opacity:0} );
  const plane = new THREE.Mesh( pGeometry, pMaterial );
  scene.add( plane );

  // Set up raycaster and pointer for mouse interaction
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const point = new THREE.Vector3();

  // Create a sphere to mark the intersection point
  let sphere;
  const sphereGeometry = new THREE.SphereGeometry(1, 6, 6);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 , wireframe: true, transparent:true, opacity:0});

  // camera.position.z = -50;
  // camera.position.y = 20;
  // camera.rotation.x = -Math.PI / 2;
  camera.position.x=-20; 
  camera.position.y=8;
  camera.position.z=0;
  camera.rotation.x=2.9;
  camera.rotation.y=3.35;
  camera.rotation.z=3.1;

  // Set up clock for smooth time management
  const clock = new THREE.Clock();

  function updatePoints(delta, center) {
    const scrollSpeed = 2; // How fast the terrain scrolls
    zOffset += scrollSpeed * delta; // Increment zOffset to simulate scrolling
  
    let index = 0; // Start at the beginning of the vertices array
    for (let z = -gridSizeZ; z <= gridSizeZ; z++) {
      for (let x = -gridSizeX; x <= gridSizeX; x++) {
        
        // Combine zNoiseOffsets (scrolling over time) and zPositions (current grid loop position)
        const combinedZ = zNoiseOffsets[index] + zPositions[index];
  
        // Calculate noise based on x, combinedZ
        const noiseY = noise2D(x / 20, combinedZ / 20) * amplitude;
        const falloff = invertedGaussianFalloff(x, centerX, sigma); // Apply Gaussian falloff
  
        // Set y-value with noise and falloff applied
        vertices[index * 3 + 1] = noiseY * falloff;
  
        // Apply Gaussian function for mouse interaction (if center is defined)
        if (center) {
          const pointPosition = new THREE.Vector3(vertices[index * 3], vertices[index * 3 + 1], vertices[index * 3 + 2]);
          const distance = pointPosition.distanceTo(center);
          const gaussianHeight = modifyPointHeight(distance);
          vertices[index * 3 + 1] += gaussianHeight;
        }

        // Handle looping of zPosition for the continuous scrolling effect
        zPositions[index] += scrollSpeed * delta; // Increment z position for smooth scroll
        if (zPositions[index] > gridSizeZ * gridSpacing) {
          zPositions[index] -= gridSizeZ * gridSpacing * 2; // Loop back after passing boundary
        }
  
        // Update z-value (position in the looped grid)
        vertices[index * 3 + 2] = zPositions[index];
  
        index++; // Move to the next vertex
      }
    }
  
    // Update the geometry with new y- and z-values
    geometry.attributes.position.array = vertices; // Update the array in geometry
    geometry.attributes.position.needsUpdate = true; // Notify Three.js of changes
  }

  function modifyPointHeight(distance) {
    const sigma = 2.0;
    const amplitude = 2.0;
    return amplitude * Math.exp(-Math.pow(distance, 2) / (2 * Math.pow(sigma, 2)));
  }

  // Event listener for camera control x,y,z position and rotation printing in the console
  // controls.addEventListener("change", () => {
  //   console.log(
  //     `Camera position: x=${camera.position.x.toFixed(
  //       2
  //     )}, y=${camera.position.y.toFixed(2)}, z=${camera.position.z.toFixed(2)}`
  //   );
  //   console.log(
  //     `Camera rotation: x=${camera.rotation.x.toFixed(
  //       2
  //     )}, y=${camera.rotation.y.toFixed(2)}, z=${camera.rotation.z.toFixed(2)}`
  //   );
  // });

  // Handle window resize
  window.addEventListener("resize", onWindowResize, false);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  let intersectionPoint = null;

  window.addEventListener('pointermove', (event) => {
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
    }
  });

  function modifyPoints(center) {
    // Example Gaussian function parameters
    const sigma = 2.0;
    const amplitude = 2.0;

    // Iterate over points in the point cloud
    points.forEach(point => {
        const distance = point.position.distanceTo(center);
        const height = amplitude * Math.exp(-Math.pow(distance, 2) / (2 * Math.pow(sigma, 2)));
        point.position.y += height;
    });
}

  // Animate the scene
  function animate() {
    const delta = clock.getDelta(); // Get time since last frame
    updatePoints(delta, intersectionPoint); // Update points based on delta time
    controls.update(); // Update camera controls
    renderer.render(scene, camera); // Render the scene
    requestAnimationFrame(animate); // Call animate recursively
  }

  // Start animation
  animate();
}

// Helper function for inverted Gaussian falloff
function invertedGaussianFalloff(x, center, sigma) {
  const dx = x - center;
  const gaussian = 1 - Math.exp(-(dx * dx) / (2 * sigma * sigma)); // Gaussian function
  return gaussian; // Invert the Gaussian and take the absolute value
}

// Initialize the scene
scene();

export default scene;