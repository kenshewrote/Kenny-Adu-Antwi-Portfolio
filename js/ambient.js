/* ==========================================================================
   Retro sky life, drawn as pixel art on a canvas (no image files):
   - flocks of flapping birds
   - a little spaceship that blasts an asteroid into pixel debris
   - twinkling stars and sparkles (brighter toward the end of the journey)
   Everything shifts with the camera for parallax. Toggle pieces in
   SITE_CONFIG.retro (birds / spaceships / stars).
   ========================================================================== */
window.RetroSky = (() => {
  "use strict";
  const OPT = Object.assign({ birds: true, spaceships: true, stars: true }, (window.SITE_CONFIG && window.SITE_CONFIG.retro) || {});
  const PAL = { B: "#ffb3e6", K: "#1b2440", D: "#8296b6", d: "#5b6f8f", W: "#ffffff", O: "#f07a2a", Y: "#ffc94a", C: "#7fe0ff", G: "#9a8c84", g: "#6b5f59" };

  const ART = {
    birdUp:   ["B.......B", ".B.....B.", "..BBOBB..", "........."],
    birdDown: [".........", "..BBOBB..", ".B.....B.", "B.......B"],
    ship: [
      "......CC........",
      ".....CCWC.......",
      "..DDDDDDDDDD....",
      "DDKKKKKKKKKDDD..",
      "DDKOOKKKKKKKKDDW",
      "DDKKKKKKKKKDDD..",
      "..DDDDDDDDDD....",
      "...KK....KK....."
    ],
    rock: [
      "..GGGG..",
      ".GGgGGG.",
      "GGGGGgGG",
      "GgGGGGGG",
      "GGGGGGgG",
      "GGgGGGGG",
      ".GGGgGG.",
      "..GGGG.."
    ]
  };

  let canvas, ctx, W = 0, H = 0, px = 3, sprites = {};
  let t = 0, lastCam = null;
  let birds = [], birdTimer = 2;
  let ship = null, rock = null, bolts = [], debris = [], shipTimer = 4;
  let stars = [];

  function makeSprite(rows) {
    const c = document.createElement("canvas");
    c.width = rows[0].length * px; c.height = rows.length * px;
    const g = c.getContext("2d");
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === ".") return;
      g.fillStyle = PAL[ch];
      g.fillRect(x * px, y * px, px, px);
    }));
    return c;
  }

  function resize(w, h) {
    W = w; H = h;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    px = w < 760 ? 2 : 3;
    for (const k in ART) sprites[k] = makeSprite(ART[k]);
    stars = Array.from({ length: Math.round((w * h) / 9000) }, () => ({
      x: Math.random() * w, y: Math.random() * h * 0.55,
      s: Math.random() < 0.2 ? 2 : 1, tw: 1 + Math.random() * 3, ph: Math.random() * 6.28
    }));
  }

  const rand = (a, b) => a + Math.random() * (b - a);
  const draw = (img, x, y) => ctx.drawImage(img, Math.round(x), Math.round(y));

  function spawnBirds() {
    const fromLeft = Math.random() < 0.6;
    const n = 3 + Math.floor(Math.random() * 3);
    const y0 = rand(0.12, 0.36) * H, vx = (fromLeft ? 1 : -1) * rand(55, 85);
    for (let i = 0; i < n; i++) {
      birds.push({
        x: fromLeft ? -40 - i * 26 : W + 40 + i * 26,
        y: y0 + (i % 2 ? 14 : 0) + i * 5, vx, ph: Math.random() * 6.28
      });
    }
  }

  function spawnShip() {
    const y = rand(0.07, 0.24) * H;
    ship = { x: -sprites.ship.width - 10, y, vx: rand(140, 180), fire: 0.3 };
    rock = { x: W + 30, y: y + px * 1, vx: -rand(35, 55), alive: true };
  }

  function boom(x, y) {
    for (let i = 0; i < 22; i++) {
      const a = Math.random() * Math.PI * 2, sp = rand(40, 170);
      debris.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: rand(0.4, 0.9), c: ["O", "Y", "W", "G"][i % 4] });
    }
  }

  function update(dtMs, cam, progress) {
    if (!ctx) return;
    const s = Math.min(dtMs, 50) / 1000;
    t += s;
    const dc = lastCam == null ? 0 : cam - lastCam;
    lastCam = cam;
    ctx.clearRect(0, 0, W, H);

    // stars (fade in toward sunset)
    if (OPT.stars) {
      const a = 0.45 + 0.55 * Math.min(1, Math.max(0, progress / 0.7));   // always out, brighter at night
      if (a > 0) {
        ctx.fillStyle = "#fff";
        for (const st of stars) {
          ctx.globalAlpha = a * (0.45 + 0.55 * Math.abs(Math.sin(t * st.tw + st.ph)));
          const x = ((st.x - cam * 0.02) % W + W) % W;
          const sz = Math.max(1, Math.round(px * 0.67));
          if (st.s === 2) {   // twinkling plus-shaped sparkle
            ctx.fillRect(Math.round(x) - sz, Math.round(st.y), sz * 3, sz);
            ctx.fillRect(Math.round(x), Math.round(st.y) - sz, sz, sz * 3);
          } else ctx.fillRect(Math.round(x), Math.round(st.y), sz, sz);
        }
        ctx.globalAlpha = 1;
      }
    }

    // birds
    if (OPT.birds) {
      birdTimer -= s;
      if (birdTimer <= 0) { spawnBirds(); birdTimer = rand(7, 13); }
      birds = birds.filter((b) => {
        b.x += b.vx * s - dc * 0.35;
        const y = b.y + Math.sin(t * 2 + b.ph) * 4;
        const img = Math.floor(t * 6 + b.ph) % 2 ? sprites.birdUp : sprites.birdDown;
        ctx.globalAlpha = 0.85;
        draw(img, b.x, y);
        ctx.globalAlpha = 1;
        return b.x > -200 && b.x < W + 200;
      });
    }

    // spaceship vs asteroid
    if (OPT.spaceships) {
      if (!ship) { shipTimer -= s; if (shipTimer <= 0) spawnShip(); }
      if (rock) {
        rock.x += rock.vx * s - dc * 0.15;
        if (rock.alive) draw(sprites.rock, rock.x, rock.y);
        if (rock.x < -60) rock.alive = false;
      }
      if (ship) {
        ship.x += ship.vx * s - dc * 0.15;
        const sw = sprites.ship.width, sh = sprites.ship.height;
        // engine flame
        const fl = (2 + Math.floor(Math.random() * 3)) * px;
        ctx.fillStyle = PAL.Y; ctx.fillRect(Math.round(ship.x - fl), Math.round(ship.y + 3 * px), fl, px * 2);
        ctx.fillStyle = PAL.O; ctx.fillRect(Math.round(ship.x - fl * 0.5), Math.round(ship.y + 3 * px), fl * 0.5, px * 2);
        draw(sprites.ship, ship.x, ship.y + Math.round(Math.sin(t * 3) * 1.5));
        // fire when the asteroid is ahead and on screen
        if (rock && rock.alive && rock.x > ship.x + sw && rock.x - ship.x < W * 0.75 && rock.x < W) {
          ship.fire -= s;
          if (ship.fire <= 0) { bolts.push({ x: ship.x + sw, y: ship.y + 4 * px }); ship.fire = 0.42; }
        }
        if (ship.x > W + 80 || ship.x < -400) { ship = null; rock = null; bolts = []; shipTimer = rand(12, 20); }
      }
      bolts = bolts.filter((b) => {
        b.x += 560 * s - dc * 0.15;
        ctx.fillStyle = PAL.Y; ctx.fillRect(Math.round(b.x), Math.round(b.y), px * 4, px);
        ctx.fillStyle = PAL.W; ctx.fillRect(Math.round(b.x + px * 3), Math.round(b.y), px, px);
        if (rock && rock.alive && b.x + px * 4 >= rock.x && b.x <= rock.x + sprites.rock.width &&
            b.y >= rock.y - px && b.y <= rock.y + sprites.rock.height) {
          rock.alive = false;
          boom(rock.x + sprites.rock.width / 2, rock.y + sprites.rock.height / 2);
          return false;
        }
        return b.x < W + 20;
      });
      debris = debris.filter((p) => {
        p.life += s;
        p.x += p.vx * s - dc * 0.15; p.y += p.vy * s; p.vy += 60 * s;
        ctx.globalAlpha = 1 - p.life / p.max;
        ctx.fillStyle = PAL[p.c];
        ctx.fillRect(Math.round(p.x), Math.round(p.y), px, px);
        ctx.globalAlpha = 1;
        return p.life < p.max;
      });
    }
  }

  return {
    init(el) { canvas = el; ctx = el.getContext("2d"); },
    resize,
    update,
    clear() { if (ctx) ctx.clearRect(0, 0, W, H); }
  };
})();
