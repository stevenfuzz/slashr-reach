import React from 'react';
import { RouteLink } from './Router';
// import './Button.css';

export class Button extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		let className = this.props.className || "";
		className += " button";
		if(this.props.size) className += ` ${this.props.size}`;
		if(this.props.type) className += ` ${this.props.type}`;
		if(this.props.color) className += ` ${this.props.color}`;
		if(this.props.style) className += ` ${this.props.style}`;
		let type = this.props.type
		let nProps = {
			className: className.trim(),
			disabled: this.props.disabled || null,
		};
		if(this.props.to){
			nProps.exact = this.props.exact || null;
			nProps.activeClassName = this.props.activeClassName || null;
			nProps.to = this.props.to;
			if(nProps.disabled) throw("TODO: DISABLE LINKS...");

			return(
				<RouteLink {...nProps}>{this.props.children}</RouteLink>
			);
		}
		else if(this.props.href){
			nProps.exact = this.props.exact || null;
			//nProps.activeClassName = this.props.activeClassName || null;
			nProps.href = this.props.href;
			nProps.target = "_BLANK";
			if(nProps.disabled) throw("TODO: DISABLE LINKS...");
			return(
				<a {...nProps}>{this.props.children}</a>
			);
		}
		else{
			nProps.type = this.props.type || "button";
			return(
				<button onClick={this.props.onClick} {...nProps}>{this.props.children}</button>
			);
		}
	}
}