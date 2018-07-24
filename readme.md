# @absolunet/cli

[![npm](https://img.shields.io/npm/v/@absolunet/cli.svg)](https://www.npmjs.com/package/@absolunet/cli)
[![npm dependencies](https://david-dm.org/absolunet/node-cli/status.svg)](https://david-dm.org/absolunet/node-cli)
[![npms](https://badges.npms.io/%40absolunet%2Fcli.svg)](https://npms.io/search?q=%40absolunet%2Fcli)
[![Travis CI](https://api.travis-ci.org/absolunet/node-cli.svg?branch=master)](https://travis-ci.org/absolunet/node-cli/builds)
[![Code style ESLint](https://img.shields.io/badge/code_style-@absolunet/node-659d32.svg)](https://github.com/absolunet/eslint-config-node)

> CLI utilities

Built around [meow](https://www.npmjs.com/package/meow)


## Install

```sh
$ npm install @absolunet/cli
```


## Usage

```js
const cli = require('@absolunet/cli');

cli.initTasksList('./tasks');

cli.setUsageTasks({

	// Base
	'start': ['start', 'Start project'],
	'stop':  ['stop',  'Stop project'],
	'log':   [`log ${cli.optionalPlaceholder('<sub>')}`, 'Show log for sub', ['sub1', 'sub2']],

	// Options
	'--help':    ['-h, --help',    'Show help'],
	'--version': ['-v, --version', 'Show version']

});

cli.setFullUsage({
	'Base':    ['start', 'stop', 'log'],
	'Options': ['--help', '--version']
});

console.log(cli.fullUsage);
```

```
	Test project description

	Usage: testprj <command>

	Base
	start             Start project
	stop              Stop project
	log [<sub>]       Show log for sub [sub1|sub2]

	Options
	-h, --help        Show help
	-v, --version     Show version

	testprj@1.2.3 /usr/local/bin/testprj
```


<br>
<br>

### `init([options])`
Build tasks list from js filenames

#### options.pkgPath
Type: `string`<br>
Path to `package.json` folder

#### options.pkg
Type: `object`<br>
`package.json`-like object


<br>


## API - Tasks

### `initTasksList(tasksPath)`
Build tasks list from js filenames

#### tasksPath
*Required*<br>
Type: `string`<br>
Path to tasks folder




<br>

### `tasksRouter(meowCli)`
Require task file specified by CLI

#### meowCli
*Required*<br>
Type: `object`<br>
meow object




<br>

### `tasks`
Type: `Array`<br>
List of tasks








<br>
<br>

## API - Usage

### `placeholder(name)`
Look placeholder<br>
Return `string` of looked placeholder

#### name
*Required*<br>
Type: `string`<br>
Text to theme




<br>

### `optional(name)`
Look optional<br>
Return `string` of looked optional

#### name
*Required*<br>
Type: `string`<br>
Text to theme




<br>

### `optionalPlaceholder(name)`
Look optional placeholder<br>
Return `string` of looked optional placeholder

#### name
*Required*<br>
Type: `string`<br>
Text to theme




<br>

### `setUsageTasks(commands)`
Set tasks usage and autocomplete data

#### commands
*Required*<br>
Type: `object`<br>
Check example for structure




<br>

### `setFullUsage(fullUsage [, options])`
Set full usage structure

#### fullUsage
*Required*<br>
Type: `object`<br>
Check example for structure

#### options.showBin
Type: `boolean`<br>
Show version and bin location<br>
*Default: true*


<br>

### `getTaskUsage(task)`
Get task usage<br>
Return `string` of task usage

#### task
*Required*<br>
Type: `string`<br>
Check example for structure




<br>

### `showTaskUsage(meowCli)`
Display task usage and quit

#### meowCli
*Required*<br>
Type: `object`<br>
meow object




<br>

### `fullUsage`
Type: `string`<br>
Description and tasks formatted as a user manual








<br>
<br>

## API - Helpers

### `refuseArguments(meowCli)`
Show task usage and quit if CLI call has arguments

#### meowCli
*Required*<br>
Type: `object`<br>
meow object




<br>

### `refuseFlags(meowCli)`
Show task usage and quit if CLI call has flags

#### meowCli
*Required*<br>
Type: `object`<br>
meow object




<br>

### `refuseFlagsAndArguments(meowCli)`
Show task usage and quit if CLI call has arguments or flags

#### meowCli
*Required*<br>
Type: `object`<br>
meow object




<br>

### `validateFlags(meowCli, flag)`
Show task usage and quit if CLI call has flags that are not whitelisted and do not validate<br>
Return `object` of flags values

#### meowCli
*Required*<br>
Type: `object`<br>
meow object

#### flagValidations
*Required*<br>
Type: `object` of flag validators<br>
Whitelisted flags and their `ow` [predicate](https://github.com/sindresorhus/ow/#api)




<br>

### `isRoot()`
Check if CLI is run by root user<br>
Return `boolean`




<br>

### `binName`
Type: `string`<br>
Binary name




<br>

### `rawArguments`
Type: `string`<br>
Space separated arguments from terminal








<br>
<br>

## License

MIT © [Absolunet](https://absolunet.com)
