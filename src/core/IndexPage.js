import React from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ChatPage from '../apps/chat/ChatPage'
import KpiPage from '../apps/kpi/view/KpiTabs'
import SettingTabs from "../apps/setting/enterprise/SettingTabs";
import RecordTabs from "../apps/record/RecordTabs";
import { getMainNavDataComplete } from "../reducers/startUpLoadReduce";
import LogUtil from "../lib/utils/LogUtil";
import FriendsPage from "../components/FriendsPage";
import { getWorkUrl } from "../utils/MyUtil";

class IndexPage extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.routes = {
			chats: ChatPage,
			kpi: KpiPage,
			chatrecord: RecordTabs,
			setting: SettingTabs,
			friends: FriendsPage,
		};
	}
	
	render()
	{
		try
		{
			let mainNavData = this.props.mainNavData,
				componentCls = ChatPage,
				query = {};
			
			if(Array.isArray(mainNavData) && mainNavData.length > 0)
			{
				let item = mainNavData[0];
				
				if(item)
				{
					componentCls = this.routes[item.name] || componentCls;
					
					if(item.name == "friends")
					{
						let pathname = item.action;
						
						if(pathname && pathname.indexOf("http") > -1)
						{
							query = {action: getWorkUrl(item.action)};
						}
					}
				}
			}
			
			return React.createElement(componentCls, {location: {query}});
		}
		catch(e)
		{
			LogUtil.trace("IndexPage", LogUtil.ERROR, "render stack = " + e.stack);
		}
		
		return null;
	}
}

function mapStateToProps(state)
{
	let {startUpData} = state,
		mainNavData = startUpData.get("mainNavData") || {};
	
	return {mainNavData};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getMainNavDataComplete}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
