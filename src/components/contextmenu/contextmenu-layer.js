import React from "react";
import invariant from "invariant";
import _isObject from "lodash.isobject";
import store from "./redux/store";

export default function(identifier, configure) {
	return function(Component) {
		const displayName = Component.displayName
			|| Component.name
			|| "Component";
		
		invariant(
			identifier && (typeof identifier === "string"
			|| typeof identifier === "symbol"
			|| typeof identifier === "function"),
			"Expected identifier to be string, symbol or function. See %s",
			displayName
		);
		
		if(configure)
		{
			invariant(
				typeof configure === "function",
				"Expected configure to be a function. See %s",
				displayName
			);
		}
		
		return class ContextMenuLayer extends React.PureComponent {
			
			constructor(props)
			{
				super(props);
				
				this.handleContextClick = this.handleContextClick.bind(this);
				this.handleMouseDown = this.handleMouseDown.bind(this);
				this.handleMouseUp = this.handleMouseUp.bind(this);
				this.handleTouchstart = this.handleTouchstart.bind(this);
				this.handleTouchEnd = this.handleTouchEnd.bind(this);
				this.handleMouseUp = this.handleMouseUp.bind(this);
			}
			
			static displayName = `${displayName}ContextMenuLayer`;
			
			static defaultProps =  {
				renderTag: "div",
				attributes: {}
			};
			//static getDefaultProps()
			//{
			//	return {
			//		renderTag: "div",
			//		attributes: {}
			//	};
			//}
			
			mouseDown = false;
			
			handleMouseDown(event)
			{
				if(this.props.holdToDisplay >= 0 && event.button === 0)
				{
					event.persist();
					
					this.mouseDown = true;
					setTimeout(() => {
						console.log("handleContextClick event = " + event);
						
						if(this.mouseDown) this.handleContextClick(event);
					}, this.props.holdToDisplay);
				}
			}
			
			handleTouchstart(event)
			{
				if(this.props.holdToDisplay >= 0)
				{
					event.persist();
					
					this.mouseDown = true;
					setTimeout(() => {
						if(this.mouseDown) this.handleContextClick(event);
					}, this.props.holdToDisplay);
				}
			}
			
			handleTouchEnd(event)
			{
				event.preventDefault();
				this.mouseDown = false;
			}
			
			handleMouseUp(event)
			{
				if(event.button === 0)
				{
					this.mouseDown = false;
				}
			}
			
			handleContextClick(event)
			{
				let currentItem = typeof configure === "function"
					? configure(this.props)
					: {};
				
				invariant(
					_isObject(currentItem),
					"Expected configure to return an object. See %s",
					displayName
				);
				
				event.preventDefault();
				
				if(this.props.stopPropagation)
				{
					event.stopPropagation();
				}
				
				const xPos = event.clientX || (event.touches && event.touches[0].pageX),
					yPos = event.clientY || (event.touches && event.touches[0].pageY);
				
				store.dispatch({
					type: "SET_PARAMS",
					data: {
						x: xPos,
						y: yPos,
						currentItem,
						isVisible: typeof identifier === "function" ? identifier(this.props) : identifier
					}
				});
				
				if(typeof this.onContextMenu === "function")
				{
					this.onContextMenu(event);
				}
			}
			
			render()
			{
				let {attributes: {className = "", ...attributes}, renderTag, ...props} = this.props;
				attributes.className = `react-context-menu-wrapper ${className}`;
				attributes.onContextMenu = this.handleContextClick;
				attributes.onMouseDown = this.handleMouseDown;
				attributes.onMouseUp = this.handleMouseUp;
				attributes.onTouchStart = this.handleTouchstart;
				attributes.onTouchEnd = this.handleTouchEnd;
				attributes.onMouseOut = this.handleMouseUp;
				attributes.ref = (c) => (this.target = c);
				
				if(typeof this.props.onContextMenu === "function")
				{
					this.onContextMenu = this.props.onContextMenu || this.onContextMenu;
				}
				
				return React.createElement(
					renderTag,
					attributes,
					React.createElement(Component, props)
				);
			}
		};
	};
}


