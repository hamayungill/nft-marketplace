import { toast } from 'react-toastify';
import { GET_ERRORS, GET_DASHBOARD_STATS } from '../../redux/types';
import { emptyError } from '../../redux/shared/error/error.action';
import { ENV } from '../../config/config';


// ingredient stats
export const getDashboardStats = () => dispatch => {
    dispatch(emptyError());
    // toast.dismiss()
    let url = `${ENV.url}ingredient/stats`;

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
                type: GET_DASHBOARD_STATS,
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