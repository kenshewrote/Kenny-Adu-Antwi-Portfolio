/* ==========================================================================
   Checkpoint Journey engine
   - renders every section from js/config.js
   - vertical scroll snapping picks the active checkpoint
   - the guide runs between checkpoints over parallax layers (rAF driven)
   ========================================================================== */
(() => {
  "use strict";

  const CFG = window.SITE_CONFIG;
  const NAME = CFG.characterName;
  const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = reduceMQ.matches;

  /* ------------------------------------------------------------ helpers */
  const $ = (sel, root = document) => root.querySelector(sel);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const isPH = (s) => typeof s === "string" && /^\[[^\]]*\]$/.test(s.trim());
  const withName = (s) => (s || "").replace(/\{name\}/g, NAME);

  // Build an element. Children may be strings, nodes, arrays, or null (skipped).
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === "class") n.className = v;
        else if (k === "html") n.innerHTML = v;
        else if (k === "style") n.style.cssText = v;
        else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? "" : v);
      }
    }
    append(n, kids);
    return n;
  }
  function append(n, kids) {
    for (const k of kids.flat(Infinity)) {
      if (k == null || k === false) continue;
      n.append(k instanceof Node ? k : document.createTextNode(String(k)));
    }
  }
  // Text that might be a "[PLACEHOLDER]": outlined when shown, removed when hidden.
  function txt(s) {
    if (s == null || s === "") return null;
    if (isPH(s)) return CFG.showPlaceholders ? el("span", { class: "ph" }, s) : null;
    return s;
  }
  const keep = (s) => !isPH(s) || CFG.showPlaceholders;

  /* ------------------------------------------------------------- icons */
  const ICON = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.91c.58.1.79-.25.79-.56v-1.96c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    resume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    trophy: '<svg viewBox="0 0 24 24"><path fill="#1b2440" d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V17h3v3H8v-3h3v-2.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3zm-1 4v1a2 2 0 0 0 1.4 1.9A6 6 0 0 1 7 8V7zm11 0v1a6 6 0 0 1-.4 1.9A2 2 0 0 0 18 8V7z"/></svg>',
    medal: '<svg viewBox="0 0 24 24"><path fill="#1b2440" d="M6 2h4l2 5 2-5h4l-3.6 7.4A6.5 6.5 0 1 1 9.6 9.4zm6 9a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 1.6 1.2 2.4 2.6.3-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.3z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path fill="#1b2440" d="m12 2 3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8l-6.3 3.6 1.5-7.1L1.8 9.4 9 8.6z"/></svg>'
  };
  const icon = (name, cls) => el("span", { class: cls, "aria-hidden": "true", html: ICON[name] || ICON.globe });

  function linkBtn(label, href, opts = {}) {
    const external = /^https?:/.test(href);
    return el("a", {
      class: "btn " + (opts.cls || ""),
      href,
      target: external ? "_blank" : null,
      rel: external ? "noopener noreferrer" : null
    }, opts.icon ? icon(opts.icon) : null, label, external && !opts.icon ? icon("ext") : null);
  }

  // Tabs inside a panel. Returns { bar, panes }.
  let tabUid = 0;
  function makeTabs(defs, bodyEl) {
    const id = "tabs" + ++tabUid;
    const bar = el("div", { class: "tabs", role: "tablist" });
    const panes = [];
    const btns = defs.map((d, i) => {
      const b = el("button", {
        class: "tab", role: "tab", type: "button",
        id: `${id}-t${i}`, "aria-controls": `${id}-p${i}`,
        "aria-selected": i === 0 ? "true" : "false", tabindex: i === 0 ? "0" : "-1"
      }, d.label);
      panes.push(el("div", { class: "tab-panel", role: "tabpanel", id: `${id}-p${i}`, "aria-labelledby": `${id}-t${i}`, hidden: i !== 0 }, d.content));
      return b;
    });
    const select = (i, focus) => {
      btns.forEach((b, j) => {
        b.setAttribute("aria-selected", String(i === j));
        b.tabIndex = i === j ? 0 : -1;
        panes[j].hidden = i !== j;
      });
      bodyEl.scrollTop = 0;
      if (focus) btns[i].focus();
    };
    btns.forEach((b, i) => {
      b.addEventListener("click", () => select(i));
      b.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          e.stopPropagation();
          select((i + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length, true);
        }
      });
    });
    append(bar, btns);
    return { bar, panes };
  }

  /* ------------------------------------------------------ section renders */
  function renderAbout(c) {
    const bio = [
      el("div", { class: "profile" },
        c.photo ? el("figure", { class: "profile-photo" },
          el("img", { "data-src": c.photo, alt: `Portrait of ${c.fullName}`, decoding: "async" })) : null,
        el("div", { class: "profile-text" },
          el("h3", { class: "profile-name" }, c.fullName),
          el("p", { class: "about-lead" }, c.tagline))),
      keep(c.bio) ? el("p", null, txt(c.bio)) : null,
      el("dl", { class: "stats" }, c.stats.map((s) => el("div", { class: "stat" }, el("dt", null, s.label), el("dd", null, txt(s.value))))),
      el("h3", { class: "mini-title" }, "Relevant coursework"),
      el("ul", { class: "tags" }, c.coursework.map((t) => el("li", { class: "tag" }, t)))
    ];
    const skills = c.skills.map((g) => el("div", { class: "skill-group" },
      el("h3", { class: "mini-title" }, g.group),
      el("ul", { class: "tags" }, g.items.map((t) => el("li", { class: "tag" }, t)))));
    const tabs = [{ label: "Bio", content: bio }, { label: "Experience", content: timeline(c.experience) }];
    if (c.leadership && c.leadership.length) {
      tabs.push({ label: "Leadership", content: [
        timeline(c.leadership),
        c.affiliations && c.affiliations.length ? [
          el("h3", { class: "mini-title" }, "Other affiliations"),
          el("ul", { class: "tags" }, c.affiliations.map((t) => el("li", { class: "tag" }, t)))] : null
      ] });
    }
    tabs.push({ label: "Skills", content: skills });
    return { title: c.title, tabs };
  }

  function techTags(list) {
    const items = (list || []).filter(keep);
    return items.length ? el("ul", { class: "tags" }, items.map((t) => el("li", { class: "tag" }, txt(t)))) : null;
  }

  /* ----------------------------------------------- details pop-up (modal) */
  const modal = $("#modal");
  function openModal(item, chipText) {
    const links = (item.links || []).filter((l) => l.href && keep(l.href));
    const content = el("div", { class: "modal-card" },
      item.image ? el("figure", { class: "modal-media" }, el("img", { src: item.image, alt: `${item.name} screenshot` })) : null,
      el("div", { class: "modal-body" },
        el("div", { class: "modal-chips" },
          chipText ? el("span", { class: "chip" }, chipText) : null,
          item.date ? el("span", { class: "when" }, item.date) : null),
        el("h2", { id: "modal-title" }, txt(item.name)),
        item.meta ? el("p", { class: "where" }, item.meta) : null,
        item.details && item.details.length
          ? el("ul", { class: "modal-list" }, item.details.map((d) => el("li", null, txt(d))))
          : el("p", null, txt(item.summary)),
        techTags(item.tech),
        el("div", { class: "modal-actions" },
          links.map((l, i) => isPH(l.href) ? el("span", { class: "ph" }, l.href)
            : linkBtn(l.label || "Open", l.href, { cls: i ? "alt" : "" })),
          el("button", { class: "btn alt", type: "button", onclick: () => modal.close() }, "Close ✕"))));
    modal.replaceChildren(content);
    modal.showModal();
    modal.scrollTop = 0;
  }
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });   // click on blurred backdrop

  // A level card: the whole card opens the pop-up.
  function levelCard(item, i, numLabel, hueBase) {
    const thumb = item.image
      ? el("img", { "data-src": item.image, alt: "", decoding: "async" })   // loaded when Kenny heads here
      : el("div", { class: "level-art", style: `filter:hue-rotate(${hueBase + i * 45}deg)` }, numLabel);
    return el("article", { class: "level" },
      el("div", { class: "level-thumb" }, thumb, el("span", { class: "level-num" }, numLabel)),
      el("div", { class: "level-info" },
        el("h3", null, txt(item.name)),
        item.date || item.meta ? el("span", { class: "meta" }, [item.date, item.meta].filter(Boolean).join(" · ")) : null,
        el("p", null, txt(item.summary)),
        techTags(item.tech),
        el("button", {
          class: "level-more", type: "button", "aria-haspopup": "dialog",
          "aria-label": `Read more about ${item.name}`,
          onclick: () => openModal(item, numLabel)
        }, "Read more ▶")));
  }

  function renderProjects(c) {
    const levels = el("div", { class: "levels" }, c.levels.map((p, i) => levelCard(p, i, `LEVEL ${i + 1}`, 0)));
    const tabs = [{ label: `Levels (${c.levels.length})`, content: levels }];
    if (c.bonus && c.bonus.length) {
      tabs.push({ label: c.bonusTitle, content: [
        c.bonusIntro ? el("p", null, c.bonusIntro) : null,
        el("div", { class: "levels" }, c.bonus.map((b, i) => levelCard(b, i, `BONUS ${i + 1}`, 180)))
      ] });
    }
    return { title: c.title, tabs };
  }

  function renderLinks(c) {
    const tiles = c.items.filter((l) => keep(l.label)).map((l) => {
      const inner = [icon(l.icon, "link-icon"), el("span", null, el("strong", null, txt(l.label)), el("small", null, txt(l.sub)))];
      if (isPH(l.href)) return el("div", { class: "link-tile" }, inner);
      const ext = /^https?:/.test(l.href) || /\.pdf$/i.test(l.href);
      return el("a", {
        class: "link-tile", href: l.href,
        target: ext && !l.sameTab ? "_blank" : null,
        rel: ext && !l.sameTab ? "noopener noreferrer" : null
      }, inner);
    });
    return { title: c.title, body: el("div", { class: "link-grid" }, tiles) };
  }

  function renderAwards(c) {
    const items = c.items.filter((a) => keep(a.name));
    return {
      title: c.title,
      body: el("ul", { class: "badges" }, items.map((a, i) =>
        el("li", { class: "badge" + (a.image ? " has-photo" : ""), style: `--i:${i}` },
          a.image ? el("img", { class: "badge-photo", "data-src": a.image, alt: "" }) : null,
          icon(a.icon, "badge-icon"),
          el("h3", null, txt(a.name)),
          el("p", null, txt(a.detail)),
          a.when ? el("span", { class: "when" }, txt(a.when)) : null,
          a.image ? el("button", {
            class: "level-more", type: "button", "aria-haspopup": "dialog", "aria-label": `View photo: ${a.name}`,
            onclick: () => openModal({ name: a.name, date: a.when, summary: a.detail, image: a.image }, "AWARD")
          }, "View photo ▶") : null)))
    };
  }

  function renderGoals(c) {
    const STATUS = { done: "COMPLETE", active: "IN PROGRESS", todo: "NEW QUEST" };
    const quests = c.quests.filter((q) => keep(q.name));
    return {
      title: c.title,
      body: el("ul", { class: "quests" }, quests.map((q) => {
        const indeterminate = q.progress == null;
        const pct = indeterminate ? 0 : clamp(Number(q.progress) || 0, 0, 100);
        return el("li", { class: `quest ${q.status}` },
          el("span", { class: "quest-box", "aria-hidden": "true" }, q.status === "done" ? "✓" : null),
          el("div", null, el("span", { class: "quest-name" }, txt(q.name)), el("span", { class: "quest-status" }, STATUS[q.status] || "")),
          q.note ? el("div", { class: "quest-note" }, txt(q.note)) : null,
          el("div", {
            class: "bar" + (indeterminate ? " indeterminate" : ""), role: "progressbar",
            "aria-label": "Progress", "aria-valuemin": "0", "aria-valuemax": "100",
            "aria-valuenow": indeterminate ? null : String(pct), "aria-valuetext": indeterminate ? "In progress" : `${pct}%`
          }, el("span", { style: `--p:${pct}%` })));
      }))
    };
  }

  // Tiny pixel-art motifs for the drawn anime covers (# light, o gold, k dark).
  const MOTIFS = {
    spiral: ["....####....", "..##....##..", ".#..####..#.", ".#.#....#.#.", "#.#..##..#.#", "#.#.#..#.#.#",
             "#.#.#.##.#.#", "#.#..#...#.#", ".#.#....#.#.", ".#..####..#.", "..##....##..", "....####...."],
    blade:  ["..........##", ".........###", "........###.", ".......###..", "......###...", ".....###....",
             "....###.....", "..o###......", "..oo#.......", ".kk.oo......", "kk...o......", "k..........."],
    spade:  [".....##.....", "....####....", "...######...", "..########..", ".##########.", "############",
             "############", ".###.##.###.", ".....##.....", "....####....", "...######...", "............"],
    flame:  [".....#......", "....##......", "....###..#..", "...####.##..", "..########..", "..###oo####.",
             ".###oooo###.", ".##oooooo##.", ".##oo##oo##.", "..#o####o#..", "...######...", "............"],
    chess:  [".....##.....", "....####....", ".....##.....", "....####....", "...######...", "....####....",
             "....####....", "....####....", "...######...", "..########..", "..########..", "............"]
  };
  function pixelArt(rows) {
    const fill = { "#": "#fff4dc", o: "#ffd23f", k: "#141a2e" };
    let r = "";
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (fill[ch]) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${fill[ch]}"/>`; }));
    return "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" shape-rendering="crispEdges">${r}</svg>`);
  }

  // Cover cards (anime, games): poster image if set, otherwise a drawn pixel cover.
  function coverList(items, kind) {
    const list = items.filter((x) => keep(x.name));
    return el("ol", { class: `anime-list ${kind}` }, list.map((x, i) => {
      const col = x.colors || ["#4a5a8a", "#1a2244"];
      return el("li", { class: "anime", style: `--i:${i}` },
        el("div", { class: "anime-cover", style: `background:linear-gradient(160deg, ${col[0]}, ${col[1]})` },
          x.image
            ? el("img", { class: "anime-poster", "data-src": x.image, alt: `${x.name} cover`, decoding: "async" })
            : el("img", { class: "anime-motif", src: pixelArt(MOTIFS[x.art] || MOTIFS.spiral), alt: "" }),
          el("span", { class: "anime-rank" }, `#${i + 1}`)),
        el("span", { class: "anime-name" }, txt(x.name)));
    }));
  }

  const timeline = (list) => el("ol", { class: "timeline" }, list.map((x) =>
    el("li", null,
      x.duration ? el("span", { class: "when" }, x.duration) : null,
      el("h3", null, x.position),
      el("p", { class: "where" }, [x.company, x.location].filter(Boolean).join(" · ")),
      x.description && x.description.length ? el("ul", null, x.description.map((d) => el("li", null, d))) : null
    )));

  function renderBeyond(c) {
    const s = c.soccer;
    const tabs = [{ label: "Soccer", content: el("div", { class: "fan-soccer" },
      s.image ? el("figure", { class: "fan-photo" },
        el("img", { "data-src": s.image, alt: s.imageAlt || "", decoding: "async" }),
        s.credit ? el("figcaption", null, el("a", { href: s.credit.href, target: "_blank", rel: "noopener noreferrer" }, s.credit.text)) : null) : null,
      el("div", { class: "fan-team" },
        el("p", { class: "fan-intro" }, txt(s.intro)),
        el("span", { class: "chip" }, txt(s.teamNote)),
        el("h3", null, txt(s.team)),
        s.caption ? el("p", { class: "fan-caption" }, s.caption) : null)) }];
    if (c.anime) tabs.push({ label: "Anime", content: [el("p", { class: "fan-intro" }, txt(c.anime.intro)), coverList(c.anime.list, "anime-set")] });
    if (c.games) tabs.push({ label: "Games", content: [el("p", { class: "fan-intro" }, txt(c.games.intro)), coverList(c.games.list, "game-set")] });
    if (c.art) {
      const pieces = c.art.pieces.filter((p) => p.image || keep(p.title));
      tabs.push({ label: "Art", content: [
        el("p", { class: "fan-intro" }, txt(c.art.intro)),
        el("ul", { class: "art-grid" }, pieces.map((p) => el("li", { class: "art-piece" },
          p.image
            ? el("button", { class: "art-open", type: "button", "aria-haspopup": "dialog", "aria-label": `View ${p.title || "artwork"}`,
                onclick: () => openModal({ name: p.title || "Artwork", summary: p.note || "", image: p.image }, "ART") },
                el("img", { "data-src": p.image, alt: p.title || "Artwork", decoding: "async" }))
            : el("div", { class: "art-empty", "aria-hidden": "true" }, "🎨"),
          p.title ? el("span", { class: "anime-name" }, txt(p.title)) : null)))
      ] });
    }
    if (c.editing) tabs.push({ label: "Editing", content: [
      el("p", { class: "fan-intro" }, txt(c.editing.intro)),
      el("ul", { class: "tags" }, (c.editing.tags || []).map((t) => el("li", { class: "tag" }, t)))] });
    if (c.clubs) tabs.push({ label: "Clubs", content: [el("p", { class: "fan-intro" }, txt(c.clubs.intro)), timeline(c.clubs.list)] });
    return { title: c.title, tabs };
  }

  function renderFinish(c) {
    return {
      title: c.title,
      body: [
        el("p", { class: "finish-text" }, c.text),
        el("div", { class: "finish-actions" },
          linkBtn("Email me", `mailto:${c.email}`, { icon: "mail" }),
          linkBtn("GitHub", c.github, { icon: "github", cls: "alt" }),
          linkBtn("LinkedIn", c.linkedin, { icon: "linkedin", cls: "alt" }),
          el("a", { class: "btn alt", href: c.resume, target: "_blank", rel: "noopener" }, icon("resume"), "Resume")),
        el("p", { class: "finish-mail" }, "or write to ", el("a", { href: `mailto:${c.email}` }, c.email)),
        c.quote ? el("blockquote", { class: "quote" }, c.quote, c.quoteSource ? el("cite", null, c.quoteSource) : null) : null,
        el("p", { class: "foot" }, `© ${new Date().getFullYear()} ${CFG.ownerName} · `,
          el("button", { class: "btn small alt", type: "button", onclick: () => goTo(0) }, "↺ Play again"))
      ]
    };
  }

  /* --------------------------------------------------------------- stops */
  const STOPS = [
    { id: "start",    kind: "start",  label: "Start",            speech: CFG.speech.start },
    { id: "about",    kind: "cp", n: 1, short: "About", label: CFG.about.title,    speech: CFG.speech.about,    render: () => renderAbout(CFG.about) },
    { id: "projects", kind: "cp", n: 2, label: CFG.projects.title, speech: CFG.speech.projects, render: () => renderProjects(CFG.projects) },
    { id: "awards",   kind: "cp", n: 3, label: "Awards",           speech: CFG.speech.awards,   render: () => renderAwards(CFG.awards) },
    { id: "goals",    kind: "cp", n: 4, label: CFG.goals.title,    speech: CFG.speech.goals,    render: () => renderGoals(CFG.goals) },
    { id: "beyond",   kind: "cp", n: 5, short: "Beyond", label: CFG.beyond.title,   speech: CFG.speech.beyond,   render: () => renderBeyond(CFG.beyond) },
    { id: "finish",   kind: "finish", label: "Finish",           speech: CFG.speech.finish,   render: () => renderFinish(CFG.finish) }
  ];
  const LAST = STOPS.length - 1;
  // Old site anchors keep working.
  const HASH_ALIAS = { home: "start", hobbies: "beyond", "beyond-code": "beyond", experience: "about", research: "projects", contact: "finish", links: "finish" };

  const journey = $("#journey");
  const track = $("#track");
  const dotsList = $("#dots");
  const dotsFill = $("#dots-fill");

  function buildStops() {
    STOPS.forEach((s, i) => {
      const sec = el("section", { class: `stop ${s.id}`, id: s.id, "aria-label": s.label });
      const inner = el("div", { class: "stop-inner" });
      if (s.kind === "start") {
        const st = CFG.start;
        const words = st.title.trim().split(/\s+/);
        const last = words.length > 1 ? words.pop() : null;
        inner.append(el("div", { class: "title-card" },
          el("span", { class: "kicker" }, "PORTFOLIO"),
          el("h1", null, words.join(" "), last ? el("span", null, last) : null),
          el("p", { class: "sub" }, st.subtitle)));
        sec.append(inner, el("button", { class: "scroll-hint", type: "button", onclick: () => goTo(1) }, st.hint));
      } else {
        const r = s.render();
        const chip = s.kind === "finish" ? "FINISH" : `CHECKPOINT ${s.n}`;
        const body = el("div", { class: "panel-body" });
        const panel = el("article", { class: "panel", "aria-labelledby": `${s.id}-h` },
          el("header", { class: "panel-head" }, el("span", { class: "chip" }, chip), el("h2", { id: `${s.id}-h` }, r.title),
            el("button", { class: "panel-close", type: "button", "aria-label": `Close ${r.title} and keep running`, title: "Close (Esc)", onclick: () => closePanel() },
              el("span", { "aria-hidden": "true" }, "✕"), el("span", { class: "panel-close-txt" }, "Close"))));
        if (r.tabs) {
          const { bar, panes } = makeTabs(r.tabs, body);
          append(body, panes);
          panel.append(bar);
        } else {
          append(body, [r.body]);
        }
        panel.append(body);
        s.body = body;
        inner.append(panel);
        sec.append(inner, el("button", { class: "btn alt panel-reopen", type: "button", onclick: () => openPanel() }, `▲ Open ${s.short || r.title}`));
      }
      journey.append(sec);
      s.el = sec;

      // marker on the ground
      let m;
      if (s.kind === "cp") {
        m = el("div", { class: "marker" },
          el("div", { class: "marker-pole" }), el("div", { class: "marker-base" }),
          el("div", { class: "marker-flag" }), el("div", { class: "marker-orb" }),
          el("div", { class: "marker-plate" }, String(s.n)));
      } else {
        m = el("div", { class: `marker gate ${s.kind}` },
          el("div", { class: "marker-pole" }), el("div", { class: "marker-pole right" }),
          el("div", { class: "marker-base" }), el("div", { class: "marker-base right" }),
          el("div", { class: "gate-banner" }, el("span", null, s.kind === "start" ? "START" : "FINISH")));
      }
      track.append(m);
      s.marker = m;

      // HUD dot
      const dot = el("button", {
        class: "dot" + (s.kind !== "cp" ? " end" : ""), type: "button",
        "aria-label": s.kind === "cp" ? `Checkpoint ${s.n}: ${s.label}` : s.label,
        onclick: () => goTo(i)
      });
      // short name shown under every dot (the button's aria-label already names it for screen readers)
      const name = el("span", { class: "dot-name", "aria-hidden": "true", onclick: () => goTo(i) }, s.short || s.label);
      dotsList.append(el("li", null, dot, name));
      s.dotName = name;
      s.dot = dot;
    });
  }

  /* -------------------------------------------------- parallax scenery */
  const svgURL = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  // Synthwave pixel scenery: cloud streaks, neon city, faceted mountains, striped sun, grid floor (all tile seamlessly).
  const SVG_OPEN = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">`;
  // Seeded random so the skyline is the same on every visit.
  function seeded(seed) {
    return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // Periodic triangle wave in [-1, 1] (peaks at the middle of each period), so ridges tile seamlessly.
  const tri = (w, k, x) => { const f = (((k * x) / w) % 1 + 1) % 1; return 1 - 4 * Math.abs(f - 0.5); };
  function stepped(w, step, quant, fn) {
    const pts = [];
    for (let x = 0; x < w; x += step) { const y = Math.round(fn(x) / quant) * quant; pts.push([x, y], [x + step, y]); }
    return pts;
  }
  const ridgeFill = (pts, h) => `M0 ${h}` + pts.map(([x, y]) => `L${x} ${y}`).join("") + `L${pts[pts.length - 1][0]} ${h}Z`;
  const ridgeLine = (pts) => "M" + pts.map(([x, y]) => `${x} ${y}`).join("L");
  // Diamond lattice used on mountains and pyramids.
  const diamonds = (id, size, color, op) =>
    `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">` +
    `<path d="M0 0L${size} ${size}M${size} 0L0 ${size}" stroke="${color}" stroke-opacity="${op}" stroke-width="1.5" shape-rendering="auto"/></pattern>`;

  function paintScenery() {
    // --- glowing cloud streaks (synthwave bands that drift across the sun)
    const streaks = [
      [40, 40, 380, 6, "#ff5fa8", 0.45], [170, 54, 220, 4, "#ffb36b", 0.35], [520, 22, 300, 5, "#b04ad8", 0.5],
      [640, 34, 160, 3, "#ff5fa8", 0.4], [880, 70, 420, 7, "#ff5fa8", 0.35], [1000, 86, 240, 4, "#ffb36b", 0.3],
      [260, 130, 340, 5, "#b04ad8", 0.45], [1180, 140, 200, 4, "#ff5fa8", 0.4], [720, 170, 260, 4, "#ffb36b", 0.25]
    ];
    $("#layer-clouds").style.backgroundImage = svgURL(SVG_OPEN(1400, 260) +
      streaks.map(([x, y, w, h, c, o]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" opacity="${o}"/>` +
        (x + w > 1400 ? `<rect x="${x - 1400}" y="${y}" width="${w}" height="${h}" fill="${c}" opacity="${o}"/>` : "")).join("") + `</svg>`);

    // --- neon city skyline (far layer)
    const fW = 1200, fH = 360, rnd = seeded(7);
    let city = SVG_OPEN(fW, fH) + `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1f78"/><stop offset="1" stop-color="#1a0c3f"/></linearGradient></defs>`;
    const LIT = ["#ff6ec7", "#7fe0ff", "#ffd36b", "#ffffff"];
    for (let x = 8; x < fW - 40;) {
      const bw = 40 + Math.round(rnd() * 5) * 12, bh = 90 + Math.round(rnd() * 20) * 12;
      if (x + bw > fW - 8) break;
      const top = fH - bh;
      city += `<rect x="${x}" y="${top}" width="${bw}" height="${bh}" fill="url(#bg)"/><rect x="${x}" y="${top}" width="${bw}" height="3" fill="#7a4fd0"/>`;
      if (rnd() < 0.35) { const ax = x + Math.round(bw / 2) - 1; city += `<rect x="${ax}" y="${top - 26}" width="3" height="26" fill="#3a1f78"/><rect x="${ax - 1}" y="${top - 30}" width="5" height="5" fill="#ff3cac"/>`; }
      for (let wy = top + 12; wy < fH - 14; wy += 14)
        for (let wx = x + 7; wx < x + bw - 8; wx += 12)
          if (rnd() < 0.3) city += `<rect x="${wx}" y="${wy}" width="5" height="6" fill="${LIT[Math.floor(rnd() * LIT.length)]}" opacity="${(0.45 + rnd() * 0.5).toFixed(2)}"/>`;
      x += bw + 6 + Math.round(rnd() * 3) * 10;
    }
    $("#layer-far").style.backgroundImage = svgURL(city + `</svg>`);

    // --- faceted pixel mountains + glass pyramids (near layer)
    const nW = 960, nH = 220;
    const back = stepped(nW, 16, 8, (x) => 92 - 52 * tri(nW, 3, x) - 18 * tri(nW, 7, x + 40));
    const front = stepped(nW, 16, 8, (x) => 168 - 22 * tri(nW, 4, x + 120));
    const pyramid = (cx, base, half, hgt) => {
      const pts = [];
      for (let s = 0; s <= half; s += 8) pts.push([cx - half + s, base - Math.round((hgt * s) / half / 8) * 8]);
      for (let s = half - 8; s >= 0; s -= 8) pts.push([cx + half - s, base - Math.round((hgt * s) / half / 8) * 8]);
      const d = `M${cx - half} ${base}` + pts.map(([x, y]) => `H${x}V${y}`).join("") + `H${cx + half}V${base}Z`;
      return `<path d="${d}" fill="url(#pg)"/><path d="${d}" fill="url(#pd)"/>`;
    };
    $("#layer-near").style.backgroundImage = svgURL(SVG_OPEN(nW, nH) +
      `<defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a4bd6"/><stop offset="1" stop-color="#2a1366"/></linearGradient>` +
      `<linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c1f86"/><stop offset="1" stop-color="#1b0b45"/></linearGradient>` +
      `<linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fe3dc"/><stop offset="1" stop-color="#2167a8"/></linearGradient>` +
      diamonds("md", 32, "#9fe9ff", 0.28) + diamonds("pd", 20, "#ffffff", 0.45) + diamonds("fd", 32, "#ff6ec7", 0.22) + `</defs>` +
      `<path d="${ridgeFill(back, nH)}" fill="url(#mg)"/><path d="${ridgeFill(back, nH)}" fill="url(#md)"/>` +
      `<path d="${ridgeLine(back)}" fill="none" stroke="#9fe9ff" stroke-opacity=".7" stroke-width="2"/>` +
      `<path d="${ridgeFill(front, nH)}" fill="url(#fg)"/><path d="${ridgeFill(front, nH)}" fill="url(#fd)"/>` +
      `<path d="${ridgeLine(front)}" fill="none" stroke="#ff6ec7" stroke-opacity=".75" stroke-width="2"/>` +
      pyramid(150, nH, 64, 72) + pyramid(230, nH, 40, 44) + pyramid(640, nH, 72, 84) + `</svg>`);

    // --- striped synthwave sun: 32x32 pixel disc, yellow to pink, with slices cut from the lower half
    const sunCols = ["#fff27a", "#ffd24a", "#ffa63d", "#ff7a4a", "#ff4f7d", "#ff3c9c"];
    const gaps = new Set([18, 21, 22, 25, 26, 28, 29, 30]);
    let sun = SVG_OPEN(320, 320);
    for (let r = 0; r < 32; r++) {
      if (gaps.has(r)) continue;
      const col = sunCols[Math.min(sunCols.length - 1, Math.floor((r / 32) * sunCols.length))];
      for (let c = 0; c < 32; c++) if (Math.hypot(c - 15.5, r - 15.5) <= 15.9) sun += `<rect x="${c * 10}" y="${r * 10}" width="10.2" height="10" fill="${col}"/>`;
    }
    lyr.sun.style.backgroundImage = svgURL(sun + `</svg>`);
    lyr.ground.style.backgroundImage = "none";
  }

  // --- neon perspective grid floor, drawn on a canvas so lines fan out toward the viewer
  const floor = $("#floor");
  const flctx = floor.getContext("2d");
  function drawFloor(cam) {
    const w = L.w, h = L.groundH;
    if (!w || !h) return;
    flctx.clearRect(0, 0, w, h);
    const g = flctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#2a0b55"); g.addColorStop(1, "#0b0420");
    flctx.fillStyle = g; flctx.fillRect(0, 0, w, h);

    flctx.save();
    flctx.strokeStyle = "#ff3cac"; flctx.lineWidth = 1.5;
    flctx.shadowColor = "#ff3cac"; flctx.shadowBlur = 8;
    flctx.beginPath();
    const top = 10, N = 7;
    for (let i = 1; i <= N; i++) {               // horizontal lines, closer together near the horizon
      const y = Math.round(top + (h - top) * Math.pow(i / N, 1.7)) + 0.5;
      flctx.moveTo(0, y); flctx.lineTo(w, y);
    }
    const s0 = 64, k = 3.4, vp = w / 2;         // vertical lines: scroll with the track at the top, faster below
    const off = ((cam % s0) + s0) % s0;
    for (let xt = -off - s0; xt < w + s0; xt += s0) {
      flctx.moveTo(xt, top); flctx.lineTo(vp + (xt - vp) * k, h);
    }
    flctx.stroke();
    flctx.restore();

    // road edge Kenny runs on
    flctx.fillStyle = "#ff3cac"; flctx.fillRect(0, 0, w, 6);
    flctx.fillStyle = "#7fe0ff"; flctx.fillRect(0, 0, w, 2);
    flctx.fillStyle = "rgba(127,224,255,.85)";
    const dash = 140, doff = ((cam % dash) + dash) % dash;
    for (let x = -doff; x < w; x += dash) flctx.fillRect(Math.round(x), 3, 48, 2);
  }

  /* -------------------------------------------------------- sprites */
  const FRAME_PATH = "assets/character/webp/";
  const frameNames = (prefix, n) => Array.from({ length: n }, (_, i) => `${prefix}_${String(i + 1).padStart(2, "0")}`);
  const ANIMS = {
    run:  { frames: frameNames("run", 10), seq: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], dur: () => 1000 / 15, loop: true },
    idle: { frames: frameNames("idle", 3), seq: [0, 1, 2, 1], dur: (k) => (k === 0 ? 240 : 120), loop: true },
    wave: { frames: frameNames("wave", 5), seq: [0, 1, 2, 3, 2, 1, 2, 3, 4], dur: () => 120, loop: false, next: "idle" }
  };
  const images = {};
  function preloadFrames() {
    const all = Object.values(ANIMS).flatMap((a) => a.frames);
    return Promise.all(all.map((name) => new Promise((res) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => res());
      img.onerror = () => {   // fall back to the original PNG if WebP is unavailable
        if (!img.dataset.fallback) { img.dataset.fallback = "1"; img.src = `assets/character/${name}.png`; } else res();
      };
      img.src = FRAME_PATH + name + ".webp";
      images[name] = img;
    })));
  }

  const kennyEl = $("#kenny");
  const kctx = $("#kenny-canvas").getContext("2d");
  const sprite = { anim: "idle", k: 0, t: 0, drawn: null };

  function drawFrame(name) {
    if (sprite.drawn === name) return;
    const img = images[name];
    if (!img || !img.complete || !img.naturalWidth) return;
    kctx.clearRect(0, 0, 420, 640);
    kctx.drawImage(img, 0, 0, 420, 640);
    sprite.drawn = name;
  }
  function play(name) {
    if (reduced) name = "idle";
    if (sprite.anim === name && ANIMS[name].loop) return;
    sprite.anim = name; sprite.k = 0; sprite.t = 0;
    const a = ANIMS[name];
    drawFrame(a.frames[a.seq[0]]);
  }
  function stepSprite(dt) {
    const a = ANIMS[sprite.anim];
    if (reduced) { drawFrame(ANIMS.idle.frames[0]); return; }
    sprite.t += dt;
    while (sprite.t >= a.dur(a.seq[sprite.k])) {
      sprite.t -= a.dur(a.seq[sprite.k]);
      sprite.k++;
      if (sprite.anim === "run" && (sprite.k === 2 || sprite.k === 7)) RetroSound.step(sprite.k === 7);   // footfalls
      if (sprite.k >= a.seq.length) {
        if (a.loop) sprite.k = 0;
        else { play(a.next); idleSince = performance.now(); return; }
      }
    }
    drawFrame(a.frames[a.seq[sprite.k]]);
  }

  /* --------------------------------------------------- speech bubble */
  const bubble = $("#bubble");
  const bubbleText = $("#bubble-text");
  const live = $("#speech-live");
  let typeTimer = null;
  function say(raw) {
    clearInterval(typeTimer);
    const text = withName(raw);
    if (!text) { hideBubble(); return; }
    live.textContent = text;
    bubble.classList.add("show");
    bubble.classList.remove("done");
    if (reduced) { bubbleText.textContent = text; bubble.classList.add("done"); return; }
    const chars = Array.from(text);
    let n = 0;
    bubbleText.textContent = "";
    typeTimer = setInterval(() => {
      bubbleText.textContent += chars[n++];
      if (n >= chars.length) { clearInterval(typeTimer); bubble.classList.add("done"); }
    }, 32);
  }
  function hideBubble() {
    clearInterval(typeTimer);
    bubble.classList.remove("show");
  }

  /* ------------------------------------------------------------ effects */
  const fx = $("#fx");
  const fctx = fx.getContext("2d");
  const parts = { lines: [], dust: [], confetti: [] };
  const CONFETTI = ["#f07a2a", "#ffc94a", "#1b2440", "#ffffff", "#8296b6", "#ffa660", "#5fb8f0"];

  function spawnRunFx(dt, dirSign) {
    const back = -dirSign;
    const sw = L.spriteW, sh = L.spriteH;
    // speed lines behind him
    let n = dt * 0.045;
    while (Math.random() < n) {
      n -= 1;
      parts.lines.push({
        x: L.kx + back * sw * (0.15 + Math.random() * 0.25),
        y: L.groundY - sh * (0.15 + Math.random() * 0.7),
        len: 30 + Math.random() * 70,
        vx: back * (700 + Math.random() * 500),
        life: 0, max: 0.22 + Math.random() * 0.18,
        w: 2 + Math.random() * 2.5
      });
    }
    // dust at his feet
    dustClock += dt;
    if (dustClock > 85) {
      dustClock = 0;
      parts.dust.push({
        x: L.kx + back * sw * 0.12 + (Math.random() - 0.5) * 14,
        y: L.groundY - 6,
        r: 4 + Math.random() * 4,
        vx: back * (60 + Math.random() * 110),
        vy: -(20 + Math.random() * 40),
        life: 0, max: 0.45 + Math.random() * 0.25
      });
    }
  }
  let dustClock = 0;

  function confetti() {
    if (reduced) return;
    const W = innerWidth;
    for (let i = 0; i < 170; i++) {
      const fromKenny = i % 3 === 0;
      parts.confetti.push({
        x: fromKenny ? L.kx : Math.random() * W,
        y: fromKenny ? L.groundY - L.spriteH * 0.6 : -20 - Math.random() * 200,
        vx: fromKenny ? (Math.random() - 0.3) * 520 : (Math.random() - 0.5) * 120,
        vy: fromKenny ? -(380 + Math.random() * 420) : 60 + Math.random() * 160,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 12,
        w: 6 + Math.random() * 7, h: 3 + Math.random() * 5,
        c: CONFETTI[i % CONFETTI.length],
        life: 0, max: 3.2 + Math.random() * 1.6, wob: Math.random() * 6.28
      });
    }
  }

  function stepFx(dt) {
    const s = dt / 1000;
    const any = parts.lines.length || parts.dust.length || parts.confetti.length;
    if (!any && !fxDirty) return;
    fctx.clearRect(0, 0, L.w, L.h);
    fxDirty = !!any;

    fctx.lineCap = "round";
    parts.lines = parts.lines.filter((p) => {
      p.life += s; p.x += p.vx * s;
      if (p.life > p.max) return false;
      const a = 1 - p.life / p.max;
      fctx.strokeStyle = `rgba(255,255,255,${0.85 * a})`;
      fctx.lineWidth = p.w;
      fctx.beginPath();
      fctx.moveTo(p.x, p.y);
      fctx.lineTo(p.x - Math.sign(p.vx) * p.len, p.y);
      fctx.stroke();
      return true;
    });
    parts.dust = parts.dust.filter((p) => {
      p.life += s; p.x += p.vx * s; p.y += p.vy * s; p.vy += 30 * s;
      if (p.life > p.max) return false;
      const t = p.life / p.max;
      fctx.fillStyle = `rgba(245,232,210,${0.75 * (1 - t)})`;
      fctx.beginPath();
      fctx.arc(p.x, p.y, p.r * (1 + t * 1.8), 0, Math.PI * 2);
      fctx.fill();
      return true;
    });
    parts.confetti = parts.confetti.filter((p) => {
      p.life += s;
      p.vy += 420 * s; p.vy = Math.min(p.vy, 260);
      p.vx *= 0.985;
      p.wob += 6 * s;
      p.x += (p.vx + Math.sin(p.wob) * 40) * s; p.y += p.vy * s;
      p.rot += p.vr * s;
      if (p.life > p.max || p.y > L.h + 30) return false;
      fctx.save();
      fctx.globalAlpha = Math.min(1, (p.max - p.life) * 2);
      fctx.translate(p.x, p.y);
      fctx.rotate(p.rot);
      fctx.scale(1, Math.cos(p.wob));
      fctx.fillStyle = p.c;
      fctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      fctx.restore();
      return true;
    });
  }
  let fxDirty = false;

  /* ------------------------------------------------------------ layout */
  const L = {};   // measured layout values
  const lyr = {
    sky: $("#sky"), sun: $("#sun"),
    clouds: $("#layer-clouds"), far: $("#layer-far"), near: $("#layer-near"), ground: $("#layer-ground")
  };
  function layout() {
    L.w = innerWidth; L.h = innerHeight;
    const kr = kennyEl.getBoundingClientRect();
    L.kx = kr.left + kr.width / 2;
    L.spriteH = kr.height; L.spriteW = kr.width;
    L.groundY = lyr.ground.getBoundingClientRect().top;
    L.groundH = lyr.ground.clientHeight;
    L.spacing = Math.max(900, L.w * 1.1);   // world distance between checkpoints
    L.gap = L.spriteW * 0.62;               // checkpoint post stands just behind him
    const gateShift = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gate-shift")) || 0;

    STOPS.forEach((s, i) => {
      s.marker.style.left = `${i * L.spacing + (s.kind === "cp" ? 0 : L.gap + gateShift)}px`;
    });

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    floor.width = Math.round(L.w * dpr); floor.height = Math.round(L.groundH * dpr);
    flctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fx.width = Math.round(L.w * dpr); fx.height = Math.round(L.h * dpr);
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    RetroSky.resize(L.w, L.h);

    // keep the snapped section aligned after a resize
    const want = target * journey.clientHeight;
    if (Math.abs(journey.scrollTop - want) > 2) { pendingTarget = target; journey.scrollTop = want; }
    renderWorld(true);
  }

  /* --------------------------------------------------- world rendering */
  const mix = (a, b, t) => {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const A = p(a), B = p(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
  };
  let lastRenderedX = null;
  function renderWorld(force) {
    if (!force && lastRenderedX === worldX) return;
    lastRenderedX = worldX;
    const cam = worldX * L.spacing;
    track.style.transform = `translate3d(${L.kx - L.gap - cam}px,0,0)`;
    lyr.clouds.style.backgroundPositionX = `${-cam * 0.08}px`;
    lyr.far.style.backgroundPositionX = `${-cam * 0.22}px`;
    lyr.near.style.backgroundPositionX = `${-cam * 0.5}px`;
    drawFloor(cam);

    const sky = CFG.sky;
    const f = clamp(worldX, 0, sky.length - 1);
    const i0 = Math.floor(f), i1 = Math.min(i0 + 1, sky.length - 1), t = f - i0;
    lyr.sky.style.background = `linear-gradient(180deg, ${mix(sky[i0][0], sky[i1][0], t)} 0%, ${mix(sky[i0][1], sky[i1][1], t)} 100%)`;
    const prog = worldX / LAST;
    lyr.sun.style.transform = `translateY(${16 + prog * 22}vh)`;   // the sun sets as you travel
    dotsFill.style.width = `${prog * 100}%`;
  }

  /* ----------------------------------------------------------- journey */
  let worldX = 0;          // position in checkpoint units (0 = start, 6 = finish)
  let target = 0;          // checkpoint we're heading to
  let here = -1;           // checkpoint we're standing at (-1 = travelling)
  let vel = 0, runDir = 1;
  let idleSince = performance.now();
  let pendingTarget = null, pendingTimer = null;
  let started = false;

  function setTarget(i) {
    i = clamp(i, 0, LAST);
    if (i === target && here === i) return;
    target = i;
    loadImages(STOPS[i]);
    updateDots();
    if (here !== -1 && here !== i) depart();
    if (reduced || !started) { worldX = target; renderWorld(true); if (started) arrive(target); }
  }

  // Section images start downloading only once Kenny sets off toward that stop.
  function loadImages(s) {
    s.el.querySelectorAll("img[data-src]").forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  }

  /* While a checkpoint's pop-up is open, scrolling (wheel, touch, keys) only moves the pop-up.
     Closing it hands scrolling back to the run. */
  let locked = false;
  function setLock(on) {
    locked = on;
    journey.classList.toggle("locked", on);
  }
  function closePanel() {
    if (here === -1) return;
    const s = STOPS[here];
    if (!s.body) return;
    s.el.classList.add("closed");
    setLock(false);
    say(CFG.speech.closed || "Scroll to keep running!");
    const re = s.el.querySelector(".panel-reopen");
    if (re) re.focus({ preventScroll: true });
  }
  function openPanel() {
    if (here === -1) return;
    const s = STOPS[here];
    if (!s.body) return;
    s.el.classList.remove("closed");
    setLock(true);
    say(s.speech);
  }
  function scrollPanel(dy) {
    const s = here !== -1 && STOPS[here];
    if (s && s.body) s.body.scrollBy({ top: dy, behavior: Math.abs(dy) > 80 && !reduced ? "smooth" : "auto" });
  }

  function depart() {
    setLock(false);
    const s = STOPS[here];
    s.el.classList.remove("closed");
    s.el.classList.remove("is-here");
    s.el.classList.add("leaving");
    setTimeout(() => s.el.classList.remove("leaving"), 260);
    s.marker.classList.remove("here");
    hideBubble();
    here = -1;
  }

  function arrive(i) {
    here = i;
    vel = 0;
    const s = STOPS[i];
    loadImages(s);
    kennyEl.classList.remove("flip");
    play(s.kind === "cp" ? "idle" : "wave");
    RetroSound.runStop();
    if (s.kind === "finish") RetroSound.fanfare(); else if (s.kind === "cp") RetroSound.chime();
    s.marker.classList.add("lit", "here");
    s.el.classList.remove("leaving", "closed");
    s.el.classList.add("is-here");
    if (s.body) { s.body.scrollTop = 0; setLock(true); }
    say(s.speech);
    updateDots();
    idleSince = performance.now();
    const url = i === 0 ? location.pathname + location.search : `#${s.id}`;
    try { history.replaceState(null, "", url); } catch (_) { /* file:// in some browsers */ }
    if (s.kind === "finish") confetti();
  }

  function updateDots() {
    STOPS.forEach((s, i) => {
      s.dot.classList.toggle("current", i === target);
      s.dot.classList.toggle("visited", i < target);
      s.dotName.classList.toggle("current", i === target);
      if (i === target) s.dot.setAttribute("aria-current", "step");
      else s.dot.removeAttribute("aria-current");
    });
  }

  function goTo(i) {
    i = clamp(i, 0, LAST);
    if (i !== target || here === -1) setLock(false);
    pendingTarget = i;
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(() => { pendingTarget = null; }, 1600);
    setTarget(i);
    journey.scrollTo({ top: i * journey.clientHeight, behavior: reduced ? "auto" : "smooth" });
  }

  function indexFromScroll() {
    return clamp(Math.round(journey.scrollTop / journey.clientHeight), 0, LAST);
  }
  journey.addEventListener("scroll", () => {
    const idx = indexFromScroll();
    if (pendingTarget !== null) {
      if (idx === pendingTarget) pendingTarget = null;
      return;
    }
    if (idx !== target) setTarget(idx);
  }, { passive: true });
  journey.addEventListener("scrollend", () => {
    pendingTarget = null;
    const idx = indexFromScroll();
    if (idx !== target) setTarget(idx);
  });

  // Mouse wheel / trackpad: one gesture = one checkpoint. A panel that can still
  // scroll its own content gets the wheel first.
  function panelCanScroll(node, dy) {
    const body = node.closest && node.closest(".panel-body");
    if (!body || body.scrollHeight <= body.clientHeight + 1) return false;
    return dy > 0 ? body.scrollTop + body.clientHeight < body.scrollHeight - 1 : body.scrollTop > 0;
  }
  let lastWheel = 0, wheelLock = 0, prevAbs = 0;
  journey.addEventListener("wheel", (e) => {
    if (e.ctrlKey) return;   // pinch-zoom
    if (locked) {            // pop-up open: the wheel scrolls it, wherever the pointer is
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? journey.clientHeight : 1;
      if (!e.target.closest || !e.target.closest(".panel-body")) scrollPanel(e.deltaY * unit);
      else e.target.closest(".panel-body").scrollBy({ top: e.deltaY * unit });
      lastWheel = performance.now();
      return;
    }
    const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (panelCanScroll(e.target, e.deltaY) && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) { lastWheel = performance.now(); return; }
    e.preventDefault();
    const now = performance.now();
    const quiet = now - lastWheel > 200;        // a fresh gesture
    const abs = Math.abs(d);
    const spike = now > wheelLock && abs > prevAbs + 12;   // new flick during trackpad inertia
    lastWheel = now; prevAbs = abs;
    if (abs < 2 || !(quiet || spike) || now < wheelLock && !quiet) return;
    wheelLock = now + 600;
    goTo(target + (d > 0 ? 1 : -1));
  }, { passive: false });

  addEventListener("hashchange", () => {
    if (location.hash) goTo(initialIndex());
  });

  // movement tuning (px/s, px/s²)
  const ACCEL = 2600, DECEL = 2200;
  function stepTravel(dt) {
    if (here !== -1 || !started) return;
    const s = dt / 1000;
    const distPx = (target - worldX) * L.spacing;
    const d = Math.sign(distPx) || 1;
    if (d !== runDir) { runDir = d; vel = Math.min(vel, 200); }
    kennyEl.classList.toggle("flip", d < 0);
    if (sprite.anim !== "run") RetroSound.runStart();
    play("run");

    const remaining = Math.abs(distPx);
    const checkpointsLeft = remaining / L.spacing;
    const cruise = (L.spacing / 1.15) * clamp(1 + 0.7 * (checkpointsLeft - 1), 1, 3.2);
    const desired = Math.max(160, Math.min(cruise, Math.sqrt(2 * DECEL * remaining)));
    vel += clamp(desired - vel, -DECEL * s, ACCEL * s);
    const step = vel * s;
    if (step >= remaining || remaining < 0.5) {
      worldX = target;
      renderWorld(true);
      arrive(target);
      return;
    }
    worldX += (d * step) / L.spacing;
    spawnRunFx(dt, d);
  }

  /* ----------------------------------------------------------- main loop */
  let lastT = performance.now();
  function frame(now) {
    const dt = Math.min(now - lastT, 50);
    lastT = now;
    stepTravel(dt);
    renderWorld(false);
    stepSprite(dt);
    stepFx(dt);
    if (!reduced) RetroSky.update(dt, worldX * L.spacing, worldX / LAST);
    if (here !== -1 && sprite.anim === "idle" && !reduced && now - idleSince > 6000) {
      play("wave");
      if (CFG.speech.idle) say(CFG.speech.idle);
      idleSince = now;
    }
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------- input */
  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || modal.open) return;
    const t = e.target;
    if (t.closest && t.closest("input, textarea, select, [contenteditable]")) return;
    if (locked) {
      if (e.key === "Escape") { e.preventDefault(); closePanel(); return; }
      const page = STOPS[here].body.clientHeight * 0.85;
      const dy = { ArrowDown: 60, ArrowUp: -60, PageDown: page, PageUp: -page, " ": t.closest("a, button") ? 0 : (e.shiftKey ? -page : page) }[e.key];
      if (dy) { e.preventDefault(); scrollPanel(dy); }
      return;
    }
    const next = ["ArrowDown", "PageDown", "ArrowRight"];
    const prev = ["ArrowUp", "PageUp", "ArrowLeft"];
    let to = null;
    if (next.includes(e.key)) to = target + 1;
    else if (prev.includes(e.key)) to = target - 1;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = LAST;
    else if (e.key === " " && !t.closest("a, button")) to = target + (e.shiftKey ? -1 : 1);
    if (to === null) return;

    // let a scrollable panel body use up/down until it hits its edge
    const body = t.closest && t.closest(".panel-body");
    if (body && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      const down = e.key === "ArrowDown";
      const canScroll = down ? body.scrollTop + body.clientHeight < body.scrollHeight - 2 : body.scrollTop > 0;
      if (canScroll) return;
    }
    e.preventDefault();
    goTo(to);
  });

  reduceMQ.addEventListener?.("change", (e) => {
    reduced = e.matches;
    if (reduced && here === -1) { worldX = target; renderWorld(true); arrive(target); }
  });

  let resizeRaf = 0;
  addEventListener("resize", () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(layout);
  });

  /* -------------------------------------------------------------- boot */
  function initialIndex() {
    let h = decodeURIComponent(location.hash.slice(1));
    h = HASH_ALIAS[h] || h;
    const i = STOPS.findIndex((s) => s.id === h);
    return i < 0 ? 0 : i;
  }

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  RetroSky.init($("#ambient"));
  document.body.classList.toggle("scanlines", !CFG.retro || CFG.retro.scanlines !== false);

  // sound on/off button in the HUD
  const soundBtn = $("#sound-btn");
  const syncSoundBtn = () => {
    const on = RetroSound.enabled;
    soundBtn.setAttribute("aria-pressed", String(on));
    soundBtn.classList.toggle("off", !on);
    soundBtn.classList.toggle("waiting", on && !RetroSound.active);   // pulses until the first click unlocks audio
    soundBtn.title = on ? (RetroSound.active ? "Sound on (click to mute)" : "Click to turn sound on") : "Sound off (click to unmute)";
  };
  soundBtn.addEventListener("click", () => RetroSound.toggle());
  RetroSound.onChange(syncSoundBtn);
  syncSoundBtn();

  buildStops();
  paintScenery();
  const startAt = initialIndex();
  target = startAt; worldX = startAt;
  layout();
  journey.scrollTop = startAt * journey.clientHeight;
  updateDots();
  journey.focus({ preventScroll: true });

  const failSafe = new Promise((r) => setTimeout(r, 5000));
  Promise.race([preloadFrames(), failSafe]).then(() => {
    started = true;
    layout();
    // sync in case the visitor scrolled while frames were loading
    target = indexFromScroll(); worldX = target; renderWorld(true);
    arrive(target);
    lastT = performance.now();
    requestAnimationFrame(frame);
  });
})();
