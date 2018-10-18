import LogUtil from '../../../lib/utils/LogUtil';
import { createSentence, loginUser } from '../../../utils/MyUtil';
import UserInfo from '../../../model/vo/UserInfo';
import CooperateData from "../../../model/vo/CooperateData";
import SystemSentence from "../../../model/vo/sentence/SystemSentence";
import { createMessageId } from "../../../lib/utils/Utils";
import MessageType from "../../../im/message/MessageType";
import ChatStatus from "../../../model/vo/ChatStatus";
import RobotProxy from "../../../model/proxy/RobotProxy";
import { closeSystemPrompt, sendSystemPrompt } from "../../../core/ipcRenderer";
import Lang from "../../../im/i18n/Lang";

class IChatState {
	
	constructor(chatData)
	{
		this._chatData = chatData;
		this._chatDataVo = null;
		this._chatStateType = null;
		this.onRobot = this.onRobot.bind(this);
		
		window.chatState = this;
	}
	
	get chatStateType()
	{
		return this._chatStateType;
	}
	
	set chatStateType(value)
	{
		this._chatStateType = value;
	}
	
	handleChatDataStateIn()
	{
	}
	
	handleChatDataStateOut()
	{
	}
	
	handleHistoryChatMessage(msgArray)
	{
		try
		{
			log(['handleHistoryChatMessage msgArray.length = ', msgArray.length]);
			
			if(!msgArray || msgArray.length <= 0)
				return;
			
			msgArray.forEach(message => {
				if(message && message.hasOwnProperty("msgtype"))
				{
					addOutMessage.call(this, createSentence(message, message.msgtype));
				}
			})
		}
		catch(e)
		{
			log("handleHistoryChatMessage exception: " + e.stack);
		}
	}
	
	handleNotifyReceiveMessage(content)
	{
		if(!this.chatDataVo)
			return;
		
		let sentence = createSentence(content, content.msgtype);
		
		if(sentence)
		{
			
			addOutMessage.call(this, sentence, true);
			
			if(sentence.bsystem)
			{
				if(sentence.systemType === SystemSentence.EVALUATION_TYPE)
				{
					this.chatDataVo.evalutionResult = sentence.message;
				}
			}
			else
			{
				if(sentence.bhistory && !sentence.bsystem)
				{
					this.chatDataVo.predictMessage = null;
				}
				
				if(sentence.isFK && sentence.messageType === MessageType.MESSAGE_DOCUMENT_TXT)
				{
					if(!this.robot)
					{
						this.robot = new RobotProxy();
						this.robot.on(RobotProxy.FK_TYPE, this.onRobot);
					}
					
					this.robot.loadData({
						question: sentence.messageBody, robotId: this.chatDataVo.robotId,
						sessionId: this.chatDataVo.sessionId
					}, RobotProxy.FK_TYPE);
				}
			}
		}
		
		return sentence;
	}
	
	onRobot()
	{
		this.chatData.delayToChange();
	}
	
	handleUserEnter(userId, userInfo)
	{
		try
		{
			
			if(userId === loginUser().userId)
				return;
			
			let tempUserInfo = new UserInfo(userInfo);
			if(!tempUserInfo.userId)
				return;
			
			if(this.chatDataVo)
			{
				this.chatDataVo.member = tempUserInfo;
			}
		}
		catch(e)
		{
			log('handleUserEnter stack: ' + e.stack);
		}
	}
	
	handleUserLeave(userId)
	{
		try
		{
			if(this.chatDataVo)
			{
				this.chatDataVo.removeMember(userId);
			}
		}
		catch(e)
		{
			log('handleUserLeave stack: ' + e.stack);
		}
	}
	
	handlerUserExit(userId)
	{
		try
		{
			if(this.chatDataVo)
			{
				this.chatDataVo.removeMember(userId);
			}
		}
		catch(e)
		{
			log('handlerUserExit stack: ' + e.stack);
		}
	}
	
	handlePredictMessage(message)
	{
		try
		{
			if(!this.chatDataVo)
				return;
			
			if(message && this.chatDataVo.rosterUser)
			{
				if(this.chatDataVo.rosterUser.chatStatus == ChatStatus.OFFLINE)
				{
					message = null;
				}
			}
			
			this.chatDataVo.predictMessage = message;
		}
		catch(e)
		{
			log('handlePredictMessage stack: ' + e.stack);
		}
	}
	
	handleCooperate(coopType, source, vistorname, taskid, description)
	{
		let coopData = new CooperateData();
		coopData.coopType = coopType;
		coopData.source = source;
		coopData.vistorname = vistorname;
		coopData.description = description;
		coopData.taskId = taskid;
		this.chatDataVo.cooperateData = coopData;
		
		let message = {};
		message.content = coopData.getCoopMessage();
		message.duration = coopData.getDuration();
		message.action = this.getActionForCoopration(coopData);
		
		sendSystemPrompt(message, 2, this.chatData.name);
	}
	
	getActionForCoopration(coopData)
	{
		if(coopData.isSponsor)
		{
			return [{
				label: Lang.getLangTxt("cancel"),
				actionId: CooperateData.CANCEL
			}];
		}
		
		return [
			{
				label: Lang.getLangTxt("accept"),
				actionId: CooperateData.ACCEPT
			},
			{
				label: Lang.getLangTxt("refuse"),
				actionId: CooperateData.REFUSE
			}
		];
	}
	
	handleCooperateAction(coopType, operation, targets, description)
	{
		try
		{
			if(!this.chatDataVo)
				return;
			
			let cooperateData = this.chatDataVo.cooperateData,
				tip = operation === CooperateData.ACCEPT ? SystemSentence.TIP : SystemSentence.WARN,
				message,
				id = createMessageId();
			
			cooperateData.coopType = coopType;
			cooperateData.operation = operation;
			cooperateData.targets = targets;
			cooperateData.description = description;
			
			message = description ? description : cooperateData.getCoopMessage();
			
			this.chatData.sendSystemPromptSentence(message, id, tip);
			
			closeSystemPrompt(this.chatData.name);
			sendSystemPrompt(message, 1, id, tip);
			
			this.chatDataVo.cooperateData = null;
		}
		catch(e)
		{
			log('handlePredictMessage stack: ' + e.stack);
		}
	}
	
	get chatData()
	{
		return this._chatData;
	}
	
	set chatData(value)
	{
		this._chatData = value;
	}
	
	get chatDataVo()
	{
		if(!this._chatDataVo)
		{
			if(this._chatData)
			{
				this._chatDataVo = this._chatData.chatDataVo;
			}
		}
		
		return this._chatDataVo;
	}
	
	getRobotList(clear = true)
	{
		if(this.robot)
		{
			clear && this.robot.clear();
			
			return [this.robot.list, this.robot.question];
		}
		
		return [];
	}
	
	close()
	{
		this._chatData = null;
		this._chatDataVo = null;
		this._chatStateType = null;
		
		if(this.robot)
		{
			this.robot.removeAllListeners();
			this.robot.clear();
			this.robot = null;
		}
	}
}

function addOutMessage(sentence, update = false)
{
	if(!sentence || !this.chatData)
		return;
	
	!sentence.bmine && this.chatData.addTranslate(sentence);
	
	let added = this.chatData.addSentenceToOutput(sentence, update);
	
	if(sentence.status !== MessageType.STATUS_MESSAGE_SEND_READ && !sentence.bmine && false)
	{
		this._chatDataVo && this._chatDataVo.addUnreadMsgId(sentence.sentenceID);
	}
	
	log('addOutMessage added = ' + added + ', sentenceId = ' + sentence.sentenceID + ', bhistory = ' + sentence.bhistory);
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('IChatState', info, log);
}

export default IChatState;