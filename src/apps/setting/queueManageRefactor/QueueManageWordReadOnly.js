import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Form, Button, Input, Checkbox, Radio, Switch } from 'antd';
import './style/queueManage.scss';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import { getQueueWord, setQueueWord } from "./reducer/queueManageReducer";

const FormItem = Form.Item, RadioGroup = Radio.Group,
	queneArr1 = [
		{
			label: getLangTxt("setting_queue_option1"),
			value: "showNums",
			flg: "{$queue}"
		},
		{
			label: getLangTxt("setting_queue_option2"),
			value: "leaveMessage",
			flg: "{$leaveMessage}"
		},
		{
			label: getLangTxt("setting_queue_option3"),
			value: "giveupQueue",
			flg: "{$giveUp}"
		}];

class QueueManageWordReadOnly extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			arrWeb: null,
			arrWx: null,
			terminalValue: 1
		};
	}
	
	_queueConfig = [];
	webContent = {};
	wxContent = {};
	
	componentDidMount()
	{
		this.props.getQueueWord()
	}
	
	componentWillUnmount()
	{
		this._queueConfig = null;
		this.webContent = null;
		this.wxContent = null;
	}
	
	reFreshFn()
	{
		this.props.getQueueWord();
	}
	
	//将排队话术类型数据修改
	editQueueWordType(queueWordType)
	{
		if(this._queueConfig.length > 0)
		{
			this._queueConfig.forEach(item => {
				item.type = queueWordType;
			})
		}
		this.setState({isDefaultWord: !this.state.isDefaultWord})
	}
	
	//是否选择默认话术
	isDefaultWord(checked)
	{
		let queueWordType = checked ? 0 : 1;
		
		this.editQueueWordType(queueWordType)
		
	}
	
	render()
	{
		let {getFieldDecorator} = this.props.form,
			{queueMangeData} = this.props,
			progress = queueMangeData.getIn(["progress"]);
		
		this._queueConfig = queueMangeData.getIn(["queueWord"]);
		
		if(this._queueConfig.length > 0)
		{
			this.webContent = this._queueConfig.find(item => item.terminal === 1);
			this.wxContent = this._queueConfig.find(item => item.terminal === 2);
		}
		
		let {content = "", type} = this.webContent,
			{content: wxContent = ""} = this.wxContent,
			
			defaultWeb = queneArr1.filter(item => this.webContent[item.value] === 1)
			.map(item => item.value),
			
			defaultWX = queneArr1.filter(item => this.wxContent[item.value] === 1)
			.map(item => item.value),
			
			{terminalValue} = this.state,
			defaultWordClass = type === 0 ? "defaultWord" : "defaultWord disabledDefault";
		
		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
		
		return (
			<div className='queueManage queueWord'>
				<div className="queue-body">
					<div className='queue-body-right'>
						<Switch disabled={true} checked={type === 0}/>
						<span>{getLangTxt("setting_queue_default")}</span>
						<div className={defaultWordClass}>
							{getLangTxt("setting_queue_default_word")}
						</div>
						<Switch disabled={true} checked={type === 1}/>
						<span>{getLangTxt("setting_queue_custom")}</span>
						<Form>
							<RadioGroup disabled defaultValue={1}>
								<Radio.Button value={1}>web/wap/sdk</Radio.Button>
								<Radio.Button value={2}>{getLangTxt("setting_queue_weChat")}</Radio.Button>
							</RadioGroup>
							{
								terminalValue === 1 ?
									<div>
										<FormItem className="checkBoxStyle">
											{
												getFieldDecorator('CheckboxWeb', {
													initialValue: defaultWeb
												})(
													<Checkbox.Group disabled options={queneArr1}/>
												)
											}
										</FormItem>
										
										<FormItem>
											{
												getFieldDecorator('Signature', {
													initialValue: content
												})(
													<Input className="queueWordIptStyle" disabled type="textarea"/>
												)
											}
										</FormItem>
									</div>
									:
									<div>
										<FormItem className="checkBoxStyle">
											{
												getFieldDecorator('CheckboxWx', {
													initialValue: defaultWX
												})(
													<Checkbox.Group disabled options={queneArr1}/>
												)
											}
										</FormItem>
										
										<FormItem>
											{
												getFieldDecorator('text', {
													initialValue: wxContent
												})(
													<Input className="queueWordIptStyle" disabled type="textarea"/>
												)
											}
										</FormItem>
									</div>
							}
						</Form>
					</div>
				</div>
				<div className="queue-footer">
					<Button disabled className="primary" type="primary">确定</Button>
				</div>
				{
					_getProgressComp(progress, "submitStatus queueStatus")
				}
			</div>
		)
	}
}

QueueManageWordReadOnly = Form.create()(QueueManageWordReadOnly);

function mapStateToProps(state)
{
	return {
		queueMangeData: state.queueManageReducer
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getQueueWord, setQueueWord}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueManageWordReadOnly);
