import { GET_ARTISTS, BEFORE_ARTISTS } from '../type';

const initialState = {
    artists: [] 
}

export const ArtistsReducer =  ( state = initialState, action ) =>{
    switch (action.type) {
        case GET_ARTISTS:
            return { 
                ...state,
                artists: [...state.artists, ...action.payload.data] 
            }
        case BEFORE_ARTISTS:
            return {
                ...state,
                artists: []
            }
        default:
            return {
                ...state
            }
    }
}