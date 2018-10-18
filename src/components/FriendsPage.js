import React from "react"
import NTIFrame from "./NTIFrame";
import { reoperation } from "../utils/MyUtil";

class FriendsPage extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		this.onWindowResize = this.onWindowResize.bind(this);
		window.addEventListener('resize', this.onWindowResize);
		
		this.update =  reoperation(this.forceUpdate.bind(this), 300);
	}
	
	componentWillUnmount()
	{
		window.removeEventListener('resize', this.onWindowResize)
	}
	
	onWindowResize()
	{
		this.update();
	}
	
	render()
	{
		let main = document.getElementsByClassName("ant-layout-main"),
			app = main && main[0];
		
		let height = app.clientHeight,
			width = app.clientWidth;
		
		let url = this.props.location.query.action;
		
		return <NTIFrame src={url} style={{height, width}} container="ant-layout-main"/>;
	}
}

export default FriendsPage;
