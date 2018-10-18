import React from "react";
import monitor from "../monitor";

import Modal from "react-overlays/lib/Modal";

const modalStyle = {
        width:'100%',
        height:'100%',
        minWidth: '1024px',
        minHeight: '637px',
		position: "absolute",
		zIndex: 100,
		top: 0,
		left: 0
	},
	backdropStyle = {
		...modalStyle,
		zIndex: "auto",
		backgroundColor: "transparent"
	},
	menuStyles = {
		position: "fixed",
		zIndex: "auto"
	};

class ContextMenuWrapper extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = {
			left: 0,
			top: 0
		};
	}

	componentWillReceiveProps(nextProps)
	{
		if(nextProps.isVisible === nextProps.identifier)
		{
			const wrapper = window.requestAnimationFrame || setTimeout;

			wrapper(() =>
			{
				this.setState(this.getMenuPosition(nextProps.x, nextProps.y));
				this.menu.parentNode.addEventListener("contextmenu", this.hideMenu);
			});
		}
	}

	shouldComponentUpdate(nextProps)
	{
		return this.props.isVisible !== nextProps.visible;
	}

	hideMenu(e)
	{
		e.preventDefault();

		if(this.menu && this.menu.parentNode)
		{
			this.menu.parentNode.removeEventListener("contextmenu", this.hideMenu);
		}

		monitor.hideMenu();
	}

	getMenuPosition(x, y)
	{
		let scrollX = document.documentElement.scrollTop,
			scrollY = document.documentElement.scrollLeft,
			{innerWidth, innerHeight} = window,
			rect = this.menu.getBoundingClientRect(),
			menuStyles = {
				top: y + scrollY,
				left: x + scrollX
			};

		if(y + rect.height > innerHeight)
		{
			menuStyles.top -= rect.height;
		}

		if(x + rect.width > innerWidth)
		{
			menuStyles.left -= rect.width;
		}

		if(menuStyles.top < 0)
		{
			menuStyles.top = (rect.height < innerHeight) ? (innerHeight - rect.height) / 2 : 0;
		}

		if(menuStyles.left < 0)
		{
			menuStyles.left = (rect.width < innerWidth) ? (innerWidth - rect.width) / 2 : 0;
		}

		return menuStyles;
	}

	render()
	{
		let {isVisible, identifier, children} = this.props;
		const style = {
			...menuStyles,
			...this.state
		};
		return (
			<Modal style={modalStyle} backdropStyle={backdropStyle}
			       show={isVisible === identifier} onHide={() => monitor.hideMenu()}>
				<nav ref={(c) => (this.menu = c)} style={style}
				     className="react-context-menu">
					{children}
				</nav>
			</Modal>
		);
	}
}
;

export default ContextMenuWrapper;
