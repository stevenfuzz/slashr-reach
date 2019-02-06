
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
		this._isOpen = isOpen;
		return this;
	}
	get idx(){
		return this._metadata.idx;
	}
	open() {
		this._isOpen = true;
	}
	close() {
		this._isOpen = false;
	}
}
decorate(SlashrUiDialog, {
	_isOpen: observable,
	open: action,
	close: action
});
