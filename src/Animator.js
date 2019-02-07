import {ANIMATE, FADE_IN, FADE_OUT, TRANSITION} from './core/SlashrConstants';

export class SlashrAnimationQueue {
	constructor(slashr) {
		//console.log("TODO: Add support for css transitions.");
		this._metadata = {
			queue: {},
			queueIdx: 0,
			isRunning: false,
			queueAddTimeout: null
		}
		this._slashr = slashr;
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
		this._metadata.queue[this._metadata.queueIdx] = new SlashrAnimator(this._slashr, this._metadata.queueIdx, elmt, type, options);
		if (this._metadata.queueAddTimeout) return true;

		// Pause for a shor time to allow multiple animation calls to be queued
		if (!this.isRunning && !this._metadata.queueAddTimeout) this._metadata.queueAddTimeout = setTimeout(() => {
			if (!this.isRunning) this.run();
			this._metadata.queueAddTimeout = null;
		}, 5);
	}

	run_new(){
		console.log("run() SlashrAnimationQueue",this._metadata.queue);
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

		this._metadata.isRunning = false;
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
		// 		//this._slashr.getInstance().portal._nextElementQueue(this._metadata.eIdx, this._metadata.queue);
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
	constructor(slashr, idx, elmt, type, options) {
		options = (!options) ? {} : options;
		this._slashr = slashr;
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
			// case this._slashr.ROTATE:
			// 	this._metadata.angle = options.angle;
			// 	this._metadata.startAngle = 0;
			// 	this._metadata.currAngle = 0;


			// 	var tr = this._slashr.utils.dom.getComputedStyle(this._metadata.node, "transform");
			// 	// var trInfo = this._slashr.utils.dom.getTransformInfo(this._metadata.node);

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
			// case this._slashr.REPLACE_CLASS:
			// 	this._metadata.newClass = options.newClass;
			// 	this._metadata.oldClass = options.oldClass;
			// 	this._metadata.isCssTransition = true;
			// 	break;
			// case this._slashr.FADE_TO:
			// 	this._metadata.fromOpacity = parseFloat(window.getComputedStyle(this._metadata.node, null).opacity || 1);
			// 	this._metadata.toOpacity = parseFloat(options.opacity);
			// 	break;
			case TRANSITION:
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
			case ANIMATE:
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

				let unit = this._slashr.utils.dom.getPropertyUnitByValue(props[p]);
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

					let elmtUnit = unit = this._slashr.utils.dom.getPropertyUnitByValue(elmtVal);


					if (unit !== elmtUnit) throw (`Element Error: Unable to animate element prop ${p}, unit mismatch`);

					this._metadata.props[p].to = (unit) ? this._slashr.utils.dom.stripPropertyValueUnit(props[p]) : props[p];
					this._metadata.props[p].from = (unit) ? this._slashr.utils.dom.stripPropertyValueUnit(elmtVal) : elmtVal;



					// Calculate from calculateStyles, Depreciated...
					// this._metadata.props[p].from = this._slashr.utils.dom.getPropertyValueByUnit(unit, this._metadata.node, p),
					// this._metadata.props[p].to = this._slashr.utils.dom.stripPropertyValueUnit(props[p]);
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
			this.elmt._triggerAnimationEvents();
		}
	}

	get isComplete() {
		return this._metadata.isComplete;
	}
	_animate_new(){
		console.log(this._metadata);
		let tStyle = {};
		this._metadata.duration = 3000;

		

		switch (this._metadata.type) {
			case FADE_IN:

				let animation = `
@keyframes ButtonIconActive {
	0% {
	  transform: scale(.5);
	  opacity: 0; }
	80% {
	  transform: scale(1.5);
	  opacity: .2; }
	99% {
	  opacity: 0; }
	100% {
	  display: none; } 	
}
				`;
				tStyle = {
					opacity: 0,
					display: "block",
					
				}
				console.log("fade in style",tStyle);
				this._metadata.elmt.addStyle(tStyle);
				
				setTimeout(()=>{
					tStyle = {
						opacity: 1,
						
						transition: `opacity ${this._metadata.duration}ms ease-out`
					}
					this._metadata.elmt.addStyle(tStyle);
				}, 1)
				
				this._metadata.isComplete = true;
			break;
			case FADE_OUT:
				tStyle = {
					opacity: 1,
					display: "block",
					transition: `opacity ${this._metadata.duration}ms ease-out`
				}
				this._metadata.elmt.addStyle(tStyle);
				setTimeout(()=>{
					tStyle = {
						opacity: 0,
					}
					this._metadata.elmt.addStyle(tStyle);
				}, 1)
				this._metadata.isComplete = true;

			break;
		}

		// ReactDOM.createPortal(
		// 	this.props.children,
		// 	document.body
		// );
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
			case ANIMATE:
				this._animateProps(pct);
				break;
			case FADE_IN:
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
			case FADE_OUT:
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
			case TRANSITION:
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
			// case this._slashr.FADE_OUT:
			// 	this._metadata.isInitialized = true;
			// 	tStyle.opacity = 1.0 - (pct);
			// 	if (this._metadata.isComplete) {
			// 		tStyle.opacity = 0;
			// 		this._metadata.node.style.display = "none";
			// 	}
			// 	this._metadata.node.style.opacity = tStyle.opacity;
			// 	break;
			// case this._slashr.FADE_TO:
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
			// case this._slashr.ROTATE:
			// 	let step = this._metadata.range * pct;
			// 	let nAngle = this._metadata.currAngle + step;
			// 	if (this._metadata.isComplete) nAngle = this._metadata.angle;
			// 	this._metadata.node.style.transform = "rotate(" + nAngle + "deg)";
			// 	break;
			// case this._slashr.SCROLL_TO:
			// 	throw ("SDLKFJFH");
			// 	// let step = this._metadata.range * pct;
			// 	// let nAngle = this._metadata.currAngle + step;
			// 	// if(this._metadata.isComplete) nAngle = this._metadata.angle;
			// 	// this._metadata.node.style.transform = "rotate("+nAngle+"deg)";
			// 	break;
			// case this._slashr.DELAY:
			// 	// Wait for complete
			// 	break;
			// case this._slashr.REPLACE_CLASS:
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