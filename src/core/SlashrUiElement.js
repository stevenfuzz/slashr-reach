import React from 'react';
import { toJS, decorate, observable, action } from "mobx";
import {SlashrUtils} from '../Utils';

const utils = new SlashrUtils();

export class SlashrUiElement {
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
		this._handleFocus = this._handleFocus.bind(this);
		this._handleBlur = this._handleBlur.bind(this);
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
	// 		if (!utils.core.arePropsEqual(props[prop], nextProps[prop])) return true;
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
			if (!utils.core.arePropsEqual(props[prop], nextProps[prop])) {

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
			if (!utils.core.arePropsEqual(props[prop], this._stateProps[prop])) {
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
						val = (val.length > 1) ? utils.array.unique(val) : val;
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
		if (props.style && !utils.core.arePropsEqual(props.style, this._stateProps.style)) {
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
		//if(doUpdateState) this.handleReact(props);
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
		if (props.transition && "transitionToggle" in props) {
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
		this.setStyle(styles);
		return this;
	}
	setStyle(styles){
		this._stateVars.style = styles;
		return this;
	}
	get nativeStyle() {
		if (!this.ref || !this.ref.current) throw ("Element Error: Ref does not exist");
		return this.ref.current.style;
	}
	get reactStyle() {
		// Check for transforms

		let styles = utils.dom.parseElementStyle(toJS(this.style));
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
		if (!animationState) return false;
		if (this.props.onTransition && animationState.transition && animationState.transition.states) {
			for (let state in animationState.transition.states) {
				if (animationState.transition.states[state]) {
					this.props.onTransition(state);
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
		this.setClassNames(classNames);
	}
	setClassNames(classNames){
		this._stateProps.classNames = utils.array.unique(classNames);
	}
	// set addClassName(className) {
	// 	if (this._stateProps.classNames.indexOf(className) === -1) this._stateProps.classNames.push(className);
	// }

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
			nStyles = utils.dom.parseElementStyle(nStyles);
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
	_handleBlur(e) {
		if (this.props.onBlur) this.props.onBlur(e);
	}
	_handleFocus(e) {
		if (this.props.onFocus) this.props.onFocus(e);
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
		if (this.props.onBlur) this._metadata.eventHandlers.onBlur = this._handleBlur;
		if (this.props.onFocus) this._metadata.eventHandlers.onFocus = this._handleFocus;
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
	_stateVars: observable,
	init: action,
	setStyle: action,
	setClassNames: action,
	handleUpdate: action,
	_updateProps: action,
	_updateStyleProps: action
});

