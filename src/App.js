import React from 'react';

import { Provider } from "mobx-react";
import { BrowserRouter, Route } from 'react-router-dom'
import { SlashrApp } from './SlashrApp';
// import { Slashr } from './Slashr';
import { _Router } from './Router';

export class App extends React.Component {
		constructor(props){
            super(props);
            this.app = new SlashrApp(this.props);
            console.log("SlashrInstance",this.app.slashrInstance);
		}
		render() {
            
            return(
                <Provider app={this.app} slashr={this.app.slashrInstance}>
                    <BrowserRouter>	
                        <Route component={_Router} />
                    </BrowserRouter>
                </Provider>	
            );
		}
}