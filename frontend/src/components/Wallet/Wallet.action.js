import { SET_WALLET_ADDRESS, GET_WALLET_ADDRESS, GET_ERRORS, GET_WALLET_INGREDIENTS, GET_WALLET_PIZZAS, BEFORE_WALLET_DATA } from '../../redux/type';
import { emptyError } from '../../redux/error/error.action';
import { ENV } from '../../config/config';
import { toast } from 'react-toastify'

export const setWalletAddress = (address) => dispatch  => {
    dispatch({
        type: SET_WALLET_ADDRESS,
        payload: address
    })
}

export const beforeWalletData = () => dispatch  => {
    dispatch({
        type: BEFORE_WALLET_DATA
    })
}

export const getWalletAddress = () => dispatch =>  {
    dispatch({
        type: GET_WALLET_ADDRESS,
    })
}

export const getWalletData = (userId, type) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}users/myWallet/${userId}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({ type : type }) //If type === 'ingredient' then userIngredient [{},{}] 
                                              //else type=== 'pizza' then userPizza [{},{}]
    }).then(res => res.json()).then(data => {
        if (data.success) {
            if(type === "ingredient"){
                dispatch({
                    type: GET_WALLET_INGREDIENTS,
                    payload: data.data.userIngredients
                })
            }else if(type === "pizza"){
                dispatch({
                    type: GET_WALLET_PIZZAS,
                    payload: data.data.pizzas
                }) 
            }
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
            dispatch({
                type: GET_ERRORS,
                payload: error
            })
        }

    })
};