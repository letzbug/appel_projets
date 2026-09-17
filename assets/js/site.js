/* =========================================================================
   UniPop · Appel à concepts 2026 — comportements de la page
   Sans dépendance externe. Tout est facultatif : si ce fichier ne se charge
   pas, la page reste lisible et tous les liens fonctionnent.
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     1. Navigation : ombre au défilement, barre de progression, menu mobile
     --------------------------------------------------------------------- */
  var nav = document.querySelector(".nav");
  var progress = document.querySelector(".nav__progress");

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("scrolled", y > 40);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var burger = document.querySelector(".burger");
  var links = document.querySelector(".nav__links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------------------------------------------------------------
     2. Révélation au défilement
     --------------------------------------------------------------------- */
  var revealables = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduced) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (el) {
      // décalage en cascade entre éléments frères
      if (!el.style.getPropertyValue("--d")) {
        var sibs = el.parentNode ? el.parentNode.querySelectorAll(":scope > .reveal") : [];
        var i = Array.prototype.indexOf.call(sibs, el);
        if (i > 0) el.style.setProperty("--d", Math.min(i, 6) * 90 + "ms");
      }
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
     3. Compte à rebours
     Les dates butoirs sont définies dans l'attribut data-deadline des
     éléments .count (format ISO, avec le décalage horaire).
     --------------------------------------------------------------------- */
  var counters = document.querySelectorAll("[data-deadline]");

  function plural(n, one, many) { return n === 1 ? one : many; }

  function tick() {
    var now = Date.now();
    Array.prototype.forEach.call(counters, function (el) {
      var target = Date.parse(el.getAttribute("data-deadline"));
      var out = el.querySelector(".count__value");
      if (!out || isNaN(target)) return;
      var diff = target - now;
      if (diff <= 0) {
        el.classList.add("is-over");
        out.textContent = out.getAttribute("data-over") || "Clôturé";
        return;
      }
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      if (days >= 1) {
        out.innerHTML = "J−" + days + " <small>" + hours + " h</small>";
      } else {
        out.innerHTML = hours + " h <small>" + mins + " " + plural(mins, "min", "min") + "</small>";
      }
    });
  }
  if (counters.length) { tick(); setInterval(tick, 30000); }

  /* ---------------------------------------------------------------------
     4. Carte du Luxembourg en trame de points
     Le contour est fourni en coordonnées projetées ; les points sont
     générés ici pour garder le HTML lisible.
     --------------------------------------------------------------------- */
  var map = document.querySelector(".map[data-map]");
  if (map) {
    var POLY = [[194,14],[212,69.8],[198.5,125.6],[225.5,181.4],[261.5,230.2],[324.5,265],
      [365,306.9],[374,348.7],[333.5,404.5],[306.5,453.3],[297.5,509.1],[257,516.1],
      [216.5,488.2],[176,516.1],[126.5,495.2],[90.5,488.2],[41,467.3],[14,453.3],
      [59,411.5],[77,362.7],[63.5,313.8],[90.5,272],[59,223.2],[41,174.4],[14,118.6],
      [68,76.8],[126.5,48.9],[162.5,27.9]];
    var VW = 388, VH = 530, STEP = 11, NS = "http://www.w3.org/2000/svg";

    function inside(x, y) {
      var ins = false, n = POLY.length, j = n - 1;
      for (var i = 0; i < n; i++) {
        var xi = POLY[i][0], yi = POLY[i][1], xj = POLY[j][0], yj = POLY[j][1];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
        j = i;
      }
      return ins;
    }

    var layer = map.querySelector(".map__dots");
    var dots = [];
    if (layer) {
      var frag = document.createDocumentFragment();
      var tipX = POLY[0][0], tipY = POLY[0][1], row = 0;
      for (var y = STEP * 0.5; y < VH; y += STEP * 0.866, row++) {
        for (var x = 4 + (row % 2 ? STEP / 2 : 0); x < VW; x += STEP) {
          if (!inside(x, y)) continue;
          var c = document.createElementNS(NS, "circle");
          c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 2.6);
          c.setAttribute("class", "map__dot");
          var d = Math.hypot(x - tipX, y - tipY) / 520;
          c.style.setProperty("--d", Math.round(d * 900) + "ms");
          frag.appendChild(c);
          dots.push({ el: c, x: x, y: y });
        }
      }
      layer.appendChild(frag);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { map.classList.add("in"); obs.disconnect(); }
        });
      }, { threshold: 0.2 }).observe(map);
    } else {
      map.classList.add("in");
    }

    // légère réaction au passage de la souris (pas sur écran tactile)
    var svg = map.querySelector("svg");
    if (svg && dots.length && !reduced && window.matchMedia("(hover: hover)").matches) {
      var lit = [], queued = false, px = 0, py = 0;
      function paint() {
        queued = false;
        var box = svg.getBoundingClientRect();
        var sx = VW / box.width, sy = VH / box.height;
        var mx = (px - box.left) * sx, my = (py - box.top) * sy;
        lit.forEach(function (d) { d.el.classList.remove("near"); d.el.setAttribute("r", 2.6); });
        lit = [];
        for (var i = 0; i < dots.length; i++) {
          var d = dots[i];
          if (Math.abs(d.x - mx) > 62 || Math.abs(d.y - my) > 62) continue;
          if (Math.hypot(d.x - mx, d.y - my) < 62) {
            d.el.classList.add("near"); d.el.setAttribute("r", 3.4); lit.push(d);
          }
        }
      }
      svg.addEventListener("pointermove", function (e) {
        px = e.clientX; py = e.clientY;
        if (!queued) { queued = true; requestAnimationFrame(paint); }
      });
      svg.addEventListener("pointerleave", function () {
        lit.forEach(function (d) { d.el.classList.remove("near"); d.el.setAttribute("r", 2.6); });
        lit = [];
      });
    }
  }

  /* ---------------------------------------------------------------------
     5. Transition colorée entre les pages
     --------------------------------------------------------------------- */
  var wipe = document.querySelector(".wipe");
  if (wipe && !reduced) {
    // rideau qui se retire à l'arrivée
    if (sessionStorage.getItem("unipop:wipe")) {
      sessionStorage.removeItem("unipop:wipe");
      wipe.style.background = sessionStorage.getItem("unipop:wipeColor") || "";
      wipe.classList.add("in");
      setTimeout(function () { wipe.classList.remove("in"); }, 600);
    }
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (!/^[a-z0-9_\-]+\.html$/i.test(href)) return;
      e.preventDefault();
      var color = a.getAttribute("data-wipe") || getComputedStyle(document.body).getPropertyValue("--accent");
      wipe.style.background = color;
      sessionStorage.setItem("unipop:wipe", "1");
      sessionStorage.setItem("unipop:wipeColor", color);
      wipe.classList.add("out");
      setTimeout(function () { window.location.href = href; }, 380);
    });
  }
})();
