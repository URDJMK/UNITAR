(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const begin = document.querySelector("[data-begin]");
    const content = document.querySelector(".opening-content");
    const transition = document.querySelector("[data-opening-transition]");
    let leaving = false;

    if (!begin) return;

    begin.addEventListener("click", async function () {
      if (leaving) return;
      leaving = true;
      begin.disabled = true;
      content.classList.add("is-leaving");
      transition.hidden = false;
      transition.classList.add("reveal");
      BTP.setLiveMessage("Decisions become a prompt. Opening the first scene.");
      await BTP.wait(720);
      BTP.goToPage("01-decisions.html");
    });
  });
})();
