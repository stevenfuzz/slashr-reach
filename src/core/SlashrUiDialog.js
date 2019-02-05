
import React from 'react';
import { toJS, decorate, observable } from "mobx";
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
	set open(isOpen) {
		this.isOpen = isOpen;
	}
	get open() {
		return this.isOpen;
	}
}
decorate(SlashrUiDialog, {
	_isOpen: observable,
});
