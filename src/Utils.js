export class SlashrUtils {
	constructor() {
		this.dom = new SlashrDomUtils();
		this.core = new SlashrCoreUtils();
		this.date = new SlashrDateUtils();
		this.array = new SlashrArrayUtils();
		this.string = this.str = new SlashrStringUtils();
	}
}
export class SlashrDateUtils {
	LABEL_TYPE_SHORT = "short"
	LABEL_TYPE_ABBREVIATED = "abbrv"
	LABEL_TYPE_SINGLE_LETTER = "letter"
	_monthLabels = ["january", "febuary", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
	_monthLabelsShort = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
	_dayLabels = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
	_dayLabelsShort = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
	_dayLabelsAbbrv = ["su", "mo", "tu", "we", "th", "fr", "sa"];
	_dayLabelsSingleLetter = ["s", "m", "t", "w", "t", "f", "s"];

	toShortDate(date) {
		return (date.getMonth() + 1) +
			"/" + date.getDate() +
			"/" + date.getFullYear();
	}
	getDayLabel(day, type) {
		let ret = "";
		if (day instanceof Date) day = day.getDay();
		else if (day < 0 || day > 6) return null;
		switch (type) {
			case this.LABEL_TYPE_SHORT:
				ret = this._dayLabelsShort[day];
				break;
			case this.LABEL_TYPE_ABBREVIATED:
				ret = this._dayLabelsAbbrv[day];
				break;
			case this.LABEL_TYPE_LETTER:
				ret = this._dayLabelsSingleLetter[day];
				break;
			default:
				ret = this._dayLabels[day];
		}
		return ret;
	}
	getMonthLabel(month, type) {
		let ret = "";
		if (month instanceof Date) month = month.getMonth();
		else if (month < 0 || month > 11) return null;
		switch (type) {
			case this.LABEL_TYPE_SHORT:
				ret = this._monthLabelsShort[month];
				break;
			default:
				ret = this._monthLabels[month];
		}
		return ret;
	}
	areDatesSameDay(d1, d2) {
		return d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate();
	}
	areDatesSameMonth(d1, d2) {
		return d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth();
	}
}
export class SlashrCoreUtils {
	// Utils
	arePropsEqual(prop1, prop2, maxDepth, _depth = 0) {
		// Check for non objects
		if (prop1 === prop2) return true;
		//else if(typeof prop1 !== 'object' && typeof prop2 !== 'object') return false;

		if (typeof prop1 !== 'object' || prop1 === null ||
			typeof prop2 !== 'object' || prop2 === null) return false;

		var keys1 = Object.keys(prop1);
		var keys2 = Object.keys(prop2);

		if (keys1.length !== keys2.length) return false;

		// Test for A's keys different from B.
		var bHasOwnProperty = hasOwnProperty.bind(prop2);
		for (var i = 0; i < keys1.length; i++) {
			//! bHasOwnProperty(keys1[i]) || 
			if ((!maxDepth || _depth < maxDepth) && typeof prop1[keys1[i]] === "object" && typeof prop2[keys1[i]] === "object") {
				if (!this.arePropsEqual(prop1[keys1[i]], prop2[keys1[i]], maxDepth, _depth + 1)) return false;
			}
			else if (prop1[keys1[i]] !== prop2[keys1[i]]) return false;
		}
		return true;
	}
	getFunctionArgumentNames(func) {
		let STRIP_COMMENTS = /(\/\/.*)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
		let ARGUMENT_NAMES = /([^\s,]+)/g;
		let fnStr = func.toString().replace(STRIP_COMMENTS, '');
		let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
		return result || [];
	}
	getMethodArgumentNames(classObj, methodName) {
		return this.getFunctionArgumentNames(classObj[methodName]);
	}
}
export class SlashrArrayUtils {
	unique(arr) {
		return [...new Set(arr)];
	}
	shuffle(array) {
		var i = 0,
			j = 0,
			temp = null;

		for (i = array.length - 1; i > 0; i -= 1) {
			j = Math.floor(Math.random() * (i + 1));
			temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	}
}
export class SlashrDomUtils {
	hyphenateCssProp(property) {
		return property.replace(/([a-z])([A-Z])/, function (a, b, c) {
			return b + "-" + c.toLowerCase();
		});
	}
	getComputedStyle(node, property) {
		if (window.getComputedStyle) {
			property = this.hyphenateCssProp(property);
			return window.getComputedStyle(node, null).getPropertyValue(property);
		}
		else if (node.currentStyle) {
			return node.currentStyle[property];
		}
		return node.style[property];
	}
	getTransformInfo(node) {
		var matrix = this.parseMatrix(getComputedStyle(node, null).transform),
			rotateY = Math.asin(-matrix.m13),
			rotateX,
			rotateZ;

		if (Math.cos(rotateY) !== 0) {
			rotateX = Math.atan2(matrix.m23, matrix.m33);
			rotateZ = Math.atan2(matrix.m12, matrix.m11);
		} else {
			rotateX = Math.atan2(-matrix.m31, matrix.m22);
			rotateZ = 0;
		}
		return {
			rotate: { x: rotateX, y: rotateY, z: rotateZ },
			translate: { x: matrix.m41, y: matrix.m42, z: matrix.m43 }
		}
	}
	parseMatrix(matrixString) {
		var c = matrixString.split(/\s*[(),]\s*/).slice(1, -1),
			matrix;

		if (c.length === 6) {
			// 'matrix()' (3x2)
			matrix = {
				m11: +c[0], m21: +c[2], m31: 0, m41: +c[4],
				m12: +c[1], m22: +c[3], m32: 0, m42: +c[5],
				m13: 0, m23: 0, m33: 1, m43: 0,
				m14: 0, m24: 0, m34: 0, m44: 1
			};
		} else if (c.length === 16) {
			// matrix3d() (4x4)
			matrix = {
				m11: +c[0], m21: +c[4], m31: +c[8], m41: +c[12],
				m12: +c[1], m22: +c[5], m32: +c[9], m42: +c[13],
				m13: +c[2], m23: +c[6], m33: +c[10], m43: +c[14],
				m14: +c[3], m24: +c[7], m34: +c[11], m44: +c[15]
			};

		} else {
			// handle 'none' or invalid values.
			matrix = {
				m11: 1, m21: 0, m31: 0, m41: 0,
				m12: 0, m22: 1, m32: 0, m42: 0,
				m13: 0, m23: 0, m33: 1, m43: 0,
				m14: 0, m24: 0, m34: 0, m44: 1
			};
		}
		return matrix;
	}
	getPropertyUnitMap() {
		return {
			pixel: "px",
			percent: "%",
			inch: "in",
			cm: "cm",
			mm: "mm",
			point: "pt",
			pica: "pc",
			em: "em",
			ex: "ex"
		};
	}
	getPropertyUnitMapIdx(unit, map) {
		let unitIdx = null;
		map = map || this.getPropertyUnitMap();
		if (map[unit]) unitIdx = unit;
		else {
			for (let item in map) {
				if (map[item] == unit) {
					unitIdx = item;
					break;
				}
			}
		}
		if (!unitIdx) throw new frak("getPropertyUnitMapIdx: Unit idx not found");
		return unitIdx;
	}
	stripPropertyValueUnit(value) {
		if (!isNaN(value)) return parseFloat(value[0]);
		value = value.match(/[-]{0,1}[\d]*[\.]{0,1}[\d]+/g);
		return (value === null) ? null : parseFloat(value[0]);
	}
	getPropertyUnitByValue(value) {
		if (!isNaN(value)) return null;
		value = value.match(/\D+$/);
		if (value === null) return this.getPropertyUnitMap().pixel;
		value = value[0];
		if (value.endsWith && value.endsWith(")")) value = value.substring(0, value.length - 1);
		return (value === null) ? this.getPropertyUnitMap().pixel : value;
	}
	getPropertyValueByUnit(unit, target, property) {
		unit = this.getPropertyUnitMapIdx(unit);
		let ret = this.getPropertyUnitValues(target, property, unit);
		return ret[unit];
	}
	getPropertyUnitValues(target, property, unit) {
		let baseline = 100;  // any number serves 
		let item;  // generic iterator

		let map = this.getPropertyUnitMap();

		let factors = {};
		let units = {};

		let value = target[property] || this.getComputedStyle(target, property);

		let numeric = this.stripPropertyValueUnit(value);
		if (numeric === null) throw new frak("getPropertyUnitValues: Invalid property value returned");
		let computedUnit = this.getPropertyUnitByValue(value);

		let currUnit;
		for (item in map) {
			if (map[item] == computedUnit) {
				currUnit = item;
				break;
			}
		}
		if (!currUnit) throw new frak("getPropertyUnitValues: Computed unit not found");

		if (unit) {
			// Convert unit to a map idx
			unit = this.getPropertyUnitMapIdx(unit, map);
			let tMap = {};
			tMap[currUnit] = map[currUnit];
			tMap[unit] = map[unit];
			map = tMap;
		}

		let temp = document.createElement("div");
		temp.style.overflow = "hidden";
		temp.style.visibility = "hidden";
		target.parentElement.appendChild(temp);
		for (item in map) {
			temp.style.width = baseline + map[item];
			factors[item] = baseline / temp.offsetWidth;
		}
		for (item in map) {
			units[item] = numeric * (factors[item] * factors[currUnit]);
		}
		target.parentElement.removeChild(temp);

		return units;
	}
	// styles: element style object 
	// returns a standard javascript style object
	parseElementStyle(styles) {
		let hasTransforms = false;
		let transforms = {};
		let transform = null;

		if (styles.transform) {
			if (typeof styles.transform === "string") throw ("TODO: Allow transform strings in element reactStyle");

			// Check for specific transform options
			if (styles.transform.origin) {
				styles.transformOrigin = styles.transform.origin;
				delete styles.transform.origin;
			}
			styles.transform = this.renderElementTransformStyle(styles.transform);
		}
		return styles;
	}
	renderElementTransformStyle(transforms) {
		let transformArr = [];
		for (let p in transforms) {
			switch (p) {
				case "scale":
				case "translate":
					let rProps = null;
					if (Array.isArray(transforms)) {
						if (transforms.length < 2 || transforms[0] === null || transforms[1] === null) throw ("Element Error: Transform array must be [x,y,z,...]");
						if (transforms[0] === null || transforms[1] === null) throw ("Element Error: Transforms array cannot have null values.");
						transformArr.push(`${p}(${transforms[p].join(",")})`);
					}
					else if (typeof transforms[p] === 'object') {
						if (transforms[p].x === undefined || transforms[p].x === null) throw ("Element Error: Transform must have an x and y");
						if (transforms[p].y === undefined || transforms[p].y === null) throw ("Element Error: Transform must have an x and y");
						let pArr = [transforms[p].x, transforms[p].y];
						if (transforms[p].y) pArr.push(transforms[p].y);
						transformArr.push(`${p}(${pArr[p].join(",")})`);
					}
					else {
						transformArr.push(`${p}(${transforms[p]})`);
					}
					break;
				default:
					transformArr.push(`${p}(${transforms[p]})`);
			}
		}
		return (transformArr.length) ? transformArr.join(" ") : null;
	}
	offset(elmt) {
		var rect = elmt.getBoundingClientRect(),
			scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
			scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
	}
	scrollPosition() {
		return {
			top: window.pageYOffset || document.documentElement.scrollTop,
			left: window.pageXOffset || document.documentElement.scrollLeft
		};
	}
	scrollTop(top = 0) {
		this.scrollTo(0, top);
	}
	scrollTo(left, top, options = {}) {
		let isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;
		if (isSmoothScrollSupported) {
			let scrollOpts = {
				left: left,
				top: top
			};
			if (options.behavior) scrollOpts.behavior = options.behavior;
			window.scrollTo(scrollOpts);
		}
		else window.scrollTo(left, top);
	}
	scrollToElement(elmt, options = {}) {
		if (!elmt) return false;
		let offset = {
			top: options.top || null,
			left: options.left || null
		};
		if (offset.top === null || offset.left === null) {
			let calcOffset = this.offset(elmt);
			if (offset.top === null) offset.top = calcOffset.top;
			if (offset.left === null) offset.left = calcOffset.left;
		}
		if (options.offsetTop) offset.top -= options.offsetTop;
		this.scrollTo(offset.left, offset.top);
	}
	getBodyWidth() {
		var body = document.body;
		var html = document.documentElement;
		return Math.max(body.scrollWidth, body.offsetWidth, body.getBoundingClientRect().width, html.clientWidth, html.scrollWidth, html.offsetWidth);
	}
	getBodyHeight() {
		var body = document.body;
		var html = document.documentElement;
		return Math.max(body.scrollHeight, body.offsetHeight, body.getBoundingClientRect().height, html.clientHeight, html.scrollHeight, html.offsetHeight);
	}
	getBodySize() {
		return {
			x: this.getBodyWidth(),
			y: this.getBodyHeight()
		};
	}
}
export class SlashrStringUtils {
	slugify(txt = "") {
		if(! txt) return "";
		let slug = txt.toString().trim().toLowerCase()
			.replace(/\s+/g, '-')           // Replace spaces with -
			.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
			.replace(/\-\-+/g, '-')         // Replace multiple - with single -
			.replace(/^-+/, '')             // Trim - from start of text
			.replace(/-+$/, '');            // Trim - from end of text
		
		let slugArr = [];
		let len = 0;
		slug.split("-").forEach((val)=>{
			if(len + val.length < 60){
				slugArr.push(val);
				len += val.length;
			} 
		});
		return slugArr.join("-");
	}
	capitalize(w) {
		return w.replace(/^\w/, w => w.toUpperCase());
	}
	renderSocialText(text, tagRenderer) {
		if (!text) return text;
		if (text.indexOf("@[") === -1) return text;
		let regex = /@\[([a-z\d_]+):([a-z\d_ ]+):([a-z\d_-]+)\]/ig;
		// text = reactStringReplace(text, regex, (match, i) => {
		// 	console.log("mention",match,i);
		// });
		let tags = text.match(regex);
		if (!tags || !tags.length) return text;
		let mentions = [];
		if (tags && tags.length) {
			tags.forEach((val) => {
				let idx = 0;
				let tagInfo = val.match(/@\[([a-z\d_]+):([a-z\d_ ]+):([a-z\d_-]+)\]/i);
				if (tagInfo.length < 4) return;
				let tag = {
					match: tagInfo[0],
					type: tagInfo[1],
					label: tagInfo[2],
					value: tagInfo[3]
				};
				// console.log("RENDER TAG match",tag.label, i);
				text = text.replace(tag.match, () => {
					return tagRenderer(tag.type, tag.value, tag.label, ++idx);
				});
			});
		}
		return text;
	}
}