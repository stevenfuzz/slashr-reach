import React from 'react';
import ReactDOM from 'react-dom';
import { NavLink, withRouter } from 'react-router-dom';
import { Provider, observer, inject } from 'mobx-react';
import { set as mobxSet, trace, decorate, observable, action, computed, intercept, observe, onReactionError, toJS } from "mobx";
import { SlashrRouter } from './core/SlashrRouter';
import {SlashrUi} from './Ui';
import {SlashrUtils} from './Utils';
import ResizeObserver from 'resize-observer-polyfill';

// import { throws } from 'assert';
// import { parse } from 'url';

// import { decorate, observable, action, computed } from "mobx";
//import { CSSTransition } from 'react-transition-group';
export class Slashr {
	static ANIMATE = "animate";
	static FADE_IN = "fadeIn";
	static FADE_OUT = "fadeOut";
	static FADE_TO = "fadeTo";
	static TRANSITION = "transition";
	static ROTATE = "rotate";
	static DELAY = "delay";
	static SCROLL_TO = "scrollTo";
	static REPLACE_CLASS = "replaceClass";
	static EASE_IN = "easeIn";
	static EASE_OUT = "easeOut";
	static EASE_IN_OUT = "easeInOut";
	constructor() {
		//console.log("TODO: Test home much memory store uses....");
		this._metadata = {
			config: {},
			app: null
		};
		this.ui = new SlashrUi(this);
		this.utils = new SlashrUtils();
		this.router = new SlashrRouter(this);
	}
	static get utils() {
		return new SlashrUtils();
	};
	// static createApp(options) {
	// 	let slashr = Slashr.getInstance();
	// 	if (slashr.app) throw ("Slashr Error: App already initialized.");
	// 	slashr.app = new SlashrApp(slashr, options);
	// 	return slashr.app;
	// };
	// Connects commpontent as app observer
	static connect(component) {
		return inject("app","slashr")(observer(component));
	} 
	// static get ui() {
	// 	let slashr = Slashr.getInstance();
	// 	slashr.ui;
	// };
	static getInstance() {
		if (!window._slashr) window._slashr = new Slashr();
		return window._slashr;
	}
	static get instance() {
		return Slashr.getInstance();
	}
	static get Actions() {
		return SlashrActions;
	}
	static get Domain() {
		return SlashrDomain;
	}
	static listen(domain, props = {}) {
		domain.prototype.__slashrMemberStateProps = props;
		decorate(domain, props);
	}
	// setConfig(config) {
	// 	this._metadata.config = config;
	// }
	get app() {
		return this._metadata.app
	}
	set app(app) {
		this._metadata.app = app;
		return this;
	}
	get config() {
		return this.app.config
	}
}
decorate(Slashr, {
	_metadata: observable
});


class SlashrActions {
	constructor(routerPortal, domain) {
		this.result = this.rslt = new SlashrActionsResultFactory();
		this._routerPortal = routerPortal;
	}
	get model() {
		return Slashr.getInstance().app.mdl;
	}
	get mdl() {
		return this.model;
	}
	get router() {
		return Slashr.getInstance().router;
	}
	get rtr() {
		return this.router;
	}
	get route() {
		return {
			portal: this._routerPortal.name
		};
	}
	get rt() {
		return this.route;
	}
}
class SlashrActionsResultFactory {
	component(component) {
		return new SlashrActionsComponentResult(component);
	}
}
class SlashrActionsComponentResult {
	constructor(component) {
		this._metadata = {
			component: component
		};
		this.props = {};
	}
	render() {
		let Component = this._metadata.component;
		return React.cloneElement(<Component />, this.props);
	}
}

export class SlashrDomain{
	__slashrDomainState = null;
	constructor() {

	}
	get model() {
		return Slashr.getInstance().app.mdl;
	}
	get mdl() {
		return this.model;
	}
	get router() {
		return Slashr.getInstance().app.router;
	}
	get rtr() {
		return this.router;
	}
	get utilities() {
		return Slashr.getInstance().app.utils;
	}
	get utils() {
		return this.utilities;
	}
	setState(values){
		let memberStateProps = this.__slashrMemberStateProps ? this.__slashrMemberStateProps : {};
		for(let name in values){
			if(name in memberStateProps) this[name] = values[name];
			else if(this.__slashrDomainState) this.__slashrDomainState[name] = values[name];
		}
	}
	get state(){
		return new Proxy(this, {
			get : function(obj, prop){
				if(prop in obj.__slashrDomainState) return obj.__slashrDomainState[prop];
				else return null;	
			}
		});	
	}
	set state(state){
		if(this.__slashrDomainState) throw("State has already been set.");
		this.__slashrDomainState = state;
	}
}
decorate(SlashrDomain, {
	__slashrDomainState: observable,
	setState: action
});


export class frak {
	constructor(err) {
		throw (err);
	}
}
export default Slashr.getInstance();