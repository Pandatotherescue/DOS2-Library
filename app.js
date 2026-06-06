/* Rivellon Crafting Codex — app logic */
(function () {
  "use strict";

  var RECIPES = window.RECIPES || [];
  var NOTES = window.RECIPE_NOTES || {};

  /* ---------------- Crafting-station detection ---------------- */
  var STATION_PAT = /(oven|boiling pot|cooking pot|cooking station|campfire|mortar and pestle|mortar & pestle|anvil|bench saw|beehive|\(well\)|oil pump|whetstone|barrel|crafter's kit)/i;
  function isStation(name) {
    return STATION_PAT.test(name) || /^\(.*\)$/.test(name.trim());
  }

  /* ---------------- Build the canonical category order ---------------- */
  var CAT_ORDER = [];
  RECIPES.forEach(function (r) { if (CAT_ORDER.indexOf(r.category) === -1) CAT_ORDER.push(r.category); });

  /* ---------------- Themed icon engine (no external assets) ---------------- */
  // Maps reagent name -> an icon key + colour, purely from keywords.
  function classify(name) {
    var n = name.toLowerCase();
    var t = function (re) { return re.test(n); };
    if (t(/source orb|sovereign|source/)) return ["orb", "var(--source)"];
    if (t(/fire essence|flame|fire arrow|firestorm|fire rune|pyro/)) return ["flame", "var(--fire)"];
    if (t(/water essence|water arrow|frost|ice|freezing|snow|hydro/)) return ["drop", "var(--water)"];
    if (t(/air essence|shocking|thunder|lightning|electric|wind|aero/)) return ["bolt", "var(--air)"];
    if (t(/earth essence|poison|venom|ooze|toxic|acid|geo/)) return ["leaf", "var(--earth)"];
    if (t(/shadow essence|tormented soul|necro|death|grave|shroud/)) return ["skull", "var(--necro)"];
    if (t(/life essence|healing|vitality|blood rose|resurrection/)) return ["heart", "var(--blood)"];
    if (t(/essence/)) return ["spark", "var(--source)"];
    if (t(/mushroom|agaric|boletus|chanterelle|jellyroom|puffball|deceiver|whisperwood|calocera|farhangite|trumpet|amadouvier|guepinia|bluegill|penny bun|drudanae|drudenae|blood rose|yarrow|herb|drudae/)) return ["mushroom", "var(--poly)"];
    if (t(/bone|skull|fang|tusk|tooth|antler|claw|sinew|intestine|giblet|disembodied|eye|fishbone|arthropod/)) return ["bone", "#cfc4a6"];
    if (t(/water|milk|beer|wine|oil|honey|juice|lemonade|tea|porridge|soup|sauce|broth/)) return ["drop", "var(--water)"];
    if (t(/bottle|flask|jar|cup|mug|canister|bucket|vial|potion|elixir|draught|perfume/)) return ["bottle", "var(--ink-dim)"];
    if (t(/metal|nails|plate|anvil|hammer|tongs|pincers|chain|sword|dagger|knife|shiv|blade|sharp|axe|shears|needle/)) return ["anvil", "#a9b0bb"];
    if (t(/rune|pixie dust|stardust|bonedust|gem|bead|gold|orb of/)) return ["gem", "var(--gold-bright)"];
    if (t(/leather|hide|scale|fur|cloth|linen|yarn|wool|thread|rope|bowstring|fabric|silk|pillow|handkerchief|panties|socks|sock/)) return ["cloth", "var(--earth)"];
    if (t(/wood|branch|stick|log|plank|chips|pulp|twig/)) return ["wood", "#9b7a4d"];
    if (t(/paper|parchment|scroll|skillbook|quill|cover|book/)) return ["scroll", "#d8cba4"];
    if (t(/arrow/)) return ["arrow", "var(--ink)"];
    if (t(/grenade|bomb|trap|fuse|flashbang|taser|smoke/)) return ["bomb", "var(--fire)"];
    if (t(/rock|stone|clay|slime|goo|piece of rock|crystal/)) return ["rock", "#8c8474"];
    if (t(/fish|herring|mackerel|snapper|chub|plaice|crab|starfish|shell|pilgrim/)) return ["fish", "var(--water)"];
    if (t(/apple|orange|lemon|grape|tomato|potato|pumpkin|wheat|flour|bread|dough|cheese|egg|meat|mutton|dinner|pie|pizza|fries|food|pepper|garlic|carrot|stew/)) return ["food", "var(--fire)"];
    if (t(/feather|fancy feather/)) return ["feather", "var(--air)"];
    if (t(/armour|armor|shield|helmet|gloves|boots|shoes|belt|amulet|ring|pants|trinket|mask|upperbody/)) return ["shield", "#a9b0bb"];
    if (t(/weapon|wand|staff|crossbow|bow|harpoon|club/)) return ["sword", "#a9b0bb"];
    if (t(/eternal|artefact|artifact|tablet/)) return ["gem", "var(--source)"];
    if (t(/rabbit|rat|sheep|chicken|animal|hair|toy|chew/)) return ["paw", "var(--earth)"];
    if (t(/key|lockpick|soap|doll|figurine/)) return ["key", "var(--gold-bright)"];
    return ["dot", "var(--ink-dim)"];
  }

  var ICONS = {
    orb: '<circle cx="12" cy="12" r="7" fill="rgba(79,214,182,.18)"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/><path d="M12 5v-2M12 21v-2M5 12h-2M21 12h-2"/>',
    flame: '<path d="M12 3c1 4-3 5-3 9a3 3 0 006 0c0-1.6-.8-2.5-1.2-3.5C15 11 16 13 16 15a4 4 0 11-8 0c0-4 4-6 4-12z" fill="rgba(224,138,74,.18)"/>',
    drop: '<path d="M12 3c4 5 6 8 6 11a6 6 0 11-12 0c0-3 2-6 6-11z" fill="rgba(90,169,214,.18)"/>',
    bolt: '<path d="M13 2L5 13h5l-1 9 8-12h-5l1-8z" fill="rgba(143,182,232,.2)"/>',
    leaf: '<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" fill="rgba(176,138,79,.18)"/><path d="M5 19C9 15 13 11 17 8"/>',
    skull: '<path d="M12 3a8 8 0 00-5 14v3h10v-3a8 8 0 00-5-14z" fill="rgba(155,123,196,.18)"/><circle cx="9" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
    heart: '<path d="M12 20S4 14 4 8.5A3.5 3.5 0 0112 6a3.5 3.5 0 018 2.5C20 14 12 20 12 20z" fill="rgba(182,72,63,.2)"/>',
    spark: '<path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="rgba(79,214,182,.2)"/>',
    mushroom: '<path d="M4 11a8 8 0 0116 0z" fill="rgba(143,214,154,.2)"/><path d="M10 11v6a2 2 0 004 0v-6"/>',
    bone: '<path d="M6 6a2 2 0 10-2 2l9 9a2 2 0 102 2 2 2 0 102-2l-9-9a2 2 0 10-2-2z" fill="rgba(207,196,166,.15)"/>',
    bottle: '<path d="M10 2h4v3l1 2v13a2 2 0 01-2 2h-2a2 2 0 01-2-2V7l1-2z" fill="rgba(179,168,136,.12)"/><path d="M9 12h6"/>',
    anvil: '<path d="M3 8h11a4 4 0 01-4 4H9v3h6v2H6v-2l1-2a6 6 0 01-4-5z" fill="rgba(169,176,187,.16)"/>',
    gem: '<path d="M6 3h12l3 5-9 13L3 8z" fill="rgba(232,196,105,.2)"/><path d="M3 8h18M9 3l-3 5 6 13 6-13-3-5"/>',
    cloth: '<path d="M4 5l4-2 4 2 4-2 4 2v3l-2 1v10H6V9L4 8z" fill="rgba(176,138,79,.16)"/>',
    wood: '<rect x="9" y="3" width="6" height="18" rx="3" fill="rgba(155,122,77,.18)"/><path d="M11 7h2M11 12h2M11 17h2"/>',
    scroll: '<path d="M7 3h10a2 2 0 012 2v12a3 3 0 01-3 3H7a2 2 0 01-2-2V5a2 2 0 012-2z" fill="rgba(216,203,164,.14)"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    arrow: '<path d="M3 12h14M13 8l5 4-5 4M17 5l3-1-1 3" fill="none"/>',
    bomb: '<circle cx="11" cy="14" r="7" fill="rgba(224,138,74,.18)"/><path d="M16 8l3-3M19 5l1 1M17 4l2 1"/>',
    rock: '<path d="M5 16l3-8 6-2 5 5-2 7z" fill="rgba(140,132,116,.18)"/>',
    fish: '<path d="M3 12c4-5 11-5 15 0-4 5-11 5-15 0z" fill="rgba(90,169,214,.18)"/><path d="M18 12l3-3v6zM8 12h.01"/>',
    food: '<circle cx="12" cy="12" r="8" fill="rgba(224,138,74,.16)"/><path d="M12 4v8l5 3"/>',
    feather: '<path d="M20 4C9 5 6 12 5 19l3-3 2 2 2-2 2 2 1-2 5-5z" fill="rgba(143,182,232,.18)"/>',
    shield: '<path d="M12 3l7 3v6c0 5-3 7-7 9-4-2-7-4-7-9V6z" fill="rgba(169,176,187,.16)"/>',
    sword: '<path d="M14 3l7 7-2 2-7-7zM12 5l-9 9 3 3 9-9M4 17l-1 4 4-1" fill="none"/>',
    paw: '<circle cx="8" cy="9" r="1.8"/><circle cx="16" cy="9" r="1.8"/><circle cx="6" cy="14" r="1.6"/><circle cx="18" cy="14" r="1.6"/><path d="M9 17a3 3 0 016 0c0 2-6 2-6 0z" fill="rgba(176,138,79,.2)"/>',
    key: '<circle cx="8" cy="8" r="4" fill="rgba(232,196,105,.18)"/><path d="M11 11l8 8-2 2M17 19l2-2"/>',
    dot: '<circle cx="12" cy="12" r="6" fill="rgba(179,168,136,.12)"/>'
  };

  function iconSVG(name, size) {
    var c = classify(name);
    var body = ICONS[c[0]] || ICONS.dot;
    return '<svg class="ri" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' +
      c[1] + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:' + c[1] + '">' +
      body + '</svg>';
  }
  function resultIcon(name) {
    var c = classify(name);
    var body = ICONS[c[0]] || ICONS.dot;
    return '<svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="' + c[1] +
      '" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="color:' + c[1] +
      ';filter:drop-shadow(0 0 6px ' + c[1] + '55)">' + body + '</svg>';
  }

  /* ---------------- Reagent index ---------------- */
  // normalised reagent name -> { display, usedIn:Set(idx), producedBy:Set(idx) }
  var reagentIndex = {};
  function norm(s) { return s.toLowerCase().replace(/\s+/g, " ").trim(); }
  function reg(name, idx, role) {
    var k = norm(name);
    if (!reagentIndex[k]) reagentIndex[k] = { display: name, usedIn: [], producedBy: [] };
    reagentIndex[k][role].push(idx);
  }
  RECIPES.forEach(function (r, i) {
    reg(r.result, i, "producedBy");
    r.ingredients.forEach(function (ing) { reg(ing, i, "usedIn"); });
  });

  /* ---------------- State ---------------- */
  var state = { q: "", cat: "All", ck: true, hg: true, reagent: null };

  function modAllowed(r) {
    if (r.mod === "crafters_kit") return state.ck;
    if (r.mod === "herb_garden") return state.hg;
    return true;
  }

  /* ---------------- DOM refs ---------------- */
  var $ = function (s) { return document.querySelector(s); };
  var searchEl = $("#search"), clearEl = $("#clear"), resultsEl = $("#results"),
      contextEl = $("#context"), filtersEl = $("#filters"),
      tglCk = $("#tgl-ck"), tglHg = $("#tgl-hg"), backTop = $("#backTop");

  /* ---------------- Filter chips ---------------- */
  function buildFilters() {
    var groups = ["All", "Container", "Furniture", "Items", "Armour", "Armour Upgrade",
      "Weapon", "Weapon Upgrade", "Runes", "Arrowheads", "Arrows", "Grenades",
      "Potions", "Skillbooks", "Scrolls", "Consumable"];
    filtersEl.innerHTML = "";
    groups.forEach(function (g) {
      var chip = document.createElement("button");
      chip.className = "chip" + (state.cat === g ? " active" : "");
      chip.textContent = g;
      chip.addEventListener("click", function () {
        state.cat = g; refreshChips(); render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      filtersEl.appendChild(chip);
    });
  }
  function refreshChips() {
    [].forEach.call(filtersEl.children, function (c) {
      c.classList.toggle("active", c.textContent === state.cat);
    });
  }
  function catMatchesGroup(cat, group) {
    if (group === "All") return true;
    if (group === "Potions") return cat.indexOf("Potions") === 0;
    if (group === "Skillbooks") return cat.indexOf("Skillbooks") === 0;
    if (group === "Scrolls") return cat.indexOf("Scrolls") === 0;
    return cat === group;
  }

  /* ---------------- Matching ---------------- */
  function recipeMatchesQuery(r, q) {
    if (!q) return true;
    if (norm(r.result).indexOf(q) !== -1) return true;
    for (var i = 0; i < r.ingredients.length; i++)
      if (norm(r.ingredients[i]).indexOf(q) !== -1) return true;
    if (r.effect && norm(r.effect).indexOf(q) !== -1) return true;
    return false;
  }

  function highlight(text, q) {
    if (!q) return escapeHTML(text);
    var lc = text.toLowerCase(), idx = lc.indexOf(q);
    if (idx === -1) return escapeHTML(text);
    return escapeHTML(text.slice(0, idx)) + "<mark>" +
      escapeHTML(text.slice(idx, idx + q.length)) + "</mark>" +
      escapeHTML(text.slice(idx + q.length));
  }
  function escapeHTML(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- Card rendering ---------------- */
  function cardHTML(r, q, highlightReagent) {
    var modClass = r.mod === "crafters_kit" ? " mod-ck" : r.mod === "herb_garden" ? " mod-hg" : "";
    var modTag = r.mod === "crafters_kit"
      ? '<span class="mod-tag ck" title="' + NOTES.crafters_kit + '">Crafter\'s Kit</span>'
      : r.mod === "herb_garden"
      ? '<span class="mod-tag hg" title="' + NOTES.herb_garden + '">Herb Gardens</span>' : "";

    var ings = r.ingredients.map(function (ing, k) {
      var station = isStation(ing);
      var hl = (q && norm(ing).indexOf(q) !== -1) || (highlightReagent && norm(ing) === highlightReagent);
      var label = hl ? "<mark>" + escapeHTML(ing) + "</mark>" : escapeHTML(ing);
      var chip = '<span class="reagent' + (station ? " is-station" : "") +
        '" data-reagent="' + escapeHTML(ing) + '" title="' + escapeHTML(ing) + ' — click to find all recipes using it">' +
        iconSVG(ing, 20) + '<span class="rt">' + label + "</span></span>";
      return (k > 0 ? '<span class="plus">+</span>' : "") + chip;
    }).join("");

    var resultName = highlightReagent && norm(r.result) === highlightReagent
      ? "<b>" + escapeHTML(r.result) + "</b>"
      : (q ? highlight(r.result, q) : escapeHTML(r.result));

    var effect = r.effect ? '<div class="effect">' + escapeHTML(r.effect) + "</div>" : "";

    return '<article class="card' + modClass + '">' +
      '<div class="result-row">' + resultIcon(r.result) +
        '<div class="result-name">' + resultName + modTag + "</div></div>" +
        effect +
      '<div class="recipe-divider"><span class="lbl">Reagents</span><span class="ln"></span></div>' +
      '<div class="ingredients">' + ings + "</div>" +
      "</article>";
  }

  /* ---------------- Main render ---------------- */
  function render() {
    var q = norm(state.q);
    contextEl.innerHTML = "";

    // gather candidate recipes
    var visible = [];
    RECIPES.forEach(function (r, i) {
      if (!modAllowed(r)) return;
      if (!catMatchesGroup(r.category, state.cat)) return;
      if (state.reagent) {
        var k = state.reagent;
        var entry = reagentIndex[k];
        if (!entry) return;
        if (entry.usedIn.indexOf(i) === -1 && entry.producedBy.indexOf(i) === -1) return;
      } else if (!recipeMatchesQuery(r, q)) return;
      visible.push({ r: r, i: i });
    });

    // Context bar
    if (state.reagent && reagentIndex[state.reagent]) {
      var disp = reagentIndex[state.reagent].display;
      contextEl.innerHTML =
        '<div class="reagent-banner">' + iconSVG(disp, 22) +
        '<span class="ttl">Reagent:</span> <span class="name">' + escapeHTML(disp) + "</span>" +
        '<button class="chip" id="exitReagent" style="margin-left:6px">&times; clear reagent</button></div>' +
        '<div class="count">' + visible.length + " recipe" + (visible.length === 1 ? "" : "s") + " involve this reagent</div>";
    } else {
      var label = q ? visible.length + " result" + (visible.length === 1 ? "" : "s") + ' for “' + escapeHTML(state.q.trim()) + '”'
        : visible.length + " recipes in the codex";
      if (state.cat !== "All") label += " · " + state.cat;
      contextEl.innerHTML = '<div class="count">' + label + "</div>";
    }

    // Empty
    if (visible.length === 0) {
      resultsEl.innerHTML = '<div class="empty"><div class="big">No recipes found</div>' +
        "Try a different reagent or recipe name — or clear the search to browse the whole codex.</div>";
      wireReagentClicks();
      return;
    }

    // Reagent view: split into "used in" and "produced by"
    if (state.reagent) {
      var entry = reagentIndex[state.reagent];
      var usedIn = visible.filter(function (v) { return entry.usedIn.indexOf(v.i) !== -1; });
      var produced = visible.filter(function (v) {
        return entry.producedBy.indexOf(v.i) !== -1 && entry.usedIn.indexOf(v.i) === -1;
      });
      var html = "";
      if (usedIn.length) {
        html += sectionHTML("Recipes that use " + entry.display, usedIn, q, state.reagent);
      }
      if (produced.length) {
        html += sectionHTML("Ways to craft " + entry.display, produced, q, state.reagent);
      }
      resultsEl.innerHTML = html;
      wireReagentClicks();
      return;
    }

    // Normal view: group by category in canonical order
    var byCat = {};
    visible.forEach(function (v) { (byCat[v.r.category] = byCat[v.r.category] || []).push(v); });
    var html = "";
    CAT_ORDER.forEach(function (cat) {
      if (!byCat[cat]) return;
      html += sectionHTML(cat, byCat[cat], q, null);
    });
    resultsEl.innerHTML = html;
    wireReagentClicks();
  }

  function sectionHTML(title, items, q, reagentKey) {
    var cards = items.map(function (v) { return cardHTML(v.r, q, reagentKey); }).join("");
    return '<div class="cat-head"><h2>' + escapeHTML(title) + "</h2><div class=\"line\"></div>" +
      '<span class="tally">' + items.length + "</span></div>" +
      '<div class="grid">' + cards + "</div>";
  }

  /* ---------------- Reagent click wiring ---------------- */
  function wireReagentClicks() {
    [].forEach.call(document.querySelectorAll(".reagent"), function (el) {
      el.addEventListener("click", function () {
        var name = el.getAttribute("data-reagent");
        focusReagent(name);
      });
    });
    var ex = document.getElementById("exitReagent");
    if (ex) ex.addEventListener("click", clearReagent);
  }

  function focusReagent(name) {
    state.reagent = norm(name);
    state.q = "";
    searchEl.value = "";
    clearEl.style.display = "none";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function clearReagent() {
    state.reagent = null;
    render();
  }

  /* ---------------- Events ---------------- */
  var debounceTimer;
  searchEl.addEventListener("input", function () {
    state.reagent = null; // typing exits reagent-focus mode
    state.q = searchEl.value;
    clearEl.style.display = state.q ? "flex" : "none";
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, 90);
  });
  searchEl.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { searchEl.value = ""; state.q = ""; state.reagent = null; clearEl.style.display = "none"; render(); }
  });
  clearEl.addEventListener("click", function () {
    searchEl.value = ""; state.q = ""; state.reagent = null; clearEl.style.display = "none"; render(); searchEl.focus();
  });
  tglCk.addEventListener("change", function () { state.ck = tglCk.checked; render(); });
  tglHg.addEventListener("change", function () { state.hg = tglHg.checked; render(); });

  window.addEventListener("scroll", function () {
    backTop.style.display = window.scrollY > 600 ? "flex" : "none";
  });
  backTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------------- Init ---------------- */
  buildFilters();
  render();
})();
