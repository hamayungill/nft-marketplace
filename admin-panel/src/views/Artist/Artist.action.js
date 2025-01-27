import { toast } from 'react-toastify';
import { GET_ERRORS, GET_ARTISTS, BEFORE_ARTIST, UPSERT_ARTIST, DELETE_ARTIST, GET_ARTIST} from '../../redux/types';
import { emptyError } from '../../redux/shared/error/error.action';
import { ENV } from '../../config/config';

export const beforeArtist = () => {
    
    return {
        type: BEFORE_ARTIST
    }
}

export const getArtists = ( qs = '', body = {} ) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}artist/list`;
    if (qs)
        url += `?${qs}`
    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        }, 
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            // toast.success(data.message, {
            //     toastId: "customId2"
            // })
            dispatch({
                type: GET_ARTISTS,
                payload: data.data
            })
        } else {
            if (data.message)
                toast.error(data.message)
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};

export const getArtist = (id) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}artist/get`;
    if (id)
        url += `/${id}`

    fetch(url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            console.log("artist/get : ", data.data)
            dispatch({
                type: GET_ARTIST,
                payload: data.data
            })
        } else {
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};


export const upsertArtist = (apiURL, body, method = 'POST') => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}${apiURL}`;
    toast.dismiss("customId2")

    fetch(url, {
        method,
        headers: {
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        },
        body,
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message, {
                toastId: "customId7"
            })
            dispatch({
                type: UPSERT_ARTIST,
                payload: data
            })
        } else {
            toast.error(data.message)
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};


export const deleteArtist = (artistId) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}artist/delete/${artistId}`;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: DELETE_ARTIST,
                payload: data
            })
        } else {
            toast.error(data.message)
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};