/* =========================================================
   AL AUTO — Animations & Modern UI
   Scroll progress, back-to-top, parallax, staggered reveal
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. Scroll progress bar ---------- */
  var progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  document.body.appendChild(progressBar);

  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = Math.min(progress, 100) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------- 2. Back to top button ---------- */
  var backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", "Kembali ke atas");
  backToTop.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(backToTop);

  function updateBackToTop() {
    if (window.scrollY > 400) backToTop.classList.add("is-visible");
    else backToTop.classList.remove("is-visible");
  }
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- 3. Staggered reveal for grid children ---------- */
  var grids = document.querySelectorAll(".grid, .steps, .footer-grid");
  grids.forEach(function (grid) {
    grid.classList.add("stagger");
  });

  /* ---------- 4. Parallax hero ---------- */
  var hero = document.querySelector(".hero");
  if (hero) {
    window.addEventListener("scroll", function () {
      var offset = window.scrollY * 0.3;
      hero.style.backgroundPositionY = offset + "px";
    }, { passive: true });
  }

  /* ---------- 5. Counter animation for stats ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute("data-count"), 10);
          var duration = 1500;
          var start = 0;
          var startTime = null;
          function animate(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(animate);
            else el.textContent = target;
          }
          requestAnimationFrame(animate);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { counterObserver.observe(c); });
  }

  /* ---------- 6. Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      if (href === "#") return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---------- 7. Typing effect for hero eyebrow ---------- */
  var eyebrow = document.querySelector(".hero-eyebrow");
  if (eyebrow && eyebrow.textContent.length < 40) {
    var text = eyebrow.textContent;
    eyebrow.textContent = "";
    var i = 0;
    function type() {
      if (i < text.length) {
        eyebrow.textContent += text.charAt(i);
        i++;
        setTimeout(type, 60);
      }
    }
    setTimeout(type, 500);
  }
})();
