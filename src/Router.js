import React from 'react';
import { Provider, observer, inject } from 'mobx-react';
//import './Main.css';
import { Route, Switch, withRouter, matchPath, BrowserRouter} from 'react-router-dom';
import {Container} from './Element';
import {HeadTags} from './HeadTags';
// import {SlashrRouterAppInstance} from './SlashrApp';
// import {DialogUiDomain} from './Dialog'

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
			return await this.props.slashr.router.load(route, routerPortalName,
				{
					location: this.props.location,
					match: match
				}
			);
		}
		async updateRoutes(prevLocation) {
			this.props.slashr.router.initializeUiState();

			let component = null;
			// let route = null;Ca
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
					if(! routeData.actions) throw("No Action Found for route");
						
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
		componentDidUpdate(prevProps) {
			if (this.props.location.pathname !== prevProps.location.pathname || this.props.location.search !== prevProps.location.search) {
				this.props.slashr.router.initialize(this.props);
				this.updateRoutes(prevProps.location);
			}
		}
		updateScroll(pos){
			// Poll for the body to be big enough, then scroll
			// If more than 1 second, just give up and set it
			let bodySize = this.props.slashr.utils.dom.getBodySize();
			//o("update scroll x",document.documentElement.clientWidth, window.scrollX,pos.x,window.scrollx >= pos.x);
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
				let scroll = (uiState && uiState.scroll && this.props.slashr.router.computedHistoryAction === "POP") ? uiState.scroll : false;
				let ret = this.app.scrollBehavior(this.route, this.prevRoute, scroll);
				if(ret){
					// wait for the document to become big enough
					// let attempts = 0;
					// let scrollTimeout = setTimeout(()=>{
					// 	//window.scrollTo
					// },100);

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
							// portal={this.props.slashr.router.portal(this.name)}
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
		}
	}
));

export const RouteLink = inject("slashr","app")(observer(
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
		componentDidMount(){
			
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
			// Kind of a hacky way to get a reaction
			let uid = this.props.slashr.router.uid;
			//console.log("route route active protal",this.props.slashr.router.uid, this.isMatch);
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

export class SlashrAppRouter{
	constructor(slashr, app, options = {}){
		this._app = app;
		this._slashr = slashr;
		this._updateTimeout = null;
		// this._metadata = {
		// 	scrollBehavior: options.scrollBehavior
		// }
	}
	get metadata(){
		return this._metadata;
	}
	
	// can also be route, options
	_createState(route, options){

	}
	setHeadTags(tags){
		this._slashr.router.setHeadTags(tags);
	}
	_updateRoute(type, route, options = {}){
		// Check for a pending push
		if(this._updateTimeout){
			clearTimeout(this._updateTimeout);
			this._updateTimeout = null;
		}
		if(this._slashr.router.isLoading) return false;
		
		let portal = "default";

		if(typeof route === "object"){
			options = route;
			route = null;
			if(options.route) route = options.route;
			else if(options.pathname) route = options.pathname;
		}
		// else if(! route){
		// 	route = router;
		// 	router = null;
		// }
		if(options.portal) portal = options.portal;
		if(! route) throw("Router Push Error: No Route.");

		options.portal = portal;
		options.route = route;

		let delay = options.delay || 0;
		let state = this._slashr.router.createState(options);

		// If changing routes for the new route, remove from state
		let currRoute = this._slashr.router.location.pathname + (this._slashr.router.location.search || "");
		
		if(currRoute === route && type === "push"){
			// Do not push the same route.
			return;
		}
		// console.log("PUSH ROUTE",currRoute, route, portal, JSON.stringify(state._slashr.router.portals));

		if(currRoute !== route && state._slashr.router.portals[portal]){
			delete state._slashr.router.portals[portal];
		}
		//TODO: This will not work for multiple layters
		if(portal === "default"){
			for(let name in state._slashr.router.portals){
				if(name !== portal){
					delete state._slashr.router.portals[name];
				}
			}
		}

		let fn = null;
	
		switch(type){
			case "push":
				fn = this._slashr.router.history.push;
				break;
			case "replace":
				fn = this._slashr.router.history.replace;
				break;
		}

		if(! fn) return false;
		if(delay) this._updateTimeout = setTimeout(()=>{
			fn(route,state);
			this._updateTimeout = null;
		},delay);
		else fn(route,state);
		return true;
	}
	back(options){
		this._slashr.router.pushUiState();
		this._slashr.router.history.goBack();
	}
	push(route, options){
		this._slashr.router.pushUiState();
		this._updateRoute("push",route,options);
	}
	replace(route, options){
		this._updateRoute("replace",route,options);
	}
	
	get location(){
		return this._slashr.router.location;
	}
	get history(){
		return this._slashr.router.history;
	}
	get route(){
		return this._slashr.router.route;
	}
}