export const makeMsg = (topic, type, payload) => ({
    topic: topic,
    type: type,
    timestamp: Date.now(),
    payload: payload
})

export const makeSayMsg = text => makeMsg('speak', 'say', text)
export const makeShowPageMsg = uri => makeMsg('presentation', 'show', uri)
