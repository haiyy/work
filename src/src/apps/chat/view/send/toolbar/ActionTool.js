import React from "react";
import NTIFrame from "../../../../../components/NTIFrame";
import { getWorkUrl } from "../../../../../utils/MyUtil";
import { Tooltip } from "antd";
import '../../../../../public/styles/app/app.scss';
import NTDragView from "../../../../../components/NTDragView";
import Portal from "../../../../../components/Portal";
import GlobalEvtEmitter from "../../../../../lib/utils/GlobalEvtEmitter";
import { Redirect } from "react-router-dom";
import LogUtil from "../../../../../lib/utils/LogUtil";

/* *
*  action: noaction modal(弹窗) router(路由) link(打开外部链接)
* */
class ActionTool extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		this.onRemove = this.onRemove.bind(this);
		
		GlobalEvtEmitter.on("TICKET", this.onTicket.bind(this));
		
		this.state = {
			component: null,
			visible: true,
		};
		
		//window.Emit = ()=> GlobalEvtEmitter.emit("TICKET", {data:{method:"toLink",url:"https://wo-std1.ntalker.com",type:1
		//	}, origin: "https://wo-std1.ntalker.com"});
	}
	
	onTicket(event)
	{
		let {data, origin} = event;
		
		this.state.component = null;
		
		this.onRouter(data.url);
	}
	
	onClick()
	{
		try
		{
			const item = this.props.item,
				params = item.get("params") || "",
				action = item.get("action") || "",
				paramsJSON = JSON.parse(params) || {};
			
			if(!paramsJSON.url)
				return;
			
			this.url = paramsJSON.url;
			
			switch(action)
			{
				case "link":
					this.onLink(this.url);
					break;
				
				case "modal":
					this.onModal(this.url);
					break;
				
				case "router":
					this.onRouter(this.url);
					break;
			}
		}
		catch(e)
		{
			log("ActionTool onClick = ", e.stack);
		}
	}
	
	onRemove()
	{
		this.setState({component: null});
	}
	
	onModal(url)
	{
		let {chatDataVo} = this.props;
		
		if(chatDataVo && chatDataVo.rosterUser)
		{
			url = getWorkUrl(url, chatDataVo.rosterUser.userInfo);
		}
		
		let component = (
			<Portal onRemove={this.onRemove.bind(this)}>
				<NTDragView enabledDrag={true} enabledClose={true} _onClose={this.onRemove.bind(this)}
				            wrapperProps={{width: 630, height: 600}}>
					<div className="actionToolModalWrapper">
						<NTIFrame src={url} style={{height: 600}} container="actionToolModalWrapper"/>
					</div>
				</NTDragView>
			</Portal>
		);
		
		this.setState({component});
	}
	
	onLink(url)
	{
		window.open(url, "_blank");
	}
	
	onRouter(url)
	{
		let {chatDataVo} = this.props,
			pr = Type === 1 ? "/:" + new Date().getTime() : "",
			pathname = "/friends" + pr,
			action = "",
			component;
		
		if(chatDataVo && chatDataVo.rosterUser)
		{
			action = getWorkUrl(url, chatDataVo.rosterUser.userInfo);
			component = <Redirect to={{pathname, query: {action}}}/>;
			this.setState({component});
		}
	}
	
	render()
	{
		return (
			<div>
				<Tooltip placement="bottom" title={this.props.item.get("title")}
				         overlayStyle={{lineHeight: '0.16rem'}}
				         arrowPointAtCenter>
					<i {...this.props} onClick={this.onClick.bind(this)}/>
				</Tooltip>
				{
					this.state.component
				}
			</div>
		);
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("ActionTool", info, log);
}

export default ActionTool;


