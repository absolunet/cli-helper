//--------------------------------------------------------
//-- CLI helper
//--------------------------------------------------------
'use strict';

const echo = console.log; // eslint-disable-line no-console

const os        = require('os');
const path      = require('path');
const readPkgUp = require('read-pkg-up');
const chalk     = require('chalk');
const pad       = require('pad');

delete require.cache[__filename];
const pkgPath = path.dirname(module.parent.filename);
const { pkg } = readPkgUp.sync({ cwd:pkgPath });






//-- Static properties
const STATIC = global.___AbsolunetCLIHelper___ ? global.___AbsolunetCLIHelper___ : global.___AbsolunetCLIHelper___ = {
	commands:  {},
	taskWidth: {},
	fullUsage: {},
	baseWidth: 0
};


//-- Command usage
const printCmd = (cmd, width = STATIC.baseWidth, spacer = 1) => {
	const [task, subtask] = cmd.split(' ');
	const [name, desc, delta = 0] = subtask ? STATIC.commands[task][subtask] : STATIC.commands[task];

	return `${pad(chalk.yellow(name), width + delta)}${' '.repeat(spacer)}${desc}`;
};







module.exports = class CLIHelper {

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
		return `${chalk.reset('[')}${CLIHelper.placeholder(name)}${chalk.reset(']')}`;
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
	static showTaskUsage(cli) {
		echo(`\n${CLIHelper.getTaskUsage(cli.input[0])}`);
		process.exit(2); // eslint-disable-line no-process-exit
	}






	//-- Raw arguments
	static get rawArguments() {
		const args = process.argv.slice(2);
		args.shift();

		return args.join(' ');
	}

	//-- Refuse flags
	static refuseFlags(cli) {
		if (Object.keys(cli.flags).length) {
			CLIHelper.showTaskUsage(cli);
		}
	}

	//-- Refuse flags & arguments
	static refuseFlagsAndArguments(cli) {
		if (cli.input.length > 1 || Object.keys(cli.flags).length) {
			CLIHelper.showTaskUsage(cli);
		}
	}






	//-- Is root
	static isRoot() {
		const user = os.userInfo();

		return user.uid === 0 || user.gid === 0 || user.username === 'root';
	}

};
