import React from 'react';

import { Provider, observer, inject } from 'mobx-react';
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

export const _Router = inject("slashr")(observer(
	class _Router extends React.Component {
		constructor(props) {
			super(props);
			this.app = this.props.slashr.app;
			//this.props.location.state.router
			this.location = this.props.location;
			this.route = null;
			this.prevRoute = null;
			this.doUpdateScroll = false;
			this.scrollUpdateAttempts = 0;

			//TODO: Where do I put this?
			if (window.history && window.history.scrollRestoration) {
				window.history.scrollRestoration = "manual";
			}
			//this.updateRoutes();
			this.props.slashr.router.initialize(props);
		}
		async initializeActionResult(routerViewName, route, match) {
			//let Controller = route.controller;
			
			console.log("app route init",routerViewName,route, match);

			return await this.props.slashr.router.load(route, routerViewName,
				{
					location: this.props.location,
					match: match
				}
			);


			// controllerName = Slashr.utils.str.capitalize(controllerName);
			
			// // const Controller = require(`../../controllers/${controllerName}Controller`);

			// console.log("feed check controller",`../../controllers/${controllerName}Controller`,Controller);
			// //console.log("feed look at this",Controller[`${controllerName}Controller`].prototype.defaultAction.toString());
			// let controller = new Controller(this.props.slashr.router.view(routerViewName), this.props.domain);
			// //let controller = new Controller[`${controllerName}Controller`](this.props.domain);
			// let actionMethod = `${actionName}Action`;

			// if (!controller[actionMethod]) throw (`Controller Error: ${actionMethod} not found in controller ${controller.constructor.name}`);

			// this.props.slashr.router.handleLoading(routerViewName);

			// let routeData = {
			// 	params: match.params || {}
			// };

			

			
			// // Add Url Query Variables to params
			// let searchParams = new URLSearchParams(this.props.location.search.substring(1));

			// // console.log("initializeActionResult",routerViewName, route, match);

			// // throw("SLDKJF");

			// for (let key of searchParams.keys()) {
			// 	if (key in params) continue;
			// 	params[key] = searchParams.get(key);
			// }

			// let rslt = await controller[actionMethod](params);

			// // let component = null;
			// // if(Component instanceof SlashrControllerActionComponentResult){
			// // 	component = rslt.render;
			// // }
			// // else component = rslt;
			// appRoute.component = rslt;

			// this.props.slashr.router.handleLoaded(appRoute);

			// //this.location = this.props.location;
			// //this.component = component;
			// //this.component = React.cloneElement(component,{path: this.location.pathName});

			// // this.setState({
			// // 	path: this.location.pathname
			// // }); 

			// this.props.slashr.router.update(appRoute);

			//return true;

		}
		async updateRoutes(prevLocation) {
			let component = null;
			// let route = null;
			let isFound = false;
			// let locationState = this.props.location.state || {};
			// Update the router
			let routerState = (this.props.location.state && this.props.location.state._slashr) ? this.props.location.state._slashr.router : {};

			let prevRoute = this.app.router.route;

			let promises = [];
			let currViewName = (routerState && routerState.view) || "default";
			let hasMatch = false;
			let currViews = {};
			//TODO: Rewrite this is a total mess. Refactor and simplify
			let t = 0;
			for (let routeData of this.app.routes) {

				let paths = [routeData.path];
				if(routeData.alias){
					if(typeof routeData.alias === 'string') paths.push(routeData.alias);
					else routeData.alias.forEach((path)=>{
						routeData.push(path);
					})
				}

				for(let path of paths){
					if(! routeData.controller) throw("No Controller Found for route");
						
					for (let viewName in this.props.slashr.router.views) {
						// console.log("CHECK ROUTER",viewName,route,++t);
						if(currViews[viewName]) continue;
						//console.log("ROUTER STATE",routerState.views);
						let match = false;
						let routerView = this.props.slashr.router.views[viewName];

						if (routerState.views && routerState.views[viewName] && this.props.slashr.router.views[viewName]) {
							// Check if not loaded, or changed
							match = matchPath(routerState.views[viewName].pathname, path);
							if (match && match.isExact) {
								// Always refresh the currentview route
								//viewName !== currViewName && 
								if (routerView.hasLoaded && routerState.views[viewName].pathname === routerView.location.pathname
									&& routerState.views[viewName].search === routerView.location.search) {
									currViews[viewName] = true;
									match = false;
									break;
								}
							}
						}
						else if (viewName === currViewName) {
							// throw("Should this exist?");
							match = matchPath(this.props.location.pathname, path);
							if (match && match.isExact) {
								if (routerView.hasLoaded
									&& this.props.location.pathname === routerView.location.pathname
									&& this.props.location.search === routerView.location.search) {
									currViews[viewName] = true;
									match = false;
									break;
								}
							}
						}
					
						if (match && match.isExact) {
							currViews[viewName] = true;
							hasMatch = true;

							promises.push(
								this.initializeActionResult(viewName, routeData, match)
							);
							break;
						}
						//throw("SKLDJF");

					}
					if(hasMatch) break;
				}


			}
				//if(hasMatch) break;
			
			// Check current views
			// If not a current view, but the view has a route, reset it

			// Update any views that are loaded, but not in the request
			for (let view in this.props.slashr.router.views) {
				if (!currViews[view] && this.props.slashr.router.views[view].hasLoaded) {
					this.props.slashr.router.views[view].reset();
				}
			}
			console.log("app routers",this.props.slashr.router.views);
			//aleralert("start");
			
			await Promise.all(promises);

			// Update the routes
			this.props.slashr.router.activeViewName = currViewName;
			this.route = this.app.router.route;
			this.prevRoute = prevRoute;
			// this.currViewName = currViewName;

			this.doUpdateScroll = true;

			this.handleScrollBehavoir();

		}
		componentDidMount() {
			this.updateRoutes();
		}
		componentWillReact() {
		}
		componentDidUpdate(prevProps) {
			if (this.props.location.pathname !== prevProps.location.pathname || this.props.location.search !== prevProps.location.search) {
				this.props.slashr.router.initialize(this.props);
				this.updateRoutes(prevProps.location);
			}
		}
		componentWillReact() {

		}
		updateScroll(pos){
			// Poll for the body to be big enough, then scroll
			// If more than 1 second, just give up and set it
			let bodySize = this.props.slashr.utils.dom.getBodySize();
			//console.log("update scroll",window.scrollY,pos.y,pos,this.scrollUpdateAttempts);
			//console.log("update scroll x",document.documentElement.clientWidth, window.scrollX,pos.x,window.scrollx >= pos.x);
			// console.log("update scroll",bodySize,pos);
			if(this.scrollUpdateAttempts >= 100  || 
				(bodySize.y >= pos.y && bodySize.x >= pos.x)){
				this.props.slashr.utils.dom.scrollTo(pos.x, pos.y);
				this.scrollUpdateAttempts = 0;
			}
			else{
				this.scrollUpdateAttempts++;
				setTimeout(()=>{
					this.updateScroll(pos);
				},10);
			}
		}
		handleScrollBehavoir(){
			//TODO: Move this out of component?
			if(this.app.scrollBehavior){
				let uiState = this.props.slashr.router.getUiState(this.props.slashr.router.route.view);
				let scroll = (uiState && uiState.scroll) ? uiState.scroll : false;
				console.log("handleScrollBehavoir uistate: ",uiState);


				console.log("scroll behav check modal",this.route.isModal);

				let ret = this.app.scrollBehavior(this.route, this.prevRoute, scroll);
				if(ret){
					
					// wait for the document to become big enough
					let attempts = 0;
					let scrollTimeout = setTimeout(()=>{
						//window.scrollTo
					},100);

					// Check to see if it's ok to scroll
					this.updateScroll(ret);
				}
			}
		}
		render() {
			let Layout = this.app.defaultLayout;
			if (!Layout) throw ("TODO: Add slashr no layout");
			return (
				<Layout />
			);
		}
	}));

export const RouterView = inject("slashr")(observer(
	class RouterView extends React.Component {
		constructor(props) {
			super(props);
			this.name = this.props.name || "default";
			this.slashr = this.props.slashr;
			if (!this.slashr.app.routes) throw ("Router Error: No routes found.");
			this.slashr.router.create(this.name, props);
			this.appContext = this.props.slashr.router.createAppInstance(this.name);
		}
		render() {
			let component = this.props.loader || null;
			let routeComponent = this.props.slashr.router.view(this.name).component;
			if (routeComponent) {
				component = (
					// <React.Fragment
					// 	// key={this.props.slashr.router.view(this.name).pathname}
					// >
					//route={this.props.slashr.router.view(this.name)}
						<Provider 
							app={this.appContext} 
							route={this.props.slashr.router.view(this.name)}
						>
							{routeComponent}
						</Provider>

					// </React.Fragment>
				);
			}
			console.log("app route Return component",routeComponent);
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
			// console.log("LOAD ROUTE.",this.location.pathname);
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
	class RouteLink extends React.Component {
		constructor(props) {
			super(props);
			this.handleClick = this.handleClick.bind(this);
			this.routeProps = null;
			this.initialize();
			this.state = {
				isMatch: this.isMatch
			};
		}
		componentWillReact() {
		
		}
		componentDidUpdate() {
			//this.initialize();
		}
		handleClick(e) {
			e.preventDefault();
			// e.stopPropagation();
			if(this.props.onClick) this.props.onClick(e);
			this.props.slashr.app.router.push(this.routeProps);
		}
		initialize() {
			this.routeProps = this.props.slashr.router.parseLinkProps(this.props);
		}
		get isMatch() {

			// Check if it is a match with all views		
			for (let view in this.props.slashr.router.views) {
				if(! this.props.slashr.router.view(view).hasRoute) continue;
				if (!this.props.slashr.router.views[view].location) continue;
				let match = matchPath(this.props.slashr.router.views[view].location.pathname, this.routeProps.route);
				
				if (match && match.isExact) return true;
			}
			// let match = matchPath(this.props.slashr.router.location.pathname, this.routeProps.route);
			// console.log("LINK UPDATE MATCH",this.props.slashr.router, this.props.slashr.router.location.pathname,this.routeProps.route);
			// return (match && match.isExact) ? true : false;
			return false;
		}
		get className() {
			let classNames = [];
			if (this.props.className) classNames.push(this.props.className);
			if (this.props.activeClassName && this.isMatch) classNames.push(this.props.activeClassName);
			return classNames.length ? classNames.join(" ") : null;
		}
		render() {
			//let uid = this.props.slashr.router.uid;
			return (
				<a href={this.routeProps.route} className={this.className} onClick={this.handleClick}>{this.props.children}</a>
			);
		}
	}
));

const ContentRoute = withRouter(inject("domain")(observer(
	class ContentRoute extends React.Component {
		constructor(props) {
			super(props);
			throw ("CONTE TROUTE");
		}
		render() {
			return null;
		}
	}
)));



export const RouteDialog = inject("slashr")(observer(
	class RouteDialog extends React.Component {
		constructor(props) {
			super(props);
			this.handleClose = this.handleClose.bind(this);
			this.handleOpen = this.handleOpen.bind(this);
			//this.handleClickClose = this.handleClickClose.bind(this);
			this.name = this.props.name || "dialog";
			this.location = this.props.location;
			this.slashr = this.props.slashr;
			this.routeProps = this.slashr.router.create(this.name, this.props);
			//throw("SLKDJF");
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
			return this.slashr.router.hasRoute(this.name);
		}
		get shouldOpen() {
			return (!this.isOpen && !this.shouldClose);
		}
		get shouldClose() {
			return (!this.props.isDialogRoute);
		}
		get isDialogRoute() {
			return (this.props.location.state
				&& this.props.location.state.dialog
				&& (!this.location || this.props.location.pathname !== this.location.pathname)) ? true : false;
		}
		close() {
			//this.props.app.mdl.ui.dialog.close("route");
		}
		open() {
			//this.props.app.mdl.ui.dialog.open("route");
		}
		handleUpdate() {
			if (this.shouldClose) this.close();
			else if (this.shouldOpen) this.open();
			if (!this.shouldClose) this.location = this.props.location;
		}
		componentDidMount() {
			this.handleUpdate();
		}
		componentDidUpdate() {
			this.handleUpdate();
		}
		// handleClickClose(){
		// 	throw("SLKDJF");
		// 	this.handleClose();
		// }
		handleOpen() {
			if (this.props.onOpen) this.props.onOpen();
			// let postRoute = this.props.domain.post.renderRoute(dialogState.type, dialogState.uid, {dialog: false});
			// if(this.location.pathname === this.props.location.pathname){
			// 	this.props.history.go(-1);
			// }
			// if(postRoute ===  this.props.location.pathname){
			// 
			// }
			// if(this.isOpen) this.close();
		}
		handleClose() {
			// console.log("route dialog on close",this.props.onClose);
			if (this.props.onClose) this.props.onClose();

			//TODO: Allow for multiple layers
			//TODO: Refactor this
			let routerView = this.slashr.router.view("default");
			if (this.slashr.router.hasRoute(this.name)) this.slashr.router.reset(this.name);

			console.log("TODO: USE APP ROUTER USE APP ROUTER");

			let pushState = this.slashr.router.createState({
				view: "default"
			});

			console.log("pushing state",pushState);

			this.slashr.router.history.push({
				pathname: routerView.location.pathname,
				state:pushState,
				search: routerView.location.search || ""
			});

			//this.slashr.app.router.push(routerView.location.pathname + (routerView.location.search || ""));
		}
		componentWillReact() {
			// console.log("Route dialog react!!!",this.props);
		}
		componentWillUnmount() {
			if (this.isOpen) this.close();
		}
		render() {
			let uid = this.props.slashr.router.view(this.name).isInitialized;
			let routeDialogComponents = null;
			if (!this.shouldClose) {
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
			if (this.isOpen) console.log("ROUTE DIALOG SHOULD BE OPENING");
			return (

				<Dialog
					className="dialog-view"
					backdropClassName="dialog-backdrop-view"
					open={this.isOpen}
					onOpen={this.handleOpen}
					onClose={this.handleClose}
					closeButton={this.props.closeButton || null}
				// {...this.props}
				>

					<RouterView
						modal
						name={this.name}
					/>
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