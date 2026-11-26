## Obsidian fullscreen plugin

Adds a **Toggle fullscreen focus mode** command that shows the active pane in fullscreen. Run it from the command palette or bind it to a hotkey. Running the command again returns Obsidian to the previous layout. A short `Esc` press does not exit fullscreen, so it stays free for the editor (for example vim mode).

While fullscreen is active, `body` has the `fullscreen` class, so themes and CSS snippets can style focus mode.

Fullscreen needs the browser Fullscreen API, which Obsidian on iOS/iPadOS does not provide. There the command shows a notice instead.

### Building

```bash
npm install
npm run build
```
