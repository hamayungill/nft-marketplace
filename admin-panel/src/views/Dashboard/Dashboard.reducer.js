import { GET_DASHBOARD_STATS } from '../../redux/types';

const initialState = {
    dashboardStats: null,
    pizzaStats: null ,
    dashboardStatsAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_DASHBOARD_STATS:
            return {
                ...state,
                dashboardStats: action.payload,
                dashboardStatsAuth: true 
            }
        default:
            return {
                ...state
            }
    }
}