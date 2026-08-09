/* Retro Pixel Art Portfolio JavaScript Logic */

document.addEventListener("DOMContentLoaded", () => {
  
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

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
  
  // Typewriter effect for Hero Subtitle
  const typewriterText = document.getElementById("typewriter-text");
  if (typewriterText) {
    const phrases = [
      '<span class="tagline-blue">Building scalable web, desktop</span><br><span class="tagline-purple">& mobile experiences.</span><br><span class="tagline-tech">Laravel · React · Node.js · Electron · React Native</span>'
    ];
    let phraseIndex = 0;
    let tokenIndex = 0;
    let tokens = parseHTMLToTokens(phrases[phraseIndex]);
    let isDeleting = false;

    function parseHTMLToTokens(html) {
      const result = [];
      let i = 0;
      while (i < html.length) {
        if (html[i] === '<') {
          const end = html.indexOf('>', i);
          if (end !== -1) {
            result.push({ type: 'tag', value: html.substring(i, end + 1) });
            i = end + 1;
            continue;
          }
        }
        result.push({ type: 'char', value: html[i] });
        i++;
      }
      return result;
    }

    function typeEffect() {
      if (!isDeleting) {
        if (tokenIndex < tokens.length) {
          while (tokenIndex < tokens.length && tokens[tokenIndex].type === 'tag') {
            tokenIndex++;
          }
          tokenIndex++;
          typewriterText.innerHTML = tokens.slice(0, tokenIndex).map(t => t.value).join('');
          setTimeout(typeEffect, 30 + Math.random() * 15);
        } else {
          // Keep tagline static after typing completes
          return;
        }
      } else {
        if (tokenIndex > 0) {
          tokenIndex--;
          while (tokenIndex > 0 && tokens[tokenIndex - 1].type === 'tag') {
            tokenIndex--;
          }
          typewriterText.innerHTML = tokens.slice(0, tokenIndex).map(t => t.value).join('');
          setTimeout(typeEffect, 15);
        } else {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          tokens = parseHTMLToTokens(phrases[phraseIndex]);
          tokenIndex = 0;
          setTimeout(typeEffect, 500);
        }
      }
    }
    
    const needsMusicPrompt = true;
    if (needsMusicPrompt) {
      window.addEventListener('startTypewriter', () => {
        setTimeout(typeEffect, 200);
      }, { once: true });
    } else {
      setTimeout(typeEffect, 1800);
    }
  }

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
  const mobileBackdrop = document.getElementById("mobile-menu-backdrop");

  const toggleMenu = () => {
    const isOpen = navLinks.classList.toggle("active");
    menuToggleBtn.classList.toggle("active", isOpen);
    if (mobileBackdrop) mobileBackdrop.classList.toggle("active", isOpen);
    menuToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  const closeMenu = () => {
    navLinks.classList.remove("active");
    menuToggleBtn.classList.remove("active");
    if (mobileBackdrop) mobileBackdrop.classList.remove("active");
    menuToggleBtn.setAttribute("aria-expanded", "false");
  };

  if (menuToggleBtn) {
    menuToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener("click", closeMenu);
  }

  // Close mobile menu when nav link is clicked
  const navItems = navLinks.querySelectorAll("a");
  navItems.forEach(item => {
    item.addEventListener("click", closeMenu);
  });

  // Close menu when clicking outside of links and menu button
  document.addEventListener("click", (e) => {
    if (navLinks.classList.contains("active")) {
      if (!navLinks.contains(e.target) && !menuToggleBtn.contains(e.target)) {
        closeMenu();
      }
    }
  });

  // ==========================================
  // 3. Header Background on Scroll & Active Nav Section Highlights
  // ==========================================
  const header = document.getElementById("header");
  const sectionsList = document.querySelectorAll("section");
  const navLinksList = document.querySelectorAll(".nav-links a");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    let currentSectionId = "hero";
    sectionsList.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 150)) {
        currentSectionId = section.getAttribute("id");
      }
    });

    navLinksList.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });
  });

  // ==========================================
  // 4. Scroll Reveal Animations & Skill Bars
  // ==========================================
  // Legacy CSS reveal logic removed. Animations are now handled by GSAP in animations.js

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

  const needsMusicPrompt = true;

  if (musicModal && needsMusicPrompt) {
    // Show immediately after the boot sequence completes (at 1600ms)
    setTimeout(() => {
      musicModal.classList.add("active");
    }, 1600); 
  }

  const hideMusicModal = () => {
    if (musicModal) musicModal.classList.remove("active");
    window.dispatchEvent(new CustomEvent('startHeroReveal'));
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
      
      // Display user prompt in history (escaped to prevent XSS)
      const escapedInput = termInput.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      addTerminalLine(`<span style="color:#00ffff;">tanish@portfolio:~$</span> ${escapedInput}`);
      
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

  const gridScale = 20;
  const cols = gameCanvas ? gameCanvas.width / gridScale : 0; // 29 columns
  const rows = gameCanvas ? gameCanvas.height / gridScale : 0; // 21 rows

  let snake = [];
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let hasTurnedThisTick = false;
  let food = { x: 0, y: 0 };
  let score = 0;
  let gameState = "START"; // START, PLAYING, GAMEOVER, WON
  let gameInterval = null;
  const gameSpeed = 120; // Milliseconds per tick

  // Modal selector for game result popup
  const gameModal = document.getElementById("game-modal");
  const gameModalTitle = document.getElementById("game-modal-title");
  const gameModalDesc = document.getElementById("game-modal-desc");
  const gameModalActionBtn = document.getElementById("game-modal-action-btn");
  const gameModalCloseBtn = document.getElementById("game-modal-close-btn");
  const closeGameModalX = document.getElementById("close-game-modal");

  function showGameModal(isWin) {
    if (!gameModal) return;
    if (isWin) {
      if (gameModalTitle) {
        gameModalTitle.textContent = "> YOU WON!";
        gameModalTitle.style.color = "hsl(var(--success))";
      }
      if (gameModalDesc) gameModalDesc.textContent = "You should hire me, you won the game!";
    } else {
      if (gameModalTitle) {
        gameModalTitle.textContent = "> GAME OVER";
        gameModalTitle.style.color = "#e59a9c"; // Muted Rose
      }
      if (gameModalDesc) gameModalDesc.textContent = "You lose, now you have to hire me!";
    }
    gameModal.classList.add("active");
  }

  const hideGameModal = () => {
    if (gameModal) gameModal.classList.remove("active");
  };

  if (gameModalActionBtn) {
    gameModalActionBtn.addEventListener("click", () => {
      hideGameModal();
      const contactModal = document.getElementById("contact-modal");
      if (contactModal) {
        contactModal.classList.add("active");
        addTerminalLine("> System: Opening CONTACT_ME.EXE window.");
      }
    });
  }

  if (gameModalCloseBtn) gameModalCloseBtn.addEventListener("click", hideGameModal);
  if (closeGameModalX) closeGameModalX.addEventListener("click", hideGameModal);
  if (gameModal) {
    gameModal.addEventListener("click", (e) => {
      if (e.target === gameModal) hideGameModal();
    });
  }

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
    hasTurnedThisTick = false;
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

    hasTurnedThisTick = false;
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
      if (score >= 100) {
        winSnakeGame();
      }
    } else {
      snake.pop();
    }

    drawGame();
  }

  function winSnakeGame() {
    gameState = "WON";
    clearInterval(gameInterval);
    playBeep(523.25, 100);
    setTimeout(() => playBeep(659.25, 150), 100);
    setTimeout(() => playBeep(783.99, 300), 250);
    
    addTerminalLine(`> System: Game Won! Score achieved: ${score}`);
    showGameModal(true);
    drawGame();
  }

  function endSnakeGame() {
    gameState = "GAMEOVER";
    clearInterval(gameInterval);
    playBeep(220, 300); // Game over sad buzz sound
    
    // Log final score to terminal CLI
    addTerminalLine(`> System: Game Over. Score achieved: ${score}`);
    showGameModal(false);
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
      drawText("SNAKE GAME", gameCanvas.width / 2, 120, 28, "#fdf0c9"); // Banana Cream
      drawText("CLICK SCREEN TO START", gameCanvas.width / 2, 220, 20, "#cbbef7"); // Lavender
      drawText("USE WASD / ARROWS TO CONTROL", gameCanvas.width / 2, 300, 16, "#e1e2e5"); // Soft Silver
      drawText("FOCUS SCREEN TO BIND KEYS", gameCanvas.width / 2, 340, 14, "#e1e2e5");
      return;
    }

    if (gameState === "GAMEOVER") {
      drawText("GAME OVER", gameCanvas.width / 2, 140, 32, "#e59a9c"); // Muted Rose
      drawText(`SCORE: ${score}`, gameCanvas.width / 2, 230, 24, "#e1e2e5");
      drawText("CLICK TO PLAY AGAIN", gameCanvas.width / 2, 320, 20, "#cbbef7");
      return;
    }

    if (gameState === "WON") {
      drawText("YOU WON!", gameCanvas.width / 2, 140, 32, "#bfe5ca"); // Sage Green
      drawText(`SCORE: ${score}`, gameCanvas.width / 2, 230, 24, "#e1e2e5");
      drawText("CLICK TO PLAY AGAIN", gameCanvas.width / 2, 320, 20, "#cbbef7");
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
    gameCtx.font = "20px 'VT323', monospace";
    gameCtx.textAlign = "left";
    gameCtx.fillText(`SCORE: ${score}`, 15, 30);
  }

  // Start the game on screen click
  if (gameCanvas) {
    gameCanvas.addEventListener("click", () => {
      if (gameState === "START" || gameState === "GAMEOVER" || gameState === "WON") {
        startSnakeGame();
      }
    });
  }

  // Watch for keyboard arrow key controls
  if (gameCanvas) {
    window.addEventListener("keydown", (e) => {
      // Only control snake if gameCanvas has focus
      if (document.activeElement !== gameCanvas) return;

      const key = e.key;

      if (gameState === "PLAYING") {
        // Prevent browser page from scrolling up/down with arrow keys or space
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)) {
          e.preventDefault();
        }

        if (hasTurnedThisTick) return;

        if ((key === "ArrowUp" || key === "w" || key === "W") && direction.y === 0) {
          nextDirection = { x: 0, y: -1 };
          hasTurnedThisTick = true;
        } else if ((key === "ArrowDown" || key === "s" || key === "S") && direction.y === 0) {
          nextDirection = { x: 0, y: 1 };
          hasTurnedThisTick = true;
        } else if ((key === "ArrowLeft" || key === "a" || key === "A") && direction.x === 0) {
          nextDirection = { x: -1, y: 0 };
          hasTurnedThisTick = true;
        } else if ((key === "ArrowRight" || key === "d" || key === "D") && direction.x === 0) {
          nextDirection = { x: 1, y: 0 };
          hasTurnedThisTick = true;
        }
      } else {
        if (key === "Enter" || key === " ") {
          e.preventDefault();
          startSnakeGame();
        }
      }
    });
  }

  // Mobile D-pad & Swipe controls mapping
  const changeDirectionMobile = (dirKey) => {
    if (gameState === "START" || gameState === "GAMEOVER" || gameState === "WON") {
      startSnakeGame();
      return;
    }
    if (hasTurnedThisTick) return;

    if (dirKey === "up" && direction.y === 0) {
      nextDirection = { x: 0, y: -1 };
      hasTurnedThisTick = true;
    } else if (dirKey === "down" && direction.y === 0) {
      nextDirection = { x: 0, y: 1 };
      hasTurnedThisTick = true;
    } else if (dirKey === "left" && direction.x === 0) {
      nextDirection = { x: -1, y: 0 };
      hasTurnedThisTick = true;
    } else if (dirKey === "right" && direction.x === 0) {
      nextDirection = { x: 1, y: 0 };
      hasTurnedThisTick = true;
    }
  };

  // Bind D-pad Buttons
  const btnUp = document.getElementById("btn-up");
  const btnDown = document.getElementById("btn-down");
  const btnLeft = document.getElementById("btn-left");
  const btnRight = document.getElementById("btn-right");

  if (btnUp) btnUp.addEventListener("click", () => changeDirectionMobile("up"));
  if (btnDown) btnDown.addEventListener("click", () => changeDirectionMobile("down"));
  if (btnLeft) btnLeft.addEventListener("click", () => changeDirectionMobile("left"));
  if (btnRight) btnRight.addEventListener("click", () => changeDirectionMobile("right"));

  // Bind Swipe Gestures on Canvas
  if (gameCanvas) {
    let touchStartX = 0;
    let touchStartY = 0;

    gameCanvas.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    gameCanvas.addEventListener("touchend", (e) => {
      if (gameState !== "PLAYING") return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      // Threshold to detect swipe
      if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        if (Math.abs(dx) > Math.abs(dy)) {
          changeDirectionMobile(dx > 0 ? "right" : "left");
        } else {
          changeDirectionMobile(dy > 0 ? "down" : "up");
        }
      }
    }, { passive: true });
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

    contactBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
        addTerminalLine("> System: Navigating to direct contact section.");
      } else {
        openModal();
      }
    });
    
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
  // 9. Project Details Modals Close Listeners Setup (Once)
  // ==========================================
  const projectModals = document.querySelectorAll(".project-detail-modal, #chess-modal, #plagiarism-modal, #billing-modal, #cricket-modal");
  
  projectModals.forEach(modal => {
    // Find closing buttons inside this modal
    const closeButtons = modal.querySelectorAll(".close-project-modal");
    closeButtons.forEach(closeBtn => {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
        addTerminalLine(`> System: Closed project details.`);
      });
    });

    // Close on click outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
        addTerminalLine(`> System: Closed project details.`);
      }
    });
  });

  const detailsTriggers = document.querySelectorAll(".details-trigger-btn");
  
  detailsTriggers.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const modal = document.getElementById(targetId);
      if (modal) {
        modal.classList.add("active");
        addTerminalLine(`> System: Opening detail file: ${targetId}.SYS`);
      }
    });
  });

  // Draw initial start screen
  if (gameCanvas) {
    drawGame();
  }

  // ==========================================
  // 10. Interactive Spotlight Cursor Tracker
  // ==========================================
  const bgSpotlight = document.getElementById("bg-spotlight");
  if (bgSpotlight) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      document.documentElement.style.setProperty("--mouse-x", `${mouseX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${mouseY}px`);
    });
  }

  // CTA Decorations subtle mouse parallax
  const ctaDecorations = document.querySelector(".cta-decorations");
  if (ctaDecorations) {
    window.addEventListener("mousemove", (e) => {
      const offsetX = (window.innerWidth / 2 - e.clientX) * 0.015;
      const offsetY = (window.innerHeight / 2 - e.clientY) * 0.015;
      ctaDecorations.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
  // ==========================================
  // 11. Direct Form Submission via FormSubmit AJAX
  // ==========================================
  const contactForm = document.querySelector('.direct-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;
      
      const formData = {
        name: document.getElementById('form-name').value,
        email: document.getElementById('form-email').value,
        message: document.getElementById('form-body').value,
        _subject: "New Message from Developer Portfolio!"
      };
      
      fetch("https://formsubmit.co/ajax/kagatharatanish@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(data => {
        submitBtn.textContent = "Message Sent Successfully!";
        submitBtn.style.backgroundColor = "hsl(var(--success))";
        contactForm.reset();
        if (typeof addTerminalLine === 'function') {
          addTerminalLine("> System: Message sent successfully via form endpoint.");
        }
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.backgroundColor = "";
        }, 4000);
      })
      .catch(error => {
        console.error(error);
        submitBtn.textContent = "Error Sending Message";
        submitBtn.style.backgroundColor = "#ff4b4b";
        if (typeof addTerminalLine === 'function') {
          addTerminalLine("> System: ERROR sending message. Check network connection.", "#ff4b4b");
        }
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.backgroundColor = "";
        }, 4000);
      });
    });
  }

});
