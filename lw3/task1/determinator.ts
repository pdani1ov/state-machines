import {DeterministicAutomaton, DeterministicMoves, NonDeterministicAutomaton} from "../grammar";
import {get, set} from "../readGrammar";

type state = {
	final: boolean
	states: string[]
}

function determinate(ndAutomaton: NonDeterministicAutomaton): DeterministicAutomaton {
	const closures = getClosures(ndAutomaton)
	const stateHashMap = new Map<string, state>();
	const newStates: string[] = []
	const newFinalStates = new Map<string, boolean>();
	const newMoves: DeterministicMoves = new Map();

	let stateQueue: string[][] = [[ndAutomaton.states[0]]]
	while (stateQueue.length > 0) {
		const states = stateQueue[0]
		stateQueue = stateQueue.slice(1)

		const currState = getFullState(states, closures, ndAutomaton.finalStates)
		const stateHash = currState.states.sort().join('')
		if (get(stateHashMap, stateHash)) {
			continue
		}
		set(stateHashMap, stateHash, currState)
		newStates.push(stateHash)
		set(newFinalStates, stateHash, currState.final)
		ndAutomaton.inputSymbols.map(symbol => {
			if (symbol === 'e') {
				return
			}
			const newKey = {state: stateHash, symbol: symbol}
			const dstStates: string[] = []
			currState.states.map(state => (get(ndAutomaton.moves, {
				state: state,
				symbol: symbol
			}) ?? []).map(initDstState => {
				dstStates.push(initDstState)
			}))
			if (dstStates.length !== 0) {
				stateQueue.push(dstStates)
				const dstState = getFullState(dstStates, closures, ndAutomaton.finalStates)
				set(newMoves, newKey, dstState.states.join(''))
			}
		})
	}
	const [resultStates, resultFinalStates, resultMoves] = getStatesNames(newStates, newFinalStates, newMoves)
	return {
		finalStates: resultFinalStates,
		inputSymbols: removeEmptyInputSymbol(ndAutomaton.inputSymbols),
		moves: resultMoves,
		states: resultStates
	}
}

function getClosures(automaton: NonDeterministicAutomaton): Map<string, state> {
	let flatClosures = new Map<string, string[]>();
	automaton.states.map((state) => {
		let k = {state: state, symbol: 'e'};
		(get(automaton.moves, k) ?? []).map((dstState) => {
			const prev = get(flatClosures, state) ?? []
			set(flatClosures, state, [...prev, dstState])
		})
	})
	if (flatClosures.size === 0) {
		return new Map<string, state>();
	}
	while (true) {
		let [found, newClosures] = recurse(flatClosures)
		flatClosures = newClosures
		if (!found) {
			break
		}
	}
	const result = new Map<string, state>();
	flatClosures.forEach((closures, state) => {
		let final = false
		closures.map(closure => {
			if (final) {
				return
			}
			if (get(automaton.finalStates, closure)) {
				final = true
			}
		})
		set(result, state, {final: final, states: closures})
	})
	return result
}

function recurse(result: Map<string, string[]>): [boolean, Map<string, string[]>] {
	let found = false
	result.forEach((closures, state) => {
		closures.map(closure => (get(result, closure) ?? []).map(transitiveState => {
			if (existInArray(get(result, state) ?? [], transitiveState)) {
				return
			}
			set(result, state, [...(get(result, state) ?? []), transitiveState])
			found = true
		}))
	})
	return [found, result]
}

function existInArray(arr: string[], find: string): boolean {
	let result = false
	arr.map(v => {
		if (v === find) {
			result = true
		}
	})
	return result
}

function getFullState(states: string[], closures: Map<string, state>, finalStates: Map<string, boolean>): state {
	const stateMap = new Map<string, boolean>();
	states.map(state => {
		set(stateMap, state, true)
		const closure = get(closures, state)
		if (closure) {
			closure.states.map(closureState => set(stateMap, closureState, true))
		}
	})
	const resultStates: string[] = []
	let final = false
	stateMap.forEach((v, state) => {
		resultStates.push(state)
		if (get(finalStates, state)) {
			final = true
		}
	})
	resultStates.sort()
	return {final: final, states: resultStates}
}

function getStatesNames(states: string[], finalStates: Map<string, boolean>, moves: DeterministicMoves): [string[], Map<string, boolean>, DeterministicMoves] {
	const newStateNamesMap = new Map<string, string>();
	let num = 0
	const newStates: string[] = []
	states.map(state => {
		const newStateName = 'S' + num
		num++
		set(newStateNamesMap, state, newStateName)
		newStates.push(newStateName)
	})
	const newFinalStates = new Map<string, boolean>();
	finalStates.forEach((final, state) => set(newFinalStates, get(newStateNamesMap, state) ?? '', final))
	const newMoves: DeterministicMoves = new Map();
	moves.forEach((dstState, key) => {
		const newKey = {
			state: get(newStateNamesMap, key.state) ?? '', symbol: key.symbol
		}
		set(newMoves, newKey, get(newStateNamesMap, dstState) ?? '')
	})
	return [newStates, newFinalStates, newMoves]
}

function removeEmptyInputSymbol(symbols: string[]): string[] {
	const result: string[] = []
	symbols.map(symbol => {
		if (symbol !== 'e') {
			result.push(symbol)
		}
	})
	return result
}

export {
	determinate,
}