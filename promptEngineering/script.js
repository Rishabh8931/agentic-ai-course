import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

const content = document.querySelector("#markdownContent");
const sectionNav = document.querySelector("#sectionNav");
const tocNav = document.querySelector("#tocNav");
const searchPanel = document.querySelector("#searchPanel");
const searchInput = document.querySelector("#searchInput");
const searchResults = document.querySelector("#searchResults");
const toast = document.querySelector("#toast");
const root = document.documentElement;

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1600);
};

function makeId(text, used) {
  const base = slugify(text) || "section";
  let id = base;
  let number = 2;
  while (used.has(id)) id = `${base}-${number++}`;
  used.add(id);
  return id;
}

function buildNavigation() {
  const used = new Set();
  const headings = [...content.querySelectorAll("h2, h3")];
  let sectionIndex = 0;
  headings.forEach((heading) => {
    const sourceAnchor =
      heading.tagName === "H2" && sectionIndex < 5
        ? `l${++sectionIndex}`
        : heading.tagName === "H2" && sectionIndex === 5
          ? "end"
          : null;
    heading.id =
      sourceAnchor && !used.has(sourceAnchor)
        ? sourceAnchor
        : makeId(heading.textContent, used);
    used.add(heading.id);
  });
  const h2s = headings.filter((heading) => heading.tagName === "H2");
  document.querySelector("#sectionCount").textContent = String(
    h2s.length,
  ).padStart(2, "0");
  sectionNav.innerHTML = h2s
    .map(
      (heading, index) =>
        `<a class="nav-link" href="#${heading.id}" data-nav="${heading.id}">${String(index + 1).padStart(2, "0")} <span>${heading.textContent.replace(/^\d+\s*/, "")}</span><small>${["start clear", "add control", "build systems", "curate attention", "ship & maintain"][index] || "keep learning"}</small></a>`,
    )
    .join("");
  tocNav.innerHTML = headings
    .map(
      (heading) =>
        `<a class="toc-link level-${heading.tagName === "H3" ? "3" : "2"}" href="#${heading.id}" data-toc="${heading.id}">${heading.textContent.replace(/^\d+\s*/, "")}</a>`,
    )
    .join("");
  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry) => {
          document
            .querySelectorAll("[data-nav], [data-toc]")
            .forEach((link) =>
              link.classList.toggle(
                "active",
                link.dataset.nav === entry.target.id ||
                  link.dataset.toc === entry.target.id,
              ),
            );
        });
    },
    { rootMargin: "-18% 0px -68% 0px", threshold: 0 },
  );
  headings.forEach((heading) => observer.observe(heading));
}

function addEnhancements() {
  content.querySelectorAll("table").forEach((table) => {
    const wrap = document.createElement("div");
    wrap.className = "table-wrap";
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
  content.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (code?.classList.contains("language-mermaid")) {
      const wrap = document.createElement("div");
      wrap.className = "mermaid-wrap";
      wrap.innerHTML = '<span class="diagram-label">diagram / rendered</span>';
      const diagram = document.createElement("div");
      diagram.className = "mermaid";
      diagram.textContent = code.textContent;
      wrap.appendChild(diagram);
      pre.replaceWith(wrap);
    } else {
      const copy = document.createElement("button");
      copy.className = "copy-button";
      copy.type = "button";
      copy.textContent = "copy";
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(
            code?.textContent || pre.textContent,
          );
          copy.textContent = "copied";
          showToast("Code copied");
          setTimeout(() => (copy.textContent = "copy"), 1400);
        } catch {
          showToast("Copy unavailable");
        }
      });
      pre.appendChild(copy);
    }
  });
  content.querySelectorAll("input[type=checkbox]").forEach((input) => {
    input.disabled = true;
    input.closest("li")?.classList.add("checklist-item");
  });
}

function openSearch() {
  searchPanel.hidden = false;
  searchInput.focus();
}
function closeDrawers() {
  document.body.classList.remove("sidebar-open");
  document.querySelector("#sidebar").classList.remove("open");
}

async function loadDocument() {
  try {
    const response = await fetch("./promptEngineer.md");
    if (!response.ok)
      throw new Error(`Could not load promptEngineer.md (${response.status})`);
    const markdown = await response.text();
    marked.setOptions({
      gfm: true,
      breaks: false,
      headerIds: false,
      mangle: false,
    });
    content.innerHTML = marked.parse(markdown);
    addEnhancements();
    buildNavigation();
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      securityLevel: "strict",
      themeVariables: {
        background: "#0d161d",
        primaryColor: "#1c2630",
        primaryTextColor: "#e6ebe5",
        primaryBorderColor: "#d9f36a",
        lineColor: "#ffc66d",
        secondaryColor: "#10151c",
        tertiaryColor: "#151c25",
        fontFamily: "Manrope, sans-serif",
      },
    });
    await mermaid.run({ nodes: content.querySelectorAll(".mermaid") });
  } catch (error) {
    content.innerHTML = `<div class="loading-state">The field notes could not be loaded. ${error.message}</div>`;
  }
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    searchResults.innerHTML = "";
    return;
  }
  const matches = [...content.querySelectorAll("h2, h3, p, li")]
    .filter((node) => node.textContent.toLowerCase().includes(query))
    .slice(0, 12);
  searchResults.innerHTML =
    matches
      .map((node) => {
        const heading =
          node.closest("section")?.querySelector("h2")?.textContent ||
          node.parentElement?.querySelector("h2")?.textContent ||
          "Field notes";
        return `<a class="result-link" href="#${node.id || ""}"><strong>${heading}</strong><small>${node.textContent.slice(0, 105)}${node.textContent.length > 105 ? "…" : ""}</small></a>`;
      })
      .join("") ||
    '<div class="result-link"><small>No matches found.</small></div>';
});
document.querySelector(".search-toggle").addEventListener("click", openSearch);
document
  .querySelector("[data-open-search]")
  .addEventListener("click", openSearch);
document.querySelector("#closeSearch").addEventListener("click", () => {
  searchPanel.hidden = true;
  searchInput.value = "";
  searchResults.innerHTML = "";
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
  if (event.key === "Escape") {
    searchPanel.hidden = true;
    closeDrawers();
  }
});
document.querySelector(".theme-toggle").addEventListener("click", () => {
  root.classList.toggle("light");
  localStorage.setItem(
    "prompt-notes-theme",
    root.classList.contains("light") ? "light" : "dark",
  );
});
if (localStorage.getItem("prompt-notes-theme") === "light")
  root.classList.add("light");
document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.body.classList.toggle("sidebar-open");
  document.querySelector("#sidebar").classList.toggle("open");
});
document.querySelector("[data-open-sidebar]").addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
  document.querySelector("#sidebar").classList.add("open");
});
document
  .querySelector("[data-open-toc]")
  .addEventListener("click", () =>
    showToast("Use the section navigation on desktop"),
  );
document
  .querySelectorAll("[data-close-drawers]")
  .forEach((node) => node.addEventListener("click", closeDrawers));
document.addEventListener("click", (event) => {
  if (event.target.matches("a[href^='#']")) closeDrawers();
});
window.addEventListener(
  "scroll",
  () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    document.querySelector("#readingProgress").style.width =
      `${height > 0 ? (window.scrollY / height) * 100 : 0}%`;
  },
  { passive: true },
);
loadDocument();
