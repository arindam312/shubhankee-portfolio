/* =========================================================
   Shubhankee Raha — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });
  }

  /* ---------- Header border on scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".site-nav a[href^='#']"));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Reveal on scroll + count-up ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion || isNaN(target)) return;
    var start = null, duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        var num = entry.target.querySelector("[data-count]");
        if (num) countUp(num);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var original = btn.textContent;
      var done = function () {
        btn.textContent = "Copied ✓";
        setTimeout(function () { btn.textContent = original; }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done);
      else {
        var ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); document.body.removeChild(ta); done();
      }
    });
  });

  /* =========================================================
     Press releases
     ========================================================= */
  var data = (window.PRESS_RELEASES || []).slice().sort(function (a, b) {
    return String(b.date).localeCompare(String(a.date));
  });
  var grid = document.getElementById("press-grid");
  var filtersEl = document.getElementById("press-filters");
  var searchEl = document.getElementById("press-search");
  var countEl = document.getElementById("press-count");
  var emptyEl = document.getElementById("press-empty");
  if (!grid) return;

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function formatDate(d) {
    var parts = String(d || "").split("-");
    var y = parts[0], m = parseInt(parts[1], 10), day = parseInt(parts[2], 10);
    if (!m) return y || "";
    return (day ? day + " " : "") + MONTHS[m - 1] + " " + y;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var state = { category: "All", query: "" };

  // Build category chips from the data
  var counts = { All: data.length };
  data.forEach(function (r) { if (r.category) counts[r.category] = (counts[r.category] || 0) + 1; });
  Object.keys(counts).forEach(function (cat) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.setAttribute("aria-pressed", String(cat === state.category));
    b.dataset.category = cat;
    b.innerHTML = esc(cat) + '<span class="chip__count">' + counts[cat] + "</span>";
    filtersEl.appendChild(b);
  });
  filtersEl.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    state.category = b.dataset.category;
    filtersEl.querySelectorAll(".chip").forEach(function (c) {
      c.setAttribute("aria-pressed", String(c === b));
    });
    render();
  });

  var t;
  searchEl.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(function () { state.query = searchEl.value.trim().toLowerCase(); render(); }, 120);
  });

  function card(r) {
    var dateline = [r.location, formatDate(r.date)].filter(Boolean).join(", ");
    var link = r.link
      ? '<a class="release__link" href="' + esc(r.link) + '" target="_blank" rel="noopener">Read release <span aria-hidden="true">↗</span></a>'
      : "";
    return (
      '<article class="release">' +
        (r.sample ? '<span class="release__sample">Sample</span>' : "") +
        '<div class="release__top"><span class="release__immediate">For immediate release</span>' +
        '<span class="release__cat">' + esc(r.category) + "</span></div>" +
        '<p class="release__dateline">' + esc(dateline) + " —</p>" +
        '<h3 class="release__title">' + esc(r.title) + "</h3>" +
        (r.summary ? '<p class="release__summary">' + esc(r.summary) + "</p>" : "") +
        '<div class="release__foot"><span class="release__org">' + esc(r.org) + "</span>" + link + "</div>" +
        '<span class="release__end" aria-hidden="true">###</span>' +
      "</article>"
    );
  }

  function render() {
    var q = state.query;
    var list = data.filter(function (r) {
      var inCat = state.category === "All" || r.category === state.category;
      if (!inCat) return false;
      if (!q) return true;
      return [r.title, r.summary, r.org, r.location, r.category].join(" ").toLowerCase().indexOf(q) !== -1;
    });
    grid.innerHTML = list.map(card).join("");
    Array.prototype.forEach.call(grid.children, function (el, i) { el.style.animationDelay = i * 50 + "ms"; });
    countEl.textContent = "Showing " + list.length + " of " + data.length + " release" + (data.length === 1 ? "" : "s");
    emptyEl.hidden = list.length !== 0;
  }

  render();
})();
