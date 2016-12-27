#!/usr/bin/env node

var argv = require('yargs')
    .usage('Usage: webpack-stats-duplicates <stats.json>')
    .demand(1, 'Please specify a <stats.json> file.')
    .normalize()
    .option('c', {
        describe: 'Specify the location of the .webpack-stats-duplicates-rc file',
        alias: 'config',
        normalize: true
    })
    .option('d', {
        describe: 'Do not use the .webpack-stats-duplicates-rc file',
        alias: 'disable-config',
        boolean: true
    })
    .option('w', {
        describe: 'Comma separated list of whitelisted module paths',
        alias: 'whitelist',
        string: true
    })
    .help('h')
    .alias('h', 'help')
    .argv;

var fs = require('fs');
var findDuplicates = require('./lib/findDuplicates');
var printDuplicates = require('./lib/printDuplicates');
var file = argv._[0];

// Parse the stats.json file
var json;
try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (e) {
    console.log(`Invalid file: ${file}\n`);
    process.exit(1);
}

// --config option
var config;
if (argv.config) {
    config = argv.config;
} else {
    var DEFAULT_CONFIG = './.webpack-stats-duplicates-rc';
    if (fs.existsSync(DEFAULT_CONFIG)) {
        config = DEFAULT_CONFIG;
    }
}

var options = {};

// Load configuration from rc file unless --disable-config
if (config && !argv.disableConfig) {
    try {
        options = JSON.parse(fs.readFileSync(config, 'utf8'));
    } catch (e) {
        console.log(`Invalid configuration file: ${config}`);
        process.exit(1);
    }
}

// --whitelist option
if (argv.whitelist) {
    options.whitelist = argv.whitelist.split(',');
}

var duplicates = findDuplicates(json, options);
printDuplicates(duplicates);

// Error code (1) if there are any duplicate results
process.exit(Math.min(duplicates.length, 1));
