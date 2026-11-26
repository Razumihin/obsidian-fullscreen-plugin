## Obsidian fullscreen plugin

Focus on a single note. This plugin takes the active pane (an editor, reading view, canvas, PDF or any other view) and shows it fullscreen, hiding the sidebars, tabs, ribbon and status bar. Your workspace layout is left untouched and comes back exactly as it was when you leave fullscreen.

### Features

- **One command to toggle.** _Toggle fullscreen focus mode_ enters fullscreen for the active pane and, run again, exits it. Run it from the command palette or bind it to a hotkey in **Settings → Hotkeys**.
- **`Esc` stays with the editor.** A short `Esc` press doesn't exit fullscreen. It still closes menus and popups, leaves vim insert mode, and so on. Use the toggle command to leave fullscreen, or hold `Esc` down for a couple of seconds.
- **The rest of Obsidian keeps working.** The command palette, quick switcher, `[[` link suggestions, context menus, modals and other popups appear on top of the fullscreen note. The quick switcher's input keeps focus, so you can open another note without leaving fullscreen.
- **Popout windows.** Run the command in a popout window to make that window's pane fullscreen.
- **Theme and CSS snippet hooks.** While fullscreen is on, `body` has the `fullscreen` class and the pane matches `.workspace-leaf:fullscreen`, so themes and snippets can style focus mode (see below).
- **Hotkeys carry over.** The command id is unchanged from earlier versions, so a hotkey you already set keeps working.

### Customising focus mode with CSS

Save any of these in a CSS snippet (**Settings → Appearance → CSS snippets**):

```css
/* Wider text column while fullscreen */
.workspace-leaf:fullscreen {
  --file-line-width: 900px;
}

/* Larger text while fullscreen */
.workspace-leaf:fullscreen {
  --font-text-size: 20px;
}

/* Hide the note's title bar for a distraction-free page */
.workspace-leaf:fullscreen .view-header {
  display: none;
}
```

### Limitations

- **Not available on iPhone or iPad.** iOS doesn't support fullscreen for part of a page, so the command shows a notice instead. It's built for desktop; it hasn't been tested on Android.
- **One pane at a time.** Only the active pane goes fullscreen; split panes and other tabs are hidden until you exit.
- **Window-level fullscreen is separate.** The plugin uses the pane-level fullscreen built into Obsidian's browser engine. It doesn't move or resize the Obsidian window itself.

### Installation

From Obsidian: **Settings → Community plugins → Browse**, search for _Fullscreen mode plugin_, install it and enable it.

Manually: copy `main.js`, `manifest.json` and `styles.css` from the [latest release](https://github.com/Razumihin/obsidian-fullscreen-plugin/releases/latest) into `<vault>/.obsidian/plugins/obsidian-fullscreen-plugin/`, then enable the plugin under **Settings → Community plugins**.

Requires Obsidian 0.15.4 or newer.

### Changelog

**0.1.3**
- Fixed: the plugin failed to load on current Obsidian versions with "Class constructor … cannot be invoked without 'new'".
- The command is now a toggle: run it again to exit fullscreen.
- A short `Esc` press no longer exits fullscreen, so it can be used in the editor (for example in vim mode). Hold `Esc` down to exit.
- Menus and popups no longer get stuck in the pane after you exit fullscreen.
- Fixed a problem where fullscreen could get stuck after its popout window or pane was closed.
- Works in popout windows. Disabling the plugin now exits fullscreen cleanly.

### Building

```bash
npm install
npm run build
```

`npm run dev` rebuilds on every change.
