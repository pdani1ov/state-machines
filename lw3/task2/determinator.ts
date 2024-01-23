import {WriteDeterministicAutomaton} from "../writeAutomaton";
import {determinate} from "../task1/determinator";
import {readNonDeterministicAutomaton} from "../readGrammar";

function NKAToDKA(input: string, output: string): void {
	const automation = readNonDeterministicAutomaton(input)
	const result = determinate(automation)
	WriteDeterministicAutomaton(output, result)
}

export {
	NKAToDKA,
}
