import _ from 'lodash'
import { of, forkJoin, from, interval, pipe } from 'rxjs'
import { flatMap, concatMap, take, tap } from 'rxjs/operators'
import { makeShowPageMsg, makeSayMsg } from './messages'
import { printMsg } from './trace'
import { makeRestCall } from './webClient'

const speakTopicTapWriter = container => container.npacNatsRxjsGw.natsTopicTapWriter('speak')
const presentationTopicTapWriter = container => container.npacNatsRxjsGw.natsTopicTapWriter('presentation')
const speakStatusObservable = container => container.npacNatsRxjsGw.natsTopicObservable('speakStatus')

export const presentPage = (container, baseUri, name) => (it) => {
    return forkJoin(
//        interval(it.duration).pipe(take(1)),
        of(makeShowPageMsg(`${baseUri}/${name}/${it.uri}`)).pipe(presentationTopicTapWriter(container)),
        of(makeSayMsg(it.text)).pipe(speakTopicTapWriter(container)),
        speakStatusObservable(container).pipe(take(1))
    )
}

export const getTheNarrative = (container, serverUri, name) => {
    const uri = `${serverUri}/${name}/narrative.json`
    console.log('Narrative URI: ', uri)
    return makeRestCall(uri, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json'
        }
    })
}

export const getPresentationsIdx = (container, serverUri) => {
    const uri = `${serverUri}/index.json`
    console.log('Presentations Index URI: ', uri)
    return makeRestCall(uri, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json'
        }
    })
}

export const doPresentation = (container, args, endCb) => {
    getPresentationsIdx(container, args.uri).then(presentationsIdx => {
            from(getTheNarrative(container, args.uri, args.name)).pipe(
                flatMap(function(x) { return x; }),
                tap(printMsg('-> presentPage')),
                concatMap(presentPage(container, args.uri, args.name)),
                tap(printMsg('presentPage ->'))
            ).subscribe(
                it => {
                    console.log(it)
                },
                err => {
                    container.logger.error('Error:', err)
                    endCb(err, null)
                },
                () => {
                    container.logger.info('Success')
                    endCb(null, null)
                }
            )
        }).catch(err => {
            container.logger.error('Error:', err)
            endCb(err, null)
        })
}

/**
 * 'present' command implementation
 *
 * @arg {Object} container - Container context object, holds config data of the application and supporting functions.
 * @arg {Object} args - Command arguments object. Contains the name-value pairs of command arguments.
 *
 * @function
 */
exports.execute = (container, args, endCb) => {
    container.logger.info(`present.execute => uri: ${args.uri}, name: ${args.name}`)
    doPresentation(container, args, endCb)
}
