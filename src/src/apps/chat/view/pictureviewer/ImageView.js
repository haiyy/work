import React from 'react';
import LightBox from "./LightBox";
import { downloadByATag } from "../../../../utils/MyUtil";
import * as ReactDOM from "react-dom";

class ImageView extends React.PureComponent{

	_images = [];
	_bgW = 630;
	_bgH = 600;

	constructor(props)
	{
		super(props);

		this.state = {
			isOpen: true,
			currentImage: this.props.currentImage,
			rotate: 0,
			zoom: 1,
			show: false
		};

		this._images = this.props.images || [];
	}

	componentWillReceiveProps(nextProps)
	{
		this._images = nextProps.images;
		this.setState({
			currentImage: nextProps.currentImage
		});
	}

	_gotoNext()
	{
		this.setState({
			currentImage: this.state.currentImage + 1,
			show: false,
			rotate: 0,
			zoom: 1
		});
	}

	_gotoPrev()
	{
		this.setState({
			currentImage: this.state.currentImage - 1,
			show: false,
			rotate: 0,
			zoom: 1
		});
	}

	_gotoImage(index)
	{
		this.setState({
			currentImage: index,
			show: false
		});
	}

	_rotateRight()
	{
		this.setState({
			rotate: this.state.rotate + 90
		});
	}

	_rotateLeft()
	{
		this.setState({
			rotate: this.state.rotate - 90
		});
	}

	_zoomIn()
	{
		this.setState({
			zoom: this.state.zoom * 1.25
		});
	}

	_zoomOut()
	{
		this.setState({
			zoom: this.state.zoom * 0.8
		});
	}

	_loadAll()
	{
		let currentImage = this.state.currentImage,
		image = this._images[currentImage];

		if(image)
		{
			downloadByATag(image);
		}
	}

	close()
	{
	}

	_getPrevComp()
	{
		if(this.state.currentImage <= 0)
			return null;

		this._onResetPos();

		return (
			<span className="prev" onClick={this._gotoPrev.bind(this)}>
				<i className="iconfont icon-xiala1-xiangzuo"/>
			</span>
		);
	}

	_getNextComp()
	{
		if(this.state.currentImage >= this._images.length - 1)
			return null;

		this._onResetPos();

		return (
			<span className="next" onClick={this._gotoNext.bind(this)}>
					<i className="iconfont icon-xiala1-xiangyou"/>
			</span>
		);
	}

	_onBoxMouseDown(event)
	{
		event.preventDefault();
		
		let imageBox = ReactDOM.findDOMNode(this.refs["image-box"]),
			box = this.refs.box,
			domBox = ReactDOM.findDOMNode(box);

		if(imageBox && domBox)
		{
			let zoom = this.state.zoom,
				gapW = (imageBox.offsetWidth - domBox.offsetWidth * zoom) * .5,
				gapH = (imageBox.offsetHeight - domBox.offsetHeight * zoom) * .5,
				disX = event.clientX - domBox.offsetLeft + (imageBox.offsetWidth - domBox.offsetWidth) * .5,
				disY = event.clientY - domBox.offsetTop + (imageBox.offsetHeight - domBox.offsetHeight) * .5,
				rect = {
					left: -gapW,
					right: gapW,
					top: -gapH,
					bottom: gapH
				};

			imageBox.onmousemove = this._onMouseMove.bind(this, domBox, disX, disY, rect);
			imageBox.onmouseup = this._onMouseUp.bind(this, imageBox);
		}
	}

	_onMouseMove(domBox, disX, disY, rect, event)
	{
        event.stopPropagation();
		event.preventDefault();
		
		if(domBox)
		{
			let left = event.clientX - disX,
				top = event.clientY - disY;

			if(rect.right >= 0)
			{
				if(left <= rect.left)
				{
					left = rect.left;
				}
				else
				{
					left = left > rect.right ? rect.right : left;
				}
			}
			else
			{
				if(left <= rect.right)
				{
					left = rect.right;
				}
				else
				{
					left = left > rect.left ? rect.left : left;
				}
			}

			if(rect.bottom >= 0)
			{
				if(top <= rect.top)
				{
					top = rect.top;
				}
				else
				{
					top = top > rect.bottom ? rect.bottom : top;
				}
			}
			else
			{
				if(top >= rect.top)
				{
					top = rect.top;
				}
				else
				{
					top = top < rect.bottom ? rect.bottom : top;
				}
			}

			domBox.style.left = left + "px";
			domBox.style.top = top + "px";
		}
	}

	/**
	 * 重置LightBox位置
	 * */
	_onResetPos()
	{
		let box = this.refs.box,
			domBox = ReactDOM.findDOMNode(box);

		if(domBox)
		{
			domBox.style.left = "";
			domBox.style.top = "";
		}
	}

	_onMouseUp(imageBox, event)
	{
		if(imageBox)
		{
			imageBox.onmouseup = null;
			imageBox.onmousemove = null;
		}
	}

	_onReload(w, h)
	{
		let scaleW = 1, scaleH = 1, zoom = 1;
		if(w > this._bgW)
		{
			scaleW = this._bgW / w;
		}

		if(h > this._bgH)
		{
			scaleH = this._bgH / h;
		}

		zoom = scaleW > scaleH ? scaleH : scaleW;

		this.setState({
			zoom,
			show: true
		});
	}

	onWheel(e)
	{
		let {deltaY = 0} = e;

		if(deltaY > 0)
		{
			this._zoomOut();
		}
		else if(deltaY < 0)
		{
			this._zoomIn();
		}

	}

	render()
	{
        return (
			<div ref="image-box" className="image-box">
                <div className="imageViewMask" style={{background:"rgba(0, 0, 0, 0.8)"}}></div>

				<div className="box">
					<div onMouseDown={this._onBoxMouseDown.bind(this)} onWheel={this.onWheel.bind(this)}>
						<LightBox ref="box" images={this._images} {...this.state}
						          onGotoPrev={this._gotoPrev.bind(this)}
						          onGotoNext={this._gotoNext.bind(this)}
						          onClose={this.close.bind(this)}
						          onMouseDown={this._onBoxMouseDown.bind(this)}
						          onReload={this._onReload.bind(this)}
						/>
					</div>

					<div className="image-toolbar">
						<span onClick={this._zoomIn.bind(this)}><i className="iconfont icon-fangda"/></span>
						<span onClick={this._zoomOut.bind(this)}><i className="iconfont icon-suoxiao"/></span>
						<span onClick={this._loadAll.bind(this)}><i className="iconfont icon-xiangxia"/></span>
						<span onClick={this._rotateLeft.bind(this)}><i className="iconfont icon-zuoxuanzhuan"/></span>
						<span onClick={this._rotateRight.bind(this)}><i className="iconfont icon-youxuanzhuan"/></span>
					</div>
				</div>

				{
					this._getPrevComp()
				}

				{
					this._getNextComp()
				}
			</div>
		);
	}
}

export default ImageView;
