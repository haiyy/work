import { urlLoader } from "../../../../../lib/utils/cFetch";
import { loginUserProxy } from "../../../../../utils/MyUtil";
import { sendSystemPromptSentence } from "../../../../../utils/ConverUtils";
import Settings from "../../../../../utils/Settings";
import React from "react";
import { Tooltip, Form, Input, DatePicker } from 'antd';
import LogUtil from "../../../../../lib/utils/LogUtil";
import "../../../../../public/styles/chatpage/send/blackList.scss";
import moment from 'moment';
import Modal from "../../../../../components/xn/modal/Modal";

const {TextArea} = Input,
	FormItem = Form.Item,
	dateFormat = 'YYYY-MM-DD HH:mm:ss';

class Blacklist extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {
			visible: false,
			signature_help: null,
            relieveTime: null
		};
	}

	_onBlacklist()
	{
		this.setState({visible: true});
	}

	//判断是否仅输入空格
	judgeSpace(rule, value, callback)
	{
		if(value && value.trim() !== "")
		{
			callback();
		}
		callback(" ");
	}

	handelSignatureValueFun({target: {value}})
	{
		let signature_help = value ? value.length : 0;

		this.setState({signature_help: signature_help + '/50'});
	}

    getRemoveTime(value)
    {
        this.setState({
            relieveTime: value.valueOf()
        })
    }
    range(start, end) {
        const result = [];
        for (let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
    }

    disabledDate(current) {
        let nowDate = moment().subtract(1, 'days');

        return current && current.isBefore(nowDate.endOf('day'));
    }

    disabledDateTime(data) {
        let nowHour = moment().get('hour'),
            nowMin = moment().get('minute'),
            currentYear = moment().get('year'),
            currentMonth = moment().get('month'),
            currentDate = moment().get('date'),
            selectYear = data&&data.get('year'),
            selectMonth = data&&data.get('month'),
            selectDate = data&&data.get('date');

        if (currentYear === selectYear && currentMonth === selectMonth && currentDate === selectDate)
            return {
                disabledHours: () => this.range(0, nowHour),
                disabledMinutes: () => this.range(0, nowMin)
            };
    }

	getModal()
	{
		if(this.state.visible)
		{
			const formItemLayout = {
					labelCol: {span: 6},
					wrapperCol: {span: 14}
				},
				{form} = this.props,
				{getFieldDecorator} = form,
				blackReasonCount = form.getFieldValue("reason") ? form.getFieldValue("reason").length : 0;

			let signature_help = this.state.signature_help || blackReasonCount + "/50";

			return (
				<Modal title="加入黑名单" visible onCancel={this.onCancel.bind(this)} onOk={this.onOk.bind(this)}
				         width={524} okText="确定" cancelText="取消" wrapClassName="blackListModal">
					<Form>
						<FormItem
							{...formItemLayout}
							className="blackReason"
							label="加黑理由"
							help={signature_help}
							hasFeedback>
							{getFieldDecorator('reason', {
								initialValue: "",
								rules: [{max: 50}, {validator: this.judgeSpace.bind(this)}]
							})(
								<Input className="blackReasonIpt" type="textarea"
								       onKeyUp={this.handelSignatureValueFun.bind(this)}/>
							)}
						</FormItem>
						<FormItem
							className="removeTime"
							{...formItemLayout}
							label="解除时间"
							hasFeedback>
							{
								getFieldDecorator('removeTime')(
									<DatePicker style={{width: '287px'}}
									            format={dateFormat}
									            showTime
                                                disabledDate={this.disabledDate.bind(this)}
                                                disabledTime={this.disabledDateTime.bind(this)}
                                                onChange={this.getRemoveTime.bind(this)}
									/>
								)
							}
						</FormItem>
					</Form>
				</Modal>
			);
		}

		return null;
	}

	onOk()
	{
		let {form} = this.props;

		form.validateFields((errors, values) => {
			if(errors)
				return false;

			let {relieveTime} = this.state,
                {item, chatDataVo} = this.props;

			if(!item || !chatDataVo || !chatDataVo.rosterUser || !chatDataVo.rosterUser.userId)
				return;

			let functions = item.get("function") || [];

			let url = Settings.getBlacklistUrl(),
				{ntoken, userId, siteId} = loginUserProxy(),
				blackenTime = new Date().getTime(),
				blackenReason = values.reason || "无",
				rosterUser = chatDataVo.rosterUser || {},
				ntid = rosterUser.userId,
				username = rosterUser.userInfo.userName;
			//userTrail = rosterUser.userInfo.userTrail || {}
			//, requestIP = userTrail.ip || ""

			/*
			* 工具栏黑名单是否显示：blacklist
			*	添加工具条黑名单:blacklist_toolbar_add
			*	解除工具条黑名单:blacklist_toolbar_relieve
			* */
			if(functions.includes("blacklist_toolbar_add"))
			{
				let body = {
					userid: userId, siteid: siteId, blackenTime, blackenReason, ntid, username, relieveTime
				};

				urlLoader(url, {method: "POST", headers: {token: ntoken}, body: JSON.stringify(body)})
				.then(({jsonResult}) => {
					let code = jsonResult.code,
						message;

					if(code === 200)
					{
						message = "成功";
					}
					else if(code === 402)
					{
						message = "重复";
					}
					else
					{
						message = "失败";
					}

					sendSystemPromptSentence(ntid, `黑名单添加${message}！`);
				});
			}
			else
			{
				log("_onBlacklist 沒有添加黑名單的權限");

				sendSystemPromptSentence(ntid, `您没有权限添加黑名单！`);
			}

			this.setState({visible: false});

			form.setFieldsValue({removeTime: null, reason: ""});
		})
	}

	onCancel()
	{
		this.setState({visible: false, signature_help: 0});
	}

	render()
	{
		return (
			<Tooltip placement="bottom" title={this.props.item.get("title")}
			         overlayStyle={{lineHeight: '0.16rem'}}
			         arrowPointAtCenter>
				<div {...this.props} onClick={this._onBlacklist.bind(this)}/>
				{
					this.getModal()
				}
			</Tooltip>
		);
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("Blacklist", info, log);
}

Blacklist = Form.create()(Blacklist);

export default Blacklist;
