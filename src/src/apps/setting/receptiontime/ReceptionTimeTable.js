import React from "react";
import { Checkbox, Button, TimePicker, Input, Table, Modal, Icon, message } from 'antd';
import moment from "moment";
import NTPureComponent from "../../../components/NTPureComponent";
import { addReceptionItem, delReceptionItem, editReceptionItem } from "./reducer/receptionTimeReducer";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { stringLen } from "../../../utils/StringUtils";
import { getLangTxt } from "../../../utils/MyUtil";

const CheckboxGroup = Checkbox.Group,
	format = "HH:mm",
	confirm = Modal.confirm;

class ReceptionTimeTable extends NTPureComponent {
	constructor(props)
	{
		super(props);
		
		this.column = getColumn.call(this);
		this.state = {editorId: "", isNew: false, receptionIllegal: null};
		
		this.disabled = props.disabled;
	}
	
	componentWillReceiveProps(nextProps)
	{
		this.disabled = nextProps.disabled;
	}
	
	submitItem(record)
	{
		if(this.disabled)
			return;
		
		if(this.state.receptionIllegal)
		{
			this.getErrorMsg();
			return;
		}
		
		let {isNew, itemid, isEdit, ...data} = record,
			{templateid} = this.props;
		
		if(isNew)
		{
			templateid = templateid || [];
			data.templateid = templateid;
			
			this.props.addReceptionItem(data);
		}
		else
		{
			record.isEdit = false;
			data.itemid = Array.isArray(itemid) ? itemid : [itemid];
			
			this.props.editReceptionItem(data);
		}
	}
	
	showDelConfirm(record)
	{
		if(this.disabled)
			return;
		
		confirm({
			title: getLangTxt("del_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'warnTip',
			content: getLangTxt("del_content"),
			onOk: () => {
				let index = -1,
					{itemList} = this.props,
					{isNew, itemid, ...data} = record;
				
				itemList = itemList ? itemList : [];
				
				if(isNew)
				{
					index = itemList.findIndex(value => value.itemid === itemid);
					index > -1 && itemList.splice(index, 1);
					this.props.isNew();
				}
				else
				{
					this.props.delReceptionItem(Array.isArray(itemid) ? itemid : [itemid]);
				}
			}
		});
	}
	
	onChange(type, record, time)
	{
		record[type] = (time.hours() * 60 + time.minutes()) * 60 * 1000;
		let {startTime, endTime} = record;
		if(endTime < startTime)
		{
			record["endTime"] = startTime;
			record["startTime"] = endTime;
		}
		
		this.forceUpdate();
	}
	
	onWeekChange(record, checkedValue)
	{
		record.weekDays = checkedValue;
		this.forceUpdate();
	}
	
	getErrorMsg()
	{
        try
        {
            message.destroy();
        }
        catch(e) {}
		message.error(getLangTxt("setting_notice_note1"))
	}
	
	onDoubleClick(record)
	{
		let {receptionIllegal} = this.state;
		
		record.isEdit = true;
		
		this.props.isNew();
		
		if(!receptionIllegal)
		{
			this.setState({editorId: record});
		}
		else
		{
			this.getErrorMsg();
		}
		
	}
	
	onBlur(record)
	{
		let {receptionIllegal} = this.state;
		
		if(!receptionIllegal)
		{
			this.setState({editorId: null});
		}
		else
		{
			this.getErrorMsg();
		}
	}
	
	onReceptionNameChange(record, {target: {value}})
	{
		let valueLen = stringLen(value);
		this.setState({receptionIllegal: valueLen > 10});
		record.name = value;
	}
	
	onNewItem()
	{
		if(this.state.isNew)
			return;
		
		let {itemList} = this.props;
		
		defaultItem.name = getLangTxt("setting_recept_time_lb8");
		
		itemList = itemList ? itemList : [];
		itemList.push({...defaultItem, weekDays: [...defaultItem.weekDays], isNew: true});
		
		this.props.isNew();
	}
	
	onContentCheckBoxChange(record, {target: {checked}})
	{
		record.enable = checked ? 1 : 0;
		this.forceUpdate();
	}
	
	render()
	{
		let {itemList, disabled} = this.props;
		
		return (
			<div>
				<Button className="newReceptionBtn" type="primary" disabled={disabled || this.props.cansave}
				        onClick={this.onNewItem.bind(this)}>{getLangTxt("add")}</Button>
				<Table className="receptionTable" dataSource={itemList || []} columns={this.column} pagination={false}
				       rowClassName={record => record.isNew ? "newReceptionRowStyle" : ""}/>
			</div>
		);
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({addReceptionItem, delReceptionItem, editReceptionItem}, dispatch);
}

export default connect(null, mapDispatchToProps)(ReceptionTimeTable);

function getColumn()
{
	let options = week.map(value => {
		return {...value, label: getLangTxt(value.label)};
	});
	
	return [
		{
			title: getLangTxt("open"),
			dataIndex: 'enable',
			className: 'isUseable',
			render: (enable, record, index) =>
				<Checkbox key={"enable" + index} checked={enable == 1}
				          disabled={this.disabled} onChange={this.onContentCheckBoxChange.bind(this, record)}/>
		},
		{
			title: getLangTxt("name"),
			dataIndex: 'name',
			className: 'receptionTime',
			render: (name, record, index) => {
				let {editorId, receptionIllegal} = this.state,
					className = editorId == record && receptionIllegal ? "illegalReceptionName" : "",
					defaultName = record.isNew ? "" : name;
				
				return editorId === record || record.isNew ?
					<Input className={className} key={"input" + index} autoFocus
					       onChange={this.onReceptionNameChange.bind(this, record)}
					       onBlur={this.onBlur.bind(this, record)}
					       defaultValue={defaultName}
					       disabled={this.disabled}/> :
					<span key={"span" + index}
					      onDoubleClick={this.onDoubleClick.bind(this, record)}>{defaultName}</span>
				
			}
		},
		{
			title: getLangTxt("time"),
			dataIndex: 'weekDays',
			render: (text, record, index) => {
				let {startTime, endTime, weekDays} = record,
					start = moment()
					.hours(0)
					.minutes(0)
					.millisecond(startTime),
					end = moment()
					.hours(0)
					.minutes(0)
					.millisecond(endTime);
				
				return (
					<div key={"weekDays" + index}>
						<div className="receptionDate">
							<TimePicker value={start} onChange={this.onChange.bind(this, "startTime", record)}
							            format={format} disabled={this.disabled}/>
							<i> - </i>
							<TimePicker value={end} onChange={this.onChange.bind(this, "endTime", record)}
							            format={format}
							            disabled={this.disabled}/>
						</div>
						{
							<CheckboxGroup className="receptionWeekly" options={options} value={weekDays}
							               onChange={this.onWeekChange.bind(this, record)} disabled={this.disabled}/>
						}
					</div>
				);
			}
		},
		{
			title: getLangTxt("operation"),
			dataIndex: 'operate',
			className: 'icon-box',
			render: (text, record, index) => {
				let className = this.disabled ? "newReceptionOKDisabled" : "newReceptionOK",
					cancelClName = this.disabled ? "newReceptionCancelDisabled" : "newReceptionCancel";
				return (
					[

						<i className={`iconfont icon-baocun ${className}`} 
						onClick={this.submitItem.bind(this, record)}
						disabled={this.disabled}
						></i>,
						<i className={`iconfont icon-shanchu ${cancelClName}`} 
						onClick={this.showDelConfirm.bind(this, record)}
						disabled={this.disabled}
						></i>
						// <Icon type="check-circle" className={className} onClick={this.submitItem.bind(this, record)}
						//       disabled={this.disabled}/>,
						// <Icon type="close-circle" className={cancelClName}
						//       onClick={this.showDelConfirm.bind(this, record)} disabled={this.disabled}/>
					]
				)
			}
		}];
}

const week = [{label: "setting_recept_time_lb1", value: 1},
		{label: "setting_recept_time_lb2", value: 2},
		{label: "setting_recept_time_lb3", value: 3},
		{label: "setting_recept_time_lb4", value: 4},
		{label: "setting_recept_time_lb5", value: 5},
		{label: "setting_recept_time_lb6", value: 6},
		{label: "setting_recept_time_lb7", value: 0}],
	defaultItem = {
		"itemid": "",
		"enable": 0,
		"name": "白班",
		"weekDays": [1, 2, 3, 4, 5],
		"startTime": 9 * 60 * 60 * 1000, //早上9点
		"endTime": 18 * 60 * 60 * 1000 //晚上6点
	};


