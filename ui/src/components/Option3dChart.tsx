import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

import { Option3dData } from './OptionResult';
import { Card, SegmentedControl } from '@mantine/core';


interface Option3dRow {

  delta_price_time_output: number;
  theta_price_time_output: number;
  gamma_price_time_output: number;
  time: number;
  price: number;

}

interface OptionsChartProps {
  data: Option3dData['data'];
}
// const divisions = 10; // Number of divisions in the grid

const OptionChart3d: React.FC<OptionsChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textMeshes: THREE.Mesh[] = []; // Store text meshes for updating
  const divisions = 5;

  const [selected, setSelected] = useState('Delta');

  const accessorFunction = (
    item: Option3dRow) => item.delta_price_time_output;

  // Store the callback in state
  const [accessor, setAccessor] = useState(() => accessorFunction);


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
    const deltaRange = [Math.min(...data.map(item => accessor(item))), Math.max(...data.map(item => accessor(item)))];

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
      (font: any) => {
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
        createTextLabel(selected, new THREE.Vector3(-axisLength / 2 - 20, axisLength / 8, -axisLength / 2));

        const spacing = axisLength / divisions;


        for (let i = 0; i <= divisions; i++) {
          createTextLabel(priceTicks[i], new THREE.Vector3(i * spacing - axisLength / 2, -axisLength / 2, 5 + axisLength / 2));
          createTextLabel(timeTicks[i], new THREE.Vector3(-axisLength / 2 - 10, -axisLength / 2, i * spacing - axisLength / 2));
          createTextLabel(deltaTicks[i], new THREE.Vector3(- axisLength / 2 - 10, i * spacing + -axisLength / 2, -axisLength / 2));
        }

      });

    // Prepare data for the surface
    const timeSet = Array.from(new Set(data.map(item => item.time)));
    const priceSet = Array.from(new Set(data.map(item => item.price)));

    // Ensure timeSet and priceSet are equal
    const axisLength = Math.max(timeSet.length, priceSet.length);
    const deltaZ = Array.from({ length: axisLength }, () => Array(axisLength).fill(0));

    // Fill the deltaZ array with data
    data.forEach(i => {
      const tIndex = timeSet.indexOf(i.time);
      const pIndex = priceSet.indexOf(i.price);
      if (tIndex !== -1 && pIndex !== -1) {
        deltaZ[tIndex][pIndex] = (accessor(i)) //absolute vals to display theta
      }
    });
    console.log("deltaz")
    console.log(deltaZ);

    // Calculate min and max values for normalization
    const flatDeltaZ = deltaZ.flat();
    const minZ = (Math.min(...flatDeltaZ));
    const maxZ = (Math.max(...flatDeltaZ));

    // Create surface geometry
    const geometry = new THREE.PlaneGeometry(axisLength, axisLength, axisLength - 1, axisLength - 1);
    const vertices = geometry.attributes.position.array;

    // Set vertex heights using normalized delta values
    for (let i = 0; i < axisLength; i++) {
      for (let j = 0; j < axisLength; j++) {
        const value = deltaZ[j][i];
        const normalized = (value - minZ) / (maxZ - minZ); // Normalize the value
        const zValue = (normalized * axisLength); // Scale by axisLength
        vertices[(j * axisLength + i) * 3 + 2] = zValue ; // Set z position
      }
    }

    // Create colors based on z values - lerps between two hardcoded values
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

    // Create a wireframe box - will place gridframes in 3 of these planes
    const boxWidth = axisLength; // Match surface width
    const boxHeight = axisLength; // Match surface height
    const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxWidth);
    const wireframe = new THREE.EdgesGeometry(boxGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const wireframeMesh = new THREE.LineSegments(wireframe, lineMaterial);

    wireframeMesh.position.set(0, 0, 0);
    scene.add(wireframeMesh);
    const size = 50;

    //add the gridhelpers to form the shape to project plot onto
    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.position.set(0, -25, 0);
    scene.add(gridHelper);

    const gridHelper2 = new THREE.GridHelper(size, divisions);
    gridHelper2.position.set(0, 0, -25);
    gridHelper2.rotation.x = -Math.PI / 2;
    scene.add(gridHelper2);


    const gridHelper3 = new THREE.GridHelper(size, divisions);
    gridHelper3.position.set(25, 0, 0);
    gridHelper3.rotation.z = -Math.PI / 2;
    scene.add(gridHelper3);

    //create basic orbig controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.target = new THREE.Vector3(0, -10, 0); // Look at the center of the plot offset slightly down
    camera.position.set(-80, 25, 80); // adjust where we are looking from

    // Animation loop

    // Animation loop - keep fps limited 
    let lastFrameTime = 0;
    const maxFps = 144;
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


    function onWindowResize() {
      if (canvasRef.current){
        renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      }
  }
  
  window.addEventListener("resize", onWindowResize, false)
  

    // Cleanup
    return () => {
      renderer.dispose();
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
    };
  }, [data, selected]);

  

  return (
    <Card withBorder>
      <><canvas ref={canvasRef} /></>
      <SegmentedControl
        value={String(selected)}
        onChange={(value) => {
          setSelected(value);
          if (value == "Delta") {
            setAccessor(() => (item: Option3dRow) => item.delta_price_time_output);
          } else if (value == "Theta") {
            setAccessor(() => (item: Option3dRow) => item.theta_price_time_output);
          } else {
            setAccessor(() => (item: Option3dRow) => item.gamma_price_time_output);

          }
        }
        }
        data={[
          { label: 'Delta', value: "Delta" },
          { label: 'Theta', value: "Theta" },
          { label: 'Gamma', value: "Gamma" },

        ]}
      />

    </Card>
  );
};

export default OptionChart3d;
