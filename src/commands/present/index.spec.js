import npac from 'npac'
import { expect } from 'chai'
import defaults from '../../config'
import { getPresentationsIdx, getTheNarrative, execute } from './index'
import { presentationsIdx, demoNarrative } from './fixtures/'
import * as _ from 'lodash'
import rimraf from 'rimraf'
import sinon from 'sinon'
import nock from 'nock'

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

    const presentContainer = {
        config: _.merge({}, defaults, { /* Add command specific config parameters */ })
    }
    const origin = 'http://localhost'
    const uri = origin
    const name = "demo"
    const presentCommand = {
        name: 'present',
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

        const executives = { present: execute }

        npac.runJob(presentContainer.config, executives, presentCommand, (err, res) => {
            expect(err).to.equal(null)
            done()
        })
    })
})
