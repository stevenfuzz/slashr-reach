import React from 'react';
import ReactDOM from 'react-dom';

export class BodyPortal extends React.Component {
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