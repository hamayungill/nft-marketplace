import { GET_INGREDIENTS, BEFORE_INRGEDIENT, RANDOM_PIZZA_INGREDIENTS } from '../type';

const initialState = {
    ingredients:[], // for buy & bake pizza
    getIngredientsAuth: false,
    randomPizzaIngredient: null,
    getRandomPizzaIngredientAuth: false
}

export const ingredientReducer = (state = initialState, action)=>{
    switch (action.type) {
        case GET_INGREDIENTS:
            return {
                ...state,
                ingredients: [...action.payload.ingredients],
                getIngredientsAuth: true
            }
        case BEFORE_INRGEDIENT: 
            return {
                ...state,
                ingredients: [],
                getIngredientsAuth: false,
                randomPizzaIngredient: null,
                getRandomPizzaIngredientAuth: false,
            }
        case RANDOM_PIZZA_INGREDIENTS: 
            return {
                ...state,
                randomPizzaIngredient: action.payload,
                getRandomPizzaIngredientAuth: true
            }
        default:
            return {
                ...state
            }
    }
}