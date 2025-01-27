import { BEFORE_FAQ, UPSERT_FAQ,DELETE_FAQ,GET_FAQS,GET_FAQ } from '../../redux/types';

const initialState = {
    faq: null,
    faqs: null,
    pagination: null,
    deleteFaqAuth: false,
    upsertFaqAuth: false,
    getFaqAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case UPSERT_FAQ:
            return {
                ...state,
                faq: action.payload,
                upsertFaqAuth: true
            }
        case DELETE_FAQ:
            return {
                ...state,
                faq: action.payload,
                deleteFaqAuth: true
            }
        case GET_FAQS:
            return {
                ...state,
                faqs: action.payload.data,
                pagination: action.payload.pagination,
                getFaqAuth: true
            }
        case GET_FAQ:
            return {
                ...state,
                faq: action.payload,
                getFaqAuth: true
            }
        case BEFORE_FAQ:
            return {
                ...state,
                faq: null,
                faqs: null,
                pagination: null,
                deleteFaqAuth: false,
                upsertFaqAuth: false,
                getFaqAuth: false
            }
        default:
            return {
                ...state
            }
    }
}