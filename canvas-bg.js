// canvas-bg.js - Premium Infinite Digital Terrain Background
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Three.js to load via CDN
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded.');
        return;
    }

    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    // Detect device capabilities
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    // Limit pixel ratio for performance (prevent huge battery drain on high-res mobile displays)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Scene & Camera
    const scene = new THREE.Scene();
    
    // Perspective Camera: field of view, aspect ratio, near, far
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 8, 30);
    camera.lookAt(0, 2, 0);

    // Theme Colors
    const darkColors = {
        terrain: 0x4a6a8a, // Blue-gray
        particles: 0x00ffff, // Blue/Cyan
        stars: 0xffffff,
        fog: 0x05060B // Deep navy
    };
    
    const lightColors = {
        terrain: 0x94a3b8, // Slate gray for elegant contrast
        particles: 0x3b82f6, // Vivid blue for premium pop
        stars: 0xcbd5e1, // Soft gray-blue to remain visible against light background
        fog: 0xf4f7fb // Premium slightly cool off-white
    };

    let isDarkMode = document.body.classList.contains('dark');
    let currentColors = isDarkMode ? darkColors : lightColors;

    // Fog for horizon fading
    scene.fog = new THREE.Fog(currentColors.fog, 20, 120);

    // 1. Layer 2: Infinite Digital Terrain
    // Reduce geometry detail on mobile to maintain 60 FPS
    const segmentsW = isMobile ? 40 : 80;
    const segmentsH = isMobile ? 50 : 100;
    
    const terrainGeo = new THREE.PlaneGeometry(300, 200, segmentsW, segmentsH);
    terrainGeo.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    // Custom Shader Material for performant rolling hills and forward movement
    const terrainShaderMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(currentColors.terrain) },
            uSpeed: { value: 0.10 }, // 0.05px to 0.15px/frame equivalent
            fogColor: { value: scene.fog.color },
            fogNear: { value: scene.fog.near },
            fogFar: { value: scene.fog.far }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uSpeed;
            varying float vZ;
            varying vec3 vWorldPosition;

            // Simple 2D Noise for procedural rolling hills
            float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
            float noise(vec2 x) {
                vec2 i = floor(x);
                vec2 f = fract(x);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            void main() {
                vec3 pos = position;
                // Offset UVs to simulate infinite forward movement
                vec2 uvOffset = vec2(pos.x * 0.04, pos.z * 0.04 - uTime * uSpeed);
                
                // Soft rolling hills (multiple octaves)
                float h = noise(uvOffset) * 6.0;
                h += noise(uvOffset * 2.0) * 2.0;
                
                pos.y += h;
                vZ = pos.y;
                
                vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
                vWorldPosition = worldPosition.xyz;
                
                gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            uniform vec3 fogColor;
            uniform float fogNear;
            uniform float fogFar;
            
            varying float vZ;
            varying vec3 vWorldPosition;
            
            void main() {
                // Fade out valleys for a cleaner look
                float alpha = smoothstep(-2.0, 6.0, vZ) * 0.4 + 0.05;
                vec4 finalColor = vec4(uColor, alpha);
                
                // Apply Fog manually since we use ShaderMaterial
                float depth = gl_FragCoord.z / gl_FragCoord.w;
                float fogFactor = smoothstep(fogNear, fogFar, depth);
                
                gl_FragColor = mix(finalColor, vec4(fogColor, finalColor.a), fogFactor);
            }
        `,
        wireframe: true,
        transparent: true,
    });

    const terrain = new THREE.Mesh(terrainGeo, terrainShaderMat);
    terrain.position.y = -10;
    scene.add(terrain);

    // 2. Layer 4: Tiny Floating Particles
    let maxParticles = 120;
    if (isTablet) maxParticles = 80;
    if (isMobile) maxParticles = 40;

    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(maxParticles * 3);
    const particleSpeeds = [];
    
    for (let i = 0; i < maxParticles; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 80; // X
        particlePositions[i * 3 + 1] = Math.random() * 20 - 5; // Y
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 60; // Z
        particleSpeeds.push(0.01 + Math.random() * 0.015);
    }
    
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMat = new THREE.PointsMaterial({
        color: currentColors.particles,
        size: isMobile ? 1.5 : 2.5,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 3. Layer 5: Stars
    const starCount = isMobile ? 150 : 300;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starAlphas = new Float32Array(starCount); 
    
    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 250;
        starPositions[i * 3 + 1] = 15 + Math.random() * 60;
        starPositions[i * 3 + 2] = -60 - Math.random() * 60;
        starAlphas[i] = Math.random();
    }
    
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('alpha', new THREE.BufferAttribute(starAlphas, 1));
    
    // Shader to handle twinkle without JS array updates
    const starShaderMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(currentColors.stars) }
        },
        vertexShader: `
            attribute float alpha;
            varying float vAlpha;
            void main() {
                vAlpha = alpha;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = 2.0 * (100.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor;
            varying float vAlpha;
            void main() {
                float twinkle = sin(uTime * 0.5 + vAlpha * 10.0) * 0.5 + 0.5;
                gl_FragColor = vec4(uColor, twinkle * 0.7 + 0.1);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const starField = new THREE.Points(starGeo, starShaderMat);
    scene.add(starField);

    // 4. Shooting Star
    const ssGeo = new THREE.BufferGeometry();
    const ssPositions = new Float32Array(6);
    ssGeo.setAttribute('position', new THREE.BufferAttribute(ssPositions, 3));
    const ssMat = new THREE.LineBasicMaterial({
        color: currentColors.stars,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const shootingStar = new THREE.Line(ssGeo, ssMat);
    scene.add(shootingStar);
    
    let ssActive = false;
    let ssProgress = 0;
    let ssStart = new THREE.Vector3();
    let ssEnd = new THREE.Vector3();
    let ssTimer = 5 + Math.random() * 10; // First one appears sooner

    function triggerShootingStar() {
        if (isMobile) return; // Save performance on mobile
        ssActive = true;
        ssProgress = 0;
        ssStart.set((Math.random() - 0.5) * 100, 30 + Math.random() * 20, -50);
        ssEnd.set(ssStart.x + (Math.random() - 0.5) * 50, ssStart.y - 20 - Math.random() * 10, ssStart.z + 10);
        
        const pos = shootingStar.geometry.attributes.position.array;
        pos[0] = ssStart.x; pos[1] = ssStart.y; pos[2] = ssStart.z;
        pos[3] = ssStart.x; pos[4] = ssStart.y; pos[5] = ssStart.z;
        shootingStar.geometry.attributes.position.needsUpdate = true;
        shootingStar.material.opacity = 0.8;
    }

    // Interaction & Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    if (!isMobile) {
        window.addEventListener('mousemove', (e) => {
            targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    // Theme Switching
    const updateTheme = () => {
        isDarkMode = document.body.classList.contains('dark');
        currentColors = isDarkMode ? darkColors : lightColors;
        
        scene.fog.color.setHex(currentColors.fog);
        terrain.material.uniforms.uColor.value.setHex(currentColors.terrain);
        terrain.material.uniforms.fogColor.value.setHex(currentColors.fog);
        particles.material.color.setHex(currentColors.particles);
        starField.material.uniforms.uColor.value.setHex(currentColors.stars);
        shootingStar.material.color.setHex(currentColors.stars);
    };

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => setTimeout(updateTheme, 50));
    }

    // Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Hide Boot Sequence if it exists (legacy handling)
    setTimeout(() => {
        const bootOverlay = document.getElementById('boot-sequence');
        if (bootOverlay) {
            bootOverlay.classList.add('boot-hidden');
            setTimeout(() => bootOverlay.style.display = 'none', 500);
        }
    }, 1500);

    // Animation Loop
    const clock = new THREE.Clock();
    let time = 0;
    let reqFrame;

    function animate() {
        if (document.hidden) {
            reqFrame = requestAnimationFrame(animate);
            return;
        }

        const delta = Math.min(clock.getDelta(), 0.1);
        time += delta;

        // Terrain Shader
        terrain.material.uniforms.uTime.value = time;

        // Stars Twinkle
        starField.material.uniforms.uTime.value = time;

        // Particles Float
        const pPositions = particles.geometry.attributes.position.array;
        for (let i = 0; i < maxParticles; i++) {
            pPositions[i * 3 + 1] += particleSpeeds[i];
            if (pPositions[i * 3 + 1] > 25) {
                pPositions[i * 3 + 1] = -5; // Loop to bottom
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;

        // Camera Breathing & Parallax
        if (!prefersReducedMotion) {
            const breathe = Math.sin(time * (Math.PI * 2 / 25)) * 2.5; // Amplitude 2.5 -> Total range 5px
            
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;
            
            // Subtle 10px shift
            camera.position.x = mouseX * 2.5; 
            camera.position.y = 8 + breathe + mouseY * 1.5;
            
            camera.lookAt(0, 2, 0);
        }

        // Shooting Star
        if (ssActive) {
            ssProgress += delta * 1.2;
            if (ssProgress > 1) {
                ssActive = false;
                shootingStar.material.opacity = 0;
            } else {
                const curPos = new THREE.Vector3().lerpVectors(ssStart, ssEnd, ssProgress);
                const trailStart = new THREE.Vector3().lerpVectors(ssStart, ssEnd, Math.max(0, ssProgress - 0.15));
                
                const pos = shootingStar.geometry.attributes.position.array;
                pos[0] = curPos.x; pos[1] = curPos.y; pos[2] = curPos.z;
                pos[3] = trailStart.x; pos[4] = trailStart.y; pos[5] = trailStart.z;
                shootingStar.geometry.attributes.position.needsUpdate = true;
                shootingStar.material.opacity = 1 - ssProgress;
            }
        } else {
            ssTimer -= delta;
            if (ssTimer <= 0) {
                triggerShootingStar();
                ssTimer = 20 + Math.random() * 20;
            }
        }

        renderer.render(scene, camera);
        reqFrame = requestAnimationFrame(animate);
    }

    reqFrame = requestAnimationFrame(animate);
});
