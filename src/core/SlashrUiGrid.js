import React from 'react';
import {decorate, observable, action} from "mobx";
import {SlashrUtils} from '../Utils';

const utils = new SlashrUtils();

export class SlashrUiGrid {
	constructor(slashrUi, idx, props) {
		this._metadata = {
			ui: slashrUi,
            idx: idx,
            hasInitialized: false,
			loadingIndicator: props.loadingIndicator || null,
			layoutUpdater: props.layoutUpdater || null,
			sectionRenderer: props.sectionRenderer || null,
			sectionSpacerRenderer: props.sectionSpacerRenderer || null,
			itemLoader: props.itemLoader || null,
			onLoad: props.onLoad || null,
			items: props.items || null,
			ref: props.forwardRef || React.createRef(),
			eventHandlers: {},
			updateLayoutTimeout: null
		};
		this.initialize(props);
	}
	updateProps(props){
		// TODO: Test this, kind of hacky. Wrote for grid preloading
		for(let prop in props){
            if(prop in this._metadata) this._metadata[prop] = props[prop];
        }
        if(props.portal){
            if(! this._portal) this._portal = props.portal;
            else if(props.portal.name !== this._portal.name) throw("Grid Error: Mismatched portals.");
        }
	}
	initialize(props, reset = false) {
		this._slashr = props.slashr;
		this._lastPage = 0;
		//this._isLoadingNext = false;
		this._isLoaded = false;
		// this.loadPage(page);
		this._metadata.props = {};
		this._metadata.pages = {};
		this._metadata.visiblePages = {};
		this._metadata.sections = {};
		// this._metadata.lastPage = 0;
		this._metadata.isLoadingNext = false;
		this._metadata.scrollOffsetTop = props.scrollOffsetTop || 0;
		this._metadata.noResults = props.noResults || null,
			this._metadata.disabled = props.disabled || false;
		// this._metadata.initialPage = props.page || 1;
		this._resultsPerPage = props.resultsPerPage || null;
        this._pagesPerSection = props.pagesPerSection || 1;
        this._portal = props.portal || null;
        
        // if(! this._portal){
        //     console.log("set portal", JSON.stringify(this._slashr.router.loadingPortal.ui));
        //     this._portal = this._slashr.router.loadingPortal;
        // }
		// this._metadata.router = (props.history && props.location) ? {
		// 	history: props.history,
		// 	location: props.location
		// } : null;
		// if (this._stateProps && this._stateProps.name) {
		// 	console.log("grid check name", props.name, this.name);
		//}

		this._stateProps = {
			isInitialized: false,
			name: props.name || null
		};

		// Check History
		this._metadata.initialPage = props.page || 1;
		this._metadata.history = null;
		this._metadata.initialScrollY = 0;

        let router = this._slashr.router;

		let historyState = null;
        if(! this._portal 
            && router.loadingPortalName 
            && router.computedHistoryAction
            && router.computedHistoryAction === "POP"
            && router.slashrState 
            && router.slashrState.router
            && router.slashrState.router.portals[router.loadingPortalName]
            && router.slashrState.router.portals[router.loadingPortalName].ui
            && router.slashrState.router.portals[router.loadingPortalName].ui.grid){
            // Grid has been created from a controller
            // Check history to get the initial state

            switch (router.computedHistoryAction) {
                case "POP":
                    historyState = router.slashrState.router.portals[router.loadingPortalName].ui.grid;
                break;
            }
        }
        else if (! this._metadata.history  
            && router.computedHistoryAction
            && router.computedHistoryAction === "POP"
            && this._portal 
            && this._portal.ui 
            && this._portal.ui.grid 
            && this._portal.ui.grid.grids[this.name]) {
			switch (router.computedHistoryAction) {
				case "POP":
					historyState = this._portal.ui.grid;
					break;
			}
		}
        if(historyState && historyState.grids[this.name]){
            this._metadata.history = historyState.grids[this.name];
            this._metadata.initialPage = historyState.grids[this.name].page;
            this._metadata.initialScrollY = (historyState.scrollY || 0);
        }
		// if (props.history && props.location && props.location.state && props.location.state._slashr){
		// 	let historyAction = props.history.action;
		// 	switch (historyAction) {
		// 		case "POP":
		// 		throw("SLDKJF");
		// 			if (props.location.state && props.location.state._slashrUiGrid) {
		// 				throw("SLKDJF");
		// 				console.log("slashr ui grid",props.location.state._slashrUiGrid);
		// 				let historyState = props.location.state._slashrUiGrid;
		// 				// console.log("grid test history loca",props.location);
		// 				if (historyState.grids[this.name]) {
		// 					this._metadata.history = historyState.grids[this.name];
		// 					this._metadata.initialPage = historyState.grids[this.name].page;
		// 					this._metadata.initialScrollY = (historyState.scrollY || 0);
		// 				}
		// 			}
		// 			break;
		// 		case "PUSH":
		// 			console.log("");
		// 			//throw ("REMOVE FROM HISTORY");
		// 			break;
		// 	}
        // }
        
        this._metadata.initialSection = this.getSectionByPage(this.initialPage);
        this._metadata.hasInitialid = true;
	}
	get updateSize() {
		return this._metadata.updateSize;
	}
	update() {

	}
	updateLayout() {
		try{
			if (this.layoutUpdater) {
				// if(this._metadata.updateLayoutTimeout) return;
				// this._metadata.updateLayoutTimeout = setTimeout(
					// async ()=>{
						this.layoutUpdater();
						for (let i in this.sections) {
							this.sections[i].updateLayout();
						}
						this._metadata.updateLayoutTimeout = null;
			// 		},250);
			}
		}
		catch(err){
			// Probably unmounted before updating...
			console.error("Grid update error",err);
		}
	}
	updateScrollHistory() {

	}
	updateHistory() {
		if (!this._portal) return;
		// Make sure the update is on the correct portal.
		if (this._slashr.router.route.portal !== this._portal.name) return;

		let lastVisiblePage = 0;
		for (let page in this._metadata.visiblePages) {
			if (page > lastVisiblePage) lastVisiblePage = parseInt(page);
		}

		let section = null;
		let page = null;
		if (lastVisiblePage) {
			let sectionNum = this.getSectionByPage(lastVisiblePage);
			section = this.sections[sectionNum];
		}
		else {
			return;
			// console.log(this._metadata.visiblePages);
			// throw("NO VISIBLE PAGE ?????");
		}
	
		let uiState = this._slashr.router.getUiState(this._portal.name);

		let gridState = uiState.grid || {};

		if (!gridState.grids) gridState.grids = {};


		let scrollY = window.scrollY;
		// // Check if already in history
		if (!gridState.grids[this.name] || gridState.grids[this.name].page !== lastVisiblePage) {
			gridState.grids[this.name] = {};
			gridState.grids[this.name].section = section.num;
			gridState.grids[this.name].page = lastVisiblePage;
			// gridState[this.name].scroll = utils.dom.scrollPosition();
			gridState.grids[this.name].offset = 0;
			gridState.grids[this.name].size = {
				height: section.ref.current.offsetHeight,
				width: section.ref.current.offsetWidth
			};

			// // console.log();
			if (section.num > 1) {
				gridState.grids[this.name].offset = utils.dom.offset(section.ref.current);
			};
		}
		else {
			// Just update scroll??
			if (gridState.scrollY && gridState.scrollY === scrollY) {
				return false;
			}
		}
		gridState.scrollY = scrollY;

		if(! this.isDisabled){
			this._slashr.router.updateUiState(this._portal.name, {
				scroll: {
					x: window.scrollX,
					y: window.scrollY
				},
				grid: gridState
			});
		}

	}

	async itemLoader(startPage = 1, endPage = null) {
		let items = await this._metadata.itemLoader(startPage, endPage);
		return items;
	}
	// async load(){
	// 	return await this.loadPage(this.initialPage);
	// }
	async loadPage(startPage = 1, endPage = null) {
		if (!endPage) endPage = startPage;
		//if (this._isLoaded) return false;

		if (this.items) {
			startPage = 1;
			this._isLoaded = true;
			this._metadata.pages[startPage] = this.items;
		}
		else {
			// Make sure pages aren't loaded
			let pages = []
			for (let p = startPage; p <= endPage; p++) {
				if (!this._metadata.pages[p]) pages.push(p);
			}
			// Is there anythng to load?
			if (!pages.length) return false;

			if (endPage > this.lastPage) this._lastPage = endPage;
            let itemPages = await this.itemLoader(startPage, endPage);
            
			//console.log("TODO: Update this so that masonary makes sense");
			if (this.pagesPerSection === 1) {
				let nItemPages = {};
				nItemPages[startPage] = itemPages;
				itemPages = nItemPages;
            }

			this._metadata.pages = { ...this._metadata.pages, ...itemPages };

			for (let page in itemPages) {
				if (this._metadata.onLoad) this._metadata.onLoad(this, page);
			}

			// See if the last loaded page resultrs mean grid loaded
			if (!itemPages[endPage] || !itemPages[endPage].length
				|| (this.resultsPerPage && this.resultsPerPage > itemPages[endPage].length)) {
				this._isLoaded = true;
			}

			// let scrollPosStart = utils.dom.scrollPosition();
			this.updateSectionLoaded(startPage, endPage);
			//let scrollPosEnd = utils.dom.scrollPosition();

			// this._metadata.pages[page] = items;
			// console.log("grid check loaded", this.resultsPerPage);
			// if (!items.length || (this.resultsPerPage && this.resultsPerPage > items.length)) this._isLoaded = true;
			// if (this._metadata.onLoad) this._metadata.onLoad(this, page);
			// this.updateSectionLoaded(page);
		}

		// Something has loaded
		this._stateProps.isInitialized = true;
	}
	async loadPages(pages) {
		await this.loadPage(pages[0], pages[pages.length - 1])
	}
	updateSectionLoaded(startPage, endPage) {
		let section = this.getSectionByPage(startPage);
		if (!this.sections[section]) throw ("Grid Error: Section not found");
		this.sections[section].setPageRangeLoaded(startPage, endPage);
	}
	async load() {
		let initialPage = (this.history) ? this.initialPage : 1;
		let initialSection = this.getSectionByPage(initialPage);
		if (!this.sectionExists(initialSection)){
			this.addSection(initialSection);
			//throw ("Grid Error: Initial section not found...");
		}
		await this.sections[initialSection].load();
		return true;
	}
	async loadNextPage() {
		if (this.isLoadingNext) return false;
		this._metadata.isLoadingNext = true;
		await this.loadPage(this.lastPage + 1);
		this._metadata.isLoadingNext = false;
	}
	get name() {
		return this._stateProps.name;
	}
	get isDisabled() {
		return this._metadata.disabled;
	}
	get totalItems() {
		let totalItems = 0;
		for (let p in this.pages) {
			totalItems += this.pages[p].length;
		}
		return totalItems;
	}
	disable() {
		this._metadata.disabled = true;
	}
	enable() {
		this._metadata.disabled = false;
	}
	get idx() {
		return this._metadata.idx;
	}
	get resultsPerPage() {
		return this._resultsPerPage;
	}
	get pagesPerSection() {
		return this._pagesPerSection;
	}
	get scrollOffsetTop() {
		return this._metadata.scrollOffsetTop;
	}
	get isLoaded() {
		return this._isLoaded;
	}
	get isLoadingNext() {
		return this._metadata.isLoadingNext;
	}
	get isInitialized() {
		return this._stateProps.isInitialized;
	}
	get pages() {
		return this._metadata.pages;
	}
	get initialPage() {
		return this._metadata.initialPage;
	}
	get initialSection() {
		return this._metadata.initialSection;
	}
	get history() {
		return this._metadata.history;
	}
	get initialScrollY() {
		return this._metadata.initialScrollY;
	}
	// get route() {
	// 	return this._metadata.route;
	// }
	// get slashr() {
	// 	return this._metadata.slashr;
	// }
	get lastPage() {
		return this._lastPage;
	}
	set pages(pages) {
		this._metadata.pages = pages;
		return this;
	}
	get sections() {
		return this._metadata.sections;
	}
	set sections(sections) {
		this._metadata.sections = sections;
		return this;
	}
	get noResults() {
		return this._metadata.noResults || null;
	}
	// get initialSection{
	// 	let initialPage = (this.history) ?  this.initialPage : 1;
	// 	let initialSection = this.getSectionByPage(initialPage);
	// }
	reset(props) {
		this.initialize(props, true);
		// this.load();
	}
	refresh(page) {
		throw ("REFRESH GRID");
	}
	delete() {
		this._metadata.ui.deleteGrid(this.idx);
	}
	addVisiblePage(page, pageKey) {
		if (!this._metadata.visiblePages[page]) this._metadata.visiblePages[page] = {};
		this._metadata.visiblePages[page][pageKey] = true;
	}
	removeVisiblePage(page, pageKey) {
		if (this._metadata.visiblePages[page]) {
			if (this._metadata.visiblePages[page][pageKey]) delete this._metadata.visiblePages[page][[pageKey]];
			if (!Object.keys(this._metadata.visiblePages[page]).length) delete this._metadata.visiblePages[page];
		}
	}
	addSection(section) {
		if(! this.sections[section]) this.sections[section] = new SlashrUiGridSection(this, section);
		return this.sections[section];
	}
	sectionExists(section) {
		// for (let i in this.sections) {
		// 	console.log("grid check section exists", i);
		// }
		// console.log("grid check return", section, (this.sections[section]) ? true : false);
		return (this.sections[section]) ? true : false;
	}
	sectionLoaded(section) {
		// for (let i in this.sections) {
		// 	console.log("grid check section exists", i);
		// }
		// console.log("grid check return", section, (this.sections[section]) ? true : false);
		if (!this.sectionExists) return false;
		return this.sections[section].isLoaded;
	}
	getPageRangeBySection(section) {
		return {
			start: (this.pagesPerSection * section) - (this.pagesPerSection - 1),
			end: (this.pagesPerSection * section)
		}
	}
	getPagesBySection(section) {
		let ret = [];
		let secIdx = (section - 1);
		for (let i = 1; i <= this.pagesPerSection; i++) {
			ret.push(
				(secIdx * this.pagesPerSection) + i
			)
		}
		return ret;
	}
	getSectionByPage(page) {
		// if (page < this.pagesPerSection) return 1;
		return Math.ceil(page / this.pagesPerSection);
	}
	get loadingIndicator() {
		return this._metadata.loadingIndicator;
	}
	layoutUpdater() {
		return this._metadata.layoutUpdater();
	}
	renderSection(section) {
		return (this._metadata.sectionRenderer) ? this._metadata.sectionRenderer(section.num) : null;
	}
	renderSectionSpacer(section) {
		return (this._metadata.sectionSpacerRenderer) ? this._metadata.sectionSpacerRenderer(section.num) : null;
	}
}
decorate(SlashrUiGrid, {
    _stateProps: observable,
    initialize: action,
	loadPage: action,
	updateLayout: action
});

export class SlashrUiGridSection {
	_stateVars = {};
	constructor(slashrUiGrid, section, renderer, options = {}) {
		this._metadata = {
			grid: slashrUiGrid,
			section: section,
			pages: {},
			loaded: false,
			pageCount: 0,
			lastPageLoaded: null,
			lastLayoutUpdate: null,
			ref: React.createRef()
		};
		this._stateVars = {
			pages: {},
			lastPageLoaded: null,
			lastLayoutUpdate: null
		}
		this.initialize();
	}
	initialize() {
		let pages = this.grid.getPagesBySection(this.section);
		let statePages = {}
		for (let page of pages) {
			statePages[page] = false;
		}
		this._stateVars.pages = statePages;
	}
	async load() {
		if (!this._metadata.pageCount) {
			let pages = this.grid.getPagesBySection(this.section);

			// if(this.grid.isInitialized) throw("LSKDJFLKJDSLFKJSDFH");

			// Load First Page
			if (pages[0] === this.grid.initialPage || (this.section > 1 && this.previousLoaded)) {
				// throw("SLDKJFLKSDJFLKSJDFH");
				await this.grid.loadPage(pages[0]);
			}
			else {
				// throw("LSKDJFLKSDJFLKSJDF");
				await this.grid.loadPages(pages);
			}


			// if (!this.grid.isInitialized && this.grid.initialPage > 1) {
			// 	console.log("GRID check history  LOAD PAGE GRID NOT INITIALIZED.... MOVING ON", this.section, pages[0]);
			// 	console.log(pages);
			// 	console.log(this.grid.initialPage);
			// 	if (pages[0] === this.grid.initialPage) {
			// 		console.log(pages[0], this.grid.initialPage, (pages[0] === this.grid.initialPage));
			// 		this.grid.loadPage(pages[0]);
			// 	}
			// 	else this.grid.loadPages(pages);
			// }
			// else if ((this.section == 1 && this.grid.initialPage > 1) || (this.section > 1 && this.previousExists)) {
			// 	console.log("GRID check history  LOAD PAGE FOR SECTION: ", this.section, this.nextExists, this.previousExists);
			// 	// Load the first page of the section
			// 	this.grid.loadPage(pages[0]);
			// }
			// else {
			// 	console.log("GRID check history  LOAD PAGEs FOR SECTION: ", this.section, pages);
			// 	// Load the entire section
			// 	this.grid.loadPages(pages);
			// }
		}
	}
	updateLayout() {
		this._stateVars.lastLayoutUpdate = new Date().getTime();
	}
	setPageRangeLoaded(startPage, endPage) {
		let loadedPages = {};
		let hasLoadedPages = false;
		for (let page = startPage; page <= endPage; page++) {
			if (!this._stateVars.pages[page]) {
				loadedPages[page] = true;
				hasLoadedPages = true;
			}
		}

		if (hasLoadedPages) this._stateVars.pages = { ...this._stateVars.pages, ...loadedPages };

		let isLoaded = true;
		// //let nStatePages = {};
		let pageCount = 0;
		for (let p in this._stateVars.pages) {
			if (!this._stateVars.pages[p]) isLoaded = false;
			else pageCount++
		}
		// // this._statePages = nStatePages;
		this._metadata.pageCount = pageCount;
		this._metadata.loaded = isLoaded;
		this._stateVars.lastPageLoaded = endPage;
	}
	pageExists(page) {
		return (page in this.pages);
	}
	get idx() {
		return this._metadata.section;
	}
	get num() {
		return this._metadata.section;
	}
	get number() {
		return this._metadata.section;
	}
	get section() {
		return this._metadata.section;
	}
	get ref() {
		return this._metadata.ref;
	}
	get next() {
		return this._metadata.section + 1;
	}
	get previous() {
		return this._metadata.section - 1;
	}
	get nextExists() {
		return this._metadata.grid.sectionExists(this.next);
	}
	get previousExists() {
		if (this.section === 1) return true;
		return this._metadata.grid.sectionExists(this.previous);
	}
	get previousLoaded() {
		if (this.section === 1) return true;
		return this._metadata.grid.sectionLoaded(this.previous);
	}
	get grid() {
		return this._metadata.grid;
	}
	get isFirstPageLoaded() {
		let pages = this.grid.getPagesBySection(this.section);
		return (this.pages[pages[0]]) ? true : false;
	}
	get firstpage() {
		let pages = this.grid.getPagesBySection(this.section);
		return pages[0];
	}
	get isLoaded() {
		return this._metadata.loaded;
		// let ret = true;
		// if(this._metadata.loaded) return true;
		// for(let page in this._statePages){
		// 	if(! this._statePages.loaded) ret = false;
		// }
		// this._metadata.loaded = ret;
		// return ret;
	}
	get shouldRender() {
		return (this._stateVars.lastPageLoaded) ? true : false
	}
	get lastPageLoaded() {
		return this._stateVars.lastPageLoaded;
	}
	get pages() {
		return this._stateVars.pages;
	}
	checkUpdates() {
		if (this._metadata.lastPageLoaded !== this._stateVars.lastPageLoaded) {
			this._metadata.lastPageLoaded = this._stateVars.lastPageLoaded;
		}
		if (this._metadata.lastLayoutUpdate !== this._stateVars.lastLayoutUpdate) {
			this._metadata.lastLayoutUpdate = this._stateVars.lastLayoutUpdate;
		}
	}
	render() {
		//TODO: Kind of a hacky way to force reaction
		this.checkUpdates();
		return this.grid.renderSection(this);
	}
	renderSpacer() {
		return this.grid.renderSectionSpacer(this);
	}
}
decorate(SlashrUiGridSection, {
	_stateVars: observable,
	initialize: action,
	upodateLayout: action,
	setPageRangeLoaded: action,
	checkUpdates: action
});