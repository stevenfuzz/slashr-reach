import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, observer, inject } from 'mobx-react';
// import { decorate, observable, action, computed } from "mobx";
//import { CSSTransition } from 'react-transition-group';

import { EditorState, Plugin } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { Decoration, DecorationSet } from "prosemirror-view"

import { nodes, schema, blockquote } from 'prosemirror-schema-basic'
import { orderedList, bulletList, listItem } from 'prosemirror-schema-list'
import { Schema, DOMParser } from "prosemirror-model"
// import { exampleSetup } from "prosemirror-example-setup"
import 'prosemirror-example-setup/style/style.css'

import { toggleMark, wrapIn, lift, setBlockType, heading, prosemirrorCommands, baseKeymap, chainCommands, exitCode, joinUp, joinDown, selectParentNode } from 'prosemirror-commands'
// import { stat } from 'fs';
// import { prosemirrorKeymap } from "prosemirror-keymap";
// import { prosemirrorHistory } from "prosemirror-history";
// import { prosemirrorState } from "prosemirror-state";
// import { prosemirrorDropcursor } from "prosemirror-dropcursor";
// import { prosemirrorGapcursor } from "prosemirror-gapcursor";
// import { prosemirrorMenu } from "prosemirror-menu";
// import {wrapIn, setBlockType, chainCommands, toggleMark, exitCode,
// 	joinUp, joinDown, lift, selectParentNode} from "prosemirror-commands"
import { wrapInList, splitListItem, liftListItem, sinkListItem } from "prosemirror-schema-list"
import { undo, redo } from "prosemirror-history"
import { undoInputRule } from "prosemirror-inputrules"
import {
	inputRules, wrappingInputRule, textblockTypeInputRule,
	smartQuotes, emDash, ellipsis
} from "prosemirror-inputrules"
import { keymap } from "prosemirror-keymap"
import { history } from "prosemirror-history"
import { dropCursor } from "prosemirror-dropcursor"
import { gapCursor } from "prosemirror-gapcursor"
// import { menuBar } from "prosemirror-menu"

import { Container } from './Element';
import { Button } from './Button';
import {Dialog, DialogButtons} from './Dialog';
import { Form, Input, SubmitButton, Error, Success, Label, Errors, Field, FieldGroup, Hidden, TextArea, File, Select, DatePicker, AutoComplete } from './Form';

export const TextEditor = inject(["form"])(observer(
	class TextEditor extends React.Component {
		constructor(props) {
			super(props);
			this.ref = React.createRef();
			this.getValue = this.getValue.bind(this);
			this.setValue = this.setValue.bind(this);
			this.updateValueByEvent = this.updateValueByEvent.bind(this);
			this.updateToolbar = this.updateToolbar.bind(this);
			this.createEditorView = this.createEditorView.bind(this);
			this.dispatchTransaction = this.dispatchTransaction.bind(this);
			this.handleImageChange = this.handleImageChange.bind(this);
			this.handleBlur = this.handleBlur.bind(this);
			this.emptyPlugin = new Plugin({
				props: {
					decorations: state => {
					const decorations = []
			
					const decorate = (node, pos) => {
						if (node.type.isBlock && node.childCount === 0) {
						decorations.push(
							Decoration.node(pos, pos + node.nodeSize, {
							class: 'empty',
							})
						)
						}
					}
					state.doc.descendants(decorate)
					return DecorationSet.create(state.doc, decorations)
					},
				},
			});
			this.placeholderPlugin = new Plugin({
				state: {
					init() { return DecorationSet.empty },
					apply(tr, set) {
						// Adjust decoration positions to changes made by the transaction
						set = set.map(tr.mapping, tr.doc)
						// See if the transaction adds or removes any placeholders
						let action = tr.getMeta(this);
						if (action && action.add) {
							let widget = document.createElement("div");
							widget.className = "image-placeholder";
							let deco = Decoration.widget(action.add.pos, widget, { id: action.add.id })
							set = set.add(tr.doc, [deco])
						}
						else if (action && action.remove) {
							set = set.remove(set.find(null, null, spec => spec.id == action.remove.id))
						}
						return set
					}
				},
				props: {
					decorations(state) {
						return this.getState(state)
					}
				}
			})


			// image: {
			// 	inline: true,
			// 	attrs: {
			// 	  src: {},
			// 	  alt: {default: null},
			// 	  title: {default: null}
			// 	},
			// 	group: "inline",
			// 	draggable: true,
			// 	parseDOM: [{tag: "img[src]", getAttrs(dom) {
			// 	  return {
			// 		src: dom.getAttribute("src"),
			// 		title: dom.getAttribute("title"),
			// 		alt: dom.getAttribute("alt")
			// 	  }
			// 	}}],
			// 	toDOM(node) { return ["img", node.attrs] }
			//   },
			//   blockquote: {
			// 	content: "block+",
			// 	group: "block",
			// 	defining: true,
			// 	parseDOM: [{tag: "blockquote"}],
			// 	toDOM() { return ["blockquote", 0] }
			//   },

			let customNodes = {
				blockquote: {
					...nodes.blockquote,
					parseDOM: [{tag: "blockquote", getAttrs(dom) {
						return {
							className: dom.className,
						}
					}}],
					attrs: {
						"className" : {default: "blockquote"}
					},
					toDOM(node) { 
						let attrs = {};
						if(node.attrs.className) attrs["class"] = node.attrs.className;
						return ["blockquote",attrs,0] }
				},
				ordered_list: {
					...orderedList,
					content: 'list_item+',
					group: 'block'
				},
				bullet_list: {
					...bulletList,
					content: 'list_item+',
					group: 'block'
				},
				list_item: {
					...listItem,
					content: 'paragraph block*',
					group: 'block'
				},
				// image : {
					figure: {
					  attrs: {src: {}},
					  content: "inline*",
					  parseDOM: [{
						tag: "figure",
						contentElement: "figcaption", // Helps the parser figure out where the child nodes are
						getAttrs(dom) {
						  let img = dom.querySelector("img")
						  return {src: img && img.parentNode == dom ? img.src : ""}
						}
					  }],
					  toDOM(node) {
						console.log("TO DOM FIGURE");
						return ["figure", ["img", {src: node.attrs.src}], ["figcaption", 0]]
					  },
					  draggable: true,
					  group: "block",
					}
				//   }
			};
			let nodeOptions = {
				...nodes,
				...customNodes
			};
			let markOptions = schema.spec.marks;

			let pmSchema = new Schema({
				nodes: nodeOptions,
				marks: markOptions
			});
			this.schema = pmSchema;

			// : (Schema) → Plugin
			// A set of input rules for creating the basic block quotes, lists,
			// code blocks, and heading.
			//console.log("TODO: Move textarea stuff out to methods");



			// : (NodeType) → InputRule
			// Given a blockquote node type, returns an input rule that turns `"> "`
			// at the start of a textblock into a blockquote.
			let blockQuoteRule = (nodeType) => {
				return wrappingInputRule(/^\s*>\s$/, nodeType)
			}

			// : (NodeType) → InputRule
			// Given a list node type, returns an input rule that turns a number
			// followed by a dot at the start of a textblock into an ordered list.
			let orderedListRule = (nodeType) => {
				return wrappingInputRule(/^(\d+)\.\s$/, nodeType, function (match) { return ({ order: +match[1] }); },
					function (match, node) { return node.childCount + node.attrs.order == +match[1]; })
			}

			// : (NodeType) → InputRule
			// Given a list node type, returns an input rule that turns a bullet
			// (dash, plush, or asterisk) at the start of a textblock into a
			// bullet list.
			let bulletListRule = (nodeType) => {
				return wrappingInputRule(/^\s*([-+*])\s$/, nodeType)
			}

			// : (NodeType) → InputRule
			// Given a code block node type, returns an input rule that turns a
			// textblock starting with three backticks into a code block.
			let codeBlockRule = (nodeType) => {
				return textblockTypeInputRule(/^```$/, nodeType)
			}

			// : (NodeType, number) → InputRule
			// Given a node type and a maximum level, creates an input rule that
			// turns up to that number of `#` characters followed by a space at
			// the start of a textblock into a heading whose level corresponds to
			// the number of `#` signs.
			let headingRule = (nodeType, maxLevel) => {
				return textblockTypeInputRule(new RegExp("^(#{1," + maxLevel + "})\\s$"),
					nodeType, function (match) { return ({ level: match[1].length }); })
			}

			const buildInputRules = (schema) => {
				let rules = smartQuotes.concat(ellipsis, emDash), type;
				if (type = schema.nodes.blockquote) { rules.push(blockQuoteRule(type)); }
				if (type = schema.nodes.ordered_list) { rules.push(orderedListRule(type)); }
				if (type = schema.nodes.bullet_list) { rules.push(bulletListRule(type)); }
				if (type = schema.nodes.code_block) { rules.push(codeBlockRule(type)); }
				if (type = schema.nodes.heading) { rules.push(headingRule(type, 4)); }
				return inputRules({ rules: rules })
			};
			const buildKeymap = (schema, mapKeys) => {
				let keys = {}, type
				function bind(key, cmd) {
					if (mapKeys) {
						let mapped = mapKeys[key]
						if (mapped === false) return
						if (mapped) key = mapped
					}
					keys[key] = cmd
				};
				bind("Mod-z", undo)
				bind("Shift-Mod-z", redo)
				bind("Backspace", undoInputRule)
				const mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false
				if (!mac) bind("Mod-y", redo)

				bind("Alt-ArrowUp", joinUp)
				bind("Alt-ArrowDown", joinDown)
				bind("Mod-BracketLeft", lift)
				bind("Escape", selectParentNode)

				if (type = schema.marks.strong)
					bind("Mod-b", toggleMark(type))
				if (type = schema.marks.em)
					bind("Mod-i", toggleMark(type))
				if (type = schema.marks.code)
					bind("Mod-`", toggleMark(type))

				if (type = schema.nodes.bullet_list)
					bind("Shift-Ctrl-8", wrapInList(type))
				if (type = schema.nodes.ordered_list)
					bind("Shift-Ctrl-9", wrapInList(type))
				if (type = schema.nodes.blockquote)
					bind("Ctrl->", wrapIn(type))
				if (type = schema.nodes.hard_break) {
					let br = type, cmd = chainCommands(exitCode, (state, dispatch) => {
						dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
						return true
					})
					bind("Mod-Enter", cmd)
					bind("Shift-Enter", cmd)
					if (mac) bind("Ctrl-Enter", cmd)
				}

				if (type = schema.nodes.list_item) {
					bind("Enter", splitListItem(type))
					bind("Mod-[", liftListItem(type))
					bind("Mod-]", sinkListItem(type))
				}
				if (type = schema.nodes.paragraph)
					bind("Shift-Ctrl-0", setBlockType(type))
				if (type = schema.nodes.code_block)
					bind("Shift-Ctrl-\\", setBlockType(type))
				if (type = schema.nodes.heading)
					for (let i = 1; i <= 6; i++) bind("Shift-Ctrl-" + i, setBlockType(type, { level: i }))
				if (type = schema.nodes.horizontal_rule) {
					let hr = type
					bind("Mod-_", (state, dispatch) => {
						dispatch(state.tr.replaceSelectionWith(hr.create()).scrollIntoView())
						return true
					})
				}

				return keys

			}
			const buildPlugins = (options) => {
				let plugins = [
					buildInputRules(options.schema),
					keymap(buildKeymap(options.schema, options.mapKeys)),
					keymap(baseKeymap),
					dropCursor(),
					gapCursor(),
					history(),
					this.placeholderPlugin,
					this.emptyPlugin
				];
				// if (options.menuBar !== false)
				// 	{ plugins.push(prosemirrorMenu.menuBar({floating: options.floatingMenu !== false,
				// 						content: options.menuContent || buildMenuItems(options.schema).fullMenu})); }
				// if (options.history !== false)
				// 	{ plugins.push(prosemirrorHistory.history()); }
				// plugins.concat(new Plugin({
				// 	props: {
				// 		attributes: {class: ""}
				// 	}
				// }))
				return plugins
			};

			const pmPlugins = buildPlugins({
				schema: pmSchema,
				menuBar: false
			});

			const nProps = {
				className: (this.props.className) ? this.props.className : "editor",
				value: props.value || "",
				doSubmit: true,
				editor: {
					state: EditorState.create({
						schema: pmSchema,
						plugins: pmPlugins
					}),
					schema: pmSchema,
					view: null
				},
				doOpenLinkDialog: false
			};

			this.elmt = this.props.form._addElement(this, { props: nProps });

		}
		findImagePlaceholder(state, id) {
			let decos = this.placeholderPlugin.getState(state);
			let found = decos.find(null, null, spec => spec.id == id);
			return found.length ? found[0].from : null;
		}
		addItem(item) {
			return this.elmt._props.value || "";
		}
		updateValueByEvent(value) {
			this.elmt._props.value = value;
		}
		setValue(value) {
			if (value && typeof value === "object") {
				this.elmt._props.editor.state = EditorState.create({
					doc: this.elmt._props.editor.state.doc.constructor.fromJSON(this.elmt._props.editor.schema, value),
					schema: this.elmt._props.editor.state.schema,
					plugins: this.elmt._props.editor.state.plugins
				});
				this.createEditorView(this.node);
			}
			this.elmt._props.value = value;
		}
		getValue(name) {
			return this.elmt._props.value || "";
		}

		async handleImageChange(e) {
			let id = Date.now(); // set to {} in example
			// Persist the element for after await
			e.persist();

			if (!this.props.onImageChange) throw ("onImageChange not defined");

			// Replace the selection with a placeholder
			let state = this.elmt._props.editor.view.state;
			let tr = state.tr;
			if (!tr.selection.empty) tr.deleteSelection();
			// Add the placeholder
			tr.setMeta(this.placeholderPlugin, { add: { id, pos: tr.selection.from } });
			state = this.dispatchTransaction(tr);

			let url = await this.props.onImageChange(this, this.props.form, e);

			// Reset the input
			e.target.value = "";
			if (!url) throw ("Unable to find uploaded images.");

			// Find and replace the placeholder image
			let pos = this.findImagePlaceholder(state, id);
			const img = this.elmt._props.editor.schema.nodes.figure.create({
				src: url
			});
			tr.replaceWith(pos, pos, img);
			//tr.replaceSelectionWith(img);
			tr.setMeta(this.placeholderPlugin, { remove: { id } })
			this.dispatchTransaction(tr);
			this.focus();


			// // // WORKING!!!!!!			
			// setTimeout(() => {
			// 	let pos = this.findImagePlaceholder(state, id);
			// 	console.log("POS2 ",pos, id);
			// 	const img = this.elmt._props.editor.schema.nodes.image.create({
			// 		src: url
			// 	});
			// 	tr.replaceWith(pos, pos, img);
			// 	//tr.replaceSelectionWith(img);
			// 	tr.setMeta(this.placeholderPlugin, {remove: {id}})
			// 	this.dispatchTransaction(tr);
			// },1000);
			// return;

		}
		handleBlur(e){
			console.log(e);
		}
		componentDidMount() {
			this.createEditorView();
		}
		focus() {
			if (this.elmt._props.editor.view) this.elmt._props.editor.view.focus();
		}
		dispatchTransaction(transaction) {
			let state = this.elmt._props.editor.view.state.apply(transaction);
			this.elmt._props.editor.view.updateState(state);
			this.elmt._props.editor.state = state;
			this.elmt._handleChange(this.elmt._props.editor.state.doc.toJSON());
			this.updateToolbar();
			return state;
		}
		updateToolbar() {
			if (!this.elmt._props.toolbar || !this.elmt._props.toolbar.items.length) return false;
			this.elmt._props.toolbar.items.map(item => {
				if (item.updateActive) item.updateActive();
			});
		}
		componentWillUnmount() {
			if (this.elmt._props.editor.view) {
				this.elmt._props.editor.view.destroy();
			}
		}
		// shouldComponentUpdate() {
		// 	return false;
		// }
		createEditorView() {
			//if(! this.elmt._props.editor.view){
			if (this.elmt._props.editor.view) this.elmt._props.editor.view.destroy();
			this.elmt._props.editor.view = new EditorView(this.ref.current, {
				state: this.elmt._props.editor.state,
				dispatchTransaction: this.dispatchTransaction,
				attributes: {
					placeholder: this.elmt.placeholder
				}
			});
			//}
		}
		onChange(value) {

		}
		render() {
			let items = [
				{
					title: "Bold",
					content: <i className="material-icons">format_bold</i>,
					action: "bold"
				},
				{
					title: "Italic",
					content: <i className="material-icons">format_italic</i>,
					action: "italic"
				},
				{
					title: "Text Size",
					content: <i className="material-icons">format_size</i>,
					action: "smart-text-size"
				},
				{
					title: "Quote",
					content: <i className="material-icons">format_quote</i>,
					action: "quote"
				},
				{
					title: "list",
					content: <i className="material-icons">format_list_bulleted</i>,
					action: "list"
				},
				{
					title: "link",
					content: <i className="material-icons">insert_link</i>,
					action: "link"
				},
				{
					title: "New Part",
					content: <i className="material-icons">border_horizontal</i>,
					action: "hr"
				},
				{
					title: "Insert Photo",
					content: <i className="material-icons">insert_photo<input type="file" onChange={this.handleImageChange} /></i>,
					action: "image",
					tag: "label"
				}
			];

			
			let nProps = {
				name: this.elmt.name,
				type: this.elmt.type,
				placeholder: this.elmt.placeholder,
				value: this.elmt.value,
				className: this.elmt.className,
				onFocus: this.elmt._handleFocus,
				onBlur: this.elmt._handleBlur,
				// onBlur: this._handleBlur,
				ref: this.ref
			};
			let floatingLabel = this.props.floatingLabel ?
				<Label className="floating" control={this.elmt.name}>{this.props.floatingLabel}</Label> :
				null;
			return (
				<div className="input-container text-editor">
					<TextEditorToolbar editor={this} items={items} />
					<Container {...nProps} />
					{floatingLabel}
				</div>
				
			);
		}
	}
));

class TextEditorDialog extends React.Component {
	constructor(props) {
		super(props);
	}
	render(){
		return ReactDOM.createPortal(
			this.props.children,
			document.body
		);
	}
}

export const TextEditorLinkDialog = inject(["form"])(observer(
	class TextEditorLinkDialog extends React.Component {
		constructor(props) {
			super(props);
			this.handleSubmit = this.handleSubmit.bind(this);
			this.handleClose = this.handleClose.bind(this);
			this.handleObserver = this.handleObserver.bind(this);
			this.editor = props.editor;
			this.ref = React.createRef();
			this.item = this.props.item;
			//this.observer = new IntersectionObserver(this.handleObserver);
			
		}
		componentDidMount(){
			// console.log(this.editor.ref);
			// //console.log("TODO: This seams kind of hacky");
			// window.requestAnimationFrame(()=>{
			// 	console.log(this.editor.ref);
			// 	console.log("SDLFKJLSDKJFLSKDJF");
			// });
		}
		
		handleObserver(entities){
			//console.log(entities);
		}
		handleSubmit(form){
			let schema = this.editor.schema;
			let type = schema.marks.link;
			// let linkType = this.editor.schema.marks.link;
			// let textType = this.editor.schema.text;
			let state = this.editor.elmt._props.editor.state;
			let dispatch = this.editor.dispatchTransaction;
			let attrs = form.values;

			let link = null;

			if(state.selection.empty){
				let link = schema.text(attrs.href,schema.marks.link.create(attrs));
				dispatch(state.tr.replaceSelectionWith(link, false));
			}
			else toggleMark(schema.marks.link, attrs)(state, dispatch);

			this.close();
		}
		handleClose(){
			this.close();
		}
		open(){
			this.editor.elmt._props.doOpenLinkDialog = true;
		}
		close(){
			this.editor.elmt._props.doOpenLinkDialog = false;
		}
		get isOpen(){
			return this.editor.elmt._props.doOpenLinkDialog;
		}

		render(){
			
			return(
				<Dialog
					open={this.isOpen}
					onClose={this.handleClose}
					// title="Add a Link"
					{...this.props}
				>
					<Form className="material" name="textEditorLink" onSubmit={this.handleSubmit}>
						<Field control="href">
							<Input
								name="href"
								floatingLabel="Enter a Link"
								required="Please enter a link."
								validator="url"
							/>
							<Error control="href"/>
							<Success control="href"/>
						</Field>
						<DialogButtons>
							<Button
								className="button text"
								onClick={this.handleClose}
							>
								Cancel
							</Button>
							<SubmitButton
								className="button text"
							>
								Continue
							</SubmitButton>
						</DialogButtons>
					</Form>
				</Dialog>
			);
		}
	}
));


export const TextEditorToolbar = inject(["form"])(observer(
	class TextEditorToolbar extends React.Component {
		constructor(props) {
			super(props);
			this.editor = props.editor
			this.editor.elmt._props.toolbar = {
				items: []
			};
			this.items = props.items;
		}
		render() {

			let dialogs = [];
			for(let i in this.items){
				switch(this.items[i].action){
					case "link":
					dialogs.push(
							<TextEditorLinkDialog key={i} item={this.items[i]} editor={this.editor} />
						);
					break;
				}
			}

			let toolbarItems = [
				// {
				// 	title: "Link",
				// 	content: <i className="material-icons">insert_link</i>,
				// 	command: (EditorState, dispatchTransaction) => {
				// 		toggleMark(schema.marks.em)(EditorState, dispatchTransaction);
				// 	}
				// },
				// {
				// 	title: "Insert Photo",
				// 	content: <i className="material-icons">insert_photo</i>,
				// 	command: (EditorState, dispatchTransaction) => {
				// 		toggleMark(schema.marks.em)(EditorState, dispatchTransaction);
				// 	}
				// },
				// }
			];

			// Medium Toolbar
			// bold, italic, link | h1, h2, quote | image, video, embed (?), Seperator
			return (
				<div className="toolbar">
					<div className="toolbar-controls">
						{this.items.map((item, i) => (
							<TextEditorToolbarItem key={i} item={item} editor={this.editor} toolbar={this} {...item} />
						))}
						{dialogs.length &&
							<TextEditorDialog>
								{dialogs}
							</TextEditorDialog>
						}
					</div>
				</div>
			);
		}
	}
));



export const TextEditorToolbarItem = inject(["form"])(observer(
	class TextEditorToolbarItem extends React.Component {
		constructor(props) {
			super(props);
			this.run = this.run.bind(this);
			this.updateActiveMark = this.updateActiveMark.bind(this);
			this.updateActiveBlock = this.updateActiveBlock.bind(this);
			this.updateActiveWrap = this.updateActiveWrap.bind(this);
			this.editor = props.editor;
			this.createItem(this.props.item);
		}
		createItem(item) {
			let attrs = {};
			let type = null;
			let types = null;
			let command = null;
			let updateActive = null;
			this.editor.elmt._props.toolbar.items.push(this.props.item);
			this.key = this.editor.elmt._props.toolbar.items.length - 1;
			this.item = this.editor.elmt._props.toolbar.items[this.key];

			switch (this.item.action) {
				case "bold":
					type = this.editor.schema.marks.strong;
					command = toggleMark(type);
					updateActive = this.updateActiveMark;
					break;
				case "italic":
					type = this.editor.schema.marks.em;
					command = toggleMark(type);
					updateActive = this.updateActiveMark;
					break;
				case "quote":
					type = this.editor.schema.nodes.blockquote;
					// command = wrapIn(type);
					updateActive = this.updateActiveWrap;
					command = (state, dispatch) => {
						let { $from, to, node } = state.selection
						let nType = null;
						let nClassName = null;
						for (let i in $from.path) {
							if ($from.path[i].type) {
								if ($from.path[i].type === this.editor.schema.nodes.paragraph) {
									nType = this.editor.schema.nodes.paragraph;
								}
								else if ($from.path[i].type === this.editor.schema.nodes.blockquote) {
									nType = this.editor.schema.nodes.blockquote;
									nClassName = $from.path[i].attrs.className || "blockquote";
									break;
								}	
							}
						}
						if (nType === this.editor.schema.nodes.paragraph){
							attrs.className = "blockquote";
							wrapIn(type, attrs)(state, dispatch);
						}
						else if(nType === this.editor.schema.nodes.blockquote){
							lift(state, dispatch);
							state = this.editor.elmt._props.editor.state;
							if(nClassName === "blockquote"){
								attrs.className = "pullquote";
								wrapIn(type, attrs)(state, dispatch);
							}
						}

					};

					break;
				case "list":
					types = [
						this.editor.schema.nodes.ordered_list,
						this.editor.schema.nodes.bullet_list
					];
					updateActive = this.updateActiveWrap;
					command = (state, dispatch) => {
						let { $from, to, node } = state.selection
						if ($from.path && $from.path.length) {
							let nType = null;
							let nAttrs = {};
							let type = null;
							for (let i in $from.path) {
								if ($from.path[i].type) {
									if ($from.path[i].type === this.editor.schema.nodes.paragraph) {
										type = this.editor.schema.nodes.paragraph;
										break;
									}
									else if ($from.path[i].type === this.editor.schema.nodes.bullet_list) {
										type = this.editor.schema.nodes.bullet_list;
										break;
									}	
									else if ($from.path[i].type === this.editor.schema.nodes.ordered_list) {
										type = this.editor.schema.nodes.ordered_list;
										break;
									}
								}
							}
							if(type){
								if(type === this.editor.schema.nodes.paragraph){
									wrapInList(this.editor.schema.nodes.bullet_list)(state, dispatch);
								}
								else if(type === this.editor.schema.nodes.bullet_list){
									liftListItem(this.editor.schema.nodes.list_item)(state, dispatch);
									state = this.editor.elmt._props.editor.state;
									wrapInList(this.editor.schema.nodes.ordered_list)(state, dispatch);
									
								}
								else if(type === this.editor.schema.nodes.ordered_list){
									liftListItem(this.editor.schema.nodes.list_item)(state, dispatch);
								}
							}
						}
					};
					break;
				case "h1":
				case "h2":
				case "h3":
				case "h4":
					attrs.level = this.item.action.substring(1, 2);
					type = this.editor.schema.nodes.heading;
					updateActive = this.updateActiveWrap;
					command = (state, dispatch) => {
						if (this.item.isActive) {
							// Remove if selected
							setBlockType(this.editor.schema.nodes.paragraph)(state, dispatch);
						}
						else {
							let attrs = {};
							attrs.level = this.item.action.substring(1, 2);
							setBlockType(type, attrs)(state, dispatch);
						}
					};
					break;
				case "smart-text-size":
					// attrs.level = this.item.action.substring(1,2);
					type = this.editor.schema.nodes.heading;
					updateActive = this.updateActiveWrap;
					command = (state, dispatch) => {
						let { $from, to, node } = state.selection
						//let isActive = false;
						if ($from.path && $from.path.length) {
							let nType = null;
							let nAttrs = {};
							for (let i in $from.path) {
								if ($from.path[i].type) {
									if ($from.path[i].type === this.editor.schema.nodes.paragraph) {
										nType = this.editor.schema.nodes.heading;
										nAttrs.level = 2;
										break;
									}
									else if ($from.path[i].type === this.editor.schema.nodes.heading) {
										nType = this.editor.schema.nodes.heading;
										let cLevel = ($from.path[i].attrs && $from.path[i].attrs.level) ? $from.path[i].attrs.level : 0;
										cLevel++;
										if (cLevel > 5) {
											nType = this.editor.schema.nodes.paragraph;
											nAttrs = null;
										}
										else nAttrs.level = cLevel;
										break;
									}

								}
							}
							console.log(nAttrs);
							if (nType) setBlockType(nType, nAttrs)(state, dispatch);
						}
					};
					break;
				case "hr":
					type = this.editor.schema.nodes.horizontal_rule;
					command = (state, dispatch) => {
						if (this.item.isActive) {
							// Remove if selected
							dispatch(state.tr.deleteSelection());
						}
						else {
							let hr = type.create();
							dispatch(state.tr.replaceSelectionWith(hr));
						}
					};
					updateActive = this.updateActiveBlock;
					break;
				case "image":
					type = this.editor.schema.nodes.image;
					break;
				case "link":
					type = this.editor.schema.marks.link;
					updateActive = this.updateActiveMark;
					command = (state, dispatch) => {
						if (this.item.isActive) toggleMark(type)(state, dispatch);
						else this.editor.elmt._props.doOpenLinkDialog = true;
					};
					break;
				default:
					throw ("TextEditor Error: Unknown action type " + this.item.action);
			}
			this.item.types = (types) ? types : [type];
			this.item.attributes = attrs;
			this.item.command = command;
			this.item.updateActive = updateActive;
			
			this.editor.focus();

		}
		run() {
			let state = this.editor.elmt._props.editor.state;
			this.item.command(this.editor.elmt._props.editor.state, this.editor.dispatchTransaction);
			this.editor.focus();
		}
		// update(){
		// 	console.log(this.item.action, this.item.command);
		// 	this.item.isEnabled = this.item.command(this.editor.elmt._props.editor.state, null);
		// }
		updateActiveBlock() {
			let state = this.editor.elmt._props.editor.state;
			let { $from, to, node } = state.selection
			for(let type of this.item.types){
				this.item.isActive = (node) ? node.hasMarkup(type, this.item.attributes) :
					(to <= $from.end() && $from.parent.hasMarkup(type, this.item.attributes));
				if(this.item.isActive) break;
			}
		}
		updateActiveWrap() {
			let state = this.editor.elmt._props.editor.state;
			let { $from, to, node } = state.selection
			let isActive = false;
			if (!$from.path || !$from.path.length) isActive = false;
			else {
				for(let type of this.item.types){
					for (let i in $from.path) {
						if ($from.path[i].type && $from.path[i].type == type) {
							isActive = true;
							break;
						}
					}
					if(isActive) break;
				}
				
			}
			this.item.isActive = isActive;
		}
		updateActiveMark() {
			let state = this.editor.elmt._props.editor.state;
			let { from, $from, to, empty } = state.selection;
			
			for(let type of this.item.types){
				this.item.isActive = (empty) ?
					type.isInSet(state.storedMarks || $from.marks()) :
					state.doc.rangeHasMark(from, to, type);
				if(this.item.isActive) break;
			}
		}
		// set active(){

		// }
		render() {
			// Medium Toolbar
			// bold, italic, link | h1, h2, quote | image, video, embed (?), Seperator
			let tag = (this.item.tag) ? this.item.tag : "button";
			let nProps = {
				className: "control" + (this.item.isActive ? " active" : ""),
				title: this.props.title,
				// onClick=(e) => {
				// 	e.stopPropagation();
				// 	e.preventDefault();
				// 	this.run();
				// }

			};
			if (tag === "button") {
				nProps.onClick = (e) => {
					e.stopPropagation();
					e.preventDefault();
					this.run();
				};
				nProps.onTouchStart = (e) => {
					e.stopPropagation();
					// e.preventDefault();
				};
				nProps.onMouseDown = (e) => {
					e.stopPropagation();
					e.preventDefault();
				};
				nProps.type = "button"
			}
			else if (tag === "label") {
				nProps.onClick = (e) => {
					e.stopPropagation();
					// e.preventDefault();
					// this.run();
				};
				nProps.onTouchStart = (e) => {
					e.stopPropagation();
					// e.preventDefault();
				};
				nProps.onMouseDown = (e) => {
					e.stopPropagation();
					e.preventDefault();
				};
				// nProps.type = "button"
			}

			return React.createElement(tag, nProps, this.props.content);

			return (
				<button
					type="button"
					className={this.item.isActive ? "active" : ""}
					title={this.props.title}
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						this.run();
					}}
					onPointerDown={(e) => {
						console.log("KEEP FOCUS!!!! pointer");
						e.stopPropagation();
						e.preventDefault();
					}}
					onMouseDown={(e) => {
						console.log("KEEP FOCUS!!!!");
						e.stopPropagation();
						e.preventDefault();
					}}
				>
					{this.props.content}
				</button>
			);
		}
	}
));