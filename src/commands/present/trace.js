import _ from 'lodash'

export const print = label => it => console.log(`\n[${label}]\n${JSON.stringify(it)}`)
export const printJson = (label, data, spaces=0) =>
    spaces > 0
        ? console.log(`${label}: ${JSON.stringify(data, null, _.times(spaces, _.constant(' ')).join(''))}`)
        : console.log(`${label}: ${JSON.stringify(data)}`)

const simpleMsgFootprint = it => `${it.type} - ${JSON.stringify(it)}`

const presentMsgFootprint = it => `${it.type} - ${JSON.stringify(it.payload)}`

export const printMsg = label => it => {
    console.log(`\n[${label}]`)
    switch(_.get(it, 'type', '')) {

        case 'present':
            console.log(presentMsgFootprint(it))
            break

        default:
            console.log('...', JSON.stringify(it))
            break
    }
}
export const tee = fun => it => {
    fun(it)
    return it
}
