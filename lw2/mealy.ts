import { MealyState } from "./mealyAndMooreState"

function createMealyTable(input: Array<string>, colsCount: number, rowsCount: number): [Array<MealyState>, Map<string, MealyState>] {
	const states: Array<MealyState> = []
	const idxMealyStates: Map<string, MealyState> = new Map()

	for (let i = 1; i <= colsCount; i++) {
		states.push({
			name: `s${i}`,
			transitions: new Map()
		})
	}

	const strTransitions = input.map(str => str.split(' '))

	const initState = (state: MealyState, index: number) => {
		for (let i = 0; i < rowsCount; i++)
		{
			const transition = strTransitions[i][index]
			const [name, signal] = transition.split('/')
			state.transitions.set(`x${i}`, {
				state: states.find(s => s.name === name),
				signal: signal,
			})
			idxMealyStates.set(state.name, state)
		}
	}

	states.forEach(initState)

	return [states, idxMealyStates]
}

function minimizeMealy(mealyStates: Array<MealyState>) {
	const reachableStates = removeUnreachableStates(mealyStates)
	let {
		mapStateNameToClassIndex,
		classesOfStates,
		classNames
	} = firstBreakToEquivalentClasses(reachableStates)

	let minimized = false

	let newMapStateNameToClassIndex: Map<string, number> = new Map()
	let newClassesOfStates: Map<number, Array<MealyState>> = new Map()
	while (!minimized) {
		minimized = true
		classNames = []

		const classes = Array.from(classesOfStates.values())

		classes.forEach(equivalenceClass => {
			const subClassesOfStates: Map<number, Array<MealyState>> = new Map()
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

	return createMinimizedMealyStates(classesOfStates, mapStateNameToClassIndex)
}

function removeUnreachableStates(mealyStates: Array<MealyState>) {
	const mapStateToVisited = new Map(mealyStates.map(state =>
		[state.name, false]
	))

	mealyStates.forEach(state => {
		const transitions = state.transitions.values()
		Array.from(transitions).forEach(t => {
			mapStateToVisited.set(t.state.name, true)
		})
	})

	return mealyStates.filter(state => !!mapStateToVisited.get(state.name))
}

function firstBreakToEquivalentClasses(states: Array<MealyState>) {
	const mapStateNameToClassIndex: Map<string, number> = new Map()
	const classesOfStates: Map<number, Array<MealyState>> = new Map()
	const classNames = []

	states.forEach(state => {
		const transitions = Array.from(state.transitions.values())
		const signals = transitions.map(transition => transition.signal).join()

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

function createMinimizedMealyStates(classes: Map<number, Array<MealyState>>, mapStateToClass: Map<string, number>) {
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

function sortMealyStates(mealyStates: Array<MealyState>) {
	const compare = (a: MealyState, b: MealyState) => {
		if ( a.name < b.name ){
			return -1;
		}
		if ( a.name > b.name ){
			return 1;
		}
		return 0;
	}

	return mealyStates.sort(compare)
}

function mealyToString(mealyStates: Array<MealyState>) {
	const lines = ['']
	sortMealyStates(mealyStates).forEach(mealy => {
		lines[0] += `${mealy.name} `
		let i = 1
		for (const [, transition] of mealy.transitions) {
			if (!lines[i])
			{
				lines.push('')
			}
			lines[i] += `${transition.state.name}/${transition.signal} `
			i++
		}
	})

	return lines
}

function createMealyViewData(mealyStates: Array<MealyState>, baseIndex = 0): [Array<Object>, Array<Object>] {
	let nodes = []
	let edges = []

	mealyStates.forEach((s, index) => {
		nodes.push({
			id: index + baseIndex,
			label: s.name
		})
		for (const [input, next] of s.transitions) {
			edges.push({
				from: index + baseIndex,
				to: mealyStates.findIndex(f => f.name === next.state.name) + baseIndex,
				label: `${input}/${next.signal}`,
				length: 250,
			})
		}
	})

	return [nodes, edges]
}

export {
	createMealyTable,
	minimizeMealy,
	mealyToString,
	createMealyViewData,
}