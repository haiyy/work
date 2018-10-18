import React from "react"
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { getCallRecord, getSitRecord, getTableHeaders, getCallRecordExprot, taskCallOutTask, getDisplayColumn, updateDate } from "../redux/reducers/callRecordReducer";
import { getCallRecordDetails, setBraedCrumbFlag } from "../redux/reducers/telephonyScreenReducer";
import { Button, Checkbox, Popover} from 'antd';
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
import { ReFresh } from "../../../components/ReFresh";
import DatePickerComponent, { getTime } from "../../record/public/DatePickerComponent"
import NTTableWithPage from "../../../components/NTTableWithPage"
import CallRecordComponent from "../util/CallRecordComponent"
import moment from "moment";
import './style/CallRecord.less'
import './style/searchListComp.less'
import { getProgressComp } from "../../../utils/MyUtil";
import ExportComponent from "../../../components/ExportComponent";
import Settings from "../../../utils/Settings";
import { on, removeListener } from "../../../utils/PhoneUtils";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

const CheckboxGroup = Checkbox.Group;

class CallRecord extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			currentPage: props.currentPage, modalShow: false, visible: false, callId: "", showRowType: false, rowSelectionList: []
		};
	}
	
	componentDidMount()
	{
		this.getTableHeader();
		this.getCallRecord();

		this.listenResult = this.listenResult.bind(this);
		this.callback = this.callback.bind(this);

		on("Event_AttendantStateChanged", this.listenResult);

	}

	componentWillUnmount() {
		removeListener("Event_AttendantStateChanged", this.listenResult);
	}

	listenResult(eventType, result) {
		//状态有变化 设置更新页面
		this.setState({eventListener:result});
	}

	
	componentWillReceiveProps(nextProps)
	{
		
		let {componentsname, callType, resultType, datePicker} = nextProps,
			
			{startTamp, endTamp} = datePicker;
		
		if(componentsname !== this.props.componentsname)
		{
			let timeStamp = new Date(new Date().setHours(0, 0, 0, 0)),
			startTamp1 = timeStamp.getTime(),
			endTamp2 = timeStamp.getTime() + (86400 - 1) * 1 * 1000;
			if (startTamp != startTamp1 || endTamp != endTamp2) {
				startTamp = startTamp1;
				endTamp = endTamp2;
				this.props.updateDate(startTamp, endTamp, '今天');
			}
			this.getTableHeader(callType, resultType);
			this.getCallRecord(callType, 1, startTamp, endTamp, resultType);
			this.oncloseRowType();
			this.state.currentPage = 1;
			
		}
		else if(nextProps.reloadFlag && !this.props.reloadFlag)
		{
			this.getTableHeader(callType, resultType);
			this.getCallRecord(callType, 1, startTamp, endTamp, resultType);
		}
	}
	
	getHeaderColumn()
	{
		let {callType, resultType} = this.props;
		
		this.props.getDisplayColumn(callType, resultType, this.callback);
	}

	callback() {
		this.setState({
			showRowType:true
		})
	}
	
	getTableHeader(callType, resultType) 
	{
		let getProps = this.props;
		
		if(callType == undefined && resultType == undefined)
		{
			
			callType = getProps.callType;
			resultType = getProps.resultType;
		}
		
		this.props.getTableHeaders(callType, resultType);
		
	}
	
	getCallRecord(callType, currentPage, startTime, endTime, resultType)
	{
		let getProps = this.props,
			datePicker = getProps.datePicker;
		
		if(callType == undefined && resultType == undefined)
		{
			callType = getProps.callType;
			resultType = getProps.resultType;
			startTime = datePicker.startTamp;
			endTime = datePicker.endTamp;
			currentPage = getProps.currentPage;
		}
		
		this.props.getCallRecord(callType, currentPage, startTime, endTime, resultType);
	}
	
	reFreshFn()
	{
		this.getTableHeader();
		this.getCallRecord();
	}
	
	changeSearchVal(startTamp, endTamp, selectValue)
	{
		let {callType, resultType, datePicker} = this.props,
			{startTamp: startTamp1, endTamp: endTamp1, selectValue: selectValue1} = datePicker;
		
		if(startTamp === startTamp1 && endTamp === endTamp1)
			return;
		
		this.props.updateDate(startTamp, endTamp, selectValue);
		
		this.getCallRecord(callType, 1, startTamp, endTamp, resultType);
	}
	
	selectOnChange(value)
	{
		let {callType, resultType, datePicker} = this.props,
			{startTamp, endTamp} = datePicker;
		
		this.setState({currentPage: value});
		
		this.getCallRecord(callType, value, startTamp, endTamp, resultType)
	}
	
	/*打开新建外呼任务*/
	onCallRecord()
	{
		let {rowSelectionList} = this.state;
		if(rowSelectionList.length > 0)
		{
			this.setState({
				modalShow: true,
				visible: true
			});
		}
		else
		{
			confirm({
				title: '提示',
				content: '请选择外呼用户',
				onOk()
				{
				},
				onCancel()
				{
				},
			});
		}
	}
	
	/*关闭Modal*/
	onCallRecordClose()
	{
		this.setState({
			modalShow: false,
			visible: false
		});
	}
	
	getResource()
	{
		let {callType, resultType} = this.props,
			resource = 0;
		
		if(callType == 0 && resultType == 0)
		{
			resource = 2;
		}
		else if(callType == 1 && resultType == 0)
		{
			resource = 3;
		}
		
		return resource;
	}
	
	onFormDatachange(data)
	{
		let dates = data.startTime,
			{rowSelectionList} = this.state,
			startTime = moment(dates[0])
			.valueOf(),
			endTime = moment(dates[1])
			.valueOf();
		
		data.userIds = data.userIds.join(",");
		data.startTime = startTime;
		data.endTime = endTime;
		data.resource = this.getResource();
		data.taskNumber = rowSelectionList;
		this.props.taskCallOutTask(data);
		
		this.onCallRecordClose();
	}
	
	getCallRecordExportUrl()
	{
		let {callType, resultType, datePicker} = this.props,
			{startTamp, endTamp} = datePicker,
			{callId} = this.state;
		
		return Settings.getCallRecordExport(callId, callType, resultType, startTamp, endTamp);
	}
	
	_getProgressComp()
	{
		let {progress} = this.props;
		
		if(progress)
		{
			if(progress === LoadProgressConst.LOAD_COMPLETE || progress === LoadProgressConst.SAVING_SUCCESS)
				return;
			if(progress === LoadProgressConst.LOADING || progress === LoadProgressConst.SAVING)  //正在加载或正在保存
			{
				return getProgressComp(progress);
			}
			else if(progress === LoadProgressConst.LOAD_FAILED)  //加载失败
			{
				return <ReFresh reFreshStyle={{width: "100%"}} reFreshFn={this.reFreshFn.bind(this)}/>;
			}
		}
		return null;
	}
	
	get columnList()
	{
		let {headerColumn = []} = this.props,
			arr = [];
		
		headerColumn.map((item) => {
			if(item.typeName == '客户信息')
			{
				arr.push({
					label: item.fieldName,
					value: item.fieldId,
					disabled: item.disabled
					
				})
			}
			
		});
		
		return arr;
	}
	
	get columnListChecked()
	{
		let {headerColumn = []} = this.props,
			arr = [],
			initArr = [];
		
		headerColumn.map((item) => {
			if(item.typeName == '客户信息' && item.selected)
			{
				arr.push(item.fieldId)
			}
			
		});
		return arr;
	}
	
	get callRecordList()
	{
		let {headerColumn = []} = this.props,
			arr = [];
		
		headerColumn.map((item) => {
			{
				if(item.typeName == '通话信息')
				{
					arr.push({
						label: item.fieldName,
						value: item.fieldId,
						disabled: item.disabled
						
					})
				}
			}
		})
		
		return arr;
	}
	
	get callRecordListChecked()
	{
		let {headerColumn = []} = this.props,
			arr = [];
		
		headerColumn.map((item) => {
			if(item.typeName == '通话信息' && item.selected)
			{
				arr.push(item.fieldId)
			}
			
		});
		return arr;
	}
	
	get timeList()
	{
		let {headerColumn = []} = this.props,
			arr = [];
		
		headerColumn.map((item) => {
			if(item.typeName == '时间节点')
			{
				arr.push({
					label: item.fieldName,
					value: item.fieldId,
					disabled: item.disabled
					
				})
			}
		})
		
		return arr;
	}
	
	get timeListChecked()
	{
		let {headerColumn = []} = this.props,
			arr = [],
			initArr = [];
		
		headerColumn.map((item) => {
			if(item.typeName == '时间节点' && item.selected)
			{
				arr.push(item.fieldId)
			}
			
		});
		return arr;
	}
	
	get sitTableList()
	{
		let {headerColumn = []} = this.props,
			arr = [];
		
		headerColumn.map((item) => {
			if(item.typeName == '坐席信息')
			{
				arr.push({
					label: item.fieldName,
					value: item.fieldId,
					disabled: item.disabled
				})
			}
		})
		
		return arr;
	}
	
	get sitTableListChecked()
	{
		let {headerColumn = []} = this.props,
			arr = [];
		
		headerColumn.map((item) => {
			if(item.typeName == '坐席信息' && item.selected)
			{
				arr.push(item.fieldId)
			}
			
		});
		return arr;
	}
	
	onRowSelection(data)
	{
		this.setState({
			rowSelectionList: data
		})
	}
	
	onSitTableListChange(flag, value)
	{
		console.log(value, "value", flag, "flag")
		let {callType, resultType} = this.props;
		
		value = value.join(",");
		
		this.props.getSitRecord(callType, resultType, value, flag);
	}
	
	onRow(data, index)
	{
		if(data)
		{
			this.props.getCallRecordDetails(data.callId)
			this.props.DetailsShow(true, data, this.state.currentPage);
			this.props.setBraedCrumbFlag(true);
		}
	}
	
	onshowRowType()
	{
	
		this.getHeaderColumn();
	}
	
	oncloseRowType()
	{
		this.setState({
			checkedInfo: {},
			showRowType: false
		})
	}

	handleVisibleChange(visible) 
	{	
		this.setState({ showRowType:visible });
	}
	
	render()
	{
		let {tableDataList, dataHeader, componentsname, setting, datePicker} = this.props,
			{totalRecord, list} = tableDataList,
			{currentPage, showRowType, modalShow, visible, eventListener} = this.state,
			checkboxFlag = componentsname == 'incomingunanswered' || componentsname == 'calloutunanswered',
			{startTamp, endTamp, selectValue} = datePicker,
			rangeTime = [moment(startTamp), moment(endTamp)];
			console.log(eventListener);//刷新页面使用
		
		return (
			<div className="CallRecord">
				<DatePickerComponent selectValue={selectValue} rangeTime={rangeTime}
				                     _onOk={this.changeSearchVal.bind(this)}/>
				
				<div className="callRecordListSelectedWrap">
				{
				showRowType?<Popover overlayClassName="record-overlay"
      			 content={
					    
						<div className="CallRrcoedRow">
							<label>客户信息</label>
							<CheckboxGroup options={this.columnList} className="CallRrcoedRow-Checkbox"
							               defaultValue={this.columnListChecked}
							               onChange={this.onSitTableListChange.bind(this, 1)}/>
							<label>通话信息</label>
							<CheckboxGroup options={this.callRecordList}
							               defaultValue={this.callRecordListChecked}
							               className="CallRrcoedRow-Checkbox"
							               onChange={this.onSitTableListChange.bind(this, 2)}/>
							<label>时间节点</label>
							<CheckboxGroup options={this.timeList}
							               className="CallRrcoedRow-Checkbox"
							               defaultValue={this.timeListChecked}
							               onChange={this.onSitTableListChange.bind(this, 3)}/>
							<label>坐席信息</label>
							<CheckboxGroup options={this.sitTableList}
							               className="CallRrcoedRow-Checkbox"
							               defaultValue={this.sitTableListChecked}
							               onChange={this.onSitTableListChange.bind(this, 4)}/>
						</div>
				 }
       		     trigger="click"
				 visible={showRowType}
                 onVisibleChange={this.handleVisibleChange.bind(this)}
                 >				
				 <Button type="primary" className="newoutCry"
					        onClick={this.onshowRowType.bind(this)}>显示列</Button>
     			 </Popover>
					:<Button type="primary" className="newoutCry"
					onClick={this.onshowRowType.bind(this)}>显示列</Button>
				}
				
					{
						setting.includes('callcenter_call_records_export') ?
							<ExportComponent url={this.getCallRecordExportUrl()} clsName="CallRecord-Export"
							                 isexportAll={true}/>
							: null
					}
					{
						checkboxFlag && setting.includes('callcenter_outbound_task_edit') ?
							<Button type="primary" className="newoutCry"
							        onClick={this.onCallRecord.bind(this)} style={{minWidth: 98}}>新建外呼任务</Button>
							: ""
					}
				</div>
				<div>
					<NTTableWithPage onRowSelectChange={this.onRowSelection.bind(this)} flagTypes={"CallRecord"}
					                 onRow={this.onRow.bind(this)} checkboxFlag={checkboxFlag}
					                 currentPage={currentPage} rowKey="callId"
					                 dataSource={list} headers={dataHeader}
					                 total={totalRecord}
					                 selectOnChange={this.selectOnChange.bind(this)}/>
				</div>
				<div>
					<CallRecordComponent onformData={this.onFormDatachange.bind(this)} modalShow={modalShow}
					                     visible={visible} handleCancel={this.onCallRecordClose.bind(this)}/>
				</div>
				{
					this._getProgressComp()
				}
			</div>
		);
	}
}

function mapStateToProps(state)
{
	let {callRecordReducer, startUpData} = state;
	
	return {
		dataHeader: callRecordReducer.get("tableHeaders") || [],
		headerColumn: callRecordReducer.get("displayColumnList") || [],
		tableDataList: callRecordReducer.get("tableDataList") || {},
		progress: callRecordReducer.get("progress") || {},
		setting: startUpData.get("callcenter") || [],
		reloadFlag: callRecordReducer.get("callRecordReloadFlag") || false,
		datePicker: callRecordReducer.get("datePicker")
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getTableHeaders, getSitRecord, getCallRecord, getCallRecordExprot, taskCallOutTask, getDisplayColumn,
		getCallRecordDetails, setBraedCrumbFlag, updateDate
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CallRecord);
