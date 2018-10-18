import { forceOpenWindow, loginUser, playMsgAudio } from "../../utils/MyUtil";
import UserInfo from "./UserInfo";
import AbstractChatSentence from "./sentence/AbstractChatSentence";
import RosterUser from "./RosterUser";
import LastMsgType from "./LastMsgType";
import LogUtil from "../../lib/utils/LogUtil";
import MessageType from "../../im/message/MessageType";
import ChatStatus from "./ChatStatus";
import VersionControl from "../../utils/VersionControl";
import InputMessage from "./InputMessage";
import UsualTips from "../../apps/chat/view/aside/UsualTips";
import AverageResponseTimeVo from "../chat/AverageResponseTimeVo";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";

class ChatDataVo {

	_isMonitor = false;
	_converType = 0;
	_outputMessages = {};
	_outputMap = new Map();
	_unreadMessageIds = []; //未读消息MessageID集合
	_unreadMsgCount = 0;
	_unreadCountTime = -1;
	_predictMessage = "";
	_members = new Map();
	_rosterUser = null;
	_sessionId = "";
	_lastReceiveMessage;
	_inputMessage = new InputMessage(UsualTips.TEXT_TYPE, ""); //当前输入框内容
	_starttime = -1;
	_name = "";
	_evalresult = "";
	_conclusion = ""; //咨询总结
	_openChatTime = -1;
	_status = -1;
	_cooperateData = null;
	_selected = false;
	_top = false;
	_isColleague = false;
	_summarized = 0;  //当前会话是否已进行过咨询总结，0：未总结，1：已总结
	_evaluated = 0;
	_productInfo = null;
	_newconver = 1;  //是否新会话
	_forbiddend = 0;  //是否被加入黑名单 0=>没有
	_templatename = ""; //用户群名称（咨询入口）

	_systemMessage = null;

	_averageTimeVo = null;

	_robotId = "";

	constructor(args)
	{
		this.openChatTime = new Date()
	}

	get converType()
	{
		return this._converType;
	}

	set converType(value)
	{
		this._converType = value;
	}

	get isColleague()
	{
		return this._isColleague;
	}

	set isColleague(value)
	{
		this._isColleague = value;
	}

	get chatStatus()
	{
		if(this._rosterUser && this._rosterUser.userInfo)
		{
			return this._rosterUser.userInfo.chatStatus;
		}
		//默认对方已离线
		return ChatStatus.OFFLINE;
	}

	set newconver(value)
	{
		this._newconver = value;
	}

	get newconver()
	{
		return this._newconver;
	}

	get evaluated()
	{
		return this._evaluated;
	}

	set evaluated(value)
	{
		this._evaluated = value;
	}

	get selected()
	{
		return this._selected;
	}

	set selected(value)
	{
		this._selected = value;
		this.newconver = 0; //不是新会话
	}

	set chatStatus(value)
	{
		if(this._rosterUser && this._rosterUser.userInfo)
		{
			let userInfo = this._rosterUser.userInfo,
				chatStatus = userInfo.chatStatus;

			if(chatStatus == value)
				return;

			userInfo.chatStatus = value;

			GlobalEvtEmitter.emit(ChatStatus.CHANGE_EVENT);
		}
	}

	get templatename()
	{
		return this._templatename;
	}

	get averageTimeVo()
	{
		if(!this._averageTimeVo)
		{
			this._averageTimeVo = new AverageResponseTimeVo();
		}

		return this._averageTimeVo;
	}

	set averageTimeVo(value)
	{
		this._averageTimeVo = value;
	}

	get averageTime()
	{
		return this.averageTimeVo.averageTime;
	}

	set sessionInfo(info)
	{
		if(!info)
			return;

		this._name = info.name;
		this._status = info.status;
		this._starttime = info.starttime;
		this._conclusion = info.conclusion;
		this._converType = info.convertype;
		this._summarized = info.summarized;
		this._newconver = info.newconver;
		this._templatename = info.templatename;
		this._evalresult = info.evalresult;
		this._forbiddend = info.forbiddend;

		let userId = loginUser().userId;
		if(!this._members.has(userId))
		{
			this._isMonitor = false;
		}
		else
		{
			let {chatStatus} = this._members.get(userId);

			this._isMonitor = chatStatus === ChatStatus.MONITOR;
		}
	}

	get forbiddend()
	{
		return this._forbiddend || 0;
	}

	set forbiddend(value)
	{
		this._forbiddend = value;
	}

	get status()
	{
		return this._status;
	}

	get productId()
	{
		let startpage = this.rosterUser && this.rosterUser.startpage;

		if(startpage)
		{
			return startpage.prid;
		}

		return "";
	}

	get productInfo()
	{
		return this._productInfo;
	}

	set productInfo(value)
	{
		this._productInfo = value;
	}

	get evalutionResult()
	{
		return this._evalresult;
	}

	set evalutionResult(value)
	{
		this._evalresult = value;
	}

	get isMonitor()
	{
		return this._isMonitor;
	}

	set isMonitor(value)
	{
		this._isMonitor = value;
	}

	get top()
	{
		return this._top;
	}

	set top(value)
	{
		this._top = value;
	}

	get summarized()
	{
		return this._summarized;
	}

	set summarized(value)
	{
		this._summarized = value;
	}

	set destroyedConvers(value)
	{
		if(!Array.isArray(value) || value.length <= 0)
			return;

		this._converList = value;
	}

	get destroyedConvers()
	{
		return this._converList;
	}

	get openChatTime()
	{
		return this._openChatTime;
	}

	set openChatTime(value)
	{
		this._openChatTime = value;
	}

	get startChatTime()
	{
		return this._starttime;
	}

	set startChatTime(value)
	{
		this._starttime = value;
	}

	/**当前输入框内容*/
	get inputMessage()
	{
		return this._inputMessage;
	}

	set inputMessage(value)
	{
		this._inputMessage = value;
	}

	get predictMessage()
	{
		return this._predictMessage;
	}

	set predictMessage(value)
	{
		this._predictMessage = value;
	}

	get systemMessage()
	{
		return this._systemMessage;
	}

	set systemMessage(value)
	{
		this._systemMessage = value;

		log("ChatDataVo systemMessage = " + this._systemMessage);
	}

	setMember(value)
	{
		if(!value || !value instanceof UserInfo)
			return;

		if(!this._members)
			this._members = new Map();

		let userId = value.userId,
			userInfo, isJoin, chatStatusChanged = false;

		if(this._members.has(userId))
		{
			userInfo = this._members.get(userId);
			chatStatusChanged = userInfo.chatStatus !== value.chatStatus;
			userInfo.merge(value);
			userInfo.chatStatus = value.chatStatus;
			isJoin = false;
		}
		else
		{
			this._members.set(userId, value);
			isJoin = true;
		}

		if(value.type == UserInfo.ROBOT)
		{
			this._robotId = userId;
		}

		return {isJoin, userInfo: userInfo || value, chatStatusChanged};
	}

	get kfMembers()
	{
		let arr = [];

		if(!this._members)
			return arr;

		this._members.forEach(value => {
			if(UserInfo.isCustomer(value) && value.chatStatus === ChatStatus.CHATING)
			{
				arr.push(value);
			}
		});

		return arr;
	}

	get cooperateData()
	{
		return this._cooperateData;
	}

	set cooperateData(value)
	{
		this._cooperateData = value;
	}

	hasMember(userId)
	{
		if(this._members)
		{
			return this._members.has(userId);
		}
		return false;
	}

	removeMember(userId)
	{
		if(this._members)
		{
			this._members.delete(userId);
		}
	}

	get rosterUser()
	{
		return this._rosterUser;
	}

	set rosterUser(value)
	{
		if(!value || !value instanceof RosterUser)
			return;

		if(!this._rosterUser)
		{
			this._rosterUser = value;
		}
		else
		{
			this._rosterUser.merge(value);
		}
	}

	get robotId()
	{
		return this._robotId;
	}

	set robotId(value)
	{
		this._robotId = value;
	}

	removeFromOutput(sessionId, sentence)
	{
		if(this._outputMap.has(sentence.sentenceID) && this._outputMessages[sentence.sessionID])
		{
			let tempSentence,
				messages = this._outputMessages[sentence.sessionID],
				len = messages.length;

			for(var i = len - 1; i >= 0; i--)
			{
				tempSentence = messages[i];
				if(tempSentence && tempSentence.sentenceID === sentence.sentenceID)
				{
					messages.splice(i, 1);
					break;
				}
			}
		}
	}

	addSentenceToOutput(sentence)
	{
		let added = false;

		try
		{
			if(!sentence || !sentence.sentenceID)
				return false;

			log("addSentenceToOutput sentence.sentenceID = " + sentence.sentenceID);

			if(this._outputMap.has(sentence.sentenceID) && this._outputMessages[sentence.sessionID])
			{
				let tempSentence,
					messages = this._outputMessages[sentence.sessionID],
					len = messages.length;

				for(var i = len - 1; i >= 0; i--)
				{
					tempSentence = messages[i];
					if(tempSentence && tempSentence.sentenceID === sentence.sentenceID)
					{
						messages.splice(i, 1);

						if(sentence.status !== tempSentence.status)
						{
							added = true;
						}
						break;
					}
				}
			}
			else
			{
				added = true;

				if(!sentence.bhistory && !sentence.bsystem && !sentence.bmine)
				{
					this.setUnreadMsgCount(this._unreadMsgCount + 1, this._selected, true);

					forceOpenWindow();
					playMsgAudio();
				}
			}

			this._outputMap.set(sentence.sentenceID, sentence);
			this._sortOutMessages(sentence);
		}
		catch(e)
		{
			log("addSentenceToOutput stack: " + e.stack);
		}

		return added; //新增或者状态发生变化
	}

	updateTranslate(msgId, transfer)
	{
		let sentence = this.getMessage(msgId);

		if(sentence)
		{
			sentence.transfer = transfer;
		}
	}

	set lastReceiveMessage(sentence)
	{
		try
		{
			if(typeof sentence === "string")
			{
				if(this._lastReceiveMessage)
					return;

				this._lastReceiveMessage = sentence;
			}
			else if(!sentence)
			{
				if(this._lastReceiveMessage || !(this._lastReceiveMessage instanceof AbstractChatSentence))
				{
					this._lastReceiveMessage = new AbstractChatSentence();
				}
			}
			else
			{
				let isCustomer = !sentence.userInfo || (sentence.userInfo && sentence.userInfo.type !== UserInfo.VISITOR),
					lastMsgType = VersionControl.LAST_MSG_TYPE;

				if((lastMsgType == LastMsgType.CUSTOMER && !isCustomer)
					|| (lastMsgType == LastMsgType.GUESTER && isCustomer))
					return;

				if(!this._lastReceiveMessage || !(AbstractChatSentence.prototype.isPrototypeOf(this._lastReceiveMessage) &&
						AbstractChatSentence.prototype.isPrototypeOf(sentence)))
				{
					this._lastReceiveMessage = sentence;
					return;
				}

				if(sentence.createTime > this._lastReceiveMessage.createTime)
				{
					this._lastReceiveMessage = sentence;
				}
			}
		}
		catch(e)
		{
			log("lastReceiveMessage stack: " + e.stack);
		}
	}

	get lastReceiveMessage()
	{
		try
		{
			if(!this._outputMessages || !this.sessionId || !this._outputMessages[this.sessionId])
				return new AbstractChatSentence();

			if(this._lastReceiveMessage)
			{
				return this._lastReceiveMessage;
			}

			let messages = this._outputMessages[this.sessionId],
				isCustomer = false,
				lastMsgType = VersionControl.LAST_MSG_TYPE,
				sentence, userInfo,
				len = messages.length;

			for(var i = len - 1; i >= 0; i--)
			{
				sentence = messages[i];

				if(sentence.bsystemMsg || !sentence.userInfo)
					continue;

				userInfo = sentence.userInfo;
				isCustomer = userInfo.type !== UserInfo.VISITOR;

				if((lastMsgType == LastMsgType.CUSTOMER && !isCustomer)
					|| (lastMsgType == LastMsgType.GUESTER && isCustomer))
					continue;

				if(sentence.status <= MessageType.STATUS_MESSAGE_SEND_RECEIVED)
				{
					this._lastReceiveMessage = sentence;
					return sentence;
				}
			}
		}
		catch(e)
		{
			log("lastReceiveMessage stack： " + e.stack);
		}
		return null;
	}

	getMessage(id)
	{
		if(this._outputMap)
		{
			return this._outputMap.get(id);
		}

		return null;
	}

	get outputMessages()
	{
		return this._outputMessages;
	}

	addUnreadMsgId(value)
	{
		if(!this._unreadMessageIds.includes(value))
		{
			this._unreadMessageIds.push(value);
		}
	}

	clearUnreadMessageIds()
	{
		this._unreadMessageIds = [];
	}

	get unreadMessageIds()
	{
		return this._unreadMessageIds;
	}

	get members()
	{
		return this._members;
	}

	set members(value)
	{
		if(!value)
			return;

		if(!this._members)
		{
			this._members = value;
		}
		else
		{
			value.forEach(user => this.setMember(user));
		}
	}

	get unreadMsgCount()
	{
		return this._unreadMsgCount;
	}

	setUnreadMsgCount(value, selected = false, unreadCountTime = true)
	{
		log("setUnreadMsgCount value = " + value + ", selected = " + selected);

		if(value > 0)
		{
			if(this.unreadCountTime <= 0)
			{
				this.unreadCountTime = new Date().getTime();
			}
		}
		else
		{
			this.unreadCountTime = unreadCountTime ? -1 : this.unreadCountTime;
		}

		this._unreadMsgCount = selected ? 0 : value;
	}

	get unreadCountTime()
	{
		return this._unreadCountTime;
	}

	set unreadCountTime(value)
	{
		this._unreadCountTime = value;
	}

	get sessionId()
	{
		return this._sessionId;
	}

	set sessionId(value)
	{
		this._sessionId = value;
		this.averageTimeVo.converId = value;
	}

    set robotListAnswer(value)
    {
        // this._robotList = value;
        //anwer q
        //
    }

    get robotList()
    {
        return this._robotList;
    }

	clearData()
	{
	}

	chatDataArray = [];

	_sortOutMessages(sentence)
	{
		try
		{
			let curTime, insertIndex, sessionId = sentence.sessionID, messages;
			messages = this._outputMessages[sessionId];

			if(!messages)
			{
				this._outputMessages[sessionId] = messages = [sentence];
				return;
			}

			if(sentence.createTime)
			{
				curTime = sentence.createTime;
				insertIndex = messages.findIndex(message => message.createTime > curTime);

				insertIndex = insertIndex === -1 ? messages.length : insertIndex;
			}

			messages.splice(insertIndex, 0, sentence);
		}
		catch(e)
		{
			log("sortOutMessages sentence.sentenceID = " + sentence.sentenceID + ", stack: " + e.stack);
		}
	}

}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("ChatDataVo", info, log);
}

export default ChatDataVo;
