
import React from 'react';
import { observer, inject } from 'mobx-react';
import { Container } from './Element';
import { trace } from 'mobx';

export const _GridSection = inject("slashr")(observer(
	class _GridSection extends React.Component {
		constructor(props) {
			super(props);
			// this.handleObserveIntersection = this.handleObserveIntersection.bind(this);
			this.idx = this.props.idx;
			this.size = {
				height: null,
				width: null
			};
			this.state = {
				hidden: false
			};
			this.grid = this.props.grid;
			this.section = this.props.section;
			this.ref = this.section.ref;
		}
		componentWillReact() {
			// if(this.grid.initialPage > 1 && this.section.pageExists(this.grid.initialPage)){
			// 	Slashr.utils.dom.scrollToElement(this.ref.cntr.current,{
			// 		offsetTop: this.grid.scrollOffsetTop 
			// 	});
			// }
		}
		componentDidMount() {
			if (!this.grid.initialized) {

			}
			// this.lastPageLoaded = this.props.section.lastPageLoaded;
		}
		componentDidUpdate() {

		}

		// renderSection() {
		// 	return this.props.children;
		// }
		render() {
			trace();
			return (
				<Container
					// onObserveIntersection={this.handleObserveIntersection}
					className="grid-section"
					ref={this.section.ref}
				>
					{this.section.num > 1 && this.section.renderSpacer()}
					{this.section.render()}

				</Container>
			);
		}
	}
));
// export const _GridPage = withRouter(
	class _GridPage extends React.Component {
		constructor(props) {
			super(props);
			this.grid = this.props.grid;
			this.handleObserveIntersection = this.handleObserveIntersection.bind(this);
			this.size = false;
			this.hide = this.props.hide || false;
			this.ref = React.createRef();
			// this.state = {
			// 	isHidden: false
			// }
		}
		handleObserveIntersection(entry) {

			// console.log("Load?");
			// throw("SLKDJF");
			if (entry.isIntersecting && this.grid.isInitialized) {
				if (!this.props.grid.sectionExists(this.props.section)) return false;
				this.grid.addVisiblePage(this.props.page, this.props.pageKey);
			}
			else if (!entry.isIntersecting) {
				this.grid.removeVisiblePage(this.props.page, this.props.pageKey);
			}
			//this.grid.updateHistory();
			//this.grid.loadPage(this.page);
			// this.setState({
			// 	hidden: (!  entry.isIntersecting)
			// });
		}
		componentDidMount() {
			// if (this.hide && !this.state.isHidden) {
			// 	this.size = {
			// 		height: this.ref.current.offsetHeight(),
			// 		width: this.ref.current.offsetWidth()
			// 	}
			// 	this.setState({
			// 		isHidden: true
			// 	});
			// }
		}
		render() {

			// let children = this.props.children;
			// let style = 
			// let children = (this.hide) ? "&nbsp;" ? this.props.children;

			// if (this.state.hidden) {
			// }

			return (
				<Container
					// ref={this.ref}
					// {...this.props.onObserveIntersection}
					onObserveIntersection={this.handleObserveIntersection}
				>
					{this.props.children}
				</Container>
			);
		}
	}
// );

export const _GridSectionLoader = inject("slashr")(observer(
	class _GridSectionLoader extends React.Component {
		constructor(props) {
			super(props);
			this.handleObserveIntersection = this.handleObserveIntersection.bind(this);
			this.grid = this.props.grid;
			this.section = this.grid.addSection(this.props.section);
			this.nextSectionExists = this.section.nextExists;
			this.intersectionTimeout = null;
			// this.isInitial = (this.props.initialSection === this.props.section);
		}
		componentDidMount() {
			// if(this.isInitial){
			// 	this.section.load();
			// }
			// if(this.isInitial && this.grid.history && this.grid.history.offset && this.grid.history.offset.top){
			// 	// Slashr.utils.dom.scrollToElement(this.ref.cntr.current,{
			// 	// 	offsetTop: this.grid.scrollOffsetTop 
			// 	// });
			// 	console.log("grid test scroll to",this.grid.history.offset.top);
			// }
		}
		componentWillReact() {
			this.grid.updateLayout();
		}
		renderLoader() {
			//let loadingNextControl = (this.props.loader) ? this.props.loader : <Container>Loading...</Container>
			// if (this.grid.isInitialized && !this.grid.isLoadingNext) {
			// 	loadingNextControl = React.cloneElement((this.props.showMoreButton) ? this.props.showMoreButton : <Button>Show More</Button>, {
			// 		onClick: this.handleLoadNextClick
			// 	});
			// }
		}
		update() {
			//this.grid.loadPage(this.page);
			//this.updateLayout();
			// console.log("GRID LOADED PAGE ",this.page, this.name);

		}


		handleObserveIntersection(entry) {
			if (entry.isIntersecting) {
				if (this.intersectionTimeout) return;
				this.intersectionTimeout = setTimeout(() => {
					this.section.load();
				}, 300);
			}
			else if (this.intersectionTimeout) {
				clearTimeout(this.intersectionTimeout);
				this.intersectionTimeout = null;
			}
		}
		render() {
			if (this.section.shouldRender) {
				let nextLoader = null;
				if (!this.grid.isLoaded && this.section.num >= (this.grid.initialSection + 1)) {
					nextLoader = <_GridSectionLoader
						grid={this.grid}
						section={this.section.num + 1}
						key={`${this.grid.name}section${this.section.num + 1}`}
					/>;
				}

				return (
					<React.Fragment>
						<_GridSection
							section={this.section}
							grid={this.grid}
						/>
						{nextLoader}
					</React.Fragment>
				);
			}
			else if (!this.grid.isLoaded || this.section.num < this.grid.initialSection) {
				let loaderCntrStyle = {};
				loaderCntrStyle.height = "100vh";
				if (this.grid.history) {
					let loaderHeight = (this.props.height || null);
					if (this.section.num === this.grid.initialSection) {
						if (this.grid.history.size && this.grid.history.size.height) {
							loaderHeight = this.grid.history.size.height;
						}
					}
					if (loaderHeight) loaderCntrStyle.height = `${loaderHeight}px`;
				}
				return (
					<Container
						style={loaderCntrStyle}
						className="grid-section-loader"
						onObserveIntersection={this.grid.isInitialized && this.handleObserveIntersection}
					>
						{this.grid.loadingIndicator}
					</Container>
				);
			}
			else {
				//console.log("TODO: Why does this need a key");
				return (!this.grid.totalItems && this.grid.noResults) ? <Container key={`grid-no-results-${this.grid.name}`} className="grid-no-results">{this.grid.noResults}</Container> : null;
			}
		}
	}
));

export const _GridLoader = inject("slashr")(observer(
	class _GridLoader extends React.Component {
		constructor(props) {
			super(props);
			this.grid = this.props.grid;
			// this.gridName = this.props.name;
			this.handleWindowScroll = this.handleWindowScroll.bind(this);

			// Set scroll restoration to manual
			if (this.grid.router) {
				// if (window.history && window.history.scrollRestoration) {
				// 	window.history.scrollRestoration = "manual";
				// }
			}
		}
		componentDidMount() {
			// Moved to router
			// if (this.grid.history && this.grid.initialScrollY) {
			// 	setTimeout(()=>{
			// 		Slashr.utils.dom.scrollTop(this.grid.initialScrollY);
			// 		//Slashr.utils.dom.scrollTop(this.props.grid.history.offset.top);
			// 	},300);
			// }
			// else setTimeout(()=>{
			// 		Slashr.utils.dom.scrollTop();
			// 		//Slashr.utils.dom.scrollTop(this.props.grid.history.offset.top);
			// 	},300);
			this.grid.load();
		}
		componentWillReact() {
			// console.log("search test grid will react");
			//this.updateLayout();
			let isDisabled = this.props.disabled || false;
			if (isDisabled != this.grid.isDisabled) {
				isDisabled ? this.grid.disable() : this.grid.enable();
			}

			// reset the layout
			if (this.props.grid.idx !== this.grid.idx){
				this.grid = this.props.grid;
			}
			else if (this.props.grid.name !== this.grid.name) {
				this.reset();
				return;
			}
			
			this.grid.updateLayout();


			// if (this.grid.isInitialized) this.updateLayout();
			//if(this.grid.isInitialized && this.hasRendered) this.updateLayout();
			//
			// console.log("grid test grid loader react123");
		}
		componentDidUpdate(prevProps) {
			if (!this.grid.isInitialized) {
				this.grid.load();
				// this.grid.updateLayout();
			}
		}
		reset() {
			this.grid.reset({ ...this.props, grid: null });
			// this.initialize();

		}
		handleWindowScroll(scroll) {
			this.grid.updateHistory();
		}

		// handleObserveIntersection(entry) {
		// 	console.log("RENDER GRID SECTION LOADER INTERSECT!!!!!!!!!!", this.section.section)
		// 	console.log("gridSectionLoader handleObserveIntersection?");
		// 	if (entry.isIntersecting) {
		// 		this.section.load();
		// 	}
		// 	//this.grid.loadPage(this.page);
		// 	// this.setState({
		// 	// 	hidden: (!  entry.isIntersecting)
		// 	// });
		// }
		render() {
			// let initialPage = (this.props.grid.history) ?  this.props.grid.initialPage : 1;
			let lastSection = this.grid.initialSection;
			let sectionLoaders = [];
			let prevLoaderHeight = null;
			if (lastSection > 1 && this.grid.history && this.grid.history.offset && this.grid.history.offset.top) {
				prevLoaderHeight = this.grid.history.offset.top / (lastSection - 1);
			}
			for (let section = 1; section <= (lastSection + 1); section++) {
				sectionLoaders.push(
					<_GridSectionLoader
						grid={this.props.grid}
						section={section}
						height={(section < lastSection) ? prevLoaderHeight : null}
						initialSection={lastSection}
						key={`${this.grid.name}section${section}`}
					/>
				);
			}
			return (
				<Container
					className="grid-loader"
					onWindowScroll={this.handleWindowScroll}
				>
					{sectionLoaders}
				</Container>
			);

			// console.log("RENDER GRID SECTION LOADER!!!!!!!!", this.section.section, this.section.isLoaded);
			// //trace(true);
			// // for(let page in this.section.pages){
			// // 	console.log(this.section.pages[page]);
			// // }
			// // if(this.shouthis.section.lastPage !== this.lastPage){

			// // }
			// // else return 
			// console.log("GRID check RENDER RENDER RENDER: ", this.props.section, this.previousSectionExists);
			// let loading = (this.props.loader) ? this.props.loader : <Container>Loading...</Container>;
			// if (this.section.shouldRender) {
			// 	//return this.props.sectionRenderer(this.props.section);

			// 	let prevLoaders = [];
			// 	console.log("check grid history",this.grid.history);
			// 	if(! this.previousSectionExists && this.grid.history){

			// 		// Render all previous loaders

			// 		let numSections = this.props.section - 1;
			// 		let prevLoaderHeight = null;
			// 		if(this.grid.history.offset && this.grid.history.offset.top){
			// 			console.log("calculate grid offset",this.grid.history.offset.top);
			// 			prevLoaderHeight = this.grid.history.offset.top / (this.props.section - 1)
			// 		}
			// 		for(let prevSec = 1; prevSec < this.props.section; prevSec++){
			// 			console.log("Create Loader with style",prevLoaderHeight);
			// 			prevLoaders.push(
			// 				<_GridSectionLoader
			// 					grid={this.grid}
			// 					section={prevSec}
			// 					height={prevLoaderHeight}
			// 					key={`${this.grid.name}section${prevSec}`}
			// 					loader={this.props.loader}
			// 					sectionRenderer={this.props.sectionRenderer}
			// 					sectionSpacerRenderer={this.props.sectionSpacerRenderer}
			// 				/>
			// 			);
			// 		}
			// 	}

			// 	let hasLoadNext = (!this.section.isLoaded && !this.grid.isLoaded);
			// 	return (
			// 		<React.Fragment>
			// 			{prevLoaders}
			// 			{(this.props.section > 1 && !this.previousSectionExists) &&
			// 				this.section.renderSpacer()
			// 			}

			// 			<_GridSection
			// 				section={this.section}
			// 				grid={this.grid}
			// 			/>

			// 			{(this.section.isLoaded && !this.nextSectionExists) && this.section.renderSpacer()}

			// 			{!this.nextSectionExists &&
			// 				<_GridSectionLoader
			// 					grid={this.grid}
			// 					section={this.props.section + 1}
			// 					loader={this.props.loader}
			// 					sectionRenderer={this.props.sectionRenderer}
			// 					sectionSpacerRenderer={this.props.sectionSpacerRenderer}
			// 				/>
			// 			}
			// 		</React.Fragment>
			// 	);
			// }
			// else {
			// 	let loaderCntrStyle = {};
			// 	if(this.props.height) loaderCntrStyle.height = `${this.props.height}px`;
			// 	if(this.grid.history && this.grid.history.section === this.props.section){
			// 		if(this.grid.history.offset && this.grid.history.offset.top){
			// 			loaderCntrStyle.paddingTop = this.grid.history.offset.top;
			// 		}
			// 		if(this.grid.history.size && this.grid.history.size.height){
			// 			loaderCntrStyle.height  = this.grid.history.size.height;
			// 		}
			// 	}
			// 	console.log("grid draw loader",this.previousSectionExists,this.props.section, loaderCntrStyle, this.grid.history);
			// 	return (

			// 		<Container
			// 			style={loaderCntrStyle}
			// 			className="grid-section-loader"
			// 			onObserveIntersection={this.handleObserveIntersection}
			// 		>
			// 			{this.props.loader || <Container>Loading...</Container>}
			// 		</Container>
			// 	);
			// }
		}
	}
));

// export class Grid extends React.Component {
// 	render() {
// 		return (
// 			<Provider slashr={Slashr.getInstance()}>
// 				<_Grid
// 					{...this.props}
// 				>
// 					{this.props.children}
// 				</_Grid>
// 			</Provider>
// 		);
// 	}
// }
export const Grid = inject("slashr")(observer(
	class Grid extends React.Component {
		constructor(props) {
			super(props);
			this.handleWindowResize = this.handleWindowResize.bind(this);
			this.handleLoadNext = this.handleLoadNext.bind(this);
			this.handleLoadNextClick = this.handleLoadNextClick.bind(this);
			this.sectionRenderer = this.sectionRenderer.bind(this);
			this.layoutUpdater = this.layoutUpdater.bind(this);
			// this.grid = this.props.slashr.ui.createGrid({
			// 	...this.props, ...{
			// 		sectionRenderer: this.sectionRenderer,
			// 		layoutUpdater: this.layoutUpdater
			// 	}
			// });

			this.ref = {
				cntr: React.createRef(),
				grid: React.createRef()
			}

            if (!props.itemRenderer) throw ("Grid Error: itemRenderer required.");
			this.initialize();
		}
		initializeGrid(){
			let gridProps = {
				...this.props, ...{
					sectionRenderer: this.sectionRenderer,
					layoutUpdater: this.layoutUpdater
				}
            };
			if(this.props.grid){
				this.grid = this.props.grid;
				this.grid.updateProps(gridProps);
			}
			else{
                this.grid = this.props.slashr.ui.createGrid(gridProps);
            }

		}
		initialize() {
			this.initializeGrid();
			this.items = this.props.items || [];
			this.minItemWidth = this.props.minItemWidth || 100;
			this.itemRenderer = this.props.itemRenderer;

			this.loadingIndicator = this.props.loadingIndicator || null;
			this.sectionSpacerRenderer = this.props.sectionSpacerRenderer || null;
			this.pagesPerSection = this.props.pagesPerSection || null;

			//this.itemLoader = this.props.itemLoader || null;
			this.page = this.grid.initalPage;
			// this.lastPage = this.page;
			this.idx = 0;
			this.resultsPerPage = this.props.resultsPerPage || null;
			this.numCols = 1;
			this.isLoading = false;
			//this.hasRendered = false;
			this.hiddenColumnPages = {};
		}
		get nextIdx() {
			return ++this.idx;
		}
		handleWindowResize() {

			//this.grid.updateLayout();
		}
		isHiddenColumnPage(column, page) {
			return (this.hiddenColumnPages[column] && this.hiddenColumnPages[column][page]) ? true : false;
		}
		handleLoadNext(entry) {
			if (this.grid.isInitialized && entry.isIntersecting) {
				this.grid.loadNextPage();
			}
		}
		handleLoadNextClick(entry) {
			this.grid.loadNextPage();
		}
		update() {

		}
		layoutUpdater() {

			// Update the number of items
			// let nTotalItems = 0;
			// for (let p in this.grid.pages) {
			// 	nTotalItems += this.grid.pages[p].length;
			// }
			// // Calculate the columns based on width of container and item min width
			// let nNumCols = Math.floor(this.ref.cntr.current.offsetWidth / this.minItemWidth) || 1;
			// // If the resize changes doesn't change the col count, nothing changes
			// // See if anything needs to be updates, if not, return
			// //if (nTotalItems === this.totalItems && nNumCols === this.numCols) return false;

			// //this.totalItems = nTotalItems;
			// this.numCols = nNumCols
			// //this.numRows = Math.ceil(this.totalItems / this.numCols);

			// // this.grid.updateLayout();

			return true;
		}
		componentWillReact() {
            if(this.props.grid && this.props.grid.idx !== this.grid.idx){
				this.grid.delete();
				this.grid = this.props.grid;
				this.initialize();
			}
			else if (this.props.name !== this.grid.name) {
				this.initialize();
			}
		}
		componentDidUpdate(prevProps) {

		}
		componentDidMount() {
			this.update();
		}
		componentWillUnmount() {
			this.grid.delete();
		}
		cellSpacerRenderer() {
			return (this.props.cellSpacerRenderer) ? this.props.cellSpacerRenderer : <Container class="cell-spacer">&nbsp;</Container>;
		}
		calculateNumRows(totalItems) {
			if (!totalItems || !this.numCols) return 0;
			// console.log("grid calculage num ros",totalItems, this.numCols, this.totalItems);
			// totalItems = totalItems || this.totalItems;
			return Math.ceil(totalItems / this.numCols);
		}
		sectionRenderer(section) {
			let secPages = this.grid.getPagesBySection(section);
			let hasSectionSpacers = false;
			let secItems = [];
			let items = [];
			let numCols = this.numCols || 1;

			let isSectionLoaded = true;
			for (let page of secPages) {
				if (!this.grid.pages[page]) {
					isSectionLoaded = false;
					continue;
				}
				let pageItems = [];
				for (let item of this.grid.pages[page]) {
					pageItems.push(this.itemRenderer(item, this.nextIdx));
				}
				items.push(
					<_GridPage
						grid={this.grid}
						page={parseInt(page)}
						pageKey={`page${parseInt(page)}`}
						section={section}
						key={`page${parseInt(page)}`}
					>
						{pageItems}
					</_GridPage>
				);
				// if (this.pagesPerSection && (page % this.pagesPerSection === 0)) {
				// 	hasSectionSpacers = true;
				// 	secItems.push(items);
				// 	items = [];
				// }
			}
			// if (items.length) {
			// 	secItems.push(items);
			// }

			// let sections = [];
			// for (let secIdx in secItems) {
			// 	let secNum = parseInt(secIdx) + 1;
			// 	let items = secItems[secIdx];
			// 	let itemIdx = 0;
			// 	let columns = [];
			// 	let colPageItems = [];
			// 	let numRows = this.calculateNumRows(items.length);
			// 	for (let row = 1; row <= numRows; row++) {
			// 		for (let col = 1; col <= this.numCols; col++) {
			// 			if (items[itemIdx]) {
			// 				let item = items[itemIdx];
			// 				if (!colPageItems[col - 1]) colPageItems[col - 1] = [];
			// 				if (!colPageItems[col - 1][item.page - 1]) colPageItems[col - 1][item.page - 1] = [];
			// 				colPageItems[col - 1][item.page - 1].push(this.itemRenderer(item.item, this.nextIdx));

			// 			}
			// 			else if (row === 1) {
			// 				colPageItems[col - 1] = this.cellSpacerRenderer(itemIdx);
			// 			}
			// 			itemIdx++;
			// 		}
			// 	}

			// 	for (let colIdx in colPageItems) {
			// 		let colKey = parseInt(colIdx) + 1;
			// 		let colItems = [];
			// 		let totalColPageItems = Object.keys(colPageItems).length;
			// 		let i = 1;
			// 		for (let page in colPageItems[colIdx]) {

			// 			if (!colPageItems[colIdx][page]) continue;

			// 			let pageNum = parseInt(page) + 1;

			// 			colItems.push(

			// 			);
			// 			i++;
			// 		}
			// 	}




			return (
				<React.Fragment>
					{items}
				</React.Fragment>
			);
			return columns;
		}



		render() {
			return (
				<Container
					onWindowResize={this.handleWindowResize}
					className="grid-cntr"
					ref={this.ref.cntr}
					style={{
						width: "100%"
					}}
				>
					<Container
						{...this.props}
						ref={this.ref.grid}
						className={this.props.className || "grid"}
					>
						<_GridLoader
							{...this.props}
							name={this.grid.name}
							grid={this.grid}
							sectionRenderer={this.sectionRenderer}
							sectionSpacerRenderer={this.sectionSpacerRenderer}
							loadingIndicator={this.loadingIndicator}
						/>
					</Container>
				</Container>
			);
		}
	}
));

// export class MasonaryGrid extends React.Component {
// 	render() {
// 		return (

// 				<_MasonaryGrid
// 					{...this.props}
// 				>
// 					{this.props.children}
// 				</_MasonaryGrid>

// 		);
// 	}
// }

export const MasonaryGrid = inject("slashr")(observer(
	class MasonaryGrid extends React.Component {
		constructor(props) {
			super(props);
			this.handleWindowResize = this.handleWindowResize.bind(this);
			this.handleObserveResize = this.handleObserveResize.bind(this);
			this.handlePageIntersection = this.handlePageIntersection.bind(this);
			this.handleLoadNext = this.handleLoadNext.bind(this);
			this.handleLoadNextClick = this.handleLoadNextClick.bind(this);
			this.sectionRenderer = this.sectionRenderer.bind(this);
			this.layoutUpdater = this.layoutUpdater.bind(this);
			this.ref = {
				cntr: React.createRef(),
				grid: React.createRef()
			}

			if (!props.itemRenderer) throw ("Masonary Grid Error: itemRenderer required.");

			this.initialize();
		}
		initializeGrid(){
			let gridProps = {
				...this.props, ...{
					sectionRenderer: this.sectionRenderer,
					layoutUpdater: this.layoutUpdater
				}
			};
			if(this.props.grid){
				this.grid = this.props.grid;
				this.grid.updateProps(gridProps);
			}
			else{
                this.grid = this.props.slashr.ui.createGrid(gridProps);
            }

		}
		initialize() {
			this.initializeGrid();
			this.items = this.props.items || [];
			this.minItemWidth = this.props.minItemWidth || 100;
			this.itemRenderer = this.props.itemRenderer;

			this.loadingIndicator = this.props.loadingIndicator || null;
			this.sectionSpacerRenderer = this.props.sectionSpacerRenderer || null;
			this.pagesPerSection = this.grid.pagesPerSection;

			//this.itemLoader = this.props.itemLoader || null;
			this.page = this.grid.initalPage;
			// this.lastPage = this.page;
			this.idx = 0;
			this.resultsPerPage = this.props.resultsPerPage || null;
			this.numCols = 1;
			this.isLoading = false;
			//this.hasRendered = false;
			this.hiddenColumnPages = {};
			this.updateLayoutTimeout = null;
		}
		get nextIdx() {
			return ++this.idx;
		}
		handleWindowResize() {
			// TODO: Make grid resize with props
			// if (this.updateLayout()) {
			// 	this.forceUpdate();
			// }
			// if(this.updateLayoutTimeout){
			// 	clearTimeout(this.updateLayoutTimeout);
			// } 
			this.grid.updateLayout();
		}
		handleObserveResize(e) {
			console.warn("Grid resize event should be throttled.");
			// TODO: Make grid resize with props
			// if (this.updateLayout()) {
			// 	this.forceUpdate();
			// }
			this.grid.updateLayout();
		}
		isHiddenColumnPage(column, page) {
			return (this.hiddenColumnPages[column] && this.hiddenColumnPages[column][page]) ? true : false;
		}
		handlePageIntersection(page, column, entry) {
			throw ("SLDKJFLKSDJFLKSJDLFKJSDFh");
			console.log("page handlePagint", page);

			// let doForceRender = false;
			// if (!entry.isIntersecting) {
			// 	if (this.isHiddenColumnPage(column, page)) return;
			// 	if (!this.hiddenColumnPages[column]) this.hiddenColumnPages[column] = {};
			// 	this.hiddenColumnPages[column][page] = true;
			// 	doForceRender = true;
			// }
			// else {
			// 	if (this.isHiddenColumnPage(column, page)) {
			// 		delete this.hiddenColumnPages[column][page];
			// 		doForceRender = true;
			// 	}
			// 	if (this.hiddenColumnPages[column] && !Object.keys(this.hiddenColumnPages[column]).length) delete this.hiddenColumnPages[column];
			// }

			// if (doForceRender) this.forceUpdate();
		}
		handleLoadNext(entry) {

			if (this.grid.isInitialized && entry.isIntersecting) {
				this.grid.loadNextPage();
			}
		}
		handleLoadNextClick(entry) {
			this.grid.loadNextPage();
		}
		update() {
			//this.grid.load();
			//this.updateLayout();
			// console.log("GRID LOADED PAGE ",this.page, this.name);
		}
		layoutUpdater() {
			if(! this.ref.cntr.current) return false;

			// Update the number of items
			let nTotalItems = 0;
			for (let p in this.grid.pages) {
				nTotalItems += this.grid.pages[p].length;
			}
			// Calculate the columns based on width of container and item min width
			let nNumCols = Math.floor(this.ref.cntr.current.offsetWidth / this.minItemWidth) || 1;
			// If the resize changes doesn't change the col count, nothing changes
			// See if anything needs to be updates, if not, return
			//if (nTotalItems === this.totalItems && nNumCols === this.numCols) return false;

			//this.totalItems = nTotalItems;
			this.numCols = nNumCols
			//this.numRows = Math.ceil(this.totalItems / this.numCols);

			console.log(this.numCols);

			// this.grid.updateLayout();

			return true;
		}
		componentWillReact() {
			// console.log("search test grid will react");
			//this.updateLayout();
			// console.log("grid test componentWillReact");
			// console.log("FEED GRID WILL REACT", this.props);
			// if (this.props.name !== this.grid.name) {
			// 	console.log("grid reaction", this.props.name, this.grid.name);
			// 	this.reset();
			// }
			// if (this.grid.isInitialized) this.updateLayout();
			//if(this.grid.isInitialized && this.hasRendered) this.updateLayout();

			if(this.props.grid && this.props.grid.idx !== this.grid.idx){
				this.grid.delete();
				this.grid = this.props.grid;
				this.initialize();
			}
			else if (this.props.name !== this.grid.name) {
				this.initialize();
			}

			//this.grid.updateLayout();
		}
		componentDidUpdate(prevProps) {
			// if (this.props.name !== this.grid.name) {
			// 	this.reset();
			// }
			// this.grid.updateLayout();
			// console.log("GRID DID UPDATE",prevProps,this.props);
			// this.updateLayout();
		}
		componentDidMount() {
			this.update();
		}
		componentWillUnmount() {
			this.grid.delete();
		}
		cellSpacerRenderer() {
			return (this.props.cellSpacerRenderer) ? this.props.cellSpacerRenderer : <Container class="cell-spacer">&nbsp;</Container>;
		}
		calculateNumRows(totalItems) {
			if (!totalItems || !this.numCols) return 0;
			// console.log("grid calculage num ros",totalItems, this.numCols, this.totalItems);
			// totalItems = totalItems || this.totalItems;
			return Math.ceil(totalItems / this.numCols);
		}
		sectionRenderer(section) {
			let secPages = this.grid.getPagesBySection(section);
			let hasSectionSpacers = false;
			let secItems = [];
			let items = [];
			let numCols = this.numCols || 1;

			let isSectionLoaded = true;
			for (let page of secPages) {
				if (!this.grid.pages[page]) {
					isSectionLoaded = false;
					continue;
				}
				// Flatten the results

				// for (let page in this.grid.pages) {
				for (let item of this.grid.pages[page]) {
					items.push({
						page: parseInt(page),
						item: item
					});
				}
				
				if (this.grid.pagesPerSection && (page % this.grid.pagesPerSection === 0)) {
					hasSectionSpacers = true;
					secItems.push(items);
					items = [];
				}
			}
			
			if (items.length) {
				secItems.push(items);
			}
			let sections = [];
			for (let secIdx in secItems) {
				let secNum = parseInt(secIdx) + 1;
				let items = secItems[secIdx];
				let itemIdx = 0;
				let columns = [];
				let colPageItems = [];
				let numRows = this.calculateNumRows(items.length);

				for (let row = 1; row <= numRows; row++) {
					for (let col = 1; col <= this.numCols; col++) {
						if (items[itemIdx]) {
							let item = items[itemIdx];
							if (!colPageItems[col - 1]) colPageItems[col - 1] = [];
							if (!colPageItems[col - 1][item.page - 1]) colPageItems[col - 1][item.page - 1] = [];
							colPageItems[col - 1][item.page - 1].push(this.itemRenderer(item.item, this.nextIdx));

						}
						else if (row === 1) {
							colPageItems[col - 1] = this.cellSpacerRenderer(itemIdx);
						}
						itemIdx++;
					}
				}

				for (let colIdx in colPageItems) {
					let colKey = parseInt(colIdx) + 1;
					let colItems = [];
					let totalColPageItems = Object.keys(colPageItems).length;
					let i = 1;
					for (let page in colPageItems[colIdx]) {

						if (!colPageItems[colIdx][page]) continue;

						let pageNum = parseInt(page) + 1;

						colItems.push(
							<_GridPage
								grid={this.grid}
								page={pageNum}
								pageKey={`col${parseInt(colIdx) + 1}_page${parseInt(page) + 1}`}
								section={section}
								key={`col${parseInt(colIdx) + 1}_page${parseInt(page) + 1}`}
							>
								{colPageItems[colIdx][page]}
							</_GridPage>
						);
						i++;
					}
					columns.push(
						<Container
							className="masonary-grid-col"
							key={`col${colKey}`}>
							{colItems}
							{(!isSectionLoaded) &&
								<Container
									className="masonary-grid-col-load"
									onObserveIntersection={this.handleLoadNext}
								>
									&nbsp;
								</Container>
							}
						</Container>
					);
				}
				return (
					<Container
						className="masonary-grid-section"
					>
						{columns}
					</Container>
				);
				return columns;
			}
		}


		render() {
			// this.hasRendered = true;
			// console.log(this.props);
			trace(true);
			return (
				<Container
					//onWindowResize={this.handleWindowResize}
					onObserveResize={this.handleObserveResize}
					className="masonary-grid-cntr"
					ref={this.ref.cntr}
					style={{
						width: "100%"
					}}
				>
					<Container
						{...this.props}
						ref={this.ref.grid}
						className={this.props.className || "masonary-grid"}
					>
						<_GridLoader
							{...this.props}
							grid={this.grid}
							// name={this.grid.name}
							sectionRenderer={this.sectionRenderer}
							sectionSpacerRenderer={this.sectionSpacerRenderer}
							loadingIndicator={this.loadingIndicator}
						/>
						{/* <_GridSectionLoader
							grid={this.grid}
							section={this.grid.getSectionByPage(this.grid.initialPage)}
							loader={this.props.loader}
							sectionRenderer={this.sectionRenderer}
							sectionSpacerRenderer={this.sectionSpacerRenderer}
						/> */}

					</Container>
					{/* {!this.grid.isLoaded &&

						<ContainernNumCols
							className="masonary-grid-next-loader"
							onObserveIntersection={this.handleLoadNext}
						>

							{loadingNextControl}

						</Container>

					} */}
				</Container>
			);
		}
	}
));
