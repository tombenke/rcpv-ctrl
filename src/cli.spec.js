import { expect } from 'chai'
import defaults from './config'
import cli from './cli'

before(done => {
    done()
})

after(done => {
    done()
})

describe('cli', () => {

    it('present', done => {
        const name = "rcpv"
        const uri = "http://presentations.mycompany.com"
        const processArgv = ['node', 'src/index.js', 'present', '-u', uri, '-n', name];
        const expected = {
            command: {
                name: 'present',
                type: 'async',
                args: { uri: uri, name: name }
            },
            cliConfig: {
                configFileName: "config.yml"
            }
        }

        expect(cli.parse(defaults, processArgv)).to.eql(expected)
        done()
    })
})
