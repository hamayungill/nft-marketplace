import { SET_USER, GET_ERRORS, DISCONNECT_USER } from "../type";
import { emptyError } from "../error/error.action";
import { ENV } from '../../config/config';

// set user data
export const setUser = (payload) => dispatch => {
    dispatch(emptyError())
    dispatch({
        type: SET_USER,
        payload
    })
}

// disconnect user data
export const disconnectUser = () => dispatch => {
    dispatch(emptyError())
    dispatch({
        type: DISCONNECT_USER,
    })
}

// login action
export const login = (payload) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}/auth/login/`;
    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(payload)
    }).then(res => res.json()).then(data => {
        console.log(data)
        if (data.status) {
            dispatch({
                type: SET_USER,
                payload: data.data
            })
        } else {
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(errors => {
        dispatch({
            type: GET_ERRORS,
            payload: errors
        })
    })
};
