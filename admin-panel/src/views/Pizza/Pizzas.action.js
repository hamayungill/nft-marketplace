import { toast } from 'react-toastify';
import { GET_ERRORS, BEFORE_PIZZA, GET_PIZZAS, SEND_RARITY_REWARD } from '../../redux/types';
import { emptyError } from '../../redux/shared/error/error.action';
import { ENV } from '../../config/config';

export const beforePizza= () => {
    return {
        type: BEFORE_PIZZA
    }
}

export const getPizzas = (qs='', body={}) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}pizza/list`;
    
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
            console.log("data.data: ", data)
            // toast.success(data.message , {
            //     toastId: "customId4"
            // })
            dispatch({
                type: GET_PIZZAS,
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

export const sendRarityReward = (body={}) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}/rarity-reward/send`;
    toast.dismiss();
    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: SEND_RARITY_REWARD,
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
