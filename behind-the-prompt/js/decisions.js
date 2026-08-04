(function () {
  "use strict";

  const state = {
    shot: null,
    light: null,
    pace: null,
    generationRunning: false,
    generationComplete: false
  };

  const shotImages = {
    Wide: "assets/images/scene-wide.webp",
    Medium: "assets/images/scene-medium.webp",
    "Close-up": "assets/images/scene-closeup.webp"
  };

  const promptTerms = {
    shot: {
      Wide: "a wide shot",
      Medium: "a medium shot",
      "Close-up": "a close-up"
    },
    light: {
      Cold: "cold lighting",
      Warm: "warm lighting",
      Dark: "dark low-key lighting"
    },
    pace: {
      "Slow reveal": "a slow reveal",
      "Sudden cut": "a sudden cut",
      "Long take": "a long take"
    }
  };

  function updatePrompt() {
    const prompt = document.querySelector("[data-live-prompt]");
    const generate = document.querySelector("[data-generate]");
    const shot = state.shot ? promptTerms.shot[state.shot] : "[choose a shot]";
    const light = state.light ? promptTerms.light[state.light] : "[choose lighting]";
    const pace = state.pace ? promptTerms.pace[state.pace] : "[choose pacing]";
    prompt.textContent = "Create a suspenseful scene using " + shot + ", " + light + ", and " + pace + ".";
    generate.disabled = !(state.shot && state.light && state.pace) || state.generationRunning || state.generationComplete;
  }

  function updateStage(group, value) {
    const stage = document.querySelector("[data-preview-stage]");
    const image = document.querySelector("[data-scene-preview]");
    const label = document.querySelector("[data-stage-label]");

    if (group === "shot") {
      BTP.setImage(image, shotImages[value], value + " cinematic preview unavailable");
      label.textContent = value + " / live preview";
    }

    if (group === "light") {
      stage.classList.remove("light-cold", "light-warm", "light-dark");
      stage.classList.add("light-" + value.toLowerCase());
    }

    if (group === "pace") {
      stage.classList.remove("pace-slow", "pace-sudden", "pace-long");
      void stage.offsetWidth;
      const paceClass = value === "Slow reveal" ? "pace-slow" : value === "Sudden cut" ? "pace-sudden" : "pace-long";
      stage.classList.add(paceClass);
    }
  }

  function choose(button) {
    if (state.generationRunning || state.generationComplete) return;
    const group = button.dataset.choiceGroup;
    const value = button.dataset.choiceValue;
    state[group] = value;
    document.querySelectorAll('[data-choice-group="' + group + '"]').forEach(function (candidate) {
      candidate.setAttribute("aria-pressed", candidate === button ? "true" : "false");
    });
    updateStage(group, value);
    updatePrompt();
  }

  async function generate() {
    if (state.generationRunning || state.generationComplete || !(state.shot && state.light && state.pace)) return;

    state.generationRunning = true;
    const generateButton = document.querySelector("[data-generate]");
    const status = document.querySelector("[data-generation-status]");
    const result = document.querySelector("[data-generated-result]");
    const decisions = document.querySelector("[data-auto-decisions]");
    const reveal = document.querySelector("[data-decision-reveal]");
    const continueButton = document.querySelector("[data-continue]");

    document.querySelectorAll("[data-choice-group]").forEach(function (button) {
      button.disabled = true;
    });
    BTP.setButtonBusy(generateButton, true, "Generating…");

    const messages = [
      "Interpreting your direction…",
      "Planning the scene…",
      "Completing missing decisions…"
    ];

    for (const message of messages) {
      status.textContent = message;
      status.dataset.state = "working";
      BTP.setLiveMessage(message);
      await BTP.wait(820);
    }

    result.classList.add("is-visible");
    result.removeAttribute("aria-hidden");
    status.textContent = "Storyboard generated. Six production choices were completed automatically.";
    status.dataset.state = "complete";
    await BTP.wait(560);

    decisions.hidden = false;
    decisions.classList.add("reveal");
    await BTP.wait(620);
    reveal.hidden = false;
    reveal.classList.add("reveal");

    state.generationRunning = false;
    state.generationComplete = true;
    generateButton.textContent = "Generated";
    generateButton.disabled = true;
    generateButton.setAttribute("aria-busy", "false");
    continueButton.disabled = false;
    BTP.setLiveMessage("Generation complete. AI completed six decisions you never made. Continue is now available.");
    continueButton.focus({ preventScroll: true });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-choice-group]").forEach(function (button) {
      button.addEventListener("click", function () { choose(button); });
    });
    document.querySelector("[data-generate]").addEventListener("click", generate);
    document.querySelector("[data-continue]").addEventListener("click", function () {
      if (state.generationComplete) BTP.goToPage("02-digital-actor.html");
    });
    updatePrompt();
  });
})();
