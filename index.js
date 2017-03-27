//--------------------------------------------------------
//-- CLI utilities
//--------------------------------------------------------
'use strict';

const echo = console.log; // eslint-disable-line no-console

const os          = require('os');
const path        = require('path');
const glob        = require('glob');
const readPkgUp   = require('read-pkg-up');
const chalk       = require('chalk');
const pad         = require('pad');
// const widestLine  = require('widest-line');
// const stringWidth = require('string-width');

delete require.cache[__filename];
const pkgPath = path.dirname(module.parent.filename);
const { pkg } = readPkgUp.sync({ cwd:pkgPath });






//-- Static properties
const STATIC = global.___AbsolunetCli___ ? global.___AbsolunetCli___ : global.___AbsolunetCli___ = {
	commands:  {},
	taskWidth: {},
	fullUsage: {},
	baseWidth: 0,
	tasks:     {
		path: '',
		list: []
	}
};


//-- Command usage
const printCmd = (cmd, width = STATIC.baseWidth, spacer = 1) => {
	const [task, subtask] = cmd.split(' ');
	const [name, desc, delta = 0] = subtask ? STATIC.commands[task][subtask] : STATIC.commands[task];

	return `${pad(chalk.yellow(name), width + delta)}${' '.repeat(spacer)}${desc}`;
};







module.exports = class Cli {

	//-- Usager helpers
	static get PLACEHOLDER() {
		return 10;
	}

	static get OPTIONALPLACEHOLDER() {
		return 26;
	}

	static get placeholder() {
		return chalk.green;
	}

	static optionalPlaceholder(name) {
		return `${chalk.reset('[')}${this.placeholder(name)}${chalk.reset(']')}`;
	}


	//-- Set tasks
	static setUsageTasks(commands, taskWidth) {
		STATIC.commands  = commands;
		STATIC.taskWidth = taskWidth;
	}


	//-- Set full usage
	static setFullUsage(fullUsage, baseWidth) {
		STATIC.fullUsage = fullUsage;
		STATIC.baseWidth = baseWidth;
	}


	//-- Get full usage
	static get fullUsage() {
		let usage = `Usage: ${chalk.yellow(pkg.name)} ${chalk.cyan('<command>')}\n`;

		Object.keys(STATIC.fullUsage).forEach((group) => {
			usage += `\n${chalk.underline(group)}\n`;

			STATIC.fullUsage[group].forEach((task) => {
				usage += `${printCmd(task)}\n`;
			});
		});

		usage += `\n${pkg.name}@${pkg.version} ${pkgPath}`;

		return usage;
	}


	//-- Get task usage
	static getTaskUsage(task) {
		const subs = !Array.isArray(STATIC.commands[task]);

		let usage = `  ${chalk.underline('Usage:')}\n`;
		if (subs) {
			Object.values(STATIC.commands[task]).forEach((item) => {
				usage += `  ${chalk.yellow(`${pkg.name} ${task}`)} ${printCmd(`${task} ${item[0]}`, STATIC.taskWidth[task])}\n`;
			});
		} else {
			usage += `  ${chalk.yellow(pkg.name)} ${printCmd(task, 0, 3)}\n`;
		}

		return usage;
	}


	//-- Show task usage and die
	static showTaskUsage(meowCli) {
		echo(`\n${this.getTaskUsage(meowCli.input[0])}`);
		process.exit(2); // eslint-disable-line no-process-exit
	}






	//-- Raw arguments
	static get rawArguments() {
		const args = process.argv.slice(2);
		args.shift();

		return args.join(' ');
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






	//-- List tasks files
	static initTasksList(tasksPath) {
		STATIC.tasks.path = tasksPath;

		const tasks = [];

		glob.sync(`${STATIC.tasks.path}/!(default).js`).forEach((task) => {
			tasks.push(task.split(STATIC.tasks.path).slice(-1).pop().substring(1).slice(0, -3));
		});

		STATIC.tasks.list = tasks;
	}


	//-- Route to good task
	static tasksRouter(meowCli) {
		const [task] = meowCli.input;

		if (task) {
			if (STATIC.tasks.list.includes(task)) {
				require(`${STATIC.tasks.path}/${task}`)(meowCli);  // eslint-disable-line global-require
			} else {
				meowCli.showHelp();
			}
		} else {
			require(`${STATIC.tasks.path}/default`)(meowCli);  // eslint-disable-line global-require
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
