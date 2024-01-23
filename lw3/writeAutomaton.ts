import {DeterministicAutomaton} from "./grammar";
import {get} from "./readGrammar";
import * as path from "path";
import * as fs from "fs";
import {stringify} from "csv-stringify/sync";

function WriteDeterministicAutomaton(filename: string, automaton: DeterministicAutomaton): void {
	writeCSV(filename, prepareDeterministicAutomaton(automaton))
}

function prepareDeterministicAutomaton(automaton: DeterministicAutomaton): string[][] {
	const result: string[][] = []
	for (let i = 0; i < automaton.inputSymbols.length + 2; i++) {
		result.push([])
	}
	result[0].push("")
	result[1].push("")
	automaton.states.map(state => {
		if (get(automaton.finalStates, state)) {
			result[0].push('F')
		} else {
			result[0].push('')
		}
		result[1].push(state)
	})
	automaton.inputSymbols.map((symbol, i) => {
		result[i + 2].push(symbol)
		automaton.states.map(state => {
			let dst = get(automaton.moves, {state: state, symbol: symbol}) ?? ''
			if (dst === '') {
				dst = '-'
			}
			result[i + 2].push(dst)
		})
	})
	return result
}

function writeCSV(filename: string, data: string[][]): void {
	const csv = stringify(data, {
		delimiter: ';'
	})
	const filePath = path.resolve(filename)
	fs.writeFileSync(filePath, csv, {flag: 'w'})
}

export {
	WriteDeterministicAutomaton,
}