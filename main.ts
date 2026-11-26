import { Notice, Plugin } from "obsidian";

const BODY_CLASS = "fullscreen";

// Keyboard Lock API (Chromium); not in TypeScript's DOM typings.
interface KeyboardLock {
  lock(keys?: string[]): Promise<void>;
  unlock(): void;
}

function keyboardOf(doc: Document): KeyboardLock | undefined {
  const nav = doc.defaultView?.navigator as (Navigator & { keyboard?: KeyboardLock }) | undefined;
  return typeof nav?.keyboard?.lock === "function" ? nav.keyboard : undefined;
}

interface FullscreenSession {
  el: HTMLElement;
  doc: Document;
  observer: MutationObserver;
  // Nodes (menus, modals, suggestion popups...) we moved from <body> into the
  // fullscreen element so they stay visible. They go back to <body> on exit.
  moved: Set<Node>;
  onChange: () => void;
}

export default class FullScreenPlugin extends Plugin {
  private session: FullscreenSession | null = null;

  onload() {
    // Keep the original command id so existing user hotkeys keep working.
    this.addCommand({
      id: "fullscreen-focus",
      name: "Toggle fullscreen focus mode",
      callback: () => this.toggle(),
    });

    // A popout window closed while fullscreen never fires fullscreenchange.
    this.registerEvent(
      this.app.workspace.on("window-close", (win) => {
        if (this.session?.doc === win.doc) this.cleanup();
      }),
    );
  }

  onunload() {
    this.exit();
  }

  private toggle() {
    // The pane may have been closed while fullscreen; drop the stale session.
    if (this.session && !this.session.el.isConnected) this.cleanup();
    if (this.session) this.exit();
    else this.enter();
  }

  private enter() {
    const leaf = this.app.workspace.getMostRecentLeaf();
    // WorkspaceLeaf.containerEl exists at runtime but is not in the public typings.
    const el = (leaf as unknown as { containerEl?: HTMLElement } | null)?.containerEl;
    if (!el) return;

    // Use the leaf's own document so this also works in popout windows.
    const doc = el.ownerDocument;

    if (typeof el.requestFullscreen !== "function") {
      new Notice("Fullscreen mode is not supported on this device.");
      return;
    }

    const moved = new Set<Node>();
    const observer = new MutationObserver((records) => {
      let focusTarget: HTMLElement | null = null;
      for (const record of records) {
        for (const node of Array.from(record.addedNodes)) {
          // The node may already have been removed/moved by a later mutation.
          if (node.parentNode !== doc.body) continue;
          el.appendChild(node);
          moved.add(node);
          // nodeType instead of instanceof: popout windows have their own HTMLElement.
          if (node.nodeType === Node.ELEMENT_NODE) {
            focusTarget =
              (node as Element).querySelector<HTMLElement>(".prompt-input") ?? focusTarget;
          }
        }
      }
      // Moving a prompt (e.g. quick switcher) steals its focus; restore it.
      focusTarget?.focus();
    });

    const onChange = () => {
      if (doc.fullscreenElement === el) {
        doc.body.classList.add(BODY_CLASS);
      } else {
        this.cleanup();
      }
    };

    // Esc is left to the editor (e.g. vim mode, issue 2); fullscreen is left via
    // the toggle command. Chromium/Electron exit element fullscreen on Esc
    // before the page sees it, so Esc is locked once fullscreen (see below).
    this.session = { el, doc, observer, moved, onChange };
    doc.addEventListener("fullscreenchange", onChange);
    observer.observe(doc.body, { childList: true });

    el.requestFullscreen()
      .then(() => {
        // While locked, a short Esc press goes to Obsidian; holding Esc still
        // exits fullscreen as an escape hatch.
        const kb = keyboardOf(doc);
        if (!kb) return console.debug("obsidian-fullscreen-plugin: Keyboard Lock API unavailable");
        return kb.lock(["Escape"]).then(
          () => {
            // Toggled off before the lock landed: release it again.
            if (this.session?.el !== el) return kb.unlock();
            console.debug("obsidian-fullscreen-plugin: Escape locked");
          },
          (err: unknown) => console.warn("obsidian-fullscreen-plugin: could not lock Escape", err),
        );
      })
      .catch((err: unknown) => {
        console.error("obsidian-fullscreen-plugin: requestFullscreen failed", err);
        new Notice("Could not enter fullscreen mode.");
        this.cleanup();
      });
  }

  private exit() {
    const session = this.session;
    if (!session) return;
    if (session.doc.fullscreenElement === session.el) {
      session.doc.exitFullscreen().catch(() => {});
    }
    this.cleanup();
  }

  private cleanup() {
    const session = this.session;
    if (!session) return;
    this.session = null;

    const { el, doc, observer, moved, onChange } = session;
    keyboardOf(doc)?.unlock();
    observer.disconnect();
    doc.removeEventListener("fullscreenchange", onChange);
    doc.body.classList.remove(BODY_CLASS);

    // Return any still-open overlays to <body> so they are not stuck inside the leaf.
    moved.forEach((node) => {
      if (node.parentNode === el) doc.body.appendChild(node);
    });
    moved.clear();
  }
}
