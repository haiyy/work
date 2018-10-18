import React from 'react'
import { Switch, Radio, Button, Input, Form, Table, Checkbox, Tabs, message } from 'antd';
import ScrollArea from 'react-scrollbar';
import './style/leaveMessage.scss';
import { getLeaveMessage, editLeaveMessage } from './leaveMessageAction';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";

const RadioGroup = Radio.Group, FormItem = Form.Item, TabPane = Tabs.TabPane;

class LeaveMessage extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
			open: 1,
			noticeContent: null,
			typeSetting: false,
			editOrderRank: "",
			isUpdate: false,
			isWarned: false

		};
		this.leaveMsgData = {};
	}

	componentDidMount()
	{
		this.props.getLeaveMessage();
	}

	ifOpenChange(check)
	{
		let openCheck = check ? 1 : 0,
			obj = {useable: openCheck};

		Object.assign(this.leaveMsgData, obj);
		this.setState({isUpdate: !this.state.isUpdate, isWarned: false})
	}

	handleClickTypeSetting(type, check)
	{
		let planCheck = check && type == 1 || !check && type == 2 ? 1 : 2,
			obj = {plan: planCheck};

		this.setState({typeSetting: !this.state.typeSetting, isWarned: false});
		Object.assign(this.leaveMsgData, obj);
	}

	onNoticeChange(check)
	{
		let noticeCheck = check ? 1 : 0,
			obj = {isNotice: noticeCheck};

		Object.assign(this.leaveMsgData, obj);
		this.setState({isWarned: false})
	}

	getNoticeText(e)
	{
		let adText = e.target.value,
			obj = {noticeContent: adText};
		this.setState({
			noticeContent: adText.length,
			isWarned: false
		});
		Object.assign(this.leaveMsgData, obj);
	}

	getOrderRank(rankName)
	{
		this.setState({editOrderRankName: rankName})
	}

	getOrderRankData(name, e)
	{
	}

	isRequiredChange(text, e)
	{
		text.isRequired = e.target.checked ? 1 : 0;
		this.setState({isWarned: false, isUpdate: !this.state.isUpdate})
	}

	iShowChange(text, e)
	{
		let {params = []} = this.leaveMsgData;
		text.show = e.target.checked ? 1 : 0;
		!e.target.checked ? text.isRequired = 0 : null;

		let isHaveShowItem = params.find(item => item.show === 1),
			paramsData = {params: params};

		if(isHaveShowItem)
		{
			let obj = {useable: 1};

			Object.assign(this.leaveMsgData, obj);
		}
		else
		{
			let obj = {useable: 0};

			Object.assign(this.leaveMsgData, obj);
		}

		this.setState({isWarned: false, isUpdate: !this.state.isUpdate});
		Object.assign(this.leaveMsgData, paramsData);
	}

	getUrlData(e)
	{
		let urlData = e.target.value,
			obj = {url: urlData};

		Object.assign(this.leaveMsgData, obj);
	}

	onOpenTypeChange(e)
	{
		let openType = e.target.value,

			obj = {open_type: openType};
		Object.assign(this.leaveMsgData, obj);
	}

	saveEditData(params, plan, useable)
	{
		let isHaveShowItem = params.find(item => item.show === 1);
		this.props.form.validateFields((errors) => {
			if(errors)
				return false;
			if(useable === 1 && plan === 1 && isHaveShowItem || useable !== 1 || plan !== 1)
			{
				this.props.editLeaveMessage(this.leaveMsgData);

			}
			else if(useable === 1 && plan === 1 && !isHaveShowItem && !this.state.isWarned)
			{
				message.error(getLangTxt("setting_msgset_note1"));
				this.setState({isWarned: true})
			}
		})
	}

	reFreshFn()
	{
		this.props.getLeaveMessage();
	}

	//验证URL地址
	judgeUrl(rule, value, callback)
	{
		let {data = {plan: 0}} = this.props,
			{plan} = data;
		let reUrl01 = /^((ht|f)tps?):\/\/([\w-]+(\.[\w-]+)*\/?)+(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?$/;
		if(plan !== 2 || value && reUrl01.test(value) && value.length <= 500)
		{
			callback();
		}
		callback(getLangTxt("setting_msgset_specify_link"));
	}

	render()
	{
		let {
				data = {
					useable: 0, plan: 0, isNotice: 0, noticeContent: "", params: [], url: "", open_type: 0
				}, progress
			} = this.props,
			{useable, plan, isNotice = 0, noticeContent = "", params = [], url = "", open_type = 0} = data;

		let noticeConLength = this.state.noticeContent || noticeContent.length;

		const {getFieldDecorator} = this.props.form,
			formItemLayout = {
				labelCol: {span: 3},
				wrapperCol: {span: 12}
			},
			columns = [{
				title: getLangTxt("setting_msgset_fieldname"),
				dataIndex: 'title',
				className: 'name'
			}, {
				title: getLangTxt("setting_msgset_required_title"),
				render: text =>
					<Checkbox onChange={this.isRequiredChange.bind(this, text)} checked={text.isRequired == 1}
					          disabled={text.show === 0}>
						{getLangTxt("setting_msgset_required")}
					</Checkbox>

			}, {
				title: getLangTxt("setting_msgset_show_title"),
				render: text =>
					<Checkbox onChange={this.iShowChange.bind(this, text)} checked={text.show == 1}>
						{getLangTxt("setting_msgset_show")}
					</Checkbox>

			}],
			system = <div className="system">
				<div className="noticeWrapper">
					<span className="leave-title">{getLangTxt("notice")}</span>
					<Switch defaultChecked={isNotice == 1} onChange={this.onNoticeChange.bind(this)}/>
					<div className="textareaBox">
						<Form>
							<FormItem help={noticeConLength + "/500"}>
								{getFieldDecorator('noticeContent', {
									initialValue: noticeContent,
									rules: [{
										max: 500,
										required: plan == 1
									}]
								})(
									<Input type="textarea" onKeyUp={this.getNoticeText.bind(this)} rows={4}
									       style={{resize: 'none', wordBreak: 'break-all'}}/>
								)}
							</FormItem>
						</Form>
					</div>
				</div>

				<Table columns={columns} dataSource={params} pagination={false} size="middle"/>
			</div>,
			customize = <div className="customize">
				<Form>
					<FormItem {...formItemLayout} label={getLangTxt("setting_msgset_specify_link")}>
						{getFieldDecorator('Link', {
							initialValue: url,
							rules: [{validator: this.judgeUrl.bind(this)}]
						})(
							<Input onKeyUp={this.getUrlData.bind(this)} style={{width: '276px'}}/>
						)}
					</FormItem>

					<FormItem {...formItemLayout} label={getLangTxt("setting_msgset_open_mode")}
					          help={getLangTxt("setting_msgset_note2")}>
						{
							getFieldDecorator('Radio', {
								initialValue: open_type
							})(
								<RadioGroup onChange={this.onOpenTypeChange.bind(this)}>
									<Radio key="c" value={1}>{getLangTxt("setting_msgset_open_inner")}</Radio>
									<Radio key="d" value={0}>{getLangTxt("setting_msgset_open_exter")}</Radio>
								</RadioGroup>
							)
						}
					</FormItem>
				</Form>
			</div>, main = plan == 1 ? system : customize;

		this.leaveMsgData = data;

		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		return (
			<div className="message leaveMessageWrap">

				<Tabs defaultActiveKey="1">

					<TabPane tab={<span>{getLangTxt("setting_msgset")}</span>} key="1">
						<ScrollArea
							speed={1}
							horizontal={false}
							className="leaveMsgScrollArea">
							<div className="top">
								<div>
									<span className="leave-title">{getLangTxt("setting_msgset_on")}</span>
									<Switch checked={useable == 1} onChange={this.ifOpenChange.bind(this)}
									        style={{margin: '12px 20px'}}/>
								</div>
								<div>
									<span className="leave-title">{getLangTxt("setting_msgset_scheme_default")}</span>
									<Switch checked={plan == 1} defaultChecked={plan == 1}
									        onChange={this.handleClickTypeSetting.bind(this, 1)}/>
									<span className="leave-title"
									      style={{width: "5%"}}>{getLangTxt("setting_msgset_scheme_custom")}</span>
									<Switch checked={plan == 2} defaultChecked={plan == 2}
									        onChange={this.handleClickTypeSetting.bind(this, 2)}/>
								</div>
							</div>

							<div className="main">{main}</div>
						</ScrollArea>
					</TabPane>

					{/*<TabPane tab={<span>留言回复签名</span>} key="2">
                        Tab 2
                    </TabPane>*/}

				</Tabs>


				<div className="company-footer">
					<Button className="primary" type="primary"
					        onClick={this.saveEditData.bind(this, params, plan, useable)}>{getLangTxt("save")}</Button>
				</div>

				{
					_getProgressComp(progress, "submitStatus")
				}
			</div>
		)
	}
}

LeaveMessage = Form.create()(LeaveMessage);

function mapStateToProps(state)
{
	return {
		data: state.leaveMessageData.data || {},
		progress: state.leaveMessageData.progress
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getLeaveMessage, editLeaveMessage}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LeaveMessage);
