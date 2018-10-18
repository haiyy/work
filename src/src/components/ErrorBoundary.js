import React from 'react';
import { getLangTxt } from "../utils/MyUtil";

class ErrorBoundary extends React.Component {
	
	constructor(props)
	{
		super(props);
		this.state = {hasError: false};
	}
	
	componentDidCatch(error, info)
	{
		this.setState({hasError: true});
	}
	
	render()
	{
		if(this.state.hasError)
		{
			return <div className="systemErrorBox">
				<div className="systemError">
					<img src={require("../public/images/error_page.png")}/>
					<p className="systemErrorTips">{getLangTxt("20035")}</p>
				</div>
			</div>;
		}
		
		return this.props.children;
	}
}

export default ErrorBoundary;