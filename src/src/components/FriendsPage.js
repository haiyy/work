import React from "react"
import NTIFrame from "./NTIFrame";
import { get, getWorkUrl, reoperation } from "../utils/MyUtil";
import { Redirect } from "react-router-dom";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getQueryString } from "../utils/StringUtils";

class FriendsPage extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		this.onWindowResize = this.onWindowResize.bind(this);
		window.addEventListener('resize', this.onWindowResize);
		
		this.update = reoperation(this.forceUpdate.bind(this), 300);
	}
	
	componentWillUnmount()
	{
		window.removeEventListener('resize', this.onWindowResize)
	}
	
	onWindowResize()
	{
		this.update();
	}
	
	getUrl()
	{
		let url = get(["query", "action"], this.props.location);
		
		if(!url)
		{
			let mainNavData = this.props.mainNavData,
				{location = {}} = this.props,
				{search = "", route: route1} = location,
				query = getQueryString(search) || {},
				{route} = query,
				navData = Array.isArray(mainNavData) && mainNavData.find((item) => item.name === route || item.name === route1);
			
			if(navData)
			{
				let pathname = navData.action;
				if(pathname && pathname.indexOf("http") > -1)
				{
					
					return getWorkUrl(navData.action)
				}
			}
		}
		
		return url;
	}
	
	render()
	{
		let main = document.getElementsByClassName("ant-layout-main"),
			app = main && main[0];
		
		let height = app.clientHeight,
			width = app.clientWidth,
			url = this.getUrl();
		
		if(!url)
		{
			
			return <Redirect to="/"/>
		}
		
		return <NTIFrame src={url} style={{height, width}} container="ant-layout-main"/>;
	}
}

function mapStateToProps(state)
{
	const {
			startUpData
		} = state,
		mainNavData = startUpData.get("mainNavData") || [];
	
	return {mainNavData};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FriendsPage);
