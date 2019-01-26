import React from 'react';

import { Provider, observer, inject } from 'mobx-react';
//import './Main.css';
import { Route, Switch, withRouter, matchPath, BrowserRouter} from 'react-router-dom';
import { Dialog, Container, HeadTags} from './Slashr';
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
		async initializeActionResult(routerPortalName, route, match) {
			//let Controller = route.controller;
			return await this.props.slashr.router.load(route, routerPortalName,
				{
					location: this.props.location,
					match: match
				}
			);


			// controllerName = Slashr.utils.str.capitalize(controllerName);
			
			// // const Controller = require(`../../controllers/${controllerName}Controller`);

			// console.log("feed check controller",`../../controllers/${controllerName}Controller`,Controller);
			// //console.log("feed look at this",Controller[`${controllerName}Controller`].prototype.defaultAction.toString());
			// let controller = new Controller(this.props.slashr.router.portal(routerPortalName), this.props.domain);
			// //let controller = new Controller[`${controllerName}Controller`](this.props.domain);
			// let actionMethod = `${actionName}Action`;

			// if (!controller[actionMethod]) throw (`Controller Error: ${actionMethod} not found in controller ${controller.constructor.name}`);

			// this.props.slashr.router.handleLoading(routerPortalName);

			// let routeData = {
			// 	params: match.params || {}
			// };

			

			
			// // Add Url Query Variables to params
			// let searchParams = new URLSearchParams(this.props.location.search.substring(1));

			// // console.log("initializeActionResult",routerPortalName, route, match);

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
			this.props.slashr.router.initializeUiState();

			let component = null;
			// let route = null;
			let isFound = false;
			// let locationState = this.props.location.state || {};
			// Update the router
			let uiState = this.props.slashr.router._uiState || {};
			let routerState = uiState.router || {};

			let prevRoute = this.app.router.route;

			let promises = [];
			let currPortalName = (routerState && routerState.portal) || "default";

			let hasMatch = false;
			let currPortals = {};

			//TODO: Rewrite this is a total mess. Refactor and simplify
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
						
					for (let portalName in this.props.slashr.router.portals) {
						// console.log("CHECK ROUTER",portalName,route,++t);
						if(currPortals[portalName]) continue;
						//console.log("ROUTER STATE",routerState.portals);
						let match = false;
						let routerPortal = this.props.slashr.router.portals[portalName];

						if (routerState.portals && routerState.portals[portalName] && this.props.slashr.router.portals[portalName]) {
							// Check if not loaded, or changed
							match = matchPath(routerState.portals[portalName].pathname, path);
							if (match && match.isExact) {
								// Always refresh the currentportal route
								//portalName !== currPortalName && 
								if (routerPortal.hasLoaded && routerState.portals[portalName].pathname === routerPortal.location.pathname
									&& routerState.portals[portalName].search === routerPortal.location.search) {
									currPortals[portalName] = true;
									match = false;
									break;
								}
							}
						}
						else if (portalName === currPortalName) {
							// throw("Should this exist?");
							match = matchPath(this.props.location.pathname, path);
							if (match && match.isExact) {
								if (routerPortal.hasLoaded
									&& this.props.location.pathname === routerPortal.location.pathname
									&& this.props.location.search === routerPortal.location.search) {
									currPortals[portalName] = true;
									match = false;
									break;
								}
							}
						}
					
						if (match && match.isExact) {
							currPortals[portalName] = true;
							hasMatch = true;
							promises.push(
								this.initializeActionResult(portalName, routeData, match)
							);
							break;
						}
						//throw("SKLDJF");

					}
					if(hasMatch) break;
				}


			}
				//if(hasMatch) break;
			
			// Check current portals
			// If not a current portal, but the portal has a route, reset it

			// Update any portals that are loaded, but not in the request

			for (let portal in this.props.slashr.router.portals) {
				if (!currPortals[portal] && this.props.slashr.router.portals[portal].hasLoaded) {
					this.props.slashr.router.portals[portal].reset();
				}
			}

			if(hasMatch) this.props.slashr.router.portals[currPortalName].resetHeadTags();

			this.props.slashr.router.loading = true;
			try{
				await Promise.all(promises);
				this.props.slashr.router.loaded = true;
			}
			catch(err){
				console.error("A router error has occurred:",err);
			}
			finally{
				this.props.slashr.router.loading = false;
			}

			// Update the render uid to render the new components
			for (let portal in this.props.slashr.router.portals) {
				this.props.slashr.router.render(portal);
			}
			
			// Update the routes
			this.props.slashr.router.activePortalName = currPortalName;

			this.route = this.app.router.route;
			this.prevRoute = prevRoute;

			this.doUpdateScroll = true;

			this.props.slashr.router.updateHeadTags();
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
			//console.log("update scroll x",document.documentElement.clientWidth, window.scrollX,pos.x,window.scrollx >= pos.x);
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
				let uiState = this.props.slashr.router.getUiState(this.props.slashr.router.route.portal);
				let scroll = (uiState && uiState.scroll) ? uiState.scroll : false;
				let ret = this.app.scrollBehavior(this.route, this.prevRoute, scroll);
				if(ret){
					
					// wait for the document to become big enough
					let attempts = 0;
					let scrollTimeout = setTimeout(()=>{
						//window.scrollTo
					},100);

					// Check to see if it's ok to scroll
					setTimeout(()=>{
						this.updateScroll(ret);
					},5);
					// this.updateScroll(ret);
				}
			}
		}
		render() {
			let Layout = this.app.defaultLayout;
			if (!Layout) throw ("TODO: Add slashr no layout");
			return (
				<React.Fragment>
					<HeadTags />
					<Layout />
				</React.Fragment>
			);
		}
	}));

export const RouterPortal = inject("slashr")(observer(
	class RouterPortal extends React.Component {
		constructor(props) {
			super(props);
			this.name = this.props.name || "default";
			this.slashr = this.props.slashr;
			if (!this.slashr.app.routes) throw ("Router Error: No routes found.");
			this.slashr.router.create(this.name, props);
			this.appContext = this.props.slashr.router.createAppInstance(this.name);
			this.handleWindowScroll = this.handleWindowScroll.bind(this);
		}
		handleWindowScroll(){
			this.slashr.router.updateUiState(this.name, {
				scroll: {
					x: window.scrollX,
					y: window.scrollY
				}
			});
		}
		render() {
			let component = this.props.loader || null;
			let routeComponent = this.props.slashr.router.portal(this.name).component;
			if (routeComponent) {
				component = (
					// <React.Fragment
					// 	// key={this.props.slashr.router.portal(this.name).pathname}
					// >
					//route={this.props.slashr.router.portal(this.name)}
						<Provider 
							app={this.appContext} 
							route={this.props.slashr.router.portal(this.name)}
						>	
							<Container
								className="router-portal"
								onWindowScroll={this.handleWindowScroll}
							>
								{routeComponent}
							</Container>
							
						</Provider>

					// </React.Fragment>
				);
			}
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



// export const RouterPortal = inject("slashr")(observer(
// 	class RouterPortal extends React.Component {
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
			this.initialize();
		}
		componentDidUpdate() {
			
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
			// Check if it is a match with all portals		
			for (let portal in this.props.slashr.router.portals) {
				if(! this.props.slashr.router.portal(portal).hasRoute) continue;
				if (!this.props.slashr.router.portals[portal].location) continue;
				let match = matchPath(this.props.slashr.router.portals[portal].location.pathname, this.routeProps.route);
				
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
				<a href={this.routeProps.route} className={this.className} style={this.props.style} onClick={this.handleClick}>{this.props.children}</a>
			);
		}
	}
));

export const Redirect = inject("slashr")(observer(
	class Redirect extends React.Component {
		constructor(props) {
			super(props);
			this.initialize();
		}
		initialize() {
			this.routeProps = this.props.slashr.router.parseLinkProps(this.props);
		}
		componentDidMount(){
			this.props.slashr.app.router.replace(this.routeProps);
		}
		render() {
			return null;
		}
	}
));



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
		
			if (this.slashr.router.hasRoute(this.name)){
				let routerPortal = this.slashr.router.portal("default");
				this.slashr.router.reset(this.name);
				let pushState = this.slashr.router.createState({
					portal: "default"
				});
				this.slashr.router.history.push({
					pathname: routerPortal.location.pathname,
					state:pushState,
					search: routerPortal.location.search || ""
				});
			}
			//this.slashr.app.router.push(routerPortal.location.pathname + (routerPortal.location.search || ""));
		}
		componentWillReact() {
			// console.log("Route dialog react!!!",this.props);
		}
		componentWillUnmount() {
			if (this.isOpen) this.close();
		}
		render() {
			let uid = this.props.slashr.router.portal(this.name).isInitialized;
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
			return (

				<Dialog
					className="dialog-portal"
					backdropClassName="dialog-backdrop-portal"
					open={this.isOpen}
					onOpen={this.handleOpen}
					onClose={this.handleClose}
					closeButton={this.props.closeButton || null}
				// {...this.props}
				>
					{this.props.titleBar || null}
					<RouterPortal
						modal
						name={this.name}
					/>
					{/* <Container className="dialog-portal-header">
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