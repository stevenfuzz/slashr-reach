export class SlashrUiDialogDomain{
    constructor() {
		this._instances = {};
		console.log(this);
    }
    dialog(name){

    }
    open(name){

	}
	isOpen(name){
		if(! this._instances[name]) return false;
		else return this._instances[name].isOpen;
	}
}