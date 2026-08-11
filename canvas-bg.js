// canvas-bg.js - Premium Multi-Environment Digital Workspace Engine
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded.');
        return;
    }

    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    // Detect device capabilities & reduced motion preferences
    let isMobile = window.innerWidth < 768;
    let isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // WebGL Renderer Setup
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.position.set(0, 8, 35);
    camera.lookAt(0, 2, 0);

    // Theme Color Palettes
    const darkColors = {
        background: 0x070B14,
        surface: 0x101827,
        primary: 0x3B82F6,   // Electric Blue
        accent: 0x06B6D4,    // Cyan
        secondary: 0x8B5CF6, // Purple
        grid: 0x1E293B,
        fog: 0x070B14,
        particle1: 0x06B6D4,
        particle2: 0x3B82F6,
        star: 0xE2E8F0
    };

    const lightColors = {
        background: 0xFAFBFD,
        surface: 0xFFFFFF,
        primary: 0x2563EB,   // Crisp Vivid Royal Blue
        accent: 0x0284C7,    // Vivid Cyan / Sky Blue
        secondary: 0x7C3AED, // Rich Violet
        grid: 0x2563EB,
        fog: 0xF1F5F9,
        particle1: 0x2563EB,
        particle2: 0x7C3AED,
        star: 0x3B82F6
    };

    let isDarkMode = document.body.classList.contains('dark');
    let currentColors = isDarkMode ? darkColors : lightColors;

    // Fog for smooth depth fading
    scene.fog = new THREE.FogExp2(currentColors.fog, 0.008);

    // =========================================================================
    // 1. SECTION SCROLL PROGRESS TRACKER
    // =========================================================================
    const sectionIds = ['hero', 'skills', 'experience', 'projects', 'certs', 'terminal', 'footer'];
    const sectionElements = {};
    sectionIds.forEach(id => {
        sectionElements[id] = document.getElementById(id) || document.querySelector(id);
    });
    // Environmental weights (0 to 1) for cross-fading section effects
    const envWeights = {
        hero: 1,
        skills: 0,
        experience: 0,
        projects: 0,
        certs: 0,
        terminal: 0,
        footer: 0
    };

    const targetEnvWeights = {
        hero: 1,
        skills: 0,
        experience: 0,
        projects: 0,
        certs: 0,
        terminal: 0,
        footer: 0
    };

    function updateSectionWeights() {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const pageHeight = document.documentElement.scrollHeight - viewportHeight;

        if (pageHeight <= 0) return;

        sectionIds.forEach(id => {
            const cached = window.PortfolioLayout && window.PortfolioLayout[id];
            if (!cached) return;

            const rectTop = cached.top - scrollY;
            const rectBottom = cached.bottom - scrollY;
            const sectionHeight = cached.height;

            let weight = 0;

            if (rectTop < viewportHeight && rectBottom > 0) {
                // Determine responsive range for fading in/out
                const fadeRange = Math.min(viewportHeight * 0.6, sectionHeight * 0.5);
                let opacity = 1;

                if (rectTop > viewportHeight - fadeRange) {
                    opacity = (viewportHeight - rectTop) / fadeRange;
                } else if (rectBottom < fadeRange) {
                    opacity = rectBottom / fadeRange;
                }

                weight = Math.max(0, Math.min(1, opacity));
            }

            targetEnvWeights[id] = weight * weight * (3 - 2 * weight);
        });

        // Sticky thresholds for Hero and Footer extremes
        if (scrollY < 50) {
            targetEnvWeights.hero = 1;
        }
        if (scrollY + viewportHeight >= document.documentElement.scrollHeight - 60) {
            targetEnvWeights.footer = 1;
        }
    }

    window.addEventListener('scroll', updateSectionWeights, { passive: true });
    window.addEventListener('layoutCached', updateSectionWeights);
    updateSectionWeights();
    // =========================================================================
    // 2. LAYER 1: CINEMATIC AURORA BACKGROUND SHADER PLANE
    // =========================================================================
    const auroraGeo = new THREE.PlaneGeometry(300, 200);
    const auroraMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color(currentColors.accent) },
            uColor2: { value: new THREE.Color(currentColors.secondary) },
            uColor3: { value: new THREE.Color(currentColors.primary) },
            uHeroWeight: { value: 1.0 },
            uIsDark: { value: isDarkMode ? 1.0 : 0.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform vec3 uColor3;
            uniform float uHeroWeight;
            uniform float uIsDark;
            varying vec2 vUv;

            // Simplex-like noise helper
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            float snoise(vec2 v){
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                                 -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vec2 st = vUv * 2.0 - 1.0;
                float t = uTime * 0.15;
                
                float n1 = snoise(vec2(st.x * 1.5 + t, st.y * 1.2 - t * 0.5));
                float n2 = snoise(vec2(st.x * 2.0 - t * 0.8, st.y * 2.5 + t * 0.3));
                
                float aurora = smoothstep(-0.4, 0.8, n1 + n2 * 0.5);
                
                vec3 mixColor = mix(uColor1, uColor2, sin(st.x * 2.0 + t) * 0.5 + 0.5);
                mixColor = mix(mixColor, uColor3, aurora * 0.6);
                
                float alpha = aurora * 0.32 * uHeroWeight;
                if (uIsDark < 0.5) {
                    alpha *= 0.95; // Rich, luminous prismatic aurora in light mode
                }
                
                gl_FragColor = vec4(mixColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const auroraMesh = new THREE.Mesh(auroraGeo, auroraMat);
    auroraMesh.position.set(0, 10, -50);
    scene.add(auroraMesh);

    // =========================================================================
    // 3. LAYER 2: HERO SUBTLE PERSPECTIVE GRID (Opacity 8-15%)
    // =========================================================================
    const gridGeo = new THREE.PlaneGeometry(250, 180, isMobile ? 40 : 80, isMobile ? 40 : 80);
    gridGeo.rotateX(-Math.PI / 2);

    const gridMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(currentColors.primary) },
            uOpacity: { value: 0.12 },
            uHeroWeight: { value: 1.0 },
            uIsDark: { value: isDarkMode ? 1.0 : 0.0 }
        },
        vertexShader: `
            uniform float uTime;
            varying vec3 vWorldPosition;
            void main() {
                vec3 pos = position;
                vec4 worldPos = modelMatrix * vec4(pos, 1.0);
                vWorldPosition = worldPos.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            uniform float uOpacity;
            uniform float uHeroWeight;
            uniform float uIsDark;
            varying vec3 vWorldPosition;

            void main() {
                // Subtle grid lines via fract
                vec2 gridUV = fract(vWorldPosition.xz * 0.15);
                float lineX = smoothstep(0.0, 0.04, gridUV.x) - smoothstep(0.96, 1.0, gridUV.x);
                float lineZ = smoothstep(0.0, 0.04, gridUV.y) - smoothstep(0.96, 1.0, gridUV.y);
                float line = (1.0 - lineX) + (1.0 - lineZ);
                
                // Fade into horizon (z distance)
                float distFade = smoothstep(-100.0, -10.0, vWorldPosition.z) * smoothstep(60.0, 0.0, vWorldPosition.z);
                
                float baseAlpha = uIsDark > 0.5 ? 0.05 : 0.08;
                float finalAlpha = line * baseAlpha * distFade * uHeroWeight;
                
                gl_FragColor = vec4(uColor, finalAlpha);
            }
        `,
        transparent: true,
        wireframe: true,
        depthWrite: false
    });
    const heroGrid = new THREE.Mesh(gridGeo, gridMat);
    heroGrid.position.set(0, -12, -20);
    scene.add(heroGrid);

    // =========================================================================
    // 4. LAYER 3: SKILLS NEURAL NETWORK GRAPH SYSTEM
    // =========================================================================
    const nodeCount = isMobile ? 25 : 50;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeVelocities = [];

    for (let i = 0; i < nodeCount; i++) {
        nodePositions[i * 3] = (Math.random() - 0.5) * 60;
        nodePositions[i * 3 + 1] = (Math.random() - 0.5) * 30 + 5;
        nodePositions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;

        nodeVelocities.push(
            (Math.random() - 0.5) * 0.03,
            (Math.random() - 0.5) * 0.03,
            (Math.random() - 0.5) * 0.03
        );
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

    const nodeMat = new THREE.PointsMaterial({
        color: currentColors.accent,
        size: isMobile ? 2.0 : 3.0,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodePoints);

    // Dynamic line connections between neural nodes
    const maxLines = nodeCount * 4;
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxLines * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
        color: currentColors.primary,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegments);

    // =========================================================================
    // 5. LAYER 4: EXPERIENCE ILLUMINATED VERTICAL LIGHT BEAMS
    // =========================================================================
    const beamCount = isMobile ? 3 : 6;
    const beamGroup = new THREE.Group();

    for (let i = 0; i < beamCount; i++) {
        const beamHeight = 60 + Math.random() * 40;
        const beamGeo = new THREE.CylinderGeometry(0.3, 0.8, beamHeight, 16, 1, true);
        const beamMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(currentColors.accent) },
                uOpacity: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uColor;
                uniform float uOpacity;
                varying vec2 vUv;
                void main() {
                    float verticalFade = sin(vUv.y * 3.14159);
                    float pulse = sin(uTime * 1.5 + vUv.y * 5.0) * 0.25 + 0.75;
                    gl_FragColor = vec4(uColor, verticalFade * 0.25 * pulse * uOpacity);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });

        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set((i - (beamCount - 1) / 2) * 14 + (Math.random() - 0.5) * 4, 0, -15 + (Math.random() - 0.5) * 10);
        beamGroup.add(beam);
    }
    scene.add(beamGroup);

    // =========================================================================
    // 6. LAYER 5: PROJECTS REFLECTIVE DIGITAL FLOOR & CAROUSEL MESH
    // =========================================================================
    const floorGeo = new THREE.PlaneGeometry(200, 120);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(currentColors.secondary) },
            uWeight: { value: 0 },
            uIsDark: { value: isDarkMode ? 1.0 : 0.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            void main() {
                vUv = uv;
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPos.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor;
            uniform float uWeight;
            uniform float uIsDark;
            varying vec2 vUv;
            varying vec3 vWorldPosition;

            void main() {
                // Subtle floor grid lines
                vec2 grid = abs(fract(vWorldPosition.xz * 0.1 - 0.5) - 0.5) / fwidth(vWorldPosition.xz * 0.1);
                float line = min(grid.x, grid.y);
                float c = 1.0 - min(line, 1.0);

                // Radial glare reflection
                float dist = length(vUv - vec2(0.5, 0.5));
                float refl = smoothstep(0.6, 0.0, dist);

                float alpha = (c * 0.15 + refl * 0.12) * uWeight;
                if (uIsDark < 0.5) alpha *= 0.5;

                gl_FragColor = vec4(uColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -15, -10);
    scene.add(floorMesh);

    // =========================================================================
    // 7. LAYER 6: FOOTER & TERMINAL STAR FIELD
    // =========================================================================
    const starCount = isMobile ? 120 : 250;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starPhases = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 200;
        starPositions[i * 3 + 1] = Math.random() * 60 + 5;
        starPositions[i * 3 + 2] = -40 - Math.random() * 60;
        starPhases[i] = Math.random() * Math.PI * 2;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('phase', new THREE.BufferAttribute(starPhases, 1));

    const starMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(currentColors.star) },
            uOpacity: { value: 0 }
        },
        vertexShader: `
            attribute float phase;
            varying float vPhase;
            void main() {
                vPhase = phase;
                vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = (2.0 + sin(phase)) * (80.0 / -mvPos.z);
                gl_Position = projectionMatrix * mvPos;
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor;
            uniform float uOpacity;
            varying float vPhase;
            void main() {
                float twinkle = sin(uTime * 1.5 + vPhase) * 0.4 + 0.6;
                vec2 p = gl_PointCoord - vec2(0.5);
                float r = length(p);
                if (r > 0.5) discard;
                float alpha = (1.0 - smoothstep(0.3, 0.5, r)) * twinkle * uOpacity;
                gl_FragColor = vec4(uColor, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // =========================================================================
    // 8. GLOBAL DYNAMIC PARTICLES ENGINE (Glowing Micro-Dots & Hexagons)
    // =========================================================================
    const particleCount = isMobile ? 20 : 45;
    const pPositions = new Float32Array(particleCount * 3);
    const pSpeeds = [];
    const pSizes = [];

    for (let i = 0; i < particleCount; i++) {
        pPositions[i * 3] = (Math.random() - 0.5) * 100;
        pPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        pPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
        pSpeeds.push({
            x: (Math.random() - 0.5) * 0.01,
            y: 0.015 + Math.random() * 0.02,
            z: (Math.random() - 0.5) * 0.01
        });
        pSizes.push(1.5 + Math.random() * 2.5);
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

    const particleMat = new THREE.PointsMaterial({
        color: currentColors.particle1,
        size: isMobile ? 2.0 : 3.0,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // =========================================================================
    // 9. MOUSE PARALLAX & THEME CHANGE OBSERVER
    // =========================================================================
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    if (!isMobile) {
        window.addEventListener('mousemove', (e) => {
            targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    function updateThemeColors() {
        isDarkMode = document.body.classList.contains('dark');
        currentColors = isDarkMode ? darkColors : lightColors;

        scene.fog.color.setHex(currentColors.fog);
        auroraMat.uniforms.uColor1.value.setHex(currentColors.accent);
        auroraMat.uniforms.uColor2.value.setHex(currentColors.secondary);
        auroraMat.uniforms.uColor3.value.setHex(currentColors.primary);
        auroraMat.uniforms.uIsDark.value = isDarkMode ? 1.0 : 0.0;

        heroGrid.material.uniforms.uColor.value.setHex(currentColors.primary);
        heroGrid.material.uniforms.uIsDark.value = isDarkMode ? 1.0 : 0.0;

        nodePoints.material.color.setHex(currentColors.accent);
        lineSegments.material.color.setHex(currentColors.primary);

        floorMesh.material.uniforms.uColor.value.setHex(currentColors.secondary);
        floorMesh.material.uniforms.uIsDark.value = isDarkMode ? 1.0 : 0.0;

        starField.material.uniforms.uColor.value.setHex(currentColors.star);
        particles.material.color.setHex(currentColors.particle1);
    }

    const themeObserver = new MutationObserver(updateThemeColors);
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('resize', () => {
        isMobile = window.innerWidth < 768;
        isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Hide legacy boot sequence cleanly
    setTimeout(() => {
        const bootOverlay = document.getElementById('boot-sequence');
        if (bootOverlay) {
            bootOverlay.classList.add('boot-hidden');
            setTimeout(() => bootOverlay.style.display = 'none', 500);
        }
    }, 1500);

    // =========================================================================
    // 10. MAIN RENDER LOOP & NEURAL NETWORK UPDATE
    // =========================================================================
    const clock = new THREE.Clock();
    let time = 0;
    function animate() {
        if (document.hidden) {
            requestAnimationFrame(animate);
            return;
        }

        const delta = Math.min(clock.getDelta(), 0.1);
        time += delta;

        // Smoothly interpolate weights towards targets to prevent pops/flashes
        sectionIds.forEach(id => {
            envWeights[id] += (targetEnvWeights[id] - envWeights[id]) * 0.08;
        });

        // A. Update Shaders Uniform Time & Weights
        auroraMat.uniforms.uTime.value = time;
        auroraMat.uniforms.uHeroWeight.value = envWeights.hero;

        heroGrid.material.uniforms.uTime.value = time;
        heroGrid.material.uniforms.uHeroWeight.value = envWeights.hero;

        // B. Update Neural Network (Skills Section)
        const skillsWeight = envWeights.skills;
        nodeMat.opacity = skillsWeight * (isDarkMode ? 0.8 : 0.95);
        lineMat.opacity = skillsWeight * (isDarkMode ? 0.4 : 0.65);

        if (skillsWeight > 0.005) {
            const pArr = nodeGeo.attributes.position.array;
            for (let i = 0; i < nodeCount; i++) {
                pArr[i * 3] += nodeVelocities[i][0];
                pArr[i * 3 + 1] += nodeVelocities[i][1];
                pArr[i * 3 + 2] += nodeVelocities[i][2];

                // Bounce in boundary box
                if (Math.abs(pArr[i * 3]) > 35) nodeVelocities[i][0] *= -1;
                if (Math.abs(pArr[i * 3 + 1]) > 20) nodeVelocities[i][1] *= -1;
                if (Math.abs(pArr[i * 3 + 2]) > 25) nodeVelocities[i][2] *= -1;
            }
            nodeGeo.attributes.position.needsUpdate = true;

            // Recalculate line connections
            let lineIdx = 0;
            const lArr = lineGeo.attributes.position.array;
            const maxDistSq = 14 * 14;

            for (let i = 0; i < nodeCount; i++) {
                for (let j = i + 1; j < nodeCount; j++) {
                    const dx = pArr[i * 3] - pArr[j * 3];
                    const dy = pArr[i * 3 + 1] - pArr[j * 3 + 1];
                    const dz = pArr[i * 3 + 2] - pArr[j * 3 + 2];
                    const distSq = dx * dx + dy * dy + dz * dz;

                    if (distSq < maxDistSq && lineIdx < maxLines * 6) {
                        lArr[lineIdx++] = pArr[i * 3];
                        lArr[lineIdx++] = pArr[i * 3 + 1];
                        lArr[lineIdx++] = pArr[i * 3 + 2];
                        lArr[lineIdx++] = pArr[j * 3];
                        lArr[lineIdx++] = pArr[j * 3 + 1];
                        lArr[lineIdx++] = pArr[j * 3 + 2];
                    }
                }
            }
            // Clear unused line vertices
            for (let i = lineIdx; i < maxLines * 6; i++) {
                lArr[i] = 0;
            }
            lineGeo.attributes.position.needsUpdate = true;
        }

        // C. Update Experience Beams
        const expWeight = envWeights.experience;
        beamGroup.children.forEach(beam => {
            beam.material.uniforms.uTime.value = time;
            beam.material.uniforms.uOpacity.value = expWeight * (isDarkMode ? 1.0 : 1.3);
        });

        // D. Update Projects Reflective Floor
        floorMat.uniforms.uTime.value = time;
        floorMat.uniforms.uWeight.value = envWeights.projects * (isDarkMode ? 1.0 : 1.2);

        // E. Update Star Field & Sparkles (Terminal & Footer)
        const starOpacity = Math.max(envWeights.terminal * 0.7, envWeights.footer * 0.95) * (isDarkMode ? 1.0 : 1.25);
        starMat.uniforms.uTime.value = time;
        starMat.uniforms.uOpacity.value = starOpacity;
        particleMat.opacity = isDarkMode ? 0.4 : 0.65;

        // F. Global Particles Movement
        const ptPositions = particleGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            ptPositions[i * 3 + 1] += pSpeeds[i].y;
            ptPositions[i * 3] += pSpeeds[i].x;
            ptPositions[i * 3 + 2] += pSpeeds[i].z;

            if (ptPositions[i * 3 + 1] > 30) {
                ptPositions[i * 3 + 1] = -25;
            }
        }
        particleGeo.attributes.position.needsUpdate = true;

        // G. Mouse Parallax & Breathing Camera Movement
        if (!prefersReducedMotion) {
            mouseX += (targetMouseX - mouseX) * 0.04;
            mouseY += (targetMouseY - mouseY) * 0.04;

            const breathe = Math.sin(time * 0.5) * 0.8;
            camera.position.x = mouseX * 2.0;
            camera.position.y = 8 + breathe + mouseY * 1.2;
            camera.lookAt(0, 2, 0);
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
});
