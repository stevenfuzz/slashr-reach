import React from 'react';
import ReactDom from 'react-dom';
import { Slashr } from "./Slashr";
import {Container} from './Element';

export const Menu = React.forwardRef((props, ref) => {
	return (
		<_Menu
			{...props}
			forwardRef={ref}
		>
			{props.children}
		</_Menu>
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
export const _Menu = Slashr.connect(
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
);


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