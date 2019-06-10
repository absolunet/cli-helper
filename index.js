//--------------------------------------------------------
//-- CLI utilities
//--------------------------------------------------------
'use strict';

const chalk        = require('chalk');
const glob         = require('glob');
const indentString = require('indent-string');
const omelette     = require('omelette');
const os           = require('os');
const ow           = require('ow');
const path         = require('path');
const readPkgUp    = require('read-pkg-up');
const stringWidth  = require('string-width');
const terminal     = require('@absolunet/terminal');
const pad          = require('@absolunet/terminal-pad');


//-- Static properties
const __ = {
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


const owIsMeow = ow.create(ow.object.nonEmpty.hasKeys('input', 'flags', 'pkg', 'help').label('meowCli'));


//-- Command details
const cmdDetails = (cmd) => {
	const [task, subtask] = cmd.split(' ');
	const [call, desc]    = subtask ? __.commands[task][subtask] : __.commands[task];

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
	Object.keys(__.commands).forEach((task) => {
		const treeTask = __.commands[task];
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
	const name = path.basename(__.pkg.name);
	const complete = omelette(name).tree(autocomplete);
	complete.init();
};






class Cli {

	//-- Local ow
	get ow() {
		return ow;
	}


	//-- User helpers
	get placeholder() {
		return chalk.green;
	}

	optional(name) {
		ow(name, ow.string.nonEmpty);

		return `${chalk.reset('[')}${chalk.yellow(name)}${chalk.reset(']')}`;
	}

	optionalPlaceholder(name) {
		ow(name, ow.string.nonEmpty);

		return `${chalk.reset('[')}${this.placeholder(name)}${chalk.reset(']')}`;
	}


	//-- Set tasks
	init({ pkgPath, pkg } = {}) {
		ow(pkgPath, ow.any(ow.undefined, ow.string.nonEmpty));
		ow(pkg, ow.any(ow.undefined, ow.object.nonEmpty));

		__.pkgPath = pkgPath || path.dirname(module.parent.filename);
		__.pkg     = pkg     || readPkgUp.sync({ cwd:__.pkgPath }).pkg;
	}


	//-- Set tasks
	setUsageTasks(commands) {
		ow(commands, ow.object.nonEmpty);

		__.commands = commands;
		initAutocomplete();
	}


	//-- Get binary name
	get binName() {
		return Object.keys(__.pkg.bin)[0];
	}


	//-- Set full usage
	setFullUsage(fullUsage, { showBin = true } = {}) {
		ow(fullUsage, ow.object.nonEmpty);
		ow(showBin, ow.boolean);

		__.fullUsage = fullUsage;
		__.showBin   = showBin;
	}


	//-- Get full usage
	get fullUsage() {
		const length = (() => {
			const lengths = [];
			Object.keys(__.fullUsage).forEach((group) => {
				__.fullUsage[group].forEach((cmd) => {
					const { call } = cmdDetails(cmd);
					lengths.push(stringWidth(call));
				});
			});

			return Math.max(...lengths);
		})();

		let usage = `Usage: ${chalk.yellow(this.binName)} ${chalk.cyan('<command>')}\n`;

		Object.keys(__.fullUsage).forEach((group) => {
			usage += `\n${chalk.underline(group)}\n`;

			__.fullUsage[group].forEach((cmd) => {
				usage += `${cmdUsage(cmd, length, 5)}\n`;
			});
		});

		if (__.showBin) {
			usage += `\n${this.binName}@${__.pkg.version} ${__.pkgPath}`;
		}

		return usage;
	}


	//-- Get task usage
	getTaskUsage(task) {
		ow(task, ow.any(ow.undefined, ow.string.nonEmpty));

		if (task) {
			const subs = !Array.isArray(__.commands[task]);

			let usage = `${chalk.underline('Usage:')}\n`;
			if (subs) {

				const length = (() => {
					const lengths = [];
					Object.values(__.commands[task]).forEach((subtask) => {
						const { call } = cmdDetails(`${task} ${subtask[0]}`);
						lengths.push(stringWidth(call));
					});

					return Math.max(...lengths);
				})();

				Object.values(__.commands[task]).forEach((subtask) => {
					usage += `${chalk.yellow(`${this.binName}`)} ${cmdUsage(`${task} ${subtask[0]}`, length, 3)}\n`;
				});
			} else {
				usage += `${chalk.yellow(this.binName)} ${cmdUsage(task, 0, 2)}\n`;
			}

			return indentString(usage, 2);
		}

		return this.fullUsage;
	}


	//-- Show task usage and die
	showTaskUsage(meowCli) {
		owIsMeow(meowCli);

		terminal.echo(`\n${this.getTaskUsage(meowCli.input[0])}`);
		terminal.exit();
	}






	//-- Raw arguments
	get rawArguments() {
		const args = process.argv.slice(2);
		args.shift();

		return args.join(' ');
	}

	//-- Refuse arguments
	refuseArguments(meowCli) {
		owIsMeow(meowCli);

		if (meowCli.input.length > 1) {
			this.showTaskUsage(meowCli);
		}
	}

	//-- Refuse flags
	refuseFlags(meowCli) {
		owIsMeow(meowCli);

		if (Object.keys(meowCli.flags).length !== 0) {
			this.showTaskUsage(meowCli);
		}
	}

	//-- Refuse flags & arguments
	refuseFlagsAndArguments(meowCli) {
		owIsMeow(meowCli);

		if (meowCli.input.length > 1 || Object.keys(meowCli.flags).length !== 0) {
			this.showTaskUsage(meowCli);
		}
	}

	//-- Accept only these flags
	validateFlags(meowCli, flagValidations) {
		owIsMeow(meowCli);
		ow(flagValidations, ow.object.nonEmpty);

		const inputFlags   = Object.keys(meowCli.flags);
		const allowedFlags = Object.keys(flagValidations);

		if (inputFlags.length === 0) {
			return {};

		} else if (inputFlags.length <= allowedFlags.length) {
			const areFlagsValid = inputFlags.every((flag) => {
				return allowedFlags.includes(flag) && ow.isValid(meowCli.flags[flag], flagValidations[flag]);
			});

			if (areFlagsValid) {
				return meowCli.flags;
			}

			return this.showTaskUsage(meowCli);
		}

		return this.showTaskUsage(meowCli);
	}






	//-- List tasks files
	initTasksList(tasksPath) {
		ow(tasksPath, ow.string.nonEmpty);

		__.tasks.path = tasksPath;

		const tasks = [];

		glob.sync(`${__.tasks.path}/**/!(default).js`).forEach((task) => {
			tasks.push(task.split(__.tasks.path).slice(-1).pop().substring(1).slice(0, -3).replace(/\//g, ':'));
		});

		__.tasks.list = tasks;
	}


	//-- Route to good task
	tasksRouter(meowCli) {
		owIsMeow(meowCli);

		const [task] = meowCli.input;

		if (task) {
			if (__.tasks.list.includes(task)) {
				require(`${__.tasks.path}/${task.replace(/:/g, '/')}`).cli(meowCli);  // eslint-disable-line global-require
			} else {
				meowCli.showHelp();
			}
		} else {
			require(`${__.tasks.path}/default`).cli(meowCli);  // eslint-disable-line global-require
		}
	}


	//-- Tasks
	get tasks() {
		return __.tasks.list;
	}






	//-- Is root
	isRoot() {
		const user = os.userInfo();

		return user.uid === 0 || user.gid === 0 || user.username === 'root';
	}

}


module.exports = new Cli();
