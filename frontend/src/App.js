import React from "react";
import {BrowserRouter as Router, Switch } from "react-router-dom";
import routes from "./routes";
import  { PrivateRoute } from './PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App(){
	return (
		<Router>
			<Switch>
            {
              routes.map((route, index) => {
                return (
                  <PrivateRoute
                    key={index}
                    path={route.path}
                    exact={route.exact}
                    access={true}
                    component={props =>
                      <route.layout {...props} title={route.title} subpage = {route.subpage} page = {route.page}  >
                        <route.component {...props} />
                      </route.layout>
                    }
                  />
                )
              })
            }
        </Switch>
		</Router> 
	)
}

export default App