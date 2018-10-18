import React, { Component } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ContextMenuLayer } from "../../../components/contextmenu/index";
import { Button } from 'antd';
import ConsultInfo from "./ConsultInfo";
import VersionControl from "../../../utils/VersionControl";
import { CLOSE, COOPERATE, CLOSE_ALL } from "../../event/TabEvent";
import { chatIsClose, getSummaryModal, ntalkerListRedux } from "../../../utils/ConverUtils";
import { getLangTxt, notifyMe, sendT2DEvent } from "../../../utils/MyUtil";
import LogUtil from "../../../lib/utils/LogUtil";
import { tabSelected, tabClosed } from "../redux/reducers/eventsReducer";
import KeyboardEvent from "../../event/KeyboardEvent";
import GlobalEvtEmitter from "../../../lib/utils/GlobalEvtEmitter";
import ChatStatus from "../../../model/vo/ChatStatus";
import EnterFrameComp from "../../../components/EnterFrameComp";
import Model from "../../../utils/Model";
import NtalkerListRedux from "../../../model/chat/NtalkerListRedux";
import NtalkerEvent from "../../event/NtalkerEvent";
import IndexScrollArea from "../../../components/IndexScrollArea"
import MenuBottom, { hideMenu } from "./MenuBottom";
import SessionEvent from "../../event/SessionEvent";
import { getIntelligent } from "../../setting/personal/action/personalSetting";
import { hasConver } from "../redux/reducers/chatPageReducer";
import { getWapper } from "./send/toolbar/ConclusionViewWrapper";

let shortcut = ["alt", "q"];

class NtalkerTabBar extends EnterFrameComp {

	static defaultProps = {
		equalKeys: ["shortCut", "time"],
		deep: 1
	};

	constructor(props)
	{
		super(props);

		this._index = 0;
		this.mode = 0;

		this.state = {
			height: 0,
			isBigAvatar: VersionControl.isBigAvatar,
			summaryProps: {},
            coordinateY: 0
		};

		this._onCloseHandler = this._onCloseHandler.bind(this);
		this._onCooperate = this._onCooperate.bind(this);
		this.onSwitchConver = this.onSwitchConver.bind(this);
		this.onCloseConver = this.onCloseConver.bind(this);
		this.onESC = this.onESC.bind(this);
		this.onChatDataChange1 = this.onChatDataChange1.bind(this);
		this.hideSummaryModal = this.hideSummaryModal.bind(this);
		this.onChatStatusChange = this.onChatStatusChange.bind(this);

		GlobalEvtEmitter.on(CLOSE, this._onCloseHandler);
		GlobalEvtEmitter.on(COOPERATE, this._onCooperate);

		GlobalEvtEmitter.on(KeyboardEvent.SWITCH_CONVER, this.onSwitchConver);
		GlobalEvtEmitter.on(KeyboardEvent.ESC, this.onESC);
		GlobalEvtEmitter.on(NtalkerEvent.CHAT_DATA_CHANGE, this.onChatStatusChange);
		GlobalEvtEmitter.on(NtalkerEvent.CHAT_DATA_LIST_CHANGE, this.onChatDataChange1);

		this.initChatSet();
	}
	
	onESC()
	{
		let portalWrapper = document.getElementsByClassName("portalWrapper");
		
		if(portalWrapper.length <= 0)
		{
			this.onCloseConver();
		}
	}

	initChatSet()
	{
		try
		{
			let chatSort = parseInt(localStorage.getItem("chatSort")) || 1;

			VersionControl.chatSort = ntalkerListRedux().chatSort = chatSort;
		}
		catch(e)
		{

		}
	}

	onChatStatusChange()
	{
		if(VersionControl.chatSort == VersionControl.CHAT_SORT_STATUS)
		{
			if(this._ntalkerListRedux)
			{
				this._ntalkerListRedux.sortByStatus();
			}
		}
		else
		{
			this.onChatDataChange1();
		}
	}

	_ntalkerListRedux = null;
	_untreatedConverCount = 0;
	_timeoutNotifyId;

	onChatDataChange1()
	{
		if(!this._ntalkerListRedux)
			this._ntalkerListRedux = ntalkerListRedux();

		let count = this._ntalkerListRedux.untreatedConverCount;
		if((count > 0 && this._untreatedConverCount !== count))
		{
			clearTimeout(this._timeoutNotifyId);

			this._timeoutNotifyId = setTimeout(() => {
				notifyMe(count);
			}, 500);

			this._untreatedConverCount = count;
		}

		this.setState({updateTime: new Date().getTime()});
	}

	onSwitchConver()
	{
		this.switchConver();
	}

	switchConver()
	{
		GlobalEvtEmitter.emit(NtalkerEvent.SWITCH_CONVER, this._index);
	}

	onCloseConver()
	{
		this.retIndex(this._index);

		if(this.pureChatListLast.length > this._index && this._index > -1)
		{
			this._onCloseHandler([this.pureChatListLast[this._index].name]);
		}
	}

	retIndex(index)
	{
		if(index < 0)
		{
			this._index = this.pureChatListLast.findIndex(value => value.selected);
		}
	}

	componentDidMount()
	{
		this.props.getIntelligent();
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		let shortCut1 = nextProps.shortCut;
		
		shortcut = shortCut1.split("+");
		
		if(nextProps.isActive)
		{
			this.props.hasConver(this._ntalkerListRedux.size);
		}

		return super.shouldComponentUpdate(nextProps, nextState);
	}

	_onCooperate(data)
	{
		if(data)
		{
			let index = data.index;

			index = index === undefined ? this._index : index;

			if(this.pureChatListLast.length > index)
			{
				let record = this.pureChatListLast[index];

				if(record)
				{
					record.requestCooperateAction(data.operation);
				}
			}
		}
	}

	_onCloseHandler(data)
	{
		if(this.pureChatListLast.length > this._index && this._index > -1)
		{
			if(data && data.includes(this.pureChatListLast[this._index].name))
			{
				//this.switchConver();
			}
		}

		setTimeout(()=>{
			this.props.tabClosed(data);
		}, 100)

	}

	_onRowClick(record, index)
	{
		if(record)
		{
			this._index = index;

			this.props.tabSelected([record.name]);
		}
	}

	curTab = null;

	onContextMenu(event)
	{
		let curComp = event.target,
            coordinateY = event.clientY;

        this.setState({
            coordinateY
        });

		let mode = 0;
		while(curComp.parentNode)
		{
			if(!curComp.className)
			{
				curComp = curComp.parentNode;
				continue;
			}

			//唯一className,匹配出会话Tab
			if(curComp.classList[0] === "consultinfo_container")
			{
				this.curTab = curComp;
				mode = 1;
				this.forceUpdate();
				return;
			}

			curComp = curComp.parentNode;
		}

		this.setState({mode});

		hideMenu();
	}

	_top()
	{
		if(this.curTab && this.curTab.classList)
		{
			return this.curTab.classList[1];
		}

		return 0;
	}

	_onRightMouse(selectType, data)
	{
		switch(selectType)
		{
			case MenuBottom.summary:
				this.dealSummary(data);
				break;

			case MenuBottom.sortTime:
				this._setSort(VersionControl.CHAT_SORT_TIME);
				break;

			/*
			 case MenuBottom.close:
			 if(this.curTab)
			 this.props.tabClosed([this.curTab.id]);
			 break;*/

			/*case MenuBottom.top:
			 if(this.curTab)
			 this.props.chatDataTop(this.curTab.id, top);
			 break;

			 case MenuBottom.result:

			 break;

			 case MenuBottom.tag:

			 break;


			 case MenuBottom.sortStatus:
			 this._setSort(VersionControl.CHAT_SORT_STATUS);
			 break;

			 case MenuBottom.head:
			 VersionControl.isBigAvatar = !VersionControl.isBigAvatar;
			 this.setState({isBigAvatar: VersionControl.isBigAvatar});
			 break;
			 */
		}
	}

	_setSort()
	{
		if(!this._ntalkerListRedux)
			return;

		if(VersionControl.chatSort !== VersionControl.CHAT_SORT_STATUS)
		{
			this._ntalkerListRedux.chatSort = VersionControl.chatSort = VersionControl.CHAT_SORT_STATUS;

			this._ntalkerListRedux.sortByStatus();
		}
		else
		{
			this._ntalkerListRedux.chatSort = VersionControl.chatSort = VersionControl.CHAT_SORT_TIME;
		}

		localStorage.setItem("chatSort", this._ntalkerListRedux.chatSort);
	}

	dealSummary(data)
	{
		if(data)
		{
			let chatData = this.getChatDataByName(this.curTab.id);
			if(chatData)
			{
				let chatDataVo = chatData.chatDataVo || {},
					{sessionId, rosterUser} = chatDataVo;
				
				if(data === "more")
				{
					let summaryProps = {
						visible: true, summaryAll: this.props.chatSummaryAll,
						close: this.hideSummaryModal,
						converId: sessionId, rosterUser,
						isCurrent:true
					};

					this.setState({summaryProps});
					return;
				}

				sendT2DEvent({
					listen: SessionEvent.REQUEST_SUBMIT_SUMMARY,
					params: [chatData.chatDataVo.sessionId, [{
						id: data.summaryid, content: data.content
					}], ""]
				});
			}
		}
	}

	hideSummaryModal()
	{
		let {summaryProps} = this.state;

		this.setState({summaryProps: {...summaryProps, visible: false}});
	}

	_getOfflineNumUI(num)
	{
		if(num > 0)
		{
			return (
				<div className="userTabsBottom">
					<span>
						{
							getLangTxt("converOfflineLabel", num)
						}
					</span>
					<Button onClick={this._onConverClose.bind(this)}>
						{
							getLangTxt("close")
						}
					</Button>
				</div>
			);
		}

		return null;
	}

	//关闭已结束会话
	_onConverClose()
	{
		let closeConvers = [];
		this.pureChatListLast.forEach(tab => {
			if(tab.chatStatus === ChatStatus.OFFLINE || tab.chatStatus === ChatStatus.CLOSED || tab.chatStatus === ChatStatus.Exit)
			{
				closeConvers.push(tab.name);
			}
		});

		this.props.tabClosed(closeConvers);
	}

	get pureChatListLast()
	{
		return this._tpureChatList || [];
	}

	get pureChatList()
	{
		this._offlineNum = 0;  //离线会话数量

		let tindex = -1;

		this._tpureChatList = this.chatlist && this.chatlist.filter((chatData, index) => {
			if(chatIsClose(chatData.chatStatus))
				this._offlineNum++;

			//空数据
			if(!chatData || !chatData.chatDataVo || Object.keys(chatData.chatDataVo) <= 0 || !chatData.chatDataVo.rosterUser)
				return false;

			if(chatData.selected)
				tindex = index;

			if(tindex < 0)
				chatData.setSelected(false, false);

			return true;
		});

		this._index = tindex;

		return this._tpureChatList || [];
	}

	get ntalkerListRedux()
	{
		if(!this._ntalkerListRedux)
		{
			this._ntalkerListRedux = Model.retrieveProxy(NtalkerListRedux.NAME)
		}

		return this._ntalkerListRedux;
	}

	//会话列表[ChatDataManager]
	get chatlist()
	{
		return this.ntalkerListRedux.tabList;
	}

	getChatDataByName(value)
	{
		return this.pureChatListLast.find(item => item && item.name == value);
	}

	preConsultInfos = new Map();

	get chatListComp()
	{
		let curConsultInfos = new Map(),
			tchatListComp = this.pureChatList.map((chatData, index) => {
				let {name} = chatData, chatComp;

				if(this.preConsultInfos.has(name))
				{
					chatComp = this.preConsultInfos.get(name);
				}
				else
				{
					chatComp = <ConsultInfo key={name} index={index} chatData={chatData}
					                        onRowClick={this._onRowClick.bind(this, chatData, index)}/>;
				}

				curConsultInfos.set(name, chatComp);

				this.preConsultInfos.clear();

				return chatComp;
			});

		this.preConsultInfos = curConsultInfos;

		return tchatListComp;
	}
	
	getSummaryModal(visible)
	{
		if(!visible)
		{
			//let wapper = getWapper();
			//wapper && wapper.close();
			return null;
		}
		
		return getSummaryModal(this.state.summaryProps);
	}

	render()
	{
		let totalNum = this.pureChatList.length,
			style = this._offlineNum > 0 ? {height: 'calc(100% - 44px)'} : {height: '100%'},
			chatData = this.curTab && this.getChatDataByName(this.curTab.id),
            {coordinateY} = this.state;

		return (
			<div ref="ntalkerTabBar" style={{height: '100%'}}>
				<IndexScrollArea ref="scroll" speed={1} style={style} totalNum={totalNum} currentIndex={this._index}>
					<div className='well' ref='ntalkerTabBar' onContextMenu={this.onContextMenu.bind(this)}>
						{
							this.chatListComp
						}
					</div>
					<MenuBottom onRightMouse={this._onRightMouse.bind(this)} chatData={chatData} coordinateY={coordinateY}/>
				</IndexScrollArea>
				{
					this._getOfflineNumUI(this._offlineNum)
				}
				{
					this.getSummaryModal(this.state.summaryProps.visible)
				}
			</div>
		);
	}

	componentWillUnmount()
	{
		super.componentWillUnmount();

		GlobalEvtEmitter.removeListener(CLOSE, this._onCloseHandler);
		GlobalEvtEmitter.removeListener(COOPERATE, this._onCooperate);
		GlobalEvtEmitter.removeListener(KeyboardEvent.SWITCH_CONVER, this.onSwitchConver);
		GlobalEvtEmitter.removeListener(KeyboardEvent.ESC, this.onCloseConver);
		GlobalEvtEmitter.removeListener(NtalkerEvent.CHAT_DATA_CHANGE, this.onChatDataChange1);
		GlobalEvtEmitter.removeListener(NtalkerEvent.CHAT_DATA_LIST_CHANGE, this.onChatDataChange1);
	}
}

function mapStateToProps(state)
{
	let {personalReducer, summaryReducer = {}} = state,
		intelligent = personalReducer.get("intelligent") || Map(),
		{commonSummaryList, chatSummaryAll} = summaryReducer,
		intelData = intelligent.get("data") || {},
		shortCut = "";

	if(intelData)
		shortCut = intelData.intelligent || "";

	return {shortCut, commonSummaryList, chatSummaryAll};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		tabClosed, tabSelected, getIntelligent, hasConver
	}, dispatch);
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("NtalkerTabBar", info, log);
}

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenuLayer("some_unique")(NtalkerTabBar));
