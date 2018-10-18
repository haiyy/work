import React from "react";
import { Menu } from 'antd';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import LogUtil from "../../../lib/utils/LogUtil";
import { refreshColleagueConver } from "../redux/reducers/colleagueConverReducer";
import ColleagueConverListProxy from "../../../model/proxy/ColleagueConverListProxy";
import Model from "../../../utils/Model";
import { Map as immutable_Map, fromJS } from "immutable";
import { getLangTxt, getSourceForDevice, getSourceUrl, sendT2DEvent } from "../../../utils/MyUtil";
import SessionEvent from "../../event/SessionEvent";
import UserInfo from "../../../model/vo/UserInfo";
import { chatIsClose, getUserName } from "../../../utils/ConverUtils";
import ChatStatus from "../../../model/vo/ChatStatus";
import IndexScrollArea from "../../../components/IndexScrollArea";

const SubMenu = Menu.SubMenu;

const INTERVAL_TIME = 30 * 1000;  //每隔30s刷新数据

class ColleagueConverView extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this._expandedMap = immutable_Map();
		this._proxy;
		
		this.state = {
			expandedKeys: []
		};
		
		this._lastUpdateTime = -1;
	}
	
	componentDidMount()
	{
		this._getData();
	}
	
	get _proxy()
	{
		if(!this.__proxy)
			this.__proxy = Model.retrieveProxy(ColleagueConverListProxy.NAME);
		
		return this.__proxy;
	}
	
	_intervalId = -1;
	
	_refreshColleagueConver()
	{
		if(this._intervalId <= -1)
		{
			this._intervalId = setInterval(this._getData.bind(this), INTERVAL_TIME);
		}
	}
	
	_getData()
	{
		this._lastUpdateTime = new Date().getTime();
		this.props.refreshColleagueConver(this._lastUpdateTime);
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(nextProps.isActive && !this.props.isActive)
		{
			clearInterval(this._intervalId);
			this._intervalId = -1;
			
			this._getData();
			
			this._refreshColleagueConver();
		}
	}
	
	//生成组节点
	loop(data, level = 0)
	{
		let nextLevel = level++,
			marginLeft = this.levelJudgeMarginLeft(nextLevel);
		
		return data.map(
			item => {
				let children = item.get("children") || fromJS([]),
					groupId = item.get("groupId"),
					value;
				
				let users = this._proxy.getUserByGroupId(groupId) || fromJS([]),
					leafs = [];
				
				value = `[${users.size}]`;
				
				if(children.size <= 0)
				{
					leafs = this.loopUser(groupId, users, level);
				}
				else if(users.size <= 0)
				{
					leafs = this.loop(children, nextLevel);
					value = "";
				}
				else
				{
					leafs = this.loop(children)
					.concat(this.loopUser(groupId, users));
				}
				
				return <SubMenu key={groupId}
				                title={<span className="titleWrapper">
                            <img src={require('../../../public/images/chatPage/colleague_' + nextLevel + '.png')}/>
                            <span style={{marginLeft: marginLeft}}>
                                {item.get("groupName") + ` ${value}`}
                            </span>
                        </span>}>
					{
						leafs
					}
				</SubMenu>;
			}
		);
	}
	
	getVisitorSource(source, tml)
	{
		source = getSourceForDevice(source, tml);
		
		/*if(source.toLowerCase() === 'icon-weibo' || source.toLowerCase() === 'icon-weibowap')
			return <img src={require('../../../public/images/chatPage/' + source.toLowerCase()
			.slice(5) + '.png')} style={{marginTop: '6px'}}/>;*/
		
		return <i className={"iconfont " + source.toLowerCase()}/>;
		
	}
	
	//生成成员节点
	loopUser(groupId, users, level = 0)
	{
		if(this.state.expandedKeys.includes(groupId))
		{
			if(users.size <= 0)
				return <Menu.Item disabled>无会话</Menu.Item>;
			
			return users.map(userInfo => {
				let convers = userInfo.get("conversations"),
					nickname = userInfo.get("nickname"),
					showname = userInfo.get("showname"),
					marginLeft = this.levelJudgeMarginLeft(level);
				
				let title = getUserName(nickname, showname) + ` [${convers.size}]`;
				if(convers && convers.size > 0)
				{
					return <SubMenu
						title={<span className="titleWrapper">
                            <img src={require('../../../public/images/chatPage/colleague_' + 2 + '.png')}/>
                            <span style={{marginLeft: marginLeft}}>{title}</span>
                        </span>} key={userInfo.get("userId")}>
						{
							convers.map(converInfo => {
								let infoObj = converInfo.toObject(),
									name = converInfo.get("name"),
									tml = converInfo.get("tml"),
									source = converInfo.get("source");
								
								name = name ? name : converInfo.get("customerId");
								
								return <Menu.Item key={converInfo.get("converId")} {...infoObj}>
                                    <span className="titleWrapper personalTitleWrapper">
	                                    {
		                                    this.getVisitorSource(source, tml)
	                                    }
	                                    <span className="personalTitle">{name}</span>
                                    </span>
								</Menu.Item>;
							})
						}
					</SubMenu>;
				}
				
				return <SubMenu
					title={<span className="titleWrapper">
                        <img src={require('../../../public/images/chatPage/colleague_' + level + '.png')}/>
                        <span style={{marginLeft: marginLeft}}>{title + " [0]"}</span>
				    </span>} key={userInfo.get("userId")}>
					<Menu.Item disabled>{getLangTxt("noData4")}</Menu.Item>
				</SubMenu>;
			});
		}
		
		return <Menu.Item disabled>{getLangTxt("noData4")}</Menu.Item>;
	}
	
	levelJudgeMarginLeft(level)
	{
		if(level == 0)
		{
			return 14;
		}
		else if(level == 1 || level == 3)
		{
			return 11;
		}
		else if(level == 2)
		{
			return 6;
		}
		
		return 10;
	}
	
	_onExpand(expandedKeys)
	{
		this.setState({expandedKeys});
	}
	
	_onSelect({key, item})
	{
	
	}
	
	get colConverList()
	{
		if(!this._colConverList)
		{
			this._colConverList = Model.retrieveProxy(ColleagueConverListProxy.NAME);
		}
		
		return this._colConverList;
	}
	
	get _groups()
	{
		return this.colConverList.getGroups() || [];
	}
	
	onClick({item, key})
	{
		if(!item)
			return;
		
		let {converId: converid, customerId: userid, name: nickname} = item.props;
		
		if(key && converid)
		{
			let membersMap = new Map();
			
			membersMap.set(userid, new UserInfo({nickname, userid}));
			
			//以监控身份进入会话
			sendT2DEvent({
				listen: SessionEvent.REQUEST_JOIN_CHAT, params: [userid, membersMap, converid, null, true, 1]
			});
		}
	}
	
	_colleagueCoverScroll(value)
	{       //滚动条复位
		if(!value.topPosition)
		{
			value.topPosition = 0;
		}
	}
	
	render()
	{
		log("ColleagueConver render...");
		
		if(this._groups.size <= 0)
			return null;
		
		return (
			<IndexScrollArea ref={node => this.scrollArea = node} style={{height: "100%"}} speed={1} smoothScrolling
			                 onScroll={this._colleagueCoverScroll.bind(this)}>
				<Menu mode="inline" onOpenChange={this._onExpand.bind(this)} className="ColleagueConverMenu"
				      onClick={this.onClick.bind(this)} onSelect={this._onSelect.bind(this)}>
					{
						this.loop(this._groups)
					}
				</Menu>
			</IndexScrollArea>
		);
	}
	
}

function mapStateToProps(state)
{
	const {colleagueConverReducer: {updateTime}} = state;
	return {updateTime};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({refreshColleagueConver}, dispatch);
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("ColleagueConverView", info, log);
}

export default connect(mapStateToProps, mapDispatchToProps)(ColleagueConverView);
