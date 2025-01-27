import { SET_USER , DISCONNECT_USER } from "../type";

const initialState = {
    userData: null,
    userAuth: false
}

export const userReducer =(state = initialState, action)=>{
    switch (action.type) {
        case SET_USER:
            return {
                ...state,
                userData: action.payload,
                userAuth: true
            }
        case DISCONNECT_USER:
            localStorage.removeItem("encuser")
            return {
                ...state,
                userData: null,
                userAuth: false
            }
        default:
            return {
                ...state
            }
    }
}