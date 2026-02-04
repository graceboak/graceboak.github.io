const $ = (sel, root=document) => root.querySelector(sel);

function setActiveFilter(kind){
  const pills = document.querySelectorAll("[data-filter]");
  pills.forEach(p => p.setAttribute("aria-pressed", String(p.dataset.filter === kind)));
}

function filteredProjects(kind){
  const all = window.PROJECTS || [];
  if (kind === "all") return all;
  return all.filter(p => p.kind === kind);
}

function renderGrid(kind){
  const list = filteredProjects(kind);
  const grid = $("#grid");
  const count = $("#count");
  grid.innerHTML = "";

  list.forEach(p => {
    const a = document.createElement("a");
    a.className = "card";
    a.href = `project.html?slug=${encodeURIComponent(p.slug)}`;
    a.innerHTML = `
      <img src="${p.thumb}" alt="${p.title}">
      <div class="meta">
        <div>
          <div class="title">${p.title}</div>
          <div class="sub">${(p.location || "")}${p.year ? " · " + p.year : ""}</div>
        </div>
        <div class="sub">${p.kind === "video" ? "Video" : "Photo"}</div>
      </div>
    `;
    grid.appendChild(a);
  });

  if (count) count.textContent = `${list.length} project${list.length === 1 ? "" : "s"}`;
}

function initHome(){
  const pills = document.querySelectorAll("[data-filter]");
  let current = "all";

  pills.forEach(p => {
    p.addEventListener("click", () => {
      current = p.dataset.filter;
      setActiveFilter(current);
      renderGrid(current);
    });
  });

  setActiveFilter(current);
  renderGrid(current);
}

function initProject(){
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  const p = (window.PROJECTS || []).find(x => x.slug === slug);

  const titleEl = $("#pTitle");
  const descEl = $("#pDesc");
  const masonry = $("#masonry");
  const embed = $("#embed");

  if (!p){
    titleEl.textContent = "Project not found";
    descEl.textContent = "Check the link or add this project in projects.js.";
    return;
  }

  document.title = `${p.title} — Grace Boak`;
  titleEl.textContent = p.title;
  descEl.textContent = p.description || "";

  // Video
  if (p.videoEmbedUrl){
    embed.innerHTML = `<iframe src="${p.videoEmbedUrl}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    embed.remove();
  }

  // Images
  if (Array.isArray(p.images) && p.images.length){
    masonry.innerHTML = p.images.map(src => `
      <a href="${src}" data-lightbox="1">
        <img src="${src}" alt="${p.title}">
      </a>
    `).join("");
  } else {
    masonry.innerHTML = "";
  }

  setupLightbox();
}

function setupLightbox(){
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = `<img alt=""><div class="hint">Click outside or press Esc to close</div>`;
  document.body.appendChild(lb);

  const img = lb.querySelector("img");

  function close(){
    lb.classList.remove("open");
    img.src = "";
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-lightbox]");
    if (!a) return;
    e.preventDefault();
    img.src = a.getAttribute("href");
    lb.classList.add("open");
  });

  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "home") initHome();
  if (document.body.dataset.page === "project") initProject();
});
