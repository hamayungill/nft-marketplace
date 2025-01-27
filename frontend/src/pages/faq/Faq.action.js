import { GET_FAQ, GET_ERRORS } from "../../redux/type";
import {ENV} from '../../config/config';
import { toast } from "react-toastify";
import { emptyError } from '../../redux/error/error.action'

export const getFaqs = () => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}faq/list`;
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
                payload: data.data.data
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
            dispatch({
                type: GET_ERRORS,
                payload: error
            })
        }
    })
};    

