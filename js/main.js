(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Current year ---------- */
  var yearEl = doc.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Mobile navigation ---------- */
  var nav = doc.getElementById("primary-nav");
  var navToggle = doc.querySelector("[data-nav-toggle]");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  /* ---------- Theme toggle ---------- */
  var themeToggle = doc.querySelector("[data-theme-toggle]");
  var themeMeta = doc.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#0b0b0b" : "#f1efea");
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    }
  }

  applyTheme(root.getAttribute("data-theme") || "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- Scroll spy ---------- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.nav__list a[href^="#"]'));
  var sections = navLinks
    .map(function (link) { return doc.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (link) {
      var active = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(doc.querySelectorAll(".reveal"));

  function revealAll() {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  if (!prefersReduced && "IntersectionObserver" in window) {
    var observerHealthy = false;
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        observerHealthy = true;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });

    /* Safety net: if the observer never fires, reveal everything so content
       can never remain permanently hidden. Working browsers keep animated
       reveals, since the first callback marks the observer healthy. */
    window.setTimeout(function () {
      if (!observerHealthy) revealAll();
    }, 2500);
  } else {
    revealAll();
  }

  /* ---------- Back to top ---------- */
  var toTop = doc.querySelector("[data-to-top]");
  if (toTop) {
    var onScroll = function () {
      toTop.classList.toggle("is-visible", window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Copy email ---------- */
  var copyBtn = doc.querySelector("[data-copy-email]");
  if (copyBtn) {
    var original = copyBtn.textContent;
    copyBtn.addEventListener("click", function () {
      var value = copyBtn.getAttribute("data-copy-email");
      var done = function () {
        copyBtn.textContent = "Copied";
        window.setTimeout(function () { copyBtn.textContent = original; }, 1800);
      };
      var fail = function () {
        copyBtn.textContent = "Copy failed";
        window.setTimeout(function () { copyBtn.textContent = original; }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(fail);
      } else {
        var temp = doc.createElement("textarea");
        temp.value = value;
        temp.setAttribute("readonly", "");
        temp.style.position = "absolute";
        temp.style.left = "-9999px";
        doc.body.appendChild(temp);
        temp.select();
        try { doc.execCommand("copy"); done(); } catch (e) { fail(); }
        doc.body.removeChild(temp);
      }
    });
  }
})();
