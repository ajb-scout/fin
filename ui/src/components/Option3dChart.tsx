import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

import { Option3dData } from './OptionResult';
import { Card } from '@mantine/core';



interface OptionsChartProps {
  data: Option3dData['data'];
}
// const divisions = 10; // Number of divisions in the grid

const OptionChart3d: React.FC<OptionsChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textMeshes: THREE.Mesh[] = []; // Store text meshes for updating
  const divisions = 5;
  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    // Initialize scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setClearColor(new THREE.Color(0x041122));

    // Create axis labels
    const priceRange = [Math.min(...data.map(item => item.price)), Math.max(...data.map(item => item.price))];
    const timeRange = [Math.min(...data.map(item => item.time * 365)), Math.max(...data.map(item => item.time * 365))];
    const deltaRange = [Math.min(...data.map(item => item.delta_price_time_output)), Math.max(...data.map(item => item.delta_price_time_output))];

    // Create sensible tick marks for Price and Time
    const priceTicks = Array.from({ length: divisions + 1 }, (_, i) => {
      return (priceRange[0] + (i * (priceRange[1] - priceRange[0]) / divisions)).toFixed(2);
    });
    const timeTicks = Array.from({ length: divisions + 1 }, (_, i) => {
      return (timeRange[0] + (i * (timeRange[1] - timeRange[0]) / divisions)).toFixed(2);
    });

    const deltaTicks = Array.from({ length: divisions + 1 }, (_, i) => {
      return (deltaRange[0] + (i * (deltaRange[1] - deltaRange[0]) / divisions)).toFixed(2);
    });


    // Load a font for text labels
    const fontLoader = new FontLoader();
    fontLoader.load('droid_serif_regular.typeface.json',
      (font) => {
        // Create and position axis labels
        const createTextLabel = (text: string, position: THREE.Vector3) => {
          const textGeometry = new TextGeometry(text, {
            font: font,
            size: 2,
            depth: 0,
            curveSegments: 12,
            bevelEnabled: false,
          });
          const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          textMeshes.push(textMesh); // Store the mesh for updating
          textMesh.position.copy(position);
          textMesh.lookAt(camera.position);
          scene.add(textMesh);
        };

        // Create axis labels
        createTextLabel('Time', new THREE.Vector3(-axisLength / 2 - 20, - axisLength / 2, 0));
        createTextLabel('Price', new THREE.Vector3(0, -axisLength / 2, axisLength / 2 + 15));
        createTextLabel('Delta', new THREE.Vector3(-axisLength / 2 - 20, axisLength / 8, -axisLength / 2));

        const spacing = axisLength / divisions;


        for (let i = 0; i <= divisions; i++) {
          // const labelValue = (i * spacing).toFixed(2); // Format the label value
          // Labels for Delta (x-axis)
          createTextLabel(priceTicks[i], new THREE.Vector3(i * spacing - axisLength / 2, -axisLength / 2, 5 + axisLength / 2));
          // Labels for Time (z-axis)
          createTextLabel(timeTicks[i], new THREE.Vector3(-axisLength / 2 - 10, -axisLength / 2, i * spacing - axisLength / 2));
          // // Labels for delta (z-axis)
          createTextLabel(deltaTicks[i], new THREE.Vector3(- axisLength / 2 - 10, i * spacing + -axisLength / 2, -axisLength / 2));
          // textMeshes[textMeshes.length -1].rotation.x = Math.PI / 2;
        }

      });

    // Prepare data for the surface
    const timeSet = Array.from(new Set(data.map(item => item.time)));
    const priceSet = Array.from(new Set(data.map(item => item.price)));

    // Ensure timeSet and priceSet are equal
    const axisLength = Math.max(timeSet.length, priceSet.length);
    const deltaZ = Array.from({ length: axisLength }, () => Array(axisLength).fill(0));

    // Fill the deltaZ array with data
    data.forEach(({ delta_price_time_output, time, price }) => {
      const tIndex = timeSet.indexOf(time);
      const pIndex = priceSet.indexOf(price);
      if (tIndex !== -1 && pIndex !== -1) {
        deltaZ[tIndex][pIndex] = delta_price_time_output;
      }
    });

    // Calculate min and max values for normalization
    const flatDeltaZ = deltaZ.flat();
    const minZ = Math.min(...flatDeltaZ);
    const maxZ = Math.max(...flatDeltaZ);

    // Create surface geometry
    const geometry = new THREE.PlaneGeometry(axisLength, axisLength, axisLength - 1, axisLength - 1);
    const vertices = geometry.attributes.position.array;



    // Set vertex heights using normalized delta values
    for (let i = 0; i < axisLength; i++) {
      for (let j = 0; j < axisLength; j++) {
        const value = deltaZ[j][i];
        const normalized = (value - minZ) / (maxZ - minZ); // Normalize the value
        const zValue = normalized * axisLength; // Scale by axisLength
        vertices[(j * axisLength + i) * 3 + 2] = zValue - minZ; // Set z position
      }
    }



    // Create colors based on z values
    const colorArray = new Float32Array(axisLength * axisLength * 3);
    for (let i = 0; i < axisLength; i++) {
      for (let j = 0; j < axisLength; j++) {
        const value = deltaZ[j][i];
        const normalized = (value - minZ) / (maxZ - minZ);
        const color = new THREE.Color(0x0000ff).lerp(new THREE.Color(0x00ff00), normalized); // Blue to Red
        const idx = (j * axisLength + i) * 3;
        colorArray[idx] = color.r;
        colorArray[idx + 1] = color.g;
        colorArray[idx + 2] = color.b;
      }
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
    const surface = new THREE.Mesh(geometry, material);
    surface.position.set(0, -axisLength / 2, 0);
    surface.rotation.x = -Math.PI / 2; // Lay flat
    scene.add(surface);

    // Create a wireframe box
    const boxWidth = axisLength; // Match surface width
    const boxHeight = axisLength; // Match surface height
    const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxWidth);
    const wireframe = new THREE.EdgesGeometry(boxGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const wireframeMesh = new THREE.LineSegments(wireframe, lineMaterial);

    // Position the wireframe at the correct location
    // boxGeometry.position.set(0,0,0);
    wireframeMesh.position.set(0, 0, 0);
    scene.add(wireframeMesh);
    // scene.add(boxGeometry);
    const size = 50;

    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.position.set(0, -25, 0);
    scene.add(gridHelper);

    const gridHelper2 = new THREE.GridHelper(size, divisions);
    gridHelper2.position.set(0, 0, -25);
    gridHelper2.rotation.x = -Math.PI / 2;
    scene.add(gridHelper2);


    const gridHelper3 = new THREE.GridHelper(size, divisions);
    gridHelper3.position.set(25, 0, 0);
    // gridHelper3.rotation.y = -Math.PI / 2;
    gridHelper3.rotation.z = -Math.PI / 2;

    scene.add(gridHelper3);

    // Position the camera

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Position the camera

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.target = new THREE.Vector3(0,-10,0); // Look at the center of the plot (Y=0)
    camera.position.set(-80, 25, 80); // Adjusted Y position

    // Animation loop

    // Animation loop
    let lastFrameTime = 0;
    const maxFps = 146;
    const frameInterval = 1000 / maxFps;

    const animate = (now: number) => {
      requestAnimationFrame(animate);

      const delta = now - lastFrameTime;
      if (delta > frameInterval) {
        lastFrameTime = now;

        controls.update();
        renderer.render(scene, camera);
      }
    };

    animate(lastFrameTime);




    // Cleanup
    return () => {
      renderer.dispose();
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
    };
  }, [data]);

  return (
    <Card>
      
      <><canvas ref={canvasRef} /></>
     </Card>
  );
};

export default OptionChart3d;
