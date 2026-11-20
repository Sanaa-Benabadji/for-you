(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shotMode = new URLSearchParams(location.search).has("shot");

  /* ---------- falling snow: one canvas shared by every page ---------- */
  const fx = (() => {
    const canvas = $("#fx");
    const ctx = canvas.getContext("2d");
    const MODES = {
      intro: { n: 0, size: [1, 3], speed: [0.3, 0.8] },
      hub: { n: 55, size: [1, 3], speed: [0.35, 0.9] },
      letter: { n: 16, size: [1, 2.6], speed: [0.3, 0.7] },
      snow: { n: 95, size: [1.2, 3.6], speed: [0.4, 1.1] },
      cake: { n: 0, size: [1, 3], speed: [0.3, 0.8] },
      final: { n: 170, size: [0.8, 3.6], speed: [0.5, 1.6] },
    };
    let W = 0, H = 0, cfg = MODES.intro, target = 0;
    const flakes = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function flake(anywhere) {
      const r = rand(cfg.size[0], cfg.size[1]);
      return {
        x: rand(0, W),
        y: anywhere ? rand(-20, H) : rand(-H * 0.5, -10),
        r,
        vy: rand(cfg.speed[0], cfg.speed[1]) * (0.55 + r / 4),
        ph: rand(0, 6.28),
        sp: rand(0.006, 0.018),
        drift: rand(-0.25, 0.25),
        a: rand(0.45, 0.95),
      };
    }
    function mode(name) {
      cfg = MODES[name] || MODES.intro;
      target = reduceMotion ? Math.min(cfg.n, 25) : cfg.n;
      if (flakes.length === 0) for (let i = 0; i < target; i++) flakes.push(flake(true));
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      while (flakes.length < target) flakes.push(flake(false));
      for (let i = flakes.length - 1; i >= 0; i--) {
        const f = flakes[i];
        f.ph += f.sp;
        f.x += Math.sin(f.ph) * 0.45 + f.drift;
        f.y += f.vy;
        if (f.y > H + 12 || f.x < -24 || f.x > W + 24) {
          if (flakes.length > target) {
            flakes.splice(i, 1);
          } else {
            Object.assign(f, flake(false), { y: rand(-40, -8) });
          }
          continue;
        }
        if (f.r > 3) {
          ctx.fillStyle = `rgba(255,255,255,${f.a * 0.12})`;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r * 1.9, 0, 6.283);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(255,255,255,${f.a})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, 6.283);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(frame);
    return { mode };
  })();

  /* ---------- little decorations ---------- */
  function fillStars(box, n, top1 = 70) {
    if (!box || box.childElementCount) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "twinkle";
      s.style.cssText = `left:${rand(2, 98)}%;top:${rand(2, top1)}%;--z:${rand(6, 15).toFixed(1)}px;--t:${rand(2.4, 5).toFixed(2)}s;--dl:${rand(-5, 0).toFixed(2)}s`;
      box.appendChild(s);
    }
  }
  function fillRisers(box, n, make) {
    if (!box || box.childElementCount) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      make(s, i);
      box.appendChild(s);
    }
  }
  fillRisers($("#intro-hearts"), 16, (s) => {
    s.textContent = "♥";
    const c = pick(["#b84a62", "#efa8b6", "#3f4b68", "#d98a9c"]);
    s.style.cssText = `--x:${rand(2, 96)}%;--z:${rand(12, 26).toFixed(0)}px;--c:${c};--t:${rand(11, 19).toFixed(1)}s;--dl:${rand(-18, 0).toFixed(1)}s;--dx:${rand(-60, 60).toFixed(0)}px;--rot:${rand(-40, 40).toFixed(0)}deg;--o:${rand(0.3, 0.6).toFixed(2)}`;
  });
  fillRisers($("#letter-bokeh"), 14, (s) => {
    s.style.cssText = `--x:${rand(0, 96)}%;--z:${rand(30, 90).toFixed(0)}px;--t:${rand(14, 24).toFixed(1)}s;--dl:${rand(-24, 0).toFixed(1)}s;--dx:${rand(-80, 80).toFixed(0)}px;--rot:0deg;--o:${rand(0.35, 0.7).toFixed(2)}`;
  });
  fillRisers($("#cake-sparks"), 22, (s) => {
    s.style.cssText = `--x:${rand(0, 98)}%;--z:${rand(3, 6).toFixed(1)}px;--t:${rand(9, 16).toFixed(1)}s;--dl:${rand(-16, 0).toFixed(1)}s;--dx:${rand(-50, 50).toFixed(0)}px;--rot:0deg;--o:${rand(0.5, 0.9).toFixed(2)}`;
  });
  fillStars($("#hub-stars"), 24, 92);
  fillStars($("#snow-stars"), 22, 55);
  fillStars($("#final-stars"), 34, 80);

  /* ---------- particle bursts (snowballs, confetti) ---------- */
  const burstLayer = $("#bursts");
  function burst(x, y, colors, n, confetti) {
    if (reduceMotion) n = Math.round(n / 2);
    for (let i = 0; i < n; i++) {
      const p = document.createElement("span");
      p.className = "particle" + (confetti ? " is-confetti" : "");
      const z = confetti ? rand(7, 11) : rand(4, 11);
      p.style.cssText = `left:${x}px;top:${y}px;--z:${z.toFixed(1)}px;background:${pick(colors)}`;
      burstLayer.appendChild(p);
      const ang = rand(0, Math.PI * 2);
      const dist = confetti ? rand(70, 190) : rand(50, 140);
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist + (confetti ? rand(60, 140) : 0);
      const anim = p.animate(
        [
          { transform: "translate(-50%,-50%) scale(1) rotate(0deg)", opacity: 1 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${confetti ? 1 : 0.2}) rotate(${rand(-540, 540).toFixed(0)}deg)`, opacity: 0 },
        ],
        { duration: confetti ? rand(1200, 1900) : rand(700, 1200), easing: "cubic-bezier(.15,.7,.3,1)" }
      );
      anim.onfinish = () => p.remove();
    }
  }

  /* ---------- screens ---------- */
  const screens = {};
  $$(".screen").forEach((s) => (screens[s.dataset.screen] = s));
  const onEnter = {};
  const onLeave = {};
  let current = null;

  function go(name) {
    if (!screens[name] || current === name) return;
    if (current) {
      screens[current].classList.remove("is-active");
      if (onLeave[current]) onLeave[current]();
    }
    current = name;
    screens[name].scrollTop = 0;
    screens[name].classList.add("is-active");
    fx.mode(name);
    if (onEnter[name]) onEnter[name]();
    music.screenChanged(name);
  }
  $$("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));

  /* ---------- 1. opening windows ---------- */
  const wins = { hello: $("#w-hello"), oops: $("#w-oops"), sure: $("#w-sure") };
  function openWin(w, under) {
    if (under) under.classList.add("is-behind");
    w.hidden = false;
    void w.offsetWidth;
    w.classList.add("is-open");
  }
  function leaveIntro() {
    Object.values(wins).forEach((w) => w.classList.add("is-closing"));
    setTimeout(() => go("hub"), 420);
  }
  const act = (w, name) => w.querySelector(`[data-act="${name}"]`);
  act(wins.hello, "yes").addEventListener("click", leaveIntro);
  act(wins.hello, "no").addEventListener("click", () => openWin(wins.oops, wins.hello));
  act(wins.oops, "start").addEventListener("click", leaveIntro);
  act(wins.oops, "ignore").addEventListener("click", () => openWin(wins.sure, wins.oops));
  const okBtn = act(wins.sure, "ok");
  const noBtn = act(wins.sure, "no2");
  noBtn.addEventListener("click", () => {
    noBtn.classList.add("is-struck");
    noBtn.disabled = true;
    noBtn.setAttribute("aria-disabled", "true");
    okBtn.classList.add("is-irresistible");
  });
  okBtn.addEventListener("click", leaveIntro);

  /* ---------- 2. the surprise page ---------- */
  const visited = new Set();
  onEnter.hub = () => {
    $$(".card").forEach((c) => c.classList.toggle("is-seen", visited.has(c.dataset.go)));
    $("#count").textContent = `${visited.size}/3`;
    $("#hub-end").hidden = visited.size < 3;
  };

  /* ---------- letter ---------- */
  const envelope = $("#envelope");
  const envWrap = $("#env-wrap");
  const letter = $("#letter");
  envelope.addEventListener("click", () => {
    if (envelope.classList.contains("is-open")) return;
    envelope.classList.add("is-open");
    setTimeout(() => envWrap.classList.add("is-gone"), 1250);
    setTimeout(() => {
      envWrap.hidden = true;
      letter.hidden = false;
      void letter.offsetWidth;
      letter.classList.add("is-open");
    }, 1750);
  });
  onEnter.letter = () => visited.add("letter");

  /* ---------- let it snow ---------- */
  const PHRASES = [
    "You are my safe place",
    "Your smile is my favorite view",
    "You deserve all the happiness in the world",
    "I'm so proud of you, always",
    "You are loved more than you know",
    "You make hard days feel lighter",
    "The world is softer with you in it",
    "You are enough, just as you are",
    "Your heart is the kindest I know",
    "Keep going, you're doing amazing",
    "You're my favorite person, twin",
    "Be gentle with yourself today",
    "Every snowflake here is a hug from me",
    "You light up every room you walk in",
    "I believe in you, always",
    "Love yourself the way I love you",
  ];
  let phraseBag = [];
  const nextPhrase = () => {
    if (!phraseBag.length) phraseBag = shuffle(PHRASES.slice());
    return phraseBag.pop();
  };
  const GLOWS = ["rgba(255,182,206,.85)", "rgba(167,227,255,.85)", "rgba(214,196,255,.85)", "rgba(255,226,150,.85)", "rgba(174,240,214,.85)"];
  const field = $("#field");
  const snowman = $("#snowman");
  const snowHead = $("#snow-head");
  const phraseEl = $("#phrase");

  function freeSpot(size) {
    const W = window.innerWidth, H = window.innerHeight;
    const sm = snowman.getBoundingClientRect();
    const top = snowHead.getBoundingClientRect().bottom + size * 0.6 + 6;
    // keep the snowballs up in the sky, not down on the ground
    const bottom = Math.min(H * 0.8, sm.top + sm.height * 0.3);
    const others = $$(".ball:not(.is-popping)", field).map((b) => {
      const r = b.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    });
    const pad = size / 2 + 8;
    for (let k = 0; k < 60; k++) {
      const x = rand(pad, W - pad);
      const y = rand(top, Math.max(top + 1, bottom));
      const inSnowman = x > sm.left - pad && x < sm.right + pad && y > sm.top - pad;
      if (inSnowman) continue;
      if (others.every(([ox, oy]) => Math.hypot(ox - x, oy - y) > size * 1.35)) return [x, y];
    }
    return [rand(pad, W - pad), rand(top, top + H * 0.2)];
  }

  function spawnBall(delay) {
    const base = Math.max(52, Math.min(78, Math.min(window.innerWidth, window.innerHeight) * 0.13));
    const size = Math.round(base * rand(0.88, 1.1));
    const [x, y] = freeSpot(size);
    const glow = pick(GLOWS);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ball";
    b.setAttribute("aria-label", "snowball");
    b.style.cssText = `left:${((x / window.innerWidth) * 100).toFixed(2)}%;top:${((y / window.innerHeight) * 100).toFixed(2)}%;--s:${size}px;--glow:${glow};--d:${delay}ms;--bob:${rand(3, 5).toFixed(2)}s`;
    b.innerHTML = "<span></span>";
    b.addEventListener("click", () => popBall(b, glow), { once: true });
    field.appendChild(b);
  }

  function popBall(b, glow) {
    const r = b.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const solid = glow.replace(/,\s*[\d.]+\)$/, ",1)");
    burst(cx, cy, ["#ffffff", "#ffffff", solid, solid, "#ffe9a8", "#ffc6d6", "#c9ecff"], 28, false);
    b.classList.add("is-popping");
    setTimeout(() => b.remove(), 320);
    showPhrase(cx, cy);
    snowmanCtl.react(cx, cy);
    setTimeout(() => spawnBall(0), 1500);
  }

  function showPhrase(cx, cy) {
    phraseEl.textContent = nextPhrase();
    const W = window.innerWidth;
    const half = Math.min(175, W * 0.43);
    phraseEl.style.left = Math.max(half + 10, Math.min(W - half - 10, cx)) + "px";
    phraseEl.style.top = Math.max(160, cy - 8) + "px";
    phraseEl.classList.remove("is-show");
    void phraseEl.offsetWidth;
    phraseEl.classList.add("is-show");
  }

  /* the snowman: tap (tickle / nose boop / hat hop / star), drag to lean, hold for a hug.
     His eyes follow the finger and the landscape layers shift a little for depth. */
  const snowmanCtl = (() => {
    const root = snowman;
    const body = $("#sm-body");
    const front = $(".sm-front", root);
    const shadow = $("#sm-shadow");
    const eyes = $("#sm-eyes");
    const bubble = $("#sm-bubble");
    const stage = $("#snow-screen");
    const TICKLE = [
      "hehe, that tickles!",
      "hi Nadir! ❄",
      "you found me!",
      "brrr… but you make it warm",
      "I was built with love, you know",
      "again! again!",
      "careful, I might melt 🥺",
      "you're my favorite human",
    ];
    const HAT = ["my cat-ear hat! 🐾", "hey, my hat!", "do I look cute?"];
    const HUGS = ["a big warm hug, from me to you 🤍", "this hug is from someone who loves you", "one more hug… 🤍"];
    let tickleBag = [];
    let hugIdx = 0;
    let taps = 0;
    // springs
    let ang = 0, angV = 0, sq = 0, sqV = 0, hop = 0, hopV = 0, lean = 0, dragging = false;
    // eyes + depth
    const look = { x: 0, y: 0 }, lookT = { x: 0, y: 0 };
    const par = { x: 0, y: 0 }, parT = { x: 0, y: 0 };
    let pointer = null, lastMove = -1e9, lastTilt = -1e9, idleLookAt = 0, lookAt = null;
    let running = false, raf = 0, t0 = 0, bubbleT = 0, greeted = false;
    const timers = {};

    function flash(cls, ms) {
      root.classList.remove(cls);
      void root.offsetWidth;
      root.classList.add(cls);
      clearTimeout(timers[cls]);
      timers[cls] = setTimeout(() => root.classList.remove(cls), ms);
    }
    function say(text, ms = 2600) {
      bubble.textContent = text;
      bubble.classList.add("is-on");
      clearTimeout(bubbleT);
      bubbleT = setTimeout(() => bubble.classList.remove("is-on"), ms);
    }
    function nextTickle() {
      if (!tickleBag.length) tickleBag = shuffle(TICKLE.slice());
      return tickleBag.pop();
    }
    function toSvg(cx, cy) {
      const r = front.getBoundingClientRect();
      return { x: ((cx - r.left) / r.width) * 300, y: ((cy - r.top) / r.height) * 400 };
    }
    function hearts(x, y) {
      for (let i = 0; i < 7; i++) {
        const h = document.createElement("span");
        h.className = "heart-p";
        h.textContent = "♥";
        h.style.cssText = `left:${(x + rand(-40, 40)).toFixed(0)}px;top:${(y + rand(-20, 20)).toFixed(0)}px;color:${pick(["#efa8b6", "#b84a62", "#ffd6e0", "#ffffff"])};font-size:${rand(14, 26).toFixed(0)}px`;
        burstLayer.appendChild(h);
        const a = h.animate(
          [
            { transform: "translate(-50%,-50%) scale(.4)", opacity: 0 },
            { transform: `translate(calc(-50% + ${rand(-20, 20).toFixed(0)}px), calc(-50% - 30px)) scale(1)`, opacity: 1, offset: 0.2 },
            { transform: `translate(calc(-50% + ${rand(-60, 60).toFixed(0)}px), calc(-50% - ${rand(120, 200).toFixed(0)}px)) scale(.8)`, opacity: 0 },
          ],
          { duration: rand(1400, 2000), easing: "ease-out" }
        );
        a.onfinish = () => h.remove();
      }
    }

    function tap(cx, cy) {
      taps++;
      const p = toSvg(cx, cy);
      if (Math.hypot(p.x - 36, p.y - 160) < 32) {
        flash("is-starshine", 900);
        burst(cx, cy, ["#ffe9a8", "#ffd36b", "#ffffff"], 18, false);
        say("a little star, just for you ⭐");
      } else if (p.y < 104 && p.x > 95 && p.x < 205) {
        flash("is-hathop", 800);
        hopV = -3;
        say(pick(HAT), 2000);
      } else if (p.x > 146 && p.x < 204 && p.y > 127 && p.y < 153) {
        flash("is-boop", 600);
        angV += 2.5;
        say("boop! ❄", 1600);
      } else {
        flash("is-giggle", 1400);
        sqV -= 0.045;
        angV += rand(-3, 3);
        burst(cx, cy, ["#ffffff", "#eef3ff", "#dfe8ff"], 12, false);
        say(taps === 4 ? "psst… hold me for a hug 🤍" : nextTickle());
      }
    }
    function hug() {
      flash("is-hugging", 2400);
      const r = front.getBoundingClientRect();
      for (let k = 0; k < 3; k++) {
        setTimeout(() => {
          sqV -= 0.03;
          hearts(r.left + r.width / 2, r.top + r.height * 0.5);
        }, k * 380);
      }
      say(HUGS[hugIdx++ % HUGS.length], 3000);
    }

    // tap / drag / hold
    let down = null, holdT = 0;
    root.addEventListener("pointerdown", (e) => {
      if (!e.target.closest(".hit")) return;
      e.preventDefault();
      down = { x: e.clientX, y: e.clientY, moved: false, hugged: false, id: e.pointerId };
      dragging = true;
      root.classList.add("is-dragging");
      clearTimeout(holdT);
      holdT = setTimeout(() => {
        if (down && !down.moved) {
          down.hugged = true;
          hug();
        }
      }, 600);
    });
    window.addEventListener("pointermove", (e) => {
      pointer = { x: e.clientX, y: e.clientY };
      lastMove = performance.now();
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x;
      if (!down.moved && Math.hypot(dx, e.clientY - down.y) > 8) {
        down.moved = true;
        clearTimeout(holdT);
      }
      if (down.moved) lean = Math.max(-18, Math.min(18, dx * 0.14));
    });
    const release = (e) => {
      if (!down || (e && e.pointerId !== down.id)) return;
      clearTimeout(holdT);
      const d = down;
      down = null;
      dragging = false;
      lean = 0;
      root.classList.remove("is-dragging");
      if (d.hugged) return;
      if (d.moved) {
        if (Math.abs(ang) > 9) say("wheee!", 1300);
        return;
      }
      tap(d.x, d.y);
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma == null || e.beta == null) return;
      parT.x = Math.max(-1, Math.min(1, e.gamma / 25));
      parT.y = Math.max(-1, Math.min(1, (e.beta - 40) / 25));
      lastTilt = performance.now();
    });

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const t = (now - t0) / 1000;
      // body: lean / wobble / squash / hop
      angV += ((dragging ? lean : 0) - ang) * 0.12;
      angV *= 0.84;
      ang += angV;
      sqV += -sq * 0.2;
      sqV *= 0.8;
      sq += sqV;
      hopV += 0.8;
      hop += hopV;
      if (hop > 0) {
        if (hopV > 3) sqV -= hopV * 0.004;
        hop = 0;
        hopV = 0;
      }
      const breath = reduceMotion ? 0 : Math.sin(t * 1.7) * 0.006;
      body.style.transform = `translateY(${hop.toFixed(2)}px) rotate(${ang.toFixed(2)}deg) scale(${(1 - sq * 0.55).toFixed(4)}, ${(1 + sq + breath).toFixed(4)})`;
      shadow.style.transform = `scale(${(1 + hop / 160).toFixed(3)})`;
      shadow.style.opacity = Math.max(0.3, 1 + hop / 120).toFixed(3);
      // eyes: the finger, something that just popped, or a little look around
      const r = front.getBoundingClientRect();
      const ex = r.left + r.width * 0.5;
      const ey = r.top + r.height * (123 / 400);
      const target = lookAt && now < lookAt.until ? lookAt : pointer && now - lastMove < 4000 ? pointer : null;
      if (target) {
        const dx = target.x - ex, dy = target.y - ey;
        const dist = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, dist / 120);
        lookT.x = (dx / dist) * 4.5 * k;
        lookT.y = (dy / dist) * 3.5 * k;
      } else if (now > idleLookAt) {
        idleLookAt = now + rand(1800, 3600);
        lookT.x = rand(-4, 4);
        lookT.y = rand(-2, 3);
      }
      look.x += (lookT.x - look.x) * 0.15;
      look.y += (lookT.y - look.y) * 0.15;
      eyes.setAttribute("transform", `translate(${look.x.toFixed(2)} ${look.y.toFixed(2)})`);
      // depth
      if (pointer && now - lastMove < 6000) {
        parT.x = (pointer.x / window.innerWidth - 0.5) * 2;
        parT.y = (pointer.y / window.innerHeight - 0.5) * 2;
      } else if (now - lastTilt > 1000) {
        parT.x = reduceMotion ? 0 : Math.sin(t * 0.25) * 0.35;
        parT.y = reduceMotion ? 0 : Math.sin(t * 0.18) * 0.2;
      }
      par.x += (parT.x - par.x) * 0.05;
      par.y += (parT.y - par.y) * 0.05;
      stage.style.setProperty("--px", par.x.toFixed(3));
      stage.style.setProperty("--py", par.y.toFixed(3));
    }

    // &sm=giggle|hugging|hathop (screenshot checks only)
    const demo = shotMode ? new URLSearchParams(location.search).get("sm") : null;
    return {
      enter() {
        if (demo) {
          root.classList.add("is-" + demo);
          say(demo === "hugging" ? HUGS[0] : "hehe, that tickles!", 1e9);
          greeted = true;
        }
        if (!running) {
          running = true;
          t0 = performance.now();
          raf = requestAnimationFrame(frame);
        }
        if (!greeted) {
          greeted = true;
          setTimeout(() => say("psst… touch me ⛄", 3200), 1100);
        }
      },
      leave() {
        running = false;
        cancelAnimationFrame(raf);
      },
      react(cx, cy) {
        lookAt = { x: cx, y: cy, until: performance.now() + 1600 };
        flash("is-waving", 1700);
        hopV = -6;
      },
    };
  })();

  fillRisers($("#snow-glints"), 18, (s) => {
    s.style.cssText = `left:${rand(2, 98)}%;top:${rand(10, 92)}%;--z:${rand(4, 9).toFixed(1)}px;--t:${rand(2, 4.5).toFixed(2)}s;--dl:${rand(-4, 0).toFixed(2)}s`;
  });

  onEnter.snow = () => {
    visited.add("snow");
    snowmanCtl.enter();
    if (!field.childElementCount) {
      const n = window.innerWidth < 600 ? 5 : 7;
      for (let i = 0; i < n; i++) spawnBall(300 + i * 140);
    }
  };
  onLeave.snow = () => snowmanCtl.leave();

  /* ---------- cake ---------- */
  const cake = $("#cake");
  const cakeHint = $("#cake-hint");
  let blown = false;
  cake.addEventListener("click", () => {
    if (blown) return;
    blown = true;
    cake.classList.add("is-out");
    const r = cake.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * 0.22, ["#f3d27a", "#ffe9a8", "#efa8b6", "#b84a62", "#fbf6ec", "#a6b7e6"], 50, true);
    cakeHint.textContent = "your wish is on its way ♡";
    setTimeout(() => {
      cake.classList.remove("is-out");
      cakeHint.textContent = "tap the cake to blow the candles";
      blown = false;
    }, 4500);
  });
  onEnter.cake = () => visited.add("cake");

  /* ---------- music (YouTube sound under the cover picture, lyrics instead of the video) ---------- */
  const music = (() => {
    const VID = "yFUq4iYq7js";
    // the song's words: [second the line starts, "line"]. Use null for the second to spread
    // the lines evenly over the clip; open the site with ?s=cake&sync=1 to measure exact seconds.
    const LYRICS = [
      [null, "Pick me up, walk me home"],
      [null, "Man, it feels like God threw me a bone"],
      [null, "Sticky sweet, tangerine"],
      [null, "Would you sit and keep me company?"],
      [null, "In the dark, I'm not scared"],
      [null, "I just reach and you're right there"],
      [null, "Shooting stars, racing cars"],
      [null, "Everything I own just feels like ours"],
    ];
    const player = $("#player");
    const cover = $("#cover");
    const coverBtn = $("#cover-btn");
    const fill = $("#bar-fill");
    const tCur = $("#t-cur");
    const tDur = $("#t-dur");
    const mini = $("#mini");
    const miniBtn = $("#mini-btn");
    let yt = null, ready = false, wantPlay = false, playing = false, started = false;
    let timer = 0, fallback = 0, loading = false, screen = "";

    function load() {
      if (loading) return;
      loading = true;
      window.onYouTubeIframeAPIReady = create;
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      s.onerror = () => cover.classList.add("is-direct");
      document.head.appendChild(s);
    }
    function create() {
      const vars = { playsinline: 1, controls: 0, rel: 0, loop: 1, playlist: VID, iv_load_policy: 3, fs: 0, disablekb: 1 };
      if (/^https?:$/.test(location.protocol)) vars.origin = location.origin;
      yt = new YT.Player("yt", {
        videoId: VID,
        width: "100%",
        height: "100%",
        playerVars: vars,
        events: {
          onReady: () => {
            ready = true;
            if (wantPlay) yt.playVideo();
            tick();
          },
          onStateChange: (e) => {
            const on = e.data === YT.PlayerState.PLAYING;
            if (on) {
              started = true;
              cover.classList.remove("is-direct");
              clearTimeout(fallback);
            }
            setPlaying(on);
          },
          onError: () => cover.classList.add("is-direct"),
        },
      });
    }
    function fmt(s) {
      s = Math.max(0, Math.floor(s || 0));
      return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    }
    function tick() {
      if (!yt || !ready || typeof yt.getDuration !== "function") return;
      const d = yt.getDuration() || 0;
      const c = yt.getCurrentTime() || 0;
      fill.style.width = d ? Math.min(100, (c / d) * 100) + "%" : "0%";
      tCur.textContent = fmt(c);
      tDur.textContent = fmt(d);
      if (d) setLine(lineAt(c, d));
    }

    // ----- lyrics -----
    const lyBox = $("#lyrics");
    const lyTrack = $("#lyrics-track");
    // &demo=a|b|c (screenshot checks only): fake lines shown as if the song were playing
    const demo = shotMode ? new URLSearchParams(location.search).get("demo") : null;
    const lines = demo ? demo.split("|").map((t) => [null, t]) : LYRICS.length ? LYRICS : [[null, "♪ ♪ ♪"]];
    let lyEls = [];
    let lyNow = -1;
    function renderLyrics() {
      lyTrack.textContent = "";
      lyEls = lines.map(([, text]) => {
        const p = document.createElement("p");
        p.className = "ly";
        p.textContent = text;
        lyTrack.appendChild(p);
        return p;
      });
      setLine(0, true);
    }
    function lineAt(c, d) {
      let idx = 0;
      lines.forEach(([t], i) => {
        const start = t != null ? t : (i * d) / lines.length;
        if (c >= start) idx = i;
      });
      return idx;
    }
    function setLine(i, force) {
      if ((!force && i === lyNow) || !lyEls[i]) return;
      lyNow = i;
      lyEls.forEach((el, k) => {
        el.classList.toggle("is-now", k === i);
        el.classList.toggle("is-past", k < i);
      });
      const el = lyEls[i];
      lyTrack.style.transform = `translateY(${lyBox.clientHeight / 2 - (el.offsetTop + el.offsetHeight / 2)}px)`;
    }
    renderLyrics();
    if (demo) {
      player.classList.add("is-playing");
      setTimeout(() => setLine(1, true), 50);
    }
    window.addEventListener("resize", () => setLine(Math.max(lyNow, 0), true));
    if (document.fonts) document.fonts.ready.then(() => setLine(Math.max(lyNow, 0), true));

    // ?sync=1: press SPACE each time a line starts; the seconds appear at the top to copy
    if (new URLSearchParams(location.search).has("sync")) {
      const out = document.createElement("pre");
      out.className = "sync-out";
      out.textContent = "play the song, then press SPACE each time a new line starts";
      document.body.appendChild(out);
      const marks = [];
      document.addEventListener("keydown", (e) => {
        if (e.code !== "Space" || !yt || !ready) return;
        e.preventDefault();
        if (document.activeElement) document.activeElement.blur();
        marks.push(+yt.getCurrentTime().toFixed(1));
        out.textContent = marks.join(", ");
      });
    }
    function setPlaying(on) {
      playing = on;
      player.classList.toggle("is-playing", on);
      mini.classList.toggle("is-playing", on);
      coverBtn.setAttribute("aria-label", on ? "Pause" : "Play");
      miniBtn.setAttribute("aria-label", on ? "Pause" : "Play");
      clearInterval(timer);
      if (on) timer = setInterval(tick, 250);
      tick();
      updateMini();
    }
    function toggle() {
      if (playing) {
        if (yt) yt.pauseVideo();
        return;
      }
      wantPlay = true;
      if (ready) yt.playVideo();
      else load();
      // some phones only start YouTube from a tap on the video itself
      clearTimeout(fallback);
      fallback = setTimeout(() => {
        if (!playing) cover.classList.add("is-direct");
      }, 3500);
    }
    function updateMini() {
      mini.classList.toggle("is-on", started && screen !== "cake");
    }
    coverBtn.addEventListener("click", toggle);
    miniBtn.addEventListener("click", toggle);
    return {
      screenChanged(name) {
        screen = name;
        if (name === "cake") load();
        updateMini();
      },
    };
  })();

  /* ---------- last page ---------- */
  onEnter.final = () => {
    const lines = $$(".reveal", screens.final);
    lines.forEach((l) => l.classList.remove("is-shown"));
    if (shotMode) return lines.forEach((l) => l.classList.add("is-shown"));
    lines.forEach((l, i) => setTimeout(() => l.classList.add("is-shown"), 500 + i * 1100));
  };

  /* ---------- start ---------- */
  // ?s=<page>&all=1&w=oops|sure|struck&open=1|2 jump straight to a page; &shot=1 skips the
  // entrance animations (only used for checking the design with screenshots)
  const params = new URLSearchParams(location.search);
  if (shotMode) {
    const st = document.createElement("style");
    st.textContent = ".screen,.win,.letter,.letter p,.reveal,.env-wrap,.env-paper,.env-flap,.seal,.card .seen{transition:none!important}.card,.hub-end,.ball{animation:none!important}";
    document.head.appendChild(st);
  }
  if (params.has("all")) ["letter", "snow", "cake"].forEach((n) => visited.add(n));
  const startAt = params.get("s");
  go(startAt && screens[startAt] ? startAt : "intro");
  if (current === "intro") {
    const w = params.get("w");
    const openFirst = () => {
      openWin(wins.hello);
      if (w === "oops" || w === "sure" || w === "struck") openWin(wins.oops, wins.hello);
      if (w === "sure" || w === "struck") openWin(wins.sure, wins.oops);
      if (w === "struck") noBtn.click();
    };
    if (shotMode) openFirst();
    else setTimeout(openFirst, 250);
  }
  if (current === "letter" && params.get("open") === "1") envelope.click();
  if (current === "letter" && params.get("open") === "2") {
    envWrap.hidden = true;
    letter.hidden = false;
    letter.classList.add("is-open");
  }
})();
