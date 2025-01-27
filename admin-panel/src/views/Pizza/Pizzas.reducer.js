import { BEFORE_PIZZA, GET_PIZZAS, SEND_RARITY_REWARD} from '../../redux/types';

const initialState = {
    pizzas: null,
    pagination: null,
    getPizzaAuth: false,
    rarityRewardSendAuth: false,
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_PIZZAS:
            return {
                ...state,
                pizzas: action.payload.data,
                pagination: action.payload.pagination,
                getPizzaAuth: true
            }
        case BEFORE_PIZZA:
            return {
                ...state,
                pizzas: null,
                pagination: null,
                getPizzaAuth: false,
                rarityRewardSendAuth: false
            }
        case SEND_RARITY_REWARD:
            return {
                ...state,
                rarityRewardSendAuth: true
            }
        default:
            return {
                ...state
            }
    }
}