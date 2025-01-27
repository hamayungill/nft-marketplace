import { BAKE_PIZZA, GET_ERRORS, BEFORE_BAKE_PIZZA, BAKED_PIZZAS, UNBAKE_PIZZA, REBAKE_PIZZA_INGREDIENTS, REBAKED_PIZZA, RANDOM_PIZZA, GET_PIZZA, BUY_AND_BAKE_PIZZA } from "../type";
import { emptyError } from "../error/error.action";
import { ENV } from "../../config/config";

// before bake pizza 
export const beforeBakePizza = () => dispatch => {
    dispatch({
        type: BEFORE_BAKE_PIZZA
    })
}

// Get Pizza Detail
export const getPizza = (_id = '') => dispatch => {
    dispatch(emptyError());
    fetch(ENV.url + 'pizza?_id=' + _id, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: GET_PIZZA,
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
                console.log(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};

// create pizza api call
export const bakePizza = (payload) => dispatch => {
    dispatch(emptyError())
    const url = `${ENV.url}pizza/create`;
    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(payload)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: BAKE_PIZZA,
                payload: data
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
}

// list already baked pizzas api
export const getBakedPizzas = (qs = '',callback) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}pizza/list`;
    if (qs)
        url += `?${qs}`

    fetch(url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: BAKED_PIZZAS,
                payload: data.data
            })
           
        } else {
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
        callback(false)
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                console.log(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};


// unbake pizza api - delete 
// export const deletePizza = (pizzaId) => dispatch => {
//     dispatch(emptyError());
//     let url = `${ENV.url}pizza/delete/${pizzaId}`;

//     fetch(url, {
//         method: 'DELETE',
//         headers: {
//             'content-type': 'application/json',
//         }
//     }).then(res => res.json()).then(data => {
//         if (data.success) {
//             dispatch({
//                 type: UNBAKE_PIZZA,
//                 payload: data
//             })
//         } else {
//             dispatch({
//                 type: GET_ERRORS,
//                 payload: data
//             })
//         }
//     }).catch(error => {
//         if (error.response && error.response.data) {
//             const { data } = error.response
//             if (data.message)
//                 console.log(data.message)
//         }
//         dispatch({
//             type: GET_ERRORS,
//             payload: error
//         })
//     })
// };

// get rebake pizza ingredients 
export const rebakePizzaIngredients = (pizzaId) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}pizza/ingredients/${pizzaId}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: REBAKE_PIZZA_INGREDIENTS,
                payload: data.pizza
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
                console.log(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};

// rebake or edit pizza api call in temp collection
export const rebakedPizza = (payload) => dispatch => {
    dispatch(emptyError())
    const url = `${ENV.url}pizza/create/tempPizza`;
    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(payload)
    }).then(res => res.json()).then(data => {
        console.log(data)
        if (data.success) {
            dispatch({
                type: REBAKED_PIZZA,
                payload: data
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
}

// create pizza api call
export const randomBakePizza = (payload, type) => dispatch => {
    dispatch(emptyError())
    const url = `${ENV.url}pizza/create-random`;
    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(payload)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            if(type === "buyAndBake"){
                dispatch({
                    type: BUY_AND_BAKE_PIZZA,
                    payload: data
                })
            }else if(type === "randomBake" || type === "bakeAndMint"){
                dispatch({
                    type: RANDOM_PIZZA,
                    payload: data
                })
            }else {}
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
}

// list already baked pizzas api by current owner Id
export const getBakedPizzasByUser = (body = {}) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}pizza/listByUser`;

    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: BAKED_PIZZAS,
                payload: data.data
            })
        } else {
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }        
        // callback(false)
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                console.log(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};