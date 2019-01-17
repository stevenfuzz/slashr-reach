import { set as mobxSet, trace, decorate, observable} from "mobx";

export class SlashrRouter{
	constructor(slashr, options = {}){
		this._slashr = slashr;
		this._portals = {};
		this._history = null;
		this._location = null;
		this._prevLocation = null;
		this._isInitialized = false;
		this._activePortalName = "default";
		
		this._activeRouteName = null;
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
		
		this._uiState = (options.location.state && options.location.state._slashr) ? options.location.state._slashr : {};
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

		// console.log("feed check controller",`../../controllers/${controllerName}Controller`,Controller);
		// //console.log("feed look at this",Controller[`${controllerName}Controller`].prototype.defaultAction.toString());
		let controller = new Controller(this.portal(routerPortalName));
		//let controller = new Controller[`${controllerName}Controller`](this.props.domain);
		let actionMethod = `${actionName}Action`;

		if (!controller[actionMethod]) throw (`Controller Error: ${actionMethod} not found in controller ${controller.constructor.name}`);
		//alert(route.portal);
		this.handleLoading(route.portal);

		route.component = await controller[actionMethod](route.data);

		this.handleLoaded(route.portal);

		this.update(route);

		return route;

	}
	hasRoute(name){
		if(! this._portals[name]) return false;
		return this._portals[name].hasRoute;
	}
	update(route){
		if(! this._portals[route.portal]) return false;
		return this._portals[route.portal].update(route);
	}
	reset(name){
		if(! this._portals[name]) return false;
		this._portals[name].reset();
	}
	portalExists(name){
		return this._portals[name] ? true : false;
	}
	portal(name){
		if(! this._portals[name]) return false;
		return this._portals[name];
	}
	handleLoading(name){
		if(! this._portals[name]) return false;
		return this._portals[name].handleLoading();
	}
	handleLoaded(name){
		if(! this._portals[name]) return false;
		return this._portals[name].handleLoaded();
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
		

		// let sessKey = this.uiStateSessionKey;

		// if(sessKey) sessionStorage.removeItem(sessKey);
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
			portal: props.portal || "default"
		};
		if (!props.to) throw ("Route Link Error: No to.");
		if (typeof props.to === 'object') {
			if (props.to.pathname) routeProps.route = props.to.pathname;
			else if (props.to.route) routeProps.route = props.to.route;
			if (props.to.portal) {
				routeProps.portal = props.to.portal;
			}
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
		this._activePortalName = activePortalName;
		return this;
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
		return this.path;
	}
	get name(){
		return this._metadata.route.name || null;
	}
}

class SlashrRouterPortal{
	_uid = null;
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
	}
	update(route){

		this._route = route;
		this._component = route.component;
		this._location = null;
		//this._routerName = (props.location.state && props.location.state.router) || "default";
		this._ui = {};
		this._hasLoaded = true;
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

		let uid = (this._location) ? this._location.pathname + this._location.search : null;
		if(uid !== this._uid){
			this._uid = uid;
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
		state.ui = this._ui;

		if(this._location.state){
			// Do Nthing or add to portal
		}

		return state;
	}
	handleLoading(){
		if(this._onLoading) this._onLoading();
	}
	handleLoaded(){
		if(this._onLoaded) this._onLoaded();
	}
	get component(){
		if(! this._uid) return null;
		return this._component;
	}
	get hasRoute(){
		if(! this._uid) return false;
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
}
decorate(SlashrRouterPortal, {
	// component: computed,
	_uid: observable
});


// let appRoute = new SlashrAppRoute(route,{
// 	portal: routerPortalName,
// 	location: this.props.location,
// 	match: match,
// 	component: null
// });

class SlashrAppRouter{
	constructor(slashr, options = {}){
		this._slashr = slashr;
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
	_updateRoute(type, route, options = {}){
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

		let state = this._slashr.router.createState(options);

		// Check if the next portal is modal
		// If not, remove any modal portals
		// console.log("ROUTER HISTORY STATA",portal, JSON.stringify(state._slashr.router.portals),state,route,this._slashr.router.location.pathname);
		// for(let currportal in state._slashr.router.portals){
		// 	console.log("curr portal test...", currportal);
		// }

		// If changing routes for the new route, remove from state
		let currRoute = this._slashr.router.location.pathname + (this._slashr.router.location.search || "");
		
		// console.log("PUSH ROUTE",currRoute, route, portal, JSON.stringify(state._slashr.router.portals));

		if(currRoute !== route && state._slashr.router.portals[portal]){
			delete state._slashr.router.portals[portal];
		}
		//TODO: This will not work for multiple layters
		if(portal === "default"){
			alert("Figure out now to remove the layers.");
			// for(let name in state._slashr.router.portals){
			// 	if(name !== portal) delete state._slashr.router.portals[name];
			// }
		}

		//console.log("PUSH ROUTE");

		// Check if new route should close modal layers

		
		// if(Object.keys(portals).length) routerState.portals = portals;

		// let historyState = {
		// 	_slashr: {
		// 		router: routerState
		// 	}
		// };
		
		// console.log("router push to histoiry?",portal,state,this._slashr.router.location.pathname,this._slashr.router.location.state,route,historyState);

		switch(type){
			case "push":
				this._slashr.router.history.push(route, state);
				break;
			case "replace":
				this._slashr.router.history.replace(route, state);
				break;
		}
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
class SlashrRouterAppInstance{
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
export class SlashrApp{
	constructor(slashr, options){
		if(! options.config) throw("Slashr Error: No Config.");
		if(! options.routes) throw("Slashr Error: No Routes.");
		//console.log("TODO: Put routes in router?");
		this._metadata = {
			model: new SlashrAppModel(options),
			router: new SlashrAppRouter(slashr, options),
			config: options.config,
			routes: options.routes,
			defaultLayout: options.defaultLayout || null,
			utilities: slashr.utils,
			scrollBehavior: options.scrollBehavior || null
		}
	}
	get router(){
		return this._metadata.router;
	}
	get rtr(){
		return this._metadata.router;
	}
	get model(){
		return this._metadata.model;
	}
	get mdl(){
		return this.model;
	}
	get routes(){
		return this._metadata.routes;
	}
	get utilities(){
		return this._metadata.utilities;
	}
	get utils(){
		return this._metadata.utilities;
	}
	get defaultLayout(){
		return this._metadata.defaultLayout;
	}
	get config(){
		return this._metadata.config;
	}
	get scrollBehavior(){
		return this._metadata.scrollBehavior;
	}
}

class SlashrAppModel{
	constructor(options){
		if(! options.domain) throw("Slashr Error: No Domain.");
		if(! options.ui) throw("Slashr Error: No Ui.");
		this._metadata = {
			domain: options.domain,
			ui: options.ui
		}
	}
	get domain(){
		return this._metadata.domain;
	}
	get dm(){
		return this.domain;
	}
	get ui(){
		return this._metadata.ui;
	}
}