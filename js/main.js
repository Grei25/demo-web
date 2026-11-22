/* =========================================================
   Лесная Гавань — скрипты
   ========================================================= */

(function () {
  "use strict";

  var header = document.getElementById("header");
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  /* ---------- Шапка при скролле ---------- */

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* Шапка должна стать светлой и при переходе сразу по якорю */
  window.addEventListener("load", function () {
    updateHeader();
    window.setTimeout(updateHeader, 150);
  });

  window.addEventListener("pageshow", updateHeader);
  window.addEventListener("hashchange", function () {
    window.setTimeout(updateHeader, 0);
  });

  /* ---------- Мобильное меню ---------- */

  function closeMenu() {
    if (!header) return;
    header.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    if (burger) {
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Открыть меню");
    }
  }

  if (burger && header) {
    burger.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      document.body.classList.toggle("no-scroll", open);
    });
  }

  if (nav) {
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1023) closeMenu();
  });

  /* ---------- Появление блоков ---------- */

  var reveals = document.querySelectorAll(".reveal");

  if (reveals.length) {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!("IntersectionObserver" in window) || reduceMotion) {
      reveals.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px" }
      );

      reveals.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  /* ---------- Текущий год ---------- */

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Даты: не раньше сегодняшнего дня ---------- */

  var now = new Date();
  var today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  document.querySelectorAll('input[type="date"]').forEach(function (input) {
    if (!input.min) input.min = today;
  });

  document.querySelectorAll('input[name="checkin"]').forEach(function (checkin) {
    var form = checkin.form;
    if (!form) return;

    var checkout = form.querySelector('input[name="checkout"]');
    if (!checkout) return;

    function syncCheckout() {
      if (!checkin.value) return;
      checkout.min = checkin.value;
      if (checkout.value && checkout.value < checkin.value) {
        checkout.value = checkin.value;
      }
    }

    checkin.addEventListener("change", syncCheckout);
    syncCheckout();
  });

  /* ---------- Предзаполнение номера из ссылки ---------- */

  try {
    var params = new URLSearchParams(window.location.search);
    var room = params.get("room");

    if (room) {
      var roomSelect = document.getElementById("room");
      if (roomSelect) roomSelect.value = room;
    }
  } catch (error) {
    /* старые браузеры — просто игнорируем */
  }

  /* ---------- Демонстрационная отправка форм ---------- */

  document.querySelectorAll("form[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var card = form.closest(".form-card, .booking-form-card");
      var success = card ? card.querySelector(".form-success") : null;

      if (success) {
        form.hidden = true;
        success.hidden = false;
        if (success.focus) success.focus();
      } else {
        form.reset();
        window.alert("Спасибо! Заявка отправлена — мы свяжемся с вами.");
      }
    });
  });

  document.querySelectorAll("[data-form-reset]").forEach(function (button) {
    button.addEventListener("click", function () {
      var success = button.closest(".form-success");
      var card = button.closest(".form-card, .booking-form-card");
      var form = card ? card.querySelector("form[data-demo-form]") : null;

      if (success) success.hidden = true;

      if (form) {
        form.reset();
        form.hidden = false;
        var firstField = form.querySelector("input, select, textarea");
        if (firstField) firstField.focus();
      }
    });
  });

  /* ---------- Лайтбокс галереи ---------- */

  var lightbox = document.getElementById("lightbox");

  if (lightbox && typeof lightbox.showModal === "function") {
    var lightboxImage = lightbox.querySelector("img");
    var closeButton = lightbox.querySelector(".lightbox__close");

    document.querySelectorAll("[data-lightbox]").forEach(function (button) {
      button.addEventListener("click", function () {
        var image = button.querySelector("img");
        if (!image || !lightboxImage) return;

        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt || "";
        lightbox.showModal();
      });
    });

    if (closeButton) {
      closeButton.addEventListener("click", function () {
        lightbox.close();
      });
    }

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) lightbox.close();
    });
  }
})();
