import React from "react";
import GlobalEvtEmitter from "../../../../lib/utils/GlobalEvtEmitter";
import RobotProxy from "../../../../model/proxy/RobotProxy";
import Trigger from 'rc-trigger';
import Model from "../../../../utils/Model";
import { List } from 'antd';
import { SENDMESSAGE } from "../../../../model/vo/actionTypes";

class TextMessage extends React.Component {

	constructor(props)
	{
		super(props);

		this.onRobot = this.onRobot.bind(this);

		this.state = {list: [], popupvisible: true};
	}

	onRobot(list)
	{
		this.setState({list});
	}

	onMouseUp(e)
	{
		let question = "";

		if(window.getSelection)
		{
			let userSelection = window.getSelection();

			if(userSelection.isCollapsed)
				return;

			question = " " + userSelection.toString();

			if(!question)
				return;

			if(!this.robot)
			{
				this.robot = new RobotProxy();
				this.robot.on(RobotProxy.FK_TYPE, this.onRobot);
			}

			let sentence = this.props.sentence;

			this.robot.loadData({question, sessionId: sentence.sessionID}, RobotProxy.FK_TYPE);

			this.state.pos = {x: e.screenX, y: e.screenY};
		}
	}

	onShowImg(e)
	{
		let {sentence} = this.props;

		if(sentence.includeImg)
		{
			let {currentSrc} = e.target;
			currentSrc && GlobalEvtEmitter.emit("show_all_img", currentSrc);
			return;
		}
	}

	componentWillUnmount()
	{
		if(this.robot)
		{
			this.robot.removeAllListeners();
			this.robot.clear();
			this.robot = null;
		}

		this.onRobot = null;
	}

	onPopupVisibleChange()
	{
		this.setState({list: []});
	}

	onSendMessage(msg)
	{
		this.setState({list: []});

		GlobalEvtEmitter.emit(SENDMESSAGE, {msg});

		let robot = Model.retrieveProxy(RobotProxy.NAME);
		robot.clear();
	}

	getTextComp(style, htmlMessage, sentence)
	{
		let html = htmlMessage, translate = sentence.transfer || sentence.translate;
		
		if(translate)
			html = htmlMessage + "<div class='transferComp'>" + translate + "</div>";

		return (
			<div className="comment_bubble maxImg" style={style} onClick={this.onShowImg.bind(this)}
			     onMouseUp={this.onMouseUp.bind(this)}
			     dangerouslySetInnerHTML={{__html: html}}/>
		);
	}

	render()
	{
		let {sentence, style} = this.props,
			htmlMessage = sentence.htmlMessage,
			{list} = this.state,
			textComp = this.getTextComp(style, htmlMessage, sentence);

		if(list.length)
		{
			return (
				<Trigger popupPlacement="top" popupVisible builtinPlacements={{top: {points: ['bc', 'tc'],}}}
				         onPopupVisibleChange={this.onPopupVisibleChange.bind(this)} hideAction={["click"]}
				         popup={<div className="messageTrigger">
					         {
						         list.map(item => <div className="itemLi"
						                               onClick={this.onSendMessage.bind(this, item.response)}>
							         <span className="circle"></span>
							         {item.response}
						         </div>)
					         }
				         </div>}>
					{
						textComp
					}
				</Trigger>
			);
		}

		return textComp;
	}
}

export default TextMessage;
