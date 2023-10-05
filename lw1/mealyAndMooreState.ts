//MEALY:

type MealyTransition = {
    mealyState: string
    out: string
}

type MealyState = {
    state: string
    stateTransitions: Map<number, MealyTransition>
}

//MOORE:

type MooreState = {
    state: MealyTransition
    stateTransitions: Map<number, number>
}

export {
    MealyState,
    MealyTransition,
    MooreState
};