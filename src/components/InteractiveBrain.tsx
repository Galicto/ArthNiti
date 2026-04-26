"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const STATS = [
  { n: "95%",  l: "Prediction Accuracy", dx: -1.2, dy: -1.0 },
  { n: "10M+", l: "Data Sources",        dx:  1.2, dy: -0.8 },
  { n: "24/7", l: "Market Monitoring",   dx: -1.1, dy:  1.0 },
  { n: "50+",  l: "Risk Factors",        dx:  1.1, dy:  0.8 },
];

export default function InteractiveBrain({ theme }: { theme: "light" | "dark" }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouse    = useRef({ x: 0, y: 0 });
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth;
    const H = container.clientHeight;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(45, W / H, 1, 2000);
    camera.position.z = 380;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ─── Brain point cloud ─────────────────────────────────────────────────
    const N   = 1400;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);

    const cTeal = new THREE.Color("#0d9488");
    const cBlue = new THREE.Color("#3b82f6");
    const cGlow = new THREE.Color("#a5f3fc");

    for (let i = 0; i < N; i++) {
      // Uniformly distributed on a sphere
      const u = Math.random();
      const v = Math.random();
      const th = 2 * Math.PI * u;
      const ph = Math.acos(2 * v - 1);

      // Ellipsoid: wide x, medium y, medium z
      let x = 100 * Math.sin(ph) * Math.cos(th);
      let y =  68 * Math.sin(ph) * Math.sin(th);
      let z =  82 * Math.cos(ph);

      // Flatten the bottom → cerebellum look
      if (y < -28) {
        x *= 0.6;
        y  = y * 0.58 - 8;
        z *= 0.7;
      }

      // Corpus callosum groove (indent at top center)
      const groove = Math.exp(-(x * x) / 400) * Math.exp(-(z * z) / 400);
      y -= groove * 16;

      // Surface wrinkles (gyri/sulci)
      const w1 = Math.sin(x * 0.15 + z * 0.10) * Math.cos(y * 0.15);
      const w2 = Math.cos(x * 0.09) * Math.sin(z * 0.12 + y * 0.09);
      x += w1 * 8;
      y += w2 * 6;
      z += w1 * w2 * 5;

      // Micro noise
      x += (Math.random() - 0.5) * 4;
      y += (Math.random() - 0.5) * 4;
      z += (Math.random() - 0.5) * 4;

      pos[i * 3]     = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color: left=teal, right=blue, front face=glow
      const tx = (x + 100) / 200;
      const tz = Math.max(0, z) / 82;
      const c  = cTeal.clone().lerp(cBlue, tx).lerp(cGlow, tz * 0.4);
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute("color",    new THREE.BufferAttribute(col, 3));

    const pMat = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // ─── Neural connections ────────────────────────────────────────────────
    const pts3 = Array.from({ length: N }, (_, i) =>
      new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
    );

    const lineVerts: number[] = [];
    for (let i = 0; i < N; i++) {
      let c = 0;
      for (let j = i + 1; j < N && c < 3; j++) {
        if (pts3[i].distanceTo(pts3[j]) < 20) {
          lineVerts.push(pts3[i].x, pts3[i].y, pts3[i].z,
                         pts3[j].x, pts3[j].y, pts3[j].z);
          c++;
        }
      }
    }

    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.Float32BufferAttribute(lineVerts, 3));
    const lMat = new THREE.LineBasicMaterial({
      color: 0x14b8a6,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const group = new THREE.Group();
    group.add(new THREE.Points(pGeo, pMat));
    group.add(new THREE.LineSegments(lGeo, lMat));
    scene.add(group);

    // ─── Mouse tracking ────────────────────────────────────────────────────
    const onMouse = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      const ny = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      mouse.current = { x: nx, y: ny };
      setMx(nx);
      setMy(ny);
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    // ─── Animation ─────────────────────────────────────────────────────────
    let rafId: number;
    const clock = new THREE.Clock();

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const t  = clock.getElapsedTime();
      const { x, y } = mouse.current;

      group.rotation.y += (x * 0.5 + t * 0.06 - group.rotation.y) * 0.03;
      group.rotation.x += (-y * 0.28           - group.rotation.x) * 0.03;

      // Breathing
      const p = 1 + Math.sin(t * 1.1) * 0.012;
      group.scale.setScalar(p);

      renderer.render(scene, camera);
    };
    tick();

    // ─── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      pGeo.dispose(); lGeo.dispose(); pMat.dispose(); lMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
    };
  }, [theme]);

  return (
    <div style={{ position: "relative", width: "100%", height: "520px", overflow: "hidden" }}>
      {/* Three.js Canvas */}
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      {/* Floating data — no boxes, pure text with glowing dot */}
      {STATS.map((s, i) => {
        const offsetX = mx * s.dx * 22;
        const offsetY = my * s.dy * 16;
        const positions = [
          { top: "12%",    left:  "6%"  },
          { top: "12%",    right: "6%"  },
          { bottom: "14%", left:  "6%"  },
          { bottom: "14%", right: "6%"  },
        ] as const;
        const isRight = i % 2 === 1;
        return (
          <div
            key={i}
            className="brain-float-data"
            style={{
              position: "absolute",
              ...positions[i],
              transform: `translate(${offsetX}px, ${offsetY}px)`,
              transition: "transform 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              zIndex: 10,
              textAlign: isRight ? "right" : "left",
            }}
          >
            <div className="bfd-value">{s.n}</div>
            <div className="bfd-label">{s.l}</div>
            <div className={`bfd-dot ${isRight ? "bfd-dot-right" : ""}`} />
          </div>
        );
      })}
    </div>
  );
}
