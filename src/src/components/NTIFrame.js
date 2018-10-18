/**
 * 网页地址显示为页面
 * */
import React from "react"
import { getWorkUrl, shallowEqual } from "../utils/MyUtil";
import LogUtil from "../lib/utils/LogUtil";
import NTPureComponent from "./NTPureComponent";
import ScrollArea from 'react-scrollbar';
import { Spin } from 'antd'

/*
 * eg:
 *
 * */
class NTIFrame extends NTPureComponent {

	constructor(props)
	{
		super(props);

		this.state = {progress: 0};
		this.iframe_onload = this.iframe_onload.bind(this);
	}

	componentWillReceiveProps(nextProps)
	{
		if(this.props.src !== nextProps.src)
		{
			this.state = {progress: 0};
		}
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		if(this.props.src !== nextProps.src)
		{
			this.state = {progress: 0};

			return true;
		}

		if(nextState.progress !== this.state.progress)
			return true;

		return !shallowEqual(nextProps, this.props);
	}

	getLoadingComp()
	{
		return (
			<div style={{position: 'absolute', width: '100%', height: '100%', top: '0', left: '0'}}>
				<div className="la-square-jelly-background">
                    <Spin style={{
					width: "100%",
					height: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center"
				}}/>
				</div>
			</div>
		);
	}

	render()
	{
		try
		{
			let {style = {}, src, scrolling = "auto"} = this.props,
				url = getWorkUrl(src);

			return (
				<div className="FriendsPageWrapper" style={{...style}}>
					<iframe ref={(node) => this.iframe = node} allow="geolocation *;" style={{border: "none", ...style}}
					        onLoad={this.iframe_onload} src={url} scrolling={scrolling}/>
					{
						this.state.progress === 0 ? this.getLoadingComp() : null
					}
				</div>

			)
		}
		catch(e)
		{
			LogUtil.trace("NTIFrame", LogUtil.ERROR, "render stack = " + e.stack);
			this.state.progress = 1;
		}

		return null;
	}

	iframe_onload(e)
	{
		this.setState({progress: 1});
		this.emit("Complete");

		if(this.props.onComplete)
		{
			this.props.onComplete();
		}

		if(!this.iframe)
			return;

		let frameW, frameH;

		try
		{
			var iframeWin = this.iframe.contentWindow || this.iframe.contentDocument.parentWindow;
			let {container} = this.props,
				app = document.getElementsByClassName(container) && document.getElementsByClassName(container)[0],
				{clientWidth, clientHeight} = app;

			if(iframeWin.document.body)
			{
				frameW = iframeWin.document.documentElement.scrollWidth || iframeWin.document.body.scrollWidth;
				frameH = iframeWin.document.documentElement.scrollHeight || iframeWin.document.body.scrollHeight;

				frameW = frameW < clientWidth ? clientWidth : frameW;
				frameH = frameH < clientHeight ? clientHeight : frameH;
			}
		}
		catch(e)
		{
			let {width, height} = this.props.style;

			if(width === undefined || width == "100%")
			{
				frameW = "100%";
			}
			else
			{
				frameW = Math.floor(width);
			}

			if(height === undefined || height == "100%")
			{
				frameH = "100%";
			}
			else
			{
				frameH = height;
			}
		}

		console.log("NTIFrame frameW = ", frameW, ", frameH = ", frameH);

		this.iframe.width = frameW;
		this.iframe.height = frameH;
	}
}

export default NTIFrame;
