(function () {
  "use strict";

  const state = {
    scanRunning: false,
    scanComplete: false
  };

  async function scanFrame() {
    if (state.scanRunning || state.scanComplete) return;
    state.scanRunning = true;

    const button = document.querySelector("[data-scan]");
    const stage = document.querySelector("[data-actor-stage]");
    const status = document.querySelector("[data-scan-status]");
    const backgroundLabel = document.querySelector("[data-background-label]");
    const subjectLabel = document.querySelector("[data-subject-label]");
    const transition = document.querySelector("[data-actor-transition]");
    const thesis = document.querySelector("[data-actor-thesis]");
    const layers = document.querySelector("[data-layer-results]");
    const ready = document.querySelector("[data-scan-ready]");
    const continueButton = document.querySelector("[data-continue]");

    BTP.setButtonBusy(button, true, "Scanning…");
    stage.classList.add("is-scanning");
    status.textContent = "Reading pixels and depth…";
    BTP.setLiveMessage("AI is scanning the video frame.");
    await BTP.wait(1250);

    stage.classList.add("is-background-found");
    backgroundLabel.hidden = false;
    backgroundLabel.classList.add("reveal");
    status.textContent = "Background detected and separated.";
    BTP.setLiveMessage("Background detected and separated.");
    await BTP.wait(620);

    stage.classList.remove("is-scanning");
    stage.classList.add("is-subject-found");
    subjectLabel.hidden = false;
    subjectLabel.classList.add("reveal");
    status.textContent = "Person detected. Building editable masks…";
    BTP.setLiveMessage("Person detected. Building editable masks.");
    await BTP.wait(520);

    transition.hidden = false;
    thesis.hidden = false;
    layers.hidden = false;
    ready.hidden = false;
    transition.classList.add("reveal");
    thesis.classList.add("reveal");
    layers.classList.add("reveal");
    ready.classList.add("reveal");
    status.textContent = "Scan complete: person and background are independently editable.";
    status.dataset.state = "complete";

    state.scanRunning = false;
    state.scanComplete = true;
    button.textContent = "Frame scanned";
    button.disabled = true;
    button.setAttribute("aria-busy", "false");
    continueButton.disabled = false;
    BTP.setLiveMessage("Scan complete. One frame became two editable layers: person and background.");
    continueButton.focus({ preventScroll: true });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("[data-scan]").addEventListener("click", scanFrame);
    document.querySelector("[data-continue]").addEventListener("click", function () {
      if (state.scanComplete) BTP.goToPage("04-ending.html");
    });
  });
})();
