"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isComplete = false;
    let pulseAnim: gsap.core.Tween | null = null;
    
    // Sleek Logo entrance
    gsap.fromTo(logoRef.current, 
      { opacity: 0, scale: 0.95, filter: "blur(10px)" }, 
      { 
        opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out", 
        onComplete: () => {
          if (isComplete) return;
          pulseAnim = gsap.to(logoRef.current, {
            scale: 1.02,
            opacity: 0.8,
            duration: 1.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        }
      }
    );

    gsap.fromTo(loadingBarRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 2, ease: "power2.inOut", transformOrigin: "left" }
    );

    const finishLoading = () => {
      if (isComplete) return;
      isComplete = true;
      
      if (pulseAnim) pulseAnim.kill();
      gsap.killTweensOf(loadingBarRef.current);

      gsap.to(loadingBarRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      });

      const tl = gsap.timeline({
        onComplete: onComplete,
      });

      // Cinematic Zoom Through Exit
      tl.to(logoRef.current, {
        scale: 4,
        opacity: 0,
        filter: "blur(20px)",
        duration: 0.7,
        ease: "power3.in"
      })
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
      }, "<0.2");
    };

    const checkResources = async () => {
      try {
        await document.fonts.ready;
        const promises = Array.from(document.images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve; 
          });
        });
        await Promise.all(promises);
      } catch (e) {
        console.warn("Preload tracking error", e);
      }
    };

    // No fake delays. We exit as soon as fonts/images are ready or max 3s timeout.
    checkResources().then(() => {
      // Just ensure the intro animation finishes at least a bit before zooming
      setTimeout(() => finishLoading(), 400);
    });

    const fallbackTimeout = setTimeout(finishLoading, 3000);

    return () => {
      clearTimeout(fallbackTimeout);
      if (pulseAnim) pulseAnim.kill();
    };
  }, [onComplete]);

  return (
    <div 
      className="preloader-container" 
      ref={containerRef} 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 99999, 
        background: '#020617', // Deep AI dark background
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column'
      }}
    >
      <div 
        ref={logoRef} 
        style={{ 
          position: 'relative', 
          width: '240px', 
          height: '80px', 
          willChange: 'transform, opacity, filter' 
        }}
      >
        <Image 
          src="/logo.png" 
          alt="ArthNiti" 
          fill
          style={{ objectFit: 'contain' }}
          priority 
        />
      </div>
      
      <div style={{ width: '180px', height: '1px', background: 'rgba(255,255,255,0.1)', marginTop: '30px', overflow: 'hidden' }}>
        <div ref={loadingBarRef} style={{ width: '100%', height: '100%', background: '#3b82f6', willChange: 'transform' }} />
      </div>
    </div>
  );
}
