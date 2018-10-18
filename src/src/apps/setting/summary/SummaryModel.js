import React from 'react';
import { Modal, Card, Input, Switch, DatePicker, Form, TreeSelect, Tree } from 'antd';
import moment from 'moment';
import { getLangTxt, getLocalTime } from "../../../utils/MyUtil";
import NTModal from "../../../components/NTModal";
import { bglen } from "../../../utils/StringUtils";
import TreeNode from "../../../components/antd2/tree/TreeNode";

const FormItem = Form.Item;

class SummaryModel extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {
			isCommon: null,
			startTime: 0,
			stopTime: 0,
			addSummaryLeafCount: 1,
			selectedSummaryTypeId: props.selectedSummaryType || null
		};
		
		this.handleOk = this.handleOk.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleSummaryTypeChange = this.handleSummaryTypeChange.bind(this);
		this.handleSummaryLeafChange = this.handleSummaryLeafChange.bind(this);
		this.handleIsCommon = this.handleIsCommon.bind(this);
		/*this.handleStartTime = this.handleStartTime.bind(this);
		 this.handleStopTime = this.handleStopTime.bind(this);
		 this.handleValidTime = this.handleValidTime.bind(this);*/
		this.notifyParentSummaryTypeId = this.notifyParentSummaryTypeId.bind(this);
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(nextProps.type != this.props.type && nextProps.type == "editSummaryLeaf")
		{
			let {editSummaryInfo: {startTime = 0}} = nextProps;
			this.setState({disabledStartValue: moment(startTime)})
		}
		else if(nextProps.type != this.props.type && nextProps.type == "addSummaryLeaf")
		{
			this.setState({disabledStartValue: null})
		}
	}
	
	//设置是否常用
	handleIsCommon(isCommon)
	{
		if(isCommon)
		{
			this.props.isSetCommonOk();
		}
		this.setState({
			isCommon: isCommon
		});
	}
	
	isCommonDisabled()
	{
		Modal.info({
			title: '提示',
			iconType: 'exclamation-circle',
			className: 'commonTip',
			content: <div>
				{getLangTxt("setting_summary_note1")}
			</div>,
			width: '320px',
			onOk: () => {
				this.props.clearSetCommonMsg();
				this.setState({isCommon: false})
			}
		});
	}
	
	judgeSpace(rule, value, callback)
	{
		if(value && value.trim() !== "" && bglen(value) <= 80)
		{
			callback();
		}
		callback(getLangTxt("setting_summary_note2"));
	}
	
	//保存分组或条目信息
	handleOk()
	{
		
		let {form} = this.props;
		form.validateFields((errors) => {
			
			if(errors)
				return false;
			
			let parentid = this.props.rootid;
			let {editSummaryInfo} = this.props,
				{summaryTypeParentid = "", summaryLeafParentid = ""} = editSummaryInfo;
			
			if(!editSummaryInfo && this.state.selectedSummaryTypeId === null)
			{
				parentid = this.props.selectedSummaryType;
			}
			
			if(editSummaryInfo && this.state.selectedSummaryTypeId === null)
			{
				if(summaryTypeParentid && this.props.type.indexOf('SummaryType') > -1 || summaryTypeParentid == "" && this.props.type.indexOf('SummaryType') > -1)
				{
					parentid = summaryTypeParentid;
				}
				else if(summaryLeafParentid && this.props.type.indexOf('SummaryLeaf') > -1)
				{
					parentid = summaryLeafParentid;
				}
			}
			
			if(this.state.selectedSummaryTypeId !== null)
			{
				parentid = this.state.selectedSummaryTypeId;
			}
			
			if(this.props.type === 'addSummaryType')
			{
				this.props.addSummaryType({
					parentid: parentid || this.props.selectedSummaryType || "",
					type: 1,
					content: this.state.summaryTypeContent
				});
			}
			
			if(this.props.type === 'editSummaryType')
			{
				
				let editData = {
					summaryid: editSummaryInfo.summaryid,
					parentid: parentid,
					type: 1,
					content: this.state.summaryTypeContent
				};
				
				if(parentid !== editSummaryInfo.summaryTypeParentid)
				{
					editData = Object.assign(editData, {
						oldParentid: editSummaryInfo.summaryTypeParentid
					});
				}
				
				this.props.editSummaryType(editData);
				this.setState({selectedSummaryTypeId: null});
			}
			
			if(this.props.type === 'addSummaryLeaf')
			{
				this.props.addSummaryLeaf({
					parentid: parentid || this.props.selectedSummaryType,
					type: 0,
					content: this.state.summaryLeafContent,
					isCommon: this.state.isCommon,
					startTime: this.state.startTime || 0,
					stopTime: this.state.stopTime || 0
				});
			}
			
			if(this.props.type === 'editSummaryLeaf')
			{
				this.props.editSummaryLeaf({
					summaryid: this.props.editSummaryInfo.summaryid,
					parentid: parentid,
					oldParentid: editSummaryInfo.summaryLeafParentid,
					type: 0,
					rank: 1,
					content: this.state.summaryLeafContent,
					isCommon: this.state.isCommon,
					startTime: this.state.startTime || editSummaryInfo.startTime,
					stopTime: this.state.stopTime || 0
				});
			}
			
			this.setState({
				selectedSummaryTypeId: null, stopTime: 0, disabledStopValue: null, startTime: 0,
				disabledStartValue: null
			});
		});
		
	}
	
	//取消弹框
	handleCancel(e)
	{
		this.setState({selectedSummaryTypeId: null});
		this.props.hideSummaryModel();
	}
	
	//获取分组名称
	handleSummaryTypeChange(e)
	{
		this.setState({summaryTypeContent: e.target.value});
	}
	
	//修改咨询总结条目名称
	handleSummaryLeafChange(e)
	{
		this.setState({summaryLeafContent: e.target.value});
	}
	
	//选取组id
	notifyParentSummaryTypeId(id)
	{
		this.setState({
			selectedSummaryTypeId: id
		});
	}
	
	componentWillUpdate(nextProps, nextState)
	{
		if(this.props.editSummaryInfo != nextProps.editSummaryInfo)
		{
			this.setState({
				...nextProps.editSummaryInfo
			});
		}
	}
	
	//更改组
	onSummaryGroupChange(value, label, extra)
	{
		if(value && value != "firstLevel")
		{
			this.notifyParentSummaryTypeId(value);
			this.props.getSummaryLeafData(value);
		}
		else
		{
			this.props.getSummaryLeafData();
			this.setState({selectedSummaryTypeId: ""})
		}
	}
	
	//上级分组树渲染---分组
	_createGroupTreeNodes(states)
	{
		let {editSummaryInfo = {summaryid: ""}} = this.props,
			{summaryid = ""} = editSummaryInfo;
		
		if(states)
			return states.map(item => {
				item.disabled = this.props.type === "editSummaryType" && summaryid === item.summaryid;
				return (
					<TreeNode
						key={item.key} label={item.content}
						value={item.summaryid} disabled={item.disabled}
						title={
							<div className="sourceTree">
								{item.content}
							</div>
						}
					>
						{item.children ? this._createGroupTreeNodes(item.children) : null}
					</TreeNode>
				);
			});
	}
	
	//上级分组树渲染---条目
	_createTreeNodes(states)
	{
		if(states) return states.map(item => {
			return (
				<TreeNode key={item.key} label={item.content} value={item.summaryid} title={
					<div className="sourceTree">
						{item.content}
					</div>}>
					{item.children ? this._createTreeNodes(item.children) : null}
				</TreeNode>
			);
		});
	}
	
	//不可选开始时间
	disabledStartDate(startValue)
	{
		let endValue = this.state.disabledStopValue,
			{editSummaryInfo: {stopTime = 0}} = this.props;
		
		if(this.props.type === "editSummaryLeaf" && stopTime != 0)
		{
			endValue = this.state.disabledStopValue ? this.state.disabledStopValue : moment(stopTime)
		}
		
		if(!startValue || !endValue)
		{
			return false;
		}
		return startValue.valueOf() > endValue.valueOf();
	}
	
	//选择开始时间
	newSummaryStartTime(value)
	{
		let openTime = value && value._d.getTime();
		this.setState({
			startTime: openTime,
			changeStartTime: true,
			disabledStartValue: value
		});
	}
	
	//开始时间选择之后打开结束时间
	handleStartOpenChange(open)
	{
		if(!open)
		{
			this.setState({endOpen: true});
		}
	}
	
	//不可选结束时间
	disabledEndDate(endValue)
	{
		let {editSummaryInfo: {startTime = 0}} = this.props,
			editStartTime = this.state.disabledStartValue;
		
		if(this.props.type === "editSummaryLeaf")
		{
			editStartTime = this.state.disabledStartValue ? this.state.disabledStartValue : moment(getLocalTime(startTime))
		}
		
		if(!endValue || !editStartTime)
		{
			return false;
		}
		
		return endValue.valueOf() < editStartTime.valueOf();
	}
	
	range(start, end)
	{
		const result = [];
		for(let i = start; i < end; i++)
		{
			result.push(i);
		}
		return result;
	}
	
	disabledDateTime()
	{
		
		let myDate = new Date(this.state.startTime),
			{editSummaryInfo: {startTime = 0}} = this.props;
		if(this.props.type === "editSummaryLeaf")
		{
			myDate = this.state.startTime ? new Date(this.state.startTime) : new Date(startTime);
		}
		
		let startHour = myDate.getHours(),
			startMin = myDate.getMinutes(),
			startSec = myDate.getSeconds();
		
		return {
			disabledHours: () => this.range(0, startHour),
			disabledMinutes: () => this.range(0, startMin),
			disabledSeconds: () => this.range(0, startSec)
		};
	}
	
	//选择结束时间
	newSummaryEndTime(value)
	{
		let closeTime = value && value._d.getTime();
		this.setState({
			stopTime: closeTime,
			changeStopTime: true,
			disabledStopValue: value
		});
	}
	
	handleEndOpenChange(open)
	{
		let {editSummaryInfo} = this.props,
			editStartTime = this.state.startTime === 0 ? editSummaryInfo.startTime : this.state.startTime;
		
		if(!open && this.state.stopTime < editStartTime)
		{
			if(this.props.type === "editSummaryLeaf" && editSummaryInfo.stopTime != 0)
			{
				let stopTime = getLocalTime(editSummaryInfo.stopTime);
				this.setState({
					stopTime: editSummaryInfo.stopTime,
					disabledStopValue: moment(stopTime)
				});
				this.props.form.setFieldsValue({summaryEndTime: moment(stopTime)})
			}
			else
			{
				this.setState({
					stopTime: 0,
					disabledStopValue: null
				});
				this.props.form.setFieldsValue({summaryEndTime: null})
			}
			
		}
		this.setState({endOpen: open});
	}
	
	//咨询总结新建组组件渲染
	_getSummaryGroupComp(summaryTypeContent, defaultEditParentId)
	{
		const formItemLayout = {
			labelCol: {span: 6},
			wrapperCol: {span: 16}
		}, {getFieldDecorator} = this.props.form;
		
		if(this.props.type === "editSummaryType" && defaultEditParentId === "")
		{
			defaultEditParentId = "firstLevel";
		}
		
		return (
			<Card className='model-card summaryTypeGroup clearFix'>
				<FormItem
					{...formItemLayout}
					label={getLangTxt("setting_consult_type_name")}
					className="summaryGroupName"
					hasFeedback>
					{getFieldDecorator('summaryGroupName', {
						initialValue: summaryTypeContent || "",
						rules: [{validator: this.judgeSpace.bind(this)}]
					})(
						<Input
							type='text'
							className="summaryTypeName"
							onChange={this.handleSummaryTypeChange}
						/>
					)}
				</FormItem>
				
				<TreeSelect
					dropdownStyle={{maxHeight: 400, overflowY: 'auto', overflowX: 'hidden'}}
					placeholder={getLangTxt("setting_group_type")}
					getPopupContainer={() => document.getElementsByClassName('summaryTypeGroup')[0]}
					className="superiorSummaryType"
					defaultValue={defaultEditParentId || this.state.selectedSummaryTypeId || this.props.selectedSummaryType || "firstLevel"}
					onChange={this.onSummaryGroupChange.bind(this)}>
					{this._createGroupTreeNodes(this.props.summaryTypeTree)}
					<TreeNode title={<div>空</div>} value="firstLevel"/>
				</TreeSelect>
			</Card>
		)
	}
	
	//咨询总结新建条目组件渲染
	_getSummaryItemComp(summaryParentId, summaryLeafContent, editSummaryInfo, isCommon)
	{
		const styles = {display: 'inline-block', width: '83px', textAlign: 'center'},
			formItemLayoutSummary = {
				labelCol: {span: 3},
				wrapperCol: {span: 10}
			}, formItemLayoutSummaryName = {
				labelCol: {span: 3},
				wrapperCol: {span: 10}
			}, formItemLayoutSummaryTime = {
				labelCol: {span: 6},
				wrapperCol: {span: 10}
			}, {getFieldDecorator} = this.props.form;
		let editStartTime = moment(editSummaryInfo.startTime)
			.format('YYYY-MM-DD HH:mm:ss'),
			editStopTime = moment(editSummaryInfo.stopTime)
			.format('YYYY-MM-DD HH:mm:ss');
		
		return (
			<div>
				<Card className='model-card summaryItem'>
					<div className="parentName parentGroupStyle" style={{borderBottom: '1px solid #e9e9e9'}}>
						<FormItem
							{...formItemLayoutSummary}
							label={getLangTxt("setting_consult_type_name")}>
							{getFieldDecorator('summaryGroup', {
								initialValue: summaryParentId || this.props.selectedSummaryType,
								rules: [{required: true, message: ' '}]
							})(
								<TreeSelect
									className="groupSelect"
									dropdownStyle={{maxHeight: 340, overflowX: 'hidden', overflowY: 'auto'}}
									placeholder={getLangTxt("setting_group_type")}
									treeDefaultExpandAll
									getPopupContainer={() => document.getElementsByClassName('summaryItem')[0]}
									onChange={this.onSummaryGroupChange.bind(this)}
								>{this._createTreeNodes(this.props.summaryTypeTree)}</TreeSelect>
							)}
						</FormItem>
					</div>
					<div className="parentName summaryInfo clearFix"
					     style={{borderBottom: '1px solid #e9e9e9', padding: '10px 0 10px 0'}}>
						<FormItem
							{...formItemLayoutSummaryName}
							label={getLangTxt("setting_record_summary")}
							className="summaryNameStyle"
							hasFeedback>
							{
								getFieldDecorator('summaryName', {
									initialValue: summaryLeafContent,
									rules: [{validator: this.judgeSpace.bind(this)}]
								})(<Input onChange={this.handleSummaryLeafChange} type='text'/>)
							}
						</FormItem>
						<FormItem{...formItemLayoutSummaryName} label={getLangTxt("setting_summary_common_remark")}>
							{
								getFieldDecorator('isCommonSwitch')(
									<Switch onChange={this.handleIsCommon}
									        checked={this.state.isCommon === null ? isCommon : this.state.isCommon}/>
								)
							}
						</FormItem>
						<div>
							<FormItem{...formItemLayoutSummaryTime} label={getLangTxt("effect_time")}
							         className="summaryTimeStyle" hasFeedback>
								{getFieldDecorator('summaryStartTime', {
									initialValue: editSummaryInfo.startTime ? moment(editStartTime) : null
								})(
									<DatePicker showTime format={'YYYY-MM-DD HH:mm:ss'}
									            placeholder={getLangTxt("start_time")} showToday={false}
									            getCalendarContainer={() => document.querySelector(".ant-layout-aside")}
									            disabledDate={this.disabledStartDate.bind(this)}
									            onOpenChange={this.handleStartOpenChange.bind(this)}
									            onChange={this.newSummaryStartTime.bind(this)}/>
								)}
							</FormItem>
							<FormItem
								{...formItemLayoutSummaryTime}
								className="summaryTimeStyle summaryEndTimeStyle"
								hasFeedback>
								{getFieldDecorator('summaryEndTime', {
									initialValue: editSummaryInfo.startTime ? editSummaryInfo.stopTime != 0 ? moment(editStopTime) : null : null
								})(
									<DatePicker
										showTime
										format={'YYYY-MM-DD HH:mm:ss'}
										placeholder={getLangTxt("end_time")}
										showToday={false}
										open={this.state.endOpen}
										getCalendarContainer={() => document.querySelector(".ant-layout-aside")}
										disabledDate={this.disabledEndDate.bind(this)}
										onOpenChange={this.handleEndOpenChange.bind(this)}
										onChange={this.newSummaryEndTime.bind(this)}
									/>
								)}
							</FormItem>
						</div>
					</div>
				</Card>
			</div>
		)
	}
	
	render()
	{
		let {editSummaryInfo = {}, isCommonOk} = this.props,
			defaultEditParentId = editSummaryInfo.summaryTypeParentid,
			summaryParentId = editSummaryInfo.parentid,
			modalElement = document.getElementsByClassName("summaryModel")[0],
			modalHeight = this.props.type === 'addSummaryType' || this.props.type === 'editSummaryType' ? 227 : 412;
		
		if(!isCommonOk)
		{
			this.isCommonDisabled()
		}
		let {
			summaryTypeContent,
			summaryLeafContent,
			summaryTypeParentid,
			summaryLeafParentid,
			isCommon,
			startTime,
			stopTime
		} = this.state;
		
		if(summaryTypeParentid === this.props.rootid)
		{
			summaryTypeParentid = "";
		}
		
		if(summaryLeafParentid === this.props.rootid)
		{
			summaryLeafParentid = "";
		}
		
		if(this.state.selectedSummaryTypeId)
		{
			summaryTypeParentid = this.state.selectedSummaryTypeId;
			summaryLeafParentid = this.state.selectedSummaryTypeId;
		}
		
		if(this.props.type === 'editSummaryLeaf')
		{
			isCommon = editSummaryInfo.isCommon;
		}
		else
		{
			isCommon = false;
		}
		
		let modeltitle = getLangTxt("setting_record_summary");
		let modelView = null;
		
		switch(this.props.type)
		{
			case 'addSummaryType':
				modeltitle = getLangTxt("add") + modeltitle + getLangTxt("type");
				modelView = this.props.type === "addSummaryType" ? this._getSummaryGroupComp(summaryTypeContent, defaultEditParentId) : null;
				break;
			case 'editSummaryType':
				modeltitle = getLangTxt("edit") + modeltitle + getLangTxt("type");
				modelView = this.props.type === "editSummaryType" ? this._getSummaryGroupComp(summaryTypeContent, defaultEditParentId) : null;
				break;
			case 'addSummaryLeaf':
				modeltitle = getLangTxt("add") + modeltitle;
				modelView = this.props.type === "addSummaryLeaf" ? this._getSummaryItemComp(summaryParentId, summaryLeafContent, editSummaryInfo, isCommon) : null;
				break;
			case 'editSummaryLeaf':
				modeltitle = getLangTxt("edit") + modeltitle;
				modelView = this.props.type === "editSummaryLeaf" ? this._getSummaryItemComp(summaryParentId, summaryLeafContent, editSummaryInfo, isCommon) : null;
				break;
			default:
				break;
		}
		
		return (
			<NTModal
				width={845}
				title={modeltitle}
				className="summaryModel"
				style={{marginTop: -modalHeight / 2 + 'px'}}
				visible={this.props.type ? true : false}
				onOk={this.handleOk}
				onCancel={this.handleCancel}
				okText={getLangTxt("save")}
			>
				<Form hideRequiredMark={true}>
					{modelView}
				</Form>
			</NTModal>
		)
	}
}

SummaryModel = Form.create()(SummaryModel);
export default SummaryModel;
