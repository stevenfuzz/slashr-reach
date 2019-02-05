import React from 'react';
import { set as mobxSet, trace, decorate, observable, action} from "mobx";

export class SlashrUiMenu{
	constructor(slashrUi, idx, props) {
		this._metadata = {
			ui: slashrUi,
			idx: idx,
			props: {},
			ref: props.forwardRef || React.createRef(),
			eventHandlers: {},
		};
		this._stateVars = {
			isOpen: props.open || false
		}
	}
	delete() {
		this._metadata.ui.deleteMenu(this.idx);
	}
	get isOpen() {
		return this._stateVars.isOpen;
	}
	set isOpen(isOpen) {
		this._stateVars.isOpen = isOpen;
		return this;
	}
	set open(isOpen) {
		this.isOpen = isOpen;
	}
	get open() {
		return this.isOpen;
	}
}
decorate(SlashrUiMenu, {
	_stateVars: observable,
});