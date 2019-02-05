import React from 'react';
import ReactDOM from 'react-dom';
import { observer, inject } from 'mobx-react';

export const HeadTags = inject("slashr")(observer(
	class HeadTags extends React.Component {
		constructor(props) {
			super(props);
		}
		renderTags() {
			let headTags = this.props.slashr.router.headTags;
			
			if (!headTags) return null;
			
			let tags = [];
			if (headTags.title) tags.push(<title key="title">{headTags.title}</title>);
			if (headTags.meta) {
				if (headTags.meta.title){
					tags.push(<meta key="og:title" property="og:title" content={headTags.meta.title} />);
				}
				if (headTags.meta.description){
					tags.push(<meta key="description" name="description" content={headTags.meta.description} />);
					tags.push(<meta key="og:description" property="og:description" content={headTags.meta.description} />);
				}
				if (headTags.meta.type) tags.push(<meta key="og:type" property="og:type" content={headTags.meta.type} />);
				if (headTags.meta.url) tags.push(<meta key="og:url" property="og:url" content={headTags.meta.url} />);
				if (headTags.meta.siteName) tags.push(<meta key="og:site_name" property="og:site_name" content={headTags.meta.siteName} />);
				if (headTags.meta.image) tags.push(<meta key="og:image" property="og:image" content={headTags.meta.image} />);
				if (headTags.meta.facebookAppId) tags.push(<meta key="fb:app_id" property="fb:app_id" content={headTags.meta.facebookAppId} />);
				if (headTags.meta.twitterCard) tags.push(<meta key="twitter:card" property="twitter:card" content={headTags.meta.twitterCard} />);

			}
			return tags;
		}
		render() {
			let tags = this.renderTags();
			if(! tags) return null;
			return ReactDOM.createPortal(
				tags,
				document.head
			);
		}
	}
));