"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PhoneShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const standRef = useRef<HTMLDivElement>(null);
  const phone1Ref = useRef<HTMLDivElement>(null);
  const phone2Ref = useRef<HTMLDivElement>(null);
  const phone1InnerRef = useRef<HTMLDivElement>(null);
  const phone2InnerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Initial entrance animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    if (standRef.current && phone1Ref.current && phone2Ref.current) {
      tl.from(standRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
      })
      .from(phone1Ref.current, {
        x: "-60vw",
        y: "-80vh",
        rotate: -45,
        scale: 1.2,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      }, "-=0.8")
      .from(phone2Ref.current, {
        x: "60vw",
        y: "-80vh",
        rotate: 45,
        scale: 1.2,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      }, "-=1.3");
    }

    // Scroll parallax effect (Applied to the inner ref so it doesn't fight the entry animation's y)
    if (phone1InnerRef.current) {
      gsap.to(phone1InnerRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
        y: -90,
        rotate: -5,
      });
    }

    if (phone2InnerRef.current) {
      gsap.to(phone2InnerRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
        y: -120,
        rotate: 5,
      });
    }

    // Mouse reactive parallax (Also applied to the inner ref)
    const xTo1 = gsap.quickTo(phone1InnerRef.current, "x", { duration: 0.6, ease: "power2.out" });
    const yTo1 = gsap.quickTo(phone1InnerRef.current, "y", { duration: 0.6, ease: "power2.out" });
    const rXTo1 = gsap.quickTo(phone1InnerRef.current, "rotateX", { duration: 0.6, ease: "power2.out" });
    const rYTo1 = gsap.quickTo(phone1InnerRef.current, "rotateY", { duration: 0.6, ease: "power2.out" });

    const xTo2 = gsap.quickTo(phone2InnerRef.current, "x", { duration: 0.8, ease: "power2.out" });
    const yTo2 = gsap.quickTo(phone2InnerRef.current, "y", { duration: 0.8, ease: "power2.out" });
    const rXTo2 = gsap.quickTo(phone2InnerRef.current, "rotateX", { duration: 0.8, ease: "power2.out" });
    const rYTo2 = gsap.quickTo(phone2InnerRef.current, "rotateY", { duration: 0.8, ease: "power2.out" });

    const xToS = gsap.quickTo(standRef.current, "x", { duration: 0.4, ease: "power2.out" });
    const yToS = gsap.quickTo(standRef.current, "y", { duration: 0.4, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPos = (clientX / innerWidth - 0.5) * 2;
      const yPos = (clientY / innerHeight - 0.5) * 2;

      xTo1(xPos * 30);
      yTo1(yPos * 30);
      rYTo1(xPos * 10);
      rXTo1(-yPos * 10);

      xTo2(xPos * 45);
      yTo2(yPos * 45);
      rYTo2(xPos * 15);
      rXTo2(-yPos * 15);

      xToS(xPos * 15);
      yToS(yPos * 15);
    };

    // Adding a gentle continuous float to the stand for extra "life"
    gsap.to(standRef.current, {
      y: "+=15",
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, { scope: containerRef });

  return (
    <div className="phone-showcase-container" ref={containerRef}>
      <div className="phone-showcase-wrapper">
        <div className="stand-layer" ref={standRef}>
          <Image 
            src="/stand.png" 
            alt="Showcase Stand" 
            width={600} 
            height={300} 
            className="stand-img"
            priority
          />
        </div>
        <div className="phone-layer phone-1" ref={phone1Ref}>
          <div ref={phone1InnerRef} style={{ width: "100%", height: "100%", willChange: "transform" }}>
            <Image 
              src="/phone1_clear.png" 
              alt="App Interface 1" 
              width={400} 
              height={800} 
              className="phone-img"
              priority
            />
          </div>
        </div>
        <div className="phone-layer phone-2" ref={phone2Ref}>
          <div ref={phone2InnerRef} style={{ width: "100%", height: "100%", willChange: "transform" }}>
            <Image 
              src="/phone2_clear.png" 
              alt="App Interface 2" 
              width={400} 
              height={800} 
              className="phone-img"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
