import { toast } from 'react-toastify';
import { GET_ERRORS, BEFORE_INGREDIENT, GET_INGREDIENTS, UPSERT_INGREDIENT, DELETE_INGREDIENT, GET_INGREDIENT } from '../../redux/types';
import { emptyError } from '../../redux/shared/error/error.action';
import { ENV } from '../../config/config';

export const beforeIngredient= () => {
    return {
        type: BEFORE_INGREDIENT
    }
}

export const getIngredients = ( qs = '', body={}) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}ingredient/list`;

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
            // toast.success(data.message,{
            //     toastId: "customId3"
            // })
            dispatch({
                type: GET_INGREDIENTS,
                payload: data.data
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

export const getIngredient = (id) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}ingredient/get`;
    if (id)
        url += `/${id}`

    fetch(url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: GET_INGREDIENT,
                payload: data.ingredient
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

export const upsertIngredient = (apiURL, body, method = 'POST') => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}${apiURL}`;
    
    fetch(url, {
        method,
        headers: {
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        },
        body
    }).then(res => res.json()).then(data => {
        if (data.success) {
            // toast.success(data.message)
            dispatch({
                type: UPSERT_INGREDIENT,
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

export const deleteIngredient = (ingredientId) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}ingredient/delete/${ingredientId}`;

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
                type: DELETE_INGREDIENT,
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