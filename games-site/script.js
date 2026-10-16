const grid = document.getElementById("grid");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const countEl = document.getElementById("count");
const emptyEl = document.getElementById("empty");

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalMeta = document.getElementById("modal-meta");
const modalDesc = document.getElementById("modal-desc");
const modalShots = document.getElementById("modal-shots");
const modalLinks = document.getElementById("modal-links");

document.getElementById("year").textContent = new Date().getFullYear();

// تعبئة قائمة التصنيفات تلقائيًا من الألعاب
[...new Set(GAMES.map(g => g.category).filter(Boolean))].forEach(cat => {
  const opt = document.createElement("option");
  opt.value = cat;
  opt.textContent = cat;
  categorySelect.appendChild(opt);
});


function getLinks(game) {
  if (Array.isArray(game.links) && game.links.length) return game.links;
  return game.file ? [{ label: "تحميل", url: game.file }] : [];
}

function isExternal(url) {
  return /^https?:\/\//i.test(url);
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const cat = categorySelect.value;

  const list = GAMES.filter(g =>
    (!cat || g.category === cat) &&
    (!q || (g.title + " " + g.description).toLowerCase().includes(q))
  );

  grid.innerHTML = "";
  list.forEach(game => {
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;

    const img = document.createElement("img");
    img.src = game.image;
    img.alt = game.title;
    img.loading = "lazy";

    const body = document.createElement("div");
    body.className = "card-body";

    const h3 = document.createElement("h3");
    h3.textContent = game.title;

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = game.category || "";

    const p = document.createElement("p");
    p.textContent = game.description;

    const links = getLinks(game);
    const a = document.createElement("a");
    a.className = "btn";
    if (links.length) {
      a.href = links[0].url;
      if (isExternal(links[0].url)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
      else { a.setAttribute("download", ""); }
      a.textContent = "⬇ تحميل";
    } else {
      a.className = "btn disabled";
      a.textContent = "غير متوفر";
    }
    a.addEventListener("click", e => e.stopPropagation());

    body.append(h3, tag, p, a);
    card.append(img, body);

    card.addEventListener("click", () => openModal(game));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter") openModal(game);
    });
    grid.appendChild(card);
  });

  countEl.textContent = `عدد الألعاب: ${list.length}`;
  emptyEl.hidden = list.length > 0;
}

function openModal(game) {
  modalImg.src = game.image;
  modalImg.alt = game.title;
  modalTitle.textContent = game.title;
  modalMeta.textContent = [
    game.category,
    game.platform,
    game.size && `الحجم: ${game.size}`,
    game.version && `الإصدار: ${game.version}`
  ].filter(Boolean).join(" • ");
  modalDesc.textContent = game.description;
  modalLinks.innerHTML = "";
  getLinks(game).forEach((l, i) => {
    const a = document.createElement("a");
    a.className = "btn link-btn" + (i === 0 ? " best" : "");
    a.href = l.url;
    if (isExternal(l.url)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    else { a.setAttribute("download", ""); }
    a.textContent = "⬇ " + (l.label || "تحميل");
    if (i === 0) {
      const b = document.createElement("span");
      b.className = "badge";
      b.textContent = "الأفضل";
      a.appendChild(b);
    }
    modalLinks.appendChild(a);
  });

  modalShots.innerHTML = "";
  (game.screenshots || []).forEach(src => {
    const s = document.createElement("img");
    s.src = src;
    s.alt = "لقطة من " + game.title;
    s.addEventListener("click", () => { modalImg.src = src; });
    modalShots.appendChild(s);
  });

  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

document.getElementById("modal-close").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

searchInput.addEventListener("input", render);
categorySelect.addEventListener("change", render);

render();
