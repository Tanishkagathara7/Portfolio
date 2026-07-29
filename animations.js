// animations.js - Premium Scroll & GSAP Animation Engine
document.addEventListener("DOMContentLoaded", () => {
    // Wait slightly for Boot Sequence to finish before initializing scroll animations
    setTimeout(initAnimations, 2500);
});

function initAnimations() {
    // Ensure libraries loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') {
        console.warn("Animation libraries not loaded.");
        return;
    }

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // 1. Initialize Lenis for Premium Smooth Scrolling
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

    // Disable reduced motion if requested
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        gsap.globalTimeline.timeScale(100); // Speed up animations to instant
    }

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

    // 3. Section Reveals & Staggers
    const sections = document.querySelectorAll('section');
    
    sections.forEach((section) => {
        // Setup a master timeline for the section
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 85%", // Triggers slightly below viewport
                toggleActions: "play none none reverse", // Play forward, reverse on leave back
            }
        });

        // The Section itself (wrapper animation)
        gsap.set(section, { transformPerspective: 1000 });
        
        // Grab elements inside the section
        const headings = section.querySelectorAll('h1, h2, h3, .hero-tag');
        const paragraphs = section.querySelectorAll('p, .skill-info');
        const cards = section.querySelectorAll('.pixel-card, .timeline-item');
        const buttons = section.querySelectorAll('.pixel-button, .social-btn');
        const dividers = section.querySelectorAll('.pixel-divider');
        
        // --- A. Headings ---
        if (headings.length > 0) {
            tl.fromTo(headings, 
                { opacity: 0, y: 50, filter: "blur(8px)", letterSpacing: "2px" },
                { opacity: 1, y: 0, filter: "blur(0px)", letterSpacing: "normal", duration: 1.0, ease: "power4.out", stagger: 0.1 }
            );
        }

        // --- B. Paragraphs (Text Reveal) ---
        if (paragraphs.length > 0) {
            tl.fromTo(paragraphs,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 1.0, ease: "power4.out", stagger: 0.05 },
                "-=0.7" // Overlap with previous animation
            );
        }

        // --- C. Cards / Projects (Floating in) ---
        if (cards.length > 0) {
            tl.fromTo(cards,
                { opacity: 0, y: 40, scale: 0.95, rotationX: 3, filter: "blur(4px)", boxShadow: "0 0 0 rgba(0,0,0,0)" },
                { opacity: 1, y: 0, scale: 1, rotationX: 0, filter: "blur(0px)", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", duration: 1.2, ease: "expo.out", stagger: 0.1 },
                "-=0.8"
            );
        }

        // --- D. Buttons & Actions ---
        if (buttons.length > 0) {
            tl.fromTo(buttons,
                { opacity: 0, y: 15, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.2)", stagger: 0.08 },
                "-=0.9"
            );
        }

        // --- E. Dividers ---
        if (dividers.length > 0) {
            tl.fromTo(dividers,
                { opacity: 0, scaleX: 0 },
                { opacity: 1, scaleX: 1, duration: 1.0, ease: "power4.out", transformOrigin: "center" },
                "-=0.8"
            );
        }
    });

    // 4. Specific Component Animations
    
    // Skill Bars
    const skillBars = document.querySelectorAll('.skill-bar-inner');
    skillBars.forEach(bar => {
        const targetWidth = bar.getAttribute('data-width');
        // Reset to 0
        bar.style.width = "0%";
        
        ScrollTrigger.create({
            trigger: bar,
            start: "top 90%",
            onEnter: () => {
                gsap.to(bar, {
                    width: targetWidth,
                    duration: 1.5,
                    ease: "power4.out",
                    delay: 0.2
                });
            },
            once: true
        });
    });

    // Terminal Loading Animation
    const terminal = document.querySelector('.terminal-container');
    if (terminal) {
        gsap.fromTo(terminal, 
            { opacity: 0, scale: 0.95, boxShadow: "0 0 0px rgba(0,0,0,0)" },
            { 
                opacity: 1, 
                scale: 1, 
                boxShadow: "0 15px 40px rgba(0, 255, 255, 0.15)",
                duration: 1.5, 
                ease: "power4.out",
                scrollTrigger: {
                    trigger: terminal,
                    start: "top 85%"
                }
            }
        );
    }

    // Timeline Slide In Effect (Alternating)
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        const isLeft = index % 2 === 0;
        gsap.fromTo(item, 
            { opacity: 0, x: isLeft ? -30 : 30 },
            { 
                opacity: 1, 
                x: 0, 
                duration: 1.0, 
                ease: "expo.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%"
                }
            }
        );
    });

    // Magnetic Hover for buttons
    const magneticElements = document.querySelectorAll('.pixel-button, .social-btn');
    magneticElements.forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.3; // Magnetic strength
            const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
            gsap.to(el, { x: x, y: y, duration: 0.3, ease: "power2.out" });
        });
        
        el.addEventListener('mouseleave', () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "power4.out" });
        });
    });

    // 5. Parallax Depth (Hero Image)
    const heroProfile = document.querySelector('.hero-profile-container');
    if (heroProfile) {
        gsap.to(heroProfile, {
            y: 50, // Move down slightly as user scrolls down
            ease: "none",
            scrollTrigger: {
                trigger: '#hero',
                start: "top top",
                end: "bottom top",
                scrub: 1 // smooth scrubbing
            }
        });
    }

    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh();
}
