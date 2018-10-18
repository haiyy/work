import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import RecordDetailHead from './RecordDetailHead';
import '../../../public/styles/enterpriseSetting/pendingDetailRecord.scss';
import ContentList from './ContentList';
import RecordInfomation from './RecordInfomation';
import { Tabs, Button, Form } from 'antd';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { setPageRoute, getLeaveDetail, submitDealRecord, getLeaveMsgList } from "../../../apps/record/redux/leaveMsgReducer";
import { loginUserProxy, getProgressComp, getSourceForDevice } from "../../../utils/MyUtil";

const TabPane = Tabs.TabPane;
const FormItem = Form.Item,
	tabs = [{tab: "短信", key: "1", fieldName: "message"}, {tab: "邮件", key: "2", fieldName: "email"}, {tab: "其他", key: "3", fieldName: "other"}];

class PendingDetailRecord extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
			tabsNum: "1",
			messageInputValue: '',
			sendPromptText: ''
		};

		this.terminalMap = {
			0: "Others", 1: "web", 2: "wechat", 3: "wap", 4: "IOS App", 5: "Android App", 6: "weibo", 7: "AliPay"
		};

		this.tabsChangeClick(1);
	}

	componentWillReceiveProps(nextProps)
	{
		if(nextProps.leaveMsgData !== this.props.leaveMsgData)
		{
			this.tabs = null;
		}
		this.tabsChangeClick(this.state.tabsNum);
	}

	backClick()
	{
		this.props.setPageRoute('main');
	}

	getTabs(leaveMessage, iptLen)
	{
		if(this.tabs)
			return this.tabs;

		let ts = [];

		let {phone, email} = leaveMessage;

		if(phone)
		{
			ts.push(tabs[0]);
		}

		if(email)
		{
			ts.push(tabs[1]);
		}

		ts.push(tabs[2]);

		const {getFieldDecorator} = this.props.form;

		//this.state.tabsNum = ts[0].key;

		this.tabsChangeClick(ts[0].key);

		return ts.map(value => this.getTabPane(value.tab, value.key, getFieldDecorator, iptLen, value.fieldName));
	}

	tabsChangeClick(num)
	{
		let tabsNum = num;

		this.setState({tabsNum: tabsNum})
	}

	sendButtonClick()
	{
		if(this.state.messageInputValue)
		{
			let recordDetail = this.recordDetail;

			if(!recordDetail || !recordDetail.leaveMessage)
				return;

			let {guestid, id} = recordDetail.leaveMessage,
				userId = loginUserProxy().userId,
				tabsNum = this.state.tabsNum;

			this.props.submitDealRecord(id, guestid, this.state.messageInputValue, tabsNum, userId);

			this.setState({
				messageInputValue: ''
			});
			this.props.form.setFieldsValue({"message": "", "email": "", "other": ""});
		}
	}

	messageAreaChange(fieldName, event)
	{
        let messageInputValue = event.target.value;

        this.setState({
			messageInputValue
		});

		this.props.form.setFieldsValue({
			[fieldName]: messageInputValue
		});
	}

	get recordDetail()
	{
		return this.getData("data") || {};
	}

	get progress()
	{
		return this.getData("progress");
	}

	get message()
	{
		return this.getData("message");
	}

	get search()
	{
		return this.getData("search");
	}

	get pageRoute()
	{
		let {leaveMsgData} = this.props;

		return leaveMsgData.getIn(["pageRoute"]);
	}

	get currentPage()
	{
		let {leaveMsgData} = this.props;

		return leaveMsgData.getIn(["leavePendingMsg", "currentPage"]);
	}

	get extra()
	{
		return this.getData("extra") || {};
	}

	getData(key2)
	{
		let {leaveMsgData} = this.props;

		return leaveMsgData.getIn(["leaveDetail", key2]);
	}

	reFreshFn()
	{
		let params = this.search;

		if(Array.isArray(params))
			this.props.getLeaveDetail(params[0], params[1]);
	}

	getTabPane(tab, key, getFieldDecorator, iptLen, fieldName)
	{
		return (
			<TabPane tab={tab} key={key}>
				<FormItem/* help={this.state.messageInputValue.length + "/70"}*/>
					{
						getFieldDecorator(fieldName, {
							rules: [{max: 70}]
						})(
                            <textarea autoFocus="autofocus" onChange={this.messageAreaChange.bind(this, fieldName)}
						             type="text" className="TabPaneContent"/>
                        )
					}
				</FormItem>
			</TabPane>
		)
	}

	componentDidMount()
	{
		if(this.pageRoute != 'record_detail')
			this.props.setPageRoute('main');
	}

	render()
	{
		let {leaveDeal} = this.props,
			leaveMessage = this.recordDetail.leaveMessage || {},
			{guestname: username, terminal, source} = leaveMessage,
			progress = this.progress,
			message = this.message,
			url = getSourceForDevice(source, this.terminalMap[terminal]),
			isSend = progress == LoadProgressConst.SAVING_SUCCESS || this.state.messageInputValue.length > 70
				|| this.state.messageInputValue === '',
            iptLen = this.state.messageInputValue.length;
		/*是否可以发送的条件*/

		this.tabs = this.getTabs(leaveMessage, iptLen);

		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		return (
			<div className="pendingDetailRecord">
				<RecordDetailHead username={username || ''} url={url} backCilck={this.backClick.bind(this)}/>

				<div className="content">

					<div className="left">
						<div className="topContianer">
							<ContentList data={this.recordDetail} type="pendingDetail"/>
						</div>

						{
							leaveDeal ?
								<div className="bottomContainer">
									<div className="dealLeaveMessage"> 处理留言</div>
									<Form>
										<div className="tabContainer">
											<Tabs onChange={this.tabsChangeClick.bind(this)}/* defaultActiveKey="1"*/ type="card" activeKey={this.state.tabsNum}
											      animated={false}>
												{
													this.getTabs(leaveMessage, iptLen)
												}
											</Tabs>
										</div>
									</Form>

									<div className="sendButtonContainer">
										<div className="sendButtonContainerTip"
										     style={progress == LoadProgressConst.SAVING_FAILED ? {color: '#f50'} : {color: '#87d068'}}>
											{message || ''}
										</div>
										<div className="sendButtonRight">
											<Button disabled={isSend} type={isSend ? "default" : "primary"}
											        onClick={this.sendButtonClick.bind(this)}>
												发送
											</Button>
										</div>
									</div>
								</div>
								: null
						}
					</div>

					<div className="right">
						<div className="leaveMessageStyle"> 留言信息</div>
						<div className="leaveMessageContainer">
							<RecordInfomation data={this.recordDetail}/>
						</div>
					</div>

				</div>

				{
					getProgressComp(progress)
				}
			</div>
		);
	}
}

PendingDetailRecord = Form.create()(PendingDetailRecord);

function mapStateToProps(state)
{
	let {leaveMsgReducer: leaveMsgData, startUpData} = state,
		recordFunc = startUpData.get("record") || {},
		{leaveDeal} = recordFunc;

	return {leaveMsgData, leaveDeal};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		setPageRoute, getLeaveDetail, submitDealRecord, getLeaveMsgList
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PendingDetailRecord);
