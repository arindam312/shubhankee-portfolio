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
    var impact = r.impact
      ? '<span class="release__impact">' + esc(r.impact) + "</span>"
      : "";
    return (
      '<article class="release" data-id="' + esc(r.id) + '">' +
        (r.sample ? '<span class="release__sample">Sample</span>' : "") +
        '<div class="release__top">' +
          '<span class="release__immediate">For immediate release</span>' +
          '<span class="release__cat">' + esc(r.category) + "</span>" +
        "</div>" +
        '<p class="release__dateline">' + esc(dateline) + " —</p>" +
        '<h3 class="release__title">' + esc(r.title) + "</h3>" +
        (r.summary ? '<p class="release__summary">' + esc(r.summary) + "</p>" : "") +
        impact +
        '<div class="release__foot">' +
          '<span class="release__org">' + esc(r.org) + "</span>" +
          '<button type="button" class="release__btn" data-open-release="' + esc(r.id) + '">Read release →</button>' +
        "</div>" +
        '<span class="release__end" aria-hidden="true">###</span>' +
      "</article>"
    );
  }

  /* =========================================================
     Press Release Reader Modal
     ========================================================= */
  var modal = document.getElementById("reader-modal");
  var mOrg = document.getElementById("reader-org");
  var mCat = document.getElementById("reader-category");
  var mTitle = document.getElementById("reader-title");
  var mSubhead = document.getElementById("reader-subhead");
  var mContent = document.getElementById("reader-content");
  var mBoilerplate = document.getElementById("reader-boilerplate");
  var mMedia = document.getElementById("reader-media");
  var mCloseBtn = document.getElementById("reader-close-btn");
  var mCopyBtn = document.getElementById("reader-copy-btn");
  var mPrintBtn = document.getElementById("reader-print-btn");
  var currentActiveRelease = null;

  function openReader(id) {
    var item = data.find(function (r) { return r.id === id; });
    if (!item || !modal) return;
    currentActiveRelease = item;

    mOrg.textContent = item.org || "Official Wire Release";
    mCat.textContent = item.category || "General";
    mTitle.textContent = item.title || "";
    mSubhead.textContent = item.subhead || item.summary || "";
    
    var pars = (item.body && item.body.length) ? item.body : [item.summary];
    mContent.innerHTML = pars.map(function (p) {
      if (p.indexOf('"') !== -1 && p.length < 220) {
        return '<blockquote class="reader-quote">' + esc(p) + '</blockquote>';
      }
      return '<p>' + esc(p) + '</p>';
    }).join("");

    mBoilerplate.innerHTML = item.boilerplate
      ? '<strong>Official Boilerplate:</strong><br />' + esc(item.boilerplate)
      : "";
    mBoilerplate.style.display = item.boilerplate ? "block" : "none";

    mMedia.innerHTML = item.mediaContact
      ? '<strong>Media Inquiries:</strong> ' + esc(item.mediaContact)
      : "";
    mMedia.style.display = item.mediaContact ? "block" : "none";

    modal.hidden = false;
    requestAnimationFrame(function () {
      modal.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
  }

  function closeReader() {
    if (!modal) return;
    modal.classList.remove("is-open");
    setTimeout(function () {
      modal.hidden = true;
      document.body.style.overflow = "";
      currentActiveRelease = null;
    }, 280);
  }

  if (grid) {
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-open-release]");
      if (btn) {
        e.preventDefault();
        openReader(btn.getAttribute("data-open-release"));
        return;
      }
      var cardEl = e.target.closest(".release");
      if (cardEl && cardEl.getAttribute("data-id")) {
        openReader(cardEl.getAttribute("data-id"));
      }
    });
  }

  if (mCloseBtn) mCloseBtn.addEventListener("click", closeReader);
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeReader();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) closeReader();
  });

  if (mCopyBtn) {
    mCopyBtn.addEventListener("click", function () {
      if (!currentActiveRelease) return;
      var text = [
        "FOR IMMEDIATE RELEASE",
        currentActiveRelease.title,
        currentActiveRelease.subhead || "",
        "",
        (currentActiveRelease.body || [currentActiveRelease.summary]).join("\n\n"),
        "",
        currentActiveRelease.boilerplate || "",
        currentActiveRelease.mediaContact || "",
        "###"
      ].join("\n");
      var original = mCopyBtn.textContent;
      navigator.clipboard.writeText(text).then(function () {
        mCopyBtn.textContent = "Copied ✓";
        setTimeout(function () { mCopyBtn.textContent = original; }, 1800);
      });
    });
  }

  if (mPrintBtn) {
    mPrintBtn.addEventListener("click", function () {
      window.print();
    });
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
