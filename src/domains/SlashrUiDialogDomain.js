export class SlashrUiDialogDomain {
	constructor(slashr) {
		this._slashr = slashr;
	}
	open(name) {
		let dlg = this._slashr.ui.getDialog(name);
		if(dlg) dlg.open();
	}
	close(name) {
		let dlg = this._slashr.ui.getDialog(name);
		if(dlg) dlg.close();
	}
	toggle(toggle) {
		toggle ? this.open() : this.close();
	}
	isOpen(name) {
		let dlg = this._slashr.ui.getDialog(name);
		return  dlg ? dlg.isOpen : false;
	}
}