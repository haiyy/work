import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Menu } from 'antd'
import { Link } from 'react-router-dom'
import { getMainNavDataComplete } from "../../reducers/startUpLoadReduce";
import { getLangTxt, getWorkUrl, zeroFillTo2 } from "../../utils/MyUtil";
import { version, website } from '../../../package.json';
import moment from "moment";

class MainNav extends React.PureComponent {
	
	timer = -1;
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			nowWeek: "",
			nowTime: "",
			nowDate: ""
		};
		
		this.widthArr = ["101px", "205px", "309px"];
	}
	
	// shouldComponentUpdate(nextProps)
	// {
	// 	return nextProps.visible;
	// }
	
	_getNowDate()
	{
		if(!this.props.visible)
			return;
		
		let date = moment();
		
		this.setState({
			nowWeek: date.format("dddd"),
			nowTime: date.format("HH:mm:ss"),
			nowDate: date.format("DD/MM/YYYY")
		});
	}
	
	componentDidMount()
	{
		this._getNowDate();
		this.timer = setInterval(this._getNowDate.bind(this), 1000);
	}
	
	componentWillUnmount()
	{
		clearInterval(this.timer);
	}
	
	getIconComp(value)
	{
		if(value.indexOf("http") > -1)
			return <img src={value}/>;
		
		let name = "iconfont " + value;
		
		return <i className={name}/>
	}
	
	onClick()
	{
		if(typeof this.props.callBack === "function")
		{
			this.props.callBack();
		}
	}
	
	render()
	{
		let mainNavData = this.props.mainNavData;
		
		return (
			<aside className="ant-layout-sider main-nav">
				
				<Menu mode="inline" theme="dark" defaultSelectedKeys={['tags']} onClick={this.onClick.bind(this)}>
					{
						Array.isArray(mainNavData) ? mainNavData.map((item, index) => {
							let pathname = item.action,
								query = {};
							
							if(pathname && pathname.indexOf("http") > -1)
							{
								//let pr = Type === 1 ? "/:" + index : "";
								pathname = "/friends/:" + index;
								query = {action: getWorkUrl(item.action)};
							}
							
							return (
								<Menu.Item key={index} style={{'width': this.widthArr[item.across - 1]}}>
									<Link to={{pathname, query}}>
										{
											this.getIconComp(item.icon)
										}
										<span className="nav-text">
											{item.title}
                                        </span>
									</Link>
									<span/>
								</Menu.Item>
							)
						}) : null
					}
				</Menu>
				{
					/*<div className='ant-layout-name'>{website}</div>*/
				}
				<div className='ant-layout-time'>
					<p className='week'>{this.state.nowWeek}</p>
					<p className='time'>{this.state.nowTime}</p>
					<p className='date'>{this.state.nowDate}</p>
					<p>{getLangTxt("version") + version}</p>
				</div>
			
			</aside>
		)
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

export default connect(mapStateToProps, mapDispatchToProps)(MainNav);
