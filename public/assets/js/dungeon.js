
(() => {
  const TILESET1 = "assets/dungeon/SIMPBRICK1";
  const TILESET2 = "assets/dungeon/SIMPBRICK2";
  const base1 = TILESET1.split("/").pop();
  const BG_PATH = `${TILESET1}/${base1}_BG.png`;
  const GOBBO_PATH = "assets/objects/GOBBO";
  const VIEW_DEPTH = 4;
  const MAX_OFFSET = 4;

  const npcLocation = { x: 15, y: 32 };

  const MAP = [
    "XXXXXXXXXOXXXXXXXXXXXXXXXXXXXX",
    "XXXOOOOOXOXXXXXXXOOXXXXXXXXXXX",
    "XXXOXXXOXOXXXXXXXOOOXOOOOOOXXX",
    "XXOOOXXOXOXXXXXXXXXOOOXOOOOXXX",
    "XXOOOXXOOOXXXXXXXXXOOOXXOOOXXX",
    "XXOOOXXOXOOOOOOOXXXXOXXOOXOXXX",
    "XXOOOXXOXXXXXXXOXXOOOOXOOXOXXX",
    "XXXXXXXOOXXXXXXOXXOXXOOOOOOXXX",
    "XXXXOXXOOXXOOOXOXOOXXOOXXXXXXX",
    "XXOOOOOOOOOOXOOOOOXOOOXXXXXXXX",
    "XXXXOXXXXXXOOOXOXOOOXXXXXXXXXX",
    "XXOOOXOXXXXXOXXXXXOXXXXXXXXXXX",
    "XXOXXXOXXXXXOOOOOOOXXXXXXXXXXX",
    "XXOOOOOXXXXXXXXOXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXOXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXOXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXOOOXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXOOOOOXXXXXXXXXXXX",
    "XXXXXXXXXXXOOOOOOOOOXXXXXXXXXX",
    "XXXXXXXXXXXOOOOOOOOOXXXXXXXXXX",
    "XXXXXXXOOOOOOOOOOOOOOOOOXXXXXX",
    "XXXXXXXOOOOOOOOOOOOOOOOOXXXXXX",
    "XXOOOOOOOOOOOOOOOOOOOOOOOOOOOX",
    "XXOOOOOOOOOOOOOOOOOOOOOOOOOOOX",
    "XXOOOOOOOOOOOOOOOOOOOOOOOOOOOX",
    "XXOOOOOOOOOOOOOOOOOOOOOOOOOOOX",
    "XXOOOOOOOOOOOOOOOOOOOOOOOOOOOX",
    "XXOOOOOOOOOOOOOOOOOOOOOOOOOOOX",
    "XXOOOOOOOOOOOOOOOOOOOOOOOOOOOX",
    "XXOOOOOOOOOOOOOOOOOOOOOOOOOOOX",
    "XXOOOOOOOOOXXXXOXXXXXOOOOOOOOX",
    "XXOOOOOOOOOXXXOOOXXXXOOOOOOOOX",
    "XXOOOOOOOOOXXXOOOXXXXOOOOOOOOX",
    "XXOOOOOOOOOXXXOOOXXXXOOOOOOOOX",
    "XXOOOOOOOOOXXXXXXXXXXOOOOOOOOX",
    "XXOOOOOOOOOOOOOOOOOOOOOOOOOOOX",
    "XXOOOOOOOOOOOOOOOOOOOOOOOOOOOX",
    "XXOOOOOOOOOOOOOOOOOOOOOOOOOOOX",
    "XXOOOOOOOOOOOOOOOOOOOOOOOOOOOX",
    "XXXXXXXOOOOOOOOOOOOOOOOOXXXXXX",
    "XXXXXXXXXXXOOOOOOOOOXXXXXXXXXX",
    "XXXXXXXXXXXXXXOOOXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXOXXXXXXXXXXXXXX"
  ];

  const player = { x: 3, y: 5, dir: 0 };
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
      img.onerror = () => resolve(null);
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

  function isWalkable(x, y) {
    return MAP[y] && MAP[y][x] && MAP[y][x] !== "X";
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

      if (!MAP[tileY] || !MAP[tileY][tileX]) continue;

      const key = `${offset}_${depth}`;
      const xPos = (canvas.width - 640) / 2;
      const yPos = (canvas.height - 480) / 2;

      // 🧱 Draw wall only on unwalkable tiles
      if (!isWalkable(tileX, tileY)) {
        const img = ((tileX + tileY) % 2 === 0 ? images1[key] : images2[key]);
        if (img) context.drawImage(img, xPos, yPos);
      }

      // 👾 Draw NPC on specific coordinates (even if walkable)
      if (tileX === npcLocation.x && tileY === npcLocation.y) {
        const npc = gobboImages[key];
        if (npc) context.drawImage(npc, xPos, yPos);
      }
    }
  }
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
      if (isWalkable(nx, ny)) {
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
  window.addEventListener("keydown", e => {
    if (e.repeat) return;
    if (e.key === "ArrowLeft") performTurn("left");
    else if (e.key === "ArrowRight") performTurn("right");
    else if (e.key === "ArrowUp") performTurn("up");
    else if (e.key === " ") performTurn("standby");
  });

  preloadAssets();
  window.performTurn = performTurn;
  window.toggleAnimation = toggleAnimation;
})();
