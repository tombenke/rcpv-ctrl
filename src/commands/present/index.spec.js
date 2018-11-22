import npac from 'npac'
import { expect } from 'chai'
import defaults from '../../config'
import { getPresentationsIdx, getTheNarrative, execute } from './index'
import { presentationsIdx, demoNarrative } from './fixtures/'
import * as _ from 'lodash'
import rimraf from 'rimraf'
import sinon from 'sinon'
import nock from 'nock'
import pdms from 'npac-pdms-hemera-adapter'
import npacNatsRxjsGw from 'npac-nats-rxjs-gw'
import { removeSignalHandlers, catchExitSignals, npacStart } from './npacUtils'
import commands from '../'
import { map } from 'rxjs/operators'

describe('commands/present', () => {
    let sandbox

    beforeEach(function(done) {
        sandbox = sinon.sandbox.create({})
        done()
    })

    afterEach(function(done) {
        sandbox.restore()
        nock.cleanAll()
        done()
    })

    const stopServer = () => {
        console.log('Send SIGTERM signal')
        process.kill(process.pid, 'SIGTERM')
    }

    // Define the adapters and executives to add to the container
    const adapters = [
        npac.mergeConfig(config),
        npac.addLogger,
        pdms.startup,
        npacNatsRxjsGw.startup,
        commands
    ]

    const terminators = [
        npacNatsRxjsGw.shutdown,
        pdms.shutdown
    ]

    //const natsUri = 'nats:localhost:4222'
    const natsUri = "nats://demo.nats.io:4222"
    const config = _.merge({}, defaults, { pdms: { natsUri: natsUri } })

    const presentContainer = {
        config: config
    }

    const origin = 'http://localhost'
    const uri = origin
    const name = "demo"
    const presentCommand = {
        name: 'present',
        type: 'async',
        args: { uri: uri, name: name }
    }

    it('#present.getTheNarrative', (done) => {

        const server = nock(origin)
            .get(`/${name}/narrative.json`)
            .reply(200, demoNarrative)

        const ctx = { logging: console.log }

        getTheNarrative(ctx, uri, name).then(res => {
            console.log(`Succeed: ${JSON.stringify(res)}`)
            expect(res).to.eql(demoNarrative)
            done()
        }).catch(err => {
            console.log(`Failure: ${JSON.stringify(err)}`)
            done(err)
        })
    })

    it('#present.getPresentationsIdx', (done) => {
        const responseBody = {
            "demo": "/demo/"
        }
        const server = nock(origin)
            .get(`/index.json`)
            .reply(200, presentationsIdx)

        const ctx = { logging: console.log }

        getPresentationsIdx(ctx, uri).then(res => {
            console.log(`Succeed: ${JSON.stringify(res)}`)
            expect(res).to.eql(presentationsIdx)
            done()
        }).catch(err => {
            console.log(`Failure: ${JSON.stringify(err)}`)
            done(err)
        })
    })

    it('#present.execute', (done) => {
        nock(origin)
            .get(`/index.json`)
            .reply(200, presentationsIdx)

        nock(origin)
            .get(`/${name}/narrative.json`)
            .reply(200, demoNarrative)

        const setupRxjsLoopbackJob = (container, next) => {
            const speakObservable = container.npacNatsRxjsGw.natsTopicObservable('speak')
            const speakStatusTapWriter = container.npacNatsRxjsGw.natsTopicTapWriter('speakStatus')
            speakObservable.pipe(map(it => it), speakStatusTapWriter).subscribe(it => console.log('SPEAK: ', it))
            next(null, null)
        }

        catchExitSignals(sandbox, done)
        const callCommand = (command) => npac.makeCall(command)
        const jobs = [setupRxjsLoopbackJob, callCommand(presentCommand)]
        const endCb = (err, res) => {
            console.log('npac jobs finished with: ', err, res)
            process.kill(process.pid, 'SIGTERM')
        }

        console.log(adapters, terminators)
        npac.start(adapters, jobs, terminators, endCb)
    }).timeout(10000)
})
