// import React from 'react';
// import { Provider, observer, inject } from 'mobx-react';
// //import './Main.css';
// import { Route, Switch, withRouter, matchPath, BrowserRouter} from 'react-router-dom';
// import {Container} from './Element';
// import {HeadTags} from './HeadTags';
// import {SlashrRouterAppInstance} from './SlashrApp';
import React from 'react';
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
		let Actions = routeData.actions;
		let actionName = routeData.action || "default";

		let route = new SlashrRoute(this._slashr, routeData, routerPortalName, options);

		// This will be a problem with children portals
		this._loadingPortalName = routerPortalName;
		
		let actions = new Actions(this.portal(this._loadingPortalName));
		//let controller = new Controller[`${controllerName}Controller`](this.props.domain);
		let actionMethod = `${actionName}Action`;

		if (!actions[actionMethod]) throw (`Controller Error: ${actionMethod} not found in controller ${controller.constructor.name}`);
		//alert(route.portal);

		let onBeforeLoad = await this.handleBeforeLoad(route, this._route);
		if(onBeforeLoad !== true){
			if(! onBeforeLoad){
				throw("Router Error: Todo, onbeforeload false");
			}
			else if(React.isValidElement(onBeforeLoad)){
				route.component = onBeforeLoad;
				this._loadingPortalName = null;
				this.update(route);
				return route;
			}
			else throw("Router Error: Unknown onBeforeLoad response.");
		}

		this.handleLoading(route, this._route);
		route.component = await actions[actionMethod](route.data);
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
	handleBeforeLoad(to, from){
		if(! this._portals[to.portal]) return false;
		return this._portals[to.portal].handleBeforeLoad(to, from);
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
	setActivePortalName: action,
	updateHeadTags: action
});

class SlashrRoute{
	constructor(slashr,routeData,routerPortalName, options = {}){
		this._slashr = slashr;

		let stateData = {};
		if(options.location.state){
			for(let prop in options.location.state){
				if(prop === "_slashr") continue;
				stateData[prop] = options.location.state[prop];
			}
		}
		this._metadata = {
			route: routeData,
			portal: routerPortalName,
			path: options.location.pathname,
			data: {
				params: (options.match) ? options.match.params : {},
				query: {},
				state: stateData
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
	get state(){
		return this._metadata.data.state;
	}
	get qry(){
		return this.query;
	}
	get data(){
		return {...this.state,...this.query,...this.params};
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
	get metadata(){
		return this._metadata.route.metadata || {};
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
		this._onBeforeLoad= props.onBeforeLoad || null;
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
	handleBeforeLoad(to, from){
		return this._onBeforeLoad ?  this._onBeforeLoad(to, from) : true;
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