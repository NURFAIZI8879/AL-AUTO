/* =========================================================
   AL AUTO — Main Script
   Script bersama untuk semua halaman: animasi fade-in,
   menu navigasi mobile, tahun copyright, dan toast.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. Animasi fade-in saat elemen masuk layar ---------- */
  var fadeElements = document.querySelectorAll(".fade-in");

  if ("IntersectionObserver" in window && fadeElements.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeElements.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------- 2. Menu navigasi mobile ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.getElementById("nav-menu");

  if (navToggle && navMenu) {
    var closeMenu = function () {
      navMenu.classList.remove("is-open");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      navToggle.classList.toggle("is-active", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ---------- 3. Bayangan navbar saat halaman digulir ---------- */
  var navbar = document.querySelector(".navbar");

  if (navbar) {
    var updateNavbar = function () {
      navbar.classList.toggle("is-scrolled", window.scrollY > 10);
    };
    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
  }

  /* ---------- 4. Tahun copyright otomatis ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- 5. Hormati preferensi kurangi gerak ---------- */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("video").forEach(function (video) {
      video.removeAttribute("autoplay");
      video.pause();
    });
  }

  /* ---------- 6. Toast notifikasi global ---------- */
  window.showToast = function (message, duration) {
    var toast = document.querySelector(".toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");

    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, duration || 4000);
  };
})();
