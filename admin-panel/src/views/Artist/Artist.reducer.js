import { BEFORE_ARTIST, UPSERT_ARTIST, DELETE_ARTIST, GET_ARTISTS, GET_ARTIST } from '../../redux/types';

const initialState = {
    artist: null,
    artists: null,
    pagination: null,
    deleteArtistAuth: false,
    upsertArtistAuth: false,
    getArtistAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case UPSERT_ARTIST:
            return {
                ...state,
                artist: action.payload,
                upsertArtistAuth: true  
            }
        case DELETE_ARTIST:
            return {
                ...state,
                artist: action.payload,
                deleteArtistAuth: true
            }
        case GET_ARTISTS:
            return {
                ...state,
                artists: action.payload.data,
                pagination: action.payload.pagination,
                getArtistAuth: true
            }
        case GET_ARTIST:
            return {
                ...state,
                artist: action.payload,
                getArtistAuth: true
            }
        case BEFORE_ARTIST:
            return {
                ...state,
                artist: null,
                artists: null,
                pagination: null,
                deleteArtistAuth: false,
                getArtistAuth: false
            }
        default:
            return {
                ...state
            }
    }
}