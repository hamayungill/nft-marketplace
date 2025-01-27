import { GET_ERRORS, EMPTY_ERRORS, SET_WALLET_ERROR } from '../../types';

export const setError = (error) => {
    return {
        type: GET_ERRORS,
        payload: error
    }
}

export const emptyError = (error) => {
    return {
        type: EMPTY_ERRORS,
        payload: error
    }
}

export const setWalletError = (error) => {
    return {
        type: SET_WALLET_ERROR,
        payload: error
    }
}
