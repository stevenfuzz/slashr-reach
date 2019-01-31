import React from 'react';

//import { observer, inject } from 'mobx-react';
import { Provider } from "mobx-react";
import { BrowserRouter, Route } from 'react-router-dom'
import { Slashr } from './Slashr';
import { _Router } from './Router';
//import './Main.css';



// import { library } from '@fortawesome/fontawesome-svg-core'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faIgloo } from '@fortawesome/free-solid-svg-icons'

// library.add(faIgloo)


// import IconButton from "../controls/IconButton";
// // import { Form, Input, Error, Success, Label, Errors, Field, TextArea, SubmitButton } from 'slashr-react';
// // import { Post } from '../post/Post';
// import headerImage from "../../config/assets/social-logo.png";
// import ProgressIndicator from '../loaders/ProgressIndicator';
// import LoadingSpinner from '../loaders/LoadingSpinner';

export class App extends React.Component {
		constructor(props){
            super(props);
            this.app = Slashr.createApp(this.props);
		}
		componentDidMount(){

		}
		componentDidUpdate(prevProps){
			
		}
		componentWillReact(){
			
		}
		// dialogRouteComponent(){
		// 	let dialog = this.props.location.state.dialog;
		// 	console.log("Calling post dialog open",this.props.app.mdl.ui.dialog);
		// 	this.props.app.mdl.ui.dialog.open(dialog);
		// 	return null;
		// }
		
		render() {
            return(
                <Provider app={this.app} slashr={Slashr.getInstance()}>
                    <BrowserRouter>	
                        <Route component={_Router} />
                        {/* <Router 
                            app={this.app}
                            onLoading={()=>{
                                alert("init on loading");
                                //this.props.app.mdl.ui.progressIndicator.show();
                            }}
                            onLoaded={(location)=>{
                                //this.props.app.mdl.dm.app.initializeRoute(location);
                                //this.props.app.mdl.ui.progressIndicator.hide({delay:500});
                            }}
                        /> */}
                        {/* <Route path="/" render={()=>{
                            return this.props.children;
                        }} /> */}
                        {/* {this.props.children} */}
                    </BrowserRouter>
                </Provider>	
            );
		}
}

// export default Router;