import React from 'react';
import { Container } from './Element';
import { Provider, observer, inject } from 'mobx-react';
import { set as mobxSet, toJS, decorate, observable, action, computed, trace } from "mobx";

// import ReactDOM from 'react-dom';
// import Swipeable from 'react-swipeable';
// import { CSSTransition, Transition } from 'react-transition-group';
import "./Slider.css";

export class SliderDomain {
	constructor(name, props) {
		// Create Metadata
		this._isUpdating = false;
		this._mouseScrollTimeout = null;
		this._hasEventListenrs = false;
		this._metadata = {
			name: name,
			ref: null,
			itemId: 1,
			ref: {
				slider: React.createRef(),
				sliderItems: React.createRef(),
				sliderItemsWrapper: React.createRef(),
				sliderItemsScroller: React.createRef()
			},
			size: {
				height: null,
				width: null,
				scrollLeft: null,
				scrollWidth: null
			},
			isScrollEnd: false,
			isScrollStart: false,
			scrollLeft: 0,
			hasScroll: false,
			props: {},
			controlLeft: null,
			controlRight: null,
			isUpdating: false,
			isRendered: false,
			isInitialLoad: true,
			updateTimeout: null,
			scrollToItem: props.scrollToItem || false,
			updateScrollToItem: props.scrollToItem ? true : false
		};

		this._stateProps = {
			// items: [],
			// isLoaded: false,
			animateSlider: {},
			doShowControlRight: false,
			doShowControlLeft: false,
			doShow: false,
			height: null
		}

		this._items = [];

		// Map the props...
		this.updateItems(props);
		if (props.buttonLeft) this._metadata.controlLeft = props.buttonLeft;
		if (props.buttonRight) this._metadata.controlRight = props.buttonRight;

		// Bind Handlers
		this._handleScroll = this._handleScroll.bind(this);
		this._handleTransition = this._handleTransition.bind(this);
		this._handleControlClickLeft = this._handleControlClickLeft.bind(this);
		this._handleControlClickRight = this._handleControlClickRight.bind(this);
	}
	updateItems(props) {
		if (props.scrollToItem !== this.scrollToItem) {
			this.scrollToItem = props.scrollToItem;
			this.updateScrollToItem = this.scrollToItem ? true : false;
		}
		if (props.items) this._items = props.children;
		else if (props.children) this._items = props.children;
	}
	// selectItem(item, doTriggerCallback = true){
	// 	if(typeof item === 'string') this.activeItem = item;
	// 	else this.activeItem = item.name;
	// 	for(let name in this._items){
	// 		this._items[name].selected = (name === this.activeItem);
	// 	}
	// 	if(this._onSelect && doTriggerCallback) this._onSelect(this.activeItem);
	// }
	handleMount(props) {
		this.initialize(props);
	}
	handleUpdate(props) {
		this.updateItems(props);
		this.update(props);
	}
	// Must be called in componentDidMount
	initialize(props) {
		// Add events to the controls
		this._metadata.controlLeft = (this._metadata.controlLeft) ? React.cloneElement(this._metadata.controlLeft, {
			onClick: this._handleControlClickLeft
		}) : null;
		this._metadata.controlRight = (this._metadata.controlRight) ? React.cloneElement(this._metadata.controlRight, {
			onClick: this._handleControlClickRight
		}) : null;
		// setTimeout(
		// 	() => {
		// 		this.update();
		// 	},
		// 	500
		// )
		this.update(props);
	}

	update(props) {
		//throw("THE GRID IS GETTING THE SIZE BEFORE IT IS REACTS TO MARKED AS LOADED.... Wait until inner div is visible to update size and show");

		// let nVals = {};
		if (this._isUpdating) return;
		if (!this.isLoaded) {
			this._stateProps.doShow = false;
		}
		else if (!this._stateProps.doShow) {
			this._stateProps.doShow = true;
		}
		if (this.isRendered) {
			this._isUpdating = true;
			let size = this.getDimensions();
			this._metadata.size = size;

			if (size) {
				let hasScroll = (size.scrollWidth > size.width);
				let isScrollStart = (size.scrollLeft == 0);
				let isScrollEnd = ((size.scrollLeft + size.width) == size.scrollWidth);
				
				this._stateProps.doShowControlLeft =  (hasScroll && !isScrollStart);
				this._stateProps.doShowControlRight = (hasScroll && !isScrollEnd);
				
				if (this.updateScrollToItem && this.scrollToItem) {
					console.log("update scroll item");
					// Look for the active item idx
					let itemIdx = 0;
					for (let i = 0; i < this.items.length; i++) {
						if (this.items[i].props.name === this.scrollToItem) {
							itemIdx = i;
							break;
						}
					}
					if (itemIdx > 0) itemIdx--;
					let scrollLeft = itemIdx ? this.getItemScrollLeft(itemIdx) : 0;
					if (scrollLeft !== size.scrollLeft) {
						this._stateProps.animateSlider = {
							scrollLeft: scrollLeft
						};
					}
					this.updateScrollToItem = false;
				}
				//mobxSet(this._stateProps, nVals);
				// this._stateProps = { ...this._stateProps, ...nVals };
				// this._stateProps.doShowControlLeft = (hasScroll && !isScrollStart);
				// this._stateProps.doShowControlRight = (hasScroll && !isScrollEnd);
				//console.log("willGRIP PROPS", this.isLoaded, toJS(this._stateProps));
			}
			
			this._stateProps.height = size.height;
			this._isUpdating = false;
		}
		//console.log("END UPDATE FOR",this._metadata.name,JSON.stringify(this._stateProps));
		// console.log("Compared props",JSON.stringify(this._stateProps),JSON.stringify(nVals));
		// if(!Slashr.utils.core.arePropsEqual(this._stateProps, nVals)){
		// 	console.log("SETTING PROPS");
		// 	mobxSet(this._stateProps, nVals);
		// }
	}

	// Getters / Setters
	get isScrollEnd() {
		return this._metadata.isScrollEnd;
	}
	get isScrollStart() {
		return this._metadata.isScrollEnd;
	}
	get isLoaded() {
		return (this.items && this.items.length > 0);
	}
	get doShow() {
		return this._stateProps.doShow;
	}
	get isRendered() {
		return this._metadata.isRendered;
	}
	set rendered(isRendered) {
		this._metadata.isRendered = isRendered;
		return this;
	}
	get isInitialLoad() {
		return this._metadata.isInitialLoad;
	}
	set initalLoad(initalLoad) {
		this._metadata.isInitialLoad = initalLoad;
		return this;
	}
	get isUpdating() {
		return this._isUpdating;
	}

	get hasScroll() {
		return this._metadata.hasScroll;
	}
	get doShowControlLeft() {
		return this._stateProps.doShowControlLeft;
	}
	get doShowControlRight() {
		return this._stateProps.doShowControlRight;
	}
	get items() {
		return this._items;
	}
	get size() {
		return this._metadata.size;
	}
	get height(){
		return this._stateProps.height;
	}
	get ref() {
		return this._metadata.ref;
	}
	get controlLeft() {
		return this._metadata.controlLeft;
	}
	get controlRight() {
		return this._metadata.controlRight;
	}
	get isMouseScrolling() {
		return this._metadata.isMouseScrolling;
	}
	get scrollToItem() {
		return this._metadata.scrollToItem;
	}
	set scrollToItem(scrollToItem) {
		this._metadata.scrollToItem = scrollToItem;
		return this;
	}
	get updateScrollToItem() {
		return this._metadata.updateScrollToItem;
	}
	set updateScrollToItem(updateScrollToItem) {
		this._metadata.updateScrollToItem = updateScrollToItem;
		return this;
	}
	get animateSlider() {
		return this._stateProps.animateSlider;
	}
	set animateSlider(values) {
		this._stateProps.animateSlider = values;
		return this;
	}
	scrollToItem(idx) {
		let scrollLeft = this.getItemScrollLeft(idx);
		if (scrollLeft !== this.size.scrollLeft) {
			this.animateSlider = {
				scrollLeft: scrollLeft
			};
		}
	}
	getItemScrollLeft(idx) {
		let sliderItemsElmt = this._metadata.ref.sliderItems.current;
		let children = [];
		let scrollLeft = 0;
		if (idx > 0) {
			if (sliderItemsElmt.children[idx]) {
				let item = sliderItemsElmt.children[idx];
				scrollLeft = item.offsetLeft;
			}
		}
		return scrollLeft;
	}
	_handleScroll(e) {
		this.update();
	}
	_handleControlClickLeft() {
		let leftOffset = this.size.scrollLeft;
		let rightOffset = this.size.scrollLeft + this.size.width;
		// let scrollThreshold = (this.size.scrollWidth - this.size.width);
		let scrollLeft = leftOffset;
		let sliderItemsElmt = this._metadata.ref.sliderItems.current;

		let children = [];
		for (let item of sliderItemsElmt.children) {
			children.unshift(item);
		}
		for (let item of children) {
			let x = item.offsetLeft + item.offsetWidth;
			let width = item.offsetWidth;
			if (x > rightOffset) continue;
			if (x < leftOffset) break;
			if (x > leftOffset) scrollLeft = x - this.size.width;
		}
		if (scrollLeft < 0) scrollLeft = 0;
		this.animateSlider = {
			scrollLeft: scrollLeft
		};
	}
	_handleControlClickRight() {
		let leftOffset = this.size.scrollLeft;
		let rightOffset = this.size.scrollLeft + this.size.width;
		let scrollThreshold = (this.size.scrollWidth - this.size.width);
		let sliderItemsElmt = this._metadata.ref.sliderItems.current;

		if (this.isScrollEnd) return;
		let scrollLeft = rightOffset;
		for (let item of sliderItemsElmt.children) {
			let x = item.offsetLeft;
			let width = item.offsetWidth;
			if (x < leftOffset) continue;
			if (x > rightOffset) break;
			if ((x + width) > rightOffset) scrollLeft = x;
		}
		if (scrollLeft > scrollThreshold) scrollLeft = scrollThreshold;
		this.animateSlider = {
			scrollLeft: scrollLeft
		};
	}
	_handleTransition(state) {
		switch (state) {
			case "entering":
				this.rendered = true;
				this.update();
				break;
		}
		// console.log(state, this.getDimensions());
	}

	// Methods
	getDimensions() {
		if (!this.isLoaded) return false;
		let sliderItemsElmt = this._metadata.ref.sliderItems.current;
		let sliderItemsScrollerElmt = this._metadata.ref.sliderItemsScroller.current;
		if(! sliderItemsElmt || ! sliderItemsScrollerElmt) return this.size;
		// let sliderElmt = this._metadata.ref.slider.current;
		return {
			height: sliderItemsElmt.clientHeight,
			width: sliderItemsScrollerElmt.offsetWidth,
			scrollLeft: sliderItemsScrollerElmt.scrollLeft,
			scrollWidth: sliderItemsScrollerElmt.scrollWidth
		}
	}
	_updateHeight() {

	}
}
decorate(SliderDomain, {
	_stateProps: observable,
	update: action
});

export class Slider extends React.Component {
	constructor(props) {
		super(props);
		if (!this.props.name) throw ("Slider Error: Name Required");

		this.sliderDomain = new SliderDomain(this.props.name, this.props);
	}
	render() {
		return (
			<Provider slider={this.sliderDomain}>
				<_Slider {...this.props} items={this.props.children} />
			</Provider>
		);
	}
}


export const _Slider = inject("slider")(observer(
	class _Slider extends React.Component {
		constructor(props) {
			super(props);
			this.handleObserveResize = this.handleObserveResize.bind(this);
		}
		componentDidMount() {
			this.props.slider.handleMount(this.props);
		}
		componentDidUpdate() {
		
		}
		handleObserveResize(e) {
			this.props.slider.handleUpdate(this.props);
		}
		componentWillReact() {
			this.props.slider.handleUpdate(this.props);
		}
		render() {
			let loader = (this.props.loader) ? this.props.loader : <Container>Loading...</Container>;
			if (!this.props.slider.doShow) return null;
			//this.props.slider.rendered = true;
			return (
				<Container
					className="slider"
					ref={this.props.slider.ref.slider}
				>
					{/* <Swipeable
						className="slider-items"
						trackMouse
						onSwiping={this.props.slider._handleSwiping}
						onSwiped={this.props.slider._handleSwiped}
						innerRef={(el) => this._sliderRef = el}
						style={style}
						// preventDefaultTouchmoveEvent
						// preventDefault
						onClick={this.handleClick}
						onTap={this.handleTap}
					>
						{this.props.children}
					</Swipeable> */}

					<Container
						hide
						unmountOnHide
						onTransition={this.props.slider._handleTransition}
						transitionToggle={this.props.slider.doShow}
						ref={this.props.slider.ref.sliderItemsWrapper}
						animate={this.props.slider.animateSlider}
						style={{
							height: this.props.slider.height
						}}
						transition={{
							easing: "easeInQuad",
							enter: {
								origin: "top left",
								display: "block",
								// opacity:0,
								// transform:{
								// 	translate: "10%",
								// }
							},
							entering: {
								// opacity:1,
								// transform:{
								// 	translate: "0%",
								// }
							},
							entered: {},
							exit: {
								// opacity:1,
								// transform:{
								// 	translate: "0%",
								// }
							},
							exiting: {
								// opacity:0,
								// transform:{
								// 	translate: "-10%",
								// }
							},
							exited: {
								display: "none",
							}
						}}
						className="slider-items-wrapper"
					>
						<Container
							ref={this.props.slider.ref.sliderItemsScroller}
							animate={this.props.slider.animateSlider}
							scroll={{
								x: "auto",
								y: false,
								emulateTouch: true
							}}
							style={{
								paddingBottom: "16px"
							}}
							onScroll={this.props.slider._handleScroll}
							className="slider-items-scroller"
						>
							<Container
								ref={this.props.slider.ref.sliderItems}
								className="slider-items"
								onObserveResize={this.handleObserveResize}
							>
								{this.props.items}
							</Container>
						</Container>
					</Container>
					<Container
						hide
						unmountOnHide
						fadeIn={this.props.slider.doShowControlLeft}
						fadeOut={!this.props.slider.doShowControlLeft}
						className="slider-controls-left"
					>
						{this.props.slider.controlLeft}
					</Container>
					<Container
						hide
						unmountOnHide
						fadeIn={this.props.slider.doShowControlRight}
						fadeOut={!this.props.slider.doShowControlRight}
						className="slider-controls-right"
					>
						{this.props.slider.controlRight}
					</Container>
					{!this.props.slider.isLoaded &&
						<Container
							className="slider-loader"
						>
							{loader}
						</Container>
					}
				</Container>
			);
		}
	}
));

// export const _SliderItems = inject("slider")(observer(
// 	class _SliderItems extends React.Component {
// 		constructor(props){
// 			super(props);
// 		}
// 		render(){
// 			return(
// 				<Container
// 					animate={this.props.slider.animateSlider}
// 					scroll={{
// 						x: "auto",
// 						y: false,
// 						emulateTouch: true
// 					}}
// 					ref={this.props.slider.ref.sliderItems}
// 					className="slider-items"
// 					onScroll={this.props.slider._handleScroll}
// 				>
// 					{this.props.items}
// 				</Container>
// 			);
// 		}
// 	}
// ));