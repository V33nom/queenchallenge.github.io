 /***********************
     *  Element References  *
     ***********************/
    const queen = document.getElementById("queen");
    const game = document.getElementById("game");
    const scoreEl = document.getElementById("score");
    const messageEl = document.getElementById("message");
    const jumpSound = document.getElementById("jump-sound");
    const collectSound = document.getElementById("collect-sound");
    const gameoverSound = document.getElementById("gameover-sound");
    const bgMusic = document.getElementById("bg-music");
    const avatarSelect = document.getElementById("avatar-select");
    const quoteBox = document.getElementById("quote-box");

    /******************************
     *  Random Motivational Quote  *
     ******************************/
    const quotes = [
      "You're doing amazing, Queen 💖",
      "Progress, not perfection 🌿",
      "You're the ruler of your world 👑",
      "Every leap counts 🦋",
      "Your vibe is magical ✨"
    ];
    quoteBox.innerText = quotes[Math.floor(Math.random() * quotes.length)];

    /*******************************
     *  Theme Toggle Functionality  *
     *******************************/
    const themeToggle = document.getElementById("theme-toggle");
    themeToggle.onclick = () => {
      const light = document.body.style.getPropertyValue('--bg') !== '#333';
      document.body.style.setProperty('--bg', light ? '#333' : '#f5e9f7');
      document.body.style.setProperty('--text', light ? '#fff' : '#4a148c');
    };

    /******************************
     *  Music Toggle Functionality  *
     ******************************/
    document.getElementById("music-toggle").onclick = () => {
      bgMusic.paused ? bgMusic.play() : bgMusic.pause();
    };

    /*******************************
     *  Score Initialization & Save  *
     *******************************/
    let score = parseInt(localStorage.getItem("queen-score") || 0);
    scoreEl.innerText = "Score: " + score;

    /************************
     *  Avatar Selection    *
     ************************/
    let gameStarted = false;
    let spawnInterval; // will hold the interval ID

    avatarSelect.querySelectorAll(".avatar-option").forEach(opt => {
      opt.onclick = () => {
        queen.innerText = opt.innerText;
        avatarSelect.style.display = 'none';
        startGame(); // start the spawning and input
      };
    });

    /************************
     *    Jump Function     *
     ************************/
    let isJumping = false;
    function jump() {
      if (!gameStarted || isJumping) return;
      isJumping = true;
      jumpSound.play();
      let up = 0;
      const jumpInterval = setInterval(() => {
        if (up >= 120) {
          clearInterval(jumpInterval);
          // Start falling
          const fallInterval = setInterval(() => {
            if (up <= 0) {
              clearInterval(fallInterval);
              isJumping = false;
              up = 0;
            }
            up -= 2.5;               // FALL speed
            queen.style.bottom = up + "px";
          }, 20);
        } else {
          up += 5;                // RISE speed
          queen.style.bottom = up + "px";
        }
      }, 20);
    }

    /********************************
     *  Create & Move Items/Obstacles  *
     ********************************/
    function createObject(type, icon) {
      const el = document.createElement("div");
      el.classList.add(type);
      el.innerText = icon;
      el.style.left = game.offsetWidth + "px";
      game.appendChild(el);

      const moveInterval = setInterval(() => {
        let left = parseInt(el.style.left);
        left -= 5;
        el.style.left = left + "px";

        // Get bounding rectangles
        const queenRect = queen.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        // Move queen slightly toward object (to the right)
        const queenLeft = queen.offsetLeft;
        if (left > queenLeft && (queenLeft + queen.offsetWidth) < game.offsetWidth) {
          queen.style.left = (queenLeft + 1) + 'px';
        }

        // Collision detection
        const isColliding = !(
          queenRect.right < elRect.left ||
          queenRect.left > elRect.right ||
          queenRect.bottom < elRect.top ||
          queenRect.top > elRect.bottom
        );

        if (isColliding) {
          if (type === "item") {
            score++;
            localStorage.setItem("queen-score", score);
            scoreEl.innerText = "Score: " + score;
            collectSound.play();
            el.remove();
            clearInterval(moveInterval);
          } else {
            clearInterval(moveInterval);
            endGame();
          }
        }

        // Remove off-screen
        if (left < -50) {
          clearInterval(moveInterval);
          el.remove();
        }
      }, 30);
    }

    /*******************************
     *  Input Listeners (Jump)      *
     *******************************/
    function handleInput() { jump(); }
    document.addEventListener("keydown", e => {
      if (e.code === "Space") handleInput();
    });
    document.addEventListener("touchstart", handleInput);

    /*******************************
     *    Game Over Function       *
     *******************************/
    function endGame() {
      gameStarted = false;
      clearInterval(spawnInterval);

      messageEl.style.display = "block";
      messageEl.innerHTML = `
        Game Over 💔<br/>
        Final Score: ${score}<br/><br/>
        Mission complete, Queen Anushkhaa 👑<br/>
        You ruled the game — and my heart.<br/><br/>
        <button id='replay-btn'>Play Again</button>
      `;
      gameoverSound.play();
      document.removeEventListener("keydown", handleInput);
      document.removeEventListener("touchstart", handleInput);
      document.getElementById("replay-btn").onclick = () => location.reload();
    }

    /********************************
     *  Spawn Items & Obstacles Every 2 Sec  *
     ********************************/
    function startGame() {
      gameStarted = true;
      spawnInterval = setInterval(() => {
        const rand = Math.random();
        if (rand < 0.5) {
          // 50% chance: Coffee
          createObject("item", "☕");
        } else if (rand < 0.7) {
          // Next 20%: Cake
          createObject("item", "🍰");
        } else if (rand < 0.85) {
          // Next 15%: High-heel
          createObject("item", "👠");
        } else if (rand < 0.93) {
          // Next 8%: Chains
          createObject("item", "⛓️");
        } else if (rand < 0.97) {
          // Next 4%: Lock
          createObject("item", "🔒");
        } else {
          // Remaining 3%: one random obstacle
          const obsRand = Math.random();
          if (obsRand < 0.33) createObject("obstacle", "⏰");
          else if (obsRand < 0.66) createObject("obstacle", "⚡");
          else createObject("obstacle", "🥀");
        }
      }, 2000);

      // Re‐attach input listeners after avatar selection
      document.addEventListener("keydown", e => {
        if (e.code === "Space") handleInput();
      });
      document.addEventListener("touchstart", handleInput);
    }