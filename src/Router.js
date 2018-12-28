import React from 'react';

import { observer, inject } from 'mobx-react';
//import './Main.css';
import { Route, Switch, withRouter, matchPath, BrowserRouter } from 'react-router-dom';
import { Dialog } from './Slashr';
// import {Slashr} from 'slashr-react';

// import IconButton from "../controls/IconButton";
// // import { Form, Input, Error, Success, Label, Errors, Field, TextArea, SubmitButton } from 'slashr-react';
// // import { Post } from '../post/Post';
// import headerImage from "../../config/assets/social-logo.png";
// import ProgressIndicator from '../loaders/ProgressIndicator';
// import LoadingSpinner from '../loaders/LoadingSpinner';

export const Router = inject("slashr")(observer(
	class Routes extends React.Component {
		constructor(props){
			super(props);
			this.name = this.props.name || "default";
            this.slashr = this.props.slashr;
			if(! this.slashr.app.routes) throw("Router Error: No routes found.");
			this.slashr.router.initialize(this.name, props);
		}
		render() {
			let component = this.props.loader || null;
			let routeComponent = this.props.slashr.router.instance(this.name).component;
			if(routeComponent){
				component = (
					<React.Fragment
						key={this.props.slashr.router.instance(this.name).pathname}
					>
						{routeComponent}
					</React.Fragment>
				);
			}
			
			console.log("VIEW RENDER COMPONENT",routeComponent,component,this.props.slashr.router.instance(this.name));
			

			return component;
            // console.log("RENDER ROUTER");
            // let component = null;
            // let route = null; 
			// for(let route of this.routePropss){
			// 	if(route.controller){
			// 		let match = matchPath(this.props.location.pathname, route.path);
			// 		if(match && match.isExact){
			// 			console.log("render component",this.props.location.pathname,this.component);
            //             route = this.location.pathname;
            //             if(this.component) component = <React.Fragment key={route}>{this.component}</React.Fragment>;
            //             break;
			// 		}
			// 	}
            // }
            // console.log("Default Layout",this.props.app.defaultLayout);
            // // let Layout = React.cloneElement(this.props.app.defaultLayout,{app: this.props.app});
            // let Layout = this.props.app.defaultLayout;
            // return <Layout />;
            
			
			// var hasMatch = false;
			// const routeComponents = this.routePropss.map(({controller, action,layout,path, key, component, dialog, reload}) => {
			// 	if(this.isDialogRoute && dialog){
			// 		console.log("post dialog path",path);
			// 		return null;
			// 	}
			// 	key = key || path;
				
			// 	if(controller){
					
			// 		let match = matchPath(this.props.location.pathname, { path });
			// 		if(! hasMatch && match && match.isExact){
			// 			console.log("mount SHOWING ROUTE",this.props.location.pathname);
			// 			// let component = this.state.component;
			// 			// console.log("FEED update GETTING NEXT ROUTE",key,match,component);
			// 			//this.initializeActionResult(controller, action);
			// 			// component = this.state.component;

			// 			return <Route exact path={path} render={(props)=>{
			// 				return this.component;
			// 			}} key={key} />;

			// 		}
			// 	}
			// 	// Check for match, and set key to url
			// 	// This will force reload routes with same path, differant params
			// 	// if(reload){
			// 	// 	let match = matchPath(this.props.location.pathname, { path });
			// 	// 	if(! hasMatch && match && match.isExact){
			// 	// 		hasMatch = true;
			// 	// 		key = match.url;
			// 	// 	}
			// 	// }
			// 	// return <Route exact path={path} component={component} key={key} />
			// });
			console.log("LOAD ROUTE.",this.location.pathname);
			// return (
            //     <React.Fragment>
            //         <Switch location={this.location}>
            //             {routeComponents}
            //             {/* <Route path="/:type" exact render={(props)=>{
            //                 console.log("ROUTE TEST check match",props);
            //                 return <FeedType {...props}/>
            //             }} />
            //             <Route path="/:type/f/:filters" render={(props)=>{
            //                 console.log("ROUTE TEST check match",props);
            //                 return <FeedType location={props.location} history={props.history} match={props.match} key={props.match.params.type}/>
            //             }} /> */}
            //         </Switch>
            //         {/* <RouteDialog isDialogRoute={this.isDialogRoute}/> */}
            //     </React.Fragment>
			// );
		}
}
));

export const _RouteController = inject("slashr")(observer(
	class _RouteController extends React.Component {
    constructor(props){
        super(props);
		this.app = this.props.slashr.app;
		console.log("VIEW ROUTE CONTROLLER",this.props);
       
        this.location = this.props.location;
		console.log("view props",this.app,this.props);
		//this.updateRoutes();
	}
	async initializeActionResult(Controller, actionName = "default", params = {}){
		let routerName = "default";
		// controllerName = Slashr.utils.str.capitalize(controllerName);

		// // const Controller = require(`../../controllers/${controllerName}Controller`);
	   
		// console.log("feed check controller",`../../controllers/${controllerName}Controller`,Controller);
		// //console.log("feed look at this",Controller[`${controllerName}Controller`].prototype.defaultAction.toString());
		let controller = new Controller(this.props.domain);
		//let controller = new Controller[`${controllerName}Controller`](this.props.domain);
		let actionMethod = `${actionName}Action`;
		console.log("controller",controller[actionMethod]);

		if(! controller[actionMethod]) throw(`Controller Error: ${actionMethod} not found in controller ${controller.constructor.name}`);
				   
		this.props.slashr.router.handleLoading(routerName);

		// Add Url Query Variables to params
		let searchParams = new URLSearchParams(this.props.location.search.substring(1));

		for(let key of searchParams.keys()){
			if(key in params) continue;
			params[key] = searchParams.get(key);
		}

		let rslt = await controller[actionMethod](params);

		// let component = null;
		// if(Component instanceof SlashrControllerActionComponentResult){
		// 	component = rslt.render;
		// }
		// else component = rslt;
		let component = rslt;

		this.props.slashr.router.handleLoaded(routerName);
		
		console.log("view update component", component, this.props.location);
		//this.location = this.props.location;
		//this.component = component;
		//this.component = React.cloneElement(component,{path: this.location.pathName});

		// this.setState({
		// 	path: this.location.pathname
		// }); 
		
		this.props.slashr.router.update(routerName, component, this.props);
		
	}
    updateRoutes(){
		console.log("view RENDER ROUTER",this.location.pathname);
        let component = null;
        let route = null; 
		
        for(let route of this.app.routes){
            if(route.controller){
				let match = matchPath(this.props.location.pathname, route.path);
				
                if(match && match.isExact){
					console.log("view RENDER ROUTER match",this.location.pathname, match, route);
					this.initializeActionResult(route.controller, route.action, match.params);
                    break;
                }
            }
        }
    }
    componentDidMount(){''
		this.updateRoutes();
    }
    componentDidUpdate(prevProps){
		if(this.props.location.pathname !== prevProps.location.pathname || this.props.location.search !== prevProps.location.search){
			this.updateRoutes();
		}
    }
    componentWillReact(){
        
    }
    render() {
        let Layout = this.app.defaultLayout;
        if(! Layout) throw("TODO: Add slashr no layout");
        return(
            <Layout />
        );
    }
}));

// export const RouterView = inject("slashr")(observer(
// 	class RouterView extends React.Component {
// 		constructor(props){
//             super(props);
// 		}
// 		render(){

//             console.log("router instances",this.props.slashr.router);

//             return null;

//             let name = this.props.name || "default";
// 			return this.props.slashr.router.instance(name).component;
// 		}
// 	}
// ));

// export default Router;

export const RouteLink = inject("slashr")(observer(
	class ContentRoute extends React.Component {
		constructor(props){
			super(props);
			this.handleClick = this.handleClick.bind(this);
			this.routeProps = {
				route: this.props.route || null,
				router: this.props.router || "default"
			};
			//this.pathname = null;
			//this.routeProps.router = this.props.router || "default";
			//this.routeProps = null;

			if(! this.props.to) throw("Route Link Error: No to.");
			if(typeof this.props.to === 'object'){
				if(this.props.to.pathname) this.routeProps.route = this.props.to.pathname;
				else if(this.props.to.route) this.routeProps.route = this.props.to.route;
				if(this.props.to.router){
					this.routeProps.router = this.props.to.router;
				}
			}
			else this.routeProps.route = this.props.to;
			if(! this.routeProps.route) throw("Route Link Error: No pathname.");

		}
		handleClick(e){
			e.preventDefault();
			e.stopPropagation();
			this.props.slashr.app.router.push(this.routeProps);
		}
		render(){
			return (
				<a href={this.routeProps.route} onClick={this.handleClick}>{this.props.children}</a>
			);
		}
	}
));

const ContentRoute = withRouter(inject("domain")(observer(
	class ContentRoute extends React.Component {
		constructor(props){
			super(props);
			throw("CONTE TROUTE");
		}
		render(){
			return null;
		}
	}
)));

export const RouteDialog = inject("slashr")(observer(
	class RouteDialog extends React.Component {
		constructor(props){
			super(props);
			this.handleClose = this.handleClose.bind(this);
			this.handleClickClose = this.handleClickClose.bind(this);
			this.name = this.props.name || "dialog";
			this.location = this.props.location;
			this.slashr = this.props.slashr;
			this.routePropsr = this.slashr.router.initialize(this.name, this.props);
			// if(this.dialog){
			// 	this.props.app.mdl.ui.dialog.open(this.dialog,{
			// 		component: this.props.component,
			// 		props: {
			// 			location: this.props.location,
			// 			match: this.props.match
			// 		}
			// 	});
			// }
        }
        get isOpen() {

			

			return false;
			//return this.props.app.mdl.ui.dialog.isOpen("route");
		}
        get shouldOpen(){
            return (! this.isOpen && ! this.shouldClose);
        }
        get shouldClose(){
            return (! this.props.isDialogRoute);
		}
		get isDialogRoute(){
			return(this.props.location.state
				&& this.props.location.state.dialog
				&& (! this.location || this.props.location.pathname !== this.location.pathname)) ? true : false;
		}
        close(){
            //this.props.app.mdl.ui.dialog.close("route");
        }
        open(){
            //this.props.app.mdl.ui.dialog.open("route");
        }
        handleUpdate(){
            if(this.shouldClose) this.close();
			else if(this.shouldOpen) this.open();
			if(! this.shouldClose) this.location = this.props.location;
        }
		componentDidMount(){
			this.handleUpdate();
        }
        componentDidUpdate(){
			this.handleUpdate();
		}
		handleClickClose(){
			this.handleClose();
		}
        handleClose() {
			// let postRoute = this.props.domain.post.renderRoute(dialogState.type, dialogState.uid, {dialog: false});
			if(this.location.pathname === this.props.location.pathname){
				this.props.history.go(-1);
			}
			// if(postRoute ===  this.props.location.pathname){
			// 
			// }
			// if(this.isOpen) this.close();
		}
		// componentWillReact(){
		// 	// console.log("Route dialog react!!!",this.props);
		// }
		componentWillUnmount(){
			if(this.isOpen) this.close();
		}
		render() {
            let routeDialogComponents = null;
			if(! this.shouldClose){
				// routeDialogComponents = this.routePropss.map(({path, key, component, dialog, reload}) => {
				// 	if(dialog){

				// 		// Set key?
				// 		return <Route exact path={path} key={key || path} render={(props)=>{
				// 			let Component = component;
				// 			return <Component 
				// 					isDialog 
				// 					{...props}
				// 				/>;
				// 		}}/>
				// 	}
				// 	return null;
				// });
			}
			return (
				<Dialog
					className="dialog-view"
					backdropClassName="dialog-backdrop-view"
					open={this.isOpen}
					onClose={this.handleClose}
					// closeButton={<IconButton icon="close" size="medium" type="close" />}
					{...this.props}
				>
					<Router name={this.name} />
					{/* <Container className="dialog-view-header">
						<IconButton icon="arrowBack" onClick={this.handleClickClose}>
							<Image src={headerImage} />
						</IconButton>
					</Container>
					<Switch location={this.props.location}>
						{routeDialogComponents}
					</Switch> */}
					{/* <ProgressIndicator name="routeDialog" /> */}
				</Dialog>
			);
		}
}
));