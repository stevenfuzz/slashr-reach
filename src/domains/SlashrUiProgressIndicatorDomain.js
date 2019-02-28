import { Slashr } from "../Slashr";
import { action } from "mobx";
export class SlashrUiProgressIndicatorDomain extends Slashr.Domain{
	constructor() {
		super();
		this._instances = {};
		this.state = {
			instances: {}
		};
	}
	show(name = "default") {
		if(! this._instances[name]){
			this._instances[name] = true;
			this.setState({
				instances: this._instances
			});
		}
	}
	hide(name = "default") {
		if(this._instances[name]){
			delete this._instances[name];
			this.setState({
				instances: this._instances
			});
		}
	}
	doShow(name = "default"){
		return (this.state.instances[name] || false);
	}
}
// export class SlashrUiProgressIndicatorInstanceDomain extends Slashr.Domain{
// 	constructor(name) {
// 		super();
// 		this.state = {
// 			doShow: false
// 		};
// 	}
// 	show(){
// 		console.log("SHOW PROGRESS");
// 		this.setState({
// 			doShow: true
// 		});
// 	}
// 	hide(){
// 		this.setState({
// 			doShow: false
// 		});
// 	}
// 	doShow(){
// 		return this.state.doShow;
// 	}
// }
// Slashr.listen(SlashrUiProgressIndicatorInstanceDomain,{

// });