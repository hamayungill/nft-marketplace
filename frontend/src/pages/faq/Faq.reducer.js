import { GET_FAQ } from "../../redux/type";

const initialState = {
    faqs: null,
    getFaqAuth: false,
}

export const faqsReducer =( state = initialState, action ) => {
    switch (action.type) {
        case GET_FAQ:
            return {
                ...state,
                faqs: action.payload,
                getFaqAuth: true
            }
        default:
            return {
                ...state
            }
    }
}