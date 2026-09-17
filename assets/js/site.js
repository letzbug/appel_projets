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
    // Umriss aus der amtlichen Silhouette abgeleitet (Douglas-Peucker, 338 Punkte)
    var POLY = [[139.8,12.0],[141.7,13.3],[143.6,24.8],[157.0,33.1],[165.3,29.9],[166.0,20.3],[172.4,22.2],[175.6,20.3],[183.2,26.1],[180.7,31.2],[185.8,36.3],[181.3,39.5],[180.0,43.9],[184.5,45.2],[188.3,49.1],[190.9,49.1],[190.2,52.9],[186.4,56.1],[186.4,59.3],[190.2,59.9],[189.0,65.0],[190.9,67.6],[186.4,69.5],[189.6,75.2],[187.7,76.5],[183.9,75.9],[184.5,84.2],[180.7,87.4],[181.9,89.3],[183.9,89.3],[183.2,86.8],[185.8,85.5],[188.3,88.7],[184.5,91.9],[183.9,95.1],[180.0,93.8],[179.4,98.9],[181.3,100.2],[182.6,97.0],[185.8,97.6],[184.5,102.7],[190.2,110.4],[189.0,118.1],[195.4,122.5],[195.4,125.1],[191.5,129.6],[197.3,132.1],[196.0,137.9],[194.1,140.4],[192.2,139.1],[191.5,141.1],[196.0,142.3],[199.8,148.1],[204.9,148.7],[203.0,160.2],[203.7,162.8],[207.5,165.3],[208.1,170.4],[210.7,171.7],[213.2,169.8],[211.3,167.9],[210.7,163.4],[212.6,160.9],[214.5,160.9],[217.7,173.0],[222.2,169.8],[224.1,173.6],[228.6,173.6],[226.7,177.5],[230.5,183.2],[229.2,184.5],[229.9,189.0],[226.7,192.2],[231.8,193.4],[233.1,196.0],[233.7,199.8],[231.8,202.4],[233.7,208.1],[240.7,212.0],[245.8,220.9],[251.6,224.1],[254.1,222.2],[258.6,224.7],[261.8,231.1],[265.6,228.6],[268.8,229.9],[268.8,234.3],[272.7,240.1],[272.0,249.0],[275.2,251.6],[279.7,248.4],[279.7,245.2],[281.6,242.6],[290.6,241.4],[307.8,262.4],[318.0,265.0],[320.6,268.8],[325.1,266.9],[331.4,268.2],[339.1,260.5],[346.8,268.2],[354.4,270.1],[357.0,275.2],[358.9,273.9],[361.5,267.6],[365.3,271.4],[362.8,277.1],[355.1,282.9],[355.1,284.8],[359.6,288.0],[357.0,295.0],[359.6,298.2],[360.2,302.7],[352.5,309.1],[353.2,323.1],[359.6,329.5],[356.4,330.8],[353.8,327.6],[350.6,327.0],[350.0,328.9],[355.1,335.3],[342.9,348.1],[334.0,351.2],[329.5,359.6],[320.6,367.2],[319.3,371.1],[324.4,372.3],[325.7,376.8],[320.6,388.3],[318.0,398.5],[307.8,411.9],[301.4,413.9],[296.9,418.3],[296.3,422.8],[299.5,429.2],[296.9,429.8],[294.4,427.9],[288.6,432.4],[299.5,443.2],[297.6,449.0],[288.0,460.5],[292.5,476.5],[293.8,489.2],[292.5,509.7],[288.6,508.4],[285.4,504.6],[277.8,504.6],[272.0,498.2],[268.2,496.3],[265.0,498.2],[263.7,497.6],[260.5,495.0],[261.2,491.2],[258.6,493.1],[257.3,492.4],[256.1,487.3],[253.5,486.1],[252.9,480.3],[245.8,479.7],[243.3,475.2],[239.4,476.5],[236.2,473.3],[234.3,476.5],[229.2,475.8],[225.4,478.4],[219.6,477.7],[216.4,479.0],[211.3,477.1],[208.1,477.7],[206.9,475.8],[197.9,480.9],[200.5,488.0],[197.9,487.3],[191.5,491.2],[191.5,488.6],[187.7,489.2],[186.4,487.3],[183.9,500.7],[180.0,502.7],[178.1,501.4],[175.6,502.0],[173.0,506.5],[174.3,514.2],[166.0,511.6],[164.1,505.9],[154.5,505.2],[148.1,518.0],[141.7,517.4],[140.4,512.9],[133.4,514.8],[129.6,511.6],[121.2,516.1],[120.0,515.4],[120.0,512.2],[122.5,512.2],[123.8,508.4],[122.5,507.1],[120.0,509.1],[117.4,505.2],[116.8,499.5],[118.1,495.6],[115.5,493.1],[113.6,486.7],[108.5,486.7],[102.7,482.2],[96.3,483.5],[91.2,480.9],[82.9,484.8],[77.8,482.9],[70.1,482.9],[65.7,477.7],[62.5,476.5],[62.5,473.3],[56.1,468.2],[56.1,463.1],[59.9,461.1],[57.4,454.1],[55.4,453.5],[47.8,456.7],[44.6,452.8],[51.0,447.7],[58.6,445.8],[59.9,444.5],[59.9,440.1],[66.3,436.9],[66.9,434.3],[71.4,431.1],[70.1,427.9],[72.1,424.7],[71.4,422.8],[63.7,423.4],[61.8,416.4],[73.3,408.1],[73.3,401.1],[77.8,395.3],[77.8,390.9],[81.0,388.9],[85.5,390.2],[87.4,388.3],[85.5,383.2],[85.5,377.4],[86.8,376.2],[85.5,374.2],[89.3,370.4],[86.1,370.4],[84.8,368.5],[80.4,367.2],[78.4,367.9],[75.2,364.0],[69.5,362.8],[67.6,358.9],[69.5,350.0],[78.4,339.8],[74.0,334.6],[74.0,331.4],[71.4,330.8],[68.9,327.6],[60.6,330.8],[51.6,329.5],[53.5,312.9],[48.4,309.1],[47.8,305.2],[44.6,300.8],[43.9,295.7],[37.6,286.7],[36.3,281.6],[34.4,279.7],[31.8,282.2],[29.9,281.0],[19.7,282.2],[17.8,272.0],[18.4,268.2],[15.8,265.0],[17.8,259.9],[13.9,251.6],[18.4,249.7],[17.8,244.6],[20.3,245.8],[22.2,243.9],[20.9,241.4],[17.1,240.7],[17.1,239.4],[22.9,237.5],[20.9,235.0],[20.3,227.3],[22.2,226.7],[24.8,229.2],[27.3,226.7],[29.2,230.5],[30.5,227.3],[33.1,226.7],[31.2,224.7],[33.1,222.2],[26.7,216.4],[20.9,215.2],[12.6,210.7],[12.0,208.1],[17.1,201.1],[23.5,197.3],[24.8,186.4],[29.2,180.7],[27.3,173.6],[29.2,171.1],[29.9,166.0],[31.2,164.7],[35.6,165.3],[38.8,162.1],[43.9,164.1],[45.2,158.9],[54.2,155.1],[58.0,150.0],[58.0,146.2],[56.7,144.9],[54.8,145.5],[50.3,140.4],[49.1,130.2],[56.7,125.7],[58.6,126.4],[66.9,118.7],[66.3,112.9],[70.8,108.5],[71.4,105.3],[68.2,101.4],[66.3,101.4],[65.0,97.0],[66.9,91.9],[70.8,88.0],[79.7,84.8],[79.1,77.2],[83.6,67.6],[83.6,61.8],[90.6,55.4],[112.3,47.1],[111.7,34.4],[114.9,31.8],[112.9,26.7],[115.5,18.4],[130.2,17.1]];
    var VW = 377, VH = 530, STEP = 11, NS = "http://www.w3.org/2000/svg";

    function inside(x, y) {
      var ins = false, n = POLY.length, j = n - 1;
      for (var i = 0; i < n; i++) {
        var xi = POLY[i][0], yi = POLY[i][1], xj = POLY[j][0], yj = POLY[j][1];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
        j = i;
      }
      return ins;
    }

    // Umrisslinie aus demselben Polygon zeichnen
    var outline = map.querySelector(".map__outline");
    if (outline) {
      outline.setAttribute("d", "M" + POLY.map(function (p) { return p[0] + " " + p[1]; }).join(" ") + " Z");
    }

    var layer = map.querySelector(".map__dots");
    var dots = [];
    if (layer) {
      var frag = document.createDocumentFragment();
      var tipX = 188, tipY = 12, row = 0;
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
     5. Frise chronologique : repère « aujourd'hui » et étapes passées
     --------------------------------------------------------------------- */
  var tl = document.querySelector("[data-timeline]");
  if (tl) {
    var nodes = Array.prototype.slice.call(tl.querySelectorAll(".tl__node"));
    var stamps = nodes.map(function (n) { return Date.parse(n.getAttribute("data-date") + "T23:59:59+01:00"); });
    var now = Date.now();

    nodes.forEach(function (n, i) {
      n.style.setProperty("--i", i);
      n.classList.add(stamps[i] < now ? "is-past" : "is-future");
    });

    var track = tl.querySelector(".tl__track");
    var rail = tl.querySelector(".tl__rail");
    var fill = tl.querySelector(".tl__fill");
    var marker = tl.querySelector(".tl__today");

    function layout() {
      if (!track || !rail) return;
      if (window.innerWidth < 900) { tl.classList.add("tl--stack"); return; }
      tl.classList.remove("tl--stack");
      var base = track.getBoundingClientRect();
      var xs = nodes.map(function (n) {
        var r = n.querySelector(".tl__dot").getBoundingClientRect();
        return r.left - base.left + r.width / 2;
      });
      rail.style.left = xs[0] + "px";
      rail.style.width = (xs[xs.length - 1] - xs[0]) + "px";

      var pos = xs[0];
      if (now >= stamps[stamps.length - 1]) {
        pos = xs[xs.length - 1];
      } else if (now > stamps[0]) {
        for (var i = 0; i < stamps.length - 1; i++) {
          if (now >= stamps[i] && now <= stamps[i + 1]) {
            var f = (now - stamps[i]) / (stamps[i + 1] - stamps[i]);
            pos = xs[i] + (xs[i + 1] - xs[i]) * f;
            break;
          }
        }
      }
      if (fill) fill.style.left = xs[0] + "px";
      tl.style.setProperty("--fill", Math.max(0, pos - xs[0]) + "px");
      if (marker) marker.style.left = pos + "px";
    }

    layout();
    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(layout, 150); });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { layout(); tl.classList.add("in"); obs.disconnect(); }
        });
      }, { threshold: 0.25 }).observe(tl);
    } else {
      tl.classList.add("in");
    }
  }

  /* ---------------------------------------------------------------------
     6. Transition colorée entre les pages
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
