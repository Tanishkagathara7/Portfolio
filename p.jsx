import { useState, useEffect, useRef } from "react";

/* ─── Google Fonts ─────────────────────────────────────────────────── */
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  `}</style>
);

/* ─── Design tokens ──────────────────────────────────────────────────
 * Dark palette: near-black base + rust accent + indigo glow
 * ─────────────────────────────────────────────────────────────────── */
const T = {
  base:        "#0C0D11",
  surface:     "rgba(255,255,255,0.042)",
  surfaceHov:  "rgba(255,255,255,0.065)",
  border:      "rgba(255,255,255,0.08)",
  borderHov:   "rgba(255,255,255,0.15)",
  text:        "rgba(255,255,255,0.88)",
  muted:       "rgba(255,255,255,0.52)",
  faint:       "rgba(255,255,255,0.22)",
  rust:        "#D4673A",
  rustDim:     "rgba(212,103,58,0.14)",
  navBg:       "rgba(12,13,17,0.85)",
  sectionAlt:  "rgba(255,255,255,0.016)",
  tag:         "rgba(255,255,255,0.065)",
  tagText:     "rgba(255,255,255,0.52)",
  noiseUri:    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
};

/* ─── Global styles ──────────────────────────────────────────────────
 *
 * Background system (Stripe/Linear/Vercel level):
 *
 *   body              — solid #0A0B0F base (near-black, no gradient banding)
 *   body::before      — SVG fractalNoise grain at 1.5% opacity (film texture)
 *   body::after       — single diffused radial glow, top-left anchor, 5% opacity
 *
 * Hero glow div       — second soft radial behind heading text only
 *
 * Rules:
 *   • No diagonal gradients (causes visible streaks)
 *   • No repeating patterns or dots
 *   • All glow opacity ≤ 6% — background must feel invisible
 *   • Paragraph text bumped to 52% white for readability
 *
 * ─────────────────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }

    /* ── Layer 1: solid base ── */
    body {
      color: ${T.text};
      font-family: 'DM Sans', sans-serif;
      background-color: #0A0B0F;
    }

    /* ── Layer 2: grain texture at 1.5% — adds realism without pattern ── */
    body::before {
      content: '';
      position: fixed; inset: 0; z-index: 0;
      pointer-events: none;
      background-image: ${T.noiseUri};
      background-size: 200px 200px;
      background-repeat: repeat;
      opacity: 0.015;
    }

    /* ── Layer 3: ambient glow — single diffused ellipse, top-left, 5% ── */
    body::after {
      content: '';
      position: fixed; inset: 0; z-index: 0;
      pointer-events: none;
      background:
        radial-gradient(
          ellipse 80% 60% at 15% 20%,
          rgba(80, 90, 160, 0.05) 0%,
          transparent 70%
        );
    }

    body > * { position: relative; z-index: 1; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: ${T.base}; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    a { color: inherit; text-decoration: none; }
    ::selection { background: ${T.rust}; color: #fff; }

    .nav-link {
      position: relative; font-size: 13px; font-weight: 400;
      letter-spacing: 0.04em; color: ${T.muted}; transition: color 0.2s;
    }
    .nav-link::after {
      content: ''; position: absolute; bottom: -2px; left: 0;
      width: 0; height: 1px; background: ${T.rust}; transition: width 0.25s ease;
    }
    .nav-link:hover { color: ${T.text}; }
    .nav-link:hover::after { width: 100%; }

    .project-card {
      background: ${T.surface};
      border: 1px solid ${T.border};
      border-radius: 4px; padding: 2rem;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: background 0.25s, border-color 0.25s, transform 0.25s;
      cursor: default;
    }
    .project-card:hover {
      background: ${T.surfaceHov};
      border-color: ${T.borderHov};
      transform: translateY(-3px);
    }

    .btn-primary {
      display: inline-block; background: ${T.rust}; color: #fff;
      padding: 13px 28px; font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 500; letter-spacing: 0.06em;
      text-transform: uppercase; border: none; cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    .btn-primary:hover { background: #e07040; }
    .btn-primary:active { transform: scale(0.98); }

    .btn-outline {
      display: inline-block; background: transparent; color: ${T.text};
      padding: 12px 28px; font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 500; letter-spacing: 0.06em;
      text-transform: uppercase; border: 1px solid ${T.border}; cursor: pointer;
      transition: background 0.2s, border-color 0.2s, transform 0.15s;
    }
    .btn-outline:hover { background: rgba(255,255,255,0.06); border-color: ${T.borderHov}; }
    .btn-outline:active { transform: scale(0.98); }

    .skill-tag {
      display: inline-block; background: ${T.tag}; color: ${T.tagText};
      font-size: 11.5px; font-weight: 400; letter-spacing: 0.03em;
      padding: 5px 10px; border-radius: 2px;
      border: 1px solid rgba(255,255,255,0.06);
    }

    .icon-link {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase;
      color: ${T.muted}; transition: color 0.2s;
    }
    .icon-link:hover { color: ${T.rust}; }

    .tl-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: ${T.rust}; flex-shrink: 0; margin-top: 6px;
    }

    .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.55s ease, transform 0.55s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }

    @media (max-width: 768px) { .desktop-nav { display: none !important; } }
    @media (min-width: 769px) { .hamburger { display: none !important; } .mobile-menu { display: none !important; } }
  `}</style>
);

/* ─── Data ───────────────────────────────────────────────────────────── */
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
};

/* ─── Hooks ──────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
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
      backdropFilter: scrolled ? "blur(16px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${T.border}` : "none",
      transition: "all 0.3s ease",
    }}>
      <nav style={{
        maxWidth: 1120, margin: "0 auto", padding: "0 2rem",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="#" style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em", color: T.text }}>
          {DATA.name.split(" ")[0]}<span style={{ color: T.rust }}>.</span>
        </a>

        <div className="desktop-nav" style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
          {links.map(l => <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>)}
          <a href={`mailto:${DATA.contact.email}`} className="btn-primary" style={{ marginLeft: "0.5rem" }}>Hire me</a>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          aria-label="Toggle menu">
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 22, height: 1.5, background: T.text, marginBottom: i < 2 ? 5 : 0,
              transition: "all 0.2s",
              transform: menuOpen ? (i === 0 ? "rotate(45deg) translate(4px,4px)" : i === 2 ? "rotate(-45deg) translate(4px,-4px)" : "none") : "none",
              opacity: menuOpen && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" style={{
          display: "flex", flexDirection: "column", gap: "1.5rem",
          background: T.navBg, backdropFilter: "blur(16px)", padding: "2rem",
          borderTop: `1px solid ${T.border}`,
        }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}
              style={{ fontSize: 15, color: T.text }}>{l}</a>
          ))}
          <a href={`mailto:${DATA.contact.email}`} className="btn-primary" style={{ textAlign: "center" }}>Hire me</a>
        </div>
      )}
    </header>
  );
}

/* ─── Shared helpers ─────────────────────────────────────────────────── */
const Divider = () => (
  <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 2rem" }}>
    <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${T.border} 20%, ${T.border} 80%, transparent)` }} />
  </div>
);

function SectionLabel({ label }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: T.muted, marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ display: "inline-block", width: 16, height: 1, background: T.muted }} />
      {label}
    </p>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "8rem 2rem 4rem", maxWidth: 1120, margin: "0 auto", position: "relative" }}>
      {/* Hero glow — soft radial behind heading, heavily blurred, 6% opacity */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "-5%", left: "-15%",
        width: "65vw", height: "65vh",
        background: "radial-gradient(ellipse at 40% 40%, rgba(90,100,180,0.06) 0%, transparent 65%)",
        filter: "blur(60px)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{ maxWidth: 720, position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: T.rust, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-block", width: 24, height: 1, background: T.rust }} />
          {DATA.role}
        </p>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.02em", color: T.text, marginBottom: "1.75rem" }}>
          {DATA.name}
        </h1>

        <p style={{ fontSize: "clamp(1.05rem, 2vw, 1.2rem)", fontWeight: 300, lineHeight: 1.65, color: T.muted, maxWidth: 560, marginBottom: "2.5rem" }}>
          {DATA.tagline}
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <a href="#projects" className="btn-primary">View Work</a>
          <a href="#contact"  className="btn-outline">Get in Touch</a>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", marginTop: "3.5rem", alignItems: "center" }}>
          <a href={DATA.contact.github}   className="icon-link" target="_blank" rel="noreferrer"><GithubIcon />   GitHub</a>
          <a href={DATA.contact.linkedin} className="icon-link" target="_blank" rel="noreferrer"><LinkedinIcon /> LinkedIn</a>
          <a href={`mailto:${DATA.contact.email}`} className="icon-link"><MailIcon /> Email</a>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "2.5rem", right: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ width: 1, height: 48, background: `linear-gradient(to bottom, ${T.border}, transparent)` }} />
        <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.faint, writingMode: "vertical-lr" }}>scroll</span>
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
      <section id="about" style={{ padding: "6rem 2rem", maxWidth: 1120, margin: "0 auto" }}>
        <div ref={ref} className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "4rem", alignItems: "start" }}>
          <div>
            <SectionLabel label="About" />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "1.5rem", letterSpacing: "-0.015em", color: T.text }}>
              Engineer by discipline,<br /><em style={{ fontStyle: "italic", color: T.rust }}>pragmatist</em> by nature.
            </h2>
            {DATA.about.split("\n").filter(Boolean).map((p, i) => (
              <p key={i} style={{ fontSize: 15.5, lineHeight: 1.78, color: T.muted, marginBottom: "1rem", fontWeight: 300 }}>{p.trim()}</p>
            ))}
          </div>

          <div>
            <SectionLabel label="Skills" />
            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              {Object.entries(DATA.skills).map(([cat, items]) => (
                <div key={cat}>
                  <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: T.faint, marginBottom: "0.75rem" }}>{cat}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {items.map(s => <span key={s} className="skill-tag">{s}</span>)}
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

/* ─── Projects ───────────────────────────────────────────────────────── */
function Projects() {
  const ref = useReveal();
  return (
    <>
      <Divider />
      <section id="projects" style={{ padding: "6rem 2rem", background: T.sectionAlt }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <SectionLabel label="Projects" />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", fontWeight: 600, letterSpacing: "-0.015em", marginBottom: "3rem", color: T.text }}>
            Things I've built
          </h2>

          <div ref={ref} className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {DATA.projects.map(p => (
              <article key={p.title} className="project-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em", flex: 1, paddingRight: 12, color: T.text }}>
                    <a href={p.demo} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = T.rust} onMouseLeave={e => e.currentTarget.style.color = "inherit"}>{p.title}</a>
                  </h3>
                  <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                    <a href={p.github} target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"} aria-label="GitHub"><GithubIcon size={20} /></a>
                    <a href={p.demo}   target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"} aria-label="Demo"><ExternalIcon size={18} /></a>
                  </div>
                </div>

                <p style={{ fontSize: 14, lineHeight: 1.72, color: T.muted, fontWeight: 300, marginBottom: "1.25rem" }}>
                  {p.description}
                </p>

                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.rustDim, color: T.rust, padding: "5px 10px", borderRadius: 2, marginBottom: "1.25rem", border: "1px solid rgba(212,103,58,0.2)" }}>
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>Impact</span>
                  <span style={{ fontSize: 12.5 }}>{p.impact}</span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, borderTop: `1px solid ${T.border}`, paddingTop: "1rem" }}>
                  {p.stack.map(t => <span key={t} className="skill-tag">{t}</span>)}
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
      <section id="experience" style={{ padding: "6rem 2rem", maxWidth: 1120, margin: "0 auto" }}>
        <SectionLabel label="Experience" />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", fontWeight: 600, letterSpacing: "-0.015em", marginBottom: "3rem", color: T.text }}>
          Where I've worked
        </h2>

        <div ref={ref} className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "3rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {DATA.experience.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: "1.25rem" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className="tl-dot" />
                  {i < DATA.experience.length - 1 && <div style={{ width: 1, flex: 1, background: T.border, marginTop: 8 }} />}
                </div>
                <div style={{ paddingBottom: "1rem" }}>
                  <p style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: T.faint, marginBottom: 4 }}>{e.period}</p>
                  <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 2, color: T.text }}>{e.role}</h3>
                  <p style={{ fontSize: 13.5, color: T.rust, marginBottom: "0.75rem" }}>{e.company}</p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    {e.points.map((pt, j) => (
                      <li key={j} style={{ fontSize: 13.5, lineHeight: 1.65, color: T.muted, fontWeight: 300, display: "flex", gap: 8 }}>
                        <span style={{ color: T.rust, flexShrink: 0, marginTop: 2 }}>—</span>{pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: T.faint, marginBottom: "1.5rem" }}>Education</p>
            {DATA.education.map((e, i) => (
              <div key={i} style={{ borderLeft: `2px solid ${T.rust}`, paddingLeft: "1.25rem" }}>
                <p style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: T.faint, marginBottom: 4 }}>{e.year}</p>
                <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 3, color: T.text }}>{e.degree}</h3>
                <p style={{ fontSize: 13.5, color: T.muted, fontWeight: 300 }}>{e.school}</p>
              </div>
            ))}
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
  const [status, setStatus] = useState(null); // null | "sending" | "sent" | "error"

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setStatus("sending");
    // Opens default mail client with pre-filled fields
    const subject = encodeURIComponent(`Message from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:${DATA.contact.email}?subject=${subject}&body=${body}`;
    setTimeout(() => { setStatus("sent"); setForm({ name: "", email: "", message: "" }); }, 800);
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: `1px solid ${T.border}`, borderRadius: 4,
    padding: "13px 16px", color: T.text,
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 300,
    outline: "none", transition: "border-color 0.2s, background 0.2s",
  };

  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 500,
    letterSpacing: "0.08em", textTransform: "uppercase",
    color: T.muted, marginBottom: "0.5rem",
  };

  return (
    <>
      <Divider />
      <section id="contact" style={{ padding: "6rem 2rem 8rem", background: "rgba(0,0,0,0.18)", position: "relative", overflow: "hidden" }}>
        <div ref={ref} className="reveal" style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: T.rust, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", width: 24, height: 1, background: T.rust }} />
            Contact
          </p>

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "5rem", alignItems: "start" }}>

            {/* Left — copy */}
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 600, color: T.text, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
                Let's build something<br /><em style={{ fontStyle: "italic", color: T.rust }}>worth shipping.</em>
              </h2>
              <p style={{ fontSize: 15, fontWeight: 300, color: T.muted, marginBottom: "2.5rem", lineHeight: 1.75 }}>
                Open to new opportunities and collaborations. If you're working on something interesting, I'd love to hear from you.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <a href={`mailto:${DATA.contact.email}`} className="icon-link" style={{ fontSize: 13, textTransform: "none", letterSpacing: "0.02em" }}><MailIcon /> {DATA.contact.email}</a>
                <a href={DATA.contact.linkedin} target="_blank" rel="noreferrer" className="icon-link" style={{ fontSize: 13, textTransform: "none", letterSpacing: "0.02em" }}><LinkedinIcon /> LinkedIn</a>
                <a href={DATA.contact.github} target="_blank" rel="noreferrer" className="icon-link" style={{ fontSize: 13, textTransform: "none", letterSpacing: "0.02em" }}><GithubIcon /> GitHub</a>
              </div>
            </div>

            {/* Right — form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label htmlFor="cf-name" style={labelStyle}>Name</label>
                <input
                  id="cf-name" name="name" type="text"
                  placeholder="Your name" required
                  value={form.name} onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = T.rust; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                  onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                />
              </div>
              <div>
                <label htmlFor="cf-email" style={labelStyle}>Email</label>
                <input
                  id="cf-email" name="email" type="email"
                  placeholder="your@email.com" required
                  value={form.email} onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = T.rust; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                  onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                />
              </div>
              <div>
                <label htmlFor="cf-message" style={labelStyle}>Message</label>
                <textarea
                  id="cf-message" name="message"
                  placeholder="Your message here..." required rows={6}
                  value={form.message} onChange={handleChange}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 140 }}
                  onFocus={e => { e.target.style.borderColor = T.rust; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                  onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                />
              </div>
              <button type="submit" disabled={status === "sending"}
                style={{
                  width: "100%", padding: "15px 28px",
                  background: status === "sent" ? "rgba(212,103,58,0.15)" : T.rust,
                  border: status === "sent" ? `1px solid ${T.rust}` : "none",
                  color: "#fff", fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, fontWeight: 500, letterSpacing: "0.06em",
                  textTransform: "uppercase", borderRadius: 4, cursor: status === "sending" ? "wait" : "pointer",
                  transition: "background 0.2s, transform 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
                onMouseEnter={e => { if (status !== "sent") e.currentTarget.style.background = "#e07040"; }}
                onMouseLeave={e => { if (status !== "sent") e.currentTarget.style.background = T.rust; }}
              >
                {status === "sending" ? "Opening mail client…" : status === "sent" ? "✓ Message ready to send" : <>Send Message <span style={{ fontSize: 16 }}>→</span></>}
              </button>
            </form>
          </div>

          {/* Footer bar */}
          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: "5rem", paddingTop: "2rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: T.faint }}>
              {DATA.name.split(" ")[0]}<span style={{ color: T.rust }}>.</span>
            </span>
            <span style={{ fontSize: 12, color: T.faint, letterSpacing: "0.04em" }}>
              © {new Date().getFullYear()} · Built with care
            </span>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {[{ href: DATA.contact.github, icon: <GithubIcon /> }, { href: DATA.contact.linkedin, icon: <LinkedinIcon /> }].map(({ href, icon }, i) => (
                <a key={i} href={href} target="_blank" rel="noreferrer"
                  style={{ color: T.faint, transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = T.text}
                  onMouseLeave={e => e.currentTarget.style.color = T.faint}>
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