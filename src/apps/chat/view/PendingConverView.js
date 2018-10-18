import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Popover } from 'antd';
import LogUtil from "../../../lib/utils/LogUtil";
import { getPendingConvers } from "../redux/reducers/pendingConverReducer";
import PendingConverData from "../../../model/vo/PendingConverData";
import SessionEvent from "../../event/SessionEvent";
import { formatTimestamp, getLangTxt, sendT2DEvent, shallowEqual } from "../../../utils/MyUtil";
import { bglen, substr, truncateToPop } from "../../../utils/StringUtils";
import UserInfo from "../../../model/vo/UserInfo";
import "../../../public/styles/chatpage/message/pendingConverView.scss";
import EnterFrameComp from "../../../components/EnterFrameComp";
import { getTabDataByUserId } from "../../../utils/ConverUtils";
import ChatStatus from "../../../model/vo/ChatStatus";
import IndexScrollArea from "../../../components/IndexScrollArea";
import { chatDataChanged, hasConver } from "../redux/reducers/chatPageReducer";
import APPEvent from "../../event/APPEvent";
import GlobalEvtEmitter from "../../../lib/utils/GlobalEvtEmitter";
import NtalkerListRedux from "../../../model/chat/NtalkerListRedux";
import Model from "../../../utils/Model";

class PendingConverView extends EnterFrameComp {

	constructor(props)
	{
		super(props);
		this.state = {
			currentIndex: -1
		};

		this.rp = 15;
		this.page = 0;
		this.hasNextPage = true;
		this.pengdingChangeds = [];
		this.loading = false;

		this.curSeleced = null;

		this.onGetDetroyConver = this.onGetDetroyConver.bind(this);

		GlobalEvtEmitter.on(APPEvent.NOTIFY_GET_DESTROY_CONVER, this.onGetDetroyConver);
		
		Model.retrieveProxy(NtalkerListRedux.NAME).isActive = !props.isActive;
	}

	componentWillUnmount()
	{
		GlobalEvtEmitter.removeListener(APPEvent.NOTIFY_GET_DESTROY_CONVER, this.onGetDetroyConver);
	}

	//访客头像、访客名称、访客身份、会话状态（关、离）、标记状态、总结状态。
	onGetDetroyConver(data)
	{
		let {pagenumbers, page, customers} = data;

		this.hasNextPage = pagenumbers > page;

		this.page = page;

		this.props.getPendingConvers(customers);
		this.loading = false;
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		Model.retrieveProxy(NtalkerListRedux.NAME).isActive = !nextProps.isActive;
		
		if(nextProps.isActive)
		{
			!this.props.isActive && this._requestDestroyConverList();

			if(!nextProps.curConver.chatDataVo)
			{
				this.props.chatDataChanged({});
				this.props.hasConver(false);
			}
			else
			{
				this.props.chatDataChanged(nextProps.curConver);
				this.props.hasConver(Object.keys(nextProps.curConver).length);
			}
		}

		return super.shouldComponentUpdate(nextProps, nextState);
	}

	onChangeConver(userId)
	{
		if(!this.pengdingChangeds.includes(userId) && userId !== undefined)
		{
			this.pengdingChangeds.push(userId);
		}

		let {isActive} = this.props;

		if(isActive && this.pengdingChangeds.length > 0)
		{
			this.pengdingChangeds.forEach(userid => {
				let chatData = getTabDataByUserId(userid),
					preConverData = this._getPendingConverData(userid),
					pendingData = new PendingConverData();

				if(chatData)
				{
					pendingData.updateChatData(chatData.chatDataVo);

					if(preConverData && shallowEqual(pendingData, preConverData))
						return;

					this.props.addConver(pendingData);
				}
			});

			this.pengdingChangeds = [];
		}
	}

	_getPendingConverData(userid)
	{
		let {pendingConvers} = this.props;

		return pendingConvers.find(converData => converData.userId === userid)
	}

	componentDidMount()
	{
		this._requestDestroyConverList();
	}

	getSourceIcon(source)
	{
		if(source.indexOf("http") >= 0)
		{
			return (
				<div className="sourceIconStyle">
					<img src={source} style={{verticalAlign: 'middle'}}/>
				</div>
			);
		}

		return <div className="sourceIconStyle sourceIconStylei">
			<i className={"iconfont " + source.toLowerCase()} style={this._sourceInStyle}/>
		</div>;
	}

    getContainerWidth(address)
    {
        if (!getComputedStyle(window.document.documentElement)['font-size'])
            return;

        let htmlFontSizepx = getComputedStyle(window.document.documentElement)['font-size'],
            htmlFontSize = htmlFontSizepx.substring(0, htmlFontSizepx.length - 2),
            maxWidth = 2.64 * htmlFontSize;

        return address ? (maxWidth - 150) * 0.5 : maxWidth - 150;
    }

	getPendingConverComp()
	{
		let {pendingConvers} = this.props;

		return pendingConvers.map((converData, index) => {
			let {userId, userName, summarized, sourceIcon, selected = false, isVip, updateTime, forbidden, city, province} = converData,
				selectedCls = selected ? "perView selected" : "perView",
                address = province + city,
                containerWidth = this.getContainerWidth(address),
                userNameInfo = truncateToPop(userName, containerWidth) || {},
                adressInfo = truncateToPop(address, containerWidth) || {},
                maxNameWidth;

            if(province && city.indexOf(province) >= 0)
                address = province;

            maxNameWidth = address ? "50%" : "100%";
			userName = userName ? userName : getLangTxt("fk1");

			return (
				<div style={{position: "relative"}} key={userId} onClick={this._onStartChatWithGuest.bind(this, converData, index)}
				     className={selectedCls}
				     style={this.state.currentIndex === index ? {} : {backgroundColor: '#fff'}}>
					{
						this.getSourceIcon(sourceIcon)
					}
                    <span className="nameAddressBox">
                        {
                            userNameInfo.show ?
                                <Popover
                                    content={<div style={{maxWidth: "350px", wordBreak: 'break-word'}}>{userName}</div>}
                                    placement="topLeft">
                                    <span className="perview_user-name" style={{width: maxNameWidth}}>{userNameInfo.content}</span>
                                </Popover>
                                :
                                <span className="perview_user-name" style={{width: maxNameWidth}}>{userName}</span>
                        }

                        {
                            address ?
                                adressInfo.show ?
                                    <Popover
                                        content={<div style={{maxWidth: "350px", wordBreak: 'break-word'}}>{address}</div>}
                                        placement="topLeft">
                                        <span style={{width: maxNameWidth}} className="perview_user-name perview_user_address">{adressInfo.content}</span>
                                    </Popover>
                                    :
                                    <span style={{width: maxNameWidth}} className="perview_user-name perview_user_address">{address}</span>
                                : null
                        }
                    </span>
                    <span className="iconBox">
                        {
	                        isVip ? <i className="iconfont icon-VIP"/> : null
                        }
	                    {
		                    summarized ? <i className="iconfont icon-zixunzongjie"/> : null
	                    }
	                    {
		                    forbidden ? <i className="iconfont icon-heimingdan"/> : null
	                    }
                    </span>
					{
						updateTime ? <div className="timeShow">{formatTimestamp(updateTime)}</div> : null
					}
				</div>
			);
		});
	}

	_onStartChatWithGuest(converData, index)
	{
		event.preventDefault();

		let {userId, userName, source, dv, tml, converId, summarized, prid, templateid} = converData,
			userInfo = new UserInfo(),
			sessionInfo = {converid: converId, summarized, customerid: userId},
			members = new Map();

		members.set(userId, userInfo);

		userInfo.userId = userId;
		userInfo.chatStatus = ChatStatus.OFFLINE; //默认为离开会话
		userInfo.userName = userName;
		userInfo.userTrail = {source, tml, dv};
		userInfo.type = 1;

		if(this.curSeleced && this.curSeleced.userId !== userId)
		{
			this.curSeleced.selected = false;
		}

		this.curSeleced = converData;
		this.curSeleced.selected = true;

		sendT2DEvent({
			listen: SessionEvent.REQUEST_CHAT,
			params: [userId, converId, 2, sessionInfo, members, templateid] //干系人ID, 会话ID, type会话类型
		});

		this.setState({
			currentIndex: index
		})
	}

	_requestDestroyConverList(page = 1)
	{
		console.log("_requestDestroyConverList loading = ", this.loading);
		if(this.loading)
			return;
		
		this.loading = true;
		this.props.getPendingConvers(this.rp, page);

		clearTimeout(this.timeoutId);

		this.timeoutId = setTimeout(() => this.loading = false, 3000);
	}

	onWheel(e)
	{
		if(this.refs["scroll"])
		{
			if(this.refs["scroll"].isTop() && e.deltaY < 0)
			{
				this._requestDestroyConverList();
			}
			else if(this.refs["scroll"].isBottom() && e.deltaY > 0)
			{
				let {pendingConvers = [], pagenumbers = 1} = this.props,
					//len = pendingConvers.size,
					page = pagenumbers + 1;
					//page = parseInt(len / this.rp) + 1;

				this._requestDestroyConverList(page);
			}
		}
	}

	render()
	{
		return (
			<div className="pendingWrap" onWheel={this.onWheel.bind(this)}>
				<IndexScrollArea ref="scroll" speed={1} smoothScrolling>
					{
						this.getPendingConverComp()
					}
				</IndexScrollArea>
			</div>

		);
	}
}

function mapStateToProps(state)
{
	let {pendingConvers} = state;

	return {
		pendingConvers: pendingConvers.get("list"),
		pagenumbers: pendingConvers.get("pagenumbers"),
		curConver: pendingConvers.get("curConver")
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getPendingConvers, chatDataChanged, hasConver}, dispatch);
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("PendingConverView", info, log);
}

export default connect(mapStateToProps, mapDispatchToProps)(PendingConverView);
