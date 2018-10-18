import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Steps, Button, Radio, Checkbox, InputNumber, Switch, Modal, message } from 'antd';
import './style/queueManage.scss';
import { addQueue, editQueue } from "./reducer/queueManageReducer";
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";

const Step = Steps.Step, RadioGroup = Radio.Group, CheckboxGroup = Checkbox.Group;

class DefineQueuePlan extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			checkedArray: []
		};
	}
	
	componentDidMount()
	{
		let {queueGroupData = {}} = this.props,
			checkedArray;
		
		if(queueGroupData.isBusy == 1 && queueGroupData.isOverflow == 1)
		{
			checkedArray = [0, 1]
		}
		else if(queueGroupData.isBusy == 1 && queueGroupData.isOverflow != 1)
		{
			checkedArray = [0]
		}
		else if(queueGroupData.isBusy != 1 && queueGroupData.isOverflow == 1)
		{
			checkedArray = [1]
		}
		else if(queueGroupData.isBusy != 1 && queueGroupData.isOverflow != 1)
		{
			checkedArray = []
		}
		
		this.setState({checkedArray})
		
	}
	
	//单选框选择进线方式 直接进线
	onInlineTypeChange(queueGroupData, checked)
	{
		let inlineType = checked ? 0 : 1;
		queueGroupData.inletType = inlineType;
		this.setState({isUpdate: !this.state.isUpdate, isWarned: false})
	}
	
	//单选框选择进线方式 排队
	onInlineTypeChange2(queueGroupData, checked)
	{
		let inlineType = checked ? 1 : 0;
		queueGroupData.inletType = inlineType;
		this.setState({isUpdate: !this.state.isUpdate, isWarned: false})
	}
	
	//排队时机选择
	onCheckBoxChange(queueGroupData, checkedArray)
	{
		if(checkedArray.length < 1)
		{
			queueGroupData.isBusy = 0;
			queueGroupData.isOverflow = 0;
			
		}
		else
		{
			let isBusyValue = checkedArray.find(item => item == 0),
				isOverflowValue = checkedArray.find(item => item == 1),
				isBusy = isBusyValue != undefined ? 1 : 0,
				isOverflow = isOverflowValue != undefined ? 1 : 0;
			
			queueGroupData.isBusy = isBusy;
			queueGroupData.isOverflow = isOverflow;
			Object.assign(queueGroupData, isBusy, isOverflow);
		}
		this.setState({checkedArray, isWarned: false})
	}
	
	//排队时机 客服同时接待量超过数
	onOverflowNumChange(queueGroupData, value)
	{
		queueGroupData.overflow = value;
	}
	
	//排队策略单选
	onRadioPlanChange(queueGroupData, e)
	{
		queueGroupData.strategyType = e.target.value;
		this.setState({isUpdate: !this.state.isUpdate, isWarned: false})
	}
	
	//进线优先级修改
	onPriorityNumChange(queueGroupData, value)
	{
		queueGroupData.inletPriority = value;
	}
	
	//获取数据保存失败弹框
	getSaveErrorModal(result)
	{
		
		if(result.success)
		{
			this.props.handleKillCreatePage();
		}
		else
		{
			let content = result.code === 404 ? result.msg : getLangTxt("20034");
			
			Modal.warning({
				title: getLangTxt("err_tip"),
				width: '320px',
				iconType: 'exclamation-circle',
				className: 'errorTip',
				okText: getLangTxt("sure"),
				content
			});
		}
	}
	
	//点击保存
	handleSave()
	{
		let {queueGroupData = {}, link} = this.props,
			{checkedArray = [], isWarned} = this.state;
		
		if(queueGroupData.inletType == 1 && checkedArray.length <= 0)
		{
			if(!isWarned)
				message.error(getLangTxt("setting_queue_note3"));
			this.setState({isWarned: true});
			return;
		}
		
		if(link == "new")
		{
			this.props.addQueue(queueGroupData)
			.then(result => {
				this.getSaveErrorModal(result);
			})
		}
		else
		{
			this.props.editQueue(queueGroupData)
			.then(result => {
				this.getSaveErrorModal(result);
			})
		}
	}
	
	//点击取消
	handleCancel()
	{
		this.props.handleKillCreatePage();
	}
	
	render()
	{
		let checkBoxOption = [{label: getLangTxt("setting_queue_busy"), value: 0}, {label: getLangTxt("setting_queue_overloaded"), value: 1}],
			radioPlanOption = [
				{label: getLangTxt("setting_queueing_plan"), value: 0},
				{label: getLangTxt("setting_queuing_insert"), value: 1}
			],
			{checkedArray} = this.state,
			{queueGroupData = {}, link, queueMangeData} = this.props,
			progress = queueMangeData.getIn(["progress"]);
		
		return (
			<div className="queuePlan">
				<Steps current={1}
				       style={{width: '100%', padding: '20px 230px 20px', boxShadow: '#f0eff0 2px 2px 2px'}}>
					<Step title={getLangTxt("setting_queue_definition")}/>
					<Step title={getLangTxt("setting_queue_definition_plan")}/>
				</Steps>
				<div className="inlineTypeSwitch">
					<Switch checked={queueGroupData.inletType === 0}
					        onChange={this.onInlineTypeChange.bind(this, queueGroupData)}/>
					<span>{getLangTxt("setting_queue_incoming")}</span>
				</div>
				<div className="inlineTypeSwitch">
					<Switch checked={queueGroupData.inletType === 1}
					        onChange={this.onInlineTypeChange2.bind(this, queueGroupData)}/>
					<span>{getLangTxt("setting_queue")}</span>
				</div>
				<div className="queueContent">
					<div className="queueContentTitle">{getLangTxt("setting_queue_time")}</div>
					
					<CheckboxGroup
						options={checkBoxOption}
						value={checkedArray} disabled={queueGroupData.inletType === 0}
						onChange={this.onCheckBoxChange.bind(this, queueGroupData)}
					/>
					<InputNumber
						min={0}
						precision={0}
						defaultValue={link === "editor" ? queueGroupData.overflow : 0}
						disabled={queueGroupData.inletType === 0}
						onChange={this.onOverflowNumChange.bind(this, queueGroupData)}
					/>
					<span style={{marginLeft: "10px"}}>%</span>
				</div>
				<div className="queueContent">
					<div className="queueContentTitle">{getLangTxt("setting_queue_strategy")}</div>
					<RadioGroup
						options={radioPlanOption}
						value={queueGroupData.strategyType}
						disabled={queueGroupData.inletType === 0}
						onChange={this.onRadioPlanChange.bind(this, queueGroupData)}
					/>
					<span
						style={{color: queueGroupData.inletType === 0 ? "rgba(0, 0, 0, 0.25)" : "#747474"}}>{getLangTxt("setting_queue_priority")}</span>
					<InputNumber
						min={1}
						precision={0}
						defaultValue={link === "editor" ? queueGroupData.inletPriority : 1}
						disabled={queueGroupData.inletType === 0 || queueGroupData.strategyType === 0}
						onChange={this.onPriorityNumChange.bind(this, queueGroupData)}
					/>
				</div>
				<div className="queueGroupFooter">
					<Button className="primary" type="primary"
					        onClick={this.handleSave.bind(this, queueGroupData)}>{getLangTxt("save")}</Button>
					<Button className="ghost" type="ghost"
					        onClick={this.handleCancel.bind(this, queueGroupData)}>{getLangTxt("cancel")}</Button>
				</div>
				{
					getProgressComp(progress)
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		queueMangeData: state.queueManageReducer
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({addQueue, editQueue}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DefineQueuePlan);
