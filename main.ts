import { Plugin } from 'obsidian';

export default class FullScreenPlugin extends Plugin {
	onload() {
		this.addCommand({
			id: "fullscreen-focus",
			name: "Fullscreen focus mode",
			callback: this.fullscreenMode.bind(this),
		});
	}

	onunload() {
	}

    fullscreenMode () {
        var leaf = this.app.workspace.activeLeaf;
        if (!leaf)
			return;

        leaf.containerEl.requestFullscreen();
    };
}