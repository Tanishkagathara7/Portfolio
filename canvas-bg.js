// canvas-bg.js - Premium Retro Background System

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('retro-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency to background
    let width, height;
    let frameId;
    let scrollY = window.scrollY;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse Tracking
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    window.addEventListener('mousemove', (e) => {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
    });
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // Resize handler
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    // -- Layer Data --

    // Colors
    const colors = {
        bg: '#090B14',
        grid: 'rgba(100, 130, 255, 0.08)',
        gridGlow: 'rgba(104, 216, 255, 0.4)',
        cyan: '#68D8FF',
        purple: '#8B6EFF',
        white: '#F4F4F4'
    };

    // Layer 2: Stars
    const starCount = Math.floor((width * height) / 15000); // Sparse
    const stars = Array.from({ length: starCount }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        color: [colors.white, colors.cyan, colors.purple][Math.floor(Math.random() * 3)],
        blinkOffset: Math.random() * Math.PI * 2,
        blinkSpeed: 0.5 + Math.random() * 1.5,
        floatOffset: Math.random() * Math.PI * 2
    }));

    // Layer 3: Scanner
    let scannerActive = false;
    let scannerX = 0;
    let scannerTimer = 0;

    // Layer 5: Digital Dust
    const dustParticles = [];

    // Layer 7: HUD
    const hudTexts = ["SYS ONLINE", "FPS 60", "NODE ACTIVE", "MEMORY OK", "BUILD v2.0"];
    let currentHud = hudTexts[0];
    let hudTimer = 0;
    let hudOpacity = 0;
    let hudCorner = 0; // 0: TL, 1: TR, 2: BL, 3: BR

    // Layer 8: Micro Glitch
    let glitchActive = false;
    let glitchTimer = 0;
    let glitchDuration = 0;
    let glitchY = 0;

    let lastTime = performance.now();

    function render(time) {
        const dt = (time - lastTime) / 1000; // seconds
        lastTime = time;

        // Mouse easing
        mouse.x += (mouse.targetX - mouse.x) * 0.1;
        mouse.y += (mouse.targetY - mouse.y) * 0.1;

        // Base Background
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, width, height);

        // Layer 8 Glitch FX trigger
        if (!prefersReducedMotion) {
            glitchTimer -= dt;
            if (glitchTimer <= 0) {
                glitchActive = true;
                glitchDuration = 0.1; // 100ms
                glitchY = Math.random() * height;
                glitchTimer = 8 + Math.random() * 4; // 8-12 seconds
            }
            if (glitchActive) {
                glitchDuration -= dt;
                if (glitchDuration <= 0) glitchActive = false;
            }
        }

        // Layer 1: Perspective Grid
        const gridOffset = (time * 0.02) % 40;
        const parallaxY = scrollY * 0.2;
        const vpX = width / 2;
        const vpY = height * 0.3 - parallaxY; // Vanishing point moves with scroll

        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();

        // Vertical lines radiating from vanishing point
        const numVLines = 30;
        for (let i = -numVLines; i <= numVLines; i++) {
            const x = vpX + i * 80;
            ctx.moveTo(vpX, vpY);
            ctx.lineTo(x + (i * 200), height + parallaxY);
        }

        // Horizontal lines expanding downwards
        for (let i = 0; i < 20; i++) {
            const yPos = vpY + Math.pow(1.3, i) * 10 + gridOffset;
            if (yPos > vpY && yPos < height) {
                ctx.moveTo(0, yPos);
                ctx.lineTo(width, yPos);
            }
        }
        ctx.stroke();

        // Layer 3: Scanning Beam
        scannerTimer -= dt;
        if (scannerTimer <= 0 && !scannerActive) {
            scannerActive = true;
            scannerX = -100;
        }
        if (scannerActive) {
            scannerX += width * 0.8 * dt; // moves across in ~1.2s
            if (scannerX > width + 100) {
                scannerActive = false;
                scannerTimer = 8; // Every 8 seconds
            }

            // Draw beam
            const gradient = ctx.createLinearGradient(scannerX - 50, 0, scannerX + 50, 0);
            gradient.addColorStop(0, 'rgba(104, 216, 255, 0)');
            gradient.addColorStop(0.5, 'rgba(104, 216, 255, 0.15)');
            gradient.addColorStop(1, 'rgba(104, 216, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(scannerX - 50, 0, 100, height);
        }

        // Layer 2: Tiny Pixel Stars
        ctx.fillStyle = colors.white;
        stars.forEach(star => {
            // Subtle float
            star.x = star.baseX + Math.sin(time * 0.001 + star.floatOffset) * 10;
            star.y = star.baseY + Math.cos(time * 0.0013 + star.floatOffset) * 10 - scrollY * 0.1;

            // Wrapping
            if (star.y < 0) star.y += height;
            if (star.y > height) star.y -= height;

            let alpha = (Math.sin(time * 0.003 * star.blinkSpeed + star.blinkOffset) + 1) / 2;
            alpha = alpha * alpha; // Sharper blink

            // Scanner glow effect
            if (scannerActive && Math.abs(star.x - scannerX) < 100) {
                alpha = 1.0;
            }

            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = star.color;
            ctx.fillRect(star.x, star.y, 2, 2);
        });
        ctx.globalAlpha = 1.0;

        // Layer 5: Digital Dust
        if (Math.random() < 0.1) {
            dustParticles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                life: 0.1 + Math.random() * 0.2 // Very short life
            });
        }
        ctx.fillStyle = colors.cyan;
        for (let i = dustParticles.length - 1; i >= 0; i--) {
            const p = dustParticles[i];
            p.life -= dt;
            if (p.life <= 0) {
                dustParticles.splice(i, 1);
            } else {
                ctx.globalAlpha = p.life * 2;
                ctx.fillRect(p.x, p.y, Math.random() > 0.5 ? 1 : 2, Math.random() > 0.5 ? 1 : 2);
            }
        }
        ctx.globalAlpha = 1.0;

        // Layer 6: Mouse Glow
        if (mouse.x > 0 && mouse.y > 0 && !prefersReducedMotion) {
            const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
            mg.addColorStop(0, 'rgba(104, 216, 255, 0.08)');
            mg.addColorStop(0.5, 'rgba(139, 110, 255, 0.04)');
            mg.addColorStop(1, 'rgba(9, 11, 20, 0)');
            ctx.fillStyle = mg;
            ctx.fillRect(mouse.x - 180, mouse.y - 180, 360, 360);
        }

        // Layer 8: Micro Glitch Rendering
        if (glitchActive) {
            ctx.fillStyle = 'rgba(104, 216, 255, 0.2)';
            ctx.fillRect(0, glitchY, width, 2 + Math.random() * 4);
            // Slice and offset a chunk
            const sy = glitchY - 20;
            const sh = 40;
            if (sy > 0 && sy + sh < height) {
                const imgData = ctx.getImageData(0, sy, width, sh);
                ctx.putImageData(imgData, (Math.random() - 0.5) * 20, sy);
            }
        }

        // Layer 7: HUD Diagnostics
        hudTimer -= dt;
        if (hudTimer <= 0) {
            hudTimer = 5 + Math.random() * 5;
            currentHud = hudTexts[Math.floor(Math.random() * hudTexts.length)];
            hudCorner = Math.floor(Math.random() * 4);
            hudOpacity = 1.0;
        }
        if (hudOpacity > 0) {
            hudOpacity -= dt * 0.2; // fade out slowly
            ctx.globalAlpha = Math.max(0, hudOpacity) * 0.02; // max 2% opacity
            ctx.fillStyle = colors.white;
            ctx.font = "12px 'Press Start 2P', monospace";
            const padding = 30;
            let hx = padding;
            let hy = padding;
            const tw = ctx.measureText(currentHud).width;

            if (hudCorner === 1 || hudCorner === 3) hx = width - padding - tw;
            if (hudCorner === 2 || hudCorner === 3) hy = height - padding;

            ctx.fillText(currentHud, hx, hy);
            ctx.globalAlpha = 1.0;
        }

        // Request next frame if not hidden
        if (!document.hidden) {
            frameId = requestAnimationFrame(render);
        }
    }

    // Handle tab visibility to pause animation
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            cancelAnimationFrame(frameId);
        } else {
            lastTime = performance.now();
            frameId = requestAnimationFrame(render);
        }
    });

    // Boot Sequence Logic
    setTimeout(() => {
        const bootOverlay = document.getElementById('boot-sequence');
        if (bootOverlay) {
            bootOverlay.classList.add('boot-hidden');
            setTimeout(() => bootOverlay.style.display = 'none', 500);
        }
    }, 2200);

    frameId = requestAnimationFrame(render);
});
