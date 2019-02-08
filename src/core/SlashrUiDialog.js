
import React from 'react';
import { toJS, decorate, observable, action } from "mobx";
export class SlashrUiDialog{
	_isOpen = false;
	constructor(slashrUi, idx, props) {
		this._metadata = {
			ui: slashrUi,
			idx: idx,
			props: {},
			ref: props.forwardRef || React.createRef(),
			eventHandlers: {},
		};
		this.state = {
			
		};
	}
	delete() {
		this._metadata.ui.deleteDialog(this.idx);
	}
	get isOpen() {
		return this._isOpen;
	}
	set isOpen(isOpen) {
		this.setOpen(isOpen);
	}
	setOpen(isOpen){
		this._isOpen = isOpen;
	}
	get idx(){
		return this._metadata.idx;
	}
	open() {
		console.log("open dialog");
		this._isOpen = true;
	}
	close() {
		console.log("close dialog");
		this._isOpen = false;
	}
}
decorate(SlashrUiDialog, {
	_isOpen: observable,
	setOpen: action,
	open: action,
	close: action
});
