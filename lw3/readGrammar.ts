import * as fs from "fs";
import * as path from "path";
import {Grammar, GrammarType, NonDeterministicAutomaton, NonDeterministicMoves, Rules} from "./grammar";
import {parse} from "csv-parse/sync";

function get<K, V>(maps: Map<K, V>, key: K): V | undefined {
	let result: V | undefined = undefined
	maps.forEach((v, k) => {
		if (JSON.stringify(k) === JSON.stringify(key) && k !== undefined && key !== undefined) {
			result = v
		}
	})
	return result
}

function set<K, V>(maps: Map<K, V>, key: K, value: V): void {
	let keyInMap: K | null = null
	maps.forEach((v, k) => {
		if (JSON.stringify(k) === JSON.stringify(key) && k !== undefined && key !== undefined) {
			keyInMap = k
		}
	})
	if (keyInMap === null) {
		keyInMap = key
	}
	maps.set(keyInMap, value)
}

function readGrammar(filename: string, grammarType: GrammarType): Grammar {
	const filePath = path.resolve(filename)
	const data = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/)

	const nonTerminals: string[] = []
	const uniqueTerminals = new Map<string, boolean>();
	const rules: Rules = new Map();
	data.map(line => {
		const rule = line.split(' -> ')
		const sourceNonTerminal = rule[0]
		nonTerminals.push(sourceNonTerminal)

		rule[1].split(' | ').map(symbol => {
			let [dstNonTerminal, terminal] = ["", ""]
			if (symbol.length === 1) {
				terminal = symbol
			} else if (grammarType === 'left') {
				dstNonTerminal = symbol[0]
				terminal = symbol[1]
			} else if (grammarType === 'right') {
				dstNonTerminal = symbol[1]
				terminal = symbol[0]
			}
			set(uniqueTerminals, terminal, true)
			const k = {NonTerminal: sourceNonTerminal, Terminal: terminal}
			set(rules, k, [...(get(rules, k) ?? []), dstNonTerminal])
		})
	})

	const terminalSymbols: string[] = []
	uniqueTerminals.forEach((v, s) => terminalSymbols.push(s))
	return {nonTerminalSymbols: nonTerminals, rules: rules, type: grammarType, terminalSymbols: terminalSymbols.sort()}
}

function readNonDeterministicAutomaton(filename: string): NonDeterministicAutomaton {
	const data = readCSV(filename)
	const {states, signals} = getMooreStates(data)
	const inputSymbols = getMooreInputSymbols(data)
	return {
		finalStates: getFinalStates(signals),
		inputSymbols: inputSymbols,
		moves: getNonDeterministicMoves(data, states, inputSymbols),
		states: states
	}
}

function readCSV(filename: string): string[][] {
	const filePath = path.resolve(filename)
	const data = fs.readFileSync(filePath)
	return parse(data, {
		delimiter: ';'
	})
}

function getMooreStates(data: string[][]): { states: string[], signals: Map<string, string> } {
	const states = data[1].slice(1)
	const s = data[0].slice(1)

	const signals = new Map<string, string>;
	states.map((state, i) => {
		// @ts-ignore
		set(signals, state, s[i])
	})
	return {signals: signals, states: states}
}

function getMooreInputSymbols(data: string[][]): string[] {
	const symbols: string[] = []
	data.slice(2).map(value => {
		symbols.push(value[0])
	})
	return symbols
}

function getFinalStates(signals: Map<string, string>): Map<string, boolean> {
	const result = new Map<string, boolean>();
	signals.forEach((signal, state) => {
		if (signal === 'F') {
			set(result, state, true)
		}
	})
	return result
}

function getNonDeterministicMoves(data: string[][], states: string[], inputSymbols: string[]): NonDeterministicMoves {
	const transposedData = transpose(data.slice(2))
	const result: NonDeterministicMoves = new Map();
	transposedData.slice(1).map((stateAndMove, i) => {
		stateAndMove.map((moves, j) => {
			if (moves !== '-' && moves !== '') {
				const stateWithInput = {
					state: states[i],
					symbol: inputSymbols[j]
				}
				moves.split(',').map((move) => {
					const prev = get(result, stateWithInput) ?? []
					set(result, stateWithInput, [...prev, move])
				})
			}
		})
	})
	return result
}

function transpose(data: string[][]): string[][] {
	const impl = (matrix: string[][]) => matrix[0].map((col, i) => matrix.map(row => row[i]))
	return impl(data)
}

export {
	readGrammar,
	set,
	get,
	readNonDeterministicAutomaton,
}