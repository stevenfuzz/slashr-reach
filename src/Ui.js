import {SlashrUiElement} from './core/SlashrUiElement'
import {SlashrUiDialog} from './core/SlashrUiDialog';
import {SlashrUiGrid} from './core/SlashrUiGrid';
import {SlashrUiMenu} from './core/SlashrUiMenu';
import {SlashrAnimationQueue} from './Animator';
import {ANIMATE, FADE_IN, FADE_OUT, TRANSITION} from './core/SlashrConstants'
// import {SlashrAnimationQueue} from './core/constants';
import { set as mobxSet, trace, decorate, observable, action} from "mobx";


export class SlashrUi {
	constructor(slashr) {
		this._metadata = {
			elmts: {},
			dlgs: {},
			mnu: {},
			cals: {},
			fms: {},
			grids: {}
		};
		this._slashr = slashr;
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
		if (!this._metadata.animationQueue) this._metadata.animationQueue = new SlashrAnimationQueue(this._slashr);
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
		this.animationQueue.add(elmt, ANIMATE, options);
	}
	fadeIn(elmt, options = {}) {
		this.animationQueue.add(elmt, FADE_IN, options);
	}
	fadeOut(elmt, options = {}) {
		this.animationQueue.add(elmt, FADE_OUT, options);
	}
	transition(elmt, toggled, options = {}) {
		options.toggled = toggled;
		this.animationQueue.add(elmt, TRANSITION, options);
	}
	createElement(props) {
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
		let idx = props.name || this.nextDlgIdx;
		if (this._metadata.dlgs[idx]) throw (`Dialog ${idx} already exists.`);
		let elmt = new SlashrUiDialog(this, idx, props);
		this._metadata.dlgs[idx] = elmt;
		return elmt;
	}
	getDialog(idx){
		return this._metadata.dlgs[idx] || false;
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
			//window.requestAnimationFrame(() => {
				if (!Object.keys(this._events.resize).length) {
					this.removeEventListener("resize");
					this._windowResizeTimeout = null;
					return;
				}
				for (let i in this._events.resize) {
					this._events.resize[i]();
				}
				this._windowResizeTimeout = null;
			//});
		}, 100);
	}
	_handleWindowScroll() {
		if (this._windowScrollTimeout) return;
		this._windowScrollTimeout = setTimeout(() => {
			//window.requestAnimationFrame(() => {
				if (!Object.keys(this._events.scroll).length) {
					this.removeEventListener("scroll");
					this._windowScrollTimeout = null;
					return;
				}
				for (let i in this._events.scroll) {
					this._events.scroll[i]();
				}
				this._windowScrollTimeout = null;
			//});
		}, 100);
	}
	_handleObserveIntersection(entries) {
		//window.requestAnimationFrame(() => {
			for (let ent of entries) {
				for (let elmtIdx in this._events.observeIntersection) {
					if (this._metadata.elmts[elmtIdx].ref.current == ent.target) {
						this._events.observeIntersection[elmtIdx](ent);
						break;
					}
				}
			}
		//});
	}
	_handleObserveResize(entries) {
		//window.requestAnimationFrame(() => {
			for (let ent of entries) {
				for (let elmtIdx in this._events.observeResize) {
					if (this._metadata.elmts[elmtIdx].ref.current == ent.target) {
						this._events.observeResize[elmtIdx](ent);
						break;
					}
				}
			}
		//});
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
					// require('resize-observer-polyfill');
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







