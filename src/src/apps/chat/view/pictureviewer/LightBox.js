import React from "react";
import Keyboard from "../../../../utils/Keyboard";
import { getMatrix } from "../../../../utils/MyUtil";
import { Spin } from 'antd';

class LightBox extends React.PureComponent {
	
	constructor(props)
	{
		super(props);

		//this._preLoadPath = require("../../../../public/images/loading.gif");
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(nextProps.preloadNextImage)
		{
			const currentIndex = this.props.currentImage;
			const nextIndex = nextProps.currentImage + 1;
			const prevIndex = nextProps.currentImage - 1;
			let preloadIndex;
			
			if(currentIndex && nextProps.currentImage > currentIndex)
			{
				preloadIndex = nextIndex;
			}
			else if(currentIndex && nextProps.currentImage < currentIndex)
			{
				preloadIndex = prevIndex;
			}
			
			if(preloadIndex)
			{
				this._preloadImage(preloadIndex);
			}
			else
			{
				this._preloadImage(prevIndex);
				this._preloadImage(nextIndex);
			}
		}
		
		if(!this.props.isOpen && nextProps.isOpen)
		{
			window.addEventListener("keydown", this._handleKeyboardInput);
		}
		
		if(!nextProps.isOpen)
		{
			window.removeEventListener("keydown", this._handleKeyboardInput);
		}
	}
	
	componentWillUnmount()
	{
		window.removeEventListener("keydown", this._handleKeyboardInput);
	}
	
	_preloadImage(index)
	{
		const images = this.props.images;
		
		if(Array.isArray(images) && images.length > 0)
		{
			const image = images[index];
			
			if(!image) return;
			
			const img = new Image();
			
			img.src = image;
		}
	}
	
	_handleKeyboardInput(event)
	{
		switch(event.keyCode)
		{
			case Keyboard.LEFT:
				this.props.onGotoPrev(event);
				break;
			
			case Keyboard.RIGHT:
				this.props.onGotoNext(event);
				break;
			
			case Keyboard.ESC:
				this.props.onClose();
				break;
		}
	}
	
	_onLoad(e)
	{
		let target = e.target;
		
		if(target)
		{
			this.props.onReload(target.width, target.height);
			target.onLoad = null;
		}
	}
	
	_getUI(style, image)
	{
		console.log(this.props.show);
		if(this.props.show)
		{
			return <img ref="img" style={style} alt={image.fileName} src={image} onMouseDown={this.props.onMouseDown}/>;
		}
		else
		{
			let img = new Image();
			img.onload = this._onLoad.bind(this);
			img.src = image;
			
			//return <img src={this._preLoadPath} />;
			return <Spin />
		}
	}
	
	render()
	{
		const {currentImage, zoom, rotate, images} = this.props;
		
		if(!Array.isArray(images) || images.length <= 0)
			return null;
		
		let image = images[currentImage];
		
		if(!image)
			return null;
		
		let style = {
			transform: getMatrix(rotate, zoom),
			position: "relative",
			cursor:"pointer"
		};
		
		return this._getUI(style, image);
	}
}

export default LightBox;
