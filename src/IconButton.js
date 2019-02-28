import React from 'react';
import { RouteLink } from './Router';
// import './IconButton.css';
import { Icon } from "./Icon";

export class IconButton extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		// let className = this.props.className || "";
		let className = " icon-button";
		if(this.props.size) className += ` ${this.props.size}`;
		if(this.props.type) className += ` ${this.props.type}`;
		if(this.props.color) className += ` ${this.props.color}`;
		if(this.props.theme) className += ` ${this.props.theme}`;
		if(this.props.className) className += ` ${this.props.className}`;
		let children = null;

		if(this.props.children){
			className += ` text`;
			children = <span>{this.props.children}</span>;
		}

		let nProps = {
			className: className.trim(),
			style: this.props.style || null
		};
		if(this.props.disabled) nProps.disabled = true;

		let icon = <Icon 
			type={this.props.icon} 
			color={this.props.color || null} 
			size={this.props.size || "medium"} 
			selected={this.props.selected || null}
			filled={this.props.filled || null}
		/>;
		if(this.props.to){
			//console.log(this.props.to);
			nProps.exact = this.props.exact || null;
			nProps.activeClassName = this.props.activeClassName || null;			
			nProps.to = this.props.to;

			return(
				<RouteLink test={this.props.test} {...nProps}>{icon}{children}</RouteLink>
			);
		}
		else{
			return(
				<button type={this.props.type || "button"} onClick={this.props.onClick} {...nProps}>{icon}{children}</button>
			);
		}
	}
}