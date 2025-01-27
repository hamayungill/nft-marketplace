import { toast } from 'react-toastify';
import { GET_ERRORS, GET_FAQS, BEFORE_FAQ, UPSERT_FAQ, DELETE_FAQ, GET_FAQ} from '../../redux/types';
import { emptyError } from '../../redux/shared/error/error.action';
import { ENV } from '../../config/config';

export const beforeFaq = () => {
    return {
        type: BEFORE_FAQ
    }
}

export const getFaqs = (qs = '', body = {}) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}faq/list`;
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
            // toast.success(data.message)
            dispatch({
                type: GET_FAQS,
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

export const getFAQ = (id) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}faq/get`;
    if (id)
        url += `/${id}`

    fetch(url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: GET_FAQ,
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


export const upsertFAQ = (apiURL, body, method = 'POST') => dispatch => {
    let bodyPayload=JSON.stringify(body)

    dispatch(emptyError());
    const url = `${ENV.url}${apiURL}`;

    fetch(url, {
        method,
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        },
        body:JSON.stringify(body),
    }).then(res => res.json()).then(data => {
        if (data.success) {
            // console.log("data.message : ",data.message)
            toast.success(data.message)
            dispatch({
                type: UPSERT_FAQ,
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


export const deleteFAQ = (faqId) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}faq/delete/${faqId}`;

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
                type: DELETE_FAQ,
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