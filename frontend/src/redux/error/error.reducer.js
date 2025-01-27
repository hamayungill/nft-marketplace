import { GET_ERRORS, EMPTY_ERRORS } from '../type';

const initialState = {
    error: null
};

export const errorReducer = (state = initialState, action)=>{
    switch (action.type) {
        case GET_ERRORS:
            return {
                ...state,
                error: action.payload
            };
        case EMPTY_ERRORS:
            return initialState;
        default:
            return state;
    }
}