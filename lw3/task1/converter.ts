import {get, readGrammar, set} from "../readGrammar";
import {Grammar, GrammarType, NonDeterministicAutomaton, NonDeterministicMoves} from "../grammar";
import {determinate} from "./determinator";
import {WriteDeterministicAutomaton} from "../writeAutomaton";

function convert(grammarType: string, inputFilename: string, outputFilename: string) {
	const type = stringToGrammarType(grammarType)
	const grammar = readGrammar(inputFilename, type)
	const nda = getAutomaton(grammar)
	const determinateAutomaton = determinate(nda)
	WriteDeterministicAutomaton(outputFilename, determinateAutomaton)
}

function getAutomaton(grammar: Grammar): NonDeterministicAutomaton {
	switch (grammar.type) {
		case "left":
			return leftImpl(grammar)
		case "right":
			return rightImpl(grammar)
	}
}

function leftImpl(grammar: Grammar): NonDeterministicAutomaton {
	const states: string[] = ['H']
	grammar.nonTerminalSymbols.map(symbol => states.push(symbol))
	const finalStates = new Map<string, boolean>([[states[1], true]])
	const moves: NonDeterministicMoves = new Map()
	grammar.rules.forEach((dstNonTerminals, nonTerminalWithTerminal) => dstNonTerminals.map(dstNonTerminal => {
		const initState = dstNonTerminal !== '' ? dstNonTerminal : 'H'
		const k = {state: initState, symbol: nonTerminalWithTerminal.Terminal}
		set(moves,k, [...(get(moves, k) ?? []), nonTerminalWithTerminal.NonTerminal])
	}))
	return {finalStates: finalStates, inputSymbols: grammar.terminalSymbols, moves: moves, states: states}
}

function rightImpl(grammar: Grammar): NonDeterministicAutomaton {
	const states: string[] = []
	grammar.nonTerminalSymbols.map(symbol => states.push(symbol))
	states.push('F')
	const finalStates = new Map<string, boolean>([['F', true]])
	const moves: NonDeterministicMoves = new Map()
	grammar.rules.forEach((dstNonTerminals, nonTerminalWithTerminal) => {
		const k = {state: nonTerminalWithTerminal.NonTerminal, symbol: nonTerminalWithTerminal.Terminal}
		dstNonTerminals.map(dstNonTerminal => {
			const dst = dstNonTerminal !== '' ? dstNonTerminal : 'F'
			set(moves, k, [...(get(moves, k) ?? []), dst])
		})
	})
	return {finalStates: finalStates, inputSymbols: grammar.terminalSymbols, moves: moves, states: states}
}

function stringToGrammarType(grammarSide: string): GrammarType {
	switch (grammarSide) {
		case "left":
			return "left"
		case "right":
			return "right"
		default:
			throw new Error('Invalid grammar type')
	}
}

export {
	convert,
}