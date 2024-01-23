
type NonTerminalWithTerminal = {
	NonTerminal: string
	Terminal: string
}

type Rules = Map<NonTerminalWithTerminal, string[]>

type GrammarType = "left" | "right"

type Grammar = {
	nonTerminalSymbols: string[]
	terminalSymbols: string[]
	rules: Rules
	type: GrammarType
}

type FromStateAndInputSymbol = {
	state: string
	symbol: string
}

type NonDeterministicMoves = Map<FromStateAndInputSymbol, string[]>

type NonDeterministicAutomaton = {
	states: string[]
	inputSymbols: string[]
	finalStates: Map<string, boolean>
	moves: NonDeterministicMoves
}

type DeterministicMoves = Map<FromStateAndInputSymbol, string>

type DeterministicAutomaton = {
	states: string[]
	inputSymbols: string[]
	finalStates: Map<string, boolean>
	moves: DeterministicMoves
}


export {
	NonTerminalWithTerminal,
	Rules,
	GrammarType,
	Grammar,
	NonDeterministicAutomaton,
	NonDeterministicMoves,
	DeterministicMoves,
	DeterministicAutomaton
}