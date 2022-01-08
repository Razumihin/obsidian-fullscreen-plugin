import { Plugin } from "obsidian";

export default class FullScreenPlugin extends Plugin {
  onload() {
    this.addCommand({
      id: "fullscreen-focus",
      name: "Fullscreen focus mode",
      callback: this.fullscreenMode.bind(this),
    });
  }

  onunload() {}

  fullscreenMode() {
    var leaf = this.app.workspace.activeLeaf;
    if (!leaf) return;
    var el = leaf.containerEl;
    var fullscreenMutationObserver;

    el.requestFullscreen();

    // disable mutation observer when exiting fullscreen mode
    el.addEventListener("fullscreenchange", (event) => {
      if (!document.fullscreenElement) {
        fullscreenMutationObserver.disconnect();
        document.body.classList.remove('fullscreen')
      } else {
        document.body.classList.add('fullscreen')
      }
    });

    // copy all nodes
    fullscreenMutationObserver = new MutationObserver((mutationRecords) => {
      mutationRecords.forEach((mutationRecord) => {
        mutationRecord.addedNodes.forEach((node) => {
          document.body.removeChild(node);
          el.appendChild(node);
        });
      });
      // focus on prompt for file open
      if (document.querySelector(".prompt-input"))
        document.querySelector(".prompt-input").focus();
    });

    fullscreenMutationObserver.observe(document.body, { childList: true });
  }
}
