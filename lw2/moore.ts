import {MooreState} from "./mealyAndMooreState"

function createMooreTable(input: Array<string>, colsCount: number, rowsCount: number): [Array<MooreState>, Map<string, MooreState>] {
	const states: Array<MooreState> = []
	const idxMooreStates: Map<string, MooreState> = new Map()

	const stateSignalPairs = input.shift().split(' ')

	stateSignalPairs.forEach(pair => {
		const [name, signal] = pair.split('/')
		states.push({
			name,
			signal,
			transitions: new Map()
		})
	})

	const strTransitions = input.map(str => str.split(' '))

	const initState = (state: MooreState, index: number) => {
		for (let i = 0; i < rowsCount; i++)
		{
			const transitionStateNumber = Number(strTransitions[i][index]) - 1
			state.transitions.set(`x${i}`, {
				state: states[transitionStateNumber],
			})
			idxMooreStates.set(state.name, state)
		}
	}

	states.forEach(initState)

	return [states, idxMooreStates]
}

function minimizeMoore(mooreStates: Array<MooreState>) {
	const reachableStates = removeUnreachableStates(mooreStates)
	let {
		mapStateNameToClassIndex,
		classesOfStates,
		classNames
	} = firstBreakToEquivalentClasses(reachableStates)

	let minimized = false

	let newMapStateNameToClassIndex: Map<string, number> = new Map()
	let newClassesOfStates: Map<number, Array<MooreState>> = new Map()
	while (!minimized) {
		minimized = true
		classNames = []

		const classes = Array.from(classesOfStates.values())

		classes.forEach(equivalenceClass => {
			const subClassesOfStates: Map<number, Array<MooreState>> = new Map()
			const subClassNames = []

			equivalenceClass.forEach(state => {
				const transitions = Array.from(state.transitions.values())
				const nameFromTransitionSequence = transitions.map(t => {
					return mapStateNameToClassIndex.get(t.state.name)
				}).join()

				if (!subClassNames.includes(nameFromTransitionSequence)) {
					subClassNames.push(nameFromTransitionSequence)
					subClassesOfStates.set(subClassNames.findIndex(s => s === nameFromTransitionSequence) + classNames.length, [])
				}

				const index = subClassNames.findIndex(s => s === nameFromTransitionSequence) + classNames.length

				subClassesOfStates.get(index).push(state)
				newMapStateNameToClassIndex.set(state.name, index)
			})

			classNames = [...classNames, ...subClassNames]

			Array.from(subClassesOfStates.entries()).forEach(([index, states]) => {
				newClassesOfStates.set(index, states)
			})

			if (subClassesOfStates.size > 1) {
				minimized = false
			}
		})

		classesOfStates = new Map(Array.from(newClassesOfStates.entries()))
		newClassesOfStates = new Map()

		mapStateNameToClassIndex = new Map(Array.from(newMapStateNameToClassIndex.entries()))
		newMapStateNameToClassIndex = new Map()
	}

	return createMinimizedMooreStates(classesOfStates, mapStateNameToClassIndex)
}

function removeUnreachableStates(mooreStates: Array<MooreState>) {
	const mapStateToVisited = new Map(mooreStates.map(state =>
		[state.name, false]
	))

	mooreStates.forEach(state => {
		const transitions = state.transitions.values()
		Array.from(transitions).forEach(t => {
			mapStateToVisited.set(t.state.name, true)
		})
	})

	return mooreStates.filter(state => !!mapStateToVisited.get(state.name))
}

function firstBreakToEquivalentClasses(states: Array<MooreState>) {
	const mapStateNameToClassIndex: Map<string, number> = new Map()
	const classesOfStates: Map<number, Array<MooreState>> = new Map()
	const classNames = []

	states.forEach(state => {
		const transitions = Array.from(state.transitions.values())
		const signals = transitions.map(transition => transition.state.name + transition.state.signal).join()

		if (classNames.includes(signals)) {
			const index = classNames.findIndex(s => s === signals)
			classesOfStates.get(index).push(state)
			mapStateNameToClassIndex.set(state.name, index)
		}
		else {
			classNames.push(signals)
			classesOfStates.set(classNames.length - 1, [state])
			mapStateNameToClassIndex.set(state.name, classNames.length - 1)
		}
	})

	return {
		mapStateNameToClassIndex,
		classesOfStates,
		classNames
	}
}

function createMinimizedMooreStates(classes: Map<number, Array<MooreState>>, mapStateToClass: Map<string, number>) {
	const states = Array.from(classes.values()).map(states => states[0])

	states.forEach(state => {
		const transitions = Array.from(state.transitions.values())

		transitions.forEach(t => {
			const indexOfGroup = mapStateToClass.get(t.state.name)
			t.state = states[indexOfGroup]
		})
	})

	return states
}

function mooreToString(mooreStates: Array<MooreState>) {
	const lines = ['']
	mooreStates.forEach(moore => {
		lines[0] += `${moore.name}/${moore.signal}`
		let i = 1
		for (const [, transition] of moore.transitions) {
			if (!lines[i])
			{
				lines.push('')
			}

			lines[i] += `${mooreStates.findIndex(s => s.name === transition.state.name) + 1} `

			i++
		}
	})

	return lines
}

function createMooreViewData(mooreStates: Array<MooreState>, baseIndex = 100): [Array<Object>, Array<Object>] {
	let nodes = []
	let edges = []

	mooreStates.forEach((s, index) => {
		nodes.push({
			id: index + baseIndex,
			label: s.name + '/' + s.signal
		})
		for (const [input, next] of s.transitions) {
			edges.push({
				from: index + baseIndex,
				to: mooreStates.findIndex(f => f.name === next.state.name) + baseIndex,
				label: `${input}`,
				length: 250,
			})
		}
	})

	return [nodes, edges]
}

export {
	createMooreTable,
	minimizeMoore,
	mooreToString,
	createMooreViewData,
}