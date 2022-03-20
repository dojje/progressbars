import { App, Modal, Plugin} from 'obsidian';

// Remember to rename these classes and interfaces!

interface Progress {
	from: number,
	to: number,

}

interface PluginSettings {
	progresses: Progress[]
}

const DEFAULT_SETTINGS: PluginSettings = {
	progresses: []
}

export default class MyPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'open-progress-bars',
			name: 'Open progress bars',
			callback: () => {
				new ProgressBarsModal(this.app, [{from: Date.now(), to: Date.now() + 10}, {from: Date.now(), to: Date.now() + 20}]).open();
			}
		});

		this.addCommand({
			id: 'add-waiting',
			name: 'Add thing to wait for',
			callback: () => {
			}
		});



	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ProgressBarsModal extends Modal {
	progresses: Progress[];

	constructor(app: App, progresses: Progress[]) {
		super(app);
		this.progresses = progresses;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.innerHTML = "<p>"
		const waits: string[] = this.progresses.map(prog => 
			prog.from + " => " + prog.to
		)

		contentEl.innerHTML += waits.join("<br>")
		contentEl.innerHTML += "</p>"
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
