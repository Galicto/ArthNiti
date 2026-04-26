"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

export default function Hero3D({ theme }: { theme: "light" | "dark" }) {
  const mountRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const isDark = theme === "dark";
    
    // Minimal fog to blend edges
    scene.fog = new THREE.FogExp2(isDark ? 0x020617 : 0xf1f5f9, 0.0025);

    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 120;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
    mountRef.current.appendChild(renderer.domElement);

    // Neural Constellation (Points + Lines)
    const particleCount = window.innerWidth < 768 ? 200 : 400; // Less particles on mobile
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Define palette based on theme
    const primaryColor = new THREE.Color(isDark ? "#14b8a6" : "#0d9488");
    const accentColor = new THREE.Color(isDark ? "#3b82f6" : "#2563eb");

    for (let i = 0; i < particleCount; i++) {
      // Cylinder-like distribution for a sweeping horizontal look
      positions[i * 3] = (Math.random() - 0.5) * 400; // X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200; // Z

      const mixedColor = primaryColor.clone().lerp(accentColor, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Points Material
    const pointsMaterial = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    const particles = new THREE.Points(geometry, pointsMaterial);
    scene.add(particles);

    // Dynamic Connections (Lines)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: isDark ? 0x14b8a6 : 0x0d9488,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });
    
    // Create line geometry dynamically based on distance in the render loop
    // To save performance, we only rebuild connections occasionally, or pre-calc a fixed set.
    // Fixed set is much faster:
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    const maxConnections = 2; // per node
    
    for (let i = 0; i < particleCount; i++) {
        let connections = 0;
        const p1 = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        
        for (let j = i + 1; j < particleCount; j++) {
            const p2 = new THREE.Vector3(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
            const dist = p1.distanceTo(p2);
            
            if (dist < 40 && connections < maxConnections) {
                linePositions.push(
                    p1.x, p1.y, p1.z,
                    p2.x, p2.y, p2.z
                );
                connections++;
            }
        }
    }
    
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Mouse Parallax interactives
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX) * 0.05;
      mouseY = (event.clientY - windowHalfY) * 0.05;
    };

    document.addEventListener("mousemove", onDocumentMouseMove, { passive: true });

    // Handle Resize
    const onWindowResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", onWindowResize, { passive: true });

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation
      targetX = mouseX * 0.5;
      targetY = mouseY * 0.5;
      
      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (-targetY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      // Gentle continuous rotation
      particles.rotation.y = elapsedTime * 0.05;
      lines.rotation.y = elapsedTime * 0.05;
      
      particles.rotation.x = elapsedTime * 0.025;
      lines.rotation.x = elapsedTime * 0.025;

      renderer.render(scene, camera);
    };

    animate();

    // Intro Animation
    gsap.from(camera.position, {
        z: 300,
        duration: 3,
        ease: "power3.out"
    });
    
    gsap.fromTo([pointsMaterial, lineMaterial], {
        opacity: 0
    }, {
        opacity: (i) => i === 0 ? 0.8 : 0.15,
        duration: 2,
        delay: 0.5,
        ease: "power2.out"
    });

    // Cleanup
    const currentMount = mountRef.current;
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("mousemove", onDocumentMouseMove);
      window.removeEventListener("resize", onWindowResize);
      
      geometry.dispose();
      lineGeometry.dispose();
      pointsMaterial.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      
      if (currentMount && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  // Background gradient to complement the nodes
  const bgGradient = theme === "dark" 
    ? "radial-gradient(ellipse at 50% 50%, #0f172a 0%, #020617 100%)"
    : "radial-gradient(ellipse at 50% 50%, #f8fafc 0%, #e2e8f0 100%)";

  return (
    <div 
        ref={mountRef} 
        style={{ 
            position: "absolute", 
            inset: 0, 
            zIndex: 0, 
            background: bgGradient,
            overflow: "hidden",
            pointerEvents: "none" // Let clicks pass through
        }} 
    />
  );
}
