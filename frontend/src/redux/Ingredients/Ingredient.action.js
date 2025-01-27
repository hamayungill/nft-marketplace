import { GET_ERRORS,GET_INGREDIENTS, BEFORE_INRGEDIENT, RANDOM_PIZZA_INGREDIENTS} from '../type';
import { emptyError } from '../error/error.action';
import { ENV } from '../../config/config';

export const beforeIngredient = () =>{
    return{
        type: BEFORE_INRGEDIENT
    }
}

// ingredient for buy and bake pizza
export const ingForBuyAndBake = () => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}ingredient/list`;
    
    fetch(url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: GET_INGREDIENTS,
                payload: data
            })
        } else {
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(error => {
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};

// ingredients for random pizza bake
export const getRandomIngredients = () => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}ingredient/ingredients-random-pizza`;

    fetch(url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
        },
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: RANDOM_PIZZA_INGREDIENTS,
                payload: data
            })
        } else {
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(error => {
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};