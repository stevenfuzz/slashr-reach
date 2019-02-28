import React from 'react';
import {Container} from './Element';
import {Slashr} from './Slashr';
import {BodyPortal} from './BodyPortal';

export const ProgressIndicator = Slashr.connect(
	class ProgressIndicator extends React.Component {
		// constructor(props){
		// 	super.props
		// }
		render() {
			return (
				<BodyPortal>
					<Container
						hide
						unmountOnHide
						// fadeToggle={this.props.app.mdl.ui.progressIndicator.doShow(this.props.name || "default")}
						transitionToggle={this.props.app.mdl.ui.progressIndicator.doShow(this.props.name || "default")}
						transition={{
								duration: 250,
								easing: "easeInQuad",
								enter: {
									display:"block",
									opacity:1,
								},
								entering: {
									opacity:1,
								},
								entered: {},
								exit: {
									opacity:1,
								},
								exiting: {
									opacity:0,
								},
								exited: {
									display:"none"
								}
							}}
						className='progress-indicator'
						unmountOnExit
					>
						<div className='progress-indicator-backdrop'></div>
						<div className='progress-indicator-title'></div><div className='progress-indicator-throbber'></div>
					</Container>
				</BodyPortal>
			);
		}
	}
);
// export default ProgressIndicator;