import React from "react";
import { bindActionCreators } from "redux";
import { connect } from 'react-redux'
import { Tabs } from "antd";
import NtalkerTabBar from "./NtalkerTabBar";
import "../../../public/styles/chatpage/userTabs.scss";
import PendingConverView from "./PendingConverView";
import ColleagueConverView from "./ColleagueConverView";
import { getFuncSwitcherComplete } from "../../../reducers/startUpLoadReduce";
import Model from "../../../utils/Model";
import NtalkerListRedux from "../../../model/chat/NtalkerListRedux";
import { getLangTxt } from "../../../utils/MyUtil";

class UserTabs extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.tabs = ["myconsult", "pengding", "colleagueconvers"];
		
		this.state = {activeKey:"0"};
		
		Model.retrieveProxy(NtalkerListRedux.NAME).isActive = true;
	}
	
	getTabs()
	{
		let switcher = this.props.tabs || [];
		
		return this.tabs.filter(key => switcher.includes(key));
	}
	
	getTabPane(key, index)
	{
		switch(key)
		{
			case "myconsult":
				return (
					<TabPane tab={getLangTxt("myConsulting")} key="0" type="card">
						<NtalkerTabBar isActive={this.state.activeKey == index}/>
					</TabPane>
				);
			
			case "colleagueconvers":
				return (
					<TabPane tab={getLangTxt("colleagueConver")} key="2">
                        <ColleagueConverView isActive={this.state.activeKey == index}/>
					</TabPane>
				);
			
			case "pengding":
				return (
					<TabPane tab={getLangTxt("pending")} key="1">
						<PendingConverView isActive={this.state.activeKey == index}/>
					</TabPane>
				);
		}
		
		return null;
	}
	
	_onTabClick(key)
	{
		this.setState({activeKey: key});
	}
	
	render()
	{
		const {activeKey = "0"} = this.state;
		
		return (
			<div className="userTabs" style={{"height": "100%"}}>
				<div className="userTabsTop">
					<Tabs className="tabPaneStyle" activeKey={activeKey} size="small"
					      style={{"width": "100%", "height": "100%"}}
					      onTabClick={this._onTabClick.bind(this)}>
						{
							this.getTabs()
							.map((key, index) => this.getTabPane(key, index))
						}
					</Tabs>
				</div>
			</div>
		);
	}
}

const TabPane = Tabs.TabPane;

function mapStateToProps(state)
{
	let {startUpData} = state,
		tabs = startUpData.get("tabs") || [];
	
	return {tabs};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getFuncSwitcherComplete}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(UserTabs);
