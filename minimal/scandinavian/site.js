const SITES = [
  {
    id: "hn",
    name: "Hacker News",
    url: "https://news.ycombinator.com/",
    role: "Stress · density",
    note: "Quiet the chrome. Keep the list dense.",
  },
  {
    id: "craigslist",
    name: "Craigslist",
    url: "https://sfbay.craigslist.org/",
    role: "Stress · link index",
    note: "Quiet the blue without emptying the index.",
  },
  {
    id: "wikipedia",
    name: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Scandinavian_design",
    role: "Stress · long-form",
    note: "Keep infobox, contents, and article density.",
  },
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com/torvalds/linux",
    role: "Stress · product chrome",
    note: "Every action remains. Primer goes quiet.",
  },
  {
    id: "stripe",
    name: "Stripe",
    url: "https://stripe.com/",
    role: "Stress · marketing",
    note: "Chapters and one anchor, without the gradients.",
  },
  {
    id: "ikea",
    name: "IKEA",
    url: "https://www.ikea.com/us/en/p/kallax-shelf-unit-white-80275887/",
    role: "Stress · commerce",
    note: "Product media leads. Price and cart stay together.",
  },
  {
    id: "yahoo-finance",
    name: "Yahoo Finance",
    url: "https://finance.yahoo.com/quote/SPCX/",
    role: "Stress · dense data",
    note: "Neutral chrome. Up and down keep their colour.",
  },
  {
    id: "discord",
    name: "Discord",
    url: "https://discord.com/",
    role: "Stress · dark canvas",
    note: "Invert the ladder without tinting the greys.",
  },
  {
    id: "imdb",
    name: "IMDb",
    url: "https://www.imdb.com/chart/top/",
    role: "Stress · ranked list",
    note: "250 films, one rank each. Posters carry the colour.",
  },
  {
    id: "aws",
    name: "AWS",
    url: "https://aws.amazon.com/products/?nc2=h_prod_fs_prod&sc_channel=ps",
    role: "Stress · catalog",
    note: "237 services. Make the list findable, not louder.",
  },
];

const list = document.getElementById("site-list");
const gallery = document.getElementById("gallery");
const nav = document.querySelector(".sites");
const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox.querySelector("img");
const btnDesktop = document.getElementById("btn-desktop");
const btnMobile = document.getElementById("btn-mobile");
const toTop = document.getElementById("to-top");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const narrowNav = window.matchMedia("(max-width: 960px)");

const state = {
  id: SITES[0].id,
  viewport: window.matchMedia("(max-width: 700px)").matches ? "mobile" : "desktop",
};

let observer;
let scrollingTo = "";
let settleTimer = 0;
let goToToken = 0;
let hashRestoreFrame = 0;

function cancelHashRestore() {
  if (!hashRestoreFrame) return;
  cancelAnimationFrame(hashRestoreFrame);
  hashRestoreFrame = 0;
}

function siteById(id) {
  return SITES.find((site) => site.id === id);
}

function siteIndex(id) {
  return SITES.findIndex((site) => site.id === id);
}

function readHash() {
  const id = location.hash.replace(/^#/, "");
  if (siteById(id)) state.id = id;
}

function shot(site, which) {
  return `demos/${site.id}/${state.viewport}-${which}.png`;
}

function renderNav() {
  list.replaceChildren(
    ...SITES.map((site) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${site.id}`;
      link.textContent = site.name;
      link.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        event.stopPropagation();
        goTo(site.id);
      });
      li.append(link);
      return li;
    })
  );
  syncNav();
}

function syncNav() {
  const links = [...list.querySelectorAll("a")];
  links.forEach((link) => {
    const id = link.hash.replace(/^#/, "");
    if (id === state.id) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  revealCurrentChip();
}

function syncHash() {
  const nextHash = `#${state.id}`;
  if (location.hash === nextHash) return;
  cancelHashRestore();
  const y = window.scrollY;
  history.replaceState(null, "", nextHash);
  // goTo() scrolls on purpose. Restoring Y here — immediately or on the next
  // frame — fights scrollIntoView and snaps the page back to the click origin.
  if (scrollingTo) return;
  window.scrollTo(0, y);
  hashRestoreFrame = requestAnimationFrame(() => {
    hashRestoreFrame = 0;
    if (scrollingTo) return;
    if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
  });
}

function revealCurrentChip() {
  const current = list.querySelector(`a[href="#${state.id}"]`);
  if (!(current instanceof HTMLElement)) return;

  const item = current.closest("li") ?? current;
  const itemRect = item.getBoundingClientRect();
  const scrollerRect = list.getBoundingClientRect();
  if (itemRect.left < scrollerRect.left) {
    list.scrollLeft -= scrollerRect.left - itemRect.left;
  } else if (itemRect.right > scrollerRect.right) {
    list.scrollLeft += itemRect.right - scrollerRect.right;
  }
}

function setShot(img, site, which) {
  const frame = img.closest(".frame");
  const button = img.closest("button");
  frame.classList.remove("pending");
  img.hidden = false;
  if (button) button.disabled = false;
  const label = `${site.name} ${state.viewport} ${which}`;
  img.alt = label;
  if (button) button.setAttribute("aria-label", `Expand ${label}`);
  img.onerror = () => {
    img.hidden = true;
    frame.classList.add("pending");
    if (button) button.disabled = true;
  };
  img.src = shot(site, which);
}

function figureFor(site, which) {
  const figure = document.createElement("figure");
  const frame = document.createElement("div");
  frame.className = "frame";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "shot";
  const img = document.createElement("img");
  img.decoding = "async";
  button.append(img);
  frame.append(button);
  figure.append(frame);
  button.addEventListener("click", () => openLightbox(img));
  setShot(img, site, which);
  return figure;
}

function openLightbox(img) {
  if (!img.src || img.hidden) return;
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  if (!lightbox.open) lightbox.showModal();
}

function renderGallery() {
  gallery.replaceChildren(
    ...SITES.map((site) => {
      const section = document.createElement("section");
      section.id = site.id;
      section.className = "site";
      const heading = document.createElement("h2");
      heading.textContent = site.name;
      const compare = document.createElement("div");
      compare.className = "compare";
      compare.append(figureFor(site, "before"), figureFor(site, "after"));
      section.append(heading, compare);
      return section;
    })
  );
}

function syncViewport() {
  document.body.dataset.viewport = state.viewport;
  btnDesktop.setAttribute("aria-pressed", String(state.viewport === "desktop"));
  btnMobile.setAttribute("aria-pressed", String(state.viewport === "mobile"));

  for (const site of SITES) {
    const section = document.getElementById(site.id);
    if (!section) continue;
    const imgs = section.querySelectorAll("img");
    if (imgs[0]) setShot(imgs[0], site, "before");
    if (imgs[1]) setShot(imgs[1], site, "after");
  }
}

function setCurrent(id) {
  if (!siteById(id)) return;
  if (state.id === id) {
    revealCurrentChip();
    return;
  }
  state.id = id;
  syncNav();
  syncHash();
}

function syncChromeOffsets() {
  const navH = narrowNav.matches ? Math.round(nav.getBoundingClientRect().height) : 0;
  document.documentElement.style.setProperty("--nav-height", `${navH}px`);
}

function spyY() {
  // On narrow screens the chip bar overlays the gallery, so the spy line sits
  // just below it. On desktop the sidebar is beside the content and must not
  // push the line down to the bottom of the list.
  if (narrowNav.matches) {
    return Math.max(nav.getBoundingClientRect().bottom, 0) + 24;
  }
  return 24;
}

function sectionAtSpy() {
  const y = spyY();
  let current = SITES[0].id;
  for (const site of SITES) {
    const section = document.getElementById(site.id);
    if (!section) continue;
    // scrollIntoView + scroll-margin can park a section a hair past the spy
    // line; without slop the previous page steals aria-current after goTo.
    if (section.getBoundingClientRect().top <= y + 2) current = site.id;
  }
  return current;
}

function observeSites() {
  observer?.disconnect();
  const sections = [...gallery.querySelectorAll("section.site")];
  if (!sections.length) return;

  const top = window.matchMedia("(max-width: 960px)").matches
    ? Math.max(0, Math.round(nav.getBoundingClientRect().bottom))
    : 24;
  observer = new IntersectionObserver(
    () => {
      if (scrollingTo) return;
      setCurrent(sectionAtSpy());
    },
    {
      root: null,
      rootMargin: `-${top}px 0px -45% 0px`,
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    }
  );
  sections.forEach((section) => observer.observe(section));
}

function unlockSpy(token) {
  window.clearTimeout(settleTimer);
  let lastY = window.scrollY;
  const settle = () => {
    if (token !== goToToken) return;
    if (window.scrollY !== lastY) {
      lastY = window.scrollY;
      settleTimer = window.setTimeout(settle, 140);
      return;
    }
    scrollingTo = "";
    if (window.scrollY < 8) {
      state.id = SITES[0].id;
      syncNav();
      const y = window.scrollY;
      history.replaceState(null, "", location.pathname + location.search);
      window.scrollTo(0, 0);
      return;
    }
    setCurrent(sectionAtSpy());
  };
  settleTimer = window.setTimeout(settle, 140);
}

function whenImagesReady(root) {
  const imgs = [...root.querySelectorAll("img")];
  return Promise.all(
    imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    })
  );
}

function goTo(id, instant = false) {
  const section = document.getElementById(id);
  if (!section) return;
  const from = siteIndex(state.id);
  const to = siteIndex(id);
  const token = ++goToToken;
  window.clearTimeout(settleTimer);
  scrollingTo = id;
  setCurrent(id);
  cancelHashRestore();
  const adjacent = from >= 0 && Math.abs(to - from) === 1;
  const behavior =
    instant || reduceMotion.matches || !adjacent ? "auto" : "smooth";
  const jump = () => section.scrollIntoView({ behavior, block: "start" });
  const ready = adjacent ? whenImagesReady(section) : whenImagesReady(gallery);
  jump();
  ready.then(() => {
    if (token !== goToToken) return;
    jump();
    unlockSpy(token);
  });
}

function goToTop(event) {
  event.preventDefault();
  const token = ++goToToken;
  window.clearTimeout(settleTimer);
  scrollingTo = "__top__";
  cancelHashRestore();
  const behavior = reduceMotion.matches ? "auto" : "smooth";
  window.scrollTo({ top: 0, behavior });
  unlockSpy(token);
}

function setViewport(viewport) {
  state.viewport = viewport;
  syncViewport();
}

btnDesktop.addEventListener("click", () => setViewport("desktop"));
btnMobile.addEventListener("click", () => setViewport("mobile"));
toTop.addEventListener("click", goToTop);
lightbox.addEventListener("click", () => lightbox.close());

document.addEventListener("keydown", (event) => {
  if (lightbox.open) return;
  if (event.target instanceof HTMLInputElement) return;
  const index = siteIndex(state.id);
  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    if (index < SITES.length - 1) {
      event.preventDefault();
      goTo(SITES[index + 1].id);
    }
  } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
    if (index > 0) {
      event.preventDefault();
      goTo(SITES[index - 1].id);
    }
  } else if (event.key === "d" || event.key === "D") {
    setViewport("desktop");
  } else if (event.key === "m" || event.key === "M") {
    setViewport("mobile");
  }
});

let spyFrame = 0;
window.addEventListener(
  "scroll",
  () => {
    if (scrollingTo) return;
    if (spyFrame) return;
    spyFrame = requestAnimationFrame(() => {
      spyFrame = 0;
      setCurrent(sectionAtSpy());
    });
  },
  { passive: true }
);
window.addEventListener("scrollend", () => {
  if (scrollingTo) return;
  setCurrent(sectionAtSpy());
});

window.addEventListener("resize", () => {
  syncChromeOffsets();
  observeSites();
  revealCurrentChip();
});

const initialHash = location.hash.replace(/^#/, "");
readHash();
if (location.hash) {
  history.replaceState(null, "", location.pathname + location.search);
}
renderGallery();
renderNav();
syncViewport();
syncChromeOffsets();
observeSites();
if (siteById(initialHash) && initialHash !== SITES[0].id) {
  goTo(initialHash, true);
  syncHash();
}
if (document.fonts?.ready) document.fonts.ready.then(revealCurrentChip);

new ResizeObserver(() => {
  syncChromeOffsets();
  if (narrowNav.matches) observeSites();
}).observe(nav);

const INSTALL_COMMAND = "npx skills add ericzakariasson/scandinavian-design";
const installButtons = [...document.querySelectorAll(".install-cmd")];
let copiedTimer = 0;

installButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
    } catch {
      return;
    }

    installButtons.forEach((cmd) => {
      cmd.classList.add("is-copied");
    });
    window.clearTimeout(copiedTimer);
    copiedTimer = window.setTimeout(() => {
      installButtons.forEach((cmd) => {
        cmd.classList.remove("is-copied");
      });
    }, 1600);
  });
});
