/* ==========================================================================
   A little website, just for you — interactions
   You shouldn't need to edit this file. Names, dates and music are set
   at the top of index.html.
   ========================================================================== */

(() => {
  "use strict";

  const config = {
    her:      typeof girlfriendName  !== "undefined" ? girlfriendName  : "",
    me:       typeof myName          !== "undefined" ? myName          : "",
    since:    typeof togetherSince   !== "undefined" ? togetherSince   : "",
    date:     typeof letterDate      !== "undefined" ? letterDate      : "",
    music:    typeof backgroundMusic !== "undefined" ? backgroundMusic : "",
    musicTag: typeof musicLabel      !== "undefined" ? musicLabel      : "Music",
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const HEART_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  /* ---------- names, dates ---------- */

  function personalize() {
    document.querySelectorAll('[data-name="her"]').forEach(el => (el.textContent = config.her));
    document.querySelectorAll('[data-name="me"]').forEach(el => (el.textContent = config.me));

    if (config.since) {
      document.querySelectorAll("[data-since]").forEach(el => (el.textContent = config.since));
    } else {
      document.querySelectorAll("[data-since-wrap]").forEach(el => el.remove());
    }

    const dateEl = document.querySelector("[data-letter-date]");
    if (dateEl) {
      dateEl.textContent = config.date ||
        new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
    }

    if (config.her) document.title = `For ${config.her} ❤️`;
  }

  /* ---------- scroll reveal ---------- */

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(el => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    items.forEach(el => observer.observe(el));
  }

  /* ---------- floating background hearts (kept deliberately sparse) ---------- */

  function initFloatingHearts() {
    const layer = document.querySelector(".hearts");
    if (!layer || reduceMotion) return;

    const count = window.innerWidth < 640 ? 6 : 10;
    for (let i = 0; i < count; i++) {
      const heart = document.createElement("span");
      heart.className = "float-heart";
      heart.innerHTML = HEART_SVG;
      const size = 8 + Math.random() * 14;
      heart.style.width = heart.style.height = `${size}px`;
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.setProperty("--o", (0.12 + Math.random() * 0.22).toFixed(2));
      heart.style.setProperty("--sway", `${(Math.random() * 60 - 30).toFixed(0)}px`);
      heart.style.animationDuration = `${16 + Math.random() * 14}s`;
      heart.style.animationDelay = `${-Math.random() * 30}s`;
      layer.appendChild(heart);
    }
  }

  /* ---------- little heart burst on important buttons ---------- */

  function heartBurst(x, y) {
    if (reduceMotion) return;
    const n = 9;
    for (let i = 0; i < n; i++) {
      const h = document.createElement("span");
      h.className = "burst-heart";
      h.innerHTML = HEART_SVG;
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      const dist = 40 + Math.random() * 40;
      h.style.left = `${x}px`;
      h.style.top = `${y}px`;
      h.style.setProperty("--x", `${Math.cos(angle) * dist}px`);
      h.style.setProperty("--y", `${Math.sin(angle) * dist - 20}px`);
      const s = 9 + Math.random() * 8;
      h.style.width = h.style.height = `${s}px`;
      document.body.appendChild(h);
      h.addEventListener("animationend", () => h.remove());
    }
  }

  function initBursts() {
    document.querySelectorAll(".js-burst").forEach(btn => {
      btn.addEventListener("click", e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX || r.left + r.width / 2;
        const y = e.clientY || r.top + r.height / 2;
        heartBurst(x, y);
      });
    });
  }

  /* ---------- smooth scroll buttons ---------- */

  function initScrollButtons() {
    document.querySelectorAll("[data-scroll-to]").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = document.getElementById(btn.dataset.scrollTo);
        if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  /* ---------- hidden messages ("surprise" / "one more thing") ---------- */

  function initHiddenMessages() {
    document.querySelectorAll("[data-reveal-target]").forEach(btn => {
      const target = document.getElementById(btn.dataset.revealTarget);
      if (!target) return;
      target.setAttribute("aria-hidden", "true");
      btn.addEventListener("click", () => {
        const open = !target.classList.contains("is-open");
        target.classList.toggle("is-open", open);
        target.setAttribute("aria-hidden", String(!open));
        btn.setAttribute("aria-expanded", String(open));
        if (open) {
          setTimeout(() => target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }), 350);
        }
      });
    });
  }

  /* ---------- quote carousel ---------- */

  function initCarousel() {
    const root = document.querySelector("[data-carousel]");
    if (!root) return;

    const slides = [...root.querySelectorAll(".quote-card")];
    const dotsWrap = root.querySelector(".carousel__dots");
    const track = root.querySelector(".carousel__track");
    if (!slides.length) return;

    let index = 0;
    let timer = null;
    const INTERVAL = 7000;

    const dots = slides.map((_, i) => {
      const d = document.createElement("button");
      d.type = "button";
      d.setAttribute("role", "tab");
      d.setAttribute("aria-label", `Quote ${i + 1}`);
      d.addEventListener("click", () => { go(i); restart(); });
      dotsWrap.appendChild(d);
      return d;
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => {
        s.classList.toggle("is-active", n === index);
        s.setAttribute("aria-hidden", String(n !== index));
      });
      dots.forEach((d, n) => d.setAttribute("aria-selected", String(n === index)));
    }

    function start() { if (!reduceMotion) timer = setInterval(() => go(index + 1), INTERVAL); }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    root.querySelector("[data-prev]").addEventListener("click", () => { go(index - 1); restart(); });
    root.querySelector("[data-next]").addEventListener("click", () => { go(index + 1); restart(); });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);

    // swipe
    let startX = null;
    track.addEventListener("pointerdown", e => { startX = e.clientX; });
    track.addEventListener("pointerup", e => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 40) { go(dx < 0 ? index + 1 : index - 1); restart(); }
      startX = null;
    });

    go(0);
    start();
  }

  /* ---------- placeholders for media that hasn't been added yet ---------- */

  function makePlaceholder(label, path) {
    const el = document.createElement("span");
    el.className = "placeholder";
    el.innerHTML = `<span>${label}<code>${path}</code></span>`;
    return el;
  }

  /* ---------- gallery + lightbox ---------- */

  function initGallery() {
    const items = [...document.querySelectorAll(".gallery__item")];
    const box = document.getElementById("lightbox");
    if (!items.length || !box) return;

    const img = box.querySelector(".lightbox__img");
    const cap = box.querySelector(".lightbox__caption");
    let current = 0;
    let lastFocus = null;

    const markMissing = item => {
      const photo = item.querySelector("img");
      if (!photo || item.classList.contains("is-missing")) return;
      item.classList.add("is-missing");
      photo.replaceWith(makePlaceholder("Add a photo here", photo.getAttribute("src")));
    };

    items.forEach(item => {
      const photo = item.querySelector("img");
      if (!photo) return;
      photo.addEventListener("error", () => markMissing(item));
      if (photo.complete && photo.naturalWidth === 0) markMissing(item);

      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", `Open photo${photo.alt ? ": " + photo.alt : ""}`);
      item.addEventListener("click", () => openAt(item));
      item.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openAt(item); }
      });
    });

    const available = () => items.filter(i => !i.classList.contains("is-missing"));

    function show(i) {
      const list = available();
      if (!list.length) return;
      current = (i + list.length) % list.length;
      const item = list[current];
      const photo = item.querySelector("img");
      const caption = item.querySelector("figcaption");
      img.src = photo.currentSrc || photo.src;
      img.alt = photo.alt;
      cap.textContent = caption ? caption.textContent : "";
    }

    function openAt(item) {
      const list = available();
      const i = list.indexOf(item);
      if (i === -1) return;
      lastFocus = document.activeElement;
      show(i);
      box.hidden = false;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => box.classList.add("is-open"));
      box.querySelector("[data-close]").focus();
    }

    function close() {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(() => { box.hidden = true; }, reduceMotion ? 0 : 400);
      if (lastFocus) lastFocus.focus();
    }

    box.querySelector("[data-close]").addEventListener("click", close);
    box.querySelector("[data-prev]").addEventListener("click", () => show(current - 1));
    box.querySelector("[data-next]").addEventListener("click", () => show(current + 1));
    box.addEventListener("click", e => { if (e.target === box) close(); });

    document.addEventListener("keydown", e => {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });

    let startX = null;
    box.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(dx < 0 ? current + 1 : current - 1);
      startX = null;
    });
  }

  /* ---------- video gallery + player ---------- */

  function initVideoGallery() {
    const tiles = [...document.querySelectorAll(".vtile[data-video], .vtile[data-youtube]")];
    const modal = document.getElementById("video-modal");
    if (!tiles.length || !modal) return;

    const frame = modal.querySelector(".video-modal__frame");
    const cap = modal.querySelector(".lightbox__caption");
    const canHover = window.matchMedia("(hover: hover)").matches;
    let lastFocus = null;

    tiles.forEach(tile => {
      const caption = tile.dataset.caption || "";
      const ytId = (tile.dataset.youtube || "").trim();
      const src = tile.dataset.video || "";

      tile.innerHTML =
        '<span class="vtile__media"></span>' +
        '<span class="vtile__play" aria-hidden="true"></span>' +
        '<span class="vtile__caption"></span>';
      tile.querySelector(".vtile__caption").textContent = caption;
      tile.setAttribute("aria-label", `Play video${caption ? ": " + caption : ""}`);
      const media = tile.querySelector(".vtile__media");

      const markMissing = (label, path) => {
        if (tile.classList.contains("is-missing")) return;
        tile.classList.add("is-missing");
        tile.disabled = true;
        media.replaceChildren(makePlaceholder(label, path));
      };

      if (tile.hasAttribute("data-youtube")) {
        if (!ytId || ytId === "YOUR_VIDEO_ID") {
          markMissing("Add a YouTube video id", 'data-youtube="…"');
        } else {
          const thumb = new Image();
          thumb.alt = "";
          thumb.loading = "lazy";
          thumb.src = `https://i.ytimg.com/vi/${encodeURIComponent(ytId)}/hqdefault.jpg`;
          media.appendChild(thumb);
        }
      } else {
        // a muted, silent copy of the video acts as the thumbnail
        const preview = document.createElement("video");
        preview.muted = true;
        preview.loop = true;
        preview.playsInline = true;
        preview.preload = "metadata";
        preview.setAttribute("aria-hidden", "true");
        preview.addEventListener("error", () => markMissing("Add a video here", src));
        preview.src = `${src}#t=0.1`;
        media.appendChild(preview);

        if (canHover && !reduceMotion) {
          tile.addEventListener("mouseenter", () => preview.play().catch(() => {}));
          tile.addEventListener("mouseleave", () => preview.pause());
        }
      }

      tile.addEventListener("click", () => open(tile));
    });

    function open(tile) {
      if (tile.classList.contains("is-missing")) return;
      lastFocus = document.activeElement;
      const ytId = (tile.dataset.youtube || "").trim();

      if (ytId) {
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(ytId)}?autoplay=1&rel=0`;
        iframe.title = tile.dataset.caption || "Video";
        iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allowFullscreen = true;
        frame.replaceChildren(iframe);
        pauseMusic();
      } else {
        const video = document.createElement("video");
        video.src = tile.dataset.video;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.addEventListener("play", pauseMusic);
        frame.replaceChildren(video);
      }

      cap.textContent = tile.dataset.caption || "";
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => modal.classList.add("is-open"));
      modal.querySelector("[data-close]").focus();
    }

    function close() {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      frame.replaceChildren();          // stops playback
      setTimeout(() => { modal.hidden = true; }, reduceMotion ? 0 : 400);
      if (lastFocus) lastFocus.focus();
    }

    modal.querySelector("[data-close]").addEventListener("click", close);
    modal.addEventListener("click", e => { if (e.target === modal) close(); });
    document.addEventListener("keydown", e => {
      if (!modal.hidden && e.key === "Escape") close();
    });
  }

  /* ---------- background music (never autoplays) ---------- */

  let audio = null;
  let musicBtn = null;

  function pauseMusic() {
    if (audio && !audio.paused) audio.pause();
  }

  function initMusic() {
    musicBtn = document.querySelector(".music");
    if (!musicBtn || !config.music) return;

    audio = new Audio();
    audio.src = config.music;
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0.6;

    const label = musicBtn.querySelector(".music__label");
    const setState = playing => {
      musicBtn.setAttribute("aria-pressed", String(playing));
      label.textContent = playing ? `Pause · ${config.musicTag}` : `Play · ${config.musicTag}`;
      musicBtn.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    };

    setState(false);
    musicBtn.hidden = false;

    musicBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch(() => {
          label.textContent = `Add ${config.music}`;
          musicBtn.setAttribute("aria-label", `Music file not found: ${config.music}`);
        });
      } else {
        audio.pause();
      }
    });
    audio.addEventListener("play", () => setState(true));
    audio.addEventListener("pause", () => setState(false));
  }

  /* ---------- go ---------- */

  personalize();
  initReveal();
  initFloatingHearts();
  initBursts();
  initScrollButtons();
  initHiddenMessages();
  initCarousel();
  initGallery();
  initVideoGallery();
  initMusic();
})();
