import React from "react";
import Timer from "../../../components/Timer";
import { CLOSE, COOPERATE } from "../../../apps/event/TabEvent";
import VersionControl from "../../../utils/VersionControl";
import { chatIsClose, clearStyleForMessage } from "../../../utils/ConverUtils";
import ChatStatus from "../../../model/vo/ChatStatus";
import { getSourceUrl } from "../../../utils/MyUtil";
import { bglen, substr, truncateToPop } from "../../../utils/StringUtils";
import Lang from "../../../im/i18n/Lang";
import LogUtil from "../../../lib/utils/LogUtil";
import CooperateData from "../../../model/vo/CooperateData";
import "../../../public/styles/chatpage/consultInfo.scss";
import { Popover } from 'antd';
import GlobalEvtEmitter from "../../../lib/utils/GlobalEvtEmitter";

const containerClassName = "consultinfo_container ";
const chatBgCls = {
	selected: "selected",
	online: "online",
	offline: "offline",
	unread: "unread"
};

class ConsultInfo extends React.Component {
	
	statusIcon = "";
	
	constructor(args)
	{
		super(args);
	}
	
	_getNormalColumn(record)
	{
		let chatDataVo = record.chatDataVo,
			{rosterUser, unreadMsgCount} = chatDataVo,
			userInfo = rosterUser.userInfo || {},
			chatStatus = userInfo.chatStatus,
			isGray = chatStatus !== ChatStatus.OFFLINE;
		
		return (
			<div className="normalColumnWrap">
				<div className="source">
					{
						this._getVisitorSource(rosterUser, isGray)
					}
				</div>
				{
					VersionControl.isBigAvatar ?
						this._getBigColumn(chatDataVo, isGray)
						:
						this._getSmallColumn(chatDataVo, isGray)
				}
				{
					unreadMsgCount <= 0 ?
						<i className="iconfont icon-009cuowu cuowuIcon"
						   onClick={this._onClose.bind(this, record.name)}/>
						:
						null
				}
			</div>
		);
	}
	
	_getSmallColumn(chatDataVo, isGray)
	{
		let {rosterUser, unreadMsgCount, unreadCountTime, summarized, converType = 0, forbiddend = 0} = chatDataVo;
		
		return (
			<div className="userCon">
				<div className="tooltip-name-box">
					{
						bglen(rosterUser.userName + " " + rosterUser.address) > 18 ?
							<Popover content={<div style={{maxWidth: "350px", wordBreak: 'break-word'}}>
								{rosterUser.userName + " " + rosterUser.address}
							</div>} placement="topLeft">
                                <span className="user-name" style={isGray ? {} : {color: '#ccc'}}>
                                    {substr(rosterUser.userName + " " + rosterUser.address, 9) + '...'}
                                </span>
							</Popover>
							:
							<span className="user-name" style={isGray ? {} : {color: '#ccc'}}>
                                {rosterUser.userName + " " + rosterUser.address}
                            </span>
					}
					{
						this._getCooperateIcon(converType, isGray)
					}
					{
						this._getSummarizedIcon(summarized, isGray)
					}
					<span className="getIconWrapper">
                        {
	                        this._getWaitComp(unreadCountTime)
                        }
						{
							this._getUnreadCountComp(unreadMsgCount)
						}
						{
							this._getForbiddendIcon(forbiddend === 1, isGray)
						}
                    </span>
				</div>
			</div>
		);
	}
	
	_getIconsPortal(isGray, converType, summarized, forbiddend)
	{
		return [
			this._getCooperateIcon(converType, isGray),
			this._getSummarizedIcon(summarized, isGray),
			this._getForbiddendIcon(forbiddend === 1, isGray)
		].filter(icon => icon);
	}
	
	get clientWidth()
	{
		if(!document)
			return -1;
		
		return document.getElementById("app").clientWidth || -1;
	}
	
	_getBigColumn(chatDataVo, isGray)
	{
		let {lastReceiveMessage, rosterUser, unreadMsgCount, unreadCountTime, summarized, converType = 0, forbiddend = 0} = chatDataVo,
			lastWord = clearStyleForMessage(lastReceiveMessage),
			userInfo = rosterUser.userInfo || {},
			chatStatus = userInfo.chatStatus,
			icons = this._getIconsPortal(isGray, converType, summarized, forbiddend),
			currentPX = (this.clientWidth > 1390 ? 1390 : this.clientWidth) * 100 / 1024,
			totalWidth = currentPX * 2.07,
			iconWidth = icons.length * 17 + (this.statusIcon ? 16 + currentPX * 0.029 : 0),
			address = rosterUser.address,
			userName = rosterUser.userName,
			nameWidth = userName ? bglen(userName) / 2 * 15 : 0,
			addressWidth = address ? bglen(address) / 2 * 15 + 8 : 0;
		
		let _35 = 15 * 4 + 8,
			minAddrW = addressWidth > _35 ? _35 : addressWidth,
			maxNameWidth = totalWidth - minAddrW - iconWidth,
			realNameWidth = nameWidth > maxNameWidth ? maxNameWidth : nameWidth,
			realAddrWidth = totalWidth - realNameWidth - iconWidth,
			nameTruncate = nameWidth !== realNameWidth ? truncateToPop(userName, realNameWidth, 15) : {},
			addrTruncate = realAddrWidth !== addressWidth ? truncateToPop(address, realAddrWidth, 15) : {};
		
		if(!address)
		{
			nameTruncate = truncateToPop(userName, maxNameWidth, 15);
		}
		
		return (
			<div className="userCon">
				<div className="tooltip-name-box">
					{
						nameTruncate.show ?
							<Popover
								content={<div style={{maxWidth: "350px", wordBreak: 'break-word'}}>{userName}</div>}
								placement="topLeft">
                                <span className="user-name" style={isGray ? {} : {color: '#ccc'}}>
                                    {
	                                    nameTruncate.content
                                    }
                                </span>
							</Popover>
							:
							<span className="user-name" style={isGray ? {} : {color: '#ccc'}}>
                                {userName}
                            </span>
					}
					
					{
						rosterUser.address ?
							addrTruncate.show ?
								<Popover
									content={<div style={{maxWidth: "350px", wordBreak: 'break-word'}}>{address}</div>}
									placement="topLeft">
                                    <span className="user-name user-address" style={isGray ? {} : {color: '#ccc'}}>
                                        {addrTruncate.content}
                                    </span>
								</Popover>
								:
								<span className="user-name user-address" style={isGray ? {} : {color: '#ccc'}}>
                                    {address}
                                </span>
							: null
					}
					{
						this.statusIcon ?
							chatStatus !== ChatStatus.OFFLINE ?
								<img src={require('../../../public/images/chatPage/close.png')}
								     className={isGray ? 'chatStatusImg' : 'chatStatusImg gray'}/>
								:
								<img src={require('../../../public/images/chatPage/leaveLeft.png')}
								     className={isGray ? 'chatStatusImg' : 'chatStatusImg gray'}/>
							:
							null
					}
					{
						icons
					}
				</div>
				{
					lastWord ?
						<div className="tooltip-word-box">
							<div className="lastWord" dangerouslySetInnerHTML={{__html: lastWord}}
							     style={isGray ? {} : {color: '#ccc'}}/>
						</div> : null
				}
				{
					this._getWaitComp(unreadCountTime)
				}
				{
					this._getUnreadCountComp(unreadMsgCount)
				}
			</div>
		);
	}
	
	_getCoopOperateColumn(chatData, cooperateData)
	{
		if(!cooperateData || !cooperateData.isRuning())
			return null;
		
		let rosterUser = chatData.chatDataVo.rosterUser;
		
		return (
			<div className="information_consult">
				<span className="information_consult_userName">
                    {rosterUser.userName}
				</span>
				
				<span className="information_consult_cooperateData">
				{
					this._getCooperateCountDown(parseInt(cooperateData.getDuration() / 1000), chatData, CooperateData.TIMEOUT)
				}
				</span>
				{
					this._getCoopOperateComp(chatData, cooperateData)
				}
			</div>
		);
	}
	
	_getCoopOperateComp(chatData, cooperateData)
	{
		try
		{
			if(cooperateData.isSponsor)
			{
				return (
					<span className="button cancelBtn"
					      onClick={this._onOperation.bind(this, chatData, CooperateData.CANCEL)}>
						{
							Lang.getLangTxt("cancel")
						}
					</span>
				);
			}
			return (
				<div className="coopOperateWrapper">
					<span className="button" onClick={this._onOperation.bind(this, chatData, CooperateData.ACCEPT)}
					      style={{cursor: 'pointer'}}>
						{
							Lang.getLangTxt("accept")
						}
					</span>
					<span className="button" onClick={this._onOperation.bind(this, chatData, CooperateData.REFUSE)}
					      style={{cursor: 'pointer'}}>
						{
							Lang.getLangTxt("refuse")
						}
					</span>
				</div>
			);
		}
		catch(e)
		{
		
		}
	}
	
	_getCooperateCountDown(expiredtime = 60, chatData, operation)
	{
		expiredtime = expiredtime > 1 ? expiredtime : 60;
		
		return <Timer date={expiredtime} mode={Timer.COUNT_DOWN}
		              onTimerComplete={this._onOperation.bind(this, chatData, operation)}/>;
		
	}
	
	_getUnreadCountComp(unreadMsgCount)
	{
		const unreadCount = unreadMsgCount !== undefined ? unreadMsgCount : 0,
			classNameCls = VersionControl.isBigAvatar ? "bigavatar" : "smallavatar";
		
		return unreadCount > 0 ?
			<span style={{marginLeft: "15px"}} className={classNameCls}>
				{unreadCount}
			</span> : null;
	}
	
	_getSummarizedIcon(value = false, isGray)
	{
		if(value)
		{
			return <i key="summarizedicon" className="iconfont icon-zixunzongjie"
			          style={isGray ? {} : {color: '#ccc'}}/>;
		}
		
		return null;
	}
	
	_getForbiddendIcon(value = false, isGray)
	{
		if(value)
		{
			return <i key="forbiddendicon" className="iconfont icon-heimingdan" style={isGray ? {} : {color: '#ccc'}}/>;
		}
		
		return null;
	}
	
	_getCooperateIcon(converType, isGray)
	{
		if(!converType)
			return null;
		
		let iconfont = "iconfont ";
		
		if(converType === 1) //0：独立咨询;  1：邀请咨询; 2：转出咨询;  3：转入咨询;
		{
			iconfont += "icon-yaoqing";
		}
		else if(converType === 2 || converType === 3)
		{
			iconfont += "icon-zhuanjie";
		}
		
		return <i key="cooperateicon" className={iconfont} style={isGray ? {} : {color: '#ccc'}}/>;
	}
	
	_getWaitComp(unreadCountTime)
	{
		unreadCountTime = unreadCountTime !== undefined ? unreadCountTime : -1;
		
		if(unreadCountTime > 0)
		{
			unreadCountTime = Math.floor((new Date().getTime() - unreadCountTime) / 1000);
		}
		
		return unreadCountTime <= -1 ? null :
			<Timer style={{cursor: "default", color: '#3a93e5', fontWeight: '600'}} date={unreadCountTime}/>;
	}
	
	_getVisitorSource(rosterUser, isGray)
	{
		let userInfo = rosterUser.userInfo || {},
			chatStatus = userInfo.chatStatus,
			isClose = chatIsClose(chatStatus),
			source = getSourceUrl(rosterUser.userInfo);
		
		if(chatStatus !== ChatStatus.OFFLINE)
		{
			this.statusIcon = isClose ? "iconfont icon-guanbi" : "";
		}
		else
		{
			this.statusIcon = "iconfont icon-shijian";
		}
		
		if(source.indexOf("http") >= 0)
			return (
				<img src={source} className={isGray ? '' : 'gray'}/>
			);
		
		/*if(source.toLowerCase() === 'icon-weibo' || source.toLowerCase() === 'icon-weibowap')
			return <img src={require('../../../public/images/chatPage/' + source.toLowerCase()
			.slice(5) + '.png')} style={{marginTop: '6px'}} className={isGray ? '' : 'gray'}/>;*/
		
		return <i className={"iconfont " + source.toLowerCase()} style={isGray ? {} : {color: '#ccc'}}/>;
		
	}
	
	_onClose(tabName, e)
	{
		e.stopPropagation();
		
		GlobalEvtEmitter.emit(CLOSE, [tabName]);
	}
	
	_onOperation(record, operation)
	{
		let tabName = record.name;
		
		GlobalEvtEmitter.emit(COOPERATE, {tabName, operation, index: this.props.index});
		
		log("onOperation record.name = " + tabName + ", operation = " + operation);
	}
	
	_getBgClsName(chatData)
	{
		let {chatDataVo = {}, selected} = chatData,
			{unreadMsgCount, chatStatus} = chatDataVo;
		
		if(unreadMsgCount > 0)
			return chatBgCls.unread;
		
		if(selected)
			return chatBgCls.selected;
		
		if(chatStatus !== ChatStatus.OFFLINE)
			return chatBgCls.online;
		
		return chatBgCls.offline;
	}
	
	render()
	{
		const {chatData} = this.props;
		if(!chatData.chatDataVo || !chatData.chatDataVo.rosterUser)
			return null;
		
		let {chatDataVo, name} = chatData,
			{chatStatus, cooperateData} = chatDataVo,
			top = chatData.top ? 1 : 0,
			valueName = this._getBgClsName(chatData),
			isOffLineClassName = '';
		
		if(chatStatus === ChatStatus.OFFLINE)
		{
			isOffLineClassName = 'offline';
		}
		
		return (
			<div id={name} className={containerClassName + " " + top + " " + valueName + " " + isOffLineClassName}
			     onClick={this.props.onRowClick}>
				{
					Boolean(cooperateData) ?
						this._getCoopOperateColumn(chatData, cooperateData) :
						this._getNormalColumn(chatData)
				}
			</div>
		);
	}
}

function log(content, info = LogUtil.INFO)
{
	LogUtil.trace("ConsultInfo", info, content);
}

export default ConsultInfo;
