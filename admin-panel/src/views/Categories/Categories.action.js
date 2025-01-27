import { toast } from 'react-toastify';
import { GET_ERRORS, BEFORE_CATEGORY, GET_CATEGORIES, UPSERT_CATEGORY, DELETE_CATEGORY } from '../../redux/types';
import { emptyError } from '../../redux/shared/error/error.action';
import { ENV } from '../../config/config';

export const beforeCategory = () => {
    return {
        type: BEFORE_CATEGORY
    }
}

export const getCategories = (flag, pg, qs = {}) => dispatch => {
    dispatch(emptyError());
    toast.dismiss()

    let url = `${ENV.url}category/list`;
    if (pg)
        url += `?${pg}`

    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(qs)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            console.log("datadatadata catgeories = =", data)
            // if(flag == 1 ){
            // }
            // toast.success(data.message)
            dispatch({
                type: GET_CATEGORIES,
                payload: data.data
            })
        } else {
            if (flag !== 1)
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

export const upsertCategory = (apiURL, body, method = 'POST') => dispatch => {
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
            toast.success(data.message)
            dispatch({
                type: UPSERT_CATEGORY,
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

export const deleteCategory = (catId) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}category/delete/${catId}`;

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
                type: DELETE_CATEGORY,
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
