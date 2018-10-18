import React from "react";
import { Table, Button, Select, Input, Icon ,Tooltip} from 'antd';
import moment from 'moment';
import '../view/style/CallRecord.less';
import '../view/style/searchListComp.less';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { sitTableCallOutTask, exportExcelDetails } from "../redux/reducers/calloutTaskReducer"
import {setBraedCrumbFlag} from "../redux/reducers/telephonyScreenReducer"
import ExportComponent from "../../../components/ExportComponent";
import NTTableWithPage from "../../../components/NTTableWithPage"
import CalloutTaskComponent from "../util/CalloutTaskComponent"
import {PhoneStatus} from "../lib/Xn.PhoneCall"
import { phonetype,truncateToPop, checkPhone } from "../../../utils/StringUtils";
import {formatTimestamp} from "../../../utils/MyUtil";
import { callOut, getStatus, on, removeListener} from "../../../utils/PhoneUtils";
import {loginUserProxy,configProxy} from "../../../utils/MyUtil";
const Search = Input.Search;
const Option = Select.Option;
class CallOutTaskdetails extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = {
			detailsSelectVal: -1,
			currentPage: 1,
			searchVal: "",
		}
	}

	componentDidMount()
	{
		this.listenResult = this.listenResult.bind(this);

		on("Event_AttendantStateChanged", this.listenResult);
	}

	componentWillUnmount() {
		removeListener("Event_AttendantStateChanged", this.listenResult);
	}

	listenResult(eventType, result) {
		//状态有变化 设置更新页面
		this.setState({eventListener:result});
	}
	
	getsitTable(type, key='', currentPage=1)
	{
		let {actions, taskId} = this.props;

		actions.sitTableCallOutTask(taskId, type, key, currentPage);
	}

	componentWillReceiveProps(nextProps){
		console.log(nextProps);
	}
	getColumn()
	{
		return [
			{
				key: 'vistorName',
				dataIndex: 'vistorName',
				title: '客户名称',
				width: 100,
			}, {
				key: 'number',
				dataIndex: 'number',
				title: '电话号码',
				width: 100,
                render:(text) => {
					let {queryList} = this.props,
					    {status} = queryList,
					    cursor = "pointer";
					if (getStatus() == PhoneStatus.DIS_CONNECT || !checkPhone(text) || status==1 || status==6) {
						cursor = "not-allowed";
					}
					return (<div style={{minWidth:95}} className="aKeyToCall"><span>{text}</span><i onClick={this.callOut.bind(this, text, status)} className={cursor}/></div>);
				}
			}, {
				key: 'userName',
				dataIndex: 'userName',
				title: '分配坐席',
				width: 100,
			}, {
				key: 'callNumber',
				dataIndex: 'callNumber',
				title: '呼叫次数',
				width: 100,
			}, {
				key: 'status',
				dataIndex: 'status',
				title: '结果',
				width: 100,
                render:((text)=>{
                    let SitTypeStatus = ['未接通', '已接通', '未呼叫'];
                    text = SitTypeStatus[text];
                    return text;
                })
			}
		]
	}

    //一键外呼
    callOut(phone, status, e) {
		e.stopPropagation();
		if (getStatus() == PhoneStatus.DIS_CONNECT || !checkPhone(phone) || status==1 || status==6) return;
		let {taskId} = this.props;
        callOut(phone,'',2,taskId);
    }

	onCurrentPage(value)
	{
		let {detailsSelectVal, searchVal} = this.state;
		this.setState({
			currentPage: value
		})

		this.getsitTable(detailsSelectVal, searchVal, value)
	}

	detailsSelectChange(value)
	{
		let {searchVal} = this.state;

		this.setState({
			detailsSelectVal: value,
		})
        this.getsitTable(value,searchVal)

	}

	/* 详情= 刷新(Rrload) */
	onCallOutDetailsReload()
	{
		let {detailsSelectVal,searchVal} = this.state;

        this.getsitTable(detailsSelectVal,searchVal)
		//api 调取
	}

	onSearchValChange(e)
	{
		let {detailsSelectVal} = this.state,
			value = e.target.value;

		this.setState({
            searchVal: value
		})
	}

	onSearchVal(value)
	{
		let {detailsSelectVal,searchVal} = this.state;

		this.getsitTable(detailsSelectVal, searchVal)
		
	}

    detailsExportFn(){
        let {searchVal} = this.state,
            {taskId} = this.props,
            {siteId} = loginUserProxy();
        return `${configProxy().xNccRecordServer}/tasks/items/export/${taskId}?key=${searchVal}`
    }

	ondetailsExport()
	{
        return this.detailsExportFn();
	}

    onCallOutDetailsType(){
		let {actions} = this.props;
		actions.setBraedCrumbFlag(false)
        this.props.DetailsShow(false)
    }

	render()
	{
		let {queryList, sitList,setting} = this.props,
			{currentPage, searchVal, detailsSelectVal, eventListener} = this.state,
			{taskName, startTime, endTime, createTime, status, resource, vistorNumber, waiterNumber, describe} = queryList,
			{list, totalPage} = sitList;
			console.log(eventListener);//刷新页面使用

		return <div  className="Call-Details">

			<div>
				<Button onClick={this.onCallOutDetailsType.bind(this)} style={{left:'10px',top:'9px',border:"none"}} className="Callout-Reload">
                <span>{'<'}</span>&nbsp;&nbsp;返回
           		</Button>
				<Button onClick={this.onCallOutDetailsReload.bind(this)} className="Callout-Reload" style={{float:"right",top:"8px",right:"10px"}}>
					<Icon type="reload" className="Callout-Reload-Icon"/>刷新
				</Button>
			</div>
     
			<div className="Call-Details-box">

				<ul>
					<li>任务名称：
							<span title={taskName}>{taskName}</span>
					</li>
					<li>开启时间： <span>{moment(startTime).format("YYYY-MM-DD HH:mm:ss")}</span></li>
					<li>结束时间： <span>{moment(endTime).format("YYYY-MM-DD HH:mm:ss")}</span></li>
					<li>创建时间： <span>{moment(createTime).format("YYYY-MM-DD HH:mm:ss")}</span></li>
					<li>当前状态： <span>{status==1?'未开始':status==2?'进行中':status==3?'已完成':status==4?'已过期':status==5?'滞后完成':status==6?'暂停':status}</span></li>
					<li>来源： <span>{resource==1?'客户导入':resource==2?'呼入未接':resource==3?'呼出未接':resource}</span></li>
					<li>客户数量： <span>{vistorNumber}</span></li>
					<li>坐席数量： <span>{waiterNumber}</span></li>
					<li>任务描述： <span>{describe}</span></li>
				</ul>
			</div>
			<div className="bindonSearch searchBox search">
			{
				setting.includes('callcenter_outbound_task_export')?
				<ExportComponent isexportAll={true} url={this.ondetailsExport()}/>
				:null
				}
				<Select className="CallTask-Select" value={detailsSelectVal}
				        onChange={this.detailsSelectChange.bind(this)}>
					<Option value={-1}>所有结果</Option>
					<Option value={0}> 未接通</Option>
					<Option value={1}> 已接通</Option>
					<Option value={2}> 未呼叫</Option>
				</Select>
				<Input placeholder="请输入客户名称模糊查询" maxLength={50} value={searchVal}
				       onChange={this.onSearchValChange.bind(this)}/>
				<Button className="searchBtn" type="primary" onClick={this.onSearchVal.bind(this)}
				        icon="search"></Button>
			</div>
			<div>
				<NTTableWithPage currentPage={currentPage} dataSource={list} columns={this.getColumn()}
				                 total={totalPage} selectOnChange={this.onCurrentPage.bind(this)}
				/>
			</div>
		</div>;
	}
}

const mapStateToProps = (state) => {
	let {calloutTaskReducer,startUpData} = state;

	return {
		queryList: calloutTaskReducer.get("queryList") || {},
		sitList: calloutTaskReducer.get("sitList") || {},
		taskId: calloutTaskReducer.get("taskId") || "",
		setting : startUpData.get("callcenter") || [],
	};
}

const mapDispatchToProps = (dispatch) => ({
	actions: bindActionCreators({sitTableCallOutTask, exportExcelDetails,setBraedCrumbFlag}, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(CallOutTaskdetails);

// <Button type="primary" className="CallTask-Batch">批量外呼</Button>
// <Button type="primary" className="CallTask-Action">开始</Button>
//     <Button type="primary" className="CallTask-Stop">停止</Button>
