import React from 'react';
import ReactDOM from 'react-dom';
import { NavLink, withRouter } from 'react-router-dom';
import { Provider, observer, inject } from 'mobx-react';
import { set as mobxSet, trace, decorate, observable, action, computed, intercept, observe, onReactionError, toJS } from "mobx";
import { SlashrRouter, SlashrApp } from './SlashrRouter';
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
		this.ui = new SlashrUi();
		this.utils = new SlashrUtils();
		this.router = new SlashrRouter(this);
	}
	static get utils() {
		return new SlashrUtils();
	};
	static createApp(options) {
		let slashr = Slashr.getInstance();
		if (slashr.app) throw ("Slashr Error: App already initialized.");
		slashr.app = new SlashrApp(slashr, options);
		return slashr.app;
	};
	// Connects commpontent as app observer
	static connect(component) {

		return inject("app")(observer(component));
	}
	// static get ui() {
	// 	let slashr = Slashr.getInstance();
	// 	slashr.ui;
	// };
	static getInstance() {
		if (!window._slashrDomain) window._slashrDomain = new Slashr();
		return window._slashrDomain;
	}
	static get instance() {
		return Slashr.getInstance();
	}
	static get Controller() {
		return SlashrController;
	}
	static get Domain() {
		return SlashrDomain;
	}
	static listen(domain, props = {}) {
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


class SlashrController {
	constructor(routerPortal, domain) {
		this.result = this.rslt = new SlashrControllerActionResultFactory();
		this._routerPortal = routerPortal;
		// this._slashr = Slashr.getInstance();
	}
	get model() {
		return Slashr.getInstance().app.mdl;
	}
	get mdl() {
		return this.model;
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
class SlashrDomain {
	constructor() {

	}
	get model() {
		return Slashr.getInstance().app.mdl;
	}
	get mdl() {
		return this.model;
	}
	get utilities() {
		return Slashr.getInstance().app.utils;
	}
	get utils() {
		return this.utilities;
	}
	setState(values) {
		mobxSet(this, values);
	}
}

class SlashrControllerActionResultFactory {
	component(component) {
		return new SlashrControllerActionComponentResult(component);
	}
}
class SlashrControllerActionComponentResult {
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

class SlashrUi {
	constructor() {
		this._metadata = {
			elmts: {},
			dlgs: {},
			mnu: {},
			cals: {},
			fms: {},
			grids: {}
		};
		this._elmtIdx = 0;
		this._dlgIdx = 0;
		this._gridIdx = 0;
		this._mnuIdx = 0;
		this._events = {};
		this._windowResizeTimeout = null;
		this._windowScrollTimeout = null;
		this._handleWindowResize = this._handleWindowResize.bind(this);
		this._handleWindowScroll = this._handleWindowScroll.bind(this);
		this._handleObserveIntersection = this._handleObserveIntersection.bind(this);
		this._intersectionObserver = null;
		this._handleObserveResize = this._handleObserveResize.bind(this);
	}
	get animationQueue() {
		if (!this._metadata.animationQueue) this._metadata.animationQueue = new SlashrAnimationQueue();
		return this._metadata.animationQueue;
	}
	get nextElmtIdx() {
		return ++this._elmtIdx;
	}
	get nextDlgIdx() {
		return ++this._dlgIdx;
	}
	get nextMnuIdx() {
		return ++this._mnuIdx;
	}
	get nextGridIdx() {
		return ++this._gridIdx;
	}
	// To set options should be like
	// {
	// 	duration: 1000
	// 	delay: 10,
	// 	easing: Slashr.EASE_IN,
	// 	props: {
	// 		opacity: 50,
	// 		paddingLeft: 10
	// 	}
	// }
	// or using default options
	// {
	// 	opacity: 50,
	// 	paddingLeft: 10
	// }
	animate(elmt, options) {
		// if(! options.props) options = {
		// 	props: options
		// };
		this.animationQueue.add(elmt, Slashr.ANIMATE, options);
	}
	fadeIn(elmt, options = {}) {
		this.animationQueue.add(elmt, Slashr.FADE_IN, options);
	}
	fadeOut(elmt, options = {}) {
		this.animationQueue.add(elmt, Slashr.FADE_OUT, options);
	}
	transition(elmt, toggled, options = {}) {
		options.toggled = toggled;
		this.animationQueue.add(elmt, Slashr.TRANSITION, options);
	}
	createElement(props) {
		////console.log("TODO: Only create elements that have specific props for performance");
		//console.log(props);
		let idx = this.nextElmtIdx;
		let elmt = new SlashrUiElement(this, idx, props);
		this._metadata.elmts[idx] = elmt;
		return elmt;
	}
	deleteElement(idx) {
		if (this._metadata.elmts[idx]) delete this._metadata.elmts[idx];
		return this;
	}
	createDialog(props) {
		let idx = this.nextDlgIdx;
		let elmt = new SlashrUiDialog(this, idx, props);
		this._metadata.dlgs[idx] = elmt;
		return elmt;
	}
	deleteDialog(idx) {
		if (this._metadata.dlgs[idx]) delete this._metadata.dlgs[idx];
		return this;
	}
	createMenu(props) {
		let idx = props.name || this.nextMnuIdx;
		if (this._metadata.mnu[idx]) throw (`Menu ${idx} already exists.`);
		let elmt = new SlashrUiMenu(this, idx, props);
		this._metadata.mnu[idx] = elmt;
		return elmt;
	}
	deleteMenu(idx) {
		if (this._metadata.mnu[idx]) delete this._metadata.mnu[idx];
		return this;
	}
	createCalendar(props) {
		let idx = props.name || this.nextCalIdx;
		if (this._metadata.cals[idx]) throw (`Calendar ${idx} already exists.`);
		let elmt = new SlashrUiCalendar(this, idx, props);
		this._metadata.cals[idx] = elmt;
		return elmt;
	}
	deleteCalendar(idx) {
		if (this._metadata.cals[idx]) delete this._metadata.cals[idx];
		return this;
	}
	createGrid(props) {
		let idx = props.name || this.nextGridIdx;
		if (this._metadata.grids[idx]) throw (`Grid ${idx} already exists.`);
		let elmt = new SlashrUiGrid(this, idx, props);
		this._metadata.grids[idx] = elmt;
		return elmt;
	}
	refreshGrid(idx, page = 1) {
		if (this._metadata.grids[idx]) this._metadata.grids[idx].refresh(page);
	}
	resetGrid(idx, props) {
		if (this._metadata.grids[idx]) this._metadata.grids[idx].reset(props);
	}
	deleteGrid(idx) {
		if (this._metadata.grids[idx]) delete this._metadata.grids[idx];
		return this;
	}
	_handleWindowResize() {
		if (this._windowResizeTimeout) return;
		this._windowResizeTimeout = setTimeout(() => {
			window.requestAnimationFrame(() => {
				if (!Object.keys(this._events.resize).length) {
					this.removeEventListener("resize");
					this._windowResizeTimeout = null;
					return;
				}
				for (let i in this._events.resize) {
					this._events.resize[i]();
				}
				this._windowResizeTimeout = null;
			});
		}, 100);
	}
	_handleWindowScroll() {
		if (this._windowScrollTimeout) return;
		this._windowScrollTimeout = setTimeout(() => {
			window.requestAnimationFrame(() => {
				if (!Object.keys(this._events.scroll).length) {
					this.removeEventListener("scroll");
					this._windowScrollTimeout = null;
					return;
				}
				for (let i in this._events.scroll) {
					this._events.scroll[i]();
				}
				this._windowScrollTimeout = null;
			});
		}, 100);
	}
	_handleObserveIntersection(entries) {
		window.requestAnimationFrame(() => {
			for (let ent of entries) {
				for (let elmtIdx in this._events.observeIntersection) {
					if (this._metadata.elmts[elmtIdx].ref.current == ent.target) {
						this._events.observeIntersection[elmtIdx](ent);
						break;
					}
				}
			}
		});
	}
	_handleObserveResize(entries) {
		window.requestAnimationFrame(() => {
			for (let ent of entries) {
				for (let elmtIdx in this._events.observeResize) {
					if (this._metadata.elmts[elmtIdx].ref.current == ent.target) {
						this._events.observeResize[elmtIdx](ent);
						break;
					}
				}
			}
		});
	}

	addEventListener(event, elmt, callback) {
		//"TODO: Refactor?
		switch (event) {
			case "resize":
				if (!this._events.resize) {
					this._events.resize = {};
					window.addEventListener("resize", this._handleWindowResize);
				}
				this._events.resize[elmt.idx] = callback;
				break;
			case "scroll":
				if (!this._events.scroll) {
					this._events.scroll = {};
					window.addEventListener("scroll", this._handleWindowScroll);
				}
				this._events.scroll[elmt.idx] = callback;
				break;
			case "observeIntersection":
				if (!this._events.observeIntersection) {
					// Require the polyfill before requiring any other modules.
					require('intersection-observer');
					this._events.observeIntersection = {};
					this._intersectionObserver = new IntersectionObserver(this._handleObserveIntersection);

				}
				this._events.observeIntersection[elmt.idx] = callback;
				this._intersectionObserver.observe(elmt.ref.current);
				break;
			case "observeResize":
				if (!this._events.observeResize) {
					// Require the polyfill before requiring any other modules.
					require('resize-observer-polyfill');
					this._events.observeResize = {};
					this._resizeObserver = new ResizeObserver(this._handleObserveResize);

				}
				this._events.observeResize[elmt.idx] = callback;
				this._resizeObserver.observe(elmt.ref.current);
				break;
		}
	}
	removeEventListener(event, elmt) {
		switch (event) {
			case "resize":
				if (elmt && this._events.resize[elmt.idx]) {
					delete this._events.resize[elmt.idx];
				}
				if (!this._events.resize || !Object.keys(this._events.resize).length) {

					if (this._events.resize) delete this._events.resize;
					window.removeEventListener("resize", this._handleWindowResize);

				}
				break;
			case "scroll":
				if (elmt && this._events.scroll[elmt.idx]) {
					delete this._events.scroll[elmt.idx];
				}
				if (!this._events.scroll || !Object.keys(this._events.scroll).length) {

					if (this._events.scroll) delete this._events.scroll;
					window.removeEventListener("scroll", this._handleWindowScroll);

				}
				break;
			case "observeIntersection":
				if (elmt && this._events.observeIntersection[elmt.idx]) {
					delete this._events.observeIntersection[elmt.idx];
					this._intersectionObserver.unobserve(elmt.ref.current);
				}
				if (!this._events.observeIntersection || !Object.keys(this._events.observeIntersection).length) {
					if (this._events.observeIntersection) delete this._events.observeIntersection;
					this._intersectionObserver.disconnect();
					delete this._intersectionObserver;
				}
				break;
			case "observeResize":
				if (elmt && this._events.observeResize[elmt.idx]) {
					delete this._events.observeResize[elmt.idx];
					this._resizeObserver.unobserve(elmt.ref.current);
				}
				if (!this._events.observeResize || !Object.keys(this._events.observeResize).length) {
					if (this._events.observeResize) delete this._events.observeResize;
					this._resizeObserver.disconnect();
					delete this._resizeObserver;
				}
				break;
		}
	}
}
decorate(SlashrUi, {
	_metadata: observable
});

export class SlashrUiDialog {
	constructor(slashrUi, idx, props) {
		this._metadata = {
			ui: slashrUi,
			idx: idx,
			props: {},
			ref: props.forwardRef || React.createRef(),
			eventHandlers: {},
			state: {
				isOpen: props.open || false
			}
		};
	}
	delete() {
		this._metadata.ui.deleteDialog(this.idx);
	}
	get isOpen() {
		return this._metadata.state.isOpen;
	}
	set isOpen(isOpen) {
		this._metadata.state.isOpen = isOpen;
		return this;
	}
	set open(isOpen) {
		this.isOpen = isOpen;
	}
	get open() {
		return this.isOpen;
	}
}
decorate(SlashrUiDialog, {
	_metadata: observable
});

export class SlashrUiMenu {
	constructor(slashrUi, idx, props) {
		this._metadata = {
			ui: slashrUi,
			idx: idx,
			props: {},
			ref: props.forwardRef || React.createRef(),
			eventHandlers: {},
		};
		this._stateVars = {
			isOpen: props.open || false
		}
	}
	delete() {
		this._metadata.ui.deleteMenu(this.idx);
	}
	get isOpen() {
		return this._stateVars.isOpen;
	}
	set isOpen(isOpen) {
		this._stateVars.isOpen = isOpen;
		return this;
	}
	set open(isOpen) {
		this.isOpen = isOpen;
	}
	get open() {
		return this.isOpen;
	}
}
decorate(SlashrUiMenu, {
	_stateVars: observable
});


class SlashrUiElement {
	constructor(slashrUi, idx, props) {
		this._metadata = {
			ui: slashrUi,
			idx: idx,
			props: {},
			ref: props.forwardRef || React.createRef(),
			eventHandlers: {},
			style: {},
			state: {
				shouldRender: true
			},
		};

		// Default State MOBX props
		this._stateProps = SlashrUiElement.defaultStateProps;
		this._stateVars = SlashrUiElement.defaultStateVars;
		//Ref
		//TODO: KEEP TRACK OF EVENT LISTENERS USING _eventListeners
		// _eventListeners will keep track of the current event listeners
		this._eventListeners = {};
		this._handleMouseDown = this._handleMouseDown.bind(this);
		this._handleMouseMove = this._handleMouseMove.bind(this);
		this._handleMouseUp = this._handleMouseUp.bind(this);
		this._handleClickCapture = this._handleClickCapture.bind(this);
		this._handleScroll = this._handleScroll.bind(this);
		this._handleClick = this._handleClick.bind(this);
		this._handlePointerDown = this._handlePointerDown.bind(this);
		this._handleWindowResize = this._handleWindowResize.bind(this);
		this._handleWindowScroll = this._handleWindowScroll.bind(this);
		this._handleClickOut = this._handleClickOut.bind(this);
		this._handleObserveIntersection = this._handleObserveIntersection.bind(this);
		this._handleObserveResize = this._handleObserveResize.bind(this);
		this._handleTransitionEnter = this._handleTransitionEnter.bind(this);
		this.init(props);

		// intercept(this._metadata, change => {
		// 	console.log("CHANGE CHANGE CHANGE!!!!!!!!!!!!",change);
		// 	// return null;
		// 	return change;
		// });
		// observe(this._metadata, change => {
		// 	console.log("CHANGE CHANGE CHANGE2!!!!!!!!!!!!",change);
		// 	// return null;
		// 	return change;
		// });
	}
	// True if it can be updated before mount
	static get defaultStateProps() {
		return {
			className: null,
			classNames: [],
			style: {},
			fadeOut: null,
			fadeIn: null,
			fadeToggle: null,
			transition: null,
			transitionToggle: null,
			hide: false,
			unmountOnHide: false,
			scroll: null,
			animate: null,
			onClickOut: null,
			onObserveIntersection: null,
			onObserveResize: null
		}
	}
	static get defaultStateVars() {
		return {
			style: {}
		}
	}
	static isDefaultStateProp(prop) {
		return (prop in SlashrUiElement.defaultStateProps);
	}
	static isDefaultStateVar(prop) {
		return (prop in SlashrUiElement.defaultStateVars);
	}

	// static isDefaultStateVar(prop) {
	// 	return SlashrUiElement.defaultStateVars[prop] || false;
	// }
	static shouldElementInit(props) {
		for (let prop in props) {
			//if(typeof prop === "object" && ! Object.keys(prop).length) continue;
			if (!SlashrUiElement.isDefaultStateProp(prop)) continue;
			else return true;
		}
		return false;
	}
	// static shouldElementUpdate(props, nextProps) {
	// 	for (let prop in props) {
	// 		if (!SlashrUiElement.isDefaultStateProp(prop)) continue;
	// 		if (!Slashr.utils.core.arePropsEqual(props[prop], nextProps[prop])) return true;
	// 	}
	// 	return false;
	// }
	// // returns false if there is no update
	static reducePropUpdates(props, nextProps) {
		let hasUpdate = false;
		let updatedProps = {};
		for (let prop in props) {
			if (!SlashrUiElement.isDefaultStateProp(prop)) {
				continue;
			}
			if (!Slashr.utils.core.arePropsEqual(props[prop], nextProps[prop])) {

				updatedProps[prop] = nextProps[prop];
				hasUpdate = true;
				//if(this.props.transition && this.elmt.className == "menu") console.log("menu props NOT EQ",this.elmt.className,i,this.props[i],prevProps[i]);
				switch (prop) {
					case "transitionToggle":
						if (!updatedProps.transition && props.transition) {
							updatedProps.transition = props.transition;
						}
						break;
				}
			}
		}
		return (hasUpdate) ? updatedProps : false;
	}
	reduceStateProps(props) {
		let hasUpdate = false;
		let updatedProps = {};
		for (let prop in props) {
			if (!SlashrUiElement.isDefaultStateProp(prop)) {
				continue;
			}
			if (!Slashr.utils.core.arePropsEqual(props[prop], this._stateProps[prop])) {
				updatedProps[prop] = props[prop];
				hasUpdate = true;
				//if(this.props.transition && this.elmt.className == "menu") console.log("menu props NOT EQ",this.elmt.className,i,this.props[i],prevProps[i]);
				switch (prop) {
					case "transitionToggle":
						if (!updatedProps.transition && props.transition) {
							updatedProps.transition = props.transition;
						}
						break;
				}
			}
		}

		return (hasUpdate) ? updatedProps : false;
	}
	init(props) {
		if (props) this._updateProps(props);
		if (props) this._updateStyleProps(props);
		if (props) this._updateEventHandlers(props);
		this._updateShouldRender(props);
	}
	_updateProps(props) {
		for (let prop in props) {
			if (SlashrUiElement.isDefaultStateProp(prop)) {
				let val = props[prop];
				switch (prop) {
					case "classNames":
						val = (val.length > 1) ? Slashr.utils.array.unique(val) : val;
						break;
				}
				this._stateProps[prop] = val;
				if (SlashrUiElement.isDefaultStateVar(prop)) {
					this._stateVars[prop] = val;
				}
			}
			else {
				this._metadata.props[prop] = props[prop];
			}
		}
	}
	// Prop Update Methods
	_updateStyleProps(props) {

		// Get a clone of style
		let nStyle = toJS(this.style);
		let doUpdateStyle = false;

		// Update style
		if (props.style && !Slashr.utils.core.arePropsEqual(props.style, this._stateProps.style)) {
			nStyle = props.style;
			doUpdateStyle = true;
		}

		// Updates Scroll
		let scrollProps = props.scroll || null;
		if (scrollProps) {
			//if(this.arePropsEqual(this.scroll,scrollProps)) return false;
			nStyle.overflow = null;
			nStyle.overflowX = null;
			nStyle.overflowY = null;
			doUpdateStyle = true;
			if ("x" in scrollProps) nStyle.overflowX = scrollProps.x;
			if ("y" in scrollProps) nStyle.overflowY = scrollProps.y;
			if (scrollProps.emulateTouch) {
				if (!this._metadata.state.emulateTouchScroll) this._metadata.state.emulateTouchScroll = {
					_hasEventListeners: false
				}
				//console.log("TODO: SHOULD emulate touch add style to children");
			}
		}

		// Update Hide
		let isHidden = false;
		if ("hide" in props || this.isHidden) {
			nStyle.display = "none";
			//else throw("TODO: need orig style");
			doUpdateStyle = true;
			isHidden = true;
		}


		if (doUpdateStyle) {
			this.style = nStyle;
			this.scroll = scrollProps
		}
	}

	_updateShouldRender(props) {
		props = (props === false) ? [] : props;
		let hasUpdate = false;
		let shouldRender = true;

		// Figure out if we should render something
		if (this.unmountOnHide) {
			for (let name in props) {
				switch (name) {
					// case "fadeIn":
					// 	shouldRender = true;
					// break;
					case "fadeIn":
						if (this.isHidden && props[name] !== false) shouldRender = true;
						hasUpdate = true;
						break;
					case "fadeOut":
						if (this.isHidden && props[name] !== false) shouldRender = false;
						hasUpdate = true;
						break;
					case "fadeToggle":
						if (this.isHidden && props[name] === false) shouldRender = false;
						hasUpdate = true;
						break;
					case "transitionToggle":
						if (this.isHidden && props[name] === false) shouldRender = false;
						hasUpdate = true;
						break;
					// Always render animate
					case "animate":
						hasUpdate = true;
						break;
				}
			}
			if (shouldRender && !hasUpdate && this.isHidden) shouldRender = false;
		}
		if (this._metadata.state.shouldRender && !shouldRender) {
			// Should render has changed, remove listeners
			this._removeEventListeners();
		}
		this._metadata.state.shouldRender = shouldRender;
	}

	handleMount(props) {
		this._update(props);
	}

	handleUpdate(props) {
		//console.log("element componentDidUpdate",this.elmt.className);
		// let update = SlashrUiElement.reducePropUpdates(prevProps, props);

		// if(update){
		// 	console.log("FOUND UPDATES", update, prevProps, props);
		// }
		// this._triggerAnimationEvents();
		// if (update === false) return false;
		this._update(props);
	}

	_update(props) {
		// Update props if already mounted

		// if(! this.isMounted) return false;
		// props = this.reduceStateProps(props);

		if (!props) return;

		// this.init(props);

		// if (props.className) {
		// 	this._props.className = props.className;
		// }
		let animateProps = {};
		if (props.animate) {
			animateProps = props.animate;
		}
		if (animateProps && Object.keys(animateProps).length) {
			this._metadata.ui.animate(this, animateProps);
		}
		if (props.fadeIn) {
			this._metadata.ui.fadeIn(this, (props.fadeIn === true) ? {} : props.fadeIn);
		}
		else if (props.fadeOut) {
			if (!this.isHidden) this._metadata.ui.fadeOut(this, (props.fadeOut === true) ? {} : props.fadeOut);
		}
		else if ("fadeToggle" in props) {
			if (props.fadeToggle === true) this._metadata.ui.fadeIn(this);
			else if (!this.isHidden) this._metadata.ui.fadeOut(this);
		}
		if ("transition" in props && "transitionToggle" in props) {
			// let transitionToggle = (props.transitionToggle) ? true : false;
			this._metadata.ui.transition(this, props.transitionToggle, props.transition);

			// if((this.isHidden && transitionToggle) || (! this.isHidden && ! transitionToggle)){
			// 	this._metadata.ui.transition(this, props.transitionToggle, props.transition);
			// }
		}

		if (!this._eventListeners.onWindowResize && (this.props.onResponsiveResize || this.props.onWindowResize)) {
			//console.log("TODO: Add responsiveResize to ui, instead of elements");
			this._metadata.ui.addEventListener("resize", this, this._handleWindowResize);
			this._eventListeners.onWindowResize = this._handleWindowResize;
		}

		if (!this._eventListeners.onWindowScroll && this.props.onWindowScroll) {
			this._metadata.ui.addEventListener("scroll", this, this._handleWindowScroll);
			this._eventListeners.onWindowScroll = this._handleWindowScroll;
		}

		if (!this._eventListeners.onObserveIntersection && this._stateProps.onObserveIntersection) {
			this._metadata.ui.addEventListener("observeIntersection", this, this._handleObserveIntersection);
			this._eventListeners.onObserveIntersection = this._handleObserveIntersection;
		}
		if (!this._eventListeners.onObserveResize && this._stateProps.onObserveResize) {
			this._metadata.ui.addEventListener("observeResize", this, this._handleObserveResize);
			this._eventListeners.onObserveResize = this._handleObserveResize;
		}
		if (props.onClickOut) {
			if (!this._metadata.state.clickOut) this._metadata.state.clickOut = {
				_hasEventListeners: false
			}
			if (!this._metadata.state.clickOut._hasEventListeners) this._addClickOutEventListeners();
		}
		else if (this._metadata.state.clickOut && this._metadata.state.clickOut._hasEventListeners) this._removeClickOutEventListeners();

		// Cause an initial resize event
		if (this._eventListeners.onWindowResize && this.props.onResponsiveResize) {
			// Trigger responsive resize on load
			this._handleWindowResize();
		}
		// if (this._eventListeners.onWindowScroll && this.props.onResponsiveResize) {
		// 	// Trigger responsive resize on load
		// 	this._handleWindowResize();
		// }
	}
	handleReact(props) {
		let updates = this.reduceStateProps(props);
		this.init(updates);
	}

	delete() {
		this._metadata.ui.deleteElement(this.idx);
	}
	get props() {
		return this._metadata.props;
	}
	get tag() {
		return this._metadata.props.tag || "div";
	}
	get type() {
		return this._metadata.props.type || null;
	}
	get src() {
		return this._metadata.props.src || null;
	}
	get name() {
		return this._metadata.props.name || null;
	}
	get id() {
		return this._metadata.props.id || null;
	}
	get alt() {
		return this._metadata.props.alt || null;
	}
	get to() {
		return this._metadata.props.to;
	}
	get ref() {
		return this._metadata.ref;
	}
	get children() {
		return this._metadata.children || null;
	}
	get idx() {
		return this._metadata.idx;
	}

	// get isMounted(){
	// 	console.log("element ismounted",this.className, this._isMounted);
	// 	return this._isMounted;
	// }
	// set mounted(isMounted){
	// 	console.log("element set mounted",this.className, isMounted);
	// 	this._metadata.state.isMounted = isMounted;
	// 	this._isMounted = isMounted;
	// 	return this;
	// }
	// get hasMounted() {
	// 	throw("REMOVE HAS MOUNTED");
	// 	return this._metadata.hasMounted;
	// }
	unmount() {
		this._removeEventListeners();
		this.delete();
	}
	// handleMounthandleMount(props) {
	// 	// If it's not hidden, it will be mounted on the first load
	// 	if(! this.isHidden) this.mounted = true;
	// 	this.update(props);

	// }
	get shouldRender() {
		return this._metadata.state.shouldRender;
	}
	// get animate(){
	// 	return this._metadata.state.animate || null;
	// }
	get scroll() {
		return this._stateProps.scroll || {};
	}
	set scroll(scroll) {
		this._stateProps.scroll = scroll
		return this;
	}

	get style() {
		return this._stateVars.style || {};
	}

	set style(styles) {
		this._stateVars.style = styles
		//console.log("fade in Updated Star Var Style", styles, toJS(this.style));
		return this;
	}
	get nativeStyle() {
		if (!this.ref || !this.ref.current) throw ("Element Error: Ref does not exist");
		return this.ref.current.style;
	}
	get reactStyle() {
		// Check for transforms

		let styles = Slashr.utils.dom.parseElementStyle(toJS(this.style));
		//console.log("element fade in parse styles",this.className, toJS(this.style),styles);
		return styles;

		// if (styles.transform) {
		// 	if (typeof styles.transform === "string") throw ("TODO: Allow transform strings in element reactStyle");

		// 	// Check for specific transform options

		// 	if (styles.transform.origin) {
		// 		styles.transformOrigin = styles.transform.origin;
		// 		delete styles.transform.origin;
		// 	}
		// 	styles.transform = this.renderTransformStyle(styles.transform);
		// }
		// console.log("Animate STyles", this.style, styles);
		// for(let prop in this.style){
		// 	switch(prop){
		// 		case "rotate":
		// 		case "scale":
		// 		case "scaleX":
		// 		case "scaleY":
		// 		case "translate":
		// 		case "translateX":
		// 		case "translateY":					
		// 			// Already has a transform as style
		// 			// throw("LKSJDLKFJSDLKJF");
		// 			hasTransforms = true;
		// 			transforms[prop] = this.style[prop];
		// 		break;
		// 		case "transform":
		// 			throw("TODO: Add transform to allowed styles");
		// 			// transform = styles[i];
		// 			// transforms[name] = styles[i];
		// 		break;
		// 		default: 
		// 			styles[prop] = this.style[prop];
		// 	}

		// }
		// if(hasTransforms){
		// 	// let nTransforms = {};
		// 	// for(let i in transforms){
		// 	// 	// if(i === "transform"){
		// 	// 	// 	transforms = {...transforms, ...this.parseTransformStyle(transforms[i])}
		// 	// 	// }
		// 	// 	// else 
		// 	// 	nTransforms[i] = transforms[i];
		// 	// }
		// 	styles["transform"] = this.renderTransformStyle(transforms);
		// }
		// else if(transform){
		// 	this._metadata.style["transform"] = transform;
		// }
		//return styles;
	}
	updateAnimationState(type, state, isComplete = false) {

		if (!this._metadata.state.animationState) {
			this._metadata.state.animationState = {};
		}

		// Update the state if changed
		// Set trigger to true
		if (!this._metadata.state.animationState[type]) this._metadata.state.animationState[type] = {
			isComplete: false,
			states: {}
		};

		if (!(state in this._metadata.state.animationState[type].states)) {
			this._metadata.state.animationState[type].states[state] = true;
		}
		this._metadata.state.animationState[type].isComplete = isComplete;
	}
	_triggerAnimationEvents() {
		let animationState = this._metadata.state.animationState;
		//console.log("trigger _updateElmtAnimationState 3", animationState);
		if (!animationState) return false;

		//console.log("slider state",animationState.transition.states);
		if (this.props.onTransition && animationState.transition && animationState.transition.states) {
			//console.log("_update slider trigger animat",animationState.transition.states);
			for (let state in animationState.transition.states) {
				//console.log("_update in loop",state,animationState.transition.states[state]);
				if (animationState.transition.states[state]) {
					this.props.onTransition(state);
					//	console.log("_update report slider trigger animat on trans",state);
					animationState.transition.states[state] = false;
				}
			}
			if (this._metadata.state.animationState.transition.isComplete) delete this._metadata.state.animationState.transition;
		}
	}
	get eventHandlers() {
		return this._metadata.eventHandlers;
	}

	get className() {
		return this._stateProps.className || null;
	}
	get classNames() {
		return this._stateProps.classNames || [];
	}
	set classNames(classNames) {
		this._stateProps.classNames = Slashr.utils.array.unique(classNames);
	}
	set addClassName(className) {
		if (this._stateProps.classNames.indexOf(className) === -1) this._stateProps.classNames.push(className);
	}

	parseStyles(styles) {

	}
	renderStyle() {

	}
	parseTransformStyle(transformStyle) {
		if (!transformStyle) return {};
		transformStyle = transformStyle.trim();
		let transforms = transformStyle.split(" ");
		for (let i in transforms) {

		}

	}

	addStyle(name, value) {
		let nStyles = {};
		if (typeof name === 'object') nStyles = name;
		else nStyles[name] = value;
		let style = toJS(this.style);

		for (let i in nStyles) {
			if (i === "transform") {
				if (!style.transform) style.transform = {};
				for (let j in nStyles[i]) {
					style.transform[j] = nStyles[i][j];
				}
			}
			else style[i] = nStyles[i];
		}

		this.style = style

		return this;
	}
	addStyles(styles) {
		this.addStyle(styles);
	}
	styleExists(style) {
		return (style in this.style);
	}
	transformStyleExists(style) {
		return (this.style.transform && style in this.style.transform);
	}
	addNativeStyle(name, value) {
		let nStyles = {};
		if (typeof name === 'object') nStyles = name;
		else nStyles[name] = value;
		if (this.ref && this.ref.current) {
			nStyles = Slashr.utils.dom.parseElementStyle(nStyles);
			for (let i in nStyles) {
				//console.log(this.ref.current.style);
				this.ref.current.style[i] = nStyles[i];
			}
		}
	}
	addNativeStyles(styles) {
		this.addNativeStyle(styles);
	}
	nativeStyleExists(style) {
		if (!this.ref || !this.ref.current) throw ("Element Error: Ref does not exist [1]");
		return (this.ref.current.style[style] !== null);
	}
	nativeTransformStyleExists(style) {
		if (!this.ref || !this.ref.current) throw ("Element Error: Ref does not exist [2]");
		return (this.ref.current.style.transform !== null && this.ref.current.style.transform.indexOf(style) !== -1);
	}

	get isHidden() {
		return this.style.display === "none";
	}
	get unmountOnHide() {
		return (this._stateProps.unmountOnHide !== undefined && this._stateProps.unmountOnHide !== false);
	}
	// Handler Methods
	_handleMouseDown(e) {
		if (this.scroll.emulateTouch) {
			this._metadata.state.emulateTouchScroll = {
				isMouseDown: true,
				x: e.pageX,
				y: e.pageY,
				deltaX: false,
				deltaY: false
			};
			this._addEmulateTouchEventListeners();
		}
		if (this.props.onMouseDown) this.props.onMouseDown(e);
	}
	_handleMouseMove(e) {
		if (this.scroll.emulateTouch) {

			if (!this._metadata.state.emulateTouchScroll.isMouseDown) return;
			this._clearEmulateTouchScrollTimeout();

			let scrollLeft = this.ref.current.scrollLeft;

			let deltaX = e.pageX - this._metadata.state.emulateTouchScroll.x;
			if (Math.abs(deltaX) > 5) this._metadata.state.emulateTouchScroll.isMouseScrolling = true;
			else return;

			let offset = (this._metadata.state.emulateTouchScroll.deltaX === false) ? scrollLeft : scrollLeft + (this._metadata.state.emulateTouchScroll.deltaX - deltaX);
			this._metadata.state.emulateTouchScroll.deltaX = deltaX;

			this.ref.current.scrollLeft = offset;
		}
		if (this.props.onMouseMove) this.props.onMouseMove(e);
	}
	_handleMouseUp(e) {
		if (this.scroll.emulateTouch) {
			this._clearEmulateTouchScrollTimeout();
			this._removeEmulateTouchEventListeners();
			this._metadata.state.emulateTouchScroll.isMouseDown = false;
			// To capture clicks, wait for the timeout to finish
			this._mouseScrollTimeout = setTimeout(() => {
				this._metadata.state.emulateTouchScroll.isMouseScrolling = false;
			}, 100)
		}
		if (this.props.onMouseUp) this.props.onMouseUp(e);
	}
	_handleClickCapture(e) {
		if (this.scroll.emulateTouch && this._metadata.state.emulateTouchScroll.isMouseScrolling) {
			e.preventDefault();
			e.stopPropagation();
		}
		if (this.props.onClickCapture) this.props.onClickCapture(e);
	}
	_handleClickOut(e) {
		if (!this.ref || !this.ref.current) return;

		if (this._stateProps.onClickOut && !this.ref.current.contains(e.target)) {
			// e.preventDefault();
			// e.stopPropagation();
			this._stateProps.onClickOut(e);
		}
		// e.stopPropagation();
	}
	_handleScroll(e) {
		if (this.props.onScroll) this.props.onScroll(e);
	}
	_handleClick(e) {
		if (this.props.onClick) this.props.onClick(e);
	}
	_handlePointerDown(e) {
		if (this.props.onPointerDown) this.props.onPointerDown(e);
	}
	_handleWindowResize() {
		if (!this.props.onWindowResize && !this.props.onResponsiveResize) {
			this._removeWindowResizeEventListener();
		}
		if (this.props.onWindowResize) this.props.onWindowResize();
		if (this.props.onResponsiveResize) {
			let values = {
				height: window.innerHeight,
				width: window.innerWidth,
			};
			values.orientation = (values.width >= values.height) ? "landscape" : "portrait";

			// Guess the device type by size
			//let tWidth = (values.orientation === "landscape") ? values.width : values.height;
			let tWidth = values.width;

			if (tWidth <= 480) values.device = "phone";
			else if (tWidth <= 1024) values.device = "tablet";
			else if (tWidth <= 1200) values.device = "laptop";
			else if (tWidth <= 1920) values.device = "desktop";
			else values.device = "desktop-large";
			this.props.onResponsiveResize(values);
		}
	}
	_handleWindowScroll() {
		if (!this.props.onWindowScroll) {
			this._removeWindowScrollEventListener();
		}
		else {
			this.props.onWindowScroll({
				x: window.scrollX,
				y: window.scrollY
			});
		}
	}
	_handleObserveIntersection(entry) {
		if (this._stateProps.onObserveIntersection) this._stateProps.onObserveIntersection(entry);
	}
	_handleObserveResize(entry) {
		if (this._stateProps.onObserveResize) this._stateProps.onObserveResize(entry);
	}

	// Event Listener Updates
	_addEmulateTouchEventListeners() {
		this._removeEmulateTouchEventListeners();
		document.addEventListener('mousemove', this._handleMouseMove);
		document.addEventListener('mouseup', this._handleMouseUp);
		this._metadata.state.emulateTouchScroll._hasEventListeners = true;
	}
	_removeEmulateTouchEventListeners() {
		if (this._metadata.state.emulateTouchScroll._hasEventListeners) {
			document.removeEventListener('mousemove', this._handleMouseMove);
			document.removeEventListener('mouseup', this._handleMouseUp);
			this._metadata.state.emulateTouchScroll._hasEventListeners = false;
		}
	}
	_clearEmulateTouchScrollTimeout() {
		if (this._metadata.state.emulateTouchScroll.mouseScrollTimeout) {
			clearTimeout(this._metadata.state.emulateTouchScroll.mouseScrollTimeout);
			this._metadata.state.emulateTouchScroll.mouseScrollTimeout = null;
		}
	}

	_addClickOutEventListeners() {
		this._removeClickOutEventListeners();
		if (this._metadata.state.clickOut._hasEventListeners) return;
		document.addEventListener('pointerdown', this._handleClickOut);
		this._metadata.state.clickOut._hasEventListeners = true;
	}
	_removeClickOutEventListeners() {
		if (!this._metadata.state.clickOut._hasEventListeners) return;
		document.removeEventListener('pointerdown', this._handleClickOut);
		this._metadata.state.clickOut._hasEventListeners = false;
	}

	_updateEventHandlers(props) {
		if ((this.props.onMouseDown || this.scroll.emulateTouch) && !this.eventHandlers.onMouseDown) {
			this._metadata.eventHandlers.onMouseDown = this._handleMouseDown;
		}
		else if (!this.props.onMouseDown && !this.scroll.emulateTouch && this.eventHandlers.onMouseDown) this._metadata.eventHandlers.onMouseDown = null;

		if ((this.props.onMouseDown || this.scroll.emulateTouch) && !this.eventHandlers.onClickCapture) this._metadata.eventHandlers.onClickCapture = this._handleClickCapture;
		else if (!this.props.onClickCapture && !this.scroll.emulateTouch && this.eventHandlers.onClickCapture) this._metadata.eventHandlers.onClickCapture = null;

		if (this.props.onScroll) this._metadata.eventHandlers.onScroll = this._handleScroll;
		if (this.props.onClick) this._metadata.eventHandlers.onClick = this._handleClick;
		if (this.props.onPointerDown) this._metadata.eventHandlers.onPointerDown = this._handlePointerDown;
	}
	_removeEventListeners() {
		if (this.scroll.emulateTouch) this._removeEmulateTouchEventListeners();
		if (this.props.onClickOut) this._removeClickOutEventListeners();
		if (this._eventListeners.onWindowResize) this._removeWindowResizeEventListener();
		if (this._eventListeners.onObserveIntersection) this._removeObserveIntersectionListener();
		if (this._eventListeners.onObserveResize) this._removeObserveResizeListener();
		if (this._eventListeners.onWindowScroll) this._removeWindowScrollEventListener();
	}
	_removeWindowResizeEventListener() {
		this._metadata.ui.removeEventListener("resize", this);
		if (this._eventListeners.onWindowResize) delete this._eventListeners.onWindowResize;
	}
	_removeWindowScrollEventListener() {
		this._metadata.ui.removeEventListener("scroll", this);
		if (this._eventListeners.onWindowScroll) delete this._eventListeners.onWindowScroll;
	}
	_removeObserveIntersectionListener() {
		this._metadata.ui.removeEventListener("observeIntersection", this);
		if (this._eventListeners.onObserveIntersection) delete this._eventListeners.onObserveIntersection;
	}
	_removeObserveResizeListener() {
		this._metadata.ui.removeEventListener("observeResize", this);
		if (this._eventListeners.onObserveResize) delete this._eventListeners.onObserveResize;
	}
	_handleTransitionEnter() {

	}
	_handleTransitionExited() {

	}


}
decorate(SlashrUiElement, {
	_stateProps: observable,
	_stateVars: observable
});

// class Element extends React.Component {
// 	constructor(props) {
// 		super(props);
// 		this.slashr = Slashr.getInstance();
// 	}
// 	render() {
// 		return (

// 				<_Element 
// 					{...this.props}
// 				>
// 					{this.props.children}
// 				</_Element>

// 		);
// 	}
// }


export const _Element = inject("slashr")(observer(
	class _Element extends React.Component {
		constructor(props) {
			super(props);
			this._metadata = {
				elmt: null,
				isMounted: false,
				isRendered: false,
				hasRendered: false
			}
			// Only create element if it has required props

			if (SlashrUiElement.shouldElementInit(props)) {
				this._metadata.elmt = this.props.slashr.ui.createElement(props);
			}
		}
		componentDidMount() {
			if (this.elmt && this.elmt.shouldRender) {
				this.elmt.handleMount(this.props);
				this.updateRender();
			}
		}
		updateRender() {
			if (this.elmt && this.elmt.shouldRender) {
				if (!this._metadata.hasRendered && this._metadata.isRendered) {
					if (this.props.scrollToTop) setTimeout(() => {
						Slashr.utils.dom.scrollTop();
					}, 100);
					this._metadata.hasRendered = true;
				}
				if (this._metadata.isRendered && this.props.scrollTop && !isNaN(this.props.scrollTop)) {
					Slashr.utils.dom.scrollTop(this.props.scrollTop);
				}
			}
		}

		// shouldComponentUpdate(nextProps, nextState) {
		// 	return (this.elmt) ? true : false;
		// 	// console.log("element should update",this.elmt.idx, this.elmt.ref.current, nextProps.children);
		// 	// return SlashrUiElement.shouldComponentUpdate(this.props, nextProps);
		// }
		componentDidUpdate(prevProps, prevState, snapshot) {
			if (this.elmt && this.elmt.shouldRender) {
				this.updateRender();

				//console.log("element componentDidUpdate",this.elmt.className);
				let update = SlashrUiElement.reducePropUpdates(prevProps, this.props);
				// TODO: this should probably be moved
				this.elmt._triggerAnimationEvents();
				if (update === false) return false;

				this.elmt.handleUpdate(update);
			}
			// console.log("element component update");
			// // if(! this.elmt){
			// // 	if(! SlashrUiElement.shouldElementInit(this.props)) return;

			// // 	this._metadata.elmt = this.props.slashr.ui.createElement(this.props);

			// // 	console.log("element CREATING ELEMENT!!!!!!!!!!!",this.props, this);
			// // 	//this.elmt.handleMount(this.props);
			// // 	return;
			// // }
			// let update = SlashrUiElement.reducePropUpdates(prevProps, this.props);
			// console.log(update);

			// if (update === false) return false;
			// // console.log("element IS UPDATING",this.elmt, this.elmt.idx, update);
			// this.elmt.update(update);
		}
		componentWillUnmount() {
			this.unmount();
		}
		componentWillReact() {
			if (this.elmt) {
				//console.log("element componentWillReact",this.elmt.className);
				this.elmt.handleReact(this.props);
			}
		}
		get elmt() {
			return this._metadata.elmt;
		}
		s
		unmount() {
			if (this.elmt) {
				this.elmt.unmount();
			}
		}
		render() {
			//this.elmt.update();
			// Check if the elment has unmountOnHide
			// if(this.rendered){
			// 	this.elmt.update();
			// }
			// else{
			// 	throw("SLDKFJLSDKJFFH");
			// }

			// if(this.elmt && this.isMounted){
			// 	this.elmt.update(this.props);
			// }
			// this.mounted = true;

			// Show or hide the element
			// let doRender = true;
			//this.mounted = true;
			// if (this.elmt && this.elmt.unmountOnHide){
			// 	// If it's hidden, mark unmounts
			// 	if(this.elmt.isHidden){
			// 		//console.log("element UNMNOUNTED",this.elmt.className);
			// 		doRender = false;
			// 		this.mounted = false;
			// 	}
			// 	// else if(! this.isMounted){
			// 	// 	this.elmt.rendered = true;
			// 	// 	console.log("element trigger update",this.elmt.className);
			// 	// }
			// }
			//this.rendered = true;
			//TODO: Check why REF is broken, and needs to get used on render?
			let props = {
				//ref: (this.elmt) ? (this.props.forwardRef || this.elmt.ref) : this.props.forwardRef,
				forwardRef: (this.elmt) ? (this.props.forwardRef || this.elmt.ref) : this.props.forwardRef,
				style: (this.elmt) ? this.elmt.reactStyle : this.props.style,
				type: (this.elmt) ? this.elmt.type : this.props.type,
				src: (this.elmt) ? this.elmt.src : this.props.src,
				alt: (this.elmt) ? this.elmt.alt : this.props.alt,
				to: (this.elmt) ? this.elmt.to : this.props.to,
				tag: (this.elmt) ? this.elmt.tag : this.props.tag,
				name: (this.elmt) ? this.elmt.name : this.props.name,
				id: (this.elmt) ? this.elmt.id : this.props.id,
				elmt: this.elmt || null,
				shouldRender: (this.elmt) ? this.elmt.shouldRender : true
			};

			let className = (this.elmt) ? this.elmt.className : this.props.className;
			let classNames = (this.elmt) ? this.elmt.classNames : this.props.classNames;
			if (classNames && classNames.length > 0) {
				if (className && classNames.indexOf(className) === -1) classNames.push(className);
				className = classNames.join(" ");
			}
			props.className = className;

			// Add event handlers
			if (this.elmt && !this.elmt.shouldRender) {
				this._metadata.isRendered = false;
				this.elmt.unmount();
			}

			this._metadata.isRendered = true;

			//console.log("Element Rendered",(this.elmt) ? "Controlled":"Pure", props.className, props.forwardRef);
			// let _ChildElement = React.forwardRef((props, ref) => (
			// 	<__Element 
			// 		{...props}
			// 		forwardRef={ref}
			// 	>
			// 		{this.props.children}
			// 	</__Element>
			// ));
			// return(
			// 	<_ChildElement ref={props.forwardRef}/>
			// );
			return (
				<__Element {...props}>
					{this.props.children}
				</__Element>
			);

		}
	}
));
class __Element extends React.PureComponent {
	constructor(props) {
		super(props);
	}
	// componentDidMount(){
	// 	if(this.props.forwardRef) console.log("element ref mount",this.props.className,this.props.forwardRef.current);
	// }
	render() {
		let doRender = true;
		if (this.props.elmt && !this.props.shouldRender) {
			return null;
		}
		let to = this.props.to || null;
		let tag = this.props.tag || "div";
		let props = {
			ref: this.props.forwardRef || null,
			className: this.props.className || null,
			style: this.props.style || null,
			type: this.props.type || null,
			src: this.props.src || null,
			alt: this.props.alt || null,
			name: this.props.name || null,
			id: this.props.id || null
		};
		if (this.props.elmt) {
			props = { ...props, ...this.props.elmt.eventHandlers };
		}

		//if(this.props.forwardRef) console.log("element ref mount",this.props.className,this.props.forwardRef.current);
		let el = React.createElement(tag, props, this.props.children);
		if (to) el = <NavLink to={to}>{el}</NavLink>;
		return el;
	}
}

export const Element = React.forwardRef((props, ref) => {
	return (
		<Provider slashr={Slashr.getInstance()}>
			<_Element
				{...props}
				forwardRef={ref}
			>
				{props.children}
			</_Element>
		</Provider>
	);
});
export const Text = React.forwardRef((props, ref) => (
	<Element
		{...props}
		ref={ref}
		tag={props.tag || "span"}
	>
		{props.children}
	</Element>
));
export const Container = React.forwardRef((props, ref) => (
	<Element
		{...props}
		ref={ref}
	>
		{props.children}
	</Element>
));
export const Paragraph = React.forwardRef((props, ref) => (
	<Element
		{...props}
		ref={ref}
		tag="p"
	>
		{props.children}
	</Element>
));
export const Section = React.forwardRef((props, ref) => (
	<Element
		{...props}
		ref={ref}
		tag="section"
	>
		{props.children}
	</Element>
));
export const Image = React.forwardRef((props, ref) => {
	if (props.backgroundUrl) {
		let style = props.style || {};
		style.backgroundImage = `url('${props.backgroundUrl}')`;
		return (
			<Element
				role="img"
				{...props}
				style={style}
				ref={ref}
				tag="span"
			>
				&nbsp;
			</Element>
		);
	}
	else {
		return (
			<Element
				{...props}
				ref={ref}
				tag="img"
			/>
		);
	}

});
export const Navigation = React.forwardRef((props, ref) => (
	<Element
		{...props}
		ref={ref}
		tag="nav"
	>
		{props.children}
	</Element>
));
export const Header = React.forwardRef((props, ref) => (
	<Element
		{...props}
		ref={ref}
		tag="header"
	>
		{props.children}
	</Element>
));


export class ContainerLink extends React.Component {
	constructor(props) {
		super(props);
		this.slashr = Slashr.getInstance();
		this.handleClick = this.handleClick.bind(this);
		this.routeProps = this.slashr.router.parseLinkProps(this.props);
		if (!this.props.to) throw ("ContainerLink error: 'to' prop missing");
	}
	handleClick(e) {
		if (e.target.tagName !== "A") {
			this.slashr.app.router.push(this.routeProps);
		}
	}
	render() {
		return (
			<div className={this.props.className} onClick={this.handleClick}>
				{this.props.children}
			</div>
		);
	}
};

export class SocialText extends React.Component {
	constructor(props) {
		super(props);
		if (!this.props.tagRenderer) throw ("Social Text Error: tagRenderer required.");
	}
	renderText() {
		const reactStringReplace = require('react-string-replace');
		let text = this.props.value;
		if (!text) return text;
		if (text.indexOf("@[") === -1) return text;
		let regex = /@\[([a-z\d_]+):([a-z\d_ ]+):([a-z\d_-]+)\]/ig;
		// text = reactStringReplace(text, regex, (match, i) => {
		// 	console.log("mention",match,i);
		// });
		let tags = text.match(regex);
		if (!tags || !tags.length) return text;
		let mentions = [];
		if (tags && tags.length) {
			tags.forEach((val) => {
				let idx = 0;
				let tagInfo = val.match(/@\[([a-z\d_]+):([a-z\d_ ]+):([a-z\d_-]+)\]/i);
				if (tagInfo.length < 4) return;
				let tag = {
					match: tagInfo[0],
					type: tagInfo[1],
					label: tagInfo[2],
					value: tagInfo[3]
				};
				// console.log("RENDER TAG match",tag.label, i);
				text = reactStringReplace(text, tag.match, () => {
					return this.props.tagRenderer(tag.type, tag.value, tag.label, ++idx);
				});
			});
		}
		return text;
	}
	render() {
		return this.renderText();
	}
}

export const Menu = React.forwardRef((props, ref) => {
	return (
		<Provider slashr={Slashr.getInstance()}>
			<_Menu
				{...props}
				forwardRef={ref}
			>
				{props.children}
			</_Menu>
		</Provider>
	);
});


// const _ContextMenu = inject("domain")(observer(
// 	class FeedItem extends React.Component {
// 		constructor(props) {
// 			super(props);
// 		}
// 		render(){
// 			return(
// 				<div>
// 					<div className="content-menu-control">
// 						{this.props.control}
// 					</div>
// 					<div className="content-menu-items">
// 						{this.props.children}
// 					</div>
// 				</div>
// 			);
// 		}
// 	}
// ));
export const _Menu = inject("slashr")(observer(
	class _Menu extends React.Component {
		constructor(props) {
			super(props);

			if (!this.props.control) throw ("Menu Error: No control given.");

			// this.handleClose = this.handleClose.bind(this);
			this.handleOpenClick = this.handleOpenClick.bind(this);
			this.handleCloseClick = this.handleCloseClick.bind(this);
			this.mnu = this.props.slashr.ui.createMenu(props);
			this.hasOpened = false;

			// this.menuProps = {
			// 	...props,
			// 	onClickOut: this.handleClose,
			// 	//classNames: classNames
			// };
		}
		handleCloseClick() {
			if (!this.close()) return;
			// e.preventDefault();
			// e.stopPropagation();
		}
		handleOpenClick() {
			this.open();
		}
		open() {
			console.log("menu", this.mnu);
			this.mnu.open = true;
			return true;
		}
		close() {
			if (this.props.shouldClose && this.props.shouldClose() === false) {
				return false;
			}
			this.mnu.open = false;
			return true;
		}
		componentDidUpdate(prevProps, prevState, snapshot) {
			if (this.props.open !== prevProps.open) this.mnu.open = this.props.open;

			if (this.mnu.open) this.hasOpened = true;
			else if (this.hasOpened) {
				this.hasOpened = false;
				this.onClose();
			}
		}
		componentWillUnmount() {
			this.mnu.delete();
		}
		onClose() {
			if (this.props.onClose) this.props.onClose(this.mnu);
		}
		render() {

			let classNames = ["menu-cntr"];
			if (this.props.className) classNames.push(this.props.className);
			let control = React.cloneElement(this.props.control, {
				onClick: this.handleOpenClick
			});
			let menuProps = {};
			if (this.props.transition) {
				menuProps.transition = this.props.transition;
				menuProps.transitionToggle = this.mnu.isOpen;
			}
			else {
				menuProps.fadeToggle = this.mnu.isOpen;
			}
			//console.log("menu render",menuProps);
			return (
				<div className={classNames.join(" ")}>
					<div className="menu-control">
						{control}
					</div>
					<Container
						hide
						unmountOnHide
						className="menu"
						onClickOut={this.mnu.open && this.handleCloseClick}
						onClick={this.handleCloseClick}
						ref={this.props.forwardRef}
						{...menuProps}
					>
						{this.props.children}
					</Container>
				</div>
			);
		}
	}
));


export class MenuItem extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="menu-item">
				{this.props.children}
			</div>
		);
	}
}

export const Dialog = React.forwardRef((props, ref) => {
	return (
		<Provider slashr={Slashr.getInstance()}>
			<_Dialog
				{...props}
				forwardRef={ref}
			>
				{props.children}
			</_Dialog>
		</Provider>
	);
});

export const _Dialog = inject("slashr")(observer(
	class _Dialog extends React.Component {
		constructor(props) {
			super(props);
			this.handleClose = this.handleClose.bind(this);
			this.dlg = this.props.slashr.ui.createDialog(props);
			this.hasOpened = false;
			this.closeButton = this.props.closeButton || null;

			let classNames = ["dialog"];
			if (this.props.className) classNames.push(this.props.className);
			this.dialogProps = {
				...props,
				onClickOut: this.handleClose,
				classNames: classNames
			};

			let backdropClassNames = ["dialog-backdrop"];
			if (this.props.backdropClassName) backdropClassNames.push(this.props.backdropClassName);
			this.dialogBackdropProps = {
				classNames: backdropClassNames
			};
		}
		handleClose(e) {
			if (!this.close()) return;
			e.preventDefault();
			e.stopPropagation();
		}
		close() {
			if (this.props.shouldClose && this.props.shouldClose() === false) {
				return false;
			}
			this.dlg.open = false;
			return true;
		}
		componentDidUpdate(prevProps, prevState, snapshot) {
			if (this.props.open !== prevProps.open) this.dlg.open = this.props.open;
			if (this.dlg.open) {
				if (!this.hasOpened) {
					this.hasOpened = true;
					this.onOpen();
				}
			}
			else if (this.hasOpened) {
				this.hasOpened = false;
				this.onClose();
			}
		}
		// componentWillReact(){
		// 	console.log("Component Will React");

		// 	if(this.props.open != this.dlg.open) this.dlg.open = this.props.open;
		// }
		componentWillUnmount() {
			this.dlg.delete();
		}
		onClose() {
			if (this.props.onClose) this.props.onClose(this.dlg);
		}
		onOpen() {
			if (this.props.onOpen) this.props.onOpen(this.dlg);
		}
		render() {
			let closeButton = null;
			if (this.closeButton) {
				closeButton = React.cloneElement(this.closeButton, {
					onClick: this.handleClose
				});
			}
			let titleBar = (this.props.title) ? <h2>{this.props.title}</h2> : null;
			return (
				<BodyPortal>
					<Container
						hide
						unmountOnHide
						fadeToggle={this.dlg.isOpen}
						{...this.dialogBackdropProps}
					>
						<Container
							className="dialog-close-button"
						>
							{closeButton}
						</Container>

						<Container
							{...this.dialogProps}
							ref={this.props.forwardRef}
						>	{titleBar}
							{this.props.children}
						</Container>
					</Container>
				</BodyPortal>
			);
		}
	}
));

class BodyPortal extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return ReactDOM.createPortal(
			this.props.children,
			document.body
		);
	}
}

export class HeadTags extends React.Component {
	constructor(props) {
		super(props);
	}
	renderTags() {
		let tags = [];
		if (!this.props.tags) return false;
		if (this.props.tags.title) tags.push(<title key="title">{this.props.tags.title}</title>);
		if (this.props.tags.meta) {
			if (this.props.tags.meta.type) tags.push(<meta key="og:type" property="og:type" content={this.props.tags.meta.type} />);
			if (this.props.tags.meta.url) tags.push(<meta key="og:url" property="og:url" content={this.props.tags.meta.url} />);
			if (this.props.tags.meta.siteName) tags.push(<meta key="og:site_name" property="og:site_name" content={this.props.tags.meta.siteName} />);
			if (this.props.tags.meta.title) tags.push(<meta key="og:title" property="og:title" content={this.props.tags.meta.title} />);
			if (this.props.tags.meta.description) tags.push(<meta key="og:description" property="og:description" content={this.props.tags.meta.description} />);
			if (this.props.tags.meta.image) tags.push(<meta key="og:image" property="og:image" content={this.props.tags.meta.image} />);
			if (this.props.tags.meta.facebookAppId) tags.push(<meta key="fb:app_id" property="fb:app_id" content={this.props.tags.meta.facebookAppId} />);
			if (this.props.tags.meta.twitterCard) tags.push(<meta key="twitter:card" property="twitter:card" content={this.props.tags.meta.twitterCard} />);

		}
		return tags;
	}
	render() {
		return ReactDOM.createPortal(
			this.renderTags(),
			document.head
		);
	}
}
export class SlashrUiCalendar {
	_monthKey = null;
	constructor(slashrUi, idx, props) {
		this._ui = slashrUi;
		this._idx = idx;
		this._month = props.month || new Date();
		this._day = props.day || new Date();
		this._name = props.name || `cal${this._day.getTime()}`;
		this._dayContentLoader = props.dayContentLoader || null;
		this._onDaySelect = props.onDaySelect || null;
		this._startDay = null;
		this._endDay = null;
		this._keyPrefix = null;
		this._dayContent = {};
		this.initialize();
	}
	initialize() {
		this.initializeMonth();
	}
	initializeMonth() {
		this._keyPrefix = "calendar" + this.name + Slashr.utils.date.toShortDate(this.month);
		this._monthKey = this._keyPrefix;
		this.initializeDays();
	}
	load() {
		this.requestDayContent();
	}
	_loadIncDecMonth(val) {
		console.log(this._month);
		this._month.setMonth(this._month.getMonth() + val);
		console.log(this._month);
		this.initializeMonth();
		this.load();
	}
	loadNextMonth() {
		this._loadIncDecMonth(1);
	}
	loadPreviousMonth() {
		this._loadIncDecMonth(-1);
	}
	async requestDayContent() {
		if (this.dayContentLoader) {
			this._isLoaded = false;
			this._dayContent = await this.dayContentLoader(this.month);
			this._isLoaded = true;
		}
		else this._isLoaded = true;
	}
	initializeDays() {
		let startDay = new Date(this._month);
		startDay.setHours(0, 0, 0, 0);
		startDay.setDate(1);

		let endDay = new Date(startDay);
		endDay.setHours(23, 59, 59, 999);
		endDay.setDate(endDay.getDate() + 41);

		// Figure out the first sunday
		if (startDay.getDay() > 0) {
			for (let day = startDay.getDay(); day > 0; day--) {
				startDay.setDate(startDay.getDate() - 1);
			}
		}

		// Figure out the last saturday
		// if (endDay.getDay() < 6) {
		// 	for (let day = endDay.getDay(); day < 6; day++) {
		// 		endDay.setDate(endDay.getDate() + 1);
		// 	}
		// }

		this._startDay = startDay;
		this._endDay = endDay;

	}
	delete() {
		this._ui.deleteCalendar(this._idx);
	}
	get name() {
		return this._name;
	}
	get isLoaded() {
		return this._isLoaded;
	}
	get keyPrefix() {
		return this._keyPrefix;
	}
	get month() {
		return this._month;
	}
	get day() {
		return this._day;
	}
	get startDay() {
		return this._startDay;
	}
	get endDay() {
		return this._endDay;
	}
	get dayContent() {
		return this._dayContent;
	}
	async dayContentLoader() {
		if (this._dayContentLoader) return await this._dayContentLoader(this.month);
	}
}
decorate(SlashrUiCalendar, {
	//_monthKey: observable,
	_isLoaded: observable
});


export class Calendar extends React.Component {
	render() {
		return (
			<Provider slashr={Slashr.getInstance()}>
				<_Calendar
					{...this.props}
				>
					{this.props.children}
				</_Calendar>
			</Provider>
		);
	}
}

export const _Calendar = inject("slashr")(observer(
	class _Calendar extends React.Component {
		constructor(props) {
			super(props);
			this._calendar = this.props.slashr.ui.createCalendar(this.props);
			this._loadingIndicator = this.props.loadingIndicator;
			this._previousMonthButton = null;
			this._nextMonthButton = null;

			//this._previousMonthButton = this.props.previousMonthButton || ((this.props.previousMonthButton === false) ? null : <button>{"<"}</button>);
			//this._nextMonthButton = this.props.nextMonthButton || ((this.props.nextMonthButton === false) ? null : <button>{">"}</button>);


			this._topRightActionButton = this.props.topRightActionButton || null;
			this._onSelectDay = this.props.onSelectDay || null;
			// this.handleSelectDay = this.handleSelectDay.bind(this);
			this.handleNextMonthButtonClick = this.handleNextMonthButtonClick.bind(this);
			this.handlePreviousMonthButtonClick = this.handlePreviousMonthButtonClick.bind(this);
			//this.initialize();
		}
		initialize() {

		}
		componentDidMount() {
			this.calendar.load();
		}
		componentWillReact() {

		}
		componentWillUnmount() {
			this.calendar.delete();
		}
		get calendar() {
			return this._calendar;
		}
		get loadingIndicator() {
			return this._loadingIndicator;
		}
		get nextMonthButton() {
			return this._nextMonthButton;
		}
		get previousMonthButton() {
			return this._previousMonthButton;
		}
		get topRightActionButton() {
			return this._topRightActionButton;
		}
		handleNextMonthButtonClick() {
			this.calendar.loadNextMonth();
		}
		handlePreviousMonthButtonClick() {
			this.calendar.loadPreviousMonth();
		}
		handleSelectDay(date) {
			this._onSelectDay(date);
		}
		renderMonthHeader() {
			let label = Slashr.utils.date.getMonthLabel(this.calendar.month);
			label = `${Slashr.utils.date.getMonthLabel(this.calendar.month)} ${this.calendar.month.getFullYear()}`
			return (
				<div className="calendar-month-label">
					{label}
				</div>
			);
		}
		renderDaysHeader() {
			let ret = [];
			for (let d = 0; d <= 6; d++) {
				ret.push(
					<div
						className="calendar-days-header-day-label"
						key={`${this.keyPrefix}}dh${d}`}
					>
						{Slashr.utils.date.getDayLabel(d, Slashr.utils.date.LABEL_TYPE_SHORT)}
					</div>
				);
			}
			return ret;
		}
		dayRenderer(date) {
			let key = Slashr.utils.date.toShortDate(date);
			//if(this.calendar._dayContent) console.log("calendar",key,this.calendar._dayContent);
			//if(this.calendar._dayContent && this.calendar._dayContent[key]) console.log("calendar day rendere",key,this.calendar._dayContent[key]);
			if (this.calendar._dayContent && this.calendar._dayContent[key]) {
				return this.calendar._dayContent[key];
			}
			else return null;
		}
		renderDays() {
			let currDay = new Date(this.calendar.startDay);
			let weeks = [];
			let days = [];
			let today = new Date();
			while (currDay <= this.calendar.endDay) {
				let d = currDay.getDay();
				let classNames = ["calendar-day"];
				let onSelectDay = (this._onSelectDay) ? this.handleSelectDay.bind(this, new Date(currDay)) : null;
				if (currDay.getMonth() < this.calendar.month.getMonth()) classNames.push("calendar-day-previous-month");
				else if (currDay.getMonth() > this.calendar.month.getMonth()) classNames.push("calendar-day-next-month");
				if (Slashr.utils.date.areDatesSameDay(currDay, today)) classNames.push("calendar-day-today");
				else if (currDay < today) classNames.push("calendar-day-past");
				if (this.props.day && Slashr.utils.date.areDatesSameDay(currDay, this.props.day)) classNames.push("calendar-day-selected");
				days.push(
					<div
						className={classNames.join(" ")}
						key={`${this.calendar.keyPrefix}}d${currDay.getDate()}`}
						onClick={onSelectDay}
					>
						<div className="calendar-day-label">
							{currDay.getDate()}
						</div>
						<div className="calendar-day-content">
							{this.dayRenderer(currDay)}
						</div>
					</div>
				);
				if (d === 6) {
					weeks.push(
						<div
							className="calendar-week"
							key={`${this.calendar.keyPrefix}}d${weeks.length}`}
						>
							{days}
						</div>
					);
					days = [];
				}
				currDay.setDate(currDay.getDate() + 1);
			}
			return weeks;
		}
		render() {
			let classNames = ["calendar"];
			if (this.props.className) classNames.push(this.props.className);
			let nextMonthButton = (!this._nextMonthButton) ? null : React.cloneElement(this._nextMonthButton, {
				onClick: this.handleNextMonthButtonClick
			});
			let previousMonthButton = (!this._nextMonthButton) ? null : React.cloneElement(this._previousMonthButton, {
				onClick: this.handlePreviousMonthButtonClick
			});
			return (
				<Container
					classNames={classNames}
				>
					{!this.calendar.isLoaded && this.loader &&
						<div className="calendar-loader">
							{this.loadingIndicator}
						</div>
					}
					<div className="calendar-header">
						<div className="calendar-previous-month-button">
							{previousMonthButton}
						</div>
						{this.renderMonthHeader()}
						<div className="calendar-next-month-button">
							{nextMonthButton}
						</div>
						{this.topRightActionButton &&
							<div className="calendar-top-right-action-button">
								{this.topRightActionButton}
							</div>
						}
					</div>
					<div className="calendar-days-header">
						{this.renderDaysHeader()}
					</div>
					<div className="calendar-month">
						<div className="calendar-days">
							{this.renderDays()}
						</div>
					</div>
				</Container>
			);
		}
	}
));

export class SlashrUiGrid {
	constructor(slashrUi, idx, props) {

		this._metadata = {
			ui: slashrUi,
			idx: idx,
			loadingIndicator: props.loadingIndicator || null,
			layoutUpdater: props.layoutUpdater || null,
			sectionRenderer: props.sectionRenderer || null,
			sectionSpacerRenderer: props.sectionSpacerRenderer || null,
			itemLoader: props.itemLoader || null,
			onLoad: props.onLoad || null,
			items: props.items || null,
			ref: props.forwardRef || React.createRef(),
			eventHandlers: {}
		};

		this.initialize(props);
	}
	initialize(props, reset = false) {
		this._slashr = props.slashr;
		this._route = props.route;
		this._router = this._slashr.router;
		this._lastPage = 0;
		//this._isLoadingNext = false;
		this._isLoaded = false;
		// this.loadPage(page);
		this._metadata.props = {};
		this._metadata.pages = {};
		this._metadata.visiblePages = {};
		this._metadata.sections = {};
		// this._metadata.lastPage = 0;
		this._metadata.isLoadingNext = false;
		this._metadata.scrollOffsetTop = props.scrollOffsetTop || 0;
		this._metadata.noResults = props.noResults || null,
			this._metadata.disabled = props.disabled || false;
		// this._metadata.initialPage = props.page || 1;
		this._resultsPerPage = props.resultsPerPage || null;
		this._pagesPerSection = props.pagesPerSection || 1;
		// this._metadata.router = (props.history && props.location) ? {
		// 	history: props.history,
		// 	location: props.location
		// } : null;
		// if (this._stateProps && this._stateProps.name) {
		// 	console.log("grid check name", props.name, this.name);
		//}

		this._stateProps = {
			isInitialized: false,
			name: props.name || null
		};

		// Check History
		this._metadata.initialPage = props.page || 1;
		this._metadata.history = null;
		this._metadata.initialScrollY = 0;
		if (this._router.history && this._route && this._route.ui && this._route.ui.grid && this._route.ui.grid.grids[this.name]) {

			switch (this._router.history.action) {
				case "POP":
					let historyState = this._route.ui.grid;
					this._metadata.history = historyState.grids[this.name];
					this._metadata.initialPage = historyState.grids[this.name].page;
					this._metadata.initialScrollY = (historyState.scrollY || 0);
					break;
			}
		}
		//alert("LSKDJF");

		// if (props.history && props.location && props.location.state && props.location.state._slashr){
		// 	let historyAction = props.history.action;
		// 	switch (historyAction) {
		// 		case "POP":
		// 		alert("pop");
		// 		throw("SLDKJF");
		// 			if (props.location.state && props.location.state._slashrUiGrid) {
		// 				throw("SLKDJF");
		// 				console.log("slashr ui grid",props.location.state._slashrUiGrid);
		// 				let historyState = props.location.state._slashrUiGrid;
		// 				// console.log("grid test history loca",props.location);
		// 				if (historyState.grids[this.name]) {
		// 					this._metadata.history = historyState.grids[this.name];
		// 					this._metadata.initialPage = historyState.grids[this.name].page;
		// 					this._metadata.initialScrollY = (historyState.scrollY || 0);
		// 				}
		// 			}
		// 			break;
		// 		case "PUSH":
		// 			console.log("");
		// 			//throw ("REMOVE FROM HISTORY");
		// 			break;
		// 	}
		// }
		this._metadata.initialSection = this.getSectionByPage(this.initialPage);
	}
	get updateSize() {
		return this._metadata.updateSize;
	}
	update() {

	}
	updateLayout() {
		if (this.layoutUpdater) {
			this.layoutUpdater();
			for (let i in this.sections) {
				this.sections[i].updateLayout();
			}
		}
	}
	updateScrollHistory() {

	}
	updateHistory() {
		if (!this._route) return;
		// Make sure the update is on the correct route.
		if (this._slashr.router.route.portal !== this._route.name) return;

		let lastVisiblePage = 0;
		for (let page in this._metadata.visiblePages) {
			if (page > lastVisiblePage) lastVisiblePage = parseInt(page);
		}

		let section = null;
		let page = null;
		if (lastVisiblePage) {
			let sectionNum = this.getSectionByPage(lastVisiblePage);
			section = this.sections[sectionNum];
		}
		else {
			return;
			// console.log(this._metadata.visiblePages);
			// throw("NO VISIBLE PAGE ?????");
		}

		// let section = this.props.grid.sections[this.props.section];
		// let routeState = this._route.location.state || {};	
		let uiState = this._slashr.router.getUiState(this._route.name);

		let gridState = uiState.grid || {};

		if (!gridState.grids) gridState.grids = {};


		let scrollY = window.scrollY;
		// // Check if already in history
		if (!gridState.grids[this.name] || gridState.grids[this.name].page !== lastVisiblePage) {
			gridState.grids[this.name] = {};
			gridState.grids[this.name].section = section.num;
			gridState.grids[this.name].page = lastVisiblePage;
			// gridState[this.name].scroll = Slashr.utils.dom.scrollPosition();
			gridState.grids[this.name].offset = 0;
			gridState.grids[this.name].size = {
				height: section.ref.current.offsetHeight,
				width: section.ref.current.offsetWidth
			};

			// // console.log();
			if (section.num > 1) {
				gridState.grids[this.name].offset = Slashr.utils.dom.offset(section.ref.current);
			};
		}
		else {
			// Just update scroll??
			if (gridState.scrollY && gridState.scrollY === scrollY) {
				return false;
			}
		}
		gridState.scrollY = scrollY;

		// console.log("grid handle intersect state", this.props.section, section.ref.current, gridState[this.name]);
		//state._slashrUiGrid = gridState;

		this._slashr.router.updateUiState(this._route.name, {
			scroll: {
				x: window.scrollX,
				y: window.scrollY
			},
			grid: gridState
		});

		//this._slashr.app.router.replace();

		//console.log("GRID NEW STATE LOC",state,gridState);

		// if(! location.state) location.state = {};
		// if(! location.state.portals) location.state.portals = {};
		// location.state.portals[this._route.name] = state;
		//location.state = state;

		// throw("LKJSDFH");
		//if(! this.isDisabled) this.router.history.replace(location);

	}

	async itemLoader(startPage = 1, endPage = null) {
		let items = await this._metadata.itemLoader(startPage, endPage);
		return items;
	}
	// async load(){
	// 	return await this.loadPage(this.initialPage);
	// }
	async loadPage(startPage = 1, endPage = null) {
		if (!endPage) endPage = startPage;
		//if (this._isLoaded) return false;

		if (this.items) {
			startPage = 1;
			this._isLoaded = true;
			this._metadata.pages[startPage] = this.items;
		}
		else {
			// Make sure pages aren't loaded
			let pages = []
			for (let p = startPage; p <= endPage; p++) {
				if (!this._metadata.pages[p]) pages.push(p);
			}
			// Is there anythng to load?
			if (!pages.length) return false;

			if (endPage > this.lastPage) this._lastPage = endPage;
			let itemPages = await this.itemLoader(startPage, endPage);

			//console.log("TODO: Update this so that masonary makes sense");
			if (this.pagesPerSection === 1) {
				let nItemPages = {};
				nItemPages[startPage] = itemPages;
				itemPages = nItemPages;
			}

			this._metadata.pages = { ...this._metadata.pages, ...itemPages };

			for (let page in itemPages) {
				if (this._metadata.onLoad) this._metadata.onLoad(this, page);
			}

			// See if the last loaded page resultrs mean grid loaded
			if (!itemPages[endPage] || !itemPages[endPage].length
				|| (this.resultsPerPage && this.resultsPerPage > itemPages[endPage].length)) {
				//console.log("Loaded?",itemPages, endPage, this.resultsPerPage,  itemPages[endPage],itemPages[endPage].length);
				// console.log("grid testset is loaded",this.resultsPerPage,itemPages[endPage].length);
				this._isLoaded = true;
			}

			// let scrollPosStart = Slashr.utils.dom.scrollPosition();
			this.updateSectionLoaded(startPage, endPage);
			//let scrollPosEnd = Slashr.utils.dom.scrollPosition();

			// this._metadata.pages[page] = items;
			// console.log("grid check loaded", this.resultsPerPage);
			// if (!items.length || (this.resultsPerPage && this.resultsPerPage > items.length)) this._isLoaded = true;
			// if (this._metadata.onLoad) this._metadata.onLoad(this, page);
			// this.updateSectionLoaded(page);
		}

		// Something has loaded
		this._stateProps.isInitialized = true;
	}
	async loadPages(pages) {
		await this.loadPage(pages[0], pages[pages.length - 1])
	}
	updateSectionLoaded(startPage, endPage) {
		let section = this.getSectionByPage(startPage);
		if (!this.sections[section]) throw ("Grid Error: Section not found");
		this.sections[section].setPageRangeLoaded(startPage, endPage);
	}
	async load() {
		let initialPage = (this.history) ? this.initialPage : 1;
		let initialSection = this.getSectionByPage(initialPage);
		if (!this.sectionExists(initialSection)) throw ("Grid Error: Initial section not found...");
		this.sections[initialSection].load();
	}
	async loadNextPage() {
		if (this.isLoadingNext) return false;
		this._metadata.isLoadingNext = true;
		await this.loadPage(this.lastPage + 1);
		this._metadata.isLoadingNext = false;
	}
	get name() {
		return this._stateProps.name;
	}
	get isDisabled() {
		return this._metadata.disabled;
	}
	get totalItems() {
		let totalItems = 0;
		for (let p in this.pages) {
			totalItems += this.pages[p].length;
		}
		return totalItems;
	}
	disable() {
		this._metadata.disabled = true;
	}
	enable() {
		this._metadata.disabled = false;
	}
	get idx() {
		return this._metadata.idx;
	}
	get resultsPerPage() {
		return this._resultsPerPage;
	}
	get pagesPerSection() {
		return this._pagesPerSection;
	}
	get scrollOffsetTop() {
		return this._metadata.scrollOffsetTop;
	}
	get isLoaded() {
		return this._isLoaded;
	}
	get isLoadingNext() {
		return this._metadata.isLoadingNext;
	}
	get isInitialized() {
		return this._stateProps.isInitialized;
	}
	get pages() {
		return this._metadata.pages;
	}
	get initialPage() {
		return this._metadata.initialPage;
	}
	get initialSection() {
		return this._metadata.initialSection;
	}
	get history() {
		return this._metadata.history;
	}
	get initialScrollY() {
		return this._metadata.initialScrollY;
	}
	// get route() {
	// 	return this._metadata.route;
	// }
	// get slashr() {
	// 	return this._metadata.slashr;
	// }
	get lastPage() {
		return this._lastPage;
	}
	set pages(pages) {
		this._metadata.pages = pages;
		return this;
	}
	get sections() {
		return this._metadata.sections;
	}
	set sections(sections) {
		this._metadata.sections = sections;
		return this;
	}
	get noResults() {
		return this._metadata.noResults || null;
	}
	// get initialSection{
	// 	let initialPage = (this.history) ?  this.initialPage : 1;
	// 	let initialSection = this.getSectionByPage(initialPage);
	// }
	reset(props) {
		this.initialize(props, true);
		// this.load();
	}
	refresh(page) {
		throw ("REFRESH GRID");
	}
	delete() {
		this._metadata.ui.deleteGrid(this.idx);
	}
	addVisiblePage(page, pageKey) {
		if (!this._metadata.visiblePages[page]) this._metadata.visiblePages[page] = {};
		this._metadata.visiblePages[page][pageKey] = true;
	}
	removeVisiblePage(page, pageKey) {
		if (this._metadata.visiblePages[page]) {
			if (this._metadata.visiblePages[page][pageKey]) delete this._metadata.visiblePages[page][[pageKey]];
			if (!Object.keys(this._metadata.visiblePages[page]).length) delete this._metadata.visiblePages[page];
		}
	}
	addSection(section) {
		this.sections[section] = new SlashrUiGridSection(this, section);
		return this.sections[section];
	}
	sectionExists(section) {
		// for (let i in this.sections) {
		// 	console.log("grid check section exists", i);
		// }
		// console.log("grid check return", section, (this.sections[section]) ? true : false);
		return (this.sections[section]) ? true : false;
	}
	sectionLoaded(section) {
		// for (let i in this.sections) {
		// 	console.log("grid check section exists", i);
		// }
		// console.log("grid check return", section, (this.sections[section]) ? true : false);
		if (!this.sectionExists) return false;
		return this.sections[section].isLoaded;
	}
	getPageRangeBySection(section) {
		return {
			start: (this.pagesPerSection * section) - (this.pagesPerSection - 1),
			end: (this.pagesPerSection * section)
		}
	}
	getPagesBySection(section) {
		let ret = [];
		let secIdx = (section - 1);
		for (let i = 1; i <= this.pagesPerSection; i++) {
			ret.push(
				(secIdx * this.pagesPerSection) + i
			)
		}
		return ret;
	}
	getSectionByPage(page) {
		// if (page < this.pagesPerSection) return 1;
		return Math.ceil(page / this.pagesPerSection);
	}
	get loadingIndicator() {
		return this._metadata.loadingIndicator;
	}
	layoutUpdater() {
		return this._metadata.layoutUpdater();
	}
	renderSection(section) {
		return (this._metadata.sectionRenderer) ? this._metadata.sectionRenderer(section.num) : null;
	}
	renderSectionSpacer(section) {
		return (this._metadata.sectionSpacerRenderer) ? this._metadata.sectionSpacerRenderer(section.num) : null;
	}
}
decorate(SlashrUiGrid, {
	_stateProps: observable
});

export class SlashrUiGridSection {
	_stateVars = {};
	constructor(slashrUiGrid, section, renderer, options = {}) {
		this._metadata = {
			grid: slashrUiGrid,
			section: section,
			pages: {},
			loaded: false,
			pageCount: 0,
			lastPageLoaded: null,
			lastLayoutUpdate: null,
			ref: React.createRef()
		};
		this._stateVars = {
			pages: {},
			lastPageLoaded: null,
			lastLayoutUpdate: null
		}
		this.initialize();
	}
	initialize() {
		let pages = this.grid.getPagesBySection(this.section);
		let statePages = {}
		for (let page of pages) {
			statePages[page] = false;
		}
		this._stateVars.pages = statePages;
	}
	load() {
		if (!this._metadata.pageCount) {
			let pages = this.grid.getPagesBySection(this.section);
			// if(this.grid.isInitialized) throw("LSKDJFLKJDSLFKJSDFH");

			// Load First Page
			if (pages[0] === this.grid.initialPage || (this.section > 1 && this.previousLoaded)) {
				// throw("SLDKJFLKSDJFLKSJDFH");
				this.grid.loadPage(pages[0]);
			}
			else {
				// throw("LSKDJFLKSDJFLKSJDF");
				this.grid.loadPages(pages);
			}


			// if (!this.grid.isInitialized && this.grid.initialPage > 1) {
			// 	console.log("GRID check history  LOAD PAGE GRID NOT INITIALIZED.... MOVING ON", this.section, pages[0]);
			// 	console.log(pages);
			// 	console.log(this.grid.initialPage);
			// 	if (pages[0] === this.grid.initialPage) {
			// 		console.log(pages[0], this.grid.initialPage, (pages[0] === this.grid.initialPage));
			// 		this.grid.loadPage(pages[0]);
			// 	}
			// 	else this.grid.loadPages(pages);
			// }
			// else if ((this.section == 1 && this.grid.initialPage > 1) || (this.section > 1 && this.previousExists)) {
			// 	console.log("GRID check history  LOAD PAGE FOR SECTION: ", this.section, this.nextExists, this.previousExists);
			// 	// Load the first page of the section
			// 	this.grid.loadPage(pages[0]);
			// }
			// else {
			// 	console.log("GRID check history  LOAD PAGEs FOR SECTION: ", this.section, pages);
			// 	// Load the entire section
			// 	this.grid.loadPages(pages);
			// }
		}
	}
	updateLayout() {
		this._stateVars.lastLayoutUpdate = new Date().getTime();
	}
	setPageRangeLoaded(startPage, endPage) {
		let loadedPages = {};
		let hasLoadedPages = false;
		for (let page = startPage; page <= endPage; page++) {
			if (!this._stateVars.pages[page]) {
				loadedPages[page] = true;
				hasLoadedPages = true;
			}
		}

		if (hasLoadedPages) this._stateVars.pages = { ...this._stateVars.pages, ...loadedPages };

		let isLoaded = true;
		// //let nStatePages = {};
		let pageCount = 0;
		for (let p in this._stateVars.pages) {
			if (!this._stateVars.pages[p]) isLoaded = false;
			else pageCount++
		}
		// // this._statePages = nStatePages;
		this._metadata.pageCount = pageCount;
		this._metadata.loaded = isLoaded;
		this._stateVars.lastPageLoaded = endPage;
	}
	pageExists(page) {
		return (page in this.pages);
	}
	get idx() {
		return this._metadata.section;
	}
	get num() {
		return this._metadata.section;
	}
	get number() {
		return this._metadata.section;
	}
	get section() {
		return this._metadata.section;
	}
	get ref() {
		return this._metadata.ref;
	}
	get next() {
		return this._metadata.section + 1;
	}
	get previous() {
		return this._metadata.section - 1;
	}
	get nextExists() {
		return this._metadata.grid.sectionExists(this.next);
	}
	get previousExists() {
		if (this.section === 1) return true;
		return this._metadata.grid.sectionExists(this.previous);
	}
	get previousLoaded() {
		if (this.section === 1) return true;
		return this._metadata.grid.sectionLoaded(this.previous);
	}
	get grid() {
		return this._metadata.grid;
	}
	get isFirstPageLoaded() {
		let pages = this.grid.getPagesBySection(this.section);
		return (this.pages[pages[0]]) ? true : false;
	}
	get firstpage() {
		let pages = this.grid.getPagesBySection(this.section);
		return pages[0];
	}
	get isLoaded() {
		return this._metadata.loaded;
		// let ret = true;
		// if(this._metadata.loaded) return true;
		// for(let page in this._statePages){
		// 	if(! this._statePages.loaded) ret = false;
		// }
		// this._metadata.loaded = ret;
		// return ret;
	}
	get shouldRender() {
		return (this._stateVars.lastPageLoaded) ? true : false
	}
	get lastPageLoaded() {
		return this._stateVars.lastPageLoaded;
	}
	get pages() {
		return this._stateVars.pages;
	}
	checkUpdates() {
		if (this._metadata.lastPageLoaded !== this._stateVars.lastPageLoaded) {
			this._metadata.lastPageLoaded = this._stateVars.lastPageLoaded;
		}
		if (this._metadata.lastLayoutUpdate !== this._stateVars.lastLayoutUpdate) {
			this._metadata.lastLayoutUpdate = this._stateVars.lastLayoutUpdate;
		}
	}
	render() {
		//TODO: Kind of a hacky way to force reaction
		this.checkUpdates();
		return this.grid.renderSection(this);
	}
	renderSpacer() {
		return this.grid.renderSectionSpacer(this);
	}

}
decorate(SlashrUiGridSection, {
	_stateVars: observable,
	// shouldRender: computed,
	// pages: computed
});


export const _GridSection = inject("slashr")(observer(
	class _GridSection extends React.Component {
		constructor(props) {
			super(props);
			// this.handleObserveIntersection = this.handleObserveIntersection.bind(this);
			this.idx = this.props.idx;
			this.size = {
				height: null,
				width: null
			};
			this.state = {
				hidden: false
			};
			this.grid = this.props.grid;
			this.section = this.props.section;
			this.ref = this.section.ref;
		}
		componentWillReact() {
			// if(this.grid.initialPage > 1 && this.section.pageExists(this.grid.initialPage)){
			// 	Slashr.utils.dom.scrollToElement(this.ref.cntr.current,{
			// 		offsetTop: this.grid.scrollOffsetTop 
			// 	});
			// }
		}
		componentDidMount() {
			if (!this.grid.initialized) {

			}
			// this.lastPageLoaded = this.props.section.lastPageLoaded;
		}
		componentDidUpdate() {

		}

		// renderSection() {
		// 	return this.props.children;
		// }
		render() {
			return (
				<Container
					// onObserveIntersection={this.handleObserveIntersection}
					className="grid-section"
					ref={this.section.ref}
				>
					{this.section.num > 1 && this.section.renderSpacer()}
					{this.section.render()}

				</Container>
			);
		}
	}
));
export const _GridPage = withRouter(
	class _GridPage extends React.Component {
		constructor(props) {
			super(props);
			this.grid = this.props.grid;
			this.handleObserveIntersection = this.handleObserveIntersection.bind(this);
			this.size = false;
			this.hide = this.props.hide || false;
			this.ref = React.createRef();
			// this.state = {
			// 	isHidden: false
			// }
		}
		handleObserveIntersection(entry) {

			// console.log("Load?");
			// throw("SLKDJF");
			if (entry.isIntersecting && this.grid.isInitialized) {
				if (!this.props.grid.sectionExists(this.props.section)) return false;
				this.grid.addVisiblePage(this.props.page, this.props.pageKey);
			}
			else if (!entry.isIntersecting) {
				this.grid.removeVisiblePage(this.props.page, this.props.pageKey);
			}
			//this.grid.updateHistory();
			//this.grid.loadPage(this.page);
			// this.setState({
			// 	hidden: (!  entry.isIntersecting)
			// });
		}
		componentDidMount() {
			// if (this.hide && !this.state.isHidden) {
			// 	this.size = {
			// 		height: this.ref.current.offsetHeight(),
			// 		width: this.ref.current.offsetWidth()
			// 	}
			// 	this.setState({
			// 		isHidden: true
			// 	});
			// }
		}
		render() {

			// let children = this.props.children;
			// let style = 
			// let children = (this.hide) ? "&nbsp;" ? this.props.children;

			// if (this.state.hidden) {
			// }

			return (
				<Container
					// ref={this.ref}
					// {...this.props.onObserveIntersection}
					onObserveIntersection={this.handleObserveIntersection}
				>
					{this.props.children}
				</Container>
			);
		}
	}
);

export const _GridSectionLoader = inject("slashr")(observer(
	class _GridSectionLoader extends React.Component {
		constructor(props) {
			super(props);
			this.handleObserveIntersection = this.handleObserveIntersection.bind(this);
			this.grid = this.props.grid;
			this.section = this.grid.addSection(this.props.section);
			this.nextSectionExists = this.section.nextExists;
			this.intersectionTimeout = null;
			// this.isInitial = (this.props.initialSection === this.props.section);
		}
		componentDidMount() {
			// if(this.isInitial){
			// 	this.section.load();
			// }
			// if(this.isInitial && this.grid.history && this.grid.history.offset && this.grid.history.offset.top){
			// 	// Slashr.utils.dom.scrollToElement(this.ref.cntr.current,{
			// 	// 	offsetTop: this.grid.scrollOffsetTop 
			// 	// });
			// 	console.log("grid test scroll to",this.grid.history.offset.top);
			// }
		}
		componentWillReact() {
			this.grid.updateLayout();
		}
		renderLoader() {
			//let loadingNextControl = (this.props.loader) ? this.props.loader : <Container>Loading...</Container>
			// if (this.grid.isInitialized && !this.grid.isLoadingNext) {
			// 	loadingNextControl = React.cloneElement((this.props.showMoreButton) ? this.props.showMoreButton : <Button>Show More</Button>, {
			// 		onClick: this.handleLoadNextClick
			// 	});
			// }
		}
		update() {
			//this.grid.loadPage(this.page);
			//this.updateLayout();
			// console.log("GRID LOADED PAGE ",this.page, this.name);

		}


		handleObserveIntersection(entry) {
			if (entry.isIntersecting) {
				if (this.intersectionTimeout) return;
				this.intersectionTimeout = setTimeout(() => {
					this.section.load();
				}, 300);
			}
			else if (this.intersectionTimeout) {
				clearTimeout(this.intersectionTimeout);
				this.intersectionTimeout = null;
			}
		}
		render() {
			if (this.section.shouldRender) {
				let nextLoader = null;
				if (!this.grid.isLoaded && this.section.num >= (this.grid.initialSection + 1)) {
					nextLoader = <_GridSectionLoader
						grid={this.grid}
						section={this.section.num + 1}
						key={`${this.grid.name}section${this.section.num + 1}`}
					/>;
				}

				return (
					<React.Fragment>
						<_GridSection
							section={this.section}
							grid={this.grid}
						/>
						{nextLoader}
					</React.Fragment>
				);
			}
			else if (!this.grid.isLoaded || this.section.num < this.grid.initialSection) {
				let loaderCntrStyle = {};
				loaderCntrStyle.height = "100vh";
				if (this.grid.history) {
					let loaderHeight = (this.props.height || null);
					if (this.section.num === this.grid.initialSection) {
						if (this.grid.history.size && this.grid.history.size.height) {
							loaderHeight = this.grid.history.size.height;
						}
					}
					if (loaderHeight) loaderCntrStyle.height = `${loaderHeight}px`;
				}
				return (
					<Container
						style={loaderCntrStyle}
						className="grid-section-loader"
						onObserveIntersection={this.grid.isInitialized && this.handleObserveIntersection}
					>
						{this.grid.loadingIndicator}
					</Container>
				);
			}
			else {
				//console.log("TODO: Why does this need a key");
				return (!this.grid.totalItems && this.grid.noResults) ? <Container key={`grid-no-results-${this.grid.name}`} className="grid-no-results">{this.grid.noResults}</Container> : null;
			}
		}
	}
));

export const _GridLoader = inject("slashr")(observer(
	class _GridLoader extends React.Component {
		constructor(props) {
			super(props);
			this.grid = this.props.grid;
			this.gridName = this.props.name;
			this.handleWindowScroll = this.handleWindowScroll.bind(this);

			// Set scroll restoration to manual
			if (this.grid.router) {
				// if (window.history && window.history.scrollRestoration) {
				// 	window.history.scrollRestoration = "manual";
				// }
			}
		}
		componentDidMount() {
			// Moved to router
			// if (this.grid.history && this.grid.initialScrollY) {
			// 	setTimeout(()=>{
			// 		Slashr.utils.dom.scrollTop(this.grid.initialScrollY);
			// 		//Slashr.utils.dom.scrollTop(this.props.grid.history.offset.top);
			// 	},300);
			// }
			// else setTimeout(()=>{
			// 		Slashr.utils.dom.scrollTop();
			// 		//Slashr.utils.dom.scrollTop(this.props.grid.history.offset.top);
			// 	},300);
			this.grid.load();
		}
		componentWillReact() {
			// console.log("search test grid will react");
			//this.updateLayout();
			let isDisabled = this.props.disabled || false;
			if (isDisabled != this.grid.isDisabled) {
				isDisabled ? this.grid.disable() : this.grid.enable();
			}

			// reset the layout
			if (this.props.name !== this.grid.name) {
				this.reset();
			}
			else this.grid.updateLayout();


			// if (this.grid.isInitialized) this.updateLayout();
			//if(this.grid.isInitialized && this.hasRendered) this.updateLayout();
			//
			// console.log("grid test grid loader react123");
		}
		componentDidUpdate(prevProps) {
			if (!this.grid.isInitialized) {
				this.grid.load();
				// this.grid.updateLayout();
			}
		}
		reset() {
			this.grid.reset({ ...this.props, grid: null });
			// this.initialize();

		}
		handleWindowScroll(scroll) {
			this.grid.updateHistory();
		}

		// handleObserveIntersection(entry) {
		// 	console.log("RENDER GRID SECTION LOADER INTERSECT!!!!!!!!!!", this.section.section)
		// 	console.log("gridSectionLoader handleObserveIntersection?");
		// 	if (entry.isIntersecting) {
		// 		this.section.load();
		// 	}
		// 	//this.grid.loadPage(this.page);
		// 	// this.setState({
		// 	// 	hidden: (!  entry.isIntersecting)
		// 	// });
		// }
		render() {

			// let initialPage = (this.props.grid.history) ?  this.props.grid.initialPage : 1;
			let lastSection = this.grid.initialSection;
			let sectionLoaders = [];
			let prevLoaderHeight = null;
			if (lastSection > 1 && this.grid.history && this.grid.history.offset && this.grid.history.offset.top) {
				prevLoaderHeight = this.grid.history.offset.top / (lastSection - 1);
			}
			for (let section = 1; section <= (lastSection + 1); section++) {
				sectionLoaders.push(
					<_GridSectionLoader
						grid={this.props.grid}
						section={section}
						height={(section < lastSection) ? prevLoaderHeight : null}
						initialSection={lastSection}
						key={`${this.grid.name}section${section}`}
					/>
				);
			}
			return (
				<Container
					className="grid-loader"
					onWindowScroll={this.handleWindowScroll}
				>
					{sectionLoaders}
				</Container>
			);

			// console.log("RENDER GRID SECTION LOADER!!!!!!!!", this.section.section, this.section.isLoaded);
			// //trace(true);
			// // for(let page in this.section.pages){
			// // 	console.log(this.section.pages[page]);
			// // }
			// // if(this.shouthis.section.lastPage !== this.lastPage){

			// // }
			// // else return 
			// console.log("GRID check RENDER RENDER RENDER: ", this.props.section, this.previousSectionExists);
			// let loading = (this.props.loader) ? this.props.loader : <Container>Loading...</Container>;
			// if (this.section.shouldRender) {
			// 	//return this.props.sectionRenderer(this.props.section);

			// 	let prevLoaders = [];
			// 	console.log("check grid history",this.grid.history);
			// 	if(! this.previousSectionExists && this.grid.history){

			// 		// Render all previous loaders

			// 		let numSections = this.props.section - 1;
			// 		let prevLoaderHeight = null;
			// 		if(this.grid.history.offset && this.grid.history.offset.top){
			// 			console.log("calculate grid offset",this.grid.history.offset.top);
			// 			prevLoaderHeight = this.grid.history.offset.top / (this.props.section - 1)
			// 		}
			// 		for(let prevSec = 1; prevSec < this.props.section; prevSec++){
			// 			console.log("Create Loader with style",prevLoaderHeight);
			// 			prevLoaders.push(
			// 				<_GridSectionLoader
			// 					grid={this.grid}
			// 					section={prevSec}
			// 					height={prevLoaderHeight}
			// 					key={`${this.grid.name}section${prevSec}`}
			// 					loader={this.props.loader}
			// 					sectionRenderer={this.props.sectionRenderer}
			// 					sectionSpacerRenderer={this.props.sectionSpacerRenderer}
			// 				/>
			// 			);
			// 		}
			// 	}

			// 	let hasLoadNext = (!this.section.isLoaded && !this.grid.isLoaded);
			// 	return (
			// 		<React.Fragment>
			// 			{prevLoaders}
			// 			{(this.props.section > 1 && !this.previousSectionExists) &&
			// 				this.section.renderSpacer()
			// 			}

			// 			<_GridSection
			// 				section={this.section}
			// 				grid={this.grid}
			// 			/>

			// 			{(this.section.isLoaded && !this.nextSectionExists) && this.section.renderSpacer()}

			// 			{!this.nextSectionExists &&
			// 				<_GridSectionLoader
			// 					grid={this.grid}
			// 					section={this.props.section + 1}
			// 					loader={this.props.loader}
			// 					sectionRenderer={this.props.sectionRenderer}
			// 					sectionSpacerRenderer={this.props.sectionSpacerRenderer}
			// 				/>
			// 			}
			// 		</React.Fragment>
			// 	);
			// }
			// else {
			// 	let loaderCntrStyle = {};
			// 	if(this.props.height) loaderCntrStyle.height = `${this.props.height}px`;
			// 	if(this.grid.history && this.grid.history.section === this.props.section){
			// 		if(this.grid.history.offset && this.grid.history.offset.top){
			// 			loaderCntrStyle.paddingTop = this.grid.history.offset.top;
			// 		}
			// 		if(this.grid.history.size && this.grid.history.size.height){
			// 			loaderCntrStyle.height  = this.grid.history.size.height;
			// 		}
			// 	}
			// 	console.log("grid draw loader",this.previousSectionExists,this.props.section, loaderCntrStyle, this.grid.history);
			// 	return (

			// 		<Container
			// 			style={loaderCntrStyle}
			// 			className="grid-section-loader"
			// 			onObserveIntersection={this.handleObserveIntersection}
			// 		>
			// 			{this.props.loader || <Container>Loading...</Container>}
			// 		</Container>
			// 	);
			// }
		}
	}
));

// export class Grid extends React.Component {
// 	render() {
// 		return (
// 			<Provider slashr={Slashr.getInstance()}>
// 				<_Grid
// 					{...this.props}
// 				>
// 					{this.props.children}
// 				</_Grid>
// 			</Provider>
// 		);
// 	}
// }
export const Grid = inject("slashr")(observer(
	class Grid extends React.Component {
		constructor(props) {
			super(props);
			this.handleWindowResize = this.handleWindowResize.bind(this);
			this.handleLoadNext = this.handleLoadNext.bind(this);
			this.handleLoadNextClick = this.handleLoadNextClick.bind(this);
			this.sectionRenderer = this.sectionRenderer.bind(this);
			this.layoutUpdater = this.layoutUpdater.bind(this);
			this.grid = this.props.slashr.ui.createGrid({
				...this.props, ...{
					sectionRenderer: this.sectionRenderer,
					layoutUpdater: this.layoutUpdater
				}
			});

			this.ref = {
				cntr: React.createRef(),
				grid: React.createRef()
			}

			if (!props.itemRenderer) throw ("Grid Error: itemRenderer required.");
			this.initialize();
		}
		initialize() {
			this.items = this.props.items || [];
			this.minItemWidth = this.props.minItemWidth || 100;
			this.itemRenderer = this.props.itemRenderer;

			this.loadingIndicator = this.props.loadingIndicator || null;
			this.sectionSpacerRenderer = this.props.sectionSpacerRenderer || null;
			this.pagesPerSection = this.props.pagesPerSection || null;

			//this.itemLoader = this.props.itemLoader || null;
			this.page = this.grid.initalPage;
			// this.lastPage = this.page;
			this.idx = 0;
			this.resultsPerPage = this.props.resultsPerPage || null;
			this.numCols = 1;
			this.isLoading = false;
			//this.hasRendered = false;
			this.hiddenColumnPages = {};
		}
		get nextIdx() {
			return ++this.idx;
		}
		handleWindowResize() {

			//this.grid.updateLayout();
		}
		isHiddenColumnPage(column, page) {
			return (this.hiddenColumnPages[column] && this.hiddenColumnPages[column][page]) ? true : false;
		}
		handleLoadNext(entry) {
			if (this.grid.isInitialized && entry.isIntersecting) {
				this.grid.loadNextPage();
			}
		}
		handleLoadNextClick(entry) {
			this.grid.loadNextPage();
		}
		update() {

		}
		layoutUpdater() {

			// Update the number of items
			// let nTotalItems = 0;
			// for (let p in this.grid.pages) {
			// 	nTotalItems += this.grid.pages[p].length;
			// }
			// // Calculate the columns based on width of container and item min width
			// let nNumCols = Math.floor(this.ref.cntr.current.offsetWidth / this.minItemWidth) || 1;
			// // If the resize changes doesn't change the col count, nothing changes
			// // See if anything needs to be updates, if not, return
			// //if (nTotalItems === this.totalItems && nNumCols === this.numCols) return false;

			// //this.totalItems = nTotalItems;
			// this.numCols = nNumCols
			// //this.numRows = Math.ceil(this.totalItems / this.numCols);

			// // this.grid.updateLayout();

			return true;
		}
		componentWillReact() {
			if (this.props.name !== this.grid.name) {
				this.initialize();
			}
		}
		componentDidUpdate(prevProps) {

		}
		componentDidMount() {
			this.update();
		}
		componentWillUnmount() {
			this.grid.delete();
		}
		cellSpacerRenderer() {
			return (this.props.cellSpacerRenderer) ? this.props.cellSpacerRenderer : <Container class="cell-spacer">&nbsp;</Container>;
		}
		calculateNumRows(totalItems) {
			if (!totalItems || !this.numCols) return 0;
			// console.log("grid calculage num ros",totalItems, this.numCols, this.totalItems);
			// totalItems = totalItems || this.totalItems;
			return Math.ceil(totalItems / this.numCols);
		}
		sectionRenderer(section) {
			let secPages = this.grid.getPagesBySection(section);
			let hasSectionSpacers = false;
			let secItems = [];
			let items = [];
			let numCols = this.numCols || 1;

			let isSectionLoaded = true;
			for (let page of secPages) {
				if (!this.grid.pages[page]) {
					isSectionLoaded = false;
					continue;
				}
				let pageItems = [];
				for (let item of this.grid.pages[page]) {
					pageItems.push(this.itemRenderer(item, this.nextIdx));
				}
				items.push(
					<_GridPage
						grid={this.grid}
						page={parseInt(page)}
						pageKey={`page${parseInt(page)}`}
						section={section}
						key={`page${parseInt(page)}`}
					>
						{pageItems}
					</_GridPage>
				);
				// if (this.pagesPerSection && (page % this.pagesPerSection === 0)) {
				// 	hasSectionSpacers = true;
				// 	secItems.push(items);
				// 	items = [];
				// }
			}
			// if (items.length) {
			// 	secItems.push(items);
			// }

			// let sections = [];
			// for (let secIdx in secItems) {
			// 	let secNum = parseInt(secIdx) + 1;
			// 	let items = secItems[secIdx];
			// 	let itemIdx = 0;
			// 	let columns = [];
			// 	let colPageItems = [];
			// 	let numRows = this.calculateNumRows(items.length);
			// 	for (let row = 1; row <= numRows; row++) {
			// 		for (let col = 1; col <= this.numCols; col++) {
			// 			if (items[itemIdx]) {
			// 				let item = items[itemIdx];
			// 				if (!colPageItems[col - 1]) colPageItems[col - 1] = [];
			// 				if (!colPageItems[col - 1][item.page - 1]) colPageItems[col - 1][item.page - 1] = [];
			// 				colPageItems[col - 1][item.page - 1].push(this.itemRenderer(item.item, this.nextIdx));

			// 			}
			// 			else if (row === 1) {
			// 				colPageItems[col - 1] = this.cellSpacerRenderer(itemIdx);
			// 			}
			// 			itemIdx++;
			// 		}
			// 	}

			// 	for (let colIdx in colPageItems) {
			// 		let colKey = parseInt(colIdx) + 1;
			// 		let colItems = [];
			// 		let totalColPageItems = Object.keys(colPageItems).length;
			// 		let i = 1;
			// 		for (let page in colPageItems[colIdx]) {

			// 			if (!colPageItems[colIdx][page]) continue;

			// 			let pageNum = parseInt(page) + 1;

			// 			colItems.push(

			// 			);
			// 			i++;
			// 		}
			// 	}




			return (
				<React.Fragment>
					{items}
				</React.Fragment>
			);
			return columns;
		}



		render() {
			return (
				<Container
					onWindowResize={this.handleWindowResize}
					className="grid-cntr"
					ref={this.ref.cntr}
					style={{
						width: "100%"
					}}
				>
					<Container
						{...this.props}
						ref={this.ref.grid}
						className={this.props.className || "grid"}
					>
						<_GridLoader
							{...this.props}
							grid={this.grid}
							sectionRenderer={this.sectionRenderer}
							sectionSpacerRenderer={this.sectionSpacerRenderer}
							loadingIndicator={this.loadingIndicator}
						/>
					</Container>
				</Container>
			);
		}
	}
));

// export class MasonaryGrid extends React.Component {
// 	render() {
// 		return (

// 				<_MasonaryGrid
// 					{...this.props}
// 				>
// 					{this.props.children}
// 				</_MasonaryGrid>

// 		);
// 	}
// }

export const MasonaryGrid = inject("slashr", "route")(observer(
	class MasonaryGrid extends React.Component {
		constructor(props) {
			super(props);
			this.handleWindowResize = this.handleWindowResize.bind(this);
			this.handleObserveResize = this.handleObserveResize.bind(this);
			this.handlePageIntersection = this.handlePageIntersection.bind(this);
			this.handleLoadNext = this.handleLoadNext.bind(this);
			this.handleLoadNextClick = this.handleLoadNextClick.bind(this);
			this.sectionRenderer = this.sectionRenderer.bind(this);
			this.layoutUpdater = this.layoutUpdater.bind(this);
			this.grid = this.props.slashr.ui.createGrid({
				...this.props, ...{
					sectionRenderer: this.sectionRenderer,
					layoutUpdater: this.layoutUpdater
				}
			});

			this.ref = {
				cntr: React.createRef(),
				grid: React.createRef()
			}

			if (!props.itemRenderer) throw ("Masonary Grid Error: itemRenderer required.");

			// this.name = this.props.name;

			// this.handleClickOut = this.handleClickOut.bind(this);
			this.initialize();
		}
		initialize() {
			this.items = this.props.items || [];
			this.minItemWidth = this.props.minItemWidth || 100;
			this.itemRenderer = this.props.itemRenderer;

			this.loadingIndicator = this.props.loadingIndicator || null;
			this.sectionSpacerRenderer = this.props.sectionSpacerRenderer || null;
			this.pagesPerSection = this.props.pagesPerSection || null;

			//this.itemLoader = this.props.itemLoader || null;
			this.page = this.grid.initalPage;
			// this.lastPage = this.page;
			this.idx = 0;
			this.resultsPerPage = this.props.resultsPerPage || null;
			this.numCols = 1;
			this.isLoading = false;
			//this.hasRendered = false;
			this.hiddenColumnPages = {};
			this.updateLayoutTimeout = null;
		}
		get nextIdx() {
			return ++this.idx;
		}
		handleWindowResize() {
			// TODO: Make grid resize with props
			// if (this.updateLayout()) {
			// 	this.forceUpdate();
			// }
			// if(this.updateLayoutTimeout){
			// 	clearTimeout(this.updateLayoutTimeout);
			// } 
			this.grid.updateLayout();
		}
		handleObserveResize(e) {
			
			// TODO: Make grid resize with props
			// if (this.updateLayout()) {
			// 	this.forceUpdate();
			// }
			this.grid.updateLayout();
		}
		isHiddenColumnPage(column, page) {
			return (this.hiddenColumnPages[column] && this.hiddenColumnPages[column][page]) ? true : false;
		}
		handlePageIntersection(page, column, entry) {
			throw ("SLDKJFLKSDJFLKSJDLFKJSDFh");
			console.log("page handlePagint", page);

			// let doForceRender = false;
			// if (!entry.isIntersecting) {
			// 	if (this.isHiddenColumnPage(column, page)) return;
			// 	if (!this.hiddenColumnPages[column]) this.hiddenColumnPages[column] = {};
			// 	this.hiddenColumnPages[column][page] = true;
			// 	doForceRender = true;
			// }
			// else {
			// 	if (this.isHiddenColumnPage(column, page)) {
			// 		delete this.hiddenColumnPages[column][page];
			// 		doForceRender = true;
			// 	}
			// 	if (this.hiddenColumnPages[column] && !Object.keys(this.hiddenColumnPages[column]).length) delete this.hiddenColumnPages[column];
			// }

			// if (doForceRender) this.forceUpdate();
		}
		handleLoadNext(entry) {

			if (this.grid.isInitialized && entry.isIntersecting) {
				this.grid.loadNextPage();
			}
		}
		handleLoadNextClick(entry) {
			this.grid.loadNextPage();
		}
		update() {
			//this.grid.load();
			//this.updateLayout();
			// console.log("GRID LOADED PAGE ",this.page, this.name);
		}
		// updateLayout() {
		// 	console.trace();
		// 	console.log("in update layout");
		// 	return true;

		// 	// Update the number of items
		// 	let nTotalItems = 0;
		// 	for (let p in this.grid.pages) {
		// 		nTotalItems += this.grid.pages[p].length;
		// 	}
		// 	// Calculate the columns based on width of container and item min width
		// 	let nNumCols = Math.floor(this.ref.cntr.current.offsetWidth / this.minItemWidth) || 1;
		// 	// If the resize changes doesn't change the col count, nothing changes
		// 	// See if anything needs to be updates, if not, return
		// 	if (nTotalItems === this.totalItems && nNumCols === this.numCols) return false;

		// 	this.totalItems = nTotalItems;
		// 	this.numCols = nNumCols
		// 	console.log("grid update layouit", this.ref.cntr.current.offsetWidth, this.totalItems, this.numCols);
		// 	//this.numRows = Math.ceil(this.totalItems / this.numCols);

		// 	// this.grid.updateLayout();

		// 	return true;
		// }
		layoutUpdater() {

			// Update the number of items
			let nTotalItems = 0;
			for (let p in this.grid.pages) {
				nTotalItems += this.grid.pages[p].length;
			}
			// Calculate the columns based on width of container and item min width
			let nNumCols = Math.floor(this.ref.cntr.current.offsetWidth / this.minItemWidth) || 1;
			// If the resize changes doesn't change the col count, nothing changes
			// See if anything needs to be updates, if not, return
			//if (nTotalItems === this.totalItems && nNumCols === this.numCols) return false;

			//this.totalItems = nTotalItems;
			this.numCols = nNumCols
			//this.numRows = Math.ceil(this.totalItems / this.numCols);

			// this.grid.updateLayout();

			return true;
		}
		componentWillReact() {
			// console.log("search test grid will react");
			//this.updateLayout();
			// console.log("grid test componentWillReact");
			// console.log("FEED GRID WILL REACT", this.props);
			// if (this.props.name !== this.grid.name) {
			// 	console.log("grid reaction", this.props.name, this.grid.name);
			// 	this.reset();
			// }
			// if (this.grid.isInitialized) this.updateLayout();
			//if(this.grid.isInitialized && this.hasRendered) this.updateLayout();

			if (this.props.name !== this.grid.name) {
				this.initialize();
			}

			//this.grid.updateLayout();
		}
		componentDidUpdate(prevProps) {
			// if (this.props.name !== this.grid.name) {
			// 	this.reset();
			// }
			// this.grid.updateLayout();
			// console.log("GRID DID UPDATE",prevProps,this.props);
			// this.updateLayout();
		}
		componentDidMount() {
			this.update();
		}
		componentWillUnmount() {
			this.grid.delete();
		}
		cellSpacerRenderer() {
			return (this.props.cellSpacerRenderer) ? this.props.cellSpacerRenderer : <Container class="cell-spacer">&nbsp;</Container>;
		}
		calculateNumRows(totalItems) {
			if (!totalItems || !this.numCols) return 0;
			// console.log("grid calculage num ros",totalItems, this.numCols, this.totalItems);
			// totalItems = totalItems || this.totalItems;
			return Math.ceil(totalItems / this.numCols);
		}
		sectionRenderer(section) {
			let secPages = this.grid.getPagesBySection(section);
			let hasSectionSpacers = false;
			let secItems = [];
			let items = [];
			let numCols = this.numCols || 1;

			let isSectionLoaded = true;
			for (let page of secPages) {
				if (!this.grid.pages[page]) {
					isSectionLoaded = false;
					continue;
				}
				// Flatten the results

				// for (let page in this.grid.pages) {
				for (let item of this.grid.pages[page]) {
					items.push({
						page: parseInt(page),
						item: item
					});
				}
				if (this.pagesPerSection && (page % this.pagesPerSection === 0)) {
					hasSectionSpacers = true;
					secItems.push(items);
					items = [];
				}
			}
			if (items.length) {
				secItems.push(items);
			}

			let sections = [];
			for (let secIdx in secItems) {
				let secNum = parseInt(secIdx) + 1;
				let items = secItems[secIdx];
				let itemIdx = 0;
				let columns = [];
				let colPageItems = [];
				let numRows = this.calculateNumRows(items.length);
				for (let row = 1; row <= numRows; row++) {
					for (let col = 1; col <= this.numCols; col++) {
						if (items[itemIdx]) {
							let item = items[itemIdx];
							if (!colPageItems[col - 1]) colPageItems[col - 1] = [];
							if (!colPageItems[col - 1][item.page - 1]) colPageItems[col - 1][item.page - 1] = [];
							colPageItems[col - 1][item.page - 1].push(this.itemRenderer(item.item, this.nextIdx));

						}
						else if (row === 1) {
							colPageItems[col - 1] = this.cellSpacerRenderer(itemIdx);
						}
						itemIdx++;
					}
				}

				for (let colIdx in colPageItems) {
					let colKey = parseInt(colIdx) + 1;
					let colItems = [];
					let totalColPageItems = Object.keys(colPageItems).length;
					let i = 1;
					for (let page in colPageItems[colIdx]) {

						if (!colPageItems[colIdx][page]) continue;

						let pageNum = parseInt(page) + 1;

						colItems.push(
							<_GridPage
								grid={this.grid}
								page={pageNum}
								pageKey={`col${parseInt(colIdx) + 1}_page${parseInt(page) + 1}`}
								section={section}
								key={`col${parseInt(colIdx) + 1}_page${parseInt(page) + 1}`}
							>
								{colPageItems[colIdx][page]}
							</_GridPage>
						);
						i++;
					}
					columns.push(
						<Container
							className="masonary-grid-col"
							key={`col${colKey}`}>
							{colItems}
							{(!isSectionLoaded) &&
								<Container
									className="masonary-grid-col-load"
									onObserveIntersection={this.handleLoadNext}
								>
									&nbsp;
								</Container>
							}
						</Container>
					);
				}
				return (
					<Container
						className="masonary-grid-section"
					>
						{columns}
					</Container>
				);
				return columns;
			}
		}


		render() {
			//this.hasRendered = true;
			// console.log(this.props);
			// trace(true);
			return (
				<Container
					//onWindowResize={this.handleWindowResize}
					onObserveResize={this.handleObserveResize}
					className="masonary-grid-cntr"
					ref={this.ref.cntr}
					style={{
						width: "100%"
					}}
				>
					<Container
						{...this.props}
						ref={this.ref.grid}
						className={this.props.className || "masonary-grid"}
					>
						<_GridLoader
							{...this.props}
							grid={this.grid}
							sectionRenderer={this.sectionRenderer}
							sectionSpacerRenderer={this.sectionSpacerRenderer}
							loadingIndicator={this.loadingIndicator}
						/>
						{/* <_GridSectionLoader
							grid={this.grid}
							section={this.grid.getSectionByPage(this.grid.initialPage)}
							loader={this.props.loader}
							sectionRenderer={this.sectionRenderer}
							sectionSpacerRenderer={this.sectionSpacerRenderer}
						/> */}

					</Container>
					{/* {!this.grid.isLoaded &&

						<ContainernNumCols
							className="masonary-grid-next-loader"
							onObserveIntersection={this.handleLoadNext}
						>

							{loadingNextControl}

						</Container>

					} */}
				</Container>
			);
		}
	}
));


export const DialogButtons = React.forwardRef((props, ref) => (
	<Element
		{...props}
		className={props.className || "dialog-buttons"}
		ref={ref}
	>
		{props.children}
	</Element>
));

export const Toolbar = React.forwardRef((props, ref) => (
	<Element
		{...props}
		className={props.className || "toolbar"}
		ref={ref}
	>
		{props.children}
	</Element>
));
export const Button = React.forwardRef((props, ref) => (
	<Element
		{...props}
		tag={props.tag || "button"}
		type={props.type || "button"}
		ref={ref}
	>
		{props.children}
	</Element>
));

class prosemirrorParser {
	constructor(document) {
		this.document = document;
		this._key = 1;
	}
	get nextKey() {
		return ++this._key;
	}
	toComponents() {
		return this._toComponents(this.document);
	}
	_toComponents(document) {
		let cpnts = [];
		if (document.content) {
			for (let node of document.content) {
				let cpnt = null;
				let tag = null;
				let props = {};
				if (!node.type) {
					console.error("Error parsing document. No type.");
					return null;
				}
				switch (node.type) {
					case "heading":
						tag = "h" + ((node.attrs.level) ? node.attrs.level : 2);
						break;
					case "paragraph":
						tag = "p";
						break;
					case "blockquote":
						tag = "blockquote";
						break;
					case "ordered_list":
						tag = "ol";
						props.type = (node.attrs.order) ? node.attrs.order : 1;
						break;
					case "bullet_list":
						tag = "ul";
						break;
					case "list_item":
						tag = "li";

						break;
					case "text":
						// cpnt = <fragment>
						// 	{node.text}
						// </fragment>;
						cpnt = node.text;
						break;

					case "image":
						if (!node.attrs.src) continue;
						cpnt = <img key={this.nextKey} src={node.attrs.src} />
						break;
					case "horizontal_rule":
						cpnt = <hr key={this.nextKey} />;
						break;
					default:
						console.log(node);
				}
				if (node.attrs && node.attrs.className) props.className = node.attrs.className;
				props.key = this.nextKey
				if (tag) cpnt = React.createElement(tag, props, this._toComponents(node));

				if (node.marks) {
					if (!cpnt) continue;
					// Component should be wrapped
					for (let mark of node.marks) {
						switch (mark.type) {
							case "strong":
								cpnt = <strong key={this.nextKey}>{cpnt}</strong>;
								break;
							case "em":
								cpnt = <em key={this.nextKey}>{cpnt}</em>;
								break;
							case "link":
								cpnt = <a target="_BLANK" href={mark.attrs.href} key={this.nextKey}>{cpnt}</a>;
								break;
						}
					}
				}

				if (cpnt) cpnts.push(cpnt);
			}

		}
		return cpnts;
	}
}

/* Document will show the value of a document saved with TextEditor / Prosemirror */
export const Document = React.forwardRef((props, ref) => {
	if (!props.document) throw ("Document element error. No document.");
	let docParser = new prosemirrorParser(props.document);
	let document = docParser.toComponents();
	return (
		<Element
			{...props}
			forwardRef={ref}
		>
			{document}
		</Element>
	);
});

class SlashrAnimationQueue {
	constructor() {
		//console.log("TODO: Add support for css transitions.");
		this._metadata = {
			queue: {},
			queueIdx: 0,
			isRunning: false,
			queueAddTimeout: null
		}
		this.totalFrames = 0;
	}
	get isRunning() {
		return this._metadata.isRunning;
	}
	get queue() {
		return this._metadata.queue
	}
	// onComplete(fn){
	// 	this._metadata.onComplete
	// }
	add(elmt, type, options) {
		if (options.queue) throw ("TODO: Add queues to slashrAnimation");
		for (let q in this._metadata.queue) {
			if (elmt.idx === this._metadata.queue[q].elmt.idx) {
				if (type === this._metadata.queue[q].type) {
					// Remove from queue
					delete this._metadata.queue[q];
				}
			}
		}
		this._metadata.queueIdx++;
		this._metadata.queue[this._metadata.queueIdx] = new SlashrAnimator(this._metadata.queueIdx, elmt, type, options);
		if (this._metadata.queueAddTimeout) return true;

		// Pause for a shor time to allow multiple animation calls to be queued
		if (!this.isRunning && !this._metadata.queueAddTimeout) this._metadata.queueAddTimeout = setTimeout(() => {
			if (!this.isRunning) this.run();
			this._metadata.queueAddTimeout = null;
		}, 5);
	}
	run() {
		this._metadata.isRunning = true;

		if (!Object.keys(this._metadata.queue).length) {
			this._metadata.isRunning = false;
			//console.log("Element Animtion Queue, Total Frames: ", this.totalFrames);
			this.totalFrames = 0;
			return;
		}

		for (let i in this._metadata.queue) {
			this._metadata.queue[i].run();
			if (this._metadata.queue[i] && this._metadata.queue[i].isComplete) delete this._metadata.queue[i];
		}

		this.totalFrames++;

		// TODO: test for css transitions
		window.requestAnimationFrame(() => { this.run(); });

		// if (this._metadata.isComplete) {
		// 	if (this._metadata.queue) {
		// 		// TODO: Should this work like this?
		// 		//Slashr.getInstance().portal._nextElementQueue(this._metadata.eIdx, this._metadata.queue);
		// 	}
		// 	return;
		// }
		// if (this._metadata.isStarted === false) {
		// 	this._metadata.startTime = this.getTime();
		// 	this._metadata.isStarted = true;
		// }
		// else this._metadata.currTime = this.getTime() - this._metadata.startTime;

		// this._animate();

		// let self = this;
		// if (!this._metadata.isCssTransition) requestAnimationFrame(function () { self.run(); });


	}
}

export class SlashrAnimator {
	constructor(idx, elmt, type, options) {
		options = (!options) ? {} : options;
		// Get the default options
		// Remove defaults from options
		// if("duration" in options) delete options.duration;
		// if("queue" in options) delete options.queue;
		// if("value" in options) delete options.value;
		this._metadata = {
			idx: idx,
			elmt: elmt,
			node: elmt.ref.current,
			type: type,
			duration: (options.duration) ? options.duration : 250,
			easing: (options.easing) ? options.easing : "easeInOutQuad",
			value: (options.value) ? options.value : null,
			toggled: (options.toggled) ? true : false,
			state: null,
			prevState: null,
			startTime: 0.0,
			currTime: 0.0,
			isComplete: false,
			isStarted: false,
			isInitialized: false,
			// eIdx : eIdx,
			queue: (options.queue) ? options.queue : false,
			options: options
		};

		switch (type) {
			// case Slashr.ROTATE:
			// 	this._metadata.angle = options.angle;
			// 	this._metadata.startAngle = 0;
			// 	this._metadata.currAngle = 0;


			// 	var tr = Slashr.utils.dom.getComputedStyle(this._metadata.node, "transform");
			// 	// var trInfo = Slashr.utils.dom.getTransformInfo(this._metadata.node);

			// 	if (tr !== false) {
			// 		var values = tr.split('(')[1];
			// 		if (values) {
			// 			values = values.split(')')[0];
			// 			values = values.split(',');
			// 			// arc sin, convert from radians to degrees, round
			// 			//					var scale = Math.sqrt(values[0]*values[0] + values[1]*values[1]);
			// 			//					var sin = b/scale;
			// 			// next line works for 30deg but not 130deg (returns 50);
			// 			// var angle = Math.round(Math.asin(sin) * (180/Math.PI));
			// 			this._metadata.startAngle = this._metadata.currAngle = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
			// 		}
			// 		else this._metadata.startAngle = this._metadata.currAngle = 0;
			// 		this._metadata.range = (this._metadata.currAngle * -1) + this._metadata.angle;
			// 	}
			// 	else {

			// 	}

			// 	break;
			// case Slashr.REPLACE_CLASS:
			// 	this._metadata.newClass = options.newClass;
			// 	this._metadata.oldClass = options.oldClass;
			// 	this._metadata.isCssTransition = true;
			// 	break;
			// case Slashr.FADE_TO:
			// 	this._metadata.fromOpacity = parseFloat(window.getComputedStyle(this._metadata.node, null).opacity || 1);
			// 	this._metadata.toOpacity = parseFloat(options.opacity);
			// 	break;
			case Slashr.TRANSITION:
				let fromStyle = null;
				let toStyle = null;
				let toggled = options.toggled;
				if (!options.entering) throw ("Element Transition Error: No entered transition found");
				if (!options.exiting) throw ("Element Transition Error: No exiting transition found");

				if (toggled) {
					toStyle = options.entering;
					fromStyle = options.enter || {};
					this._updateElmtAnimationState("enter");
				}
				else {
					// Let's just treat this as a exited transition
					// if (options.isInitial) {
					// 	//console.log("TODO: make sure it doesn't still ruhn the animation");
					// 	if (options.exited) {
					// 		this.elmt.addStyle(options.exited);
					// 	}
					// 	return false;
					// }

					toStyle = options.exiting;
					fromStyle = options.exit || {};
					this._updateElmtAnimationState("exit");
				}
				// Would be differant for native

				this.elmt.addStyle(fromStyle);

				this._initAnimateProps(fromStyle, toStyle);
				break;
			case Slashr.ANIMATE:
				if (options.to && options.from) {
					this.elmt.addStyle(options.from);
					this._initAnimateProps(options.from, options.to);
				}
				else if (options.to) {
					this._initAnimateProps(options.to);
				}
				else if (options.from) throw ("Element Animation Error: Must supply to with from");
				else this._initAnimateProps(options);

				break;
		}
	}

	get elmt() {
		return this._metadata.elmt;
	}
	get type() {
		return this._metadata.type;
	}
	get node() {
		return this._metadata.node;
	}
	get toggled() {
		return this._metadata.toggled;
	}

	_initAnimateProps(fromStyle, toStyle = null) {
		if (!toStyle) {
			toStyle = fromStyle;
			fromStyle = this.elmt.style;
		}
		let animateProps = toStyle;

		// Set the display value
		// TODO: For native this will work differant

		if (animateProps.display && fromStyle.display !== animateProps.display) this.elmt.addStyle("display", animateProps.display);
		//else if(fromStyle.display && this.elmt.style.display !== fromStyle.display) this.elmt.addStyle("display", fromStyle.display);

		// else if(fromStyle.display !== animateProps.display) this.elmt.addStyle(prop, animateProps[prop]);


		this._metadata.props = {};
		for (let prop in animateProps) {

			let props = {};
			let isTransform = false;

			//if(prop === "display") console.log("element trans display",animateProps.display,fromStyle.display);

			if (prop === "transform") {
				isTransform = true;
				props = animateProps[prop];
			}
			else if (prop === "display") continue;
			// else if (prop === "display" && fromStyle.display !== animateProps[prop]) {
			// 	this.elmt.addNativeStyle(prop, animateProps[prop]);
			// }
			else {
				props[prop] = animateProps[prop];
			}

			for (let p in props) {
				if (p === "duration" || p === "queue" || p === "easing" || p === "value" || p === "isInitial") continue;

				let unit = Slashr.utils.dom.getPropertyUnitByValue(props[p]);
				this._metadata.props[p] = {
					unit: unit
				};

				if (isTransform) {
					if (p === "origin") continue;
					this._metadata.props[p].isTransform = true;
				}

				if (!this._metadata.node) continue;
				// Standard Prop like domElmnt.prop, etc...
				if (!isTransform && this._metadata.node[p] !== undefined) {
					this._metadata.props[p].from = this._metadata.node[p];
					this._metadata.props[p].to = props[p];
				}
				else {
					// Check the current element style
					let elmtVal = null;
					if (isTransform) {
						if (!fromStyle.transform || !p in fromStyle.transform) throw (`Element Error. Unable to animate element, initial style prop transform.${p} is not set.`);
						elmtVal = fromStyle.transform[p];
					}
					else {
						if (!p in fromStyle) {
							throw (`Element Error. Unable to animate element, initial style prop ${p} is not set.`);
						}
						elmtVal = fromStyle[p];
					}

					let elmtUnit = unit = Slashr.utils.dom.getPropertyUnitByValue(elmtVal);


					if (unit !== elmtUnit) throw (`Element Error: Unable to animate element prop ${p}, unit mismatch`);

					this._metadata.props[p].to = (unit) ? Slashr.utils.dom.stripPropertyValueUnit(props[p]) : props[p];
					this._metadata.props[p].from = (unit) ? Slashr.utils.dom.stripPropertyValueUnit(elmtVal) : elmtVal;



					// Calculate from calculateStyles, Depreciated...
					// this._metadata.props[p].from = Slashr.utils.dom.getPropertyValueByUnit(unit, this._metadata.node, p),
					// this._metadata.props[p].to = Slashr.utils.dom.stripPropertyValueUnit(props[p]);
				}
				this._metadata.props[p].range = Math.abs(this._metadata.props[p].to - this._metadata.props[p].from);
			}
		}
	}
	// Returns an updated style
	_animateProps(pct) {
		this._metadata.isInitialized = true;
		let nProps = {};
		for (let prop in this._metadata.props) {
			let value = false;
			// calculate the diff of to and from, multiply by percent, add to from
			if (this._metadata.isComplete) {
				value = this._metadata.props[prop].to;
			}
			else {
				value = (this._metadata.props[prop].to > this._metadata.props[prop].from) ?
					(this._metadata.props[prop].from + (this._metadata.props[prop].range * pct)) :
					(this._metadata.props[prop].from - (this._metadata.props[prop].range * pct));
			}
			if (value !== false) {
				let val = value + ((this._metadata.props[prop].unit) ? this._metadata.props[prop].unit : "");
				if (!this._metadata.props[prop].isTransform && this._metadata.node && this._metadata.node[prop] !== undefined) this._metadata.node[prop] = val;
				else {
					if (this._metadata.props[prop].isTransform) {
						if (!nProps.transform) nProps.transform = {};
						nProps.transform[prop] = val;
					}
					else {
						nProps[prop] = val;
					}
				}
			}
		}
		this._metadata.elmt.addStyle(nProps);
	}

	_updateElmtAnimationState(state, isComplete = false) {
		if (state != this._metadata.prevState) {
			this.elmt.updateAnimationState(this.type, state, isComplete);
			this._metadata.prevState = state;
		}
	}

	get isComplete() {
		return this._metadata.isComplete;
	}

	_animate() {
		let tStyle = {};
		//		if(this._metadata.isCssTransition){
		//			let oldTransition = this._metadata.node.style.transition || "";
		//			setTimeout(function(){
		//				this._metadata.node.style.transition = oldTransition;
		//				this._metadata.isComplete = true;
		//				this.run();
		//			}.bind(this), this._metadata.duration);
		//		}
		let t = this._metadata.currTime / this._metadata.duration;
		if (t >= 1) {
			this._metadata.isComplete = true;
		}

		let pct = (this._metadata.isComplete) ? 1 : this.calculateEase(this._metadata.easing, t);

		switch (this._metadata.type) {
			case Slashr.ANIMATE:
				this._animateProps(pct);
				break;
			case Slashr.FADE_IN:
				this._metadata.isInitialized = true;
				tStyle.opacity = pct;
				if (this._metadata.isComplete) {
					tStyle.opacity = 1;
				}
				if (this._metadata.currTime == 0) {
					tStyle.display = "block";
					//this._metadata.elmt.addNativeStyle("display", "block");
				}
				this._metadata.elmt.addStyle(tStyle);
				break;
			case Slashr.FADE_OUT:
				this._metadata.isInitialized = true;
				tStyle.opacity = 1.0 - (pct);
				if (this._metadata.isComplete) {
					tStyle.opacity = 0;
					tStyle.display = "none";
				}
				if (this._metadata.currTime == 0) {
					tStyle.display = "block";
					//this._metadata.elmt.addStyle("display", "block");
					//this._metadata.elmt.addNativeStyle("display", "block");
				}
				this._metadata.elmt.addStyle(tStyle);
				break;
			case Slashr.TRANSITION:
				this._metadata.isInitialized = true;
				// tStyle.opacity = pct;

				if (!this._metadata.isComplete) {
					this._updateElmtAnimationState((this.toggled) ? "entering" : "exiting");
				}

				this._animateProps(pct);

				if (this._metadata.isComplete) {
					if (this.toggled) {
						// this.elmt.addStyle(this._metadata.options.entering);
						if (this._metadata.options.entered) {
							//this.elmt.addNativeStyle(this._metadata.options.entered);
							this.elmt.addStyle(this._metadata.options.entered);
							this._updateElmtAnimationState("entered", true);
							this._metadata.transition
						}
					}
					else {
						if (this._metadata.options.exited) {
							//this.elmt.addNativeStyle(this._metadata.options.exited);
							this.elmt.addStyle(this._metadata.options.exited);
							this._updateElmtAnimationState("exited", true);
						}
					}
				}

				break;
			// case Slashr.FADE_OUT:
			// 	this._metadata.isInitialized = true;
			// 	tStyle.opacity = 1.0 - (pct);
			// 	if (this._metadata.isComplete) {
			// 		tStyle.opacity = 0;
			// 		this._metadata.node.style.display = "none";
			// 	}
			// 	this._metadata.node.style.opacity = tStyle.opacity;
			// 	break;
			// case Slashr.FADE_TO:
			// 	this._metadata.isInitialized = true;
			// 	let currOpacity = window.getComputedStyle(this._metadata.node, null).opacity;
			// 	if (this._metadata.toOpacity == this._metadata.fromOpacity) {
			// 		this._metadata.isComplete = true;
			// 	}
			// 	else if (this._metadata.toOpacity > this._metadata.fromOpacity) {
			// 		tStyle.opacity = this._metadata.fromOpacity + (pct);
			// 		if (this._metadata.isComplete) {
			// 			tStyle.opacity = this._metadata.toOpacity;
			// 		}
			// 	}
			// 	else if (this._metadata.toOpacity < this._metadata.fromOpacity) {
			// 		tStyle.opacity = this._metadata.fromOpacity - (pct);
			// 		if (this._metadata.isComplete) {
			// 			tStyle.opacity = this._metadata.toOpacity;
			// 		}
			// 	}
			// 	this._metadata.node.style.opacity = tStyle.opacity;
			// 	break;
			// case Slashr.ROTATE:
			// 	let step = this._metadata.range * pct;
			// 	let nAngle = this._metadata.currAngle + step;
			// 	if (this._metadata.isComplete) nAngle = this._metadata.angle;
			// 	this._metadata.node.style.transform = "rotate(" + nAngle + "deg)";
			// 	break;
			// case Slashr.SCROLL_TO:
			// 	throw ("SDLKFJFH");
			// 	// let step = this._metadata.range * pct;
			// 	// let nAngle = this._metadata.currAngle + step;
			// 	// if(this._metadata.isComplete) nAngle = this._metadata.angle;
			// 	// this._metadata.node.style.transform = "rotate("+nAngle+"deg)";
			// 	break;
			// case Slashr.DELAY:
			// 	// Wait for complete
			// 	break;
			// case Slashr.REPLACE_CLASS:
			// 	throw ("TODO ADD REPLACE CLASS ANIMATION??");
			// 	console.log(this._metadata.node.style.transition);
			// 	if (this._metadata.node.style.transition) this._metadata.node.style.transition += ",all " + this._metadata.duration + "ms ease";
			// 	else this._metadata.node.style.transition += "all " + this._metadata.duration + "ms ease";

			// 	console.log(this._metadata.node.style.transition);


			// 	if (this._metadata.node.classList.replace) this._metadata.node.classList.replace(this._metadata.oldClass.trim(), this._metadata.newClass.trim());
			// 	else {
			// 		this._metadata.node.classList.add(this._metadata.newClass.trim());
			// 		this._metadata.node.classList.remove(this._metadata.oldClass.trim());
			// 	}

			// 	break;
			default:
				throw ("Animation type not found: " + this._metadata.type);
		}
	}
	calculateEase(name, t) {
		let fn = {
			// no easing, no acceleration
			linear: function (t) { return t },
			// accelerating from zero velocity
			easeInQuad: function (t) { return t * t },
			// decelerating to zero velocity
			easeOutQuad: function (t) { return t * (2 - t) },
			// acceleration until halfway, then deceleration
			easeInOutQuad: function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t },
			// accelerating from zero velocity 
			easeInCubic: function (t) { return t * t * t },
			// decelerating to zero velocity 
			easeOutCubic: function (t) { return (--t) * t * t + 1 },
			// acceleration until halfway, then deceleration 
			easeInOutCubic: function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 },
			// accelerating from zero velocity 
			easeInQuart: function (t) { return t * t * t * t },
			// decelerating to zero velocity 
			easeOutQuart: function (t) { return 1 - (--t) * t * t * t },
			// acceleration until halfway, then deceleration
			easeInOutQuart: function (t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t },
			// accelerating from zero velocity
			easeInQuint: function (t) { return t * t * t * t * t },
			// decelerating to zero velocity
			easeOutQuint: function (t) { return 1 + (--t) * t * t * t * t },
			// acceleration until halfway, then deceleration 
			easeInOutQuint: function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t }
		};
		if (!fn[name]) name = "linear";
		return fn[name](t);
	}
	run() {
		if (this._metadata.isComplete) {
			return false;
		}
		if (this._metadata.isStarted === false) {
			this._metadata.startTime = this.getTime();
			this._metadata.isStarted = true;
		}
		else this._metadata.currTime = this.getTime() - this._metadata.startTime;

		this._animate();

		return true;
	}
	getTime() {
		let t = null;
		if (window.performance && window.performance.now) t = performance.now();
		else if (Date.now) t = Date.now();
		else t = new Date().getTime();
		return t;
	}
};
export class SlashrUtils {
	constructor() {
		this.dom = new SlashrDomUtils();
		this.core = new SlashrCoreUtils();
		this.date = new SlashrDateUtils();
		this.array = new SlashrArrayUtils();
		this.string = this.str = new SlashrStringUtils();
	}
}
export class SlashrDateUtils {
	LABEL_TYPE_SHORT = "short"
	LABEL_TYPE_ABBREVIATED = "abbrv"
	LABEL_TYPE_SINGLE_LETTER = "letter"
	_monthLabels = ["january", "febuary", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
	_monthLabelsShort = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
	_dayLabels = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
	_dayLabelsShort = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
	_dayLabelsAbbrv = ["su", "mo", "tu", "we", "th", "fr", "sa"];
	_dayLabelsSingleLetter = ["s", "m", "t", "w", "t", "f", "s"];

	toShortDate(date) {
		return (date.getMonth() + 1) +
			"/" + date.getDate() +
			"/" + date.getFullYear();
	}
	getDayLabel(day, type) {
		let ret = "";
		if (day instanceof Date) day = day.getDay();
		else if (day < 0 || day > 6) return null;
		switch (type) {
			case this.LABEL_TYPE_SHORT:
				ret = this._dayLabelsShort[day];
				break;
			case this.LABEL_TYPE_ABBREVIATED:
				ret = this._dayLabelsAbbrv[day];
				break;
			case this.LABEL_TYPE_LETTER:
				ret = this._dayLabelsSingleLetter[day];
				break;
			default:
				ret = this._dayLabels[day];
		}
		return ret;
	}
	getMonthLabel(month, type) {
		let ret = "";
		if (month instanceof Date) month = month.getMonth();
		else if (month < 0 || month > 11) return null;
		switch (type) {
			case this.LABEL_TYPE_SHORT:
				ret = this._monthLabelsShort[month];
				break;
			default:
				ret = this._monthLabels[month];
		}
		return ret;
	}
	areDatesSameDay(d1, d2) {
		return d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate();
	}
	areDatesSameMonth(d1, d2) {
		return d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth();
	}
}
export class SlashrCoreUtils {
	// Utils
	arePropsEqual(prop1, prop2, maxDepth, _depth = 0) {
		// Check for non objects
		if (prop1 === prop2) return true;
		//else if(typeof prop1 !== 'object' && typeof prop2 !== 'object') return false;

		if (typeof prop1 !== 'object' || prop1 === null ||
			typeof prop2 !== 'object' || prop2 === null) return false;

		var keys1 = Object.keys(prop1);
		var keys2 = Object.keys(prop2);

		if (keys1.length !== keys2.length) return false;

		// Test for A's keys different from B.
		var bHasOwnProperty = hasOwnProperty.bind(prop2);
		for (var i = 0; i < keys1.length; i++) {
			//! bHasOwnProperty(keys1[i]) || 
			if ((!maxDepth || _depth < maxDepth) && typeof prop1[keys1[i]] === "object" && typeof prop2[keys1[i]] === "object") {
				if (!this.arePropsEqual(prop1[keys1[i]], prop2[keys1[i]], maxDepth, _depth + 1)) return false;
			}
			else if (prop1[keys1[i]] !== prop2[keys1[i]]) return false;
		}
		return true;
	}
	getFunctionArgumentNames(func) {
		let STRIP_COMMENTS = /(\/\/.*)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
		let ARGUMENT_NAMES = /([^\s,]+)/g;
		let fnStr = func.toString().replace(STRIP_COMMENTS, '');
		let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
		return result || [];
	}
	getMethodArgumentNames(classObj, methodName) {
		return this.getFunctionArgumentNames(classObj[methodName]);
	}
}
export class SlashrArrayUtils {
	unique(arr) {
		return [...new Set(arr)];
	}
}
export class SlashrDomUtils {
	hyphenateCssProp(property) {
		return property.replace(/([a-z])([A-Z])/, function (a, b, c) {
			return b + "-" + c.toLowerCase();
		});
	}
	getComputedStyle(node, property) {
		if (window.getComputedStyle) {
			property = this.hyphenateCssProp(property);
			return window.getComputedStyle(node, null).getPropertyValue(property);
		}
		else if (node.currentStyle) {
			return node.currentStyle[property];
		}
		return node.style[property];
	}
	getTransformInfo(node) {
		var matrix = this.parseMatrix(getComputedStyle(node, null).transform),
			rotateY = Math.asin(-matrix.m13),
			rotateX,
			rotateZ;

		if (Math.cos(rotateY) !== 0) {
			rotateX = Math.atan2(matrix.m23, matrix.m33);
			rotateZ = Math.atan2(matrix.m12, matrix.m11);
		} else {
			rotateX = Math.atan2(-matrix.m31, matrix.m22);
			rotateZ = 0;
		}
		return {
			rotate: { x: rotateX, y: rotateY, z: rotateZ },
			translate: { x: matrix.m41, y: matrix.m42, z: matrix.m43 }
		}
	}
	parseMatrix(matrixString) {
		var c = matrixString.split(/\s*[(),]\s*/).slice(1, -1),
			matrix;

		if (c.length === 6) {
			// 'matrix()' (3x2)
			matrix = {
				m11: +c[0], m21: +c[2], m31: 0, m41: +c[4],
				m12: +c[1], m22: +c[3], m32: 0, m42: +c[5],
				m13: 0, m23: 0, m33: 1, m43: 0,
				m14: 0, m24: 0, m34: 0, m44: 1
			};
		} else if (c.length === 16) {
			// matrix3d() (4x4)
			matrix = {
				m11: +c[0], m21: +c[4], m31: +c[8], m41: +c[12],
				m12: +c[1], m22: +c[5], m32: +c[9], m42: +c[13],
				m13: +c[2], m23: +c[6], m33: +c[10], m43: +c[14],
				m14: +c[3], m24: +c[7], m34: +c[11], m44: +c[15]
			};

		} else {
			// handle 'none' or invalid values.
			matrix = {
				m11: 1, m21: 0, m31: 0, m41: 0,
				m12: 0, m22: 1, m32: 0, m42: 0,
				m13: 0, m23: 0, m33: 1, m43: 0,
				m14: 0, m24: 0, m34: 0, m44: 1
			};
		}
		return matrix;
	}
	getPropertyUnitMap() {
		return {
			pixel: "px",
			percent: "%",
			inch: "in",
			cm: "cm",
			mm: "mm",
			point: "pt",
			pica: "pc",
			em: "em",
			ex: "ex"
		};
	}
	getPropertyUnitMapIdx(unit, map) {
		let unitIdx = null;
		map = map || this.getPropertyUnitMap();
		if (map[unit]) unitIdx = unit;
		else {
			for (let item in map) {
				if (map[item] == unit) {
					unitIdx = item;
					break;
				}
			}
		}
		if (!unitIdx) throw new frak("getPropertyUnitMapIdx: Unit idx not found");
		return unitIdx;
	}
	stripPropertyValueUnit(value) {
		if (!isNaN(value)) return parseFloat(value[0]);
		value = value.match(/[-]{0,1}[\d]*[\.]{0,1}[\d]+/g);
		return (value === null) ? null : parseFloat(value[0]);
	}
	getPropertyUnitByValue(value) {
		if (!isNaN(value)) return null;
		value = value.match(/\D+$/);
		if (value === null) return this.getPropertyUnitMap().pixel;
		value = value[0];
		if (value.endsWith && value.endsWith(")")) value = value.substring(0, value.length - 1);
		return (value === null) ? this.getPropertyUnitMap().pixel : value;
	}
	getPropertyValueByUnit(unit, target, property) {
		unit = this.getPropertyUnitMapIdx(unit);
		let ret = this.getPropertyUnitValues(target, property, unit);
		return ret[unit];
	}
	getPropertyUnitValues(target, property, unit) {
		let baseline = 100;  // any number serves 
		let item;  // generic iterator

		let map = this.getPropertyUnitMap();

		let factors = {};
		let units = {};

		let value = target[property] || this.getComputedStyle(target, property);

		let numeric = this.stripPropertyValueUnit(value);
		if (numeric === null) throw new frak("getPropertyUnitValues: Invalid property value returned");
		let computedUnit = this.getPropertyUnitByValue(value);

		let currUnit;
		for (item in map) {
			if (map[item] == computedUnit) {
				currUnit = item;
				break;
			}
		}
		if (!currUnit) throw new frak("getPropertyUnitValues: Computed unit not found");

		if (unit) {
			// Convert unit to a map idx
			unit = this.getPropertyUnitMapIdx(unit, map);
			let tMap = {};
			tMap[currUnit] = map[currUnit];
			tMap[unit] = map[unit];
			map = tMap;
		}

		let temp = document.createElement("div");
		temp.style.overflow = "hidden";
		temp.style.visibility = "hidden";
		target.parentElement.appendChild(temp);
		for (item in map) {
			temp.style.width = baseline + map[item];
			factors[item] = baseline / temp.offsetWidth;
		}
		for (item in map) {
			units[item] = numeric * (factors[item] * factors[currUnit]);
		}
		target.parentElement.removeChild(temp);

		return units;
	}
	// styles: element style object 
	// returns a standard javascript style object
	parseElementStyle(styles) {
		let hasTransforms = false;
		let transforms = {};
		let transform = null;

		if (styles.transform) {
			if (typeof styles.transform === "string") throw ("TODO: Allow transform strings in element reactStyle");

			// Check for specific transform options
			if (styles.transform.origin) {
				styles.transformOrigin = styles.transform.origin;
				delete styles.transform.origin;
			}
			styles.transform = this.renderElementTransformStyle(styles.transform);
		}
		return styles;
	}
	renderElementTransformStyle(transforms) {
		let transformArr = [];
		for (let p in transforms) {
			switch (p) {
				case "scale":
				case "translate":
					let rProps = null;
					if (Array.isArray(transforms)) {
						if (transforms.length < 2 || transforms[0] === null || transforms[1] === null) throw ("Element Error: Transform array must be [x,y,z,...]");
						if (transforms[0] === null || transforms[1] === null) throw ("Element Error: Transforms array cannot have null values.");
						transformArr.push(`${p}(${transforms[p].join(",")})`);
					}
					else if (typeof transforms[p] === 'object') {
						if (transforms[p].x === undefined || transforms[p].x === null) throw ("Element Error: Transform must have an x and y");
						if (transforms[p].y === undefined || transforms[p].y === null) throw ("Element Error: Transform must have an x and y");
						let pArr = [transforms[p].x, transforms[p].y];
						if (transforms[p].y) pArr.push(transforms[p].y);
						transformArr.push(`${p}(${pArr[p].join(",")})`);
					}
					else {
						transformArr.push(`${p}(${transforms[p]})`);
					}
					break;
				default:
					transformArr.push(`${p}(${transforms[p]})`);
			}
		}
		return (transformArr.length) ? transformArr.join(" ") : null;
	}
	offset(elmt) {
		var rect = elmt.getBoundingClientRect(),
			scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
			scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
	}
	scrollPosition() {
		return {
			top: window.pageYOffset || document.documentElement.scrollTop,
			left: window.pageXOffset || document.documentElement.scrollLeft
		};
	}
	scrollTop(top = 0) {
		this.scrollTo(0, top);
	}
	scrollTo(left, top, options = {}) {
		let isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;
		if (isSmoothScrollSupported) {
			let scrollOpts = {
				left: left,
				top: top
			};
			if (options.behavior) scrollOpts.behavior = options.behavior;
			window.scrollTo(scrollOpts);
		}
		else window.scrollTo(left, top);
	}
	scrollToElement(elmt, options = {}) {
		if (!elmt) return false;
		let offset = {
			top: options.top || null,
			left: options.left || null
		};
		if (offset.top === null || offset.left === null) {
			let calcOffset = this.offset(elmt);
			if (offset.top === null) offset.top = calcOffset.top;
			if (offset.left === null) offset.left = calcOffset.left;
		}
		if (options.offsetTop) offset.top -= options.offsetTop;
		this.scrollTo(offset.left, offset.top);
	}
	getBodyWidth() {
		var body = document.body;
		var html = document.documentElement;
		return Math.max(body.scrollWidth, body.offsetWidth, body.getBoundingClientRect().width, html.clientWidth, html.scrollWidth, html.offsetWidth);
	}
	getBodyHeight() {
		var body = document.body;
		var html = document.documentElement;
		return Math.max(body.scrollHeight, body.offsetHeight, body.getBoundingClientRect().height, html.clientHeight, html.scrollHeight, html.offsetHeight);
	}
	getBodySize() {
		return {
			x: this.getBodyWidth(),
			y: this.getBodyHeight()
		};
	}
}
export class SlashrStringUtils {
	slugify(txt) {
		return txt.toString().trim().toLowerCase()
			.replace(/\s+/g, '-')           // Replace spaces with -
			.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
			.replace(/\-\-+/g, '-')         // Replace multiple - with single -
			.replace(/^-+/, '')             // Trim - from start of text
			.replace(/-+$/, '');            // Trim - from end of text
	}
	capitalize(w) {
		return w.replace(/^\w/, w => w.toUpperCase());
	}
	renderSocialText(text, tagRenderer) {
		if (!text) return text;
		if (text.indexOf("@[") === -1) return text;
		let regex = /@\[([a-z\d_]+):([a-z\d_ ]+):([a-z\d_-]+)\]/ig;
		// text = reactStringReplace(text, regex, (match, i) => {
		// 	console.log("mention",match,i);
		// });
		let tags = text.match(regex);
		if (!tags || !tags.length) return text;
		let mentions = [];
		if (tags && tags.length) {
			tags.forEach((val) => {
				let idx = 0;
				let tagInfo = val.match(/@\[([a-z\d_]+):([a-z\d_ ]+):([a-z\d_-]+)\]/i);
				if (tagInfo.length < 4) return;
				let tag = {
					match: tagInfo[0],
					type: tagInfo[1],
					label: tagInfo[2],
					value: tagInfo[3]
				};
				// console.log("RENDER TAG match",tag.label, i);
				text = text.replace(tag.match, () => {
					return tagRenderer(tag.type, tag.value, tag.label, ++idx);
				});
			});
		}
		return text;
	}
}
export class frak {
	constructor(err) {
		throw (err);
	}
}
export default Slashr.getInstance();