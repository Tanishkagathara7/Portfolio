/* Retro Pixel Art Portfolio JavaScript Logic */

document.addEventListener("DOMContentLoaded", () => {
  
  // Force scroll to top on page reload/refresh and clear hash to start from the beginning
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  window.addEventListener('load', () => {
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (window.location.hash && window.location.hash !== '#hero') {
        history.replaceState("", document.title, window.location.pathname + window.location.search);
      }
    }, 10);
  });
  
  // ==========================================
  // 1. Theme Toggle (Light / Dark Mode)
  // ==========================================
  const themeToggleBtn = document.getElementById("theme-toggle");
  const sunIcon = document.getElementById("sun-icon");
  const moonIcon = document.getElementById("moon-icon");

  // Check saved theme or default to system
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    document.body.classList.add("dark");
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
  } else {
    document.body.classList.remove("dark");
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
  }

  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    
    if (isDark) {
      localStorage.setItem("theme", "dark");
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    } else {
      localStorage.setItem("theme", "light");
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    }
    
    // Output message in terminal if open
    addTerminalLine(`> System theme updated to: ${isDark ? 'DARK_MODE' : 'LIGHT_MODE'}`);
  });

  // ==========================================
  // 2. Mobile Menu Toggle
  // ==========================================
  const menuToggleBtn = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  menuToggleBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // Close mobile menu when nav link is clicked
  const navItems = navLinks.querySelectorAll("a");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });

  // ==========================================
  // 3. Header Background on Scroll
  // ==========================================
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // ==========================================
  // 4. Scroll Reveal Animations & Skill Bars
  // ==========================================
  const reveals = document.querySelectorAll(".reveal");
  const skillBars = document.querySelectorAll(".skill-bar-inner");

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    reveals.forEach(reveal => {
      const revealTop = reveal.getBoundingClientRect().top;
      const revealPoint = 100;
      if (revealTop < windowHeight - revealPoint) {
        reveal.classList.add("active");
      }
    });
  };

  // Skill Bar animation using IntersectionObserver
  const skillObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const targetWidth = bar.getAttribute("data-width");
        bar.style.width = targetWidth;
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.1 });

  skillBars.forEach(bar => {
    skillObserver.observe(bar);
  });

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll(); // Trigger initial check

  // ==========================================
  // 5. 8-Bit Chiptune Song Player (Local MP3)
  // ==========================================
  const musicToggleBtn = document.getElementById("music-toggle");
  const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
  audio.loop = true; // Loop continuously
  let isPlaying = false;

  function startMusic() {
    audio.play().then(() => {
      isPlaying = true;
      musicToggleBtn.classList.add("playing");
      addTerminalLine("> Audio Player: PLAYING Background Music");
    }).catch(err => {
      console.error("Audio play failed:", err);
      addTerminalLine("> Audio Player: ERROR playing audio. Interaction required.", "#FF4B4B");
    });
  }

  function stopMusic() {
    audio.pause();
    isPlaying = false;
    musicToggleBtn.classList.remove("playing");
    addTerminalLine("> Audio Player: STOPPED");
  }

  musicToggleBtn.addEventListener("click", () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  });

  // Music Prompt Modal Logic
  const musicModal = document.getElementById("music-modal");
  const startMusicBtn = document.getElementById("start-music-btn");
  const skipMusicBtn = document.getElementById("skip-music-btn");
  const closeMusicModal = document.getElementById("close-music-modal");

  if (musicModal && !sessionStorage.getItem("musicPromptShown")) {
    // Show after the boot sequence completes (boot takes ~2.7s)
    setTimeout(() => {
      musicModal.classList.add("active");
      sessionStorage.setItem("musicPromptShown", "true");
    }, 3000); 
  }

  const hideMusicModal = () => {
    if (musicModal) musicModal.classList.remove("active");
  };

  if (startMusicBtn) {
    startMusicBtn.addEventListener("click", () => {
      startMusic();
      hideMusicModal();
    });
  }

  if (skipMusicBtn) {
    skipMusicBtn.addEventListener("click", hideMusicModal);
  }
  
  if (closeMusicModal) {
    closeMusicModal.addEventListener("click", hideMusicModal);
  }



  // ==========================================
  // 6. Interactive CLI Terminal Widget
  // ==========================================
  const termHistory = document.getElementById("term-history");
  const termInput = document.getElementById("term-input");
  const termBody = document.getElementById("term-body");

  // Custom helper to append text lines to the console
  function addTerminalLine(text, color = "") {
    const line = document.createElement("div");
    line.className = "terminal-output-line";
    if (color) {
      line.style.color = color;
    }
    line.innerHTML = text;
    termHistory.appendChild(line);
    
    // Scroll terminal to the bottom
    termBody.scrollTop = termBody.scrollHeight;
  }

  // Pre-configured responses for commands
  const commands = {
    help: () => {
      addTerminalLine("Available Commands:", "#FFC700");
      addTerminalLine("  <span style='color:#00FFFF;'>about</span>      - Quick bio and summary of profile");
      addTerminalLine("  <span style='color:#00FFFF;'>skills</span>     - Core technical stack and metrics");
      addTerminalLine("  <span style='color:#00FFFF;'>experience</span> - Interactive professional history");
      addTerminalLine("  <span style='color:#00FFFF;'>certs</span>      - View awards and credentials");
      addTerminalLine("  <span style='color:#00FFFF;'>music</span>      - Play or pause the 8-bit theme synth");
      addTerminalLine("  <span style='color:#00FFFF;'>matrix</span>     - Run a cool green digital code effect");
      addTerminalLine("  <span style='color:#00FFFF;'>clear</span>      - Flush terminal history lines");
      addTerminalLine("  <span style='color:#00FFFF;'>contact</span>    - Show contact links and profiles");
    },
    about: () => {
      addTerminalLine("--- TANISH ---", "#FFC700");
      addTerminalLine("Role: Software Engineer / Full Stack Developer");
      addTerminalLine("Summary: I build systems that hold up under pressure and interfaces people actually enjoy using.");
      addTerminalLine("Education: B.Tech — Computer Engineering @ Darshan University.");
      addTerminalLine("Location: Rajkot, India");
    },
    skills: () => {
      addTerminalLine("--- SKILLS AND METRICS ---", "#FFC700");
      addTerminalLine("  [■■■■■■■■■■] 95% - Frontend (React, Next.js, TypeScript, Tailwind, Laravel)");
      addTerminalLine("  [■■■■■■■■■ ] 90% - Backend (Node.js, NestJS, Python, PHP)");
      addTerminalLine("  [■■■■■■■■  ] 85% - Databases (MongoDB, SQL)");
      addTerminalLine("  [■■■■■■■■  ] 80% - Mobile (React Native)");
    },
    experience: () => {
      addTerminalLine("--- PROFESSIONAL HISTORY ---", "#FFC700");
      addTerminalLine("");
      addTerminalLine("> Full Stack Developer");
      addTerminalLine("  Techmatrix — Rajkot, IN (Present)");
      addTerminalLine("   - Developing and maintaining robust full-stack web applications.");
      addTerminalLine("   - Collaborating with teams to ship high-quality features and optimize performance.");
      addTerminalLine("");
      addTerminalLine("> Teaching Assistant");
      addTerminalLine("  Darshan University — Rajkot, IN (Dec 2024 - Oct 2025)");
      addTerminalLine("   - Mentored undergraduate students in React Native and JavaScript.");
      addTerminalLine("   - Conducted practical sessions and guided project building.");
    },
    certs: () => {
      addTerminalLine("--- CREDENTIALS & AWARDS ---", "#FFC700");
      addTerminalLine("🏆 5+ Projects Delivered with 100% Client Satisfaction.");
    },
    contact: () => {
      addTerminalLine("--- REACH OUT ---", "#FFC700");
      addTerminalLine("📧 Email: kagatharatanish@gmail.com");
      addTerminalLine("💻 GitHub: github.com/Tanishkagathara7");
      addTerminalLine("👔 LinkedIn: linkedin.com/in/tanish-kagathara-83ba26229");
      addTerminalLine("📞 Phone: +91 9328978130");
    },
    music: () => {
      if (isPlaying) {
        stopMusic();
      } else {
        startMusic();
      }
    },
    matrix: () => {
      addTerminalLine("Entering Matrix Digital Rain...", "#00FF00");
      let count = 0;
      const matrixInterval = setInterval(() => {
        let line = "";
        for (let i = 0; i < 40; i++) {
          line += Math.random() > 0.5 ? String.fromCharCode(33 + Math.floor(Math.random() * 93)) : " ";
        }
        addTerminalLine(line, "#00FF00");
        count++;
        if (count > 15) {
          clearInterval(matrixInterval);
          addTerminalLine("Matrix effect complete. Ready for next input.", "#FFC700");
        }
      }, 80);
    },
    clear: () => {
      termHistory.innerHTML = "";
    }
  };

  // Command input event handler
  termInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const inputVal = termInput.value.trim().toLowerCase();
      
      // Display user prompt in history
      addTerminalLine(`<span style="color:#00ffff;">tanish@portfolio:~$</span> ${termInput.value}`);
      
      // Clear input
      termInput.value = "";
      
      if (inputVal === "") return;
      
      // Execute command or give default error
      if (commands[inputVal]) {
        commands[inputVal]();
      } else {
        addTerminalLine(`Command not found: <span style="color:#FF4B4B;">${inputVal}</span>. Type 'help' for options.`, "#FF4B4B");
      }
    }
  });

  // Focus terminal input when clicking anywhere inside the terminal body
  termBody.addEventListener("click", () => {
    termInput.focus();
  });

  // ==========================================
  // 7. Interactive Snake Game on CRT TV Screen
  // ==========================================
  const gameCanvas = document.getElementById("game-canvas");
  const gameCtx = gameCanvas ? gameCanvas.getContext("2d") : null;

  const gridScale = 10;
  const cols = gameCanvas ? gameCanvas.width / gridScale : 0; // 29 columns
  const rows = gameCanvas ? gameCanvas.height / gridScale : 0; // 21 rows

  let snake = [];
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let food = { x: 0, y: 0 };
  let score = 0;
  let gameState = "START"; // START, PLAYING, GAMEOVER
  let gameInterval = null;
  const gameSpeed = 120; // Milliseconds per tick

  // Render text helper
  function drawText(text, x, y, size, color, align = "center") {
    gameCtx.fillStyle = color;
    gameCtx.font = `${size}px 'Press Start 2P', monospace`; // Using pixel font
    if (size < 12) {
      gameCtx.font = `${size}px 'VT323', monospace`; // Fallback to VT323 for smaller descriptions
    }
    gameCtx.textAlign = align;
    gameCtx.fillText(text, x, y);
  }

  function generateFood() {
    let foodX, foodY;
    let onSnake = true;
    while (onSnake) {
      foodX = Math.floor(Math.random() * cols);
      foodY = Math.floor(Math.random() * rows);
      onSnake = snake.some(segment => segment.x === foodX && segment.y === foodY);
    }
    food = { x: foodX, y: foodY };
  }

  function startSnakeGame() {
    snake = [
      { x: 14, y: 10 },
      { x: 13, y: 10 },
      { x: 12, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    generateFood();
    gameState = "PLAYING";
    
    // Log to terminal CLI
    addTerminalLine("> System: SNAKE_GAME.EXE loaded in CRT screen.");
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, gameSpeed);
  }

  function updateGame() {
    if (gameState !== "PLAYING") return;

    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Wall collision
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      endSnakeGame();
      return;
    }

    // Self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      endSnakeGame();
      return;
    }

    // Move head in
    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      generateFood();
      playBeep(880, 60); // Retro coin collections sound
    } else {
      snake.pop();
    }

    drawGame();
  }

  function endSnakeGame() {
    gameState = "GAMEOVER";
    clearInterval(gameInterval);
    playBeep(220, 300); // Game over sad buzz sound
    
    // Log final score to terminal CLI
    addTerminalLine(`> System: Game Over. Score achieved: ${score}`);
    drawGame();
  }

  // Synthesizes retro sounds using Web Audio API
  function playBeep(freq, duration) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000 - 0.01);
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start();
      osc.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
      console.log("Audio synthesis error:", e);
    }
  }

  function drawGame() {
    // Canvas background - slate charcoal
    gameCtx.fillStyle = "#12151c";
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    if (gameState === "START") {
      drawText("SNAKE GAME", gameCanvas.width / 2, 70, 16, "#fdf0c9"); // Banana Cream
      drawText("CLICK TO START", gameCanvas.width / 2, 120, 16, "#cbbef7"); // Lavender
      drawText("USE WASD OR ARROW KEYS TO CONTROL", gameCanvas.width / 2, 165, 12, "#e1e2e5"); // Soft Silver
      return;
    }

    if (gameState === "GAMEOVER") {
      drawText("GAME OVER", gameCanvas.width / 2, 70, 18, "#e59a9c"); // Muted Rose
      drawText(`SCORE: ${score}`, gameCanvas.width / 2, 115, 16, "#e1e2e5");
      drawText("CLICK TO PLAY AGAIN", gameCanvas.width / 2, 160, 14, "#cbbef7");
      return;
    }

    // Draw Food (Soft Peach)
    gameCtx.fillStyle = "#fcdcd1";
    gameCtx.fillRect(food.x * gridScale + 1, food.y * gridScale + 1, gridScale - 2, gridScale - 2);

    // Draw Snake
    snake.forEach((segment, index) => {
      // Lavender head, Sage Green body
      gameCtx.fillStyle = index === 0 ? "#cbbef7" : "#bfe5ca";
      gameCtx.fillRect(segment.x * gridScale + 1, segment.y * gridScale + 1, gridScale - 2, gridScale - 2);
      
      // Slate outline
      gameCtx.strokeStyle = "#12151c";
      gameCtx.strokeRect(segment.x * gridScale, segment.y * gridScale, gridScale, gridScale);
    });

    // Draw score hud
    gameCtx.fillStyle = "#e1e2e5";
    gameCtx.font = "14px 'VT323', monospace";
    gameCtx.textAlign = "left";
    gameCtx.fillText(`SCORE: ${score}`, 10, 20);
  }

  // Start the game on screen click
  if (gameCanvas) {
    gameCanvas.addEventListener("click", () => {
      if (gameState === "START" || gameState === "GAMEOVER") {
        startSnakeGame();
      }
    });
  }

  // Watch for keyboard arrow key controls
  if (gameCanvas) {
    window.addEventListener("keydown", (e) => {
      // Only control snake if terminal input is not focused
      if (document.activeElement === termInput) return;

      const key = e.key;

      if (gameState === "PLAYING") {
        // Prevent browser page from scrolling up/down with arrow keys or space
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)) {
          e.preventDefault();
        }

        if ((key === "ArrowUp" || key === "w" || key === "W") && direction.y === 0) {
          nextDirection = { x: 0, y: -1 };
        } else if ((key === "ArrowDown" || key === "s" || key === "S") && direction.y === 0) {
          nextDirection = { x: 0, y: 1 };
        } else if ((key === "ArrowLeft" || key === "a" || key === "A") && direction.x === 0) {
          nextDirection = { x: -1, y: 0 };
        } else if ((key === "ArrowRight" || key === "d" || key === "D") && direction.x === 0) {
          nextDirection = { x: 1, y: 0 };
        }
      } else {
        if (key === "Enter" || key === " ") {
          startSnakeGame();
        }
      }
    });
  }

  // ==========================================
  // 8. Contact Modal Dialog
  // ==========================================
  const contactBtn = document.getElementById("contact-btn");
  const contactModal = document.getElementById("contact-modal");
  const closeModalBtn1 = document.getElementById("close-modal");
  const closeModalBtn2 = document.getElementById("close-modal-btn");

  if (contactBtn && contactModal) {
    const openModal = () => {
      contactModal.classList.add("active");
      addTerminalLine("> System: Opening CONTACT_ME.EXE window.");
    };

    const closeModal = () => {
      contactModal.classList.remove("active");
      addTerminalLine("> System: Closed contact details.");
    };

    contactBtn.addEventListener("click", openModal);
    
    if (closeModalBtn1) closeModalBtn1.addEventListener("click", closeModal);
    if (closeModalBtn2) closeModalBtn2.addEventListener("click", closeModal);

    // Close modal when clicking outside the container
    contactModal.addEventListener("click", (e) => {
      if (e.target === contactModal) {
        closeModal();
      }
    });
  }

  // ==========================================
  // 9. Project Details Modals
  // ==========================================
  const detailsTriggers = document.querySelectorAll(".details-trigger-btn");
  
  detailsTriggers.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const modal = document.getElementById(targetId);
      if (modal) {
        modal.classList.add("active");
        addTerminalLine(`> System: Opening detail file: ${targetId}.SYS`);
        
        // Find closing buttons inside this modal
        const closeButtons = modal.querySelectorAll(".close-project-modal");
        closeButtons.forEach(closeBtn => {
          closeBtn.addEventListener("click", () => {
            modal.classList.remove("active");
            addTerminalLine(`> System: Closed project details.`);
          }, { once: true });
        });

        // Close on click outside
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            modal.classList.remove("active");
            addTerminalLine(`> System: Closed project details.`);
          }
        }, { once: true });
      }
    });
  });

  // Draw initial start screen
  if (gameCanvas) {
    drawGame();
  }

  // ==========================================
  // 10. Background Particle System (Pixel Dust)
  // ==========================================
  const createPixelDust = () => {
    if (document.getElementById("pixel-dust-container")) return;
    
    const container = document.createElement("div");
    container.id = "pixel-dust-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "0";
    document.body.appendChild(container);

    const colors = [
      "var(--primary)",
      "var(--accent)",
      "var(--accent-blue)",
      "var(--secondary)"
    ];
    
    const pixelCount = 15;
    for (let i = 0; i < pixelCount; i++) {
      const pixel = document.createElement("div");
      pixel.className = "floating-pixel";
      pixel.style.position = "absolute";
      
      const size = Math.floor(Math.random() * 5) + 4;
      pixel.style.width = `${size}px`;
      pixel.style.height = `${size}px`;
      
      const colorVar = colors[Math.floor(Math.random() * colors.length)];
      pixel.style.backgroundColor = `hsl(${colorVar})`;
      
      pixel.style.left = `${Math.random() * 100}vw`;
      pixel.style.top = `${Math.random() * 100}vh`;
      
      const duration = Math.random() * 15 + 15;
      const delay = Math.random() * -30;
      pixel.style.animation = `floatPixel ${duration}s linear infinite`;
      pixel.style.animationDelay = `${delay}s`;
      
      container.appendChild(pixel);
    }
  };
  createPixelDust();

});
