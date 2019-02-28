import React from 'react';
import './IconText.css';
import Icon from "./Icon";

export default class IconText extends React.PureComponent {
	constructor(props){
		super(props);
	}
	render() {
		// let className = this.props.className || "";
		let className = " icon-text";
		if(this.props.size) className += ` ${this.props.size}`;
		if(this.props.color) className += ` ${this.props.color}`;
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

		let icon = <Icon type={this.props.icon} color={this.props.color}/>;
	
			return(
				<div {...nProps}>{icon}{children}</div>
			);
		
	}
}