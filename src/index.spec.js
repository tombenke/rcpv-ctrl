import fs from 'fs'
import rimraf from 'rimraf'
import path from 'path'
import { expect } from 'chai'
import sinon from 'sinon'
import nock from 'nock'
/*
import {
    loadJsonFileSync,
    findFilesSync
} from 'datafile'
*/

import { start } from './index'

const testDirectory = path.resolve('./tmp')

const destCleanup = function(cb) {
    const dest = testDirectory
    rimraf(dest, cb)
}

describe('app', () => {
    let sandbox

    before(function(done) {
        sandbox = sinon.sandbox.create({})
        destCleanup(function() {
            fs.mkdirSync(testDirectory)
            done()
        })
    })

    after(function(done) {
        sandbox.restore()
        nock.cleanAll()
        destCleanup(done)
    })

/*
    it('#start - with no arguments', (done) => {

        const processArgvEmpty = [
            'node', 'src/index.js'
        ]

        try {
            start(processArgvEmpty)
        } catch (err) {
            expect(err.message).to.equal('Must use a command!')
            done()
        }
    })
*/
    it('#start - present command', (done) => {

        const origin = 'http://localhost'
        const responseBody = {
            "demo": "/demo/"
        }
        const server = nock(origin)
            .get(`/index.json`)
            .reply(200, responseBody)

        const processArgvToPresent = [
            'node', 'src/index.js',
            'present',
            '--uri', origin,
            '--name', 'demo'
        ]

        start(processArgvToPresent, (err, res) => {
            expect(err).to.equal(null)
            done()
        })
    })
})
