(() => {
  const TILESET1 = "assets/dungeon/SIMPBRICK1";
  const TILESET2 = "assets/dungeon/SIMPBRICK2";
  const base1 = TILESET1.split("/").pop();
  const BG_PATH = `${TILESET1}/${base1}_BG.png`;
  const GOBBO_PATH = "assets/objects/GOBBO";
  const VIEW_DEPTH = 4;
  const MAX_OFFSET = 4;

  const npcLocation = { x: 15, y: 32 };

 let mapData = [];
  let mapWidth = 0;
let mapHeight = 0;

  const player = { x: 3, y: 3, dir: 0 };
  const DIRS = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }
  ];

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  let animToggleBtn = document.getElementById("animState");
  let turnInProgress = false;
  let useAnimation = true;
  let images1 = {}, images2 = {}, gobboImages = {}, bgImage = null;
  let assetsLoaded = false;

  function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // image failed to load
    img.src = src;
  });
}



  async function preloadAssets() {
    bgImage = await loadImage(BG_PATH);
    const promises = [];

    for (let depth = 0; depth <= VIEW_DEPTH; depth++) {
      for (let offset = -MAX_OFFSET; offset <= MAX_OFFSET; offset++) {
        const base1 = TILESET1.split("/").pop();
        const base2 = TILESET2.split("/").pop();
        const key = `${offset}_${depth}`;
        const file1 = `${base1}_${offset}_${depth}.png`;
        const file2 = `${base2}_${offset}_${depth}.png`;
        const npcFile = `GOBBO_${offset}_${depth}.png`;

        promises.push(loadImage(`${TILESET1}/${file1}`).then(img => { if (img) images1[key] = img; }));
        promises.push(loadImage(`${TILESET2}/${file2}`).then(img => { if (img) images2[key] = img; }));
        promises.push(loadImage(`${GOBBO_PATH}/${npcFile}`).then(img => { if (img) gobboImages[key] = img; }));
      }
    }

    await Promise.all(promises);
    assetsLoaded = true;
    performTurn('standby', false);
    updatePlayerPositionDisplay();
  }

  function isWalkable(x, y, fromDir = null) {
  if (!mapData[y] || !mapData[y][x]) return false;
  if (!fromDir) return true; // used for rendering range

  const tile = mapData[y][x];
  const oppDir = ["N", "E", "S", "W"][(["N", "E", "S", "W"].indexOf(fromDir) + 2) % 4];
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
  if (bgImage) context.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

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

//draw that shit on the right tiles/walls yay
      const tile = mapData[tileY]?.[tileX];
if (tile?.walls) {
  for (const dir of ["N", "E", "S", "W"]) {
    if (!tile.walls[dir]) continue;

    // Determine which tile the wall belongs to based on direction
    const dx = dir === "E" ? 1 : dir === "W" ? -1 : 0;
    const dy = dir === "S" ? 1 : dir === "N" ? -1 : 0;

    const wallX = tileX + dx;
    const wallY = tileY + dy;

    // Check visibility: is this wall visible in current frame?
    const offsetX = wallX - player.x;
    const offsetY = wallY - player.y;

    // Project this to view-space
    let viewOffset = 0, viewDepth = 0;
    if (player.dir === 0) { // North
  viewOffset = offsetX;
  viewDepth = -offsetY;
} else if (player.dir === 1) { // East
  viewOffset = offsetY;       // <- FIXED
  viewDepth = offsetX;
} else if (player.dir === 2) { // South
  viewOffset = -offsetX;
  viewDepth = offsetY;
} else if (player.dir === 3) { // West
  viewOffset = -offsetY;      // <- FIXED
  viewDepth = -offsetX;
}

    const wallKey = `${viewOffset}_${viewDepth}`;
    const img = ((wallX + wallY) % 2 === 0 ? images1[wallKey] : images2[wallKey]);
    if (img) {
      const drawX = (canvas.width - img.width) / 2;
      const drawY = (canvas.height - img.height) / 2;
      context.drawImage(img, drawX, drawY);
    }
  }
}


      // 👾 Draw NPC on specific coordinates (even if walkable)
      if (tileX === npcLocation.x && tileY === npcLocation.y) {
        const npc = gobboImages[key];
        if (npc) context.drawImage(npc, xPos, yPos);
      }
    }
  }
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

  function updatePlayerState(action) {
    if (action === "left") player.dir = (player.dir + 3) % 4;
    else if (action === "right") player.dir = (player.dir + 1) % 4;
    else if (action === "up") {
  const { x: nx, y: ny } = posAfter(player.dir, 1);
  const currTile = mapData[player.y]?.[player.x];
  const nextTile = mapData[ny]?.[nx];
  const dirNames = ["N", "E", "S", "W"];
  const dirName = dirNames[player.dir];
  const oppDir = dirNames[(player.dir + 2) % 4];

  if (
    currTile && !currTile.walls[dirName] &&
    nextTile && !nextTile.walls[oppDir]
  ) {
    player.x = nx;
    player.y = ny;
  }
}
  }

  async function performTurn(action, animate = true) {
    if (!assetsLoaded || turnInProgress) return;
    turnInProgress = true;

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
  mapWidth = map.width;
  mapHeight = map.height;
  mapData = map.data.tiles;
  player.x = 3;
  player.y = 3;
  player.dir = 0;
  drawScene();
  updatePlayerPositionDisplay();
}

  window.addEventListener("keydown", e => {
    if (e.repeat) return;
    if (e.key === "ArrowLeft") performTurn("left");
    else if (e.key === "ArrowRight") performTurn("right");
    else if (e.key === "ArrowUp") performTurn("up");
    else if (e.key === " ") performTurn("standby");
    else if (e.key.toLowerCase() === "p") exportCurrentMap(); // P = Save
  });


  preloadAssets().then(() => {
  loadMap(4); // Load map ID 1
});
  window.performTurn = performTurn;
  window.toggleAnimation = toggleAnimation;
})();
