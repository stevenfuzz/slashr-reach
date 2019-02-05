import React from 'react';
import { Provider, observer, inject } from 'mobx-react';
//import './Main.css';
import { Route, Switch, withRouter, matchPath, BrowserRouter} from 'react-router-dom';
import {Container} from './Element';
import {HeadTags} from './HeadTags';
// import {SlashrRouterAppInstance} from './SlashrApp';
import { set as mobxSet, trace, decorate, observable, action} from "mobx";
// import {DialogUiDomain} from './Dialog'

export class SlashrRouter{
	_headTags = false;
	_uid = null;
	constructor(slashr, options = {}){
		this._slashr = slashr;
		this._portals = {};
		this._history = null;
		this._location = null;
		this._prevLocation = null;
		this._isInitialized = false;
		this._loadingPortalName = null;
		
		
		this._isLoading = false;
		this._route = null;
		
		this._uiState = {};
		this._uiStateKey = false;
		this._uiStateSession = {};

		this._state = {};
		this._stateKey = {};
	}
	initialize(options){
		if(! options.location) throw("Router error: No location."); 
		if(! options.history) throw("Router error: No history."); 
		//if(this._location) this._prevLocation = this._location;
		this._location = options.location;
		this._history = options.history;
		//this._uiState = {};

		this._computedHistoryAction = this._computedHistoryAction ? "POP" : "LOAD";

		//this._computedHistoryAction === "pop" && 
		let uiState = (options.location.state && options.location.state._slashr) ? options.location.state._slashr : {};
		// console.log("CURR UI STATE",this._computedHistoryAction,JSON.stringify(uiState));
		// if(uiState.ui && this.props.slashr.router.computedHistoryState !== "POP"){
		// 	console.log("RESET RESET RESET ui state",JSON.stringify(uiState.ui));
		// 	uiState.ui = {};
		// }
		this._uiState = uiState;
		//console.log("init ui state from loc",JSON.stringify(this._uiState));
		
		//alert(this._uiState.router.portal);
		this._activeRouteName = options.location.pathname;
		this._activePortalName = (this._uiState.router && this._uiState.router.portal) ? this._uiState.router.portal : "default";
	}
	create(name, props){
		if(! this._portals[name]) this._portals[name] = new SlashrRouterPortal(this, name, props);
		//this._routes[name].update(route, component);
		return this._portals[name];
	}
	createAppInstance(routerPortalName){
		return new SlashrRouterAppInstance(this._slashr, routerPortalName);
	}
	async load(routeData, routerPortalName, options={}){

		// controllerName = Slashr.utils.str.capitalize(controllerName);
		
		// // const Controller = require(`../../controllers/${controllerName}Controller`);
		let Controller = routeData.controller;
		let actionName = routeData.action || "default";

		let route = new SlashrRoute(this._slashr, routeData, routerPortalName, options);

		// This will be a problem with children portals
		this._loadingPortalName = routerPortalName;
		
		let controller = new Controller(this.portal(this._loadingPortalName));
		//let controller = new Controller[`${controllerName}Controller`](this.props.domain);
		let actionMethod = `${actionName}Action`;

		if (!controller[actionMethod]) throw (`Controller Error: ${actionMethod} not found in controller ${controller.constructor.name}`);
		//alert(route.portal);
		this.handleLoading(route, this._route);

		route.component = await controller[actionMethod](route.data);

		this.handleLoaded(route, this._route);

		this._loadingPortalName = null;

		this.update(route);

		return route;

	}
	hasRoute(name){
		if(! this._portals[name]) return false;
		return this._portals[name].hasRoute;
	}
	update(route){
		this._route = route;
		if(! this._portals[route.portal]) return false;
		let ret = this._portals[route.portal].update(route);
		return ret;
	}
	render(name){
		if(! this._portals[name]) return false;
		this._portals[name].render();
	}
	reset(name){
		if(! this._portals[name]) return false;
		this._portals[name].reset();
	}
	get loadingPortalName(){
		return this._loadingPortalName;
	}
	get computedHistoryAction(){
		return this._computedHistoryAction;
	}
	portalExists(name){
		return this._portals[name] ? true : false;
	}
	portal(name){
		if(! this._portals[name]) return false;
		return this._portals[name];
	}
	handleLoading(to, from){
		if(! this._portals[to.portal]) return false;
		return this._portals[to.portal].handleLoading(to, from);
	}
	handleLoaded(to, from){
		if(! this._portals[to.portal]) return false;
		return this._portals[to.portal].handleLoaded(to, from);
	}
	setHeadTags(headTags){
		//console.log("SET HEAD TAGS FOR PORTAL:",this._activePortalName,JSON.stringify(headTags),JSON.stringify(this._portals[this._activePortalName].headTags));
		if(! this._portals[this._activePortalName]) return false;
		this._portals[this._activePortalName].headTags = headTags;
	}
	getHeadTags(){
		return this._headTags;
	}
	set headTags(headTags){
		this.setHeadTags(headTags);
	}
	get headTags(){
		return this.getHeadTags();
	}
	updateHeadTags(){
		if(! this._portals[this._activePortalName]) return false;
		this._headTags = this._portals[this._activePortalName].headTags;
	}
	set loading(isLoading){
		this._isLoading = isLoading;
	}
	get isLoading(){
		return this._isLoading;
	}
	get slashrState(){
		return (this._uiState) ? this._uiState : {}; 
	}
	getUiState(name){
		if(! this._portals[name]) return false;
		return this._portals[name].getUiState();
	}
	initializeUiState(){
		let state = false;

		// Initialize the session state
		let uiStateSession = sessionStorage.getItem(this.uiStateSessionKey);
		this._uiStateSession = (uiStateSession) ? JSON.parse(uiStateSession) : {};

		if(! this._uiState.key){
			state = this.createState({
				portal: this._activePortalName,
				state: this._location.state
			});
		}
		else{
			//alert(this._activePortalName);
			if(this._uiStateSession[this._uiState.key]){
				let uiState = this._uiStateSession[this._uiState.key];
                if(uiState.router && uiState.router.portals){
                    for(let portal in uiState.router.portals){
						let portalState = uiState.router.portals[portal].ui || {};
                        this._portals[portal].updateUiState(portalState);
                    }
				}
				state = {
					_slashr: uiState
				}
			}
		}

		if(state){
			// if(state.portal 
			// 	&& state.portals 
			// 	&& state.portals[state.portal] 
			// 	&& state.portals[state.portal].ui){
			// 		this.updateUiState();
			// }
			// this._location.state = state;
			this._uiState = state._slashr;
			this.pushUiState();
		}
		// Push the initial state
		//if(this._uiState && this._uiState.key) this.pushUiState();
		return true;
	}
	get uiStateSessionKey(){
		return `_slashrUiState`;
		// let key = false;
		// if(this._uiState && this._uiState && this._uiState.key){
		// 	key = `_slashrUiState`;
		// }
		// return key;
	}
	updateUiState(name, state = {}){
		
		if(this.isLoading) return false;

		if(name !== this._activePortalName){
			return false;
		}
		
		if(! this._portals[name]) return false;
		this._portals[name].updateUiState(state);
		
		let newState = this.createState({
			key: this._uiState.key || null,
			portal: this._activePortalName,
			state: this._location.state
		});
		//this._location.state = newState;
		this._uiState = newState._slashr;

		// First, clean up the current session

		// Set the new session key
		if(! this._uiState.key) throw("Router error no key");
		
		this._uiStateSession[this._uiState.key] = this._uiState;
		
		sessionStorage.setItem(this.uiStateSessionKey, JSON.stringify(this._uiStateSession));
		
		return true;
	}
	// initializeUiState(name){
		
	// 	this._uiStateKey =  (this._location.state && this._location.state._slashr && this._location.state._slashr.key) ? this._location.state._slashr.key : new Date().getTime();;
	// 	this._uiState = {};

	// 	let state = this._location.state || {};
	// 	if(this._location.state && this._loca)

	// 	if(! this._location.state || ! this._location.state._slashr || ! this._location.state._slashr.key){
	// 		console.log("route state initializeUiState",name,JSON.stringify(this.location.state));
	// 		this.updateUiState(name);
	// 		this.pushUiState();
	// 	}
	// 	else{
	// 		this._uiStateKey = this._location.state._slashr.key;
	// 		this._uiState = this._location.state;
	// 	}
	// }
	pushUiState(){

		if(this.isLoading) return false;

		let state = this._location.state || {};
		state._slashr = this._uiState;

		// let uiState = false;

		let tState = {
			pathname: this._location.pathname,
			state: state,
			search: this._location.search || ""
		};

		let currDepth = this._history.length;
		let doUpdateSession = false;

		for(let key in this._uiStateSession){
			if(this._uiState.key === key || this._uiStateSession[key].depth <= currDepth){
				doUpdateSession = true;
				delete this._uiStateSession[key];
			}
		}
		if(doUpdateSession) sessionStorage.setItem(this.uiStateSessionKey,JSON.stringify(this._uiStateSession));
	
		this._slashr.router.history.replace({
			pathname: this._location.pathname,
			state: state,
			search: this._location.search || ""
		});
		return true;
	}
	createState(options = {}){
		let routerState = {
			portals: {}
		};

		let state = options.state || {};
		
		routerState.portal = options.portal || "default";

		for(let portal in this._portals){
			if(! this._portals[portal].location) continue;
			routerState.portals[portal] = this._portals[portal].createState(options);
		}
		
		state._slashr = {
			key: options.key || new Date().getTime(),
			depth: this._history.length,
			router: routerState
		}

		return state;
	}
	parseLinkProps(props) {
		let routeProps = {
			route: props.route || null,
			portal: props.portal || "default",
			delay: props.delay || 0
		};
		if (!props.to) throw ("Route Link Error: No to.");
		if (typeof props.to === 'object') {

			if (props.to.pathname) routeProps.route = props.to.pathname;
			else if (props.to.route) routeProps.route = props.to.route;

			if (props.to.portal) routeProps.portal = props.to.portal;
			if(props.to.delay) routeProps.delay = props.to.delay;
			if(props.to.state) routeProps.state = props.to.state;
		}
		else routeProps.route = props.to;
		if (!routeProps.route) throw ("Route Link Error: No pathname.");
		return routeProps;
	}
	get default(){
		return this.instance("default");
	}
	get history(){
		return this._history;
	}
	get location(){
		return this._location;
	}
	get portals(){
		return this._portals;
	}
	set activePortalName(activePortalName){
		return this.setActivePortalName(activePortalName);
	}
	setActivePortalName(activePortalName){
		this._activePortalName = activePortalName;
		if(this._uid !== this._portals[activePortalName].uid){
			this._uid = this._portals[activePortalName].uid;
		} 
		return this;
	}
	get uid(){
		return this._uid;
	}
	get activePortalName(){
		return this._activePortalName;
	}
	get activePortal(){
		return this.portals[this.activePortalName];
	}
	get activeRouteName(){
		return this._activeRouteName;
	}
	get route(){
		return this.portals[this.activePortalName].route;
	}
}
decorate(SlashrRouter,{
	_headTags: observable,
	_uid: observable,
	//_activePortalName: observable,
	setActivePortalName: action
});

class SlashrRoute{
	constructor(slashr,routeData,routerPortalName, options = {}){
		this._slashr = slashr;
		this._metadata = {
			route: routeData,
			portal: routerPortalName,
			path: options.location.pathname,
			data: {
				params: (options.match) ? options.match.params : {},
				query: {}
			},
			// params: (options.match) ? options.match.params : {},
			// query: {},
			location: options.location || {},
			component: null
		}
		if(options.location && options.location.search){
			let searchParams = new URLSearchParams(options.location.search.substring(1));
			for (let key of searchParams.keys()) {
				this._metadata.data.query[key] = searchParams.get(key);
			}
		}
	}
	get data(){
		return this._metadata.data;
	}
	get component(){
		return this._metadata.component;
	}
	set component(component){
		this._metadata.component = component;
		return this;
	}
	get location(){
		return this._metadata.location;
	}
	get portal(){
		return this._metadata.portal;
	}
	get params(){
		return this._metadata.data.params;
	}
	get query(){
		return this._metadata.data.query;
	}
	get qry(){
		return this.query;
	}
	get data(){
		return {...this.query,...this.params};
	}
	get dt(){
		return this.data;
	}
	get path(){
		return this._metadata.path;
	}
	get name(){
		return this._metadata.route.name || null;
	}
}

class SlashrRouterPortal{
	_uid = null;
	_renderUid = null;
	_component = null;
	_location = null;
	_ui = {};
	_hasLoaded = false;
	constructor(router, name, props){
		this._name = name;
		this._router = router;
		this._route = null;
		this._onLoading = props.onLoading || null;
		this._onLoaded = props.onLoaded || null;
		this._location = this.parseLocation();
		this._isModal = props.modal ? true : false;
		this._headTags = null;
	}
	parseLocation(){
		let ret = null;
		let location = this._router.location;
		let useDefault = this._name === "default";
		let routerState = this._router.slashrState.router;
		if(routerState && routerState.portals && routerState.portals[this._name]){
			if(routerState.portal !== this._name){
				useDefault = false;
				let locState = routerState.portals[this._name];
				ret = {
					pathname: locState.pathname,
					search: locState.search,
					key: locState.key
				};
				// for(let name in location.state.portals){
				// 	if(name === this._name){
						
				// 	}
				// }
			}
			else useDefault = true;
		}
		if(! ret && useDefault){
			ret = {
				pathname: location.pathname,
				// state: location.state,
				search: location.search
			};
			if(location.state){
				//alert("filter state");
				ret.state = location.state;
			}
			if(location.search) ret.search = location.search;
		}
		return ret;
	}
	reset(){
		this._component = null;
		this._location = null;
		this._ui = {};
		this._hasLoaded = false;
		this._uid = null;
		this._renderUid = null;
		this._headTags = null;
	}
	update(route){
		this._route = route;
		this._component = route.component;
		this._location = null;
		//this._routerName = (props.location.state && props.location.state.router) || "default";
		this._ui = {};
		this._hasLoaded = true;
		//this._renderUid = null;

		if(route.location){
			let routerState = (route.location.state && route.location.state._slashr) ? route.location.state._slashr.router : {};

			if(routerState.portals){
				for(let name in routerState.portals){
					if(name === this._name){
						this._location = {
							pathname: routerState.portals[name].pathname
						};
						if(routerState.portals[name].key){
							this._key = routerState.portals[name].key;
						}
						if(routerState.portals[name].ui){
							this._ui = routerState.portals[name].ui;
						}
					}
				}
			}

			if(! this._location){
				this._location = {
					pathname: route.location.pathname,
					// state: props.location.state,
					search: route.location.search
				};
				if(route.location.state){
					//alert("filter state");
					//this._location.state = props.location.state;
				}
				if(route.location.search) this._location.search = route.location.search;
			}
		}

		let uid = (this._location) ? this._location.pathname + (this._location.search || "") : null;

		if(uid !== this._uid){
			this._uid = uid;
		}
	}
	render(){
		if(this._uid !== this._renderUid){
			this._renderUid = this._uid;
		}
	}
	updateUiState(state){
		for(let key in state){
			this._ui[key] = state[key];
		}
		return this._ui;
	}
	getUiState(){
		return this._ui;
	}
	createState(options){
		let state = {
			pathname: this._location.pathname,
			search: this._location.search
		}
		// let location = this.parseLocation();
		// let state = {
		// 	pathname: location.pathname,
		// 	search: location.search
		// }
		state.ui = this._ui;

		if(this._location.state){
			// Do Nthing or add to portal
		}

		return state;
	}
	handleLoading(to, from){
		if(this._onLoading) this._onLoading(to, from);
	}
	handleLoaded(to, from){
		if(this._onLoaded) this._onLoaded(to, from);
	}
	get component(){
		if(! this._renderUid) return null;
		return this._component;
	}
	get hasRoute(){
		//if(! this._renderUid) return false;
		return (this._location) ? true : false;
	}
	get location(){
		return this._location;
	}
	get state(){
		
	}
	get name(){
		return this._name;
	}
	get uid(){
		return this._uid;
	}
	get ui(){
		return this._ui;
	}
	get hasLoaded(){
		return this._hasLoaded;
	}
	get pathname(){
		return this._location ? this._location.pathname : null;
	}
	get search(){
		return this._location ? this._location.search : "";
	}
	get isInitialized(){
		return this._uid ? true : false;
	}
	get route(){
		return this._route;
	}
	get headTags(){
		return this._headTags;
	}
	set headTags(tags){
		this._headTags = tags;
	}
	resetHeadTags(){
		this._headTags = false;
	}
}
decorate(SlashrRouterPortal, {
	// component: computed,
	_uid: observable,
	_renderUid: observable,
	render: action
});


// let appRoute = new SlashrAppRoute(route,{
// 	portal: routerPortalName,
// 	location: this.props.location,
// 	match: match,
// 	component: null
// });



export const _Router = inject("slashr")(observer(
	class _Router extends React.Component {
		constructor(props) {
			super(props);
			console.log(this.props.slashr);
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
							portal={this.props.slashr.router.portal(this.name)}
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
export class SlashrRouterAppInstance{
	constructor(slashr, routerPortalName){
		return new Proxy(this, {
			get : function(obj, prop){
				
				switch(prop){
					case "route":
					case "rt":
						return slashr.router.portals[routerPortalName].route;
						break;
					default:
						return slashr.app[prop];
					}
				}
		});	
	}	
}

