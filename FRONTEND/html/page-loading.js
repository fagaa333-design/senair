const loadingScreen = document.getElementById("loadingScreen");
const loadingVideo = document.getElementById("loadingVideo");
let loadingClosed = false;

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
