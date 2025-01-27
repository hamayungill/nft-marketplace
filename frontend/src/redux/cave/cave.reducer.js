import { RANDOM_PIZZA, BUY_AND_BAKE_PIZZA, BAKE_PIZZA, BEFORE_BAKE_PIZZA, BAKED_PIZZAS, UNBAKE_PIZZA, REBAKE_PIZZA_INGREDIENTS, REBAKED_PIZZA, GET_PIZZA } from "../type";

const initialState = {
    bakePizza: null,
    randomPizza: null,

    // for buy and bake
    buyAndBakePizza: null,
    buyAndBakePizzaAuth: null,
    
    // top 10 baked pizzas
    bakedPizzas: [],
    getBakedPizzaAuth: false,

    unbakePizza: null,
    rebakePizzaIngredients: null,
    unbakePizzaAuth: false,
    rebakedPizza: null,
    createBakePizzaAuth: false,
    randomPizzaAuth: false,
    rebakePizzaIngredientsAuth: false,
    rebakedPizzaAuth: false,
    getPizzaDetail: false,
    pagination: null
}

export const caveReducer =(state = initialState, action)=>{
    switch (action.type) {
        case BAKE_PIZZA:
            return {
                ...state,
                bakePizza: action.payload,
                createBakePizzaAuth: true
            }
        case BEFORE_BAKE_PIZZA:
            return {
                ...state,
                bakePizza: null,
                bakedPizzas: [],
                unbakePizza: null,
                rebakePizzaIngredients: null,
                rebakedPizza: null,
                createBakePizzaAuth: false,
                getBakedPizzaAuth: false,
                unbakePizzaAuth: false,
                rebakePizzaIngredientsAuth: false,
                rebakedPizzaAuth: false,
                randomPizzaAuth: false,
                getPizzaDetail: false,
                pagination: null,

                // for buy and bake
                buyAndBakePizza: null,
                buyAndBakePizzaAuth: false            
            }
        case BAKED_PIZZAS:
            return {
                ...state,
                bakedPizzas: [...action.payload.data],
                getBakedPizzaAuth: true
            }
        case REBAKE_PIZZA_INGREDIENTS:
            return {
                ...state,
                rebakePizzaIngredients: action.payload,
                rebakePizzaIngredientsAuth: true
            }
        case REBAKED_PIZZA:
            return {
                ...state,
                rebakedPizza: action.payload,
                rebakedPizzaAuth: true
            }
        case UNBAKE_PIZZA:
            return {
                ...state,
                unbakePizza: action.payload,
                unbakePizzaAuth: true
            }
        case RANDOM_PIZZA:
            return {
                ...state,
                randomPizza: action.payload,
                randomPizzaAuth: true
            }
        case BUY_AND_BAKE_PIZZA:
            return {
                ...state,
                buyAndBakePizza: action.payload,
                buyAndBakePizzaAuth: true
            }
        case GET_PIZZA:
            return {
                ...state,
                pizzaDetail: action.payload,
                getPizzaDetail: true
            }
        default:
            return {
                ...state
            }
    }
}

