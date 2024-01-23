import {readLines} from './readFile';
import {createMooreViewData, createMooreTable, minimizeMoore, mooreToString} from "./moore";
import {createMealyViewData, createMealyTable, mealyToString, minimizeMealy} from "./mealy";
import {writeLines} from "./writeFile";
import {generateView} from "./view/generateView"

const INPUT_FILE_NAME = "input.txt"
const OUTPUT_FILE_NAME = "output.txt"
const OUTPUT_VIEW_FILE_NAME = "view/view.generated.js"

function getMachineInfo(line: string) {
	const [columnsStr, rowsStr, machineType] = line.split(' ')

	if (Number(columnsStr) != undefined && Number(rowsStr) != undefined && machineType != undefined) {
		return {
			colsCount: Number(columnsStr),
			rowsCount: Number(rowsStr),
			machineType
		}
	} else {
		return {
			colsCount: 0,
			rowsCount: 0,
			machineType: 'moore'
		}
	}
}

const inputLines = readLines(INPUT_FILE_NAME) ?? []
const inputLine: string = inputLines.shift() ?? ''
const {colsCount, rowsCount, machineType} = getMachineInfo(inputLine)

let outputLines: string[] = []

const view = {
	nodes: [],
	edges: []
}

if (machineType === 'moore') {
	const [states] = createMooreTable(inputLines, colsCount, rowsCount)
	const minimizedStates = minimizeMoore(states)

	outputLines = mooreToString(minimizedStates)

	const [nodes, edges] = createMooreViewData(states)
	const [minimizedNodes, minimizedEdges] = createMooreViewData(minimizedStates, nodes.length)

	view.edges = [...edges, ...minimizedEdges]
	view.nodes = [...nodes, ...minimizedNodes]
}

if (machineType === 'mealy') {
	const [states] = createMealyTable(inputLines, colsCount, rowsCount)
	const minimizedStates = minimizeMealy(states)

	outputLines = mealyToString(minimizedStates)

	const [nodes, edges] = createMealyViewData(states)
	const [minimizedNodes, minimizedEdges] = createMealyViewData(minimizedStates, nodes.length)
	view.edges = [...edges, ...minimizedEdges]
	view.nodes = [...nodes, ...minimizedNodes]
}

if (!outputLines.length) {
	throw new Error('incorrect input data')
}

writeLines(OUTPUT_FILE_NAME, outputLines)
writeLines(OUTPUT_VIEW_FILE_NAME, [generateView(view.nodes, view.edges)])