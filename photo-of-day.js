(() => {
  const folderPath = "images/photo-of-day";
  const manifestPath = `${folderPath}/manifest.json`;
  const primaryImageEl = document.getElementById("photo-of-day-image");
  const linkEl = document.getElementById("photo-of-day-link");
  const CYCLE_MS = 10000;
  const FADE_MS = 1800;

  if (!primaryImageEl || !linkEl) {
    return;
  }

  const secondaryImageEl = document.createElement("img");
  secondaryImageEl.className = "photo-of-day-image";
  secondaryImageEl.alt = "Photo slideshow image";
  secondaryImageEl.loading = "lazy";
  secondaryImageEl.setAttribute("aria-hidden", "true");
  linkEl.appendChild(secondaryImageEl);

  const imageEls = [primaryImageEl, secondaryImageEl];

  const imageExtPattern = /\.(avif|gif|jpe?g|png|webp)$/i;

  const normalizePath = (entry) => {
    if (typeof entry !== "string" || entry.trim() === "") {
      return "";
    }
    const trimmed = entry.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
      return trimmed;
    }
    if (trimmed.startsWith("images/")) {
      return trimmed;
    }
    return `${folderPath}/${trimmed}`;
  };

  const setEmptyState = () => {
    primaryImageEl.style.display = "none";
    secondaryImageEl.style.display = "none";
    linkEl.removeAttribute("href");
    linkEl.setAttribute("aria-disabled", "true");
  };

  const loadManifestList = async () => {
    try {
      const res = await fetch(manifestPath, { cache: "no-store" });
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        return [];
      }
      return data.map(normalizePath).filter((p) => imageExtPattern.test(p));
    } catch (_err) {
      return [];
    }
  };

  const loadDirectoryList = async () => {
    try {
      const res = await fetch(`${folderPath}/`, { cache: "no-store" });
      if (!res.ok) {
        return [];
      }
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const hrefs = Array.from(doc.querySelectorAll("a[href]"))
        .map((a) => a.getAttribute("href") || "")
        .filter((href) => imageExtPattern.test(href))
        .map((href) => decodeURIComponent(href.split("?")[0].split("#")[0]))
        .filter((href) => !href.includes("/"));
      const unique = Array.from(new Set(hrefs)).sort((a, b) => a.localeCompare(b));
      return unique.map((name) => `${folderPath}/${name}`);
    } catch (_err) {
      return [];
    }
  };

  const showImage = (imageEl, path, isVisible) => {
    imageEl.style.display = "block";
    imageEl.src = path;
    imageEl.alt = "Sidebar photo";
    if (isVisible) {
      imageEl.classList.add("is-visible");
    } else {
      imageEl.classList.remove("is-visible");
    }
  };

  const setLinkTarget = (path) => {
    linkEl.href = path;
    linkEl.removeAttribute("aria-disabled");
  };

  const preloadImage = (path) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(path);
      img.onerror = reject;
      img.src = path;
    });

  const startSlideshow = (photos) => {
    if (photos.length === 0) {
      setEmptyState();
      return;
    }

    let photoIndex = Math.floor(Math.random() * photos.length);
    let visibleImageIndex = 0;
    showImage(imageEls[0], photos[photoIndex], true);
    showImage(imageEls[1], photos[photoIndex], false);
    setLinkTarget(photos[photoIndex]);

    if (photos.length === 1) {
      return;
    }

    setInterval(() => {
      const nextPhotoIndex = (photoIndex + 1) % photos.length;
      const nextVisibleImageIndex = visibleImageIndex === 0 ? 1 : 0;
      const nextPath = photos[nextPhotoIndex];

      preloadImage(nextPath)
        .then(() => {
          showImage(imageEls[nextVisibleImageIndex], nextPath, false);
          requestAnimationFrame(() => {
            imageEls[nextVisibleImageIndex].classList.add("is-visible");
            imageEls[visibleImageIndex].classList.remove("is-visible");
          });
          setTimeout(() => {
            photoIndex = nextPhotoIndex;
            visibleImageIndex = nextVisibleImageIndex;
            setLinkTarget(nextPath);
          }, FADE_MS + 40);
        })
        .catch(() => {
          // Keep current photo if next one fails to load.
        });
    }, CYCLE_MS);
  };

  const init = async () => {
    let photos = await loadManifestList();
    if (photos.length === 0) {
      photos = await loadDirectoryList();
    }
    startSlideshow(photos);
  };

  init();
})();
