import { Slashr } from "../Slashr";

export class SlashrUiLayoutDomain extends Slashr.Domain{
	constructor(slashr) {
		super();
		this._slashr = slashr;
		this.state = {
			isScrollable: true,
			theme: null
		};
	}
	get isScrollable(){
		return this.state.isScrollable;
	}
	setScrollable(isScrollable){
		this.setState({
			isScrollable: isScrollable
		});
	}
	get theme(){
		return this.state.theme;
	}
	setTheme(theme){
		this.setState({
			theme: theme
		});
	}
}