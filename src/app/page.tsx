"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Sun, Moon, Check } from "lucide-react";
import PhoneShowcase from "@/components/PhoneShowcase";
import Preloader from "@/components/Preloader";
import Hero3D from "@/components/Hero3D";
import InteractiveBrain from "@/components/InteractiveBrain";
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
      
      const revealsLeft = section.querySelectorAll(".reveal-left");
      revealsLeft.forEach((el) => {
        gsap.fromTo(
          el,
          { x: -50, opacity: 0 },
          { scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" }, x: 0, opacity: 1, duration: 1, ease: "power3.out" }
        );
      });

      const revealsRight = section.querySelectorAll(".reveal-right");
      revealsRight.forEach((el) => {
        gsap.fromTo(
          el,
          { x: 50, opacity: 0 },
          { scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" }, x: 0, opacity: 1, duration: 1, ease: "power3.out" }
        );
      });

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

            <PhoneShowcase />

            {/* Hero Content */}
            <div className="hero-content" style={{ marginTop: "-60px" }}>

              <h1>
                <span className="word">Turning</span>{" "}
                <span className="word hero-gradient">Financial</span>{" "}
                <span className="word">Data</span>{" "}
                <br />
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
                  Let&apos;s Start →
                </a>
              </div>
            </div>

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
              <h2 className="section-title">Everything You Need For Wealth</h2>
            </div>

            <div className="features-showcase">
              {/* Feature 1 - Image Left, Text Right */}
              <div className="feature-row">
                <div className="feature-visual reveal-left">
                  <div className="visual-glow" />
                  <Image src="/phone1_clear.png" alt="AI Financial Copilot" width={340} height={680} className="feature-phone" />
                </div>
                <div className="feature-content reveal-right">
                  <h3 className="feature-heading"><span className="feature-number">01</span> AI Financial Copilot</h3>
                  <p className="feature-description">
                    Your personal AI that tells you what to do with your money.
                    <br/><br/>
                    ArthNiti analyzes your complete financial profile — including income, spending, loans, and investments — and provides smart, actionable financial recommendations.
                    <br/><br/>
                    Example insights:
                  </p>
                  <ul className="feature-benefits">
                    <li>
                      <div className="check-circle"><Check size={18} strokeWidth={3} /></div>
                      <span>where to invest idle money</span>
                    </li>
                    <li>
                      <div className="check-circle"><Check size={18} strokeWidth={3} /></div>
                      <span>when to repay high-interest debt</span>
                    </li>
                    <li>
                      <div className="check-circle"><Check size={18} strokeWidth={3} /></div>
                      <span>how to optimize savings</span>
                    </li>
                  </ul>
                  <p className="feature-footer-text">
                    Instead of complex dashboards, the AI simply guides you with clear financial decisions.
                  </p>
                </div>
              </div>

              {/* Feature 2 - Text Left, Image Right */}
              <div className="feature-row">
                <div className="feature-content reveal-left">
                  <h3 className="feature-heading"><span className="feature-number">02</span> Smart Opportunity Detection</h3>
                  <p className="feature-description">
                    Automatically finds hidden financial opportunities.
                    <br/><br/>
                    ArthNiti scans your financial data and detects inefficiencies such as:
                  </p>
                  <ul className="feature-benefits">
                    <li>
                      <div className="check-circle"><Check size={18} strokeWidth={3} /></div>
                      <span>idle cash sitting in savings accounts</span>
                    </li>
                    <li>
                      <div className="check-circle"><Check size={18} strokeWidth={3} /></div>
                      <span>high-interest debt draining your money</span>
                    </li>
                    <li>
                      <div className="check-circle"><Check size={18} strokeWidth={3} /></div>
                      <span>poor investment allocation</span>
                    </li>
                  </ul>
                  <p className="feature-footer-text">
                    The system then generates AI-powered strategies to improve your financial position.
                  </p>
                </div>
                <div className="feature-visual reveal-right">
                  <div className="visual-glow" />
                  <Image src="/smart_opportunity_heatmap.png" alt="Smart Opportunity Detection" width={500} height={500} className="feature-heatmap" style={{ objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }} />
                </div>
              </div>

              {/* Feature 3 - Image Left, Text Right */}
              <div className="feature-row">
                <div className="feature-visual reveal-left">
                  <div className="visual-glow" />
                  <Image src="/predictive_cashflow.png" alt="Predictive Cash-Flow Intelligence" width={500} height={500} className="feature-heatmap" style={{ objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }} />
                </div>
                <div className="feature-content reveal-right">
                  <h3 className="feature-heading"><span className="feature-number">03</span> Predictive Cash-Flow Intelligence</h3>
                  <p className="feature-description">
                    See your financial future before it happens.
                    <br/><br/>
                    Using spending patterns and income data, ArthNiti predicts your future financial balance and alerts you about potential risks.
                    <br/><br/>
                    Example:
                  </p>
                  <ul className="feature-benefits">
                    <li>
                      <div className="check-circle"><Check size={18} strokeWidth={3} /></div>
                      <span>upcoming cash shortages</span>
                    </li>
                    <li>
                      <div className="check-circle"><Check size={18} strokeWidth={3} /></div>
                      <span>overspending patterns</span>
                    </li>
                    <li>
                      <div className="check-circle"><Check size={18} strokeWidth={3} /></div>
                      <span>savings potential</span>
                    </li>
                  </ul>
                  <p className="feature-footer-text">
                    This allows users to plan ahead and make smarter financial decisions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── MORE FEATURES (3D CARDS) ── */}
          <section className="more-features" id="more-features">
            <div className="section-header reveal">
              <h2 className="section-title">The Complete Financial Ecosystem</h2>
            </div>
            <div className="more-features-grid">
              {[
                { icon: "🧠", title: "Explainable AI Insights", desc: "Clear reasoning behind every AI recommendation." },
                { icon: "📊", title: "Unified Financial Dashboard", desc: "All bank accounts, investments, and liabilities in one place." },
                { icon: "💬", title: "AI Chat Advisor", desc: "Ask financial questions and get instant AI guidance." },
                { icon: "🎯", title: "Financial Goal Planner", desc: "Plan savings for future goals like travel, education, or home." },
                { icon: "🔔", title: "Smart Alerts", desc: "Real-time alerts for spending risks or financial opportunities." },
                { icon: "🥧", title: "Investment Allocation Insights", desc: "See how your investments are distributed and optimized." },
                { icon: "📉", title: "Spending Pattern Analysis", desc: "AI analyzes habits to improve financial discipline." },
                { icon: "🛡️", title: "Risk Monitoring", desc: "Detects financial risks before they become problems." },
              ].map((f, i) => (
                <div key={i} className="mf-card reveal">
                  <div className="mf-icon-3d">{f.icon}</div>
                  <h4>{f.title}</h4>
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
              <div className="ai-visual reveal" style={{ padding: 0, overflow: "hidden" }}>
                <InteractiveBrain theme={theme} />
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
