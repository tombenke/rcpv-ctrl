import path from 'path'
import thisPackage from '../package.json'
/**
 * The default configuration:
 *
 *  {
 *      app: {
 *          name: {String},             // The name of the generator tool
 *          version: {String}           // The version of the generator tool
 *      },
 *      configFileName: {String},       // The name of the config file '.rest-tool.yml',
 *      logLevel: {String},             // The log level: (info | warn | error | debug)
 */
module.exports = {
    app: {
        name: thisPackage.name,
        version: thisPackage.version
    },
    pdms: {
        natsUri: "nats://localhost:4222",
        timeout: 2000
    },
    present: {
        uri: "http://localhost:3002",
        name: "demo"
    },
    configFileName: 'config.yml',
    logLevel: process.env.NCLI_ARCHETYPE_LOG_LEVEL || 'info',
    installDir: path.resolve('./')
    // Use values from environment variables if there is any needed
    // for example:
    // logLevel: process.env.REST_TOOL_LOG_LEVEL || defaults.logLevel
    // ...
}
