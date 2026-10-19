/* =========================================================
   AL AUTO — Halaman Testimoni (team)
   Carousel testimoni + lightbox perbesar gambar.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Carousel ---------- */
  var slide = document.querySelector(".slide");
  var prevBtn = document.querySelector(".carousel-btn.prev");
  var nextBtn = document.querySelector(".carousel-btn.next");

  if (slide && prevBtn && nextBtn) {
    var scrollStep = function () {
      var card = slide.querySelector(".team-member");
      if (card) {
        var gap = parseFloat(getComputedStyle(slide).gap) || 24;
        return card.getBoundingClientRect().width + gap;
      }
      return slide.clientWidth * 0.8;
    };

    var updateButtons = function () {
      var maxScroll = slide.scrollWidth - slide.clientWidth;
      prevBtn.disabled = slide.scrollLeft <= 2;
      nextBtn.disabled = slide.scrollLeft >= maxScroll - 2;
    };

    prevBtn.addEventListener("click", function () {
      slide.scrollBy({ left: -scrollStep(), behavior: "smooth" });
    });

    nextBtn.addEventListener("click", function () {
      slide.scrollBy({ left: scrollStep(), behavior: "smooth" });
    });

    slide.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    updateButtons();
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");

  if (lightbox && slide) {
    var lightboxImg = lightbox.querySelector(".lightbox-img");
    var closeBtn = lightbox.querySelector(".lightbox-close");

    var openLightbox = function (img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    };

    var closeLightbox = function () {
      lightbox.hidden = true;
      lightboxImg.src = "";
      document.body.style.overflow = "";
    };

    slide.querySelectorAll(".team-member img").forEach(function (img) {
      img.addEventListener("click", function () {
        openLightbox(img);
      });
    });

    closeBtn.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }
})();
