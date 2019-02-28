import React from 'react';
import {Container} from './Element'

class prosemirrorParser {
	constructor(document) {
		this.document = document;
		this._key = 1;
	}
	get nextKey() {
		return ++this._key;
	}
	toComponents() {
		return this._toComponents(this.document);
	}
	_toComponents(document) {
		let cpnts = [];
		if (document.content) {
			for (let node of document.content) {
				let cpnt = null;
				let tag = null;
				let props = {};
				if (!node.type) {
					console.error("Error parsing document. No type.");
					return null;
				}
				

				switch (node.type) {
					case "heading":
						tag = "h" + ((node.attrs.level) ? node.attrs.level : 2);
						break;
					case "paragraph":
						tag = "p";
						break;
					case "blockquote":
						tag = "blockquote";
						break;
					case "ordered_list":
						tag = "ol";
						props.type = (node.attrs.order) ? node.attrs.order : 1;
						break;
					case "bullet_list":
						tag = "ul";
						break;
					case "list_item":
						tag = "li";
						break;
					case "figure":
						cpnt = (
							<figure key={this.nextKey}>
								<img src={node.attrs.src} />
								{node.content && React.createElement("figcaption", {}, this._toComponents(node))}
							</figure>
						);
						break;
					case "figcaption":
						tag = "figcaption";
						break;
					case "text":
						// cpnt = <fragment>
						// 	{node.text}
						// </fragment>;
						cpnt = node.text;
						break;

					case "image":
						if (!node.attrs.src) continue;
						cpnt = <img key={this.nextKey} src={node.attrs.src} />
						break;
					case "horizontal_rule":
						cpnt = <hr key={this.nextKey} />;
						break;
					default:
						console.log(node);
				}
				if (node.attrs && node.attrs.className) props.className = node.attrs.className;
				props.key = this.nextKey
				if (tag) cpnt = React.createElement(tag, props, this._toComponents(node));

				if (node.marks) {
					if (!cpnt) continue;
					// Component should be wrapped
					for (let mark of node.marks) {
						switch (mark.type) {
							case "strong":
								cpnt = <strong key={this.nextKey}>{cpnt}</strong>;
								break;
							case "em":
								cpnt = <em key={this.nextKey}>{cpnt}</em>;
								break;
							case "link":
								cpnt = <a target="_BLANK" href={mark.attrs.href} key={this.nextKey}>{cpnt}</a>;
								break;
						}
					}
				}

				if (cpnt) cpnts.push(cpnt);
			}

		}
		return cpnts;
	}
}

/* Document will show the value of a document saved with TextEditor / Prosemirror */
export const Document = React.forwardRef((props, ref) => {
	if (!props.document) throw ("Document element error. No document.");
	let docParser = new prosemirrorParser(props.document);
	let document = docParser.toComponents();
	return (
		<Container
			{...props}
			forwardRef={ref}
		>
			{document}
		</Container>
	);
});