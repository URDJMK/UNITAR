(function () {
  "use strict";

  const timers = new Set();

  function isReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      new URLSearchParams(window.location.search).has("reduced-motion");
  }

  function addTimer(callback, delay) {
    const id = window.setTimeout(function () {
      timers.delete(id);
      callback();
    }, isReducedMotion() ? Math.min(delay, 40) : delay);
    timers.add(id);
    return id;
  }

  function wait(delay) {
    return new Promise(function (resolve) {
      addTimer(resolve, delay);
    });
  }

  function clearAllTimers() {
    timers.forEach(function (id) {
      window.clearTimeout(id);
    });
    timers.clear();
  }

  function goToPage(path) {
    clearAllTimers();
    window.location.href = path;
  }

  function setLiveMessage(message) {
    const live = document.querySelector("[data-live-message]");
    if (live) live.textContent = message;
  }

  function setButtonBusy(button, busy, busyLabel) {
    if (!button) return;
    if (!button.dataset.idleLabel) button.dataset.idleLabel = button.textContent.trim();
    button.disabled = Boolean(busy);
    button.setAttribute("aria-busy", busy ? "true" : "false");
    button.textContent = busy ? (busyLabel || "Working…") : button.dataset.idleLabel;
  }

  function showMissingAssetFallback(image, label) {
    const frame = image.closest("[data-asset-frame]") || image.parentElement;
    if (!frame) return;
    frame.classList.add("has-missing-asset");
    const fallback = frame.querySelector(".asset-fallback");
    if (fallback) fallback.textContent = label || image.dataset.fallbackLabel || "Visual unavailable";
  }

  function prepareAsset(image) {
    const frame = image.closest("[data-asset-frame]") || image.parentElement;
    if (frame) frame.classList.remove("has-missing-asset");
    image.addEventListener("error", function () {
      showMissingAssetFallback(image);
    });
    image.addEventListener("load", function () {
      if (frame) frame.classList.remove("has-missing-asset");
    });
    if (image.complete && image.naturalWidth === 0) showMissingAssetFallback(image);
  }

  function setImage(image, path, label) {
    if (!image) return;
    image.dataset.fallbackLabel = label || "Cinematic preview unavailable";
    const frame = image.closest("[data-asset-frame]") || image.parentElement;
    if (frame) frame.classList.remove("has-missing-asset");
    image.src = path;
  }

  function openSceneMenu(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    const close = dialog.querySelector("[data-close-menu]");
    if (close) close.focus();
  }

  function closeSceneMenu(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function markCurrentScene() {
    const file = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".scene-menu-list a").forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === file) link.setAttribute("aria-current", "page");
    });
  }

  function bindCommon() {
    const dialog = document.querySelector("[data-scene-menu]");

    if (isReducedMotion()) document.documentElement.classList.add("reduced-motion");

    document.querySelectorAll("[data-open-menu]").forEach(function (button) {
      button.addEventListener("click", function () {
        openSceneMenu(dialog);
      });
    });

    document.querySelectorAll("[data-close-menu]").forEach(function (button) {
      button.addEventListener("click", function () {
        closeSceneMenu(dialog);
      });
    });

    if (dialog) {
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) closeSceneMenu(dialog);
      });
    }

    document.querySelectorAll("[data-restart]").forEach(function (button) {
      button.addEventListener("click", function () {
        clearAllTimers();
        window.location.reload();
      });
    });

    document.querySelectorAll("img[data-fallback-label]").forEach(prepareAsset);
    markCurrentScene();
  }

  window.BTP = {
    addTimer: addTimer,
    bindCommon: bindCommon,
    clearAllTimers: clearAllTimers,
    goToPage: goToPage,
    isReducedMotion: isReducedMotion,
    setButtonBusy: setButtonBusy,
    setImage: setImage,
    setLiveMessage: setLiveMessage,
    showMissingAssetFallback: showMissingAssetFallback,
    wait: wait
  };

  document.addEventListener("DOMContentLoaded", bindCommon);
  window.addEventListener("pagehide", clearAllTimers);
})();
