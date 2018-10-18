import React from 'react';
import { Button, Popover } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import './style/phonePlayScreen.less';
import { getPhoneScreenRecord, playScreenClearData, getPlayScreenWaitNumber } from '../redux/reducers/phonePlayScreenReducer';
import { phoneCallChange, setscreenFlag } from "../redux/reducers/telephonyScreenReducer";
import { formatTimestamp, loginUserProxy } from "../../../utils/MyUtil";

class PhonePlayScreen extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		this.state = {};
		
		this.clearData = this.clearData.bind(this);
		this.getWaitContent = this.getWaitContent.bind(this);
	}
	
	componentDidMount()
	{
		this.props.getPlayScreenWaitNumber();
	}

	shouldComponentUpdate(nextProps) {
		let setting = nextProps.setting;
		if (!this.interval&&setting&&setting.includes("callcenter_call_records_check")) {
			//间隔30s获取排队人数
			this.interval = setInterval(() => {
				this.props.getPlayScreenWaitNumber();
			}, 5000);
		}
		return true;
	}
	
	componentWillUnmount()
	{
		if(this.interval)
		{
			clearInterval(this.interval);
		}
	}
	
	onClick(data)
	{
		this.props.phoneCallChange(data);
		this.props.setscreenFlag(true);
	}
	
	//清除数据
	clearData()
	{
		this.props.playScreenClearData();
	}

	//获取排队信息
	getWaitContent() {
		let waitNumber = this.props.waitNumber;
		if (waitNumber.list && waitNumber.list.length > 0) {
			let content = waitNumber.list.map((item)=>(<li><span>{item.templateName}</span><span style={{marginLeft:20}}>{item.lineupNumber}</span></li>));
			content = (<ul>{content}</ul>);
			return (<div className="titleList">
						<p><i/>当前排队人数</p>
						<Popover placement="right" content={content} trigger="hover">
							<p style={{cursor:"pointer"}}>{waitNumber && waitNumber.count ? waitNumber.count : 0}人</p>
						</Popover>
					</div>);
		} else {
			return (<div className="titleList">
						<p><i/>当前排队人数</p>
						<p>{waitNumber && waitNumber.count ? waitNumber.count : 0}人</p>
					</div>);
		}
	}
	
	render()
	{
		let {playScreenList, setting} = this.props;
		let userId = loginUserProxy().userId;
		playScreenList = (typeof playScreenList == "string") ? JSON.parse(playScreenList) : playScreenList;
		playScreenList = playScreenList[userId] || [];
		
		return (
			<div className="phonePlayScreen">
			{ setting&&setting.includes("callcenter_call_records_check") ?
					this.getWaitContent() : null }
				<div className="titleList">
					<p><i/>最近弹屏</p>
					<Button className="clear" onClick={this.clearData}>清除</Button>
				</div>
				<ul className="dataList">
					{
						playScreenList
						.map((record) => (<li onClick={this.onClick.bind(this, record)}>
							<p>{record.phonenumber}</p>
							<p>{formatTimestamp(record.dateTime, true, true)}</p>
						</li>))
					}
				</ul>
			</div>
		);
	}
}

function mapStateToProps(state)
{
	let {phonePlayScreenReducer} = state;
	
	return {
		playScreenList: phonePlayScreenReducer.get("playScreenList") || {},
		waitNumber: phonePlayScreenReducer.get("playScreenWaitNumer") || {}
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getPhoneScreenRecord, playScreenClearData, phoneCallChange, setscreenFlag, getPlayScreenWaitNumber
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PhonePlayScreen);
