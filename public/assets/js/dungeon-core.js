(() => {
  const TILESET_FOLDER = "assets/dungeon/SIMPBRICKS";
  const GOBBO_PATH = "assets/objects/GOBBO";
  const VIEW_DEPTH = 4;
  const MAX_OFFSET = 4;
  const npcLocation = { x: 6, y: 1 };

  let mapData = [];
  let mapWidth = 0;
  let mapHeight = 0;
  let wallImages = {}; // key: wallKey, value: Image object
  let textureVariants = { G: 1, C: 1, F: 1, L: 1, R: 1 }; // Add E/W handling later
  let turnInProgress = false;
  let useAnimation = true;
  let manifest = {};
  let gobboImages = {};
  let bgImage = null;
  let assetsLoaded = false;
  let canvas, ctx, animToggleBtn;

  const player = { x: 3, y: 3, dir: 0 };
  const DIRS = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }
  ];

  function loadImage(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

function getVariant(prefix, x, y) {
    const count = textureVariants[prefix] || 1;
    return (x + y) % count + 1;
  }

  async function preloadAssets() {
    manifest = await fetch(`${TILESET_FOLDER}/manifest.json`).then(res => res.json());
    const promises = [];

    // Count available variants
    const variantCounts = { G: new Set(), C: new Set(), F: new Set(), L: new Set(), R: new Set() };
    for (const key of manifest.textures) {
      const match = key.match(/^([A-Z])([0-9])_/);
      if (match) variantCounts[match[1]]?.add(parseInt(match[2]));
    }
    for (const type in variantCounts) {
      textureVariants[type] = variantCounts[type].size || 1;
    }

    for (const wallKey of manifest.textures) {
      const imgPath = `${TILESET_FOLDER}/${wallKey}.png`;
      promises.push(loadImage(imgPath).then(img => {
        if (img) wallImages[`${wallKey}.png`] = img;
      }));
    }

    for (let depth = 0; depth <= VIEW_DEPTH; depth++) {
      for (let offset = -MAX_OFFSET; offset <= MAX_OFFSET; offset++) {
        const key = `${offset}_${depth}`;
        const npcFile = `GOBBO_${key}.png`;
        promises.push(loadImage(`${GOBBO_PATH}/${npcFile}`).then(img => {
          if (img) gobboImages[key] = img;
        }));
      }
    }

    await Promise.all(promises);
    assetsLoaded = true;
    drawScene();
    updatePlayerPositionDisplay();
    await waitForTurnEnd();
  }


  function isWalkable(x, y, fromDir = null) {
    if (!mapData[y] || !mapData[y][x]) return false;
    if (!fromDir) return true;

    const tile = mapData[y][x];
    const oppDir = ["N", "E", "S", "W"][("NESW".indexOf(fromDir) + 2) % 4];
    return !tile.walls[oppDir];
  }

  function posAfter(dir, steps) {
    const d = DIRS[dir];
    return { x: player.x + d.dx * steps, y: player.y + d.dy * steps };
  }

  function lateralVec(offset) {
    const r = DIRS[(player.dir + 1) % 4];
    return { x: r.dx * offset, y: r.dy * offset };
  }

  function drawScene(context = ctx) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const DIR_TO_VIEW_REL = {
      0: { N: "F", E: "R", S: null, W: "L" },
      1: { E: "F", S: "R", W: null, N: "L" },
      2: { S: "F", W: "R", N: null, E: "L" },
      3: { W: "F", N: "R", E: null, S: "L" }
    };

    const viewMap = DIR_TO_VIEW_REL[player.dir];

    for (let depth = VIEW_DEPTH; depth >= 0; depth--) {
      const offsets = [0];
      for (let i = 1; i <= MAX_OFFSET; i++) offsets.unshift(i, -i);

      for (const offset of offsets) {
        const forward = posAfter(player.dir, depth);
        const lateral = lateralVec(offset);
        const tileX = forward.x + lateral.x;
        const tileY = forward.y + lateral.y;

        if (!mapData[tileY] || !mapData[tileY][tileX]) continue;

        const key = `${offset}_${depth}`;
        const xPos = (canvas.width - 640) / 2;
        const yPos = (canvas.height - 480) / 2;

        const tile = mapData[tileY]?.[tileX];

        // Floor and ceiling
        const gVar = getVariant('G', tileX, tileY);
        const cVar = getVariant('C', tileX, tileY);
        const groundKey = `G${gVar}_${offset}_${depth}.png`;
        const ceilingKey = `C${cVar}_${offset}_${depth}.png`;

        const ground = wallImages[groundKey];
        const ceiling = wallImages[ceilingKey];
        if (ground) context.drawImage(ground, (canvas.width - ground.width) / 2, (canvas.height - ground.height) / 2);
        if (ceiling) context.drawImage(ceiling, (canvas.width - ceiling.width) / 2, (canvas.height - ceiling.height) / 2);

        // Walls
        if (tile?.walls) {
          for (const dir of ["N", "E", "S", "W"]) {
            if (!tile.walls[dir]) continue;
            const viewRel = viewMap[dir];
            if (!viewRel) continue;
            const wallPrefix = viewRel;
            const wVar = getVariant(wallPrefix, tileX, tileY);
            const wallKey = `${wallPrefix}${wVar}_${offset}_${depth}.png`;
            const img = wallImages[wallKey];
            if (img) context.drawImage(img, (canvas.width - img.width) / 2, (canvas.height - img.height) / 2);
          }
        }

        if (tileX === npcLocation.x && tileY === npcLocation.y) {
          const npc = gobboImages[key];
          if (npc) context.drawImage(npc, xPos, yPos);
        }
      }
    }
  }


  function showStandbyEffect() {
    const overlay = document.getElementById("canvasOverlay");
    const clock = document.getElementById("standbyClock");

    if (!overlay || !clock) return;

    overlay.style.display = "block";
    clock.style.display = "block";

    setTimeout(() => {
      clock.style.transform = "scaleX(-1)";
    }, 200);

    setTimeout(() => {
      clock.style.transform = "scaleX(1)";
    }, 400);

    setTimeout(() => {
      overlay.style.display = "none";
      showMessage("Line One \n And Two \n Three?", 2000);
    }, 700);
  }

  function shakeCanvas() {
    const wrapper = document.getElementById("canvasWrapper");
    if (!wrapper) return;

    wrapper.classList.add("shake");
    setTimeout(() => {
      wrapper.classList.remove("shake");
    }, 250);
  }

  function exportCurrentMap() {
    const map = {
      width: mapWidth,
      height: mapHeight,
      start_x: player.x,
      start_y: player.y,
      start_dir: player.dir,
      tiles: mapData
    };

    const blob = new Blob([JSON.stringify(map, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exported_map.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function updatePlayerState(action) {
    if (action === "left") player.dir = (player.dir + 3) % 4;
    else if (action === "right") player.dir = (player.dir + 1) % 4;
    else if (action === "up" || action === "down") {
      const dirOffset = action === "up" ? 1 : -1;
      const { x: nx, y: ny } = posAfter(player.dir, dirOffset);
      const currTile = mapData[player.y]?.[player.x];
      const nextTile = mapData[ny]?.[nx];
      const dirNames = ["N", "E", "S", "W"];
      const dirName = dirNames[player.dir];
      const oppDir = dirNames[(player.dir + 2) % 4];

      const forwardWall = action === "up" ? dirName : oppDir;
      const backWall = action === "up" ? oppDir : dirName;

      if (!currTile?.walls?.[forwardWall] && !nextTile?.walls?.[backWall]) {
        player.x = nx;
        player.y = ny;
      } else {
        shakeCanvas();
        showMessage("You can't go that way!", 1000);
      }
    }
  }

  async function performTurn(action, animate = true) {
    if (!assetsLoaded || turnInProgress) return;
    turnInProgress = true;

    if (action === "standby") {
      showStandbyEffect();
      await waitForTurnEnd();
      turnInProgress = false;
      return;
    }

    if (!useAnimation || !animate) {
      updatePlayerState(action);
      drawScene();
      await waitForTurnEnd();
      turnInProgress = false;
      return;
    }

    await new Promise(resolve => {
      animateTransition(() => {
        updatePlayerState(action);
        resolve();
      });
    });

    await waitForTurnEnd();
    updatePlayerPositionDisplay();
    turnInProgress = false;
  }

  function animateTransition(updatePlayerStateCallback) {
    if (!assetsLoaded) {
      updatePlayerStateCallback();
      drawScene();
      return;
    }

    const oldSceneCanvas = document.createElement("canvas");
    oldSceneCanvas.width = canvas.width;
    oldSceneCanvas.height = canvas.height;
    const oldCtx = oldSceneCanvas.getContext("2d");

    const newSceneCanvas = document.createElement("canvas");
    newSceneCanvas.width = canvas.width;
    newSceneCanvas.height = canvas.height;
    const newCtx = newSceneCanvas.getContext("2d");

    drawScene(oldCtx);

    let frame = 0;
    const totalFrames = 15;

    function step() {
      if (frame === 0) {
        updatePlayerStateCallback();
        drawScene(newCtx);
      }

      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.globalAlpha = 1 - frame / totalFrames;
      ctx.drawImage(oldSceneCanvas, 0, 0);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = frame / totalFrames;
      const scale = 1 + 0.1 * (1 - frame / totalFrames);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      ctx.drawImage(newSceneCanvas, 0, 0);
      ctx.restore();

      if (frame < totalFrames) {
        requestAnimationFrame(step);
      } else {
        drawScene();
      }
    }

    step();
  }

  function toggleAnimation() {
    useAnimation = !useAnimation;
    animToggleBtn.textContent = useAnimation ? "On" : "Off";
    drawScene();
  }

  function waitForTurnEnd() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }

  function updatePlayerPositionDisplay() {
    const posBox = document.getElementById("playerPos");
    const dirs = ["North", "East", "South", "West"];
    if (posBox) {
      posBox.textContent = `Position: X${player.x} Y${player.y} Facing: ${dirs[player.dir]}`;
    }
  }

  async function loadMap(id = 4) {
  const res = await fetch(`/dev/maps/${id}`);
  const map = await res.json();
  console.log("Loaded map:", map); // <--- Add this!

  if (!map.data || !Array.isArray(map.data.tiles)) {
    console.error("Invalid map format:", map);
    showMessage("Invalid map format!", 5000);
    return;
  }
    mapWidth = map.width;
    mapHeight = map.height;
    mapData = map.data.tiles;
    player.x = map.start_x ?? 3;
    player.y = map.start_y ?? 3;
    player.dir = map.start_dir ?? 0;
    console.log("Loading map:", id);
    drawScene();
    updatePlayerPositionDisplay();

    if (map.name) {
      showMessage(`Now Entering: ${map.name}`, 3000);
    }
  }

  window.addEventListener("keydown", e => {
    if (e.repeat) return;
    if (e.key === "ArrowLeft") performTurn("left");
    else if (e.key === "ArrowRight") performTurn("right");
    else if (e.key === "ArrowUp") performTurn("up");
    else if (e.key === "ArrowDown") performTurn("down");
    else if (e.key === " ") performTurn("standby");
    else if (e.key.toLowerCase() === "t") showMessage("You found the tetris!", 3000);
  });

  canvas = document.getElementById("gameCanvas");
ctx = canvas.getContext("2d");
animToggleBtn = document.getElementById("animState");

canvas = document.getElementById("gameCanvas");
ctx = canvas.getContext("2d");
animToggleBtn = document.getElementById("animState");

preloadAssets().then(() => loadMap(4));

// Hook up buttons
const loadBtn = document.getElementById("loadMapBtn");
const input = document.getElementById("mapNumberInput");
const footerToggleX = document.getElementById("footerToggleX");


if (footerToggleX) {
  footerToggleX.addEventListener("click", () => {
    const controls = document.getElementById("controlsBottom");
    if (controls) controls.classList.toggle("hidden");
    showMessage("This should probably be a gear button or something..", 1000);
  });
}

if (loadBtn && input) {
  loadBtn.addEventListener("click", () => {
    const mapId = parseInt(input.value, 10);
    if (!isNaN(mapId) && mapId > 0) {
      loadMap(mapId);
      loadBtn.classList.remove("button-flash");
      void loadBtn.offsetWidth; // reflow trick
      loadBtn.classList.add("button-flash");
    } else {
      alert("Please enter a valid positive map number.");
    }
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") loadBtn.click();
  });
}



preloadAssets().then(() => loadMap(4));

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[m]);
  }

  function showMessage(text, duration = 3000, allowHTML = false) {
    const infoBox = document.getElementById("infoBox");
    if (!infoBox) return;

    const safeText = allowHTML ? text : escapeHTML(text).replace(/\n/g, "<br>");
    infoBox.innerHTML = safeText;

    infoBox.style.opacity = 1;
    if (showMessage._timeout) clearTimeout(showMessage._timeout);
    showMessage._timeout = setTimeout(() => {
      infoBox.innerHTML = "";
      infoBox.style.opacity = 0.5;
    }, duration);
  }


  
  window.performTurn = performTurn;
  window.toggleAnimation = toggleAnimation;
  window.loadMap = loadMap;
  window.showMessage = showMessage;
})();