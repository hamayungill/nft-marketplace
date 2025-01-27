import { GET_ERRORS, EMPTY_ERRORS, SET_WALLET_ERROR } from '../../types';

const initialState = {
    error: null,
    walletError: null
};

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_ERRORS:
            return {
                ...state,
                error: action.payload
            };
        case SET_WALLET_ERROR:
            return {
                ...state,
                walletError: action.payload
            };
        case EMPTY_ERRORS:
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
}
