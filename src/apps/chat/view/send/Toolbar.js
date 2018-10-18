import React from "react";
import { Tooltip, Checkbox } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import "../../../../public/styles/chatpage/send/toolbar.scss";
import { getToolFuncsDataComplete } from "../../../../reducers/startUpLoadReduce";
import ToolUpload from "./ToolUpload";
import Conclusion from "./Conclusion";
import Cooperate from "./Cooperate";
import SmileyView from "./SmileyView";
import { List, is, Map } from "immutable";
import { chatIsOffline } from "../../../../utils/ConverUtils";
import { submitSummary, requestEvaluate } from "../../redux/reducers/eventsReducer";
import ChatStatus from "../../../../model/vo/ChatStatus";
import { chatDataChanged } from "../../redux/reducers/chatPageReducer";
import ShortCutView from "./ShortCutView";
import Blacklist from "./toolbar/Blacklist";
import ActionTool from "./toolbar/ActionTool";
import OpenConverType from "../../../../model/vo/OpenConverType";
import LangList from "./LangList";
import TranslateProxy from "../../../../model/chat/TranslateProxy";

class Toolbar extends React.Component {

	constructor(props)
	{
		super(props);

		this._shieldedFunction = Map();

		this._shieldedFunction = this._refreshShieldFn(props.chatDataVo);

		this.destLanguageEnabled = parseInt(localStorage.getItem("destLanguageEnabled")) || false;

		this.state = {disabled: !this.destLanguageEnabled};
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		let result = !is(this._shieldedFunction, this._shieldedFunction = this._refreshShieldFn(nextProps.chatDataVo, nextProps.openType))
			|| !is(nextProps.toolFuncsData, this.props.toolFuncsData)
			|| Boolean(nextProps.chatDataVo.sessionId && this.props.chatDataVo.sessionId &&
				(nextProps.chatDataVo.sessionId !== this.props.chatDataVo.sessionId));

		if(nextState.disabled !== this.state.disabled)
			return true;

		return result;
	}

	_refreshShieldFn(chatDataVo, openType)
	{

		if(!chatDataVo || !chatDataVo.rosterUser)
			return this._shieldedFunction.clear();

		let {rosterUser, cooperateData} = chatDataVo;

		if(cooperateData && !cooperateData.isSponsor)
			return this._shieldedFunction.clear();

		let status = rosterUser.chatStatus,
			passive = openType === OpenConverType.VISITOR_PASSIVE_REQUEST, //会话是否相对访客被动打开
			noMonitor = !chatDataVo.isMonitor,
			forbiddend = chatDataVo.forbiddend == 0,
			isOnLine = status !== ChatStatus.OFFLINE,
			coopEnable = isOnLine && noMonitor && !cooperateData && !passive,
			evaluateEnable = isOnLine && noMonitor,
			summaryEnable = noMonitor && !passive;

		if(this._shieldedFunction.size <= 0)
		{
			let toolFuncsData = this.props.toolFuncsData || [];
			toolFuncsData.forEach(funcItem =>
				this._shieldedFunction = this._shieldedFunction.setIn([funcItem.get("name"), "enable"], funcItem.get("enable")))
		}

		return this._shieldedFunction.setIn(["transfer", "enable"], coopEnable)
		.setIn(["invite", "enable"], coopEnable)
		.setIn(["setfont", "enable"], true)
		.setIn(["summary", "enable"], summaryEnable)
		.setIn(["blacklist", "enable"], forbiddend)
		.setIn(["evaluate", "enable"], evaluateEnable);
	}

	onChange(e)
	{
		this.setState({disabled: !e.target.checked});

		localStorage.setItem("destLanguageEnabled", e.target.checked ? "1" : "0");
	}

	render()
	{
		let toolFuncsData = this.props.toolFuncsData,
			container = () => document.getElementById("body");

		if(!List.isList(toolFuncsData) || toolFuncsData.size <= 0)
			return <div className="side-toolbar">
				<div className="iconToolbar"/>
			</div>;

		toolFuncsData = toolFuncsData.filter(func => {
			let name = func.get("name"),
				visible = this._shieldedFunction.getIn([name, "visible"]) === false;

			return !visible;
		})  //功能被隐藏，会被过滤，不显示
		.sort(compareFunction);  //排序

		return <div className="side-toolbar user-select-disable">
                    <div className="iconToolbar">
                        <div className="langChangeSelect">
                            {
                                toolFuncsData.map(item => this._createFuncButton(item, container))
                            }
                        </div>
                        {
                            TranslateProxy.Enabled ?
                                <div className="langChangeSelect">
                                    <Checkbox defaultChecked={!this.state.disabled} onChange={this.onChange.bind(this)}/>
                                    <LangList disabled={this.state.disabled}/>
                                </div> : null
                        }

                    </div>
                </div>;
	}

	_onRequestEvaluate()
	{
		this.props.requestEvaluate();
	}

	_createFuncButton(funcItem)
	{
		let name = funcItem.get("name"),
			enabled = this._shieldedFunction.getIn([name, "enable"]),
			index = funcItem.get("indexs"),
			icon = getIconClassName(funcItem.get("icon")),
			className = "toolbar-item",
			props = {className, key: index}, ui = null;

		if(name === screenShot && Type !== 1)
			return null;

		if(!enabled)
		{
			props.className = className + " " + icon + " " + "enabled";
		}
		else
		{
			ui = this._getFucComponent(name, icon, funcItem);

			if(ui && ui.type === "i")
			{
				ui = <Tooltip placement="bottom" title={funcItem.get("title")}
				              arrowPointAtCenter overlayStyle={{lineHeight: '0.16rem'}}>
					{
						ui
					}
				</Tooltip>
			}
		}

		return <i {...props}> {ui} </i>;
	}

	/**
	 * 生成功能组件
	 * @param {String} name 组件名称
	 * @param {String} className 组件样式名称（icon）
	 * @param {immutable.Map} funcItem 组件内容
	 * @return
	 * */
	_getFucComponent(name, className, funcItem)
	{
		let {chatDataVo = {}} = this.props;

		switch(name)
		{
			case setfont:
				return <i className={className} onClick={this.props.click}/>;

			case smiley:
				return <SmileyView propsClassName={className} toolTip={funcItem.get("title")}
				                   getChooseEmiji={this.props.getChooseEmiji}/>;

			case sendimg:
			case sendfile:
				return <ToolUpload item={funcItem} propsClassName={className}/>;

			case screenShot:
				return <ShortCutView propsClassName={className}/>;

			case transfer:
			case invite:
				return <Cooperate item={funcItem} propsClassName={className}/>;

			case summary:
				return <Conclusion item={funcItem} propsClassName={className}
				                   submitSummary={this.props.submitSummary} converId={chatDataVo.sessionId}/>;

			case evaluate:
				return <i className={className} onClick={this._onRequestEvaluate.bind(this)}/>;

			case blacklist:
				return <Blacklist className={className} item={funcItem} chatDataVo={chatDataVo}/>;

			default:
				return <ActionTool item={funcItem} className={className} chatDataVo={chatDataVo}/>;
		}

		return null;
	}

}

function getIconClassName(value)
{
	if(!value)
		return "";

	return value.indexOf("||") <= -1 ? "iconfont " + value : value.replace("||", "");
}

const setfont = "setfont",  //字体设置
	smiley = "smiley",  //表情
	sendimg = "sendimg",  //发送图片
	screenShot = "screenShot",  //截图
	sendfile = "sendfile",  //发送文件
	transfer = "transfer",  //转接
	invite = "invite",  //邀请
	summary = "summary",  //总结
	evaluate = "evaluate",  //邀请评价
	blacklist = "blacklist",  //黑名单
	aidmode = "aidmode",  //辅助模式
	sessiontakeover = "sessiontakeover",  //接管
	sessionhelp = "sessionhelp",  //协助
	ticket = "ticket";  //工单

//"blacklist_check", "blacklist_add", "blacklist_relieve"

function compareFunction(item1, item2)
{
	if(item1.get("indexs") <= item2.get("indexs"))
	{
		return -1;
	}

	return 1;
}

function mapStateToProps(state)
{
	let {startUpData} = state,
		toolFuncsData = startUpData.get("toolFuncsData");

	return {
		toolFuncsData
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getToolFuncsDataComplete, submitSummary, requestEvaluate, chatDataChanged}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
