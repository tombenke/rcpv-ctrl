import _ from 'lodash'
import { loadJsonFileSync } from 'datafile'

export const presentationsIdx = loadJsonFileSync(__dirname + '/presentationsIdx.yml')
export const demoNarrative = loadJsonFileSync(__dirname + '/demoNarrative.yml')
