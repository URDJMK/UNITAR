(function () {
  "use strict";

  async function revealEnding() {
    const lines = Array.from(document.querySelectorAll("[data-concept-line]"));
    const message = document.querySelector("[data-ending-message]");
    const restart = document.querySelector("[data-restart-experience]");

    for (const line of lines) {
      line.classList.add("is-visible");
      BTP.setLiveMessage(line.textContent.trim().replace(/\s+/g, " "));
      await BTP.wait(480);
    }

    message.classList.add("is-visible");
    message.removeAttribute("aria-hidden");
    await BTP.wait(420);
    restart.disabled = false;
    restart.focus({ preventScroll: true });
    const endingText = message.textContent.trim().replace(/\s+/g, " ");
    BTP.setLiveMessage(endingText + " Restart experience is now available.");
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("[data-restart-experience]").addEventListener("click", function () {
      BTP.goToPage("index.html");
    });
    revealEnding();
  });
})();
