import React from 'react';
import {Provider, observer,inject} from 'mobx-react';
import { decorate, observable, action, computed} from "mobx";
import { CSSTransition } from 'react-transition-group';

class FormDomain{
	constructor(name){
		this._name = [];
		this._idx = 1;
		this._errors = [];
		this._elmts = {};
		this._isValid = {};
		this._validators = {};
		this._onSubmit = null;
		this._control = null;
		this._handleSubmit = this._handleSubmit.bind(this);
	}
	get name(){
		return this._name;
	}
	set name(name){
		this._name = name;
		return this;
	}
	get elements(){
		return this._elmts;
	}
	set elements(elements){
		throw("Cannot set elements")
	}
	get elmts(){
		return this.elements;
	}
	set elmts(elements){
		throw("Cannot set elements")
	}
	
	get isValid(){
		return this._isValid;
	}
	set isValid(isValid){
		this.valid = isValid;
	}
	set valid(isValid){
		this._isValid = isValid;
	}
	
	get onSubmit(){
		return this._onSubmit;
	}
	set onSubmit(onSubmit){
		this.submit = onSubmit;
	}
	set submit(onSubmit){
		this._onSubmit = onSubmit;
	}
	
	get validators(){
		return this._validators;
	}
	set validators(validators){
		this._validators = validators;
	}
	addValidators(validators){
		for(let name in validators){
			this._validators[name] = validators[name];
		}
	}
	get values(){
		return this.getValues();
	}
	set values(values){
		throw("Cannot set values");
	}
	getValues(){
		let ret = {};
		for(let name in this._elmts){
			if(! this._elmts[name].doSubmit) continue;
			ret[name] = this._elmts[name].getValue();
		}
		return ret;
	}
	get errors(){
		return this.getErrors();
	}
	set errors(errors){
		throw("TOPDO NOT COMPLETE");
		throw("Cannot set values");
	}
	getErrors(){
		return this._errors;
	}
	addError(error){
		console.log("ADD ERROR");
		console.log(error);
		this.errors.push(error);
	}
	async _handleSubmit(event){
		event.preventDefault();
		
		if(! this._onSubmit) throw("Form error: onSubmit must be set in the form tag.");
		
		await this.validate();
		
		if(this._isValid){
			this._errors = [];
			this._onSubmit(this);
		}
	}
	_addElement(component, options = {}){
		let idx = ++this._idx;
		let name = component.props.name || ("elmt" + idx);
		console.log("ELEMENT NAME",name);
		this._elmts[name] = new FormElementDomain(this, name, component, options);
		return this._elmts[name];
	}
	
	// Validators must return success or error. 
	// If success or error is a string, success or error labels will be set
	async validate(){
		this.valid = true;
		for(let name in this.elmts){
			let val = this.elmts[name].value;
			let hasValidionError = false;
			
			this.elmts[name].valid = false;
			this.elmts[name].validationErrorMessage = "";
			this.elmts[name].validationSuccessMessage = "";

			console.log(this.elmts[name].isRequired );
			console.log(val);

			// Check for non required
			if(! this.elmts[name].isRequired && ! this.elmts[name].validator){
				this.elmts[name].valid = true;
			}
			// Check if required
			else if(this.elmts[name].isRequired && (! val || (typeof val === "string" && val.trim() === "") || (typeof val === "object" && val.length === 0))){
				this.elmts[name].valid = false;
				this.elmts[name].validationErrorMessage = (typeof this.elmts[name].isRequired === "string") ? this.elmts[name].isRequired : "Value Required";
			}
			// Check if there are validators
			else if(this.elmts[name].validator){
				let validator = {};
				
				// Check for string (single), array (no options) or object
				if(typeof this.elmts[name].validator === "string") validator[this.elmts[name].validator] = true;
				else if(Array.isArray(this.elmts[name].validator)){
					this.elmts[name].validator.map(
						(value) => {
							validator[value] = true;
						}
					);
				}
				else validator = this.elmts[name].validator;
				
				for(let i in validator){
					let opts = (typeof validator[i] === "object") ? validator[i] : {};
					if(! this._validators[i]) throw("Unable to find validator: '"+i+"'");

					let rslt = {error: "Unable to complete request"};
//					try{
						rslt = await this._validators[i](val, opts, this); 
						if(rslt){
							if(rslt === true){
								this.elmts[name].valid = true;
								this.elmts[name].validationErrorMessage = "";
							}
							else if(rslt.error){
								this.elmts[name].valid = false;
								this.elmts[name].validationErrorMessage = (typeof rslt.error === "string") ? rslt.error : "Not Valid";
							}
							else if(rslt.success){
								this.elmts[name].valid = true;
								this.elmts[name].validationSuccessMessage = (typeof rslt.success === "string") ? rslt.success : "";
							}
							if(rslt.value){
								this.elmts[name].value = rslt.value;
							}
						}
						else{
							this.elmts[name].valid = false;
							this.elmts[name].validationErrorMessage = "Unknown Validation Error";
						}
						if(! this.elmts[name].isValid) break;
						
//					}
//					
//					catch(err){
//						console.log(err);
//						throw("Validation Error Unknown");
//					}
				}
			}
			else{
				this.elmts[name].valid = true;
			}

			// Update the form
			if(! this.elmts[name].isValid){
				this.valid = false;
			}
			
			console.log("THE FORM IS: ",name, this.elmts[name].isValid);
			
			// Update validation message
			if(this.elmts[name].isValid) this.elmts[name].validationErrorMessage = false;
			else this.elmts[name].validationSuccessMessage = false;

		}
		return this.valid;
	}
}
decorate(FormDomain, {
	_value: observable,
	_isValid: observable,
	_errors: observable,
	_elmts: observable
});

//export const FormElementDomain = inject("form")(observer(
class FormElementDomain{
	constructor(form, name, component, options = {}){
		this._name = name;
		this._props = {};
		this._doSubmit = null;
		this._isValid = null;
		this._isRequired = null;
		this._hasValue = null;
		this._state = null;
		this._validationErrorMessage = "";
		this._validationSuccessMessage = "";
		this._hasFocus = false;
		
		for(let k in component.props){
			this._props[k] = component.props[k];
		}
		// Add additional properties
		if(options.props){
			for(let k in options.props){
				this._props[k] = options.props[k];
			}
		}
		
		this._isValid = false;
		this._doSubmit = (this._props.doSubmit) ? true : false;
		this._isRequired = this._props.required || false;
		this._control = this._props.control || this._props.htmlFor;
		
		// Validate Methods
		if(this._doSubmit && ! component.getValue) throw("Element render error. Elmt getValue method missing.");
		if(this._doSubmit && ! component.updateValueByEvent) throw("Element render error. Elmt updateValueByEvent method missing.");
		
		if(component.updateValueByEvent) this._updateValueByEvent = component.updateValueByEvent;
		if(component.getValue) this._getValue = component.getValue;
		if(component.setValue) this._setValue = component.setValue;
		
		this._handleChange = this._handleChange.bind(this);
		this._handleFocus = this._handleFocus.bind(this);
		this._handleBlur = this._handleBlur.bind(this);
		
		observable.box(this);
	}
	_handleChange(event){
		this._validationErrorMessage = "";
		this._validationSuccessMessage = "";
		if(this._updateValueByEvent) this._updateValueByEvent(event);
	}
	_handleFocus(event){
		this._hasFocus = true;
	}
	_handleBlur(event){
		this._hasFocus = false;
	}
	get name(){
		return this._name;
	}
	set name(name){
		this._name = name;
		return this;
	}
	_hasValue(){
		return this.valueExists;
	}
	get hasValue(){
		return this.valueExists();
	}
	get valueExists(){
		let value = this.getValue();
		return (value && value != "");
	}
	getValue(){
		if(this._getValue) return this._getValue();
		else return null;
	}
	get value(){
		return this.getValue();
	}
	set value(value){
		this.setValue(value);
		return this;
	}
	setValue(value){
		if(this._setValue) this._setValue(value);
		return this;
	}
	get isRequired(){
		return this._isRequired;
	}
	set isRequired(required){
		this._isRequired = required;
		return this;
	}
	get doSubmit(){
		return this._doSubmit;
	}
	set doSubmit(doSubmit){
		this.valid = doSubmit;
		return this;
	}
	set submit(doSubmit){
		this._doSubmit = doSubmit;
		return this;
	}
	get isValid(){
		return this._isValid;
	}
	set isValid(isValid){
		this.valid = isValid;
		return this;
	}
	set valid(isValid){
		this._isValid = isValid;
		return this;
	}
	get validationErrorMessage(){
		//console.log("GETTING VALIDATION ERROR MESSAGE",this._validationErrorMessage);
		return this._validationErrorMessage;
	}
	set validationErrorMessage(message){
		this._validationErrorMessage = message;
		return this;
	}
	get validationSuccessMessage(){
		return this._validationSuccessMessage;
	}
	set validationSuccessMessage(message){
		this._validationSuccessMessage = message;
		return this;
	}
	get hasFocus(){
		return this._hasFocus;
	}
	get type(){
		return this._props.type;
	}
	set type(type){
		this._props.type = type;
		return this;
	}
	get tag(){
		return this._props.tag;
	}
	set tag(tag){
		this._props.tag = tag;
		return this;
	}
	get control(){
		return this._control;
	}
	set control(control){
		this._control = control;
		return this;
	}
	get placeholder(){
		return this._props.placeholder;
	}
	set placeholder(control){
		this._props.placeholder = control;
		return this;
	}
	get content(){
		return this._props.content;
	}
	set content(control){
		this._props.content = control;
		return this;
	}
	get className(){
		return this._props.className;
	}
	set className(control){
		this._props.className = control;
		return this;
	}
	get validator(){
		return this._props.validator;
	}
	set validator(control){
		this._props.validator = control;
		return this;
	}
}
//));
decorate(FormElementDomain, {
	_props: observable,
	_hasValue: observable,
	_hasFocus: observable,
	_isValid: observable,
	_validationErrorMessage: observable,
	_validationSuccessMessage: observable
});

//		this._name = name;
//		this._props = {};
//		this._doSubmit = null;
//		this._isValid = null;
//		this._state = null;
//		this._validationErrorMessage = null;
//		this._validationSuccessMessage = null;

export class Form extends React.Component {
	constructor(props){
		super(props);
		
		if(! this.props.name) throw("Form must have a name");
		
		this.form = new FormDomain(this.props.name);
//		this.form._addElements(this.props.children);

		if(! this.props.onSubmit) throw("Form Tag Error: Must add onsubmt");
		this.form.onSubmit = this.props.onSubmit;
		
		if(this.props.validators){
			this.form.addValidators(this.props.validators);
		}
	}
	componentDidMount() {
	}
	render() {
		return (
			<Provider form={this.form}>
				<_Form elements={this.props.children} />
			</Provider>
		);
	}
}
	
export const _Form = inject("form")(observer(
	class _Form extends React.Component {
		constructor(props){
			super(props);
		}
		componentDidMount() {

		}
		render() {
			return (
				<form onSubmit={this.props.form._handleSubmit}>
					{this.props.elements}
				</form>
			);
		}
	}
));

export const FieldGroup = inject("form")(observer(
	class FieldGroup extends React.Component {
		constructor(props){
			super(props);
			this.elmt = this.props.form._addElement(this,{
				props: {
					className: (this.props.className) ? this.props.className : "field-group"
				}
			});
		}
		componentDidMount() {

		}
		render() {
			return (
				<div className={this.elmt.className}>
					{this.props.children}
				</div>
			);
		}
	}
));

export const Field = inject("form")(observer(
	class Field extends React.Component {
		constructor(props){
			super(props);
			if(! this.props.htmlFor && ! this.props.control) throw("Error tag error. Either htmlFor or control property must be defined.");
			this.elmt = this.props.form._addElement(this,{
				props: {
					className: (this.props.className) ? this.props.className : "field"
				}
			});
		}
		getClassName(){
			let className = this.elmt.className;
			let classArr = [];
			console.log("TODO: Add classes here to do effects on elements. Not working because element isn't defined yet");
			let parent = this.props.form.elmts[this.elmt.control];
			if(! parent) return this.elmt.className;
			
			classArr.push(className);
			if(! parent.valueExists) classArr.push("empty");
			if(parent.validationErrorMessage) classArr.push("error");
			if(parent.validationSuccessMessage) classArr.push("success");
			if(parent.hasFocus) classArr.push("focus");
			
			return classArr.join(" ");
		}
		componentDidMount() {
			
		}
		hasValidationErrorMessage(){
			
		}
		render() {
			return (
				<div className={this.getClassName()}>
					{this.props.children}
				</div>
			);
		}
	}
));
	
export const Input = inject(["form"])(observer(
	class Input extends React.Component {
		constructor(props){
			super(props);
			this.getValue = this.getValue.bind(this);
			this.setValue = this.setValue.bind(this);
			this.updateValueByEvent = this.updateValueByEvent.bind(this);
			// Make sure value is being sent
			// So that this is a controlled component
			this.elmt = this.props.form._addElement(this,{
				props : {
					value: props.value || "",
					doSubmit: true
				}
			});
			
			console.log("TODO: Form element templates");
//			this.errorTag = (this.props.error) ? <Error {...props.error} /> : "";
		}
		updateValueByEvent(event){
			this.elmt._props.value = event.target.value;
		}
		setValue(value){
			this.elmt._props.value = value;
		}
		getValue(name){
			return this.elmt._props.value || "";
		}
		componentDidMount() {
			
		}
		render() {
			return(
				<div className="input-container">
					<input 
						name={this.elmt.name} 
						type={this.elmt.type} 
						placeholder={this.elmt.placeholder} 
						value={this.elmt.value} 
						onChange={this.elmt._handleChange}
						onFocus={this.elmt._handleFocus}
						onBlur={this.elmt._handleBlur}
					/>
				</div>
			);
		}
	}
));

export const Button = inject("form")(observer(
	class Button extends React.Component {
		constructor(props){
			super(props);
			this.elmt = this.props.form._addElement(this,{
				props: {
					content: this.props.children,
					type: (this.props.type) ? this.props.type : "submit",
					className: (this.props.className) ? this.props.className : ""
				}
			});
		}
		componentDidMount() {

		}
		render() {
			return (
				<button 
					name={this.elmt.name} 
					type={this.elmt.type} 
				>
				{this.elmt.content}
				</button>
			);
		}
	}
));

export const Label = inject("form")(observer(
	class Label extends React.Component {
		constructor(props){
			super(props);
			if(! this.props.htmlFor && ! this.props.control) throw("Label tag error. Either htmlFor or control property must be defined.");
			this.elmt = this.props.form._addElement(this,{
				props: {
					content: this.props.children,
					className: (this.props.className) ? this.props.className : ""
				}
			});
		}
		componentDidMount() {

		}
		render() {
			return (
				<label htmlFor={this.elmt.parentName}>
					{this.elmt.content}
				</label>
			);
		}
	}
));

export const Error = inject("form")(observer(
	class Error extends React.Component {
		constructor(props){
			super(props);	
			if(! this.props.htmlFor && ! this.props.control) throw("Error tag error. Either htmlFor or control property must be defined.");
			this.elmt = this.props.form._addElement(this, {
				props: {
					tag: (this.props.tag) ? this.props.tag : "div",
					className: (this.props.className) ? this.props.className : "error"
				}
			});
		}
		hasValidationErrorMessage(){
			if(! this.props.form.elmts[this.elmt.control]) return false;
			if(this.props.form.elmts[this.elmt.control].validationErrorMessage) return true;
		}
		render() {
			if(! this.hasValidationErrorMessage()) return null;
			return React.createElement(this.elmt.tag,{
				className: this.elmt.className
			},this.props.form.elmts[this.elmt.control].validationErrorMessage);
		}
	}
));

export const Success = inject("form")(observer(
	class Success extends React.Component {
		constructor(props){
			super(props);
			if(! this.props.htmlFor && ! this.props.control) throw("Success tag error. Either htmlFor or control property must be defined.");
			this.elmt = this.props.form._addElement(this,{
				props: {
					tag: (this.props.tag) ? this.props.tag : "div",
					className: (this.props.className) ? this.props.className : "success"
				}
			});
		}
		hasValidationSuccessMessage(){
			if(! this.props.form.elmts[this.elmt.control]) return false;
			if(this.props.form.elmts[this.elmt.control].validationSuccessMessage) return true;
		}
		render() {
			if(! this.hasValidationSuccessMessage()) return null;
			return (
				<div className={this.elmt.className} >
					{this.props.form.elmts[this.elmt.control].validationSuccessMessage}
				</div>
			);
		}
	}
));

export const Errors = inject("form")(observer(
	class Errors extends React.Component {
		constructor(props){
			super(props);
	
			this.elmt = this.props.form._addElement(this,{
				props: {
					className: (this.props.className) ? this.props.className : "errors"
				}
			});

		}
		componentDidMount() {

		}
		render() {
			let errorListItems = this.props.form.getErrors().map(
				(error, index) => {
					return <li key="index">{error}</li>;
				}
			);
			return (
				<ul className={this.elmt.className} >
					{errorListItems}
				</ul>
			);
		}
	}
));