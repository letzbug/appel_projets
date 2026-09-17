/* =========================================================================
   UniPop · Appel à concepts 2026 — bascule FR / EN
   Le français est écrit directement dans le HTML ; l'anglais vient de
   assets/js/lang-en.js (window.UNIPOP_EN), indexé par la clé data-i18n.
   Pour corriger une phrase anglaise : ouvrir lang-en.js, chercher la clé,
   modifier le texte. Le français se corrige directement dans le HTML.
   ========================================================================= */
(function () {
  "use strict";

  var STORE = "unipop:lang";
  var EN = window.UNIPOP_EN || {};
  var originals = null;

  function collect() {
    if (originals) return originals;
    originals = [];
    var nodes = document.querySelectorAll("[data-i18n],[data-i18n-html]");
    Array.prototype.forEach.call(nodes, function (el) {
      var html = el.hasAttribute("data-i18n-html");
      originals.push({
        el: el,
        key: el.getAttribute(html ? "data-i18n-html" : "data-i18n"),
        html: html,
        fr: html ? el.innerHTML : el.textContent
      });
    });
    return originals;
  }

  function apply(lang) {
    var items = collect();
    items.forEach(function (item) {
      var value = lang === "en" ? EN[item.key] : item.fr;
      if (value === undefined || value === null) return;
      if (item.html) el_html(item.el, value); else item.el.textContent = value;
    });
    document.documentElement.setAttribute("lang", lang);
    if (lang === "en" && EN["doc.title"]) document.title = EN["doc.title"];
    if (lang === "fr" && document.documentElement.getAttribute("data-title-fr")) {
      document.title = document.documentElement.getAttribute("data-title-fr");
    }
    Array.prototype.forEach.call(document.querySelectorAll(".lang button"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    });
    try { localStorage.setItem(STORE, lang); } catch (e) {}
  }

  function el_html(el, value) { el.innerHTML = value; }

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest(".lang button") : null;
    if (!b) return;
    apply(b.getAttribute("data-lang"));
  });

  document.documentElement.setAttribute("data-title-fr", document.title);

  var saved;
  try { saved = localStorage.getItem(STORE); } catch (e) {}
  if (!saved && (navigator.language || "").slice(0, 2) === "en") saved = "en";
  if (saved === "en") apply("en");
})();
