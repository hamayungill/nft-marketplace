import { GET_SETTINGS, GET_ERRORS } from "../type";
import { ENV } from "../../config/config";

export const getSettings = () => dispatch => {
    const url = `${ENV.url}settings/get`;
    fetch(url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
        },
    }).then(res => res.json()).then(data => {
        if(data.success) {
            dispatch({
                type: GET_SETTINGS,
                payload: data.settings
            })
        }
    }). catch(errors => {
        dispatch({
            type: GET_ERRORS,
            payload: errors
        })
    })
}   