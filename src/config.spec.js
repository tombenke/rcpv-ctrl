import { expect } from 'chai'
import config from './config'
import path from 'path'
import thisPackage from '../package.json'

before(done => { done() })
after(done => { done() })

describe('config', () => {

    it('defaults', done => {
        const expected = {
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
            logLevel: 'info',
            installDir: path.resolve('./')
        }
        
        const defaults = config
        expect(defaults).to.eql(expected)
        done()
    })
})
