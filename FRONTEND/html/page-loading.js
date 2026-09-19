const loadingScreen = document.getElementById("loadingScreen");
const loadingVideo = document.getElementById("loadingVideo");
let loadingClosed = false;

if (loadingVideo) {
  loadingVideo.classList.add("is-ready");
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const source = loadingVideo.querySelector("source");
  const currentSrc = source ? source.getAttribute("src") : "";

  if (isDark && !currentSrc.includes("blackair")) {
    loadingVideo.innerHTML = `
      <source src="../assets/videos/blackair.mp4" type="video/mp4" />
      <source src="../assets/video/blackair.mp4" type="video/mp4" />
    `;
    loadingVideo.load();
    loadingVideo.play().catch(() => {});
  } else if (!isDark && !currentSrc.includes("carga")) {
    loadingVideo.innerHTML = `
      <source src="../assets/videos/carga%20air%20white.mp4" type="video/mp4" />
      <source src="../assets/video/carga%20air%20white.mp4" type="video/mp4" />
    `;
    loadingVideo.load();
    loadingVideo.play().catch(() => {});
  }
}

function closeLoadingScreen() {
  if (loadingClosed || !loadingScreen) return;
  loadingClosed = true;
  loadingScreen.classList.add("is-hidden");
  window.setTimeout(() => loadingScreen.remove(), 500);
}

if (loadingScreen && loadingVideo) {
  loadingVideo.addEventListener("ended", closeLoadingScreen, { once: true });
  loadingVideo.addEventListener("error", closeLoadingScreen, { once: true });
  window.setTimeout(closeLoadingScreen, 8000);
}
