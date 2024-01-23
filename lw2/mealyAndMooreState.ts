type MealyTransition = {
	state: MealyState,
	signal: string,
}

type MealyState = {
	name: string,
	transitions: Map<string, MealyTransition>
}

type MooreState = {
	name: string,
	signal: string,
	transitions: Map<string, MooreTransition>
}

type MooreTransition = {
	state: MooreState
}

export type {
	MealyState,
	MealyTransition,
	MooreState,
	MooreTransition,
}