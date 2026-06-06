const fs = require('fs');
let content = fs.readFileSync('p.jsx', 'utf8');

const oldReveal = `    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1);
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }`;

const newReveal = `    .reveal {
      opacity: 0;
      filter: blur(12px);
      transform: translateY(40px) scale(0.96);
      transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), 
                  transform 0.8s cubic-bezier(0.16,1,0.3,1),
                  filter 0.8s cubic-bezier(0.16,1,0.3,1);
      will-change: opacity, transform, filter;
    }
    .reveal.visible { 
      opacity: 1; 
      filter: blur(0);
      transform: translateY(0) scale(1); 
    }`;
if (content.includes(oldReveal)) {
  content = content.replace(oldReveal, newReveal);
} else {
  console.log("Could not find oldReveal");
}

const oldKeyframes = `    @media (min-width: 769px) {`;
const newKeyframes = `    /* ── Premium Background Keyframes ── */
    @keyframes gridScroll {
      0% { transform: perspective(1000px) rotateX(60deg) translateY(0) translateZ(-200px); }
      100% { transform: perspective(1000px) rotateX(60deg) translateY(100px) translateZ(-200px); }
    }
    @keyframes orbFloat1 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(15vw, 15vh) scale(1.1); }
    }
    @keyframes orbFloat2 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(-15vw, -10vh) scale(1.15); }
    }

    @media (min-width: 769px) {`;
if (content.includes(oldKeyframes)) content = content.replace(oldKeyframes, newKeyframes);

const hooksSection = `/* ─── Hooks ──────────────────────────────────────────────────────────── */`;
const premiumComponents = `
/* ─── Premium Background & Scroll ────────────────────────────────────── */
function PremiumBackground() {
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: -200,
        backgroundImage: \`linear-gradient(to right, rgba(255,255,255,0.012) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255,255,255,0.012) 1px, transparent 1px)\`,
        backgroundSize: '100px 100px',
        maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
        animation: 'gridScroll 20s linear infinite',
      }} />
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(245,166,35,0.04) 0%, transparent 60%)',
        filter: 'blur(120px)',
        animation: 'orbFloat1 25s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '60vw', height: '60vw',
        background: 'radial-gradient(circle, rgba(245,166,35,0.025) 0%, transparent 60%)',
        filter: 'blur(140px)',
        animation: 'orbFloat2 30s ease-in-out infinite alternate-reverse',
      }} />
    </div>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let rafId;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const h = document.documentElement;
        const st = h.scrollTop || document.body.scrollTop;
        const sh = h.scrollHeight || document.body.scrollHeight;
        const pct = (st / (sh - h.clientHeight)) * 100;
        setProgress(pct);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, height: 3, zIndex: 10000,
      background: \`linear-gradient(to right, #F5A623, #ffcc80)\`,
      width: \`\${progress}%\`,
      boxShadow: \`0 0 14px rgba(245,166,35,0.6)\`,
      transition: 'width 0.1s ease-out'
    }} />
  );
}

`;
if (content.includes(hooksSection)) content = content.replace(hooksSection, premiumComponents + hooksSection);

const oldApp = `      <Cursor />
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />`;
const newApp = `      <Cursor />
      <ScrollProgress />
      <PremiumBackground />
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />`;
if (content.includes(oldApp)) content = content.replace(oldApp, newApp);

const oldHero = `function Hero() {
  const nameRef = useReveal();

  const firstName = DATA.name.split(" ")[0];
  const lastName  = DATA.name.split(" ")[1];

  return (
    <section style={{`;
const newHero = `function Hero() {
  const nameRef = useReveal();
  const heroContentRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let rafId;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (heroContentRef.current) {
          heroContentRef.current.style.transform = \`translateY(\${y * 0.3}px)\`;
          heroContentRef.current.style.opacity = Math.max(1 - y / 700, 0);
        }
        if (glowRef.current) {
          glowRef.current.style.transform = \`translateY(\${y * 0.5}px)\`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const firstName = DATA.name.split(" ")[0];
  const lastName  = DATA.name.split(" ")[1];

  return (
    <section style={{`;
if (content.includes(oldHero)) content = content.replace(oldHero, newHero);

const oldGlow = `      <div aria-hidden="true" style={{
        position: "absolute", top: "10%", right: "-5%",`;
const newGlow = `      <div ref={glowRef} aria-hidden="true" style={{
        position: "absolute", top: "10%", right: "-5%",`;
if (content.includes(oldGlow)) content = content.replace(oldGlow, newGlow);

const oldContentWrapper = `      <div style={{ position: "relative", zIndex: 1, maxWidth: 900 }}>`;
const newContentWrapper = `      <div ref={heroContentRef} style={{ position: "relative", zIndex: 1, maxWidth: 900, willChange: 'transform, opacity' }}>`;
if (content.includes(oldContentWrapper)) content = content.replace(oldContentWrapper, newContentWrapper);

const oldProjects = `function Projects() {
  const ref = useReveal();

  return (`;
const newProjects = `function Projects() {
  const ref = useReveal();

  const handleMouseMove = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPct = (x / rect.width - 0.5) * 12; 
    const yPct = -(y / rect.height - 0.5) * 12;
    e.currentTarget.style.setProperty('--rx', \`\${yPct}deg\`);
    e.currentTarget.style.setProperty('--ry', \`\${xPct}deg\`);
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.setProperty('--rx', \`0deg\`);
    e.currentTarget.style.setProperty('--ry', \`0deg\`);
  };

  return (`;
if (content.includes(oldProjects)) content = content.replace(oldProjects, newProjects);

const oldProjectMap = `            {DATA.projects.map(p => (
              <article key={p.title} className="project-card">`;
const newProjectMap = `            {DATA.projects.map((p, idx) => (
              <article key={p.title} className="project-card" style={{ transitionDelay: \`\${idx * 0.15}s\` }}
                onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>`;
if (content.includes(oldProjectMap)) content = content.replace(oldProjectMap, newProjectMap);

const oldProjectCss = `    /* ── Project cards ── */
    .project-card {
      background: \${T.surfaceCard};
      border: 1px solid \${T.border};
      padding: 2rem;
      transition: border-color 0.3s, transform 0.3s;
      cursor: default;
      position: relative;
      overflow: hidden;
    }
    .project-card::before {`;
const newProjectCss = `    /* ── Project cards ── */
    .project-card {
      background: \${T.surfaceCard};
      border: 1px solid \${T.border};
      padding: 2rem;
      transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(var(--ty, 0px));
      transform-style: preserve-3d;
      transition: border-color 0.35s, box-shadow 0.35s, transform 0.1s ease-out;
      cursor: default;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 0 0 transparent;
      will-change: transform;
    }
    .project-card:not(:hover) {
      transition: transform 0.6s cubic-bezier(0.16,1,0.3,1), border-color 0.35s, box-shadow 0.35s;
    }
    .project-card::before {`;
if (content.includes(oldProjectCss)) content = content.replace(oldProjectCss, newProjectCss);

const oldProjectHover = `    .project-card:hover { border-color: \${T.borderHov}; transform: translateY(-4px); }`;
const newProjectHover = `    .project-card:hover { 
      --ty: -4px;
      border-color: \${T.borderHov}; 
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,166,35,0.08);
    }`;
if (content.includes(oldProjectHover)) content = content.replace(oldProjectHover, newProjectHover);

fs.writeFileSync('p.jsx', content);
console.log('Successfully applied updates.');
