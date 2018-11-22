#!/usr/bin/env node
/*jshint node: true */
'use strict';

const yargs = require('yargs')

const parse = (defaults, processArgv=process.argv) => {

   
    let results = {}

    yargs(processArgv.slice(2))
//        .exitProcess(false)
        .command('present', 'Present arguments', yargs =>
            yargs
                .option("config", {
                    alias: "c",
                    desc: "The name of the configuration file",
                    default: defaults.configFileName
                })
                .option("uri", {
                    alias: "u",
                    desc: "A base URI of the presentation content server",
                    type: 'string',
                    default: defaults.present.url
                })
                .option("name", {
                    alias: "n",
                    desc: "A name of the presentation",
                    type: 'string',
                    default: defaults.present.name
                })
                .demandOption([]),
            argv => {
                results = {
                    command: {
                        name: 'present',
                        type: 'async', // sync | async
                        args: {
                            uri: argv.uri,
                            name: argv.name
                        },
                    },
                    cliConfig: {
                        configFileName: argv.config
                    }
                }
            }
        )

        .demandCommand(1, "Must use a command!")
        .showHelpOnFail(false, 'Specify --help for available options')
        .help()
        .parse()

    return results
}

module.exports = {
    parse
}
