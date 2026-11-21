/* ==========================================================================
   Retro sound: chiptune effects made with the Web Audio API (no audio files).
   - runStart(): plays SITE_CONFIG.sound.runSound once when Kenny starts running
   - step():   footstep blip on Kenny's footfalls (only when no runSound is set)
   - chime():  checkpoint reached
   - fanfare(): finish line
   Optional: set SITE_CONFIG.sound.runLoop to an audio file path (e.g.
   "assets/sound/run.mp3") to loop your own running sound instead of the blips.

   Browsers only allow sound after the visitor clicks, taps, or presses a key,
   so audio starts on the first interaction (scrolling alone doesn't count).
   ========================================================================== */
window.RetroSound = (() => {
  "use strict";
  const CFG = (window.SITE_CONFIG && window.SITE_CONFIG.sound) || {};
  const KEY = "kenny-portfolio-sound-v2";   // on by default; only a visitor's own "off" click is remembered
  let wanted = CFG.enabled !== false;
  try { const v = localStorage.getItem(KEY); if (v !== null) wanted = v === "1"; } catch (_) { /* storage blocked */ }

  let ctx = null, master = null, noiseBuf = null, runAudio = null;
  let runBuf = null, runSrc = null;   // decoded one-shot run sound (CFG.runSound)
  const listeners = [];
  const notify = () => listeners.forEach((fn) => fn());

  function ensure() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = CFG.volume == null ? 0.35 : CFG.volume;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      ctx.onstatechange = notify;
      if (runFile) {
        runFile.then((b) => new Promise((ok, no) => ctx.decodeAudioData(b.slice(0), ok, no)))
          .then((buf) => { runBuf = buf; flushRun(); }, () => {});
      }
    }
    if (ctx.state === "suspended") ctx.resume().then(notify, () => {});
    notify();
    return true;
  }
  // Download the run sound right away (no audio engine needed for that), decode it once unlocked.
  const runFile = CFG.runSound ? fetch(CFG.runSound).then((r) => r.arrayBuffer()).catch(() => null) : null;
  // Sounds can be scheduled as soon as the visitor has interacted: Chrome may keep the engine
  // "suspended" for a moment while it starts up, and anything scheduled meanwhile plays when it does.
  let gestured = false;
  const hasGesture = () => gestured || !!(navigator.userActivation && navigator.userActivation.hasBeenActive);
  const ready = () => !!(wanted && ctx && ctx.state !== "closed" && (ctx.state === "running" || hasGesture()));
  // A run that started before the sound file was decoded plays as soon as it is.
  let pendingRun = 0;
  function flushRun() {
    if (pendingRun && performance.now() - pendingRun < 2500 && ready() && runBuf) { pendingRun = 0; api.runStart(); }
  }

  function tone(freq, start, dur, vol = 0.2, type = "square", slideTo = null) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol, start + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(master);
    o.start(start); o.stop(start + dur + 0.02);
  }
  function noise(start, dur, freq, vol) {
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf;
    f.type = "bandpass"; f.frequency.value = freq; f.Q.value = 1.2;
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(f).connect(g).connect(master);
    src.start(start); src.stop(start + dur + 0.02);
  }

  const api = {
    get enabled() { return wanted; },
    get active() { return !!(wanted && ctx && ctx.state === "running"); },
    onChange(fn) { listeners.push(fn); },

    toggle() {
      // If this very click is what unlocked audio, treat it as "turn sound on".
      if (wanted && justUnlocked) { justUnlocked = false; api.chime(); notify(); return; }
      wanted = !wanted;
      try { localStorage.setItem(KEY, wanted ? "1" : "0"); } catch (_) { /* ignore */ }
      if (wanted) { ensure(); api.chime(); } else {
        api.runStop();
        if (runSrc) { try { runSrc.stop(); } catch (_) { /* already ended */ } runSrc = null; }
      }
      notify();
    },

    step(alt) {
      if (!ready() || runAudio || CFG.runSound) return;
      const t = ctx.currentTime;
      noise(t, 0.05, alt ? 1700 : 1250, 0.32);
      tone(alt ? 150 : 118, t, 0.05, 0.12, "square", 60);
    },
    runStart() {
      if (!wanted) return;
      if (CFG.runSound && (!ready() || !runBuf)) { pendingRun = performance.now(); return; }
      if (!ready()) return;
      pendingRun = 0;
      if (runBuf) {
        if (runSrc) { try { runSrc.stop(); } catch (_) { /* already ended */ } }
        const src = ctx.createBufferSource(), g = ctx.createGain();
        g.gain.value = CFG.runVolume == null ? 0.7 : CFG.runVolume;
        src.buffer = runBuf;
        src.connect(g).connect(master);
        src.onended = () => { if (runSrc === src) runSrc = null; };
        src.start();
        runSrc = src;
        return;
      }
      if (!CFG.runLoop) return;
      if (!runAudio) { runAudio = new Audio(CFG.runLoop); runAudio.loop = true; runAudio.volume = 0.6; }
      runAudio.play().catch(() => {});
    },
    runStop() {
      if (runAudio) { runAudio.pause(); runAudio.currentTime = 0; }
    },
    chime() {
      if (!ready()) return;
      const t = ctx.currentTime;
      tone(784, t, 0.09, 0.16);
      tone(1175, t + 0.09, 0.16, 0.16);
    },
    fanfare() {
      if (!ready()) return;
      const t = ctx.currentTime;
      [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3], [784, 0.42], [1047, 0.52]].forEach(([f, d]) => tone(f, t + d, 0.12, 0.16));
      tone(1319, t + 0.64, 0.4, 0.14, "triangle");
    }
  };

  // Unlock audio on the first real interaction.
  let justUnlocked = false;
  const unlock = () => {
    gestured = true;
    if (!wanted || (ctx && ctx.state === "running")) return;
    ensure();
    flushRun();
    justUnlocked = true;
    setTimeout(() => { justUnlocked = false; }, 700);
  };
  ["pointerdown", "mousedown", "keydown", "touchstart", "touchend", "click"].forEach((ev) => addEventListener(ev, unlock, { passive: true, capture: true }));


  return api;
})();
