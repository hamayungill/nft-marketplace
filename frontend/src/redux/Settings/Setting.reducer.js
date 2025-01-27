import { GET_SETTINGS } from "../type";

const initialState = {
    setting: null
}

export const settingReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_SETTINGS:
            return {
                ...state,
                setting: action.payload
            }
        default:
            return {
                ...state
            }
    }
}