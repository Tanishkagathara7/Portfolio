import { useState, useEffect, useRef } from "react";

/* ─── Google Fonts ──────────────────────────────────────────────────── */
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=Syne:wght@400;600;700;800&display=swap');
  `}</style>
);

/* ─── Design Tokens ─────────────────────────────────────────────────── */
const T = {
  black:       "#000000",
  surface:     "#0a0a0a",
  surfaceCard: "#0f0f0f",
  border:      "rgba(255,255,255,0.07)",
  borderHov:   "rgba(245,166,35,0.55)",
  orange:      "#F5A623",
  orangeDim:   "rgba(245,166,35,0.12)",
  orangeGlow:  "rgba(245,166,35,0.08)",
  text:        "#E5E5E5",
  muted:       "#888888",
  faint:       "rgba(255,255,255,0.2)",
  navBg:       "rgba(0,0,0,0.92)",
  noiseUri: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
};

/* ─── Global Styles ─────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }

    body {
      background-color: ${T.black};
      color: ${T.text};
      font-family: 'DM Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* Grain texture overlay */
    body::before {
      content: '';
      position: fixed; inset: 0; z-index: 0;
      pointer-events: none;
      background-image: ${T.noiseUri};
      background-size: 180px 180px;
      background-repeat: repeat;
      opacity: 0.028;
    }

    body > * { position: relative; z-index: 1; }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: ${T.black}; }
    ::-webkit-scrollbar-thumb { background: ${T.orange}; border-radius: 0; }

    a { color: inherit; text-decoration: none; }
    ::selection { background: ${T.orange}; color: #000; }

    /* ── Nav links ── */
    .nav-link {
      position: relative;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px; font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: ${T.muted};
      transition: color 0.2s;
    }
    .nav-link:hover { color: ${T.orange}; }

    /* ── Reveal animation ── */
    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1);
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }

    /* ── Project cards ── */
    .project-card {
      background: ${T.surfaceCard};
      border: 1px solid ${T.border};
      padding: 2rem;
      transition: border-color 0.3s, transform 0.3s;
      cursor: default;
      position: relative;
      overflow: hidden;
    }
    .project-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0;
      height: 2px;
      background: ${T.orange};
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
    }
    .project-card:hover { border-color: ${T.borderHov}; transform: translateY(-4px); }
    .project-card:hover::before { transform: scaleX(1); }

    /* ── Skill row ── */
    .skill-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 0;
      border-bottom: 1px solid ${T.border};
      transition: background 0.2s;
      cursor: default;
    }
    .skill-row:hover .skill-name { color: ${T.orange}; }
    .skill-name { font-size: 14px; font-weight: 400; color: ${T.text}; transition: color 0.2s; letter-spacing: 0.02em; }
    .skill-arrow { color: ${T.orange}; font-size: 14px; font-weight: 600; }

    /* ── Buttons ── */
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      background: ${T.orange}; color: #000;
      padding: 13px 28px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase;
      border: none; cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    .btn-primary:hover { background: #ffb84d; }
    .btn-primary:active { transform: scale(0.98); }

    .btn-outline {
      display: inline-flex; align-items: center; gap: 8px;
      background: transparent; color: ${T.text};
      padding: 12px 28px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase;
      border: 1px solid rgba(255,255,255,0.18); cursor: pointer;
      transition: border-color 0.2s, color 0.2s, transform 0.15s;
    }
    .btn-outline:hover { border-color: ${T.orange}; color: ${T.orange}; }
    .btn-outline:active { transform: scale(0.98); }

    /* ── Icon links ── */
    .icon-link {
      display: inline-flex; align-items: center; gap: 7px;
      font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
      color: ${T.muted}; transition: color 0.2s;
    }
    .icon-link:hover { color: ${T.orange}; }

    /* ── Section divider ── */
    .section-divider {
      width: 100%; height: 1px;
      background: linear-gradient(to right, transparent, ${T.border} 20%, ${T.border} 80%, transparent);
    }

    /* ── Mobile ── */
    @media (max-width: 768px) {
      .desktop-nav { display: none !important; }
    }
    @media (min-width: 769px) {
      .hamburger { display: none !important; }
      .mobile-menu { display: none !important; }
    }
    @media (max-width: 640px) {
      .hero-stats { flex-direction: column !important; gap: 1.5rem !important; }
      .hero-cta { flex-direction: column !important; }
      .hero-cta a { width: 100%; text-align: center; justify-content: center; }
    }
  `}</style>
);

/* ─── Data (unchanged) ───────────────────────────────────────────────── */
const DATA = {
  name:    "Tanish Kagathara",
  role:    "Software Engineer",
  tagline: "I build systems that hold up under pressure — and interfaces people actually enjoy using.",
  about:   `I'm a results-driven Full Stack Developer with hands-on experience in designing and developing responsive web and mobile applications. Specialized in React, Node.js, Next.js, Express, MongoDB, and Flutter. I craft clean, scalable, and user-friendly solutions that solve real-world problems.
With a passion for modern technology and clean code, I've successfully delivered multiple projects from concept to production, always focusing on user experience and performance optimization.`,
  skills: {
    Frontend: ["TypeScript", "React", "Next.js", "CSS/Tailwind", "Accessible HTML"],
    Backend:  ["Node.js", "NestJS", "Python", "MongoDB", "SQL"],
  },
  projects: [
    {
      title: "Chess Result Tracker",
      description: "A chess results tracking and analysis system that processes game data and presents structured insights on player performance. Implements data handling and transformation logic to efficiently categorize match outcomes (wins, losses, draws) and visualize trends. Designed with a clean, intuitive interface focused on usability and clarity.",
      stack: ["React", "JavaScript", "Data Visualization"],
      impact: "Structured game insights with clear win/loss/draw trend analysis",
      github: "https://github.com/Tanishkagathara7/chess-results",
      demo: "https://chess-results-xi.vercel.app/",
    },
    {
      title: "Plagiarism Control",
      description: "A plagiarism detection web application that analyzes textual similarity between inputs and generates a similarity score. Implements text processing and comparison logic to identify overlapping patterns and potential duplication. Designed a clean, responsive interface to provide real-time feedback, focusing on usability and performance.",
      stack: ["React", "JavaScript", "Text Processing", "NLP"],
      impact: "Real-time similarity scoring with pattern-level duplication detection",
      github: "https://github.com/Tanishkagathara7/Plagiarism_Control",
      demo: "https://plagiarism-control.vercel.app/",
    },
    {
      title: "Billing & Inventory Management System",
      description: "Developed a billing and inventory management system to streamline product tracking, stock updates, and transaction handling. Implemented structured data management for items, pricing, and quantities, enabling efficient billing workflows and real-time stock monitoring. Designed a clean and responsive interface focused on usability and operational efficiency.",
      stack: ["React", "JavaScript", "Data Management", "Responsive UI"],
      impact: "Streamlined billing workflows with real-time stock monitoring",
      github: "https://github.com/Tanishkagathara7/billing_management",
      demo: "https://biiling-stock-mangement.vercel.app/",
    },
  ],
  experience: [
    {
      role: "Teaching Assistant", company: "Darshan University — Rajkot, IN", period: "12/2024 – 10/2025",
      points: [
        "Assisted in teaching and mentoring undergraduate students in Flutter and JavaScript.",
        "Conducted practical sessions and guided students in writing efficient, structured code.",
        "Helped students understand real-world applications of programming through interactive examples and discussions.",
        "Supported faculty in evaluating assignments, resolving doubts, and ensuring consistent student progress.",
        "Collaborated with students to build small projects that enhanced their confidence in web development concepts.",
      ],
    },
  ],
  education: [
    { degree: "B.Tech — Computer Engineering", school: "Darshan University — Rajkot, IN", year: "2023 – 2027" },
  ],
  contact: {
    email: "kagatharatanish@gmail.com",
    github: "https://github.com",
    linkedin: "https://www.linkedin.com/in/tanish-kagathara-83ba26229/",
  },
  stats: [
    { value: "2+",   label: "Years\nExperience" },
    { value: "5+",   label: "Projects\nDelivered" },
    { value: "100%", label: "Client\nSatisfaction" },
  ],
};

/* ─── Hooks ──────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Icons ──────────────────────────────────────────────────────────── */
const GithubIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);
const LinkedinIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const MailIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const ExternalIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

/* ─── Shared helpers ─────────────────────────────────────────────────── */
const Divider = () => <div className="section-divider" />;

function SectionLabel({ label }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 600, letterSpacing: "0.18em",
      textTransform: "uppercase", color: T.orange,
      marginBottom: "1.25rem",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ color: T.orange, fontSize: 16, lineHeight: 1 }}>●</span>
      {label}
    </p>
  );
}

/* ─── Nav ────────────────────────────────────────────────────────────── */
function Nav({ menuOpen, setMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["About", "Projects", "Experience", "Contact"];

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? T.navBg : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${T.border}` : "none",
      transition: "all 0.35s ease",
    }}>
      <nav style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 2rem",
        height: 68, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <a href="#" style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 26, letterSpacing: "0.08em",
          color: T.text, lineHeight: 1,
        }}>
          {DATA.name.split(" ")[0]}<span style={{ color: T.orange }}>.</span>
        </a>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
          ))}
          <a href={`mailto:${DATA.contact.email}`} className="btn-primary" style={{ marginLeft: "0.5rem" }}>
            Hire Me
          </a>
        </div>

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 24, height: 1.5, background: T.text, marginBottom: i < 2 ? 6 : 0,
              transition: "all 0.25s",
              transform: menuOpen
                ? (i === 0 ? "rotate(45deg) translate(5px,5px)" : i === 2 ? "rotate(-45deg) translate(5px,-5px)" : "none")
                : "none",
              opacity: menuOpen && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          display: "flex", flexDirection: "column", gap: "1.5rem",
          background: T.navBg, backdropFilter: "blur(20px)",
          padding: "2rem", borderTop: `1px solid ${T.border}`,
        }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}
              style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: T.text }}>
              {l}
            </a>
          ))}
          <a href={`mailto:${DATA.contact.email}`} className="btn-primary" style={{ textAlign: "center", justifyContent: "center" }}>
            Hire Me
          </a>
        </div>
      )}
    </header>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────── */
function Hero() {
  const nameRef = useRef(null);
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    setTimeout(() => {
      el.style.transition = "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 100);
  }, []);

  const firstName = DATA.name.split(" ")[0];
  const lastName  = DATA.name.split(" ")[1];

  return (
    <section style={{
      minHeight: "100vh",
      background: T.black,
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "9rem 2rem 5rem",
      maxWidth: 1200, margin: "0 auto",
      position: "relative",
    }}>

      {/* Orange ambient glow */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "10%", right: "-5%",
        width: "50vw", height: "60vh",
        background: "radial-gradient(ellipse at 60% 40%, rgba(245,166,35,0.06) 0%, transparent 65%)",
        filter: "blur(80px)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900 }}>
        {/* Pre-label */}
        <p style={{
          fontSize: 12, fontWeight: 600, letterSpacing: "0.2em",
          textTransform: "uppercase", color: T.orange,
          marginBottom: "1.5rem",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{
            display: "inline-block", width: 32, height: 1.5,
            background: T.orange,
          }} />
          {DATA.role}
        </p>

        {/* Giant name */}
        <div ref={nameRef} style={{ marginBottom: "1.5rem", lineHeight: 0.9 }}>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(4.5rem, 14vw, 11rem)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            color: T.text,
            display: "block",
          }}>
            {firstName}
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(4.5rem, 14vw, 11rem)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            color: T.orange,
            display: "block",
          }}>
            {lastName}
          </div>
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
          fontWeight: 300, lineHeight: 1.7,
          color: T.muted, maxWidth: 520,
          marginBottom: "2.5rem",
        }}>
          {DATA.tagline}
        </p>

        {/* CTA buttons */}
        <div className="hero-cta" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "4rem" }}>
          <a href="#projects" className="btn-primary">View Work →</a>
          <a href="#contact" className="btn-outline">Get in Touch</a>
        </div>

        {/* Stats row */}
        <div className="hero-stats" style={{
          display: "flex", gap: "3.5rem",
          borderTop: `1px solid ${T.border}`,
          paddingTop: "2.5rem",
        }}>
          {DATA.stats.map((s, i) => (
            <div key={i}>
              <div style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                color: T.orange, lineHeight: 1,
                marginBottom: "0.35rem",
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 500,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: T.muted, lineHeight: 1.5,
                whiteSpace: "pre-line",
              }}>
                {s.label}
              </div>
            </div>
          ))}

          {/* Separator + socials */}
          <div style={{ marginLeft: "auto", display: "flex", gap: "1.5rem", alignItems: "flex-end" }}>
            <a href={DATA.contact.github}   className="icon-link" target="_blank" rel="noreferrer"><GithubIcon />GitHub</a>
            <a href={DATA.contact.linkedin} className="icon-link" target="_blank" rel="noreferrer"><LinkedinIcon />LinkedIn</a>
            <a href={`mailto:${DATA.contact.email}`} className="icon-link"><MailIcon />Email</a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: "2.5rem", right: "2rem",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      }}>
        <div style={{ width: 1, height: 56, background: `linear-gradient(to bottom, ${T.orange}, transparent)` }} />
        <span style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: T.muted, writingMode: "vertical-lr" }}>scroll</span>
      </div>
    </section>
  );
}

/* ─── About ──────────────────────────────────────────────────────────── */
function About() {
  const ref = useReveal();
  return (
    <>
      <Divider />
      <section id="about" style={{ padding: "7rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <div ref={ref} className="reveal" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "5rem", alignItems: "start",
        }}>

          {/* Left — about text */}
          <div>
            <SectionLabel label="About Me" />
            <h2 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              fontWeight: 400, letterSpacing: "0.03em",
              color: T.text, lineHeight: 1.05,
              marginBottom: "2rem",
            }}>
              Engineer by discipline,<br />
              <span style={{ color: T.orange }}>pragmatist</span> by nature.
            </h2>
            {DATA.about.split("\n").filter(Boolean).map((p, i) => (
              <p key={i} style={{
                fontSize: 15, lineHeight: 1.85,
                color: T.muted, marginBottom: "1.1rem", fontWeight: 300,
              }}>{p.trim()}</p>
            ))}
          </div>

          {/* Right — skills list */}
          <div>
            <SectionLabel label="Skills" />
            {Object.entries(DATA.skills).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: "2.5rem" }}>
                <p style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.18em",
                  textTransform: "uppercase", color: T.faint,
                  marginBottom: "0.5rem",
                }}>
                  — {cat}
                </p>
                <div>
                  {items.map(skill => (
                    <div key={skill} className="skill-row">
                      <span className="skill-name">{skill}</span>
                      <span className="skill-arrow">→</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Projects ───────────────────────────────────────────────────────── */
function Projects() {
  const ref = useReveal();
  return (
    <>
      <Divider />
      <section id="projects" style={{ padding: "7rem 2rem", background: T.surface }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionLabel label="Projects" />
          <h2 style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
            fontWeight: 400, letterSpacing: "0.03em",
            color: T.text, marginBottom: "3.5rem",
            lineHeight: 1.05,
          }}>
            Things I've <span style={{ color: T.orange }}>Built</span>
          </h2>

          <div ref={ref} className="reveal" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}>
            {DATA.projects.map(p => (
              <article key={p.title} className="project-card">

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  <h3 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 18, fontWeight: 700, lineHeight: 1.3,
                    color: T.text, flex: 1, paddingRight: 12,
                  }}>
                    <a
                      href={p.demo} target="_blank" rel="noreferrer"
                      style={{ color: "inherit", transition: "color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = T.orange}
                      onMouseLeave={e => e.currentTarget.style.color = T.text}
                    >
                      {p.title}
                    </a>
                  </h3>
                  <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                    <a href={p.github} target="_blank" rel="noreferrer"
                      style={{ color: T.muted, transition: "color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = T.orange}
                      onMouseLeave={e => e.currentTarget.style.color = T.muted}
                      aria-label="GitHub">
                      <GithubIcon size={18} />
                    </a>
                    <a href={p.demo} target="_blank" rel="noreferrer"
                      style={{ color: T.muted, transition: "color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = T.orange}
                      onMouseLeave={e => e.currentTarget.style.color = T.muted}
                      aria-label="Demo">
                      <ExternalIcon size={17} />
                    </a>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: 13.5, lineHeight: 1.78, color: T.muted, fontWeight: 300, marginBottom: "1.25rem" }}>
                  {p.description}
                </p>

                {/* Impact badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: T.orangeDim, padding: "6px 12px",
                  border: `1px solid rgba(245,166,35,0.2)`,
                  marginBottom: "1.25rem",
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: T.orange, flexShrink: 0, display: "inline-block",
                  }} />
                  <span style={{ fontSize: 12, color: T.orange, fontWeight: 400 }}>{p.impact}</span>
                </div>

                {/* Stack tags */}
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 6,
                  borderTop: `1px solid ${T.border}`, paddingTop: "1rem",
                }}>
                  {p.stack.map(t => (
                    <span key={t} style={{
                      fontSize: 11, fontWeight: 500,
                      letterSpacing: "0.06em", textTransform: "uppercase",
                      color: T.muted, padding: "4px 10px",
                      border: `1px solid ${T.border}`,
                      background: "rgba(255,255,255,0.03)",
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Experience ─────────────────────────────────────────────────────── */
function Experience() {
  const ref = useReveal();
  return (
    <>
      <Divider />
      <section id="experience" style={{ padding: "7rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <SectionLabel label="Experience & Education" />
        <h2 style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
          fontWeight: 400, letterSpacing: "0.03em",
          color: T.text, marginBottom: "4rem", lineHeight: 1.05,
        }}>
          Where I've <span style={{ color: T.orange }}>Worked</span>
        </h2>

        <div ref={ref} className="reveal" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "5rem",
        }}>
          {/* Experience timeline */}
          <div>
            <p style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.18em",
              textTransform: "uppercase", color: T.faint, marginBottom: "2rem",
            }}>
              — Work Experience
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              {DATA.experience.map((e, i) => (
                <div key={i} style={{ display: "flex", gap: "1.5rem" }}>
                  {/* Timeline spine */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: T.orange, flexShrink: 0,
                      boxShadow: `0 0 12px ${T.orange}`,
                    }} />
                    {i < DATA.experience.length - 1 && (
                      <div style={{ width: 1, flex: 1, background: T.border, marginTop: 8 }} />
                    )}
                  </div>
                  {/* Content */}
                  <div>
                    <p style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
                      textTransform: "uppercase", color: T.orange,
                      marginBottom: 6,
                    }}>
                      {e.period}
                    </p>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 4 }}>{e.role}</h3>
                    <p style={{ fontSize: 13, color: T.muted, marginBottom: "1rem", fontStyle: "italic" }}>{e.company}</p>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                      {e.points.map((pt, j) => (
                        <li key={j} style={{ fontSize: 13.5, lineHeight: 1.7, color: T.muted, fontWeight: 300, display: "flex", gap: 10 }}>
                          <span style={{ color: T.orange, flexShrink: 0, marginTop: 2 }}>—</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <p style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.18em",
              textTransform: "uppercase", color: T.faint, marginBottom: "2rem",
            }}>
              — Education
            </p>
            {DATA.education.map((e, i) => (
              <div key={i} style={{
                borderLeft: `2px solid ${T.orange}`,
                paddingLeft: "1.5rem",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", left: -5, top: 0,
                  width: 10, height: 10, borderRadius: "50%",
                  background: T.orange, boxShadow: `0 0 10px ${T.orange}`,
                }} />
                <p style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: 22, color: T.orange, letterSpacing: "0.06em",
                  marginBottom: 8,
                }}>
                  {e.year}
                </p>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 4 }}>{e.degree}</h3>
                <p style={{ fontSize: 13.5, color: T.muted, fontWeight: 300 }}>{e.school}</p>
              </div>
            ))}

            {/* Skills progress bars */}
            <div style={{ marginTop: "3.5rem" }}>
              <p style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.18em",
                textTransform: "uppercase", color: T.faint, marginBottom: "1.5rem",
              }}>
                — Core Proficiency
              </p>
              {[
                { name: "React / Next.js",  pct: 90 },
                { name: "Node.js / Express", pct: 85 },
                { name: "TypeScript",        pct: 82 },
                { name: "MongoDB / SQL",     pct: 78 },
                { name: "Python",            pct: 70 },
              ].map(bar => (
                <div key={bar.name} style={{ marginBottom: "1.1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, color: T.text, fontWeight: 400 }}>{bar.name}</span>
                    <span style={{ fontSize: 12, color: T.orange, fontWeight: 600 }}>{bar.pct}%</span>
                  </div>
                  <div style={{ height: 2, background: T.border, width: "100%", position: "relative" }}>
                    <div style={{
                      position: "absolute", left: 0, top: 0, height: "100%",
                      width: `${bar.pct}%`,
                      background: `linear-gradient(to right, ${T.orange}, #ffb84d)`,
                      boxShadow: `0 0 8px rgba(245,166,35,0.5)`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Contact ────────────────────────────────────────────────────────── */
function Contact() {
  const ref = useReveal();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setStatus("sending");
    const subject = encodeURIComponent(`Message from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:${DATA.contact.email}?subject=${subject}&body=${body}`;
    setTimeout(() => { setStatus("sent"); setForm({ name: "", email: "", message: "" }); }, 800);
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.03)",
    border: `1px solid ${T.border}`,
    padding: "14px 16px", color: T.text,
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 300,
    outline: "none", transition: "border-color 0.2s, background 0.2s",
    borderRadius: 0,
  };
  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 600,
    letterSpacing: "0.12em", textTransform: "uppercase",
    color: T.muted, marginBottom: "0.6rem",
  };

  return (
    <>
      <Divider />
      <section id="contact" style={{ padding: "7rem 2rem 4rem", background: T.black, position: "relative", overflow: "hidden" }}>

        {/* Glow */}
        <div aria-hidden="true" style={{
          position: "absolute", bottom: "-10%", left: "-5%",
          width: "50vw", height: "50vh",
          background: `radial-gradient(ellipse at 30% 60%, ${T.orangeGlow} 0%, transparent 65%)`,
          filter: "blur(80px)", pointerEvents: "none",
        }} />

        <div ref={ref} className="reveal" style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <SectionLabel label="Contact" />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "5rem", alignItems: "start",
          }}>
            {/* Left */}
            <div>
              <h2 style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(2.8rem, 5.5vw, 4.5rem)",
                fontWeight: 400, letterSpacing: "0.03em",
                color: T.text, lineHeight: 1.0, marginBottom: "1.5rem",
              }}>
                Let's build something<br />
                <span style={{ color: T.orange }}>worth shipping.</span>
              </h2>
              <p style={{ fontSize: 15, fontWeight: 300, color: T.muted, lineHeight: 1.8, marginBottom: "2.5rem" }}>
                Open to new opportunities and collaborations. If you're working on something interesting, I'd love to hear from you.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                <a href={`mailto:${DATA.contact.email}`} className="icon-link"
                  style={{ fontSize: 13, textTransform: "none", letterSpacing: "0.02em" }}>
                  <MailIcon /> {DATA.contact.email}
                </a>
                <a href={DATA.contact.linkedin} target="_blank" rel="noreferrer" className="icon-link"
                  style={{ fontSize: 13, textTransform: "none", letterSpacing: "0.02em" }}>
                  <LinkedinIcon /> LinkedIn
                </a>
                <a href={DATA.contact.github} target="_blank" rel="noreferrer" className="icon-link"
                  style={{ fontSize: 13, textTransform: "none", letterSpacing: "0.02em" }}>
                  <GithubIcon /> GitHub
                </a>
              </div>
            </div>

            {/* Right — form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label htmlFor="cf-name" style={labelStyle}>Name</label>
                <input id="cf-name" name="name" type="text" placeholder="Your name" required
                  value={form.name} onChange={handleChange} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = T.orange; e.target.style.background = "rgba(245,166,35,0.04)"; }}
                  onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = "rgba(255,255,255,0.03)"; }}
                />
              </div>
              <div>
                <label htmlFor="cf-email" style={labelStyle}>Email</label>
                <input id="cf-email" name="email" type="email" placeholder="your@email.com" required
                  value={form.email} onChange={handleChange} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = T.orange; e.target.style.background = "rgba(245,166,35,0.04)"; }}
                  onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = "rgba(255,255,255,0.03)"; }}
                />
              </div>
              <div>
                <label htmlFor="cf-message" style={labelStyle}>Message</label>
                <textarea id="cf-message" name="message" placeholder="Your message here..." required rows={6}
                  value={form.message} onChange={handleChange}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 140 }}
                  onFocus={e => { e.target.style.borderColor = T.orange; e.target.style.background = "rgba(245,166,35,0.04)"; }}
                  onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = "rgba(255,255,255,0.03)"; }}
                />
              </div>
              <button
                type="submit" disabled={status === "sending"}
                className="btn-primary"
                style={{
                  width: "100%", justifyContent: "center",
                  background: status === "sent" ? "transparent" : T.orange,
                  color: status === "sent" ? T.orange : "#000",
                  border: status === "sent" ? `1px solid ${T.orange}` : "none",
                  padding: "16px 28px", fontSize: 13,
                  cursor: status === "sending" ? "wait" : "pointer",
                }}
              >
                {status === "sending" ? "Opening mail client…" : status === "sent" ? "✓ Message ready to send" : "Send Message →"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: `1px solid ${T.border}`,
            marginTop: "6rem", paddingTop: "2rem",
            display: "flex", justifyContent: "space-between",
            flexWrap: "wrap", gap: "1rem", alignItems: "center",
          }}>
            <span style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 22, letterSpacing: "0.08em", color: T.faint,
            }}>
              {DATA.name.split(" ")[0]}<span style={{ color: T.orange }}>.</span>
            </span>
            <span style={{ fontSize: 12, color: T.muted, letterSpacing: "0.06em" }}>
              © {new Date().getFullYear()} · Built with care
            </span>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {[
                { href: DATA.contact.github,   icon: <GithubIcon /> },
                { href: DATA.contact.linkedin, icon: <LinkedinIcon /> },
              ].map(({ href, icon }, i) => (
                <a key={i} href={href} target="_blank" rel="noreferrer"
                  style={{ color: T.muted, transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = T.orange}
                  onMouseLeave={e => e.currentTarget.style.color = T.muted}>
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── App ────────────────────────────────────────────────────────────── */
export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <FontLink />
      <GlobalStyles />
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Contact />
      </main>
    </>
  );
}