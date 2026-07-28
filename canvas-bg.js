/**
 * canvas-bg.js
 * Premium Animated Cyberpunk Terminal Background
 */

(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'cyber-bg';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d', { alpha: false });

  let width = 0;
  let height = 0;
  
  // Parallax Variables
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  // Grid Variables
  const GRID_SIZE = 40;
  let gridOffset = 0;
  const GRID_SPEED = 0.2; // pixels per second
  const PERSPECTIVE_STRENGTH = 0.3; 

  // Scanline Variables
  let scanTime = 0; // 0 to 10 seconds (8s move, 2s wait)
  
  // Particles (Pixel Dust)
  let particles = [];
  
  // Noise Glitch Variables
  let nextGlitchTime = performance.now() + Math.random() * 3000 + 5000;
  let glitchDuration = 0;
  let isGlitching = false;
  
  // Colors
  const COLOR_BG = '#090B14';
  const COLOR_GRID = 'rgba(90, 120, 255, 0.08)';
  const PARTICLE_COLORS = ['#67D8FF', '#7C5CFF', '#F3F5F7'];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    // Handle High DPI displays for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    initParticles();
  }

  function getParticleCount() {
    if (width <= 768) return Math.floor(100 * 0.3); // Mobile 70% reduction
    if (width <= 1024) return Math.floor(100 * 0.6); // Tablet 40% reduction
    return 100; // Desktop
  }

  function initParticles() {
    const count = getParticleCount();
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2 - 0.1, // Slight upward bias
      size: 2,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      life: Math.random() * 100,
      maxLife: Math.random() * 200 + 100,
      baseOpacity: Math.random() * 0.05 + 0.03, // 3% - 8%
      blinkPhase: Math.random() * Math.PI * 2
    };
  }

  window.addEventListener('resize', resize);
  
  window.addEventListener('mousemove', (e) => {
    // Map mouse position to -1 to 1
    targetMouseX = (e.clientX / width) * 2 - 1;
    targetMouseY = (e.clientY / height) * 2 - 1;
  });

  let lastTime = performance.now();

  function render(time) {
    const dt = time - lastTime;
    lastTime = time;

    // Smooth parallax interpolation (easing)
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    
    const parallaxX = mouseX * 10;
    const parallaxY = mouseY * 10;

    // Background Layer 1
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, width, height);

    // Grid Layer 2
    // Move grid upward continuously (0.2px / 1000ms * dt)
    gridOffset -= (GRID_SPEED / 1000) * dt * 60; // Approximate to per-frame scaling
    if (gridOffset <= -GRID_SIZE) gridOffset = 0;

    ctx.save();
    ctx.translate(width / 2 + parallaxX, height / 2 + parallaxY);
    // Slight perspective distortion (we'll simulate it via simple scaling if true 3D isn't available)
    // Actually, drawing a true perspective grid is complex in 2D. We will do a 2D isometric/perspective hint or just a clean 2D grid that scales slightly down at the top.
    
    ctx.lineWidth = 1;
    ctx.strokeStyle = COLOR_GRID;
    ctx.beginPath();
    
    // To simulate perspective, we could draw lines converging. But "perspective grid covering viewport" in HUDs usually means a subtle 2D grid or one angled. Let's do a clean 2D grid with a slight vertical squeeze at the top.
    const startX = -width / 2 - 50;
    const endX = width / 2 + 50;
    const startY = -height / 2 - 50;
    const endY = height / 2 + 50;
    
    // Draw Vertical Lines
    for (let x = startX - (startX % GRID_SIZE); x <= endX; x += GRID_SIZE) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    
    // Draw Horizontal Lines
    for (let y = startY - (startY % GRID_SIZE) + gridOffset; y <= endY; y += GRID_SIZE) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    
    ctx.stroke();
    
    // Scanline & Intersection Glow (Layer 4 & part of 2)
    // scanTime logic: 8s move, 2s wait -> total 10s cycle
    scanTime += dt / 1000;
    if (scanTime > 10) scanTime = 0;
    
    let scanX = -100;
    if (scanTime <= 8) {
      // Moves from left edge to right edge over 8s
      scanX = startX + (scanTime / 8) * (endX - startX);
    }
    
    if (scanTime <= 8) {
      // Intersection Glows
      ctx.fillStyle = 'rgba(103, 216, 255, 0.2)'; // #67D8FF at 20%
      for (let x = startX - (startX % GRID_SIZE); x <= endX; x += GRID_SIZE) {
        // Only if close to scanline
        if (Math.abs(x - scanX) < GRID_SIZE) {
          for (let y = startY - (startY % GRID_SIZE) + gridOffset; y <= endY; y += GRID_SIZE) {
            const dist = Math.abs(x - scanX);
            if (dist < 15) { // Close enough to glow
              // We simulate the 250ms duration by basing it on distance from the moving line
              // The line moves width in 8s. So in 250ms it moves (width/8)*0.25 pixels.
              ctx.beginPath();
              ctx.arc(x, y, 6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      
      // Draw Scanline
      // Gradient transparent -> cyan -> white -> cyan -> transparent
      const grad = ctx.createLinearGradient(scanX - 1, startY, scanX + 1, startY);
      grad.addColorStop(0, 'rgba(103, 216, 255, 0)');
      grad.addColorStop(0.2, 'rgba(103, 216, 255, 0.25)');
      grad.addColorStop(0.5, 'rgba(243, 245, 247, 0.25)');
      grad.addColorStop(0.8, 'rgba(103, 216, 255, 0.25)');
      grad.addColorStop(1, 'rgba(103, 216, 255, 0)');
      
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#67D8FF';
      ctx.fillStyle = grad;
      ctx.fillRect(scanX - 1, startY, 2, endY - startY);
      ctx.shadowBlur = 0;
    }
    
    ctx.restore();

    // Pixel Dust Layer 3
    ctx.save();
    ctx.translate(parallaxX * 1.5, parallaxY * 1.5); // Particles move slightly more for depth
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      
      if (p.life > p.maxLife || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
        Object.assign(p, createParticle());
        p.life = 0;
      }
      
      // Blinking
      const blink = (Math.sin(time * 0.005 + p.blinkPhase) + 1) / 2; // 0 to 1
      const currentOpacity = p.baseOpacity * blink;
      
      ctx.fillStyle = p.color;
      ctx.globalAlpha = currentOpacity;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1.0;
    ctx.restore();

    // CRT Noise / Glitch Layer 5
    if (time > nextGlitchTime && !isGlitching) {
      isGlitching = true;
      glitchDuration = Math.random() * 50 + 100; // 100-150ms
      nextGlitchTime = time + Math.random() * 3000 + 5000; // Next in 5-8s
    }

    if (isGlitching) {
      glitchDuration -= dt;
      if (glitchDuration <= 0) {
        isGlitching = false;
      } else {
        // Draw 1-2 random scanlines and tiny horizontal distortion
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; // 2% opacity static
        
        // Horizontal distortion band
        const bandY = Math.random() * height;
        const bandH = Math.random() * 20 + 5;
        
        // We can simulate a quick static tear by shifting a slice of the canvas, 
        // but it's faster to just draw a faint white rect
        ctx.fillRect(0, bandY, width, bandH);
        
        // Random static dots over the screen for true CRT feel in that split second
        for(let i=0; i<50; i++) {
           ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
        }
      }
    }

    requestAnimationFrame(render);
  }

  resize();
  requestAnimationFrame(render);
})();
