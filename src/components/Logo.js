import React from 'react';
import '../public/styles/chatpage/logo/logo.scss';

class Logo extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
	}
	
	render()
	{
		let bmine = this.props.link === "self",
			link = bmine ? "UserLogo" : "VisitorLogo",
			url = this.props.url, style;

		if(!url)
		{
			url = bmine ? defaultCustomerLogo : defaultVisitorLogo;
		}

		if(url.indexOf("/") > -1) //url是链接（http 或者 路径地址）
		{
			style = {backgroundImage: 'url(' + url + ')'};
		}
		else  //iconfont
		{
			link = link + " iconfont " + url + " icon-online";
		}

		return (
			<div className="userVisitorLogo">
				<i style={style} className={link}/>
			</div>
		);

	}
}

const defaultVisitorLogo = "icon-input",
	defaultCustomerLogo = "icon-kefu";

export default Logo;