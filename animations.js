// animations.js - Premium Scroll & GSAP Animation Engine
if (document.readyState === "complete") {
    console.log("[Animations] Window already fully loaded, initializing animations...");
    initAnimations();
} else {
    window.addEventListener("load", () => {
        console.log("[Animations] Window fully loaded, initializing animations...");
        initAnimations();
    });
}

function initAnimations() {
    console.log("[Animations] Initializing animations...");
    // Ensure libraries loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') {
        console.warn("[Animations] Animation libraries (GSAP, ScrollTrigger, or Lenis) not loaded.");
        return;
    }

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Disable reduced motion if requested by OS
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    console.log("[Animations] Prefers reduced motion:", prefersReducedMotion);
    if (prefersReducedMotion) {
        gsap.globalTimeline.timeScale(100); // Speed up animations to instant
        return; // Skip complex animation initialization
    }

    // Helper to safely filter out null elements for GSAP targets
    const safeTargets = (targets) => {
        if (!targets) return [];
        let arr;
        if (Array.isArray(targets)) {
            arr = targets;
        } else if (targets instanceof NodeList || targets instanceof HTMLCollection) {
            arr = Array.from(targets);
        } else {
            arr = [targets];
        }
        return arr.flat().filter(el => el !== null && el !== undefined);
    };

    // 1. Initialize Lenis for Smooth Cinematic Scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Power4-like ease
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Sync Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 2. Global Scroll Progress Bar
    const progressBar = document.getElementById('scroll-progress-bar');
    if (progressBar) {
        gsap.to(progressBar, {
            width: "100%",
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.1
            }
        });
    }

    // 3. Navbar Blur & Shadow on Scroll
    const header = document.getElementById("header");
    if (header) {
        ScrollTrigger.create({
            start: "top -50px",
            onEnter: () => header.classList.add("scrolled"),
            onLeaveBack: () => header.classList.remove("scrolled"),
        });
    }

    // 4. Parallax Background and Hero elements
    const webglCanvas = document.getElementById("webgl-canvas");
    if (webglCanvas) {
        gsap.to(webglCanvas, {
            y: 80,
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: true
            }
        });
    }



    // 5. Section Reveals (Animate only once)

    // --- Hero Reveal Sequence ---
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        // Split title "Tanish Kagathara" into two lines/spans dynamically
        const titleEl = heroSection.querySelector('.hero-title');
        if (titleEl) {
            const text = titleEl.textContent.trim();
            const parts = text.split(/\s+/);
            if (parts.length === 2) {
                titleEl.innerHTML = `<span class="line-1" style="display:inline-block;">${parts[0]}</span> <span class="line-2" style="display:inline-block;">${parts[1]}</span>`;
            }
        }

        const tag = heroSection.querySelector('.hero-tag');
        const titleLine1 = heroSection.querySelector('.hero-title .line-1');
        const titleLine2 = heroSection.querySelector('.hero-title .line-2');
        const tagline = heroSection.querySelector('.hero-tagline');
        const desc = heroSection.querySelector('.hero-summary');
        const buttons = heroSection.querySelectorAll('.cta-primary-btn, .cta-secondary-btn');
        const profileContainer = heroSection.querySelector('.hero-profile-container');
        const profileFrame = heroSection.querySelector('.profile-frame');
        const badgeTag = heroSection.querySelector('.badge-tag');



        // Initial setup to make elements invisible immediately on script load
        const socialsSection = heroSection.querySelector('.cta-connect-section');
        gsap.set(header, { opacity: 0, y: -45 });
        gsap.set(safeTargets([tag, titleLine1 || titleEl, titleLine2, tagline, desc, buttons, socialsSection]), { opacity: 0, y: 25 });
        if (profileFrame) gsap.set(profileFrame, { scale: 0.1, opacity: 0, rotation: -360, y: 25, transformPerspective: 1000 });
        if (badgeTag) gsap.set(badgeTag, { opacity: 0, y: 15 });

        const triggerHeroReveal = () => {
            console.log("[Animations] Starting Hero Reveal sequence...");
            const tl = gsap.timeline();
            
            // 1. Navbar (Header)
            if (header) tl.to(header, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
            
            // 2. Badge (Tag)
            if (tag) tl.to(tag, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.4");
            
            // 3. Name (Title)
            if (titleLine1) {
                tl.to(titleLine1, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3");
                if (titleLine2) tl.to(titleLine2, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3");
            } else if (titleEl) {
                tl.to(titleEl, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3");
            }

            // 4. Subtitle (Tagline)
            if (tagline) tl.to(tagline, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3");
            
            // 5. Paragraph (Description)
            if (desc) tl.to(desc, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.3");
            
            // 6. Buttons
            const validButtons = safeTargets(buttons);
            if (validButtons.length > 0) {
                tl.to(validButtons, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)", stagger: 0.08 }, "-=0.3");
            }

            // 7. Social Section
            if (socialsSection) {
                tl.to(socialsSection, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" }, "-=0.3");
            }

            if (profileContainer) {
                // Hero profile image translate vertically 20–30px while scrolling
                gsap.to(profileContainer, {
                    y: -30,
                    ease: "none",
                    scrollTrigger: {
                        trigger: heroSection,
                        start: "top top",
                        end: "bottom top",
                        scrub: true
                    }
                });

                if (profileFrame) {
                    tl.to(profileFrame, {
                        opacity: 1,
                        scale: 1,
                        rotation: 0,
                        y: 0,
                        duration: 1.2,
                        ease: "power2.out",
                        onComplete: () => {
                            // Start floating animation only after entrance finishes
                            profileFrame.classList.add("floating");
                        }
                    }, "-=0.35");

                    // Cursor 3D Tilt & scale Interaction on hover
                    profileFrame.addEventListener('mousemove', (e) => {
                        const rect = profileFrame.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const xc = rect.width / 2;
                        const yc = rect.height / 2;
                        const angleX = (yc - y) / yc * 4; // max 4 degrees
                        const angleY = (x - xc) / xc * 4; // max 4 degrees
                        const transX = (x - xc) / xc * 6; // max 6px translation
                        const transY = (y - yc) / yc * 6;

                        gsap.to(profileFrame, {
                            rotationX: angleX,
                            rotationY: angleY,
                            x: transX,
                            y: transY,
                            scale: 1.03,
                            ease: "power2.out",
                            duration: 0.3,
                            overwrite: "auto"
                        });
                    });

                    profileFrame.addEventListener('mouseleave', () => {
                        gsap.to(profileFrame, {
                            rotationX: 0,
                            rotationY: 0,
                            x: 0,
                            y: 0,
                            scale: 1,
                            ease: "power3.out",
                            duration: 0.5,
                            overwrite: "auto"
                        });
                    });
                }
                if (badgeTag) {
                    tl.to(badgeTag, {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "back.out(1.5)"
                    }, "-=0.6");
                }
            }

            // Dispatch event to start typewriter
            window.dispatchEvent(new CustomEvent('startTypewriter'));
        };

        const needsMusicPrompt = true;
        if (needsMusicPrompt) {
            window.addEventListener('startHeroReveal', triggerHeroReveal, { once: true });
        } else {
            setTimeout(triggerHeroReveal, 1600);
        }
    }

    // --- Skills Section Reveal ---
    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        const title = skillsSection.querySelector('h2');
        const leftCard = skillsSection.querySelector('.skills-grid > div:first-child');
        const rightCard = skillsSection.querySelector('.skills-grid > div:last-child');
        const skillBars = skillsSection.querySelectorAll('.skill-bar-wrapper');
        const techBadges = skillsSection.querySelectorAll('.pixel-tag');

        gsap.set(safeTargets([title, leftCard, rightCard]), { opacity: 0 });
        if (title) gsap.set(title, { y: 30 });
        if (leftCard) gsap.set(leftCard, { x: -50 });
        if (rightCard) gsap.set(rightCard, { x: 50 });
        
        const validBadges = safeTargets(techBadges);
        if (validBadges.length > 0) gsap.set(validBadges, { opacity: 0, scale: 0.8 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: skillsSection,
                start: "top bottom-=80px",
                once: true
            }
        });

        if (title) tl.to(title, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
        
        const cardsToAnimate = safeTargets([leftCard, rightCard]);
        if (cardsToAnimate.length > 0) {
            tl.to(cardsToAnimate, { opacity: 1, x: 0, duration: 1.0, ease: "power3.out", stagger: 0.15 }, "-=0.4");
        }

        // Skill bars progress animation & numbers count upward
        if (skillBars.length > 0) {
            skillBars.forEach((bar) => {
                const inner = bar.querySelector('.skill-bar-inner');
                const percentText = bar.querySelector('.percentage');
                if (inner && percentText) {
                    const targetVal = parseInt(percentText.textContent) || 100;
                    gsap.set(inner, { width: "0%" });
                    inner.style.animation = "none"; // Disable CSS animation

                    tl.to(inner, {
                        width: `${targetVal}%`,
                        duration: 1.5,
                        ease: "power2.out"
                    }, "-=0.8");

                    // Counter animation
                    const counter = { val: 0 };
                    tl.to(counter, {
                        val: targetVal,
                        duration: 1.5,
                        ease: "power2.out",
                        onUpdate: () => {
                            percentText.textContent = `${Math.floor(counter.val)}%`;
                        }
                    }, "-=1.5");
                }
            });
        }

        // Stagger tech badges
        if (validBadges.length > 0) {
            tl.to(validBadges, {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "back.out(1.2)",
                stagger: 0.01
            }, "-=1.0");
        }
    }

    // --- Experience Section Reveal ---
    const experienceSection = document.getElementById('experience');
    if (experienceSection) {
        const timeline = experienceSection.querySelector('.timeline');
        
        // Inject a custom dynamic timeline line that grows as scroll happens
        if (timeline) {
            const line = document.createElement('div');
            line.className = 'timeline-progress-line';
            timeline.appendChild(line);

            gsap.to(line, {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: timeline,
                    start: "top 70%",
                    end: "bottom 30%",
                    scrub: true
                }
            });
        }

        const cards = experienceSection.querySelectorAll('.timeline-item');
        if (cards.length > 0) {
            cards.forEach((item) => {
                const dot = item.querySelector('.timeline-dot');
                const card = item.querySelector('.timeline-card');

                if (card) {
                    gsap.set(card, { opacity: 0, y: 40 });

                    // Card fades upward
                    gsap.to(card, {
                        opacity: 1,
                        y: 0,
                        duration: 1.0,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: item,
                            start: "top bottom-=80px",
                            once: true
                        }
                    });
                }

                // Dots glow & card brightens on scroll activation
                ScrollTrigger.create({
                    trigger: item,
                    start: "top 55%",
                    end: "bottom 55%",
                    onEnter: () => {
                        if (dot) dot.style.boxShadow = "0 0 15px hsl(var(--primary)), 0 0 5px hsl(var(--primary))";
                        if (card) card.style.filter = "brightness(1.1)";
                    },
                    onLeave: () => {
                        if (dot) dot.style.boxShadow = "none";
                        if (card) card.style.filter = "none";
                    },
                    onEnterBack: () => {
                        if (dot) dot.style.boxShadow = "0 0 15px hsl(var(--primary)), 0 0 5px hsl(var(--primary))";
                        if (card) card.style.filter = "brightness(1.1)";
                    },
                    onLeaveBack: () => {
                        if (dot) dot.style.boxShadow = "none";
                        if (card) card.style.filter = "none";
                    }
                });
            });
        }
    }

    // --- Projects Grid Reveal & Card Mouse Tilt ---
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
        const grid = projectsSection.querySelector('.projects-grid');
        const cards = projectsSection.querySelectorAll('.project-card');
        const validCards = safeTargets(cards);

        if (validCards.length > 0) {
            gsap.set(validCards, { opacity: 0, y: 50 });

            gsap.to(validCards, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "expo.out",
                stagger: 0.12, // stagger cards by 120ms
                scrollTrigger: {
                    trigger: grid || projectsSection,
                    start: "top bottom-=80px",
                    once: true
                }
            });

            // 3D Tilt Interaction for cards
            validCards.forEach((card) => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const xc = rect.width / 2;
                    const yc = rect.height / 2;
                    const angleX = (yc - y) / yc * 5; // max 5 degrees
                    const angleY = (x - xc) / xc * 5; // max 5 degrees

                    gsap.to(card, {
                        rotationX: angleX,
                        rotationY: angleY,
                        scale: 1.03,
                        ease: "power2.out",
                        duration: 0.3,
                        overwrite: "auto"
                    });
                });

                card.addEventListener('mouseleave', () => {
                    gsap.to(card, {
                        rotationX: 0,
                        rotationY: 0,
                        scale: 1,
                        ease: "power3.out",
                        duration: 0.5,
                        overwrite: "auto"
                    });
                });
            });
        }
    }

    // --- Education Section Reveal ---
    const certsSection = document.getElementById('certs');
    if (certsSection) {
        const cards = certsSection.querySelectorAll('.cert-card');
        const validCards = safeTargets(cards);

        if (validCards.length > 0) {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: certsSection,
                    start: "top bottom-=80px",
                    once: true
                }
            });

            gsap.set(validCards, { opacity: 0, y: 40 });

            tl.to(validCards, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                stagger: 0.15
            });

            // Rotate icons slightly while entering
            validCards.forEach((card) => {
                const icon = card.querySelector('.cert-icon');
                if (icon) {
                    gsap.fromTo(icon, 
                        { rotation: -15 }, 
                        { rotation: 0, duration: 1.0, ease: "back.out(1.5)", scrollTrigger: { trigger: card, start: "top bottom-=80px", once: true } }
                    );
                }
            });
        }

        // Count stats upward if applicable (e.g. "5+ Projects Delivered")
        const statsCard = certsSection.querySelector('.certs-grid > div:last-child h3');
        if (statsCard && statsCard.textContent.includes("5+")) {
            const counter = { val: 0 };
            gsap.to(counter, {
                val: 5,
                duration: 1.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: statsCard,
                    start: "top bottom-=80px",
                    once: true
                },
                onUpdate: () => {
                    statsCard.innerHTML = `${Math.floor(counter.val)}+ Projects Delivered`;
                }
            });
        }
    }

    // --- Interactive Terminal Section Reveal & Auto-Type ---
    const terminalSection = document.getElementById('terminal');
    if (terminalSection) {
        const terminalContainer = terminalSection.querySelector('.terminal-container');
        
        if (terminalContainer) {
            gsap.set(terminalContainer, { opacity: 0, y: 50 });

            gsap.to(terminalContainer, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: terminalSection,
                    start: "top bottom-=80px",
                    once: true,
                    onEnter: () => {
                        // Trigger terminal automatic typing
                        setTimeout(autoTypeTerminal, 600);
                    }
                }
            });
        }
    }

    // --- Footer Section Reveal ---
    const footer = document.querySelector('footer');
    if (footer) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: footer,
                start: "top bottom-=50px",
                once: true
            }
        });

        const content = footer.querySelector('.footer-content');
        const socialBtns = footer.querySelectorAll('.social-btn');
        const validBtns = safeTargets(socialBtns);

        if (content) gsap.set(content, { opacity: 0, y: 30 });
        if (validBtns.length > 0) gsap.set(validBtns, { opacity: 0, scale: 0.8 });

        if (content) tl.to(content, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
        if (validBtns.length > 0) {
            tl.to(validBtns, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)", stagger: 0.1 }, "-=0.4");
        }
    }

    // --- Dividers Animate & Dynamic Pixel Particles Scatter ---
    const dividers = document.querySelectorAll('.pixel-divider');
    if (dividers.length > 0) {
        dividers.forEach((div) => {
            const bar = div.querySelector('.pixel-bar');
            const dots = div.querySelectorAll('.pixel-dot');
            const validDots = safeTargets(dots);

            if (bar) {
                gsap.set(bar, { scaleX: 0 });
                if (validDots.length > 0) gsap.set(validDots, { opacity: 0, scale: 0 });

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: div,
                        start: "top bottom-=80px",
                        once: true,
                        onEnter: () => {
                            // Generate and scatter pixel particles
                            scatterDividerParticles(div);
                        }
                    }
                });

                tl.to(bar, { scaleX: 1, duration: 1.0, ease: "expo.out" });
                if (validDots.length > 0) {
                    tl.to(validDots, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: "back.out(1.5)" }, "-=0.6");
                }
                tl.to(bar, {
                    boxShadow: "0 0 15px rgba(139, 92, 246, 0.8)",
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1
                }, "-=0.3");
            }
        });
    }

    // Sync layout offsets after images load
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });
    // Fallback refresh shortly after init
    setTimeout(() => ScrollTrigger.refresh(), 1000);
}

// Generates small retro square pixel particles that scatter outward and fade (appended to body to preserve flex layouts)
function scatterDividerParticles(dividerEl) {
    const rect = dividerEl.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const centerX = rect.left + rect.width / 2 + scrollX;
    const centerY = rect.top + rect.height / 2 + scrollY;

    const particleCount = 6;
    const colors = ["#6C63FF", "#8B5CF6", "#0284C7", "#06B6D4"];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("span");
        particle.className = "pixel-particle";
        particle.style.position = "absolute";
        particle.style.width = "6px";
        particle.style.height = "6px";
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.boxShadow = "1px 1px 0 rgba(0,0,0,0.15)";
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        particle.style.transform = "translate(-50%, -50%)";
        particle.style.zIndex = "1000";
        document.body.appendChild(particle);

        const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const radius = 30 + Math.random() * 40;
        const destX = Math.cos(angle) * radius;
        const destY = Math.sin(angle) * radius - 15; // float slightly upward

        gsap.to(particle, {
            x: destX,
            y: destY,
            rotation: Math.random() * 360,
            opacity: 0,
            scale: 0.5,
            duration: 0.8 + Math.random() * 0.4,
            ease: "power2.out",
            onComplete: () => {
                particle.remove();
            }
        });
    }
}

// Automatic CLI typing simulation when section is reached
function autoTypeTerminal() {
    const inputField = document.getElementById("term-input");
    if (!inputField) return;

    const command = "help";
    let index = 0;
    inputField.focus();

    function type() {
        if (index < command.length) {
            inputField.value += command.charAt(index);
            index++;
            setTimeout(type, 150 + Math.random() * 80);
        } else {
            // Simulate pressing enter
            setTimeout(() => {
                const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
                inputField.dispatchEvent(event);
            }, 500);
        }
    }

    type();
}
