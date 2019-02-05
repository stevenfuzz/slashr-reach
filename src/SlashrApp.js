import {Slashr} from './Slashr';
import {SlashrUiDialogDomain} from './domains/SlashrUiDialogDomain';
import {SlashrAppRouter} from './Router';

export class SlashrApp{
	constructor(options){
		if(! options.config) throw("Slashr Error: No Config.");
        if(! options.routes) throw("Slashr Error: No Routes.");
        this._slashr = Slashr.getInstance();
		this._metadata = {
			model: new SlashrAppModel(this._slashr, this, options),
			router: new SlashrAppRouter(this._slashr, this, options),
			config: options.config,
			routes: options.routes,
			defaultLayout: options.defaultLayout || null,
			utilities: this._slashr.utils,
			scrollBehavior: options.scrollBehavior || null
        }
        this._slashr.app = this;
    }
    
	get router(){
		return this._metadata.router;
	}
	get rtr(){
		return this._metadata.router;
	}
	get model(){
		return this._metadata.model;
	}
	get mdl(){
		return this.model;
	}
	get routes(){
		return this._metadata.routes;
	}
	get utilities(){
		return this._metadata.utilities;
	}
	get utils(){
		return this._metadata.utilities;
	}
	get defaultLayout(){
		return this._metadata.defaultLayout;
	}
	get config(){
		return this._metadata.config;
	}
	get scrollBehavior(){
		return this._metadata.scrollBehavior;
    }
    get slashrInstance(){
        return this._slashr;
    }
}

export class SlashrAppModel{
	constructor(slashr, app, options){
		if(! options.domain) throw("Slashr Error: No Domain.");
		if(! options.ui) throw("Slashr Error: No Ui.");
		this._app = app;
		this._slashr = slashr;
		
		this._metadata = {
			domain: options.domain,
			ui: options.ui
		}
		this._metadata.ui.dialog = this._metadata.ui.dlg = new SlashrUiDialogDomain();

		// Bind ui methods
		// TODO: Add this to SlashrAppUiModel
		this._metadata.ui.createGrid = this._createGrid.bind(this);
		
	}
	get domain(){
		return this._metadata.domain;
	}
	get dm(){
		return this.domain;
	}
	get ui(){
		return this._metadata.ui;
	}
	// Helper ui methods
	_createGrid(name, options={}){
		let props = options;
		props.name = name;
		props.slashr = this._slashr;
		return this._slashr.ui.createGrid(props);
	}
}