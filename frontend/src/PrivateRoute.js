import React from "react";
import { Route } from 'react-router-dom'

export const PrivateRoute = ({ component:Component, access, ...rest}) => {
    return(
        <Route
        {...rest}
        render={props =>
            access === true ? (<Component {...props} />) : ''
        } />
    )
}
