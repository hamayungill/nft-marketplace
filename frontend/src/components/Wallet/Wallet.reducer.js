import { SET_WALLET_ADDRESS, GET_WALLET_INGREDIENTS, GET_WALLET_PIZZAS, BEFORE_WALLET_DATA, SET_WALLET_ERROR} from "../../redux/type";

const initialState = {
    accountAddress: null,
    walletIngredients: [],
    getWalletIgredientsAuth: false,
    walletPizzas: [],
    getWalletPizzasAuth: false,
    walletError: ''
}

export const walletReducer =  ( state = initialState, action )=>{
    switch (action.type) {
        case SET_WALLET_ERROR:
            return {
                ...state,
                walletError: action.payload
            }
        case SET_WALLET_ADDRESS:
            return {
                ...state,
                accountAddress: action.payload
            }
        case GET_WALLET_INGREDIENTS:
            return {
                ...state,
                walletIngredients: action.payload,
                getWalletIgredientsAuth: true
            }
        case GET_WALLET_PIZZAS:
            return {
                ...state,
                walletPizzas: action.payload,
                getWalletPizzasAuth: true
            }
        case BEFORE_WALLET_DATA:
            return {
                ...state,
                walletIngredients: [],
                getWalletIgredientsAuth: false,
                walletPizzas: [],
                getWalletPizzasAuth: false
            }
        default:
            return {
                ...state
            }
    }
}