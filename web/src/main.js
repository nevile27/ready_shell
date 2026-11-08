import MiniSearch from "minisearch";
import {
  LANGS, uiText, statusName, statusDescription, themeCopy, familySummary, prefaceOf, noteOf, initialLang,
} from "./i18n.js";

const state = {
  catalog: null,
  query: "",
  family: "debian",
  status: "courante",
  theme: "tous",
  selected: null,
  sub: null,
  lang: initialLang(),
  dict: {},
};

function t(key) {
  return uiText(state.lang, key);
}

function L(value) {
  if (value == null) return "";
  const text = String(value);
  if (state.lang === "fr") return text;
  return state.dict[text] || text;
}

const $ = (id) => document.getElementById(id);
const listEl = $("list");
const detailEl = $("detail");
const themesEl = $("themes");
const qEl = $("q");
const familyEl = $("family");
const statusEl = $("status");

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    area.remove();
    return ok;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const HOMONYMS = new Set(["date", "test", "type", "source", "alias", "du"]);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildPhrases() {
  const phrases = [];
  for (const command of state.catalog.commands) {
    if (command.name.length >= 2 && !HOMONYMS.has(command.name)) phrases.push(command.name);
    for (const sub of command.subcommands ?? []) phrases.push(sub.label || `${command.name} ${sub.name}`);
  }
  phrases.sort((a, b) => b.length - a.length || a.localeCompare(b, "fr"));
  state.commandNames = new Set(
    state.catalog.commands.map((command) => command.name).filter((name) => !HOMONYMS.has(name)),
  );
  state.phraseRe = new RegExp(
    `(^|[^\\p{L}\\p{N}_./-])(${phrases.map(escapeRegExp).join("|")})(?![\\p{L}\\p{N}_-])`,
    "gu",
  );
}

function highlightPhrases(raw) {
  if (!state.phraseRe) return escapeHtml(raw);
  state.phraseRe.lastIndex = 0;
  let out = "";
  let last = 0;
  for (const match of raw.matchAll(state.phraseRe)) {
    const phrase = match[2];
    const start = match.index + match[1].length;
    out += escapeHtml(raw.slice(last, start));
    out += `<code class="cmd">${escapeHtml(phrase)}</code>`;
    last = start + phrase.length;
  }
  return out + escapeHtml(raw.slice(last));
}

function isChip(text) {
  const names = state.commandNames;
  if (!names) return false;
  if (names.has(text) || text.startsWith("-")) return true;
  const head = text.split(/\s+/)[0];
  return names.has(head);
}

function rich(value) {
  const parts = String(value).split("`");
  return parts.map((part, index) => {
    if (index % 2 === 0) return highlightPhrases(part);
    const text = part.trim();
    const cls = isChip(text) ? "cmd" : "verb";
    return `<code class="${cls}">${escapeHtml(text)}</code>`;
  }).join("");
}

function familyById(id) {
  return state.catalog.families.find((family) => family.id === id);
}

function themeById(id) {
  return state.catalog.themes.find((theme) => theme.id === id);
}

function commandByName(name) {
  return state.catalog.commands.find((command) => command.name === name);
}

function invocation(command, sub) {
  return sub.label || `${command.name} ${sub.name}`;
}

function bestSubName(command, query = state.query) {
  if (!command?.subcommands?.length) return null;
  const q = query.trim().toLowerCase().replace(/\s+/g, " ");
  const commandName = command.name.toLowerCase();
  if (!q || q === commandName) return null;
  let best = null;
  let score = 0;
  for (const sub of command.subcommands) {
    const label = invocation(command, sub).toLowerCase();
    let next = 0;
    if (label === q) next = 200;
    else if (q.startsWith(`${commandName} `) && (label.startsWith(q) || q.startsWith(label))) next = 80 + Math.min(label.length, q.length);
    if (next > score) {
      score = next;
      best = sub.name;
    }
  }
  return best;
}

function isDeprecated(command, family = state.family) {
  const slots = family === "toutes"
    ? Object.values(command.availability)
    : [command.availability[family]];
  const flagged = slots.some((slot) => slot.status === "obsolète" || slot.status === "retirée");
  return flagged || (command.deprecated_options?.length ?? 0) > 0;
}

function statusOk(actual, wanted) {
  if (wanted === "tous") return true;
  if (wanted === "courante") return actual === "courante" || actual === "spécifique";
  return actual === wanted;
}

function matchesFilters(command) {
  if (state.theme === "obsolescence") {
    if (!isDeprecated(command)) return false;
  } else if (state.theme !== "tous" && !command.themes.includes(state.theme)) {
    return false;
  }
  if (state.family === "toutes" && state.status === "tous") return true;
  if (state.family === "toutes") {
    return Object.values(command.availability).some((slot) => statusOk(slot.status, state.status));
  }
  if (state.status === "tous") return command.availability[state.family].status !== "absente";
  return statusOk(command.availability[state.family].status, state.status);
}

function readHash() {
  const raw = location.hash.replace(/^#/, "");
  const params = new URLSearchParams(raw.startsWith("?") ? raw.slice(1) : raw);
  const langue = params.get("langue");
  if (langue === "fr" || langue === "en") state.lang = langue;
  state.query = params.get("q") ?? "";
  state.family = params.get("famille") ?? "debian";
  state.status = params.get("statut") ?? "courante";
  state.theme = params.get("theme") ?? "tous";
  state.selected = params.get("cmd");
  state.sub = params.get("sous");
  qEl.value = state.query;
  familyEl.value = state.family;
  statusEl.value = state.status;
}

function writeHash() {
  const params = new URLSearchParams();
  if (state.lang === "en") params.set("langue", "en");
  localStorage.setItem("ready-shell-lang", state.lang);
  if (state.query) params.set("q", state.query);
  if (state.family !== "debian") params.set("famille", state.family);
  if (state.status !== "courante") params.set("statut", state.status);
  if (state.theme !== "tous") params.set("theme", state.theme);
  if (state.selected) params.set("cmd", state.selected);
  if (state.selected && state.sub) params.set("sous", state.sub);
  const next = params.toString();
  const url = `${location.pathname}${location.search}${next ? `#?${next}` : "#"}`;
  if (`#${next ? `?${next}` : ""}` !== location.hash && location.hash !== (next ? `#?${next}` : "#")) {
    history.replaceState(null, "", url);
  }
}

function visibleCommands() {
  const base = state.catalog.commands.filter(matchesFilters);
  const query = state.query.trim();
  if (!query) {
    return base.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }
  const allowed = new Set(base.map((command) => command.name));
  const found = state.index.search(query, {
    prefix: true,
    fuzzy: query.length > 3 ? 0.15 : false,
    boost: { name: 5, summary: 2 },
  });
  const ranked = [];
  const seen = new Set();
  const exact = base.find((command) => command.name === query);
  if (exact) {
    ranked.push(exact);
    seen.add(exact.name);
  }
  for (const hit of found) {
    if (!allowed.has(hit.name) || seen.has(hit.name)) continue;
    ranked.push(commandByName(hit.name));
    seen.add(hit.name);
  }
  const needle = query.toLowerCase();
  for (const command of base) {
    if (seen.has(command.name)) continue;
    if (command.name.toLowerCase().includes(needle)) ranked.push(command);
  }
  return ranked;
}

function dotTitle(command, family) {
  const slot = command.availability[family.id];
  const pkg = slot.package ? `, paquet ${slot.package}` : "";
  return `${family.label} : ${slot.status}${pkg}`;
}

function renderThemes(visible) {
  const counts = new Map(state.catalog.themes.map((theme) => [theme.id, 0]));
  let all = 0;
  for (const command of state.catalog.commands) {
    const previous = state.theme;
    state.theme = "tous";
    const keep = matchesFilters(command);
    state.theme = previous;
    if (!keep) continue;
    all += 1;
    for (const id of command.themes) counts.set(id, (counts.get(id) ?? 0) + 1);
    if (isDeprecated(command)) counts.set("obsolescence", (counts.get("obsolescence") ?? 0) + 1);
  }
  const items = [
    { id: "tous", title: t("allBook"), summary: t("allBookSummary"), count: all },
    ...state.catalog.themes.map((theme) => {
      const copy = themeCopy(state.lang, theme.id, theme.title, theme.summary);
      return {
      id: theme.id,
      title: copy.title,
      summary: copy.summary,
      count: counts.get(theme.id) ?? 0,
    };
    }),
  ];
  themesEl.innerHTML = items.map((item) => `
    <button class="theme" type="button" data-theme="${escapeHtml(item.id)}" ${state.theme === item.id ? 'aria-current="true"' : ""}>
      <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.summary.replace(/\s+/g, " ").trim())}</small></span>
      <span class="count">${item.count}</span>
    </button>
  `).join("");
  void visible;
}

function renderList(commands) {
  if (commands.length === 0) {
    listEl.innerHTML = `<p class="empty">${escapeHtml(t("noMatch"))}</p>`;
    return;
  }
  const families = state.catalog.families;
  listEl.innerHTML = commands.map((command) => {
    const hint = bestSubName(command);
    const hintSub = hint ? command.subcommands.find((sub) => sub.name === hint) : null;
    return `
    <button class="row" type="button" data-cmd="${escapeHtml(command.name)}" ${state.selected === command.name ? 'aria-current="true"' : ""}>
      <span class="dots">${families.map((family) => `<i class="dot ${escapeHtml(command.availability[family.id].status)}" title="${escapeHtml(dotTitle(command, family))}"></i>`).join("")}</span>
      <b>${escapeHtml(command.name)}</b>
      <p>${escapeHtml(L(hintSub ? hintSub.summary : command.summary))}</p>
      ${hintSub ? `<p class="hint">${escapeHtml(invocation(command, hintSub))}</p>` : ""}
    </button>`;
  }).join("");
}

function versions(family) {
  return family.systems
    .map((system) => `${system.name} ${system.version}${system.codename ? ` « ${system.codename} »` : ""}`)
    .join(" · ");
}

function renderIntro() {
  const { catalog } = state;
  detailEl.innerHTML = `
    <div class="sheet">
    <p class="kicker">${escapeHtml(t("howToRead"))}</p>
    <h2>${escapeHtml(t("title"))}</h2>
    <p class="preface">${rich(prefaceOf(state.lang, catalog.preface))}</p>
    <h3 class="section">${escapeHtml(t("pinnedVersions"))}</h3>
    ${catalog.families.map((family) => `
      <p><strong>${escapeHtml(family.label)}</strong> — ${escapeHtml(versions(family))}</p>
      <p class="prose">${rich(familySummary(state.lang, family.id, family.summary.trim()))}</p>
    `).join("")}
    <h3 class="section">${escapeHtml(t("statusesTitle"))}</h3>
    <ul>
      ${Object.entries(catalog.statuses).map(([status, text]) => `<li><span class="badge ${escapeHtml(status)}">${escapeHtml(statusName(state.lang, status))}</span> ${rich(statusDescription(state.lang, status, text))}</li>`).join("")}
    </ul>
    <p class="meta">${catalog.commands.length} ${escapeHtml(t("dotsHint"))}</p>
    </div>
  `;
}

function exampleVisible(example) {
  if (!example.families || state.family === "toutes") return true;
  return example.families.includes(state.family);
}

let copyTargets = [];

function exampleBlocks(examples) {
  const visible = examples.filter(exampleVisible);
  if (!visible.length) return `<p class="empty">${escapeHtml(t("noExample"))}</p>`;
  return visible.map((example) => {
    const id = copyTargets.length;
    copyTargets.push(example.command);
    const families = example.families
      ? ` ${escapeHtml(t("familiesLabel"))} ${escapeHtml(example.families.map((familyId) => familyById(familyId).label).join(", "))}.`
      : "";
    return `
      <section class="example">
        <header>
          <h3>${escapeHtml(L(example.title))}</h3>
          <button class="copy" type="button" data-copy="${id}">${escapeHtml(t("copy"))}</button>
        </header>
        <pre>${escapeHtml(example.command)}</pre>
        <p>${rich(L(example.comment))}${families}</p>
      </section>`;
  }).join("");
}

function availabilityTable(command) {
  return `
    <table>
      <thead><tr><th>${escapeHtml(t("colFamily"))}</th><th>${escapeHtml(t("colStatus"))}</th><th>${escapeHtml(t("colPackage"))}</th><th>${escapeHtml(t("colNote"))}</th></tr></thead>
      <tbody>
        ${state.catalog.families.map((family) => {
          const slot = command.availability[family.id];
          return `<tr>
            <td>${escapeHtml(family.label)}<br><small>${escapeHtml(versions(family))}</small></td>
            <td><span class="badge ${escapeHtml(slot.status)}">${escapeHtml(statusName(state.lang, slot.status))}</span></td>
            <td class="pkg">${escapeHtml(slot.package ?? "—")}</td>
            <td>${rich(L(slot.note ?? ""))}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>`;
}

function renderDetail(command) {
  if (!command) {
    detailEl.innerHTML = `<p class="empty">${escapeHtml(t("missing"))}</p>`;
    return;
  }
  copyTargets = [];
  const themes = command.themes.map((id) => themeCopy(state.lang, id, themeById(id)?.title ?? id, "").title).join(" · ");
  const open = command.subcommands?.find((sub) => sub.name === state.sub) ?? null;
  const selectedFamily = state.family === "toutes" ? null : familyById(state.family);
  const selectedSlot = selectedFamily ? command.availability[selectedFamily.id] : null;
  detailEl.innerHTML = `
    <div class="sheet">
    <button class="back" type="button" id="back">${escapeHtml(t("back"))}</button>
    <p class="kicker">${escapeHtml(themes)}</p>
    <h2 class="cmd-title">${escapeHtml(command.name)}</h2>
    <p class="lede">${rich(L(command.summary))}</p>
    ${selectedSlot ? `<p class="family-now">${escapeHtml(selectedFamily.label)} · <span class="badge ${escapeHtml(selectedSlot.status)}">${escapeHtml(statusName(state.lang, selectedSlot.status))}</span>${selectedSlot.package ? ` · <code class="cmd">${escapeHtml(selectedSlot.package)}</code>` : ""}</p>` : ""}
    ${command.replaced_by ? `<p>${escapeHtml(t("replaceBy"))} <button class="linkish" type="button" data-jump="${escapeHtml(command.replaced_by)}">${escapeHtml(command.replaced_by)}</button></p>` : ""}
    <p class="prose">${rich(L(command.explanation))}</p>
    ${(command.context_notes ?? []).map((note, index) => `<div class="context">${rich(noteOf(state.lang, command.tags?.[index], note))}</div>`).join("")}
    ${(command.pitfalls ?? []).map((item) => `<div class="pitfall">${rich(L(item))}</div>`).join("")}
    ${(command.subcommands ?? []).length ? `
      <div class="subs">
        <h3 class="section">${escapeHtml(t("subs"))}</h3>
        ${command.subcommands.map((sub) => {
          const isOpen = open?.name === sub.name;
          return `
            <div class="sub ${isOpen ? "open" : ""}">
              <button class="subhit" type="button" data-sub="${escapeHtml(sub.name)}" aria-expanded="${isOpen}">
                <code class="cmd">${escapeHtml(invocation(command, sub))}</code>
                <span>${escapeHtml(L(sub.summary))}</span>
              </button>
              ${isOpen ? `
                <div class="subbody">
                  <p class="prose">${rich(L(sub.explanation))}</p>
                  ${(sub.pitfalls ?? []).map((item) => `<div class="pitfall">${rich(L(item))}</div>`).join("")}
                  ${exampleBlocks(sub.examples)}
                </div>` : ""}
            </div>`;
        }).join("")}
      </div>` : `
      <h3 class="section">${escapeHtml(t("examples"))}</h3>
      ${exampleBlocks(command.examples)}`}
    <details class="fold">
      <summary>${escapeHtml(t("availability"))}</summary>
      ${availabilityTable(command)}
    </details>
    ${(command.deprecated_options ?? []).length ? `
      <h3 class="section">${escapeHtml(t("deprecatedOptions"))}</h3>
      <table>
        <thead><tr><th>${escapeHtml(t("colOption"))}</th><th>${escapeHtml(t("colSince"))}</th><th>${escapeHtml(t("colInstead"))}</th><th>${escapeHtml(t("colWhy"))}</th></tr></thead>
        <tbody>
          ${command.deprecated_options.map((item) => `<tr>
            <td class="pkg">${escapeHtml(item.option)}</td>
            <td>${escapeHtml(L(item.since))}</td>
            <td class="pkg">${rich(L(item.replacement))}</td>
            <td>${rich(L(item.why ?? ""))}</td>
          </tr>`).join("")}
        </tbody>
      </table>` : ""}
    ${(command.see_also ?? []).length ? `
      <h3 class="section">${escapeHtml(t("seeAlso"))}</h3>
      <div class="links">
        ${command.see_also.map((name) => `<button class="linkish" type="button" data-jump="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join("")}
      </div>` : ""}
    </div>
  `;
  detailEl.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = copyTargets[Number(button.dataset.copy)];
      const ok = await copyText(text);
      button.textContent = ok ? t("copied") : t("selected");
      if (!ok) {
        const block = button.closest(".example")?.querySelector("pre");
        const range = document.createRange();
        if (block) {
          range.selectNodeContents(block);
          const selection = getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
      setTimeout(() => { button.textContent = t("copy"); }, 1200);
    });
  });
}

function render({ keepDetailScroll = false } = {}) {
  applyChrome();
  if (state.catalog) fillSelects();
  const detailTop = keepDetailScroll ? detailEl.scrollTop : 0;
  const commands = visibleCommands();
  document.body.classList.toggle("reading", Boolean(state.selected) && window.matchMedia("(max-width: 980px)").matches);
  renderThemes(commands);
  renderList(commands);
  if (state.selected) renderDetail(commandByName(state.selected));
  else if (state.theme === "obsolescence") {
    detailEl.innerHTML = `
      <p class="kicker">${escapeHtml(t("registry"))}</p>
      <h2>${escapeHtml(t("registryTitle"))}</h2>
      <p class="preface">${escapeHtml(themeCopy(state.lang, "obsolescence", themeById("obsolescence").title, themeById("obsolescence").summary).summary.trim())}</p>
      <p class="meta">${commands.length} ${escapeHtml(t("registryMeta"))}</p>
    `;
  } else renderIntro();
  if (keepDetailScroll) detailEl.scrollTop = detailTop;
  writeHash();
}

function selectCommand(name) {
  const command = commandByName(name);
  state.selected = name;
  state.sub = bestSubName(command);
  render();
  detailEl.scrollTop = 0;
  const row = listEl.querySelector(`[data-cmd="${CSS.escape(name)}"]`);
  row?.scrollIntoView({ block: "nearest" });
}

function selectSub(name) {
  state.sub = state.sub === name ? null : name;
  render({ keepDetailScroll: true });
}

function fillSelects() {
  const family = state.family;
  const status = state.status;
  familyEl.innerHTML = `<option value="toutes">${escapeHtml(t("allFamilies"))}</option>` + state.catalog.families
    .map((item) => `<option value="${item.id}">${escapeHtml(item.label)}</option>`)
    .join("");
  statusEl.innerHTML = `<option value="tous">${escapeHtml(t("allStatuses"))}</option>` + Object.keys(state.catalog.statuses)
    .map((id) => `<option value="${escapeHtml(id)}">${escapeHtml(statusName(state.lang, id))}</option>`)
    .join("");
  familyEl.value = family;
  statusEl.value = status;
  const langEl = document.getElementById("lang");
  langEl.innerHTML = LANGS.map((item) => `<option value="${item.id}">${item.label}</option>`).join("");
  langEl.value = state.lang;
}

function applyChrome() {
  document.documentElement.lang = state.lang;
  document.title = t("title");
  document.querySelector(".eyebrow").textContent = t("offline");
  document.querySelector("h1").textContent = t("title");
  qEl.placeholder = t("searchPlaceholder");
  document.querySelector("label[for='q']").textContent = t("searchLabel");
  document.getElementById("family-label").textContent = t("family");
  document.getElementById("status-label").textContent = t("status");
  document.getElementById("lang-label").textContent = t("language");
  document.getElementById("themes").setAttribute("aria-label", t("themes"));
  document.getElementById("list").setAttribute("aria-label", t("commands"));
}

function translated(text) {
  if (!text) return "";
  const english = state.dict[text];
  return english && english !== text ? `${text}\n${english}` : text;
}

async function main() {
  document.querySelector(".search").addEventListener("submit", (event) => event.preventDefault());
  const payload = await fetch(new URL("catalog.json", document.baseURI));
  if (!payload.ok) throw new Error(t("catalogMissing"));
  state.catalog = await payload.json();
  const dictPayload = await fetch(new URL("i18n/en.json", document.baseURI));
  state.dict = dictPayload.ok ? await dictPayload.json() : {};
  buildPhrases();
  state.index = new MiniSearch({
    fields: ["name", "summary", "explanation", "search"],
    storeFields: ["name"],
    processTerm: (term) => term.toLowerCase(),
  });
  state.index.addAll(state.catalog.commands.map((command) => ({
    id: command.name,
    name: command.name,
    summary: translated(command.summary),
    explanation: translated(command.explanation),
    search: [
      ...(command.pitfalls ?? []).flatMap((item) => [item, translated(item)]),
      ...(command.examples ?? []).flatMap((example) => [example.command, example.comment, translated(example.comment), example.title, translated(example.title)]),
      ...(command.subcommands ?? []).flatMap((sub) => [
        sub.label || `${command.name} ${sub.name}`,
        sub.summary,
        translated(sub.summary),
        sub.explanation,
        translated(sub.explanation),
        ...sub.examples.flatMap((example) => [example.command, example.comment, translated(example.comment), example.title, translated(example.title)]),
      ]),
      ...(command.deprecated_options ?? []).flatMap((item) => [item.option, item.replacement]),
      command.replaced_by ?? "",
      ...Object.values(command.availability).map((slot) => `${slot.package ?? ""} ${slot.note ?? ""} ${slot.status}`),
    ].join("\n"),
  })));
  fillSelects();
  readHash();
  render();

  qEl.addEventListener("input", () => {
    state.query = qEl.value;
    if (state.selected) {
      const next = bestSubName(commandByName(state.selected));
      if (next) state.sub = next;
    }
    render({ keepDetailScroll: Boolean(state.selected) });
  });
  familyEl.addEventListener("change", () => {
    state.family = familyEl.value;
    render();
  });
  statusEl.addEventListener("change", () => {
    state.status = statusEl.value;
    render();
  });
  document.getElementById("lang").addEventListener("change", (event) => {
    state.lang = event.target.value;
    fillSelects();
    render();
  });
  themesEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme]");
    if (!button) return;
    state.theme = button.dataset.theme;
    state.selected = null;
    state.sub = null;
    render();
  });
  listEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cmd]");
    if (!button) return;
    selectCommand(button.dataset.cmd);
  });
  detailEl.addEventListener("click", (event) => {
    if (event.target.closest("#back")) {
      state.selected = null;
      state.sub = null;
      render();
      return;
    }
    const subButton = event.target.closest("[data-sub]");
    if (subButton) {
      selectSub(subButton.dataset.sub);
      return;
    }
    const jump = event.target.closest("[data-jump]");
    if (!jump) return;
    selectCommand(jump.dataset.jump);
  });
  window.addEventListener("resize", () => {
    document.body.classList.toggle("reading", Boolean(state.selected) && window.matchMedia("(max-width: 980px)").matches);
  });
  window.addEventListener("hashchange", () => {
    readHash();
    render();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== qEl) {
      event.preventDefault();
      qEl.focus();
      qEl.select();
      return;
    }
    if (event.key === "Escape" && document.activeElement === qEl) {
      qEl.value = "";
      state.query = "";
      render();
    }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && document.activeElement !== qEl) {
      const commands = visibleCommands();
      if (!commands.length) return;
      const index = commands.findIndex((command) => command.name === state.selected);
      const next = event.key === "ArrowDown"
        ? commands[Math.min(commands.length - 1, index + 1)]
        : commands[Math.max(0, index < 0 ? 0 : index - 1)];
      if (next) {
        event.preventDefault();
        selectCommand(next.name);
      }
    }
  });
}

main().catch((error) => {
  detailEl.innerHTML = `<p class="empty">${escapeHtml(error.message || t("catalogMissing"))}</p>`;
});
