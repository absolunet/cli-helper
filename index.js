//--------------------------------------------------------
//-- CLI utilities
//--------------------------------------------------------
'use strict';

const os           = require('os');
const path         = require('path');
const glob         = require('glob');
const readPkgUp    = require('read-pkg-up');
const omelette     = require('omelette');
const chalk        = require('chalk');
const indentString = require('indent-string');
const stringWidth  = require('string-width');
const pad          = require('@absolunet/terminal-pad');
const terminal     = require('@absolunet/terminal');






//-- Static properties
const STATIC = global.___AbsolunetCli___ ? global.___AbsolunetCli___ : global.___AbsolunetCli___ = {
	pkgPath:   '',
	pkg:       {},
	commands:  {},
	fullUsage: {},
	showBin:   true,
	tasks:     {
		path: '',
		list: []
	}
};



//-- Command details
const cmdDetails = (cmd) => {
	const [task, subtask] = cmd.split(' ');
	const [call, desc]    = subtask ? STATIC.commands[task][subtask] : STATIC.commands[task];

	return {
		call: subtask ? `${task} ${call}` : call,
		desc: desc
	};
};


//-- Command usage
const cmdUsage = (cmd, length, spacer) => {
	const { call, desc } = cmdDetails(cmd);

	return `${chalk.yellow(length ? pad(call, length) : call)}${' '.repeat(spacer)}${desc}`;
};


//-- Initialize autocomplete
const initAutocomplete = () => {

	// Add array of params
	const _addParams = (tree, lists) => {
		if (lists) {
			lists[0].forEach((param1) => {
				tree[param1] = {};

				if (lists[1]) {
					lists[1].forEach((param2) => {
						tree[param1][param2] = {};
					});
				}
			});
		}
	};

	// Build autocomplete tree
	const autocomplete = {};
	Object.keys(STATIC.commands).forEach((task) => {
		const treeTask = STATIC.commands[task];
		autocomplete[task] = {};

		if (!Array.isArray(treeTask)) {
			Object.keys(treeTask).forEach((subtask) => {
				const treeSubtask = treeTask[subtask];
				autocomplete[task][subtask] = {};
				_addParams(autocomplete[task][subtask], treeSubtask[2]);
			});

		} else {
			_addParams(autocomplete[task], treeTask[2]);
		}
	});


	// Breaks eggs
	const complete = omelette(STATIC.pkg.name).tree(autocomplete);
	complete.init();
};





module.exports = class Cli {

	//-- User helpers
	static get placeholder() {
		return chalk.green;
	}

	static optional(name) {
		return `${chalk.reset('[')}${chalk.yellow(name)}${chalk.reset(']')}`;
	}

	static optionalPlaceholder(name) {
		return `${chalk.reset('[')}${this.placeholder(name)}${chalk.reset(']')}`;
	}


	//-- Set tasks
	static init({ pkgPath, pkg } = {}) {
		delete require.cache[__filename];

		STATIC.pkgPath = pkgPath || path.dirname(module.parent.filename);
		STATIC.pkg     = pkg     || readPkgUp.sync({ cwd:STATIC.pkgPath }).pkg;
	}


	//-- Set tasks
	static setUsageTasks(commands) {
		STATIC.commands = commands;
		initAutocomplete();
	}


	//-- Get binary name
	static get binName() {
		return Object.keys(STATIC.pkg.bin)[0];
	}


	//-- Set full usage
	static setFullUsage(fullUsage, { showBin = true } = {}) {
		STATIC.fullUsage = fullUsage;
		STATIC.showBin   = showBin;
	}


	//-- Get full usage
	static get fullUsage() {
		const length = (() => {
			const lengths = [];
			Object.keys(STATIC.fullUsage).forEach((group) => {
				STATIC.fullUsage[group].forEach((cmd) => {
					const { call } = cmdDetails(cmd);
					lengths.push(stringWidth(call));
				});
			});

			return Math.max(...lengths);
		})();

		let usage = `Usage: ${chalk.yellow(this.binName)} ${chalk.cyan('<command>')}\n`;

		Object.keys(STATIC.fullUsage).forEach((group) => {
			usage += `\n${chalk.underline(group)}\n`;

			STATIC.fullUsage[group].forEach((cmd) => {
				usage += `${cmdUsage(cmd, length, 5)}\n`;
			});
		});

		if (STATIC.showBin) {
			usage += `\n${this.binName}@${STATIC.pkg.version} ${STATIC.pkgPath}`;
		}

		return usage;
	}


	//-- Get task usage
	static getTaskUsage(task) {
		const subs = !Array.isArray(STATIC.commands[task]);

		let usage = `${chalk.underline('Usage:')}\n`;
		if (subs) {

			const length = (() => {
				const lengths = [];
				Object.values(STATIC.commands[task]).forEach((subtask) => {
					const { call } = cmdDetails(`${task} ${subtask[0]}`);
					lengths.push(stringWidth(call));
				});

				return Math.max(...lengths);
			})();

			Object.values(STATIC.commands[task]).forEach((subtask) => {
				usage += `${chalk.yellow(`${this.binName}`)} ${cmdUsage(`${task} ${subtask[0]}`, length, 3)}\n`;
			});
		} else {
			usage += `${chalk.yellow(this.binName)} ${cmdUsage(task, 0, 2)}\n`;
		}

		return indentString(usage, 2);
	}


	//-- Show task usage and die
	static showTaskUsage(meowCli) {
		terminal.echo(`\n${this.getTaskUsage(meowCli.input[0])}`);
		terminal.exit();
	}






	//-- Raw arguments
	static get rawArguments() {
		const args = process.argv.slice(2);
		args.shift();

		return args.join(' ');
	}

	//-- Refuse arguments
	static refuseArguments(meowCli) {
		if (meowCli.input.length > 1) {
			this.showTaskUsage(meowCli);
		}
	}

	//-- Refuse flags
	static refuseFlags(meowCli) {
		if (Object.keys(meowCli.flags).length) {
			this.showTaskUsage(meowCli);
		}
	}

	//-- Refuse flags & arguments
	static refuseFlagsAndArguments(meowCli) {
		if (meowCli.input.length > 1 || Object.keys(meowCli.flags).length) {
			this.showTaskUsage(meowCli);
		}
	}

	//-- Accept only this flag
	static acceptOnlyFlag(meowCli, flag) {
		if (Object.keys(meowCli.flags).length === 1 && meowCli.flags[flag]) {
			return meowCli.flags[flag];

		} else if (Object.keys(meowCli.flags).length !== 0) {
			this.showTaskUsage(meowCli);
		}

		return false;
	}






	//-- List tasks files
	static initTasksList(tasksPath) {
		STATIC.tasks.path = tasksPath;

		const tasks = [];

		glob.sync(`${STATIC.tasks.path}/**/!(default).js`).forEach((task) => {
			tasks.push(task.split(STATIC.tasks.path).slice(-1).pop().substring(1).slice(0, -3).replace(/\//g, ':'));
		});

		STATIC.tasks.list = tasks;
	}


	//-- Route to good task
	static tasksRouter(meowCli) {
		const [task] = meowCli.input;

		if (task) {
			if (STATIC.tasks.list.includes(task)) {
				require(`${STATIC.tasks.path}/${task.replace(/:/g, '/')}`).cli(meowCli);  // eslint-disable-line global-require
			} else {
				meowCli.showHelp();
			}
		} else {
			require(`${STATIC.tasks.path}/default`).cli(meowCli);  // eslint-disable-line global-require
		}
	}


	//-- Tasks
	static get tasks() {
		return STATIC.tasks.list;
	}






	//-- Is root
	static isRoot() {
		const user = os.userInfo();

		return user.uid === 0 || user.gid === 0 || user.username === 'root';
	}

};
