import * as fs from "fs";
import { MealyTransition, MealyState, MooreState } from "./mealyAndMooreState";

function readLinesFromFile(filename: string): Array<string> {
    let textFile = fs.readFileSync(filename, "utf-8")
    return textFile.split("\r\n")
}

function getMooreState(str: string): MealyTransition {
    const [mealyState, out] = str.split("/")
    return {
        mealyState: mealyState,
        out: out
    }
}

function createMealyTable(strs: Array<string>, countOfIn: number, countOfStates: number): Array<MealyState> {
    var mealyStates: Array<MealyState> = []

    var mealysTransitions: Map<number, Array<MealyTransition>> = new Map

    for (let i = 1; i <= countOfIn; i++) {
        let mooreStatesStr = strs[i].split(" ")
        let m: Array<MealyTransition> = []
        mooreStatesStr.forEach(statesStr => {
            m.push(getMooreState(statesStr))
        })
        mealysTransitions.set(i, m)
    }

    for (let i = 1; i <= countOfStates; i++) {
        var mealyState: MealyState = {
            state: `s${i}`, 
            stateTransitions: new Map
        }

        for (let j = 1; j <= countOfIn; j++) {
            let s = mealysTransitions.get(j)
            if (s != undefined && s[i-1] != undefined) {
                mealyState.stateTransitions.set(j, s[i - 1] )
            }
        }

        mealyStates.push(mealyState)
    }

    return mealyStates
}
function createMooreStates(strs: Array<string>, countOfIn: number, countOfStates: number): Array<MooreState> {
    var mooreStates: Array<MooreState> = []

    let statesStr = strs[1].split(" ")
    statesStr.forEach(stateStr => {
        mooreStates.push({
            state: getMooreState(stateStr),
            stateTransitions: new Map
        })
    })

    for (let i = 1; i <= countOfIn; i++) {
        let mooreStatesStr = strs[i + 1].split(" ")
        for (let j = 0; j < countOfStates; j++) {
            mooreStates[j].stateTransitions.set(i, Number(mooreStatesStr[j]))
        }
    }

    return mooreStates
}

function checkMealyTransitions(mooreToMealy: Array<MealyTransition>, transition: MealyTransition): boolean {

    for (let i = 0; i < mooreToMealy.length; i++) {
        if (mooreToMealy[i].mealyState == transition.mealyState && mooreToMealy[i].out == transition.out) {
            return true
        }
    }

    return false
}

function getMealyTransitionsIndex(mealyTransitions: Array<MealyTransition>, transition: MealyTransition): number {

    for (let i = 0; i < mealyTransitions.length; i++) {
        if (mealyTransitions[i].mealyState == transition.mealyState && mealyTransitions[i].out == transition.out) {
            return i
        }
    }

    return 0
}

function convertToMooreStates(strs: Array<string>, countOfIn: number, countOfStates: number): Array<MooreState> {
    let mealyStates = createMealyTable(strs, countOfIn, countOfStates)

    var mooreToMealy: Array<MealyTransition> = []

    mealyStates.forEach(state => { 
        state.stateTransitions.forEach(transition => {
            if (!checkMealyTransitions(mooreToMealy, transition)) {
                mooreToMealy.push(transition)
            }
        })
    })

    var mooreStates: Array<MooreState> = []

    mooreToMealy.forEach(transition => {
        mooreStates.push({
            state: transition,
            stateTransitions: new Map
        })
    })

    mealyStates.forEach(state => {
        for (let mooreIndex = 0; mooreIndex < mooreStates.length; mooreIndex++) {
            if (state.state == mooreStates[mooreIndex].state.mealyState) {
                for (let inSignal = 1; inSignal <= countOfIn; inSignal++) {
                    let s = state.stateTransitions.get(inSignal)
                    if (s != undefined) {
                        mooreStates[mooreIndex].stateTransitions.set(inSignal + 1, getMealyTransitionsIndex(mooreToMealy, s) + 1)
                    }
                }
            }
        }
    })

    return mooreStates
}

function convertToMealyStates(strs: Array<string>, countOfIn: number, countOfStates: number): Array<MealyState> {
    let mooreStates = createMooreStates(strs, countOfIn, countOfStates)

    let mealyStates: Array<MealyState> = []
    let stateNames: Array<string> = []

    mooreStates.forEach(mooreSt => {
        if (!stateNames.includes(mooreSt.state.mealyState)) {
            stateNames.push(mooreSt.state.mealyState)
            let stateTransitions: Map<number, MealyTransition> = new Map
            for (let i = 1; i <= countOfIn; i++) {
                let s = mooreSt.stateTransitions.get(i)
                if (s != undefined) {
                    stateTransitions.set(i, mooreStates[s - 1].state)
                }
            }
            mealyStates.push({
                state: mooreSt.state.mealyState,
                stateTransitions: stateTransitions
            })
        }
    })

    return mealyStates
}

function mealyToString(mealyStates: Array<MealyState>) {
    const lines = ['']
	mealyStates.forEach(mealy => {
		lines[0] += `${mealy.state} `
		let i = 1
		for (const [, transition] of mealy.stateTransitions) {
			if (!lines[i])
			{
				lines.push('')
			}
			lines[i] += `${transition.mealyState}/${transition.out} `
			i++
		}
	})
    return lines;
}

function mooreToString(mooreStates: Array<MooreState>) {
    const lines = ['']
	mooreStates.forEach(mealy => {
		lines[0] += `${mealy.state.mealyState}/${mealy.state.out} `
		let i = 1
		for (const [, transition] of mealy.stateTransitions) {
			if (!lines[i])
			{
				lines.push('')
			}
			lines[i] += `${transition} `
			i++
		}
	})
    return lines;
}

function getMealyStatesIndex(mealyStates: Array<MealyState>, mealyState: string): number {
    for (let i = 0; i <= mealyStates.length; i++) {
        if (mealyStates[i].state == mealyState) {
            return i
        }
    }

    return 0
}

function createTable(filename: string): [Array<Object>, Array<Object>, string[]] {
    let strs = readLinesFromFile(filename);
    const [countStatesStr, countInStr, typeTable] = strs[0].split(" ")

    let countStates = Number(countStatesStr)
    let countIn = Number(countInStr)

    let nodes: Array<Object> = []
    let edges: Array<Object> = []
    let str = [""]

    if (typeTable == "moore") {
        let mealyStates = convertToMealyStates(strs, countIn, countStates)
        mealyStates.forEach((state, index) => {
            nodes.push({
                id: index,
                label: state.state
            })
            for (const [input, next] of state.stateTransitions) {
                edges.push({
                    from: index,
                    to: getMealyStatesIndex(mealyStates, next.mealyState),
                    label: `${input}/${next.out}`,
                    length: 250,
                })
            }
        })
        str = mealyToString(mealyStates)
    } else if (typeTable == "mealy") {
        let mooreStates = convertToMooreStates(strs, countIn, countStates)
        mooreStates.forEach((state, index) => {
            nodes.push({
                id: index,
                label: `${state.state.mealyState}/${state.state.out}`
            })
            for (const [input, next] of state.stateTransitions) {
                edges.push({
                    from: index,
                    to: next,
                    label: `${input}`,
                    length: 250,
                })
            }
        })
        str = mooreToString(mooreStates)
    } else {
        throw Error("Incorrect type of table!!!")
    }

    return [nodes, edges, str]
}

export {
    createTable
}