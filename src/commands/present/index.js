import _ from 'lodash'
import { of, forkJoin, from, interval, pipe } from 'rxjs'
import { last, map, scan, flatMap, concatMap, take, tap } from 'rxjs/operators'
import { makeShowPageMsg, makeSayMsg } from './messages'
import { printMsg } from './trace'
import { makeRestCall } from './webClient'

const speakTopicTapWriter = container => container.npacNatsRxjsGw.natsTopicTapWriter('speak')
const presentationTopicTapWriter = container => container.npacNatsRxjsGw.natsTopicTapWriter('presentation')
const speakStatusObservable = container => container.npacNatsRxjsGw.natsTopicObservable('speakStatus')

export const presentPage = (container, baseUri, name) => (it) => {
    return forkJoin(
        interval(_.get(it, 'duration', 0)).pipe(take(1)),
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
    //console.log('Presentations Index URI: ', uri)
    return makeRestCall(uri, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json'
        }
    })
}

export const reportDuration = container => it => {
    const startAt = _.find(it, o => o.type === 'show' || o.type === 'say').timestamp
    const stopAt = _.find(it, o => o.type === 'sayCompleted').timestamp
    const showUri = _.find(it, o => o.type === 'show').payload
    const sayText = _.find(it, o => o.type === 'say').payload
    const duration = stopAt - startAt

    console.log('\n\n======================')
    console.log('uri: ', showUri)
    console.log('text: ', sayText)
    console.log(`duration: ${duration} ms\n`)
    return {
        startAt: startAt,
        stopAt: stopAt,
        showUri: showUri,
        sayText: sayText
    }
}

export const printFinalStats = (container, results) => {
    if (_.isArray(results) && results.length > 0 && _.has(results[0], 'startAt')) {
        const baseStartAt = results[0].startAt
        const stats = _.map(results, it => ({
            ...it,
            startAt: it.startAt - baseStartAt,
            stopAt: it.stopAt - baseStartAt,
            duration: it.stopAt - it.startAt
        }))
            console.log('\n\nFINAL STATS:')
            _.map(stats, (it, idx) => {
                console.log(`\n#${idx + 1}.`)
                console.log(it.showUri)
                console.log(it.sayText)
                console.log(`from: ${it.startAt} ms`)
                console.log(`to: ${it.startAt + it.duration} ms`)
                console.log(`duration: ${it.duration} ms`)
            })
            console.log('\n\n')
    } else {
        container.logger.error('Wrong results!')
    }
}

export const doPresentation = (container, args, endCb) => {
    getPresentationsIdx(container, args.uri).then(presentationsIdx => {
            from(getTheNarrative(container, args.uri, args.name)).pipe(
                flatMap(function(x) { return x; }),
//                tap(printMsg('-> presentPage')),
                concatMap(presentPage(container, args.uri, args.name)),
//                tap(printMsg('presentPage ->')),
                map(reportDuration(container)),
                scan((acc, value, idx) => {
                    acc.push(value)
                    return acc
                }, []),
                last()
            ).subscribe(
                it => {
//                    console.log('OUTPUT: ', it)
                    printFinalStats(container, it)
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
