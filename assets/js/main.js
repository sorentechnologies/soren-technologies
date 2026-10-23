(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function () {
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setOpen(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
})();

/* Signal Vault screenshot carousel */
(function () {
  var root = document.getElementById("sv-carousel");
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll(".sv-slide"));
  var dots = Array.prototype.slice.call(root.querySelectorAll(".sv-dot"));
  var prevBtn = root.querySelector(".sv-arrow--prev");
  var nextBtn = root.querySelector(".sv-arrow--next");
  var bar = root.querySelector(".sv-progress-bar");
  var frame = root.querySelector(".sv-frame");
  if (!slides.length) return;

  var INTERVAL = 5000;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var autoplay = !reduceMotion && slides.length > 1;
  var current = 0;
  var hovering = false;
  var focused = false;

  root.style.setProperty("--sv-interval", INTERVAL + "ms");

  function load(i) {
    var slide = slides[(i + slides.length) % slides.length];
    if (!slide) return;
    slide.querySelectorAll("img[data-src]").forEach(function (img) {
      img.src = img.getAttribute("data-src");
      img.removeAttribute("data-src");
    });
  }

  function restartProgress() {
    if (!autoplay || !bar) return;
    root.classList.remove("is-running");
    void bar.offsetWidth; // reflow so the animation restarts
    root.classList.add("is-running");
  }

  function updatePaused() {
    if (!autoplay) return;
    var paused = hovering || focused || document.hidden;
    root.classList.toggle("is-paused", paused);
  }

  function show(i) {
    var n = slides.length;
    i = (i % n + n) % n;
    load(i);
    load(i + 1);
    slides.forEach(function (s, k) {
      var on = k === i;
      s.classList.toggle("is-active", on);
      if (on) s.removeAttribute("aria-hidden");
      else s.setAttribute("aria-hidden", "true");
    });
    dots.forEach(function (d, k) {
      if (k === i) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
    current = i;
    restartProgress();
  }

  if (prevBtn) prevBtn.addEventListener("click", function () { show(current - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { show(current + 1); });
  dots.forEach(function (d, k) {
    d.addEventListener("click", function () { show(k); });
  });

  if (bar) {
    bar.addEventListener("animationend", function () {
      if (autoplay) show(current + 1);
    });
  }

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
  });

  root.addEventListener("mouseenter", function () { hovering = true; updatePaused(); });
  root.addEventListener("mouseleave", function () { hovering = false; updatePaused(); });
  root.addEventListener("focusin", function (e) {
    var t = e.target;
    var visible = true;
    try { visible = t.matches(":focus-visible"); } catch (err) {}
    if (visible) { focused = true; updatePaused(); }
  });
  root.addEventListener("focusout", function (e) {
    if (!root.contains(e.relatedTarget)) { focused = false; updatePaused(); }
  });
  document.addEventListener("visibilitychange", updatePaused);

  // Touch swipe
  var startX = null, startY = null;
  if (frame) {
    frame.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    frame.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - startX, dy = t.clientY - startY;
      startX = startY = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  show(0);
  updatePaused();
})();
