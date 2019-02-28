import React from 'react';
import {Slashr} from './Slashr';
import { Container } from './Element';
import { Provider, observer, inject } from 'mobx-react';
import { decorate, observable, action, computed, trace } from "mobx";

// import ReactDOM from 'react-dom';
// import Swipeable from 'react-swipeable';
// import { CSSTransition, Transition } from 'react-transition-group';
import { Slider } from './Slider';
import "./MenuSlider.css";

export class MenuSliderDomain{
	constructor(name, props){
		if(! name) throw("Menu Slider Error: Name Required");
		this._items = [];
		this._slashr = Slashr.getInstance();
		this._activeItem = props.activeItem || null;
		this._scrollToItem = props.activeItem || null;
		this._classNames = ["menu-slider"];
		if(props.className){
			this._classNames.push(props.className);
		}
		this._name = name;
		this._activeClassName = props.activeClassName || null;
		this._onSelect = props.onSelect || null;
	}
	addItem(props){
		// let item = {
		// 	idx: this.nextItemIdx,
		// 	ref: React.createRef(),
		// 	isActive: false
		// }
		if(this._items[props.name]) throw(`Menu Slider Item: Item name '${props.name}' is not unique.`);
		let item = new MenuSliderItemDomain(this, props);
		this._items[props.name] = item;
		return this._items[props.name]
	}
	updateItem(props){
		// let item = {
		// 	idx: this.nextItemIdx,
		// 	ref: React.createRef(),
		// 	isActive: false
		// }
		if(! this._items[props.name]) throw(`Menu Slider Item: Update error, Item name '${props.name}' not found.`);
		return this._items[props.name].update(props);
	}
	selectItem(item){
		this.scrollToItem = null;
		this.setActiveItem(item);
		if(this._onSelect) this._onSelect(this._activeItem);
	}
	setActiveItem(item){
		let activeItem = (typeof item === 'string') ? item : item.name;
		if(activeItem === this._activeItem) return false;
		this._activeItem = activeItem;
		for(let name in this._items){
			this._items[name].selected = (name === activeItem);
		}
		
	}
	renderItemId(name){
		return `MenuSlider_${this._name}_${name}`;
	}
	get activeClassName(){
		return this._activeClassName;
	}
	get classNames(){
		return this._classNames;
	}
	get activeItem(){
		return this._activeItem;
	}
	set activeItem(item){
		return this.setActiveItem(item);
	}
	set scrollToItem(scrollToItem){
		if(scrollToItem !== this._scrollToItem){
			this._scrollToItem = scrollToItem;
		}
		return this;
	}
	get scrollToItem(){
		return this._scrollToItem;
	}
}
decorate(MenuSliderDomain, {
	//_activeItem: observable
});
export class MenuSliderItemDomain{
	constructor(menuSlider, props){
		this._menuSlider = menuSlider;
		this._name = props.name;	
		this.initialize(props);
	}
	initialize(props){
		if(! this._menuSlider.activeItem) this._isSelected = props.active || false;
		else this._isSelected = (props.name === this._menuSlider.activeItem);
		this._className = props.className || null;
	}
	update(props){
		return this.initialize(props);
	}
	get className(){
		let className = "menu-slider-item";
		if(this._menuSlider.activeClassName && this._isSelected){
			className += ` ${this._menuSlider.activeClassName}`;
		}
		if(this._className) className += ` ${this._className}`;
		return className;
	}
	get name(){
		return this._name;
	}
	get isSelected(){
		return this._isSelected;
	}
	set selected(isSelected){
		this.setSelected(isSelected);
	}
	setSelected(isSelected){
		this._isSelected = isSelected;
	}
}
decorate(MenuSliderItemDomain, {
	// className: computed,
	_isSelected: observable,
	setSelected: action,
	initialize: action
});

export class MenuSlider extends React.Component {
	constructor(props) {
		super(props);
		this.menuSliderDomain = new MenuSliderDomain(this.props.name, this.props);
	}
	render() {
		return (
			<Provider menuSlider={this.menuSliderDomain}>
				<_MenuSlider {...this.props} items={this.props.children} />
			</Provider>
		);
	}
}


export const _MenuSlider = inject("menuSlider","slashr")(observer(
	class _MenuSlider extends React.Component {
		constructor(props) {
			super(props);
			// this.props.items.forEach((item)=>{
			// 	console.log("menuSlider",item, item.props);
			// })
			//this.scrollToItem = true;
			// this._slashr = this.props.menuSlider._slashr;
		}
		componentDidMount(){
			//this.props.menuSlider.initialize();
		}
		componentWillReact(){
			//console.log("menu slider",this.props.slashr.router.history.action,this.props.activeItem, this.props.menuSlider.activeItem);
			// if(this.props.scrollToItem !== this.props.menuSlider.scrollToItem){
			// 	this.props.menuSlider.scrollToItem = this.props.scrollToItem;
			// }

			// console.log("menu slider location",this.props.slashr.router.location.pathname,this.props.slashr.router.location.search);
			if(this.props.activeItem !== this.props.menuSlider.activeItem){
				this.props.menuSlider.activeItem = this.props.activeItem;
				//if(this.props.slashr.router.history.action && this.props.slashr.router.history.action === "POP"){
					this.props.menuSlider.scrollToItem = this.props.menuSlider.activeItem;
				//}
			}

			// if(this.props.activeItem === this.props.menuSlider.activeItem){
			// 	this.props.menuSlider.scrollToItem = this.props.activeItem;
			// 	//this.props.menuSlider.setActiveItem(this.props.activeItem);
			// 	console.log("menu item UPDATE SET SCROLL TO",this.props.activeItem);
			// 	// this.props.menuSlider.setActiveItem(this.props.activeItem);
			// }
			// else this.props.menuSlider.scrollToItem = null;
			// console.log("Menu item REACXT REAXCT SCROLOL TO.",this.props.activeItem, this.props.menuSlider.activeItem);
			
		}
		componentDidUpdate(prevProps){
			// if(this.props.activeItem !== prevProps.activeItem && this.props.activeItem !== this.props.menuSlider.activeItem){
			// 	console.log("menu item SETTING ACTIVE",this.props.activeItem);
			// 	this.props.menuSlider.setActiveItem(this.props.activeItem);
			// 	// this.props.menuSlider.scrollToItem = this.props.activeItem;
			// 	// console.log("menu item UPDATE SET SCROLL TO",this.props.activeItem);
			
			// }
			// else this.props.menuSlider.scrollToItem = null;
		}
		render() {
			// let loader = (this.props.loader) ? this.props.loader : <Container>Loading...</Container>;
			// 
			// this.props.items.forEach((item)=>{
			// 	console.log("menu item",item.props.name);
			// });
			//alert(this.props.menuSlider.scrollToItem);
			return(
				<Container
					classNames={this.props.menuSlider.classNames}
					// ref={this.props.slider.ref.slider}
				>
					<Slider 
						name={`_${this.props.name}_MenuSlider`}
						buttonLeft={this.props.buttonLeft}
						buttonRight={this.props.buttonRight}
						loader={this.props.loader}
						scrollToItem={this.props.menuSlider.scrollToItem}
					>
						{this.props.items}
					</Slider>
				</Container>
			);
		}
	}
));

export const MenuSliderItem = inject("menuSlider")(observer(
	class MenuSliderItem extends React.Component {
		constructor(props) {
			super(props);
			this.handleClick = this.handleClick.bind(this);
			this.item = props.menuSlider.addItem(props);
		}
		handleClick(e){
			this.props.menuSlider.selectItem(this.item);
		}
		componentWillReact(){
			this.props.menuSlider.updateItem(this.props);
		}
		render() {
			return(
				<Container
					className={this.item.className}
					key={this.item.name}
					id={this.props.menuSlider.renderItemId(this.item.name)}
					onClick={this.handleClick}
					// ret={this.item.ref}
				>
					{this.props.children}
				</Container>
			);
		}
	}
));