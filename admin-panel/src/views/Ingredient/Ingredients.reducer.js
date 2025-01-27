import { BEFORE_INGREDIENT, GET_INGREDIENTS, UPSERT_INGREDIENT, DELETE_INGREDIENT, GET_INGREDIENT } from '../../redux/types';

const initialState = {
    ingredient: null,
    ingredients: null,
    pagination: null,
    deleteIngredientAuth: false,
    upsertIngredientAuth: false,
    getIngredientAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case UPSERT_INGREDIENT:
            return {
                ...state,
                ingredient: action.payload,
                upsertIngredientAuth: true
            }
        case DELETE_INGREDIENT:
            return {
                ...state,
                ingredient: action.payload,
                deleteIngredientAuth: true
            }
        case GET_INGREDIENTS:
            return {
                ...state,
                ingredients: action.payload.ingredients,
                pagination: action.payload.pagination,
                getIngredientAuth: true
            }
        case GET_INGREDIENT:
            return {
                ...state,
                ingredient: action.payload,
                getIngredientAuth: true
            }
        case BEFORE_INGREDIENT:
            return {
                ...state,
                category: null,
                categories: null,
                ingredient: null,
                ingredients: null,
                pagination: null,
                deleteIngredientAuth: false,
                upsertIngredientAuth: false,
                getIngredientAuth: false
            }
        default:
            return {
                ...state
            }
    }
}