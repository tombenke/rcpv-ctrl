import expect from 'chai'
import _ from 'lodash'
import sinon from 'sinon'
import nock from 'nock'
import { makeRestCall } from './webClient'

describe('commands.present.webClient', () => {
    let sandbox

    beforeEach(done => {
        sandbox = sinon.sandbox.create({})
        done()
    })

    afterEach(done => {
        sandbox.restore()
        nock.cleanAll()
        done()
    })

    it('#getResource', (done) => {
        const origin = 'http://localhost'
        const responseBody = {
            "demo": "/demo/"
        }
        const server = nock(origin)
            .get(`/index.json`)
            .reply(200, responseBody)

        makeRestCall(`${origin}/index.json`, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json'
                }
            }).then(results => console.log(results)).catch(err => console.log(err))
        done()
    })
})
