import moment from 'moment';
import { App, MarkdownPostProcessorContext, Modal, Notice, Plugin, TFile} from 'obsidian';

// Remember to rename these classes and interfaces!

interface Progress {
	name: string;
	from: moment.Moment,
	to: moment.Moment,
}

interface PluginSettings {
	progresses: Progress[]
}

const DEFAULT_SETTINGS: PluginSettings = {
	progresses: []
}

const renderBar = (prog: Progress, el: HTMLElement) => {
	let whole = prog.from.diff(prog.to, 'seconds');
	let dur = prog.from.diff(moment(), 'seconds');
	let percent = (dur / whole) * 100;

	el.style.margin = "10px 0";

	let container = document.createElement("div");
	container.style.display = "flex";
	container.style.alignContent = "space-between";
	container.style.width = "100%";

	let bar = document.createElement("div");
	bar.style.width = `88%`;
	bar.style.backgroundColor = "#111";

	let indicator = document.createElement("div");
	indicator.style.height = "100%";
	indicator.style.width = `${percent}%`;
	indicator.style.backgroundColor = "green";

	let percentage = document.createElement("div");
	if (percent < 10) {
		percentage.innerHTML += "0"
	}

	percentage.innerHTML += `${percent.toFixed(2)}%`;

	percentage.style.marginLeft = "auto";

	let label = document.createElement("div");
	label.innerHTML = prog.name + ":"

	bar.appendChild(indicator);
	container.appendChild(bar);
	container.appendChild(percentage);
	el.appendChild(label);
	el.appendChild(container);
}

export default class MyPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'open-progress-bars',
			name: 'Open progress bars',
			callback: () => {
				new ProgressBarsModal(this.app).open();
			}
		});

		this.registerMarkdownCodeBlockProcessor("progressbar", async (md: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			console.log(md);

			// Parse the markdown
			const [name, from, to] = md.split(/\n/);
			const fromDate = moment(from, "YYYY-MM-DD");
			const toDate = moment(to, "YYYY-MM-DD");

			let prog = {
				name: name,
				from: fromDate,
				to: toDate
			}

			renderBar(prog, el);
			// text += "<div>&nbsp;" + Math.round(percent * 100) / 100 + "%</div>";
		})
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ProgressBarsModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	async onOpen() {
		const {contentEl} = this;
		let progresses: Progress[] = []

		for (let file of this.app.vault.getFiles()) {
			let p = parse(await this.app.vault.read(file));
			
			if (p) {
				progresses = progresses.concat(p);
			}
		}

		for (let prog of progresses) {
			let el = document.createElement("div");

			renderBar(prog, el);

			contentEl.append(el);
		}

	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

function parse(text: string): Progress[] {
	let lines = text.split("\n");
	let progresses: Progress[] = [];

	let lineNo = 0;
	while (lineNo < lines.length) {
		if (lines[lineNo] == "```progressbar") {
			lineNo++;
			let name = lines[lineNo];
			lineNo++;
			let start = moment(lines[lineNo], "YYYY-MM-DD HH:mm:ss");
			lineNo++;
			let end = moment(lines[lineNo], "YYYY-MM-DD HH:mm:ss");
			
			progresses.push({from: start, to: end, name: name});

		}

		lineNo++;
	}
	return progresses;
}
