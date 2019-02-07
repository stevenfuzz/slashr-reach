import React from 'react';
import { Provider, observer, inject } from 'mobx-react';
import { decorate, observable, action, computed } from "mobx";
//import { CSSTransition } from 'react-transition-group';


import DayPickerInput from 'react-day-picker/DayPickerInput';
import './DayPicker.css'
// import DayPicker from 'react-day-picker/DayPicker';
// import 'react-day-picker/lib/style.css';
// import { formatDate, parseDate, } from 'react-day-picker/moment'

import { default as ReactSelect } from 'react-select';
import { default as ReactSelectAsync } from 'react-select/lib/Async';
import { Slashr } from './Slashr';
import { Container } from './Element';
import {Mention, MentionsInput} from 'react-mentions';

class FormDomain {
	constructor(name, props = {}) {
		if (!props.onSubmit) throw ("Form Tag Error: Must add onsubmt");

		this._name = name;
		this._idx = 1;
		this._errors = [];
		this._elmts = {};
		this._isValid = {};
		this._validators = {};
		this._onSubmit = null;
		this._control = null;
		this._handleSubmit = this._handleSubmit.bind(this);
		this._handleReset = this._handleReset.bind(this);
		//console.log("TODO: Move default form validators");

		this._onSubmit = props.onSubmit;
		this._onReset = props.onReset || null;
		this._onFocus = props.onFocus || null;
		this._submitOnEnter = (props.submitOnEnter === false) ? false : true;

		if (props.validators) {
			this.addValidators(props.validators);
		}
		this._submitOnChange = (props.submitOnChange) ? true : false;

	}
	
	get name() {
		return this._name;
	}
	set name(name) {
		this._name = name;
		return this;
	}
	get elements() {
		return this._elmts;
	}
	set elements(elements) {
		throw ("Cannot set elements")
	}
	get elmts() {
		return this.elements;
	}
	set elmts(elements) {
		throw ("Cannot set elements")
	}

	get isValid() {
		return this._isValid;
	}
	set isValid(isValid) {
		this.valid = isValid;
	}
	set valid(isValid) {
		this._isValid = isValid;
	}
	get submitOnChange() {
		return this._submitOnChange;
	}
	get submitOnEnter(){
		return this._submitOnEnter;
	}
	get onReset() {
		return this._onReset;
	}
	get onSubmit() {
		return this._onSubmit;
	}
	set onSubmit(onSubmit) {
		this.submit = onSubmit;
	}
	set submit(onSubmit) {
		this._onSubmit = onSubmit;
	}
	get _defaultValidators() {
		return {
			url: (value) => {
				if (!value) return true;
				let r = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
				if (r.test(value)) return true;
				else return { error: "Please enter a valid url" };
			},
			email: (value) => {
				var re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
				if (re.test(value)) return true;
				else return { error: "Please enter a valid email." }
				return;
			},
		};
	}
	get validators() {
		return this._validators;
	}
	set validators(validators) {
		this._validators = validators;
	}
	addValidators(validators) {
		for (let name in validators) {
			this._validators[name] = validators[name];
		}
	}
	toFormData() {
		let formData = new FormData();
		let formMetadata = {
			name: this.name,
			elmts: {}
		};
		for (let name in this.elmts) {
			if (!this._elmts[name].doSubmit) continue;
			formMetadata.elmts[name] = {
				tag: this.elmts[name].tag,
				type: this.elmts[name].type
			}

			let value = this.elmts[name].getValue();

			if (!this.elmts[name].isFile() && typeof value === 'object') {
				if (value.getTime) {
					//console.log("TODO: Find better way to see if date");
					value = value.getTime();
					formMetadata.elmts[name].dataType = "date";
				}
				else {
					value = JSON.stringify(value);
					formMetadata.elmts[name].dataType = "json";
				}

			}

			formData.append(name, value);

			formData.append('_slashrFormMetadata', JSON.stringify(formMetadata));
		}
		return formData;
	}
	get values() {
		return this.getValues();
	}
	set values(values) {
		return this.setValues(values);
	}
	getValues() {
		let ret = {};
		for (let name in this._elmts) {
			if (!this._elmts[name].doSubmit) continue;
			ret[name] = this._elmts[name].getValue();
		}
		return ret;
	}
	setValues(values) {
		let ret = {};
		for (let name in values) {
			if (!this._elmts[name]) continue;
			this._elmts[name].setValue(values[name]);
		}
		this.clearErrors();
		return this;
	}
	reset(){
		for (let name in this.elmts) {
			this._elmts[name].setValue(null);
		}
		this.errors = [];
		return this;
	}
	get errors() {
		return this.getErrors();
	}
	set errors(errors) {
		this._errors = errors;
	}
	clearErrors(){
		this.errors = [];
	}
	getErrors() {
		return this._errors;
	}
	addError(error) {
		this.errors.push(error);
	}
	async _handleSubmit(event) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}

		if (!this._onSubmit) throw ("Form error: onSubmit must be set in the form tag.");

		await this.validate();

		if (this._isValid) {
			this._errors = [];
			this._onSubmit(this);
		}
	}
	async _handleReset(event) {
		if (this.onReset) this.onReset(this, event);
	}
	_handleKeyDown(event){
		if(event.keyCode === 13 && event.target.tagName != "TEXTAREA"){
			// console.log("keypress event in form", event, event.target.tagName);
			event.preventDefault();
		}
	}
	_addElement(component, options = {}) {
		let idx = ++this._idx;
		let name = component.props.name || ("elmt" + idx);
		this._elmts[name] = new FormElementDomain(this, name, component, options);
		return this._elmts[name];
	}
	

	// Validators must return success or error. 
	// If success or error is a string, success or error labels will be set
	async validate() {

		this.valid = true;
		for (let name in this.elmts) {

			let val = this.elmts[name].value;
			let hasValidionError = false;

			this.elmts[name].valid = false;
			this.elmts[name].validationErrorMessage = "";
			this.elmts[name].validationSuccessMessage = "";

			// Check for non required
			if (!this.elmts[name].isRequired && !this.elmts[name].validator) {
				this.elmts[name].valid = true;
			}
			// Check if required
			else if (this.elmts[name].isRequired && (!val || (typeof val === "string" && val.trim() === "") || (typeof val === "object" && val.length === 0))) {
				this.elmts[name].valid = false;
				this.elmts[name].validationErrorMessage = (typeof this.elmts[name].isRequired === "string") ? this.elmts[name].isRequired : "Value Required";
			}
			// Check if there are validators
			else if (this.elmts[name].validator) {
				let validator = {};

				// Check for string (single), array (no options) or object
				if (typeof this.elmts[name].validator === "string") validator[this.elmts[name].validator] = true;
				else if (Array.isArray(this.elmts[name].validator)) {
					this.elmts[name].validator.map(
						(value) => {
							validator[value] = true;
						}
					);
				}
				else validator = this.elmts[name].validator;

				for (let i in validator) {
					let opts = (typeof validator[i] === "object") ? validator[i] : {};
					let validatorFn = null;
					if (!this._validators[i]) {
						if (this._defaultValidators[i]) {
							validatorFn = this._defaultValidators[i];
						}
						else throw ("Unable to find validator: '" + i + "'");
					}
					else validatorFn = this._validators[i];

					let rslt = { error: "Unable to complete request" };
					//					try{
					rslt = await validatorFn(val, opts, this);
					if (rslt) {
						if (rslt === true) {
							this.elmts[name].valid = true;
							this.elmts[name].validationErrorMessage = "";
						}
						else if (rslt.error) {
							this.elmts[name].valid = false;
							this.elmts[name].validationErrorMessage = (typeof rslt.error === "string") ? rslt.error : "Not Valid";
						}
						else if (rslt.success) {
							this.elmts[name].valid = true;
							this.elmts[name].validationSuccessMessage = (typeof rslt.success === "string") ? rslt.success : "";
						}
						if (rslt.value) {
							this.elmts[name].value = rslt.value;
						}
					}
					else {
						this.elmts[name].valid = false;
						this.elmts[name].validationErrorMessage = "Unknown Validation Error";
					}
					if (!this.elmts[name].isValid) break;

					//					}
					//					
					//					catch(err){
					//						console.log(err);
					//						throw("Validation Error Unknown");
					//					}
				}
			}
			else {
				this.elmts[name].valid = true;
			}

			// Update the form
			if (!this.elmts[name].isValid) {
				this.valid = false;
			}
			// Update validation message
			if (this.elmts[name].isValid) this.elmts[name].validationErrorMessage = false;
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
class FormElementDomain {
	constructor(form, name, component, options = {}) {
		this._form = form;
		this._name = name;
		this._props = {};
		this._doSubmit = null;
		this._isValid = null;
		this._isRequired = null;
		this._hasValue = null;
		this._state = null;
		this._ref = null;
		this._validationErrorMessage = "";
		this._validationSuccessMessage = "";
		this._hasFocus = false;

		for (let k in component.props) {
			this._props[k] = component.props[k];
		}
		// Add additional properties
		// console.log("autofocus",options.props);
		// console.log("autofocus",options.props.autoFocus);
		// console.log("SLDKJFLSKD JFLKSDJ FLKJSD FLKJSD LFKJ FLSKDJF");
		if (options.props) {
			for (let k in options.props) {
				this._props[k] = options.props[k];
			}
		}
		this._isValid = false;
		this._doSubmit = (this._props.doSubmit) ? true : false;
		this._isRequired = this._props.required || false;
		this._control = this._props.control || this._props.htmlFor;

		// Validate Methods
		if (this._doSubmit && !component.getValue) throw ("Element render error. Elmt getValue method missing.");
		if (this._doSubmit && !component.updateValueByEvent) throw ("Element render error. Elmt updateValueByEvent method missing.");

		if (component.updateValueByEvent) this._updateValueByEvent = component.updateValueByEvent;
		if (component.getValue) this._getValue = component.getValue;
		if (component.setValue) this._setValue = component.setValue;

		this._handleChange = this._handleChange.bind(this);
		this._handleKeyPress = this._handleKeyPress.bind(this);
		this._handleKeyUp = this._handleKeyUp.bind(this);
		this._handleKeyDown = this._handleKeyDown.bind(this);

		this._handleFocus = this._handleFocus.bind(this);
		this._handleBlur = this._handleBlur.bind(this);

		// Check if this is a file
		this.ref = React.createRef();

		observable.box(this);
	}
	_handleChange(event) {
		this._validationErrorMessage = "";
		this._validationSuccessMessage = "";
		if (this._updateValueByEvent) this._updateValueByEvent(event);
		if (this._props.onChange) this._props.onChange(this, this.form, event);
		if (this._form.submitOnChange) {
			this._form._handleSubmit();
		}
	}
	_handleFocus(event) {
		this._hasFocus = true;
		if (this._props.onFocus) this._props.onFocus(this, this.form);
	}
	_handleBlur(event) {
		this._hasFocus = false;
		if (this._props.onBlur) this._props.onBlur(this, this.form);
	}
	_handleKeyPress(event) {
		if (this._props.onKeyPress) this._props.onKeyPress(this, this.form, event);
	}
	_handleKeyUp(event) {
		if (this._props.onKeyUp) this._props.onKeyUp(this, this.form, event);
	}
	_handleKeyDown(event) {
		if (this._props.onKeyDown) this._props.onKeyDown(this, this.form, event);
	}
	get form() {
		return this._form;
	}
	get name() {
		return this._name;
	}
	set name(name) {
		this._name = name;
		return this;
	}
	_hasValue() {
		return this.valueExists;
	}
	get hasValue() {
		return this.valueExists();
	}
	get valueExists() {
		let value = this.getValue();
		return (value && value != "") ? true : false;
	}
	getValue() {
		if (this._getValue) return this._getValue();
		else return null;
	}
	get value() {
		return this.getValue();
	}
	set value(value) {
		this.setValue(value);
		return this;
	}
	setValue(value) {
		if (this._setValue) this._setValue(value);
		return this;
	}
	get hiddenValueExists() {
		let hiddenValue = this.getHiddenValue();
		return (hiddenValue && hiddenValue != "") ? true : false;
	}
	get hasHiddenValue() {
		return this.hiddenValueExists;
	}
	get hiddenValue() {
		return this.getHiddenValue();
	}
	set hiddenValue(hiddenValue) {
		this.setHiddenValue(hiddenValue);
		return this;
	}
	getHiddenValue() {
		return this._props.hiddenValue;
	}
	setHiddenValue(hiddenValue) {
		this._props.hiddenValue = hiddenValue;
		return this;
	}
	get valueLabel() {
		return this.getValueLabel();
	}
	set valueLabel(valueLabel) {
		this.setValueLabel(valueLabel);
		return this;
	}
	setValueLabel(valueLabel) {
		this._props.valueLabel = valueLabel;
		return this;
	}
	getValueLabel(valueLabel) {
		return this._props.valueLabel;
	}
	get isRequired() {
		return this._isRequired;
	}
	set isRequired(required) {
		this._isRequired = required;
		return this;
	}
	get doSubmit() {
		return this._doSubmit;
	}
	set doSubmit(doSubmit) {
		this.valid = doSubmit;
		return this;
	}
	set submit(doSubmit) {
		this._doSubmit = doSubmit;
		return this;
	}
	get isValid() {
		return this._isValid;
	}
	set isValid(isValid) {
		this.valid = isValid;
		return this;
	}
	set valid(isValid) {
		this._isValid = isValid;
		return this;
	}
	get validationErrorMessage() {
		//console.log("GETTING VALIDATION ERROR MESSAGE",this._validationErrorMessage);
		return this._validationErrorMessage;
	}
	set validationErrorMessage(message) {
		this._validationErrorMessage = message;
		return this;
	}
	get validationSuccessMessage() {
		return this._validationSuccessMessage;
	}
	set validationSuccessMessage(message) {
		this._validationSuccessMessage = message;
		return this;
	}
	get hasFocus() {
		return this._hasFocus;
	}
	get type() {
		return this._props.type;
	}
	set type(type) {
		this._props.type = type;
		return this;
	}
	get imageSrc() {
		return this._props.imageSrc || null;
	}
	set imageSrc(imageSrc) {
		this._props.imageSrc = imageSrc;
		return this;
	}
	get icon() {
		return this._props.icon;
	}
	set icon(icon) {
		this._props.icon = icon;
		return this;
	}
	get tag() {
		return this._props.tag;
	}
	set tag(tag) {
		this._props.tag = tag;
		return this;
	}
	get dataType() {
		return this._props.dataType;
	}
	set dataType(dataType) {
		this._props.dataType = dataType;
		return this;
	}
	get ref() {
		return this._ref;
	}
	set ref(ref) {
		this._ref = ref;
		return this;
	}
	get rows() {
		return this._props.rows;
	}
	set rows(rows) {
		this._props.rows = rows;
		return this;
	}
	get control() {
		return this._control;
	}
	set control(control) {
		this._control = control;
		return this;
	}
	get placeholder() {
		return this._props.placeholder;
	}
	set placeholder(control) {
		this._props.placeholder = control;
		return this;
	}
	get content() {
		return this._props.content;
	}
	set content(content) {
		this._props.content = content;
		return this;
	}
	get choices() {
		return this._props.choices;
	}
	setChoices(choices) {
		this._props.choices = choices;
		return this;
	}
	set choices(choices) {
		return this.setChoices(choices);
	}
	get className() {
		return this._props.className;
	}
	set className(control) {
		this._props.className = control;
		return this;
	}
	get validator() {
		return this._props.validator;
	}
	set validator(control) {
		this._props.validator = control;
		return this;
	}
	get autoComplete() {
		return (this._props.autoComplete === false || this._props.autoComplete === "off") ? "off" : null;
	}
	get autoFocus() {
		return (this._props.autoFocus) ? true : null;
	}
	get autoSize() {
		return (this._props.autoSize) ? true : false;
	}
	isHidden() {
		return (this.tag === "input" && this.type === "hidden");
	}
	isFile() {
		return (this.tag === "input" && this.type === "file");
	}
	isDate() {
		return (this.tag === "input" && this.type === "date");
	}
}
//));
decorate(FormElementDomain, {
	_props: observable,
	_hasValue: observable,
	_hasFocus: observable,
	_isValid: observable,
	_validationErrorMessage: observable,
	_validationSuccessMessage: observable,
	value: computed,
	setValue: action
});

//		this._name = name;
//		this._props = {};
//		this._doSubmit = null;
//		this._isValid = null;
//		this._state = null;
//		this._validationErrorMessage = null;
//		this._validationSuccessMessage = null;

export class Form extends React.Component {
	constructor(props) {
		super(props);

		if (!this.props.name) throw ("Form must have a name");

		this.form = new FormDomain(this.props.name, this.props);
		//		this.form._addElements(this.props.children);
	}
	componentDidMount() {
		if (this.props.values) this.form.setValues(this.props.values);
	}
	componentDidUpdate(prevProps, prevState, snapshot) {
		if (this.props.values && !Slashr.utils.core.arePropsEqual(this.props.values, prevProps.values)) this.form.setValues(this.props.values);
	}
	// componentDidUpdate() {
	// 	console.log(this.props.values);
	// 	if(this.props.values) this.form.setValues(this.props.values);
	// }
	render() {
		return (
			<Provider form={this.form}>
				<_Form elements={this.props.children} {...this.props}/>
			</Provider>
		);
	}
}

export const _Form = inject("form")(observer(
	class _Form extends React.Component {
		constructor(props) {
			super(props);
		}
		render() {
			return (
				<form 
					className={this.props.className}
					onFocus={this.props.form._onFocus}
					onSubmit={this.props.form._handleSubmit} 
					onReset={(this.props.form._onReset) ? this.props.form._handleReset : null}
					onKeyDown={this.props.form.submitOnEnter === false ? this.props.form._handleKeyDown : null}
				>
					{this.props.elements}
				</form>
			);
		}
	}
));

export const FieldGroup = inject("form")(observer(
	class FieldGroup extends React.Component {
		constructor(props) {
			super(props);
			this.elmt = this.props.form._addElement(this, {
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
		constructor(props) {
			super(props);
			if (!this.props.htmlFor && !this.props.control) throw ("Error tag error. Either htmlFor or control property must be defined.");
			let className = "field";
			if(this.props.className) className += ` ${this.props.className}`;
			this.elmt = this.props.form._addElement(this, {
				props: {
					className: className
				}
			});
		}
		getClassName() {
			let className = this.elmt.className;
			let classArr = [];
			let parent = this.props.form.elmts[this.elmt.control];
			if (!parent) return this.elmt.className;

			classArr.push(className);
			if (!parent.valueExists) classArr.push("empty");
			if (parent.validationErrorMessage) classArr.push("error");
			if (parent.validationSuccessMessage) classArr.push("success");
			if (parent.hasFocus) classArr.push("focus");

			return classArr.join(" ");
		}
		componentDidMount() {

		}
		hasValidationErrorMessage() {

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
		constructor(props) {
			super(props);
			this.getValue = this.getValue.bind(this);
			this.setValue = this.setValue.bind(this);
			this.updateValueByEvent = this.updateValueByEvent.bind(this);
			this.handleOnChange = this.handleOnChange.bind(this);
			// Make sure value is being sent
			// So that this is a controlled component
			let nProps = {
				value: props.value || "",
				doSubmit: true,
				tag: (props.multiline) ? "textarea" : "input",
				type: props.type || "text",
			};
			if (props.multiline && props.autoSize) {
				nProps.autoSize = props.autoSize;
			}
			if(props.autoFocus) nProps.autoFocus = true;
			this.elmt = this.props.form._addElement(this, { props: nProps });

			//console.log("TODO: Form element templates");

		}
		updateValueByEvent(event) {
			this.elmt._props.value = event.target.value;
		}
		setValue(value) {
			this.elmt._props.value = value;
		}
		getValue(name) {
			return this.elmt._props.value || "";
		}
		componentDidUpdate(prevProps, prevState, snapshot) {
			if (this.props.value != prevProps.value) this.elmt.setValue(this.props.value);
			if (this.elmt.autoSize) this.autoSize();
			// Allow hidden elmnts to emit on change
			if(this.elmt.isHidden() && this.props.value !== prevProps.value){
				if(this.props.onChange) this.props.onChange(this.elmt, this.props.form);
			}
		}
		componentDidMount(){
			if (this.elmt.autoSize) this.autoSize();
			if (this.elmt.autoFocus) this.autoFocus();
		}
		autoFocus(){
			setTimeout(()=>{this.elmt.ref.current.focus();},250);
		}
		autoSize(){
			if(this.autoSizeTimeout) return;
			this.autoSizeTimeout = setTimeout(()=>{
				if(! this.elmt.ref.current){
					this.autoSizeTimeout = false;
					return;
				}
				this.elmt.ref.current.style.height = (this.props.style && this.props.style.height) ? this.props.style.height : null;
				if (this.elmt.ref.current.clientHeight !== this.elmt.ref.current.scrollHeight) {
					console.log(this.elmt.ref.current.scrollHeight);
					this.elmt.ref.current.style.height = `${this.elmt.ref.current.scrollHeight}px`;
				}

				this.autoSizeTimeout = false;
			},5);
		
		}
		handleOnChange(event) {
			if (this.elmt.autoSize) this.autoSize();
			if (this.elmt._handleChange) this.elmt._handleChange(event);
		}
		render() {
			let nProps = {
				name: this.elmt.name,
				type: this.elmt.type,
				placeholder: this.elmt.placeholder,
				value: this.elmt.value,
				onChange: this.elmt._handleChange,
				onFocus: this.elmt._handleFocus,
				onBlur: this.elmt._handleBlur,
				onKeyPress: (this.props.onKeyPress) ? this.elmt._handleKeyPress : null,
				onKeyUp: (this.props.onKeyUp) ? this.elmt._handleKeyUp : null,
				onKeyDown: (this.props.onKeyDown) ? this.elmt._handleKeyDown : null,
				ref: this.elmt.ref,
				className: this.elmt.className,
				autoComplete: this.elmt.autoComplete,
				rows: this.elmt.rows || 1
			};

			if (this.elmt.autoSize) {
				nProps.onChange = this.handleOnChange;
			}

			// Check if it is a file, and set associate ref
			// if (this.elmt.isFile()) {
			// 	nProps.ref = this.elmt.ref;
			// }
			let input = React.createElement(this.elmt.tag, nProps);
			let className = "input-container input";
			let floatingLabel = this.props.floatingLabel ?
				<Label className="floating" control={this.elmt.name}>{this.props.floatingLabel}</Label> :
				null;
			if (this.elmt.icon) className += " icon";
			{this.elmt.icon}
			
			if (!this.elmt.isHidden()) input = (
				<div className={className}>{this.elmt.icon}{input}{floatingLabel}</div>
			);

			return input;
		}
	}
));
export const TextArea = inject(["form"])(observer(
	class TextArea extends React.Component {
		render() {
			return (
				<Input
					{...this.props}
					multiline
					rows={this.props.rows || 1}
				/>
			);
		}
	}
));
// export const File = inject(["form"])(observer(
// 	class File extends React.Component {
// 		componentDidMount(){
// 			console.log("SLDKFJSLDKJ FSDLKFJ SDLKJF LSKDJF");
// 			console.log(this.props);
// 		}
// 		componentWillUpdate(prevProps){
// 			console.log(this.props);
// 		}
// 		render() {
// 			return (
// 				<Input
// 					{...this.props}
// 					type="file"
// 				/>
// 			);
// 		}
// 	}
// ));


export const ImageSelectArea = inject(["form"])(observer(
	class ImageSelectArea extends React.Component {
		constructor(props) {
			super(props);
			// this.handleImageChange = this.handleImageChange.bind(this);
			this.handleImageRemove = this.handleImageRemove.bind(this);
			//TODO: Use mobx instead with the form class
			this.imageSrc = this.props.imageSrc || null;
			

			if (!this.props.imageSelectButton) throw ("Image Select Area tag error. Must define image select button.");
			if (!this.props.imageRemoveButton) throw ("Image Select Area tag error. Must define image remove button.");
		}
		get elmt(){
			return this.props.form.elmts[this.props.name] || {};
		}
		handleImageRemove(){
			this.elmt.hiddenValue = false;
			this.elmt.value = "";
			this.elmt.valueLabel = "";
			this.elmt.imageSrc = null;
		}
		componentDidMount(){
			if(this.props.imageSrc){
				this.elmt.imageSrc = this.props.imageSrc;
			}
		}
		componentWillReact(){
			// if(this.props.imageSrc !== this.elmt.imageSrc){
			// 	this.elmt.imageSrc = this.props.imageSrc;
			// }
		}
		componentDidUpdate(prevProps){
			if(prevProps.imageSrc !== this.props.imageSrc){
				this.elmt.imageSrc = this.props.imageSrc;
			}
		}
		render(){
			let style = {};
			let imageSrc = (this.elmt.imageSrc || this.props.placeholderImageSrc)
			if(imageSrc) style.backgroundImage = `url(${imageSrc})`;
			let imageRemoveButton = React.cloneElement(this.props.imageRemoveButton, {
				onClick: this.handleImageRemove
			});
			let className = "image-select-area-container";
			if(this.props.className) className += ` ${this.props.className}`;
			return(
				<Container
					className={className}
					style={style}
				>
					{false && this.elmt.imageSrc && 
						<img className="image-select-area-image" src={this.elmt.imageSrc} />
					}
					<div className="image-select-area-buttons">
						<div className="image-select-area-select-button">
							<ImageSelectButton 
								name={this.props.name}
								button={this.props.imageSelectButton}
								// onChange={this.handleImageChange}
							/>
						</div>

						{this.elmt.imageSrc && <div className="image-select-area-remove-button">{imageRemoveButton}</div>}
					</div>
				</Container>
			);
		}
	}
));

export const ImagePreview = inject("form")(observer(
	class ImagePreview extends React.Component {
		constructor(props) {
			super(props);
			this.handleImageRemove = this.handleImageRemove.bind(this);
			if (!this.props.htmlFor && !this.props.control) throw ("Image Preview tag error. Either htmlFor or control property must be defined.");
			if (!this.props.button) throw ("Image Preview tag error. Button requires to remove image.");

		}
		handleImageRemove(){
			this.elmt.hiddenValue = false;
			this.elmt.value = "";
			this.elmt.valueLabel = "";
			this.elmt.imageSrc = "";
		}
		get elmt(){
			let name = this.props.htmlFor || this.props.control
			return this.props.form.elmts[name] || {};
		}
		render() {
			let imageRemoveButton = React.cloneElement(this.props.button, {
				onClick: this.handleImageRemove
			});
			return (
				<Container
					className="image-preview"
					hide
					unmountOnHide
					fadeToggle={this.elmt.imageSrc ? true : false }
				>
					{imageRemoveButton}
					<img alt="Image" src={this.elmt.imageSrc} />
				</Container>
			);
		}
	}
));

export const ImageSelectButton = inject("form")(observer(
	class ImageSelectButton extends React.Component {
		constructor(props) {
			super(props);
			if (!this.props.button) throw ("Image Select Button tag error. Must define select button.");
			this.handleImageChange = this.handleImageChange.bind(this);

			// this.handleOnChange = this.handleOnChange.bind(this);
		}
		get elmt(){
			return this.props.form.elmts[this.props.name] || {};
		}
		componentDidMount(){
			if(this.props.imageSrc){
				this.elmt.imageSrc = this.props.imageSrc;
			}
		}
		componentWillReact(){
			// if(this.props.imageSrc !== this.elmt.imageSrc){
			// 	this.elmt.imageSrc = this.props.imageSrc;
			// }
		}
		componentDidUpdate(prevProps){
			if(prevProps.imageSrc !== this.props.imageSrc){
				this.elmt.imageSrc = this.props.imageSrc;
			}
		}
		handleImageChange(elmt, form, event){
			let reader = new FileReader();
			reader.onload = () => {
				this.elmt.imageSrc = reader.result;
				if(this.props.onChange) this.props.onChange(elmt, form, event); 
			};
			reader.readAsDataURL(event.target.files[0]);
		}
		render() {
			let imageSelectButton = React.cloneElement(this.props.button, {
				onClick: null
			})
			return (
				<div className="image-select-icon-container">
					<Label control={this.props.name}>
						<div className="image-select-icon">
							{imageSelectButton}
						</div>
						<File
							onChange={this.handleImageChange}
							className="image-select-icon-file"
							name={this.props.name}
							fileRemoveButton={false}
						/>
					</Label>
				</div>
			);
			
		}
	}
));

export const File = inject(["form"])(observer(
	class File extends React.Component {
		constructor(props) {
			super(props);
			this.getValue = this.getValue.bind(this);
			this.setValue = this.setValue.bind(this);
			this.updateValueByEvent = this.updateValueByEvent.bind(this);
			this.handleRemoveClick = this.handleRemoveClick.bind(this);
			// Make sure value is being sent
			// So that this is a controlled component
			let nProps = {
				value: props.value || "",
				doSubmit: true,
				tag: "input",
				type: "file",
				valueLabel: props.valueLabel || "",
				hiddenValue: props.value || false,
			};
			this.elmt = this.props.form._addElement(this, { props: nProps });
		}
		handleRemoveClick() {
			this.elmt.hiddenValue = false;
			this.elmt.value = "";
			this.elmt.valueLabel = "";
			// this.elmt._props.hiddenValue = false;
			// this.elmt._props.valueLabel = "";
			// console.log("UPDATING VALUE");
			// this.elmt._props.value = "";
			// this.elmt._props.hiddenValue = false;
		}
		updateValueByEvent(event) {
			let value = event.target.value;
			this.elmt._props.hiddenValue = false;
			this.elmt._props.value = event.target.value;
			this.elmt._props.valueLabel = (value) ? value.replace("C:\\fakepath\\", "") : "";
		}
		setValue(value) {
			this.elmt._props.value = "";
			this.elmt._props.hiddenValue = value;
			this.elmt._props.valueLabel = value;
			// if(this.elmt.imageSrc){
			// 	console.log("1234 setVal img src",value,this.elmt.imageSrc);
			// 	this.elmt.imageSrc = null;
			// }
		}
		getValue(name) {
			if (this.elmt._props.hiddenValue) return this.elmt.hiddenValue;
			else if (this.elmt._props.value && this.elmt._props.value != "" && this.elmt.ref.current && this.elmt.ref.current.files) {
				return this.elmt.ref.current.files[0];
			}
			else return "";
		}
		componentDidMount() {

		}
		componentDidUpdate(prevProps) {
			if (this.props.value !== prevProps.value) {
				if (!this.props.value) this.elmt.value = null;
			}
		}
		render() {

			let doShowFileInput = !(this.elmt.valueExists || this.elmt.hiddenValueExists);
			if(this.props.fileRemoveButton === false) doShowFileInput = true;
			let iProps = {
				name: this.elmt.name,
				type: "file",
				placeholder: this.elmt.placeholder,
				value: this.elmt._props.value,
				onChange: this.elmt._handleChange,
				onFocus: this.elmt._handleFocus,
				onBlur: this.elmt._handleBlur,
				className: this.elmt.className,
				ref: this.elmt.ref,
				style: (!doShowFileInput) ? { display: "none" } : null
			};
			let fileInput = React.createElement(this.elmt.tag, iProps);
			let removeFileControls = <div className="file-remove"><button type="button" onClick={this.handleRemoveClick}>Remove</button>{this.elmt.valueLabel}</div>
			return (
				<div className="input-container file">
					{(!doShowFileInput) && removeFileControls}
					{fileInput}
				</div>
			);
		}
	}
));
export const Hidden = inject(["form"])(observer(
	class Hidden extends React.Component {
		render() {
			return (
				<Input
					{...this.props}
					type="hidden"
				/>
			);
		}
	}
));


export const SelectNative = inject(["form"])(observer(
	class SelectNative extends React.Component {
		constructor(props) {
			super(props);
			this.getValue = this.getValue.bind(this);
			this.setValue = this.setValue.bind(this);
			this.updateValueByEvent = this.updateValueByEvent.bind(this);
			// Make sure value is being sent
			// So that this is a controlled component
			let nProps = {
				value: props.value || "",
				doSubmit: true
			};

			this.elmt = this.props.form._addElement(this, { props: nProps });
			//console.log("TODO: Form element templates");

		}
		updateValueByEvent(event) {
			this.elmt._props.value = event.target.value;
		}
		setValue(value) {
			this.elmt._props.value = value;
		}
		getValue(name) {
			return this.elmt._props.value || "";
		}

		componentDidMount() {

		}
		render() {

			let nProps = {
				name: this.elmt.name,
				type: this.elmt.type,
				placeholder: this.elmt.placeholder,
				value: this.elmt.value,
				onChange: this.elmt._handleChange,
				onFocus: this.elmt._handleFocus,
				onBlur: this.elmt._handleBlur,
				className: this.elmt.className
			};
			return (
				<div className="input-container">
					<select {...nProps}>
						{this.elmt.choices.map(choice => (
							<option value={choice.value}>
								{choice.name}
							</option>
						))}
					</select>
				</div>
			);
		}
	}
));

export const SocialInput = inject(["form"])(observer(
	class SocialInput extends React.Component {
		constructor(props) {
			super(props);
			this.getValue = this.getValue.bind(this);
			this.setValue = this.setValue.bind(this);
			this.updateValueByEvent = this.updateValueByEvent.bind(this);
			this.displayTransform = this.displayTransform.bind(this);
			this.renderMentionSuggestion = this.renderMentionSuggestion.bind(this);
			this.renderTagSuggestion = this.renderTagSuggestion.bind(this);
			// Make sure value is being sent
			// So that this is a controlled component
			let nProps = {
				value: props.value || "",
				doSubmit: true
			};

			this.elmt = this.props.form._addElement(this, { props: nProps });
			//console.log("TODO: Form element templates");

		}
		updateValueByEvent(event) {
			this.elmt._props.value = event.target.value;
		}
		displayTransform(id, display, type){
			let ret = null;
			switch(type){
				case "mention":
					ret = `@${display}`;
				break;
				case "tag":
					ret = `#${display}`;
				break;
			}
			return ret;
		}
		setValue(value) {
			this.elmt._props.value = value;
		}
		getValue(name) {
			return this.elmt._props.value || "";
		}

		componentDidMount() {
			if (this.elmt.autoFocus) this.autoFocus();
		}
		autoFocus(){
			setTimeout(()=>{
				if(! this.elmt.ref.current) return;
				this.elmt.ref.current.focus();
			},350);
			
			// setTimeout(()=>{this.elmt.ref.current.focus();},250);
		}
		async mentionLoader(type, value, callback){
			let ret = await this.elmt._props.mentionLoader(type, value);
			console.log("Mention Loader got value...",ret);
			if(ret && ret.length) callback(ret);
		}
		renderTagSuggestion(entry, search, highlightedDisplay, index, focused){
			return this.props.suggestionRenderer("tag",entry, search, highlightedDisplay, index, focused);
		}
		renderMentionSuggestion(entry, search, highlightedDisplay, index, focused){
			return this.props.suggestionRenderer("mention",entry, search, highlightedDisplay, index, focused);
		}
		
		render() {
			let nProps = {
				name: this.elmt.name,
				type: this.elmt.type,
				placeholder: this.elmt.placeholder,
				value: this.elmt.value,
				onChange: this.elmt._handleChange,
				onFocus: this.elmt._handleFocus,
				onBlur: this.elmt._handleBlur,
				inputRef: this.elmt.ref
			};
			nProps.className = "social-input";
			if(this.elmt.className) nProps.className += ` ${this.elmt.className}`;
			return (
				<div className="input-container">
					<MentionsInput 
						{...nProps}
						className="social-input"
						markup="@[__type__:__display__:__id__]"
						displayTransform={this.displayTransform}
					>
						<Mention
							type="mention"
							trigger="@"
							data={(value,callback)=>{
								this.mentionLoader("mention",value, callback);
							}}
							renderSuggestion={this.props.suggestionRenderer && this.renderMentionSuggestion}
						/>
						<Mention
							type="tag"
							trigger="#"
							data={(value,callback)=>{
								this.mentionLoader("tag",value, callback);
							}}
							renderSuggestion={this.props.suggestionRenderer && this.renderTagSuggestion}
						/>
					</MentionsInput>
				</div>
			);
		}
	}
));

export const Select = inject(["form"])(observer(
	class Select extends React.Component {
		constructor(props) {
			super(props);
			this.getValue = this.getValue.bind(this);
			this.setValue = this.setValue.bind(this);
			this.updateValueByEvent = this.updateValueByEvent.bind(this);
			// Make sure value is being sent
			// So that this is a controlled component
			let nProps = {
				value: props.value || "",
				doSubmit: true
			};

			this.elmt = this.props.form._addElement(this, { props: nProps });
			//console.log("TODO: Form element templates");

		}
		updateValueByEvent(value) {
			this.elmt._props.value = value;
		}
		setValue(value) {
			let val = null;
			if (typeof value === "object") {
				if (value.value) val = value.value;
			}
			else val = value;
			for (let choice of this.elmt.choices) {
				if (choice.value === val) {
					this.elmt._props.value = choice;
					break;
				}
			}
		}
		getValue(name) {
			if(this.elmt._props.value){
				return this.elmt._props.value.value || this.elmt._props.value;
			}
			else return null;
		}
		componentDidUpdate(prevProps) {
			if (!Slashr.utils.core.arePropsEqual(this.props.choices, prevProps.choices)) {
				this.elmt.setChoices(this.props.choices);
			}
		}

		componentDidMount() {

		}
		render() {
			let nProps = {
				name: this.elmt.name,
				type: this.elmt.type,
				isClearable: this.elmt._props.clearable || null,
				placeholder: this.elmt.placeholder || false,
				value: this.elmt._props.value,
				onChange: this.elmt._handleChange,
				onFocus: this.elmt._handleFocus,
				onBlur: this.elmt._handleBlur,
				className: this.elmt.className,
				classNamePrefix: "select",
				options: this.elmt.choices
			};
			let className = "input-container select";
			if (this.elmt.icon) className += " icon";
			let floatingLabel = this.props.floatingLabel ?
				<Label className="floating" control={this.elmt.name}>{this.props.floatingLabel}</Label> :
				null;
			return (
				<div className={className}>
					{this.elmt.icon}
					<ReactSelect {...nProps} />
					{floatingLabel}
				</div>
			);
		}
	}
));

export const AutoComplete = inject(["form"])(observer(
	class AutoComplete extends React.Component {
		constructor(props) {
			super(props);
			this.getValue = this.getValue.bind(this);
			this.setValue = this.setValue.bind(this);
			this.updateValueByEvent = this.updateValueByEvent.bind(this);
			this.onLoadOptions = this.onLoadOptions.bind(this);
			this.noOptionsMessage = this.noOptionsMessage.bind(this);

			//console.log("TODO: shoud no opts message send a object?? curr sends inputval in obj");

			if (!this.props.onLoadOptions) throw ("Error: AutoComplete requires onLoadOptions function");

			// Make sure value is being sent
			// So that this is a controlled component
			
			let nProps = {
				value: props.value || "",
				doSubmit: true
			};
			this.elmt = this.props.form._addElement(this, { props: nProps });
		}
		updateValueByEvent(value) {
			this.elmt._props.value = value;
		}
		setValue(value) {
			this.elmt._props.value = value;
		}
		getValue(name) {
			return this.elmt._props.value || "";
		}
		async onLoadOptions(value) {
			return this.elmt._props.onLoadOptions(value, this.elmt, this.props.form);
		}
		noOptionsMessage(value) {
			if (this.elmt._props.noOptionsMessage) return this.elmt._props.noOptionsMessage(value, this.elmt, this.props.form);
			return "No Options";
		}
		render() {
			let nProps = {
				name: this.elmt.name,
				type: this.elmt.type,
				placeholder: this.elmt.placeholder || false,
				value: this.elmt.value,
				onChange: this.elmt._handleChange,
				onFocus: this.elmt._handleFocus,
				onBlur: this.elmt._handleBlur,
				className: this.elmt.className,
				isClearable: true,
				classNamePrefix: "select",
				options: this.elmt.choices,
				loadOptions: this.onLoadOptions,
				noOptionsMessage: this.noOptionsMessage,
				isMulti: this.elmt._props.multi,
				defaultOptions: this.elmt._props.defaultOptions || null
			};
			let className = "input-container select";
			if (this.elmt.icon) className += " icon";
			let floatingLabel = this.props.floatingLabel ?
			<Label className="floating" control={this.elmt.name}>{this.props.floatingLabel}</Label> :
			null;
			return (
				<div className={className}>
					{this.elmt.icon}
					<ReactSelectAsync {...nProps} />
					{floatingLabel}
				</div>
			);
		}
	}
));


export const DatePicker = inject(["form"])(observer(
	class DatePicker extends React.Component {
		constructor(props) {
			super(props);
			this.getValue = this.getValue.bind(this);
			this.setValue = this.setValue.bind(this);
			this.updateValueByEvent = this.updateValueByEvent.bind(this);
			this.inputRef = React.createRef();
			// Make sure value is being sent
			// So that this is a controlled component

			let nProps = {
				value: props.value || "",
				doSubmit: true,
				type: "text",
				className: "date",
			};

			this.elmt = this.props.form._addElement(this, { props: nProps });
		}
		updateValueByEvent(day) {
			this.elmt._props.value = day;
		}
		setValue(value) {
			if (value && !(value instanceof Date)) {
				if (!isNaN(value)) {
					// console.log(value);
					try {
						value = new Date(value * 1000);
					}
					catch (err) {
						value = null;
					}
				}
				else if (typeof value === "string") {
					try {
						value = new Date(value);
					}
					catch (err) {
						value = null;
					}
				}
			}

			// console.log(value);
			this.elmt._props.value = value;
		}
		getValue(name) {
			return this.elmt._props.value || "";
		}
		componentDidMount() {
			let input = this.inputRef.current.getInput();
			input.addEventListener("focus", this.elmt._handleFocus);
			input.addEventListener("blur", this.elmt._handleBlur);
		}
		render() {
			let nProps = {
				name: this.elmt.name,
				type: this.elmt.type,
				placeholder: this.elmt.placeholder,
				value: this.elmt.value,
				onDayChange: this.elmt._handleChange,
				ref: this.inputRef,
				//onFocus: this.elmt._handleFocus,
				// input: <input class="test" />,
				// onFocus: ()=>{alert("SLDKJF");},
				// onBlur: this.elmt._handleBlur,
				// formatDate: formatDate,
				// parseDate: parseDate,
				inputProps: {
					type: "text"
				}
			};
			let className = "input-container date";
			if (this.elmt.icon) className += " icon";
			let floatingLabel = this.props.floatingLabel ?
			<Label className="floating" control={this.elmt.name}>{this.props.floatingLabel}</Label> :
			null;
			return (
				<div className={className}>
					{this.elmt.icon}
					<DayPickerInput.default {...nProps} />
					{floatingLabel}
				</div>
			);
		}
	}
));

// export const Calendar = inject(["form"])(observer(
// 	class Calendar extends React.Component {
// 		constructor(props) {
// 			super(props);
// 			this.getValue = this.getValue.bind(this);
// 			this.setValue = this.setValue.bind(this);
// 			this.updateValueByEvent = this.updateValueByEvent.bind(this);
			
// 			// Make sure value is being sent
// 			// So that this is a controlled component
// 			let nProps = {
// 				value: props.value || "",
// 				doSubmit: true,
// 				type: "text",
// 				className: "date",
// 			};

// 			this.elmt = this.props.form._addElement(this, { props: nProps });
// 		}
// 		updateValueByEvent(day) {
// 			this.elmt._props.value = day;
// 		}
// 		setValue(value) {
// 			if (value && !(value instanceof Date)) {
// 				if (!isNaN(value)) {
// 					// console.log(value);
// 					try {
// 						value = new Date(value * 1000);
// 					}
// 					catch (err) {
// 						value = null;
// 					}
// 				}
// 				else if (typeof value === "string") {
// 					try {
// 						value = new Date(value);
// 					}
// 					catch (err) {
// 						value = null;
// 					}
// 				}
// 			}

// 			// console.log(value);
// 			this.elmt._props.value = value;
// 		}
// 		getValue(name) {
// 			return this.elmt._props.value || "";
// 		}
// 		componentDidMount() {

// 		}
// 		render() {
// 			let nProps = {
// 				// name: this.elmt.name,
// 				// type: this.elmt.type,
// 				// placeholder: this.elmt.placeholder,
// 				value: this.elmt.value,
// 				onDayClick: this.elmt._handleChange,
// 				onFocus: this.elmt._handleFocus,
// 				onBlur: this.elmt._handleBlur,
// 				onMonthChange: this.elmt._props.onMonthChange || null,
// 				formatDate: formatDate,
// 				parseDate: parseDate,
// 				renderDay: this.elmt._props.dayRenderer || null,
// 				month: this.props.month || null
// 			};
// 			let className = "input-container calendar date-picker";
// 			return (
// 				<div className={className}>
// 					<DayPicker {...nProps} />
// 				</div>
// 			);
// 		}
// 	}
// ));

export const ToggleSwitch = inject(["form"])(observer(
	class ToggleSwitch extends React.Component {
		constructor(props) {
			super(props);
			this.getValue = this.getValue.bind(this);
			this.setValue = this.setValue.bind(this);
			this.updateValueByEvent = this.updateValueByEvent.bind(this);
			// Make sure value is being sent
			// So that this is a controlled component
			let nProps = {
				value: props.value || false,
				doSubmit: true,
				tag: "input",
				type: "checkbox",
			};
			this.elmt = this.props.form._addElement(this, { props: nProps });
			//console.log("TODO: Form element templates");

		}
		updateValueByEvent(event) {
			this.elmt._props.value = this.elmt._props.value = event.target.checked ? true : false;
		}
		setValue(value) {
			//alert(value);
			this.elmt._props.value = value ? true : false;
		}
		getValue(name) {
			if(this.elmt._props.value){
				return this.elmt._props.value.value || this.elmt._props.value;
			}
			else return false;
		}
		componentDidMount() {

		}
		render() {
			let nProps = {
				name: this.elmt.name,
				type: this.elmt.type,
				// placeholder: this.elmt.placeholder,
				value: 1,
				checked:  this.elmt._props.value ? true : false,
				onChange: this.elmt._handleChange,
				onFocus: this.elmt._handleFocus,
				onBlur: this.elmt._handleBlur,
				className: this.elmt.className,
			};
			let className = "input-container toggle-switch";
			// if (this.elmt.icon) className += " icon";
			return (
				<div className={className}>
					<Label control={this.elmt.name}><input {...nProps} /></Label>
					<div className="toggle-switch-handle">&nbsp;</div>
				</div>
			);
		}
	}
));

// export const TextEditorQuill = inject(["form"])(observer(
// 	class TextEditorQuill extends React.Component {
// 		constructor(props) {
// 			super(props);
// 			this.getValue = this.getValue.bind(this);
// 			this.setValue = this.setValue.bind(this);
// 			this.updateValueByEvent = this.updateValueByEvent.bind(this);
// 			this._quill = React.createRef();

// 			this._handleChange = this._handleChange.bind(this);
// 			this._handleChangeSelection = this._handleChangeSelection.bind(this);
// 			this._handleChangeEditor = this._handleChangeEditor.bind(this);
// 			// Make sure value is being sent
// 			// So that this is a controlled component
// 			let nProps = {
// 				value: props.value || "",
// 				doSubmit: true,
// 				tag: (props.multiline) ? "textarea" : "input",
// 				type: props.type || "text"
// 			};

// 			this.elmt = this.props.form._addElement(this, { props: nProps });

// 			//console.log("TODO: Form element templates");

// 		}
// 		updateValueByEvent(value) {
// 			this.elmt._props.value = value;
// 		}
// 		setValue(value) {
// 			this.elmt._props.value = value;
// 		}
// 		getValue(name) {
// 			return this.elmt._props.value || "";
// 		}

// 		_handleChangeEditor(editor){
// 			// console.log(editor);
// 			let range = editor.getSelection();
// 			console.log(range);
// 			if (range.length === 0){
// 				let e = this._quill.getEditor();
// 				let [block,idx] = e.getLine(range.index);
// 				console.log(idx);
// 				console.log(block.domNode.firstChild);
// 				if (block != null && block.domNode.firstChild instanceof HTMLBRElement){
// 					console.log("SHOW SHOW SHOW!!!!");
// 				}
// 				else{
// 					console.log("HIDE HIDE HIDE");
// 				}
// 			}
// 		}

// 		_handleChange(content, delta, source, editor){
// 			//console.log(content,delta,source,editor);
// 			//this._handleChangeEditor(editor);
// 		}
// 		_handleChangeSelection(range, source, editor){
// 			// console.log("CHANGE SELECTIOJN");
// 			// console.log(range, editor);
// 			// this._handleChangeEditor(editor);
// 			this.elmt._handleChange();
// 		}
// 		render() {
// 			let nProps = {
// 				name: this.elmt.name,
// 				type: this.elmt.type,
// 				placeholder: this.elmt.placeholder,
// 				value: this.elmt.value,
// 				onChange: this._handleChange,
// 				onChangeSelection: this._handleChangeSelection,
// 				onFocus: this.elmt._handleFocus,
// 				onBlur: this.elmt._handleBlur,
// 				className: this.elmt.className,
// 				ref: (el) => { this._quill = el },
// 				theme: "bubble",
// 				modules: {
// 					toolbar: [
// 						[{ 'header': 1 }, 'bold', 'italic', 'background', 'blockquote'], ['link', 'image'],
// 						[{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '+1' }]
// 					]
// 				},
// 				onKeyUp: (event) => {
// 					switch (event.key) {
// 						case "Enter":
// 								console.log("Show the editor???");
// 							break;
// 					}
// 				}
// 			};
// 			return (
// 				<div className="input-container">
// 					<ReactQuill {...nProps} />
// 				</div>
// 			);
// 		}
// 	}
// ));

export const Button = inject("form")(observer(
	class Button extends React.Component {
		constructor(props) {
			super(props);
			this.elmt = this.props.form._addElement(this, {
				props: {
					//content: this.props.children,
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
					className={this.elmt.className}
				>
					{this.props.children}
				</button>
			);
		}
	}
));

export class SubmitButton extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<Button
				{...this.props}
				type="submit"
			>
				{this.props.children}
			</Button>
		);
	}
}

export const Label = inject("form")(observer(
	class Label extends React.Component {
		constructor(props) {
			super(props);
			if (!this.props.htmlFor && !this.props.control) throw ("Label tag error. Either htmlFor or control property must be defined.");
			this.elmt = this.props.form._addElement(this, {
				props: {
					//content: this.props.children,
					className: (this.props.className) ? this.props.className : ""
				}
			});
		}
		componentDidMount() {

		}
		render() {
			return (
				<label htmlFor={this.props.htmlFor || this.props.control} className={this.props.className}>
					{this.props.children}
				</label>
			);
		}
	}
));

export const Error = inject("form")(observer(
	class Error extends React.Component {
		constructor(props) {
			super(props);
			if (!this.props.htmlFor && !this.props.control) throw ("Error tag error. Either htmlFor or control property must be defined.");
			this.elmt = this.props.form._addElement(this, {
				props: {
					tag: (this.props.tag) ? this.props.tag : "div",
					className: (this.props.className) ? this.props.className : "error"
				}
			});
		}
		hasValidationErrorMessage() {
			if (!this.props.form.elmts[this.elmt.control]) return false;
			if (this.props.form.elmts[this.elmt.control].validationErrorMessage) return true;
		}
		render() {
			if (!this.hasValidationErrorMessage()) return null;
			return React.createElement(this.elmt.tag, {
				className: this.elmt.className
			}, this.props.form.elmts[this.elmt.control].validationErrorMessage);
		}
	}
));

export const Success = inject("form")(observer(
	class Success extends React.Component {
		constructor(props) {
			super(props);
			if (!this.props.htmlFor && !this.props.control) throw ("Success tag error. Either htmlFor or control property must be defined.");
			this.elmt = this.props.form._addElement(this, {
				props: {
					tag: (this.props.tag) ? this.props.tag : "div",
					className: (this.props.className) ? this.props.className : "success"
				}
			});
		}
		hasValidationSuccessMessage() {
			if (!this.props.form.elmts[this.elmt.control]) return false;
			if (this.props.form.elmts[this.elmt.control].validationSuccessMessage) return true;
		}
		render() {
			if (!this.hasValidationSuccessMessage()) return null;
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
		constructor(props) {
			super(props);

			this.elmt = this.props.form._addElement(this, {
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
					if(typeof error !== "string"){
						console.error("Form Error: ",error);
						error = "Unknown Error: Check Console.";
					}
					return <li key="index">{error}</li>;
				}
			);
			return (
				<Container
					hide
					unmountOnHide
					fadeToggle={errorListItems.length > 0}
					className={this.elmt.className}
				>
					<ul>
						{errorListItems}
					</ul>
				</Container>
			);
		}
	}
));