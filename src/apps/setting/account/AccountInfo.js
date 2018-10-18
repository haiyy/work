import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getUserInfo, getUserSkillTag } from './accountAction/sessionLabel';
import { getRoleManager } from './rolemanager/roleAction/roleManger'
import { Tabs, Slider, Row, Col } from 'antd';
import { getLangTxt } from "../../../utils/MyUtil";

const TabPane = Tabs.TabPane;

class AccountInfo extends React.PureComponent {
	constructor(props)
	{
		super(props);
	}
	
	componentDidMount()
	{
		let userId = this.props.user || "",
			obj = {page: 1, rp: 1000};
		this.props.getRoleManager(obj);
		this.props.getUserInfo(userId);
		this.props.getUserSkillTag();
		
	}
	
	getGroupName(groupList, groupId)
	{
		let groupName = "";
		groupList.map(item => {
			if(item.groupid == groupId)
			{
				groupName = item.groupname;
				return groupName
			}
			if(item.children)
			{
				this.getGroupName(item.children, groupId);
				return groupName
			}
		});
	}
	
	getRoleName(selectedRole)
	{
		let roleName = [];
		selectedRole && selectedRole.map(item => {
			roleName.push(item.rolename);
		});
		
		if(roleName.length > 0)
			return roleName.join(",");
	}
	
	getTagName(selectedTag)
	{
		let tagName = [];
		selectedTag && selectedTag.map(item => {
			tagName.push(item.tagname);
		});
		if(tagName.length > 0)
			return tagName.join(",");
	}
	
	render()
	{
		let {state = {}, userSkillTag = [], groupData = [], roleList = []} = this.props,
			{expans = [], username = "", externalname = "", nickname = "", usertype = "", group = {groupname: ""}, role = [], tag = []} = state,
			groupname = group ? group.groupname : "",
			{attribute = {maxConversationNum: 2000, maxConcurrentConversationNum: 8}} = expans.length > 0 && expans[0],
			{maxConversationNum, maxConcurrentConversationNum} = attribute,
			roleName = this.getRoleName(role) || getLangTxt("noData3"),
			tagName = this.getTagName(tag) || getLangTxt("noData3");
		
		return (
			<div>
				<h4>{getLangTxt("setting_account_info")}</h4>
				
				<div className="message">
					<b>{getLangTxt("setting_account_usertype")}</b><span>{usertype == 0 ? getLangTxt("setting_account_manpower") : getLangTxt("setting_account_robot")}</span><br/>
					<b>{getLangTxt("setting_account_role")}</b><span>{roleName}</span><br/>
					<b>{getLangTxt("setting_account_group")}</b><span>{groupname ? groupname : getLangTxt("setting_account_no_group")}</span><br/>
					<b>{getLangTxt("setting_account_account")}</b><span>{username}</span><br/>
					<b>{getLangTxt("setting_account_extname")}</b><span>{externalname}</span><br/>
					<b>{getLangTxt("setting_account_innername")}</b><span>{nickname}</span><br/>
				</div>
				
				<Tabs defaultActiveKey="1">
					<TabPane tab={getLangTxt("setting_account_online")} key="1">
						<div>
							<Row>
								<Col span={1}><i className="icon-zhengque iconfont"/></Col>
								<Col span={3}><span>{getLangTxt("setting_account_reception_sametime_set")}</span></Col>
							</Row>
							<Row>
								<Col span={3}></Col>
								<Col span={2}>{getLangTxt("setting_account_max")}</Col>
								<Col span={6}><Slider value={maxConcurrentConversationNum} disabled={true}
								                      max={100}/></Col>
								<Col span={2}>{maxConcurrentConversationNum}</Col>
							</Row>
							{/*<Row>
                                <Col span={1}><i className="icon-zhengque iconfont"/></Col>
                                <Col span={5}><span>最大接待量<span style={{display:"inline-block",marginLeft: "15px"}}>{maxConversationNum == -1 ? "不限制" : maxConversationNum}</span></span></Col>
                            </Row>*/}
							<Row>
								<Col span={1}><i className="icon-zhengque iconfont"/></Col>
								<Col span={3}><span>{getLangTxt("setting_skill_tag")}</span></Col>
								<Col className="accountSkillTag" span={12}><span>{tagName}</span></Col>
							</Row>
						</div>
					</TabPane>
					{/*<TabPane tab="呼叫中心" key="2">Content of Tab Pane 2</TabPane>
                    <TabPane tab="工单" key="3">Content of Tab Pane 3</TabPane>*/}
				</Tabs>
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		state: state.getEditData.data || {},
		groupData: state.accountReducer.data || {},
		userSkillTag: state.getUserSkillTag.data,
		roleList: state.newRoleManger.roleList
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getUserInfo, getUserSkillTag, getRoleManager}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountInfo)
