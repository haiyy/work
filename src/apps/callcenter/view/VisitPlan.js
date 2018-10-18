import React from "react"
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { getVisilPlanList, operationVisilPlanList, getTimesVisilPlanList, updateProgress, updateDate } from "../redux/reducers/visitPlanReducer";
import { Button,  Icon ,Tooltip} from 'antd';
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
import { ReFresh } from "../../../components/ReFresh";
import DatePickerComponent from "../../record/public/DatePickerComponent"
import './style/CallRecord.less'
import './style/searchListComp.less'
import { getProgressComp } from "../../../utils/MyUtil";
import NTTableWithPage from "../../../components/NTTableWithPage";
import TelephonVisitPlanComponent from "../util/TelephonVisitPlanComponent";
import moment from 'moment';
import { callOut, getStatus } from "../../../utils/PhoneUtils";
import { PhoneStatus } from "../lib/Xn.PhoneCall";
import { getTableTdContent } from "../../../utils/ComponentUtils";
import TelephonyServiceRecord from "./telephenyScreen/TelephonyServiceRecord";
import {truncateToPop, checkPhone} from "../../../utils/StringUtils";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

//const confirm = Modal.confirm;

class VisitPlan extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {
			currentPage: 1,
			visible: false,
			ModalShow: false,
			Visible: false,
			resultValue: -1,
			editMessage: {},//编辑信息
			editModal: false,
		};
	}

	componentDidMount()
	{
		let {startTamp, endTamp} = this.props.datePicker;
		this.getVisitPlanList('', startTamp, endTamp);
	}


	getVisitPlanList(result = '', startTime = '', endTime = '', currentPage = 1)
	{
		let {actions} = this.props;
		console.log(result);
		actions.getVisilPlanList(result, startTime, endTime, currentPage);
	}

	//开始时间结束时间改变
	changeSearchVal(startTamp, endTamp, selectValue)
	{
		let {resultValue} = this.state,
			type = resultValue == -1 ? "" : resultValue;

		this.getVisitPlanList(type, startTamp, endTamp);

		this.props.actions.updateDate(startTamp, endTamp, selectValue)
	}

	reFreshFn()
	{
		let {resultValue} = this.state,
			type = resultValue == -1 ? "" : resultValue;
		let {startTamp, endTamp} = this.props.datePicker;

		this.getVisitPlanList(type, startTamp, endTamp);
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
				return <ReFresh reFreshStyle={{left: 0, top: 0}} reFreshFn={this.reFreshFn.bind(this)}/>;
			}
		}
		return null;
	}

	//编辑
	onEditItem(types, item, e)
	{
		e.stopPropagation();
	
		this.setState({
			editMessage: item,
			editModal: true,
			planTime:item.planTime,
		});
	}

	//删除
	onDeleteItem(types, item, e)
	{
		e.stopPropagation();
		let {actions} = this.props,
			data = {
				planId: item.planId,
				action: types,
				planTime: item.planTime
			};
		confirm({
			title: '提示',
			content: '确定删除吗?',
			onOk()
			{
				actions.operationVisilPlanList(data)
			},
			onCancel()
			{
			},
		});

	}

	//编辑取消
	onVisitPlanClose()
	{
		this.setState({
			editModal: false,
			editMessage: {}
		});
	}

	//编辑点击确定
	onFormDatachange(formData)
	{
		let {actions} = this.props,
			{planId} = this.state.editMessage,
            {planTime,remarks}=formData,
            data={};

			data = {
				planId: planId,
				action: "change",
				planTime: planTime,
                remarks: remarks
			};


		actions.operationVisilPlanList(data);
		this.onVisitPlanClose();
	}

	savingTip()
	{
		const {progress, msg} = this.props;
		if(progress == LoadProgressConst.SAVING_FAILED)
		{
			error({
				title: '提示',
				content: msg,
				okText: '确定'
			});
			this.props.actions.updateProgress();
		}
		if(progress == LoadProgressConst.SAVING_SUCCESS)
		{
			success({
				title: '提示',
				content: msg,
				okText: '确定'
			});
			this.reFreshFn();//刷新数据
			this.props.actions.updateProgress();
		}
	}

	//一键外呼
	callOut(phone, id, e)
	{
		e.stopPropagation();
		if (getStatus() == PhoneStatus.DIS_CONNECT || !checkPhone(phone)) return;
		callOut(phone, '', 1, id);
	}

	getColumn()
	{
		return [
			{
				key: 'vistorName',
				dataIndex: 'vistorName',
				title: '客户名称',
                className:'visitPlanName',
                width: 130,
                render:((text,record)=>{
                    let templateDom=document.getElementsByClassName("visitPlanName"),
                        widths=102,
                        ReturnContent=truncateToPop(text,widths,12);

                    if(ReturnContent.show){
                        return (
                            <Tooltip title={ReturnContent.popString} getPopupContainer={() => document.querySelector(".callCenterScrollArea")}>
                                <span>{ReturnContent.content}</span>
                            </Tooltip>
                        )
                    }else{
                        return text;
                    }
                })
			}, {
				key: 'phoneNumber',
				dataIndex: 'phoneNumber',
				title: '电话号码',
				width: 110,
				render: (text, current) => {
					let cursor = "pointer";
					if (getStatus() == PhoneStatus.DIS_CONNECT || !checkPhone(text)) {
						cursor = "not-allowed";
					}
					return (<div style={{minWidth:95}} className="aKeyToCall"><span>{text}</span><i onClick={this.callOut.bind(this, text, current.planId)} className={cursor}/></div>);
				}
			}, {
				key: 'serviceRecord',
				dataIndex: 'serviceRecord',
				title: '服务记录',
				width: 120,
				render: (text, current) => {
					return <a>查看用户通话记录</a>
				}
			}, {
				key: 'planTime',
				dataIndex: 'planTime',
				title: '计划时间',
				width: 140,
				render: (text) => {
					return <p style={{minWidth:125}}>{moment(text)
					.format("YYYY-MM-DD HH:mm")}</p>;
				}
			}, {
				key: 'remarks',
				dataIndex: 'remarks',
				title: '备注',
				width: 135,
				render: (text, data) => {
					let tableWidth = (this.refs.visitplan && this.refs.visitplan.clientWidth) ? this.refs.visitplan.clientWidth : 0;
					return getTableTdContent(data.remarks, 120 / 1100.0 * tableWidth);
				}
			}, {
				key: 'userId',
				dataIndex: 'userId',
				title: '坐席分配',
				width: 135,
			}, {
				key: 'result',
				dataIndex: 'result',
				title: '回访结果',
				width: 100,
				render: (text) => (text == 0 ? "未呼叫" : (text == 1 ? "未接通" : "已接通"))
			},
			{
				title: '操作',
				dataIndex: 'actions',
				width: 100,
				render: (text, record) => {
					return (record.result == 0 ?
							<div>
								<i className="icon-bianji iconfont CalloutTask_btn" onClick={this.onEditItem.bind(this, 'change', record)}
								        style={{border: 'none', background: 'none'}} />
								<i className="icon-shanchu iconfont CalloutTask_btn" onClick={this.onDeleteItem.bind(this, 'delete', record)}
								        style={{border: 'none', background: 'none'}} />
							</div> : ""
					);
				},
			}
		]
	}

	//查看通话记录
	chatServiceRecord(record)
	{
		this.setState({
			visible: true,
			record
		});
	}

	//取消查看通话记录
	serviceRecordCancle()
	{
		this.setState({visible: false});
	}

	//分页跳转
	onCurrentPage(value)
	{
		let {resultValue} = this.state, {startTamp, endTamp} = this.props.datePicker;

		resultValue=resultValue=='-1'?resultValue='':resultValue;
		this.getVisitPlanList(resultValue, startTamp, endTamp, value);
	}

	//呼入呼出选择
	onResultChange(value)
	{
		this.setState({
			resultValue: value
		});
		let {startTamp, endTamp} = this.props.datePicker,
			type = value == -1 ? "" : value;

		this.getVisitPlanList(type, startTamp, endTamp);
	}

	getDetails()
	{
		let {visible, record} = this.state,
			callId = record && record.callId;

		if(visible && callId)
		{
			return (
				<Modal className="TelephonyScreen-right-Modal" visible title="查看服务记录" footer={null}
					   style={{top:200}}
				       onCancel={this.serviceRecordCancle.bind(this)}>
					<TelephonyServiceRecord callId={callId}/>
				</Modal>
			);
		}

		return null;
	}

	render()
	{
		let {dataList, datePicker} = this.props,
			{editMessage} = this.state,
			{list, totalPage, currentPage} = dataList,
			{phoneNumber, planTime, remarks} = editMessage || {},
			{startTamp, endTamp, selectValue} = datePicker,
			rangeTime = [moment(startTamp), moment(endTamp)];

		return (
			<div className="CallRecord visitplan">
				<DatePickerComponent selectValue={selectValue} rangeTime={rangeTime} resultTypes="true" onResultValue={this.onResultChange.bind(this)}
				                     _onOk={this.changeSearchVal.bind(this)}/>

				<div ref="visitplan">
					<NTTableWithPage flagTypes={"vistPlan"} dataSource={list} columns={this.getColumn()}
					                 total={totalPage} selectOnChange={this.onCurrentPage.bind(this)} pageShow
					                 currentPage={currentPage} onRow={this.chatServiceRecord.bind(this)}/>
				</div>

				<TelephonVisitPlanComponent onformData={this.onFormDatachange.bind(this)} PhoneNumber={phoneNumber}
				                            remarks={remarks} planTime={planTime} Visible={this.state.editModal}
				                            handleCancel={this.onVisitPlanClose.bind(this)} isEdit/>
				{
					this._getProgressComp()
				}
				{
					this.savingTip()
				}
				{
					this.getDetails()
				}
			</div>
		);

	}
}

const mapStateToProps = (state) => {
	let {visitPlanReducer} = state;

	let timeStamp = new Date(new Date().setHours(0, 0, 0, 0)),
			startTamp = timeStamp.getTime(),
			endTamp = timeStamp.getTime() + (86400 - 1) * 1 * 1000;
	let datePicker = {startTamp, endTamp, selectValue:'今天'};

	return {
		dataList: visitPlanReducer.get("dataList") || {},
		timeList: visitPlanReducer.get("timerList") || {},
		progress: visitPlanReducer.get("progress") || {},
		msg: visitPlanReducer.get("msg") || "",
        reloadFlag: visitPlanReducer.get("visitPlanReloadFlag") || false,
		datePicker: visitPlanReducer.get("datePicker") || datePicker
    };
}

const mapDispatchToProps = (dispatch) => ({
	actions: bindActionCreators({
		getVisilPlanList, operationVisilPlanList, getTimesVisilPlanList, updateProgress, updateDate
	}, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(VisitPlan);
