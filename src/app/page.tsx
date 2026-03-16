"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import * as THREE from "three";
import { Sun, Moon } from "lucide-react";
import PhoneShowcase from "@/components/PhoneShowcase";
import Preloader from "@/components/Preloader";
import Hero3D from "@/components/Hero3D";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./home.css";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark"); // Default to dark for premium feel
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── GSAP: Persistent animations (magnetic buttons, ScrollTrigger reveals) ──
  useGSAP(() => {
    // Magnetic buttons
    document.querySelectorAll<HTMLElement>(".btn-magnetic").forEach((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });

      btn.addEventListener("mousemove", (e) => {
        const { left, top, width, height } = btn.getBoundingClientRect();
        xTo((e.clientX - (left + width / 2)) * 0.25);
        yTo((e.clientY - (top + height / 2)) * 0.25);
      });
      btn.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });

    // Section reveals via ScrollTrigger
    document.querySelectorAll("section").forEach((section) => {
      const reveals = section.querySelectorAll(".reveal");
      if (reveals.length > 0) {
        gsap.fromTo(
          reveals,
          { y: 40, opacity: 0 },
          {
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              toggleActions: "play none none reverse",
              fastScrollEnd: true,
              preventOverlaps: true,
            },
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
          }
        );
      }

      // Parallax for feature icons / AI logo
      const parallax = section.querySelectorAll(".feature-icon, .ai-logo");
      if (parallax.length > 0) {
        gsap.to(parallax, {
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
          y: -30,
          ease: "none",
        });
      }
    });

    // Particles container parallax
    const particlesContainer = document.querySelector(".particles-container");
    if (particlesContainer) {
      gsap.to(particlesContainer, {
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: 80,
      });
    }

    // Scroll progress bar
    gsap.to(".scroll-progress-line", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    });
  }, []);

  // ── GSAP: Hero entrance (fires once loaded) ──
  useGSAP(() => {
    if (!isLoaded) return;

    const words = document.querySelectorAll(".hero-content .word");
    if (words.length > 0) {
      gsap.fromTo(
        words,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.07,
          ease: "power4.out",
          delay: 0.15,
        }
      );
    }

    const badge = document.querySelector(".hero-badge");
    if (badge) {
      gsap.fromTo(
        badge,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
  }, { dependencies: [isLoaded] });

  // ── Cursor, scroll listener, particles ──
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (heroRef.current && cursorGlowRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const inside = e.clientY >= rect.top && e.clientY <= rect.bottom;
        cursorGlowRef.current.style.opacity = inside ? "1" : "0";
        if (inside) {
          cursorGlowRef.current.style.left = `${e.clientX}px`;
          cursorGlowRef.current.style.top = `${e.clientY}px`;
        }
      }
    };
    document.addEventListener("mousemove", handleMouseMove, { passive: true });

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      dotX += (mouseX - dotX) * 0.32;
      dotY += (mouseY - dotY) * 0.32;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Particles
    const container = document.getElementById("particles-container");
    if (container) {
      for (let i = 0; i < 20; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        const size = Math.random() * 2 + 1;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;

        p.animate(
          [
            { transform: "translate3d(0,0,0)", opacity: 0 },
            { transform: `translate3d(${Math.random() * 80 - 40}px, ${Math.random() * -250}px, 0)`, opacity: 0.5, offset: 0.35 },
            { transform: `translate3d(${Math.random() * 120 - 60}px, ${Math.random() * -500}px, 0)`, opacity: 0 },
          ],
          {
            duration: (Math.random() * 12 + 10) * 1000,
            iterations: Infinity,
            delay: Math.random() * 4 * 1000,
            easing: "ease-out",
          }
        );
        container.appendChild(p);
      }
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleBtnEnter = useCallback(() => {
    if (cursorRef.current) {
      cursorRef.current.style.borderColor = "transparent";
      cursorRef.current.style.backgroundColor = "rgba(37, 99, 235, 0.15)";
      cursorRef.current.style.width = "44px";
      cursorRef.current.style.height = "44px";
    }
  }, []);

  const handleBtnLeave = useCallback(() => {
    if (cursorRef.current) {
      cursorRef.current.style.borderColor = "var(--primary)";
      cursorRef.current.style.backgroundColor = "transparent";
      cursorRef.current.style.width = "22px";
      cursorRef.current.style.height = "22px";
    }
  }, []);

  return (
    <>
      <div className="scroll-progress-container">
        <div className="scroll-progress-line" />
      </div>

      {!isLoaded && <Preloader onComplete={() => setIsLoaded(true)} />}

      <div className={`arthniti-page ${theme === "dark" ? "dark" : ""} ${isLoaded ? "loaded" : ""}`}>
        <div className="cursor" ref={cursorRef} />
        <div className="cursor-dot" ref={cursorDotRef} />
        
        {isLoaded && <Hero3D theme={theme} />}

        <div className="page-wrapper">
          {/* ── NAV ── */}
          <nav id="nav" className={isScrolled ? "scrolled" : ""}>
            <div className="nav-container">
              <a href="#" className="logo">
                <Image src="/logo.png" width={120} height={40} className="logo-img" alt="ArthNiti" priority />
              </a>
              <ul className="nav-menu">
                <li><a href="#features">Features</a></li>
                <li><a href="#ai">AI Engine</a></li>
                <li>
                  <button
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    className="theme-toggle"
                    aria-label="Toggle Dark Mode"
                  >
                    {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                  </button>
                </li>
                <li><a href="#start" className="nav-cta">Get Started</a></li>
              </ul>
            </div>
          </nav>

          {/* ── HERO ── */}
          <section className="hero" ref={heroRef}>
            <div className="hero-bg">
              <div className="blob blob-1" />
              <div className="blob blob-2" />
              <div className="blob blob-3" />
              <div className="grid-pattern" />
              <div className="cursor-glow" ref={cursorGlowRef} />

              {/* Floating Finance Cards */}
              <div className="finance-card finance-card-1">
                <div className="card-title">Portfolio Value</div>
                <div className="card-value blue">$124,580</div>
                <div className="card-change up">↑ 12.4%</div>
              </div>
              <div className="finance-card finance-card-2">
                <div className="card-title">AI Predictions</div>
                <div className="mini-chart">
                  <div className="chart-bars">
                    {[60, 80, 45, 90, 70].map((h, i) => (
                      <div key={i} className="chart-bar" style={{ height: `${h}%`, animationDelay: `${0.1 * (i + 1)}s` }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="finance-card finance-card-3">
                <div className="card-title">Monthly Returns</div>
                <div className="card-value green">+18.2%</div>
                <div className="card-change up">↑ $22,450</div>
              </div>
              <div className="finance-card finance-card-4">
                <div className="card-title">Risk Score</div>
                <div className="card-value">7.2/10</div>
                <div style={{ fontSize: "11px", color: "var(--text-light)", marginTop: "6px" }}>Moderate Risk</div>
              </div>
            </div>

            <div className="particles-container" id="particles-container" />

            {/* Finance UI Overlay */}
            <div className="finance-ui">
              <div className="floating-chart chart-1">
                <svg className="line-chart" viewBox="0 0 180 80">
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#2563eb", stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: "#2563eb", stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  <path className="chart-area" d="M0,60 L20,45 L40,50 L60,30 L80,35 L100,20 L120,25 L140,15 L160,20 L180,10 L180,80 L0,80 Z" fill="url(#gradient1)" />
                  <path className="chart-line" d="M0,60 L20,45 L40,50 L60,30 L80,35 L100,20 L120,25 L140,15 L160,20 L180,10" strokeDasharray="400" strokeDashoffset="400" />
                </svg>
              </div>
              <div className="floating-chart chart-2">
                <div className="candlestick-container">
                  {[45, 38, 52, 42, 48, 55, 50, 58, 52, 60].map((h, i) => (
                    <div key={i} className="candlestick" style={{ height: `${h}px` }} />
                  ))}
                </div>
              </div>
              <div className="floating-chart chart-3">
                <svg className="line-chart" viewBox="0 0 160 70">
                  <defs>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#06b6d4", stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: "#06b6d4", stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  <path className="chart-area" d="M0,50 L25,35 L50,42 L75,28 L100,38 L125,25 L150,30 L160,22 L160,70 L0,70 Z" fill="url(#gradient2)" />
                  <path className="chart-line" d="M0,50 L25,35 L50,42 L75,28 L100,38 L125,25 L150,30 L160,22" stroke="#06b6d4" strokeDasharray="300" strokeDashoffset="300" />
                </svg>
              </div>
              <div className="price-ticker ticker-1">
                <span style={{ color: "#94a3b8" }}>AAPL</span>
                <span className="ticker-price">$182.45</span>
                <span className="ticker-change up">+2.3%</span>
              </div>
              <div className="price-ticker ticker-2">
                <span style={{ color: "#94a3b8" }}>MSFT</span>
                <span className="ticker-price">$378.92</span>
                <span className="ticker-change up">+1.8%</span>
              </div>
            </div>

            {/* Hero Content */}
            <div className="hero-content">
              <div className="hero-badge">AI-Powered Financial Intelligence</div>
              <h1>
                <span className="word hero-gradient">ArthNiti.</span>
                <br />
                <span className="word">Turning</span>{" "}
                <span className="word">Financial</span>{" "}
                <span className="word">Data</span>{" "}
                <span className="word">Into</span>{" "}
                <span className="word">Financial</span>{" "}
                <span className="word">Decisions.</span>
              </h1>
              <p>
                Institutional-grade financial intelligence that helps you make smarter
                decisions, spot opportunities, and build lasting wealth.
              </p>
              <div className="hero-buttons">
                <a href="#start" className="btn btn-primary btn-magnetic" onMouseEnter={handleBtnEnter} onMouseLeave={handleBtnLeave}>
                  Let&apos;s Start
                </a>
                <a href="#features" className="btn btn-secondary btn-magnetic" onMouseEnter={handleBtnEnter} onMouseLeave={handleBtnLeave}>
                  See How It Works
                </a>
              </div>
            </div>

            <PhoneShowcase />

            {/* Stock Ticker */}
            <div className="stock-ticker">
              <div className="ticker-content">
                {[
                  { s: "AAPL", p: "$182.45", c: "+2.4%", d: "up" },
                  { s: "MSFT", p: "$378.90", c: "+1.8%", d: "up" },
                  { s: "GOOGL", p: "$141.20", c: "-0.5%", d: "down" },
                  { s: "TSLA", p: "$248.75", c: "+3.2%", d: "up" },
                  { s: "NVDA", p: "$495.30", c: "+5.1%", d: "up" },
                  { s: "BTC", p: "$67,890", c: "+4.7%", d: "up" },
                ].flatMap((t, i) => [
                  <div key={`a-${i}`} className="ticker-item">
                    <span className="ticker-symbol">{t.s}</span>
                    <span className="ticker-price">{t.p}</span>
                    <span className={`ticker-change ${t.d}`}>{t.c}</span>
                  </div>,
                  <div key={`b-${i}`} className="ticker-item">
                    <span className="ticker-symbol">{t.s}</span>
                    <span className="ticker-price">{t.p}</span>
                    <span className={`ticker-change ${t.d}`}>{t.c}</span>
                  </div>,
                ])}
              </div>
            </div>

            <div className="scroll-indicator" />
          </section>

          {/* ── FEATURES ── */}
          <section className="features" id="features">
            <div className="section-header reveal">
              <div className="section-label">Features</div>
              <h2 className="section-title">Everything you need for financial success</h2>
            </div>
            <div className="features-grid">
              {[
                { icon: "📊", title: "Financial Health Score", desc: "Real-time comprehensive analysis of your entire financial ecosystem with personalized insights." },
                { icon: "🎯", title: "Opportunity Detection", desc: "Advanced ML algorithms that identify high-probability opportunities before others do." },
                { icon: "💰", title: "Cash Flow Forecast", desc: "Predictive models with 95%+ accuracy to forecast your financial future with precision." },
                { icon: "🤖", title: "AI Financial Copilot", desc: "24/7 intelligent guidance that learns your goals and guides every decision." },
              ].map((f, i) => (
                <div key={i} className="feature-card reveal">
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── AI ENGINE ── */}
          <section className="ai-engine" id="ai">
            <div className="ai-grid">
              <div className="ai-content reveal">
                <div className="section-label">AI Engine</div>
                <h2>The intelligence behind institutional-grade wealth management</h2>
                <p>ArthNiti deploys cutting-edge AI architectures previously exclusive to hedge funds.</p>
                <ul className="ai-features-list">
                  <li>Deep learning for market pattern recognition</li>
                  <li>Natural language processing for financial news</li>
                  <li>Predictive modeling with 95%+ accuracy</li>
                  <li>Real-time risk assessment across 50+ factors</li>
                  <li>Autonomous portfolio optimization</li>
                  <li>Multi-modal analysis of 10M+ data sources</li>
                </ul>
              </div>
              <div className="ai-visual reveal">
                <div className="ai-logo">🧠</div>
                <div className="ai-stats">
                  {[
                    { n: "95%", l: "Prediction Accuracy" },
                    { n: "10M+", l: "Data Sources" },
                    { n: "24/7", l: "Market Monitoring" },
                    { n: "50+", l: "Risk Factors" },
                  ].map((s, i) => (
                    <div key={i} className="stat">
                      <div className="stat-number">{s.n}</div>
                      <div className="stat-label">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="cta-section" id="start">
            <div className="cta-container">
              <h2>Take control of your financial future</h2>
              <p>Join thousands building generational wealth with institutional-grade AI.</p>
              <div className="hero-buttons" style={{ marginTop: "36px" }}>
                <a href="#" className="btn btn-primary btn-magnetic" onMouseEnter={handleBtnEnter} onMouseLeave={handleBtnLeave}>
                  Let&apos;s Start
                </a>
                <a href="#" className="btn btn-secondary btn-magnetic" onMouseEnter={handleBtnEnter} onMouseLeave={handleBtnLeave}>
                  Request Demo
                </a>
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer>
            <div className="footer-content">
              <p>&copy; {new Date().getFullYear()} ArthNiti. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
