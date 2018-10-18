import React from "react";
import { Button} from 'antd';
import './style/CallRecord.less';
import './style/searchListComp.less';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { configProxy, loginUserProxy } from "../../../utils/MyUtil";
import { setBraedCrumbFlag } from "../redux/reducers/telephonyScreenReducer";
import { getCallOutTaskList, enclosureCallOutTask, queryCallOutTask, updateCalloutTask, sitTableCallOutTask, CalloutTaskPut ,exportExcelCalloutTask} from "../redux/reducers/calloutTaskReducer"
import CalloutTaskComponent from "../util/CalloutTaskComponent"
import CalloutTaskSearchComponent from "../util/CalloutTaskSearchComponent"
import NTTableWithPage from "../../../components/NTTableWithPage"
import { getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import moment from "moment";
import ExportComponent from "../../../components/ExportComponent";
import {truncateToPop} from "../../../utils/StringUtils";
import PhoneTaskStatus from "../../../model/vo/PhoneTaskStatus";
import { ReFresh } from "../../../components/ReFresh";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

class CalloutTask extends React.Component {
	constructor(props)
	{
		super(props);

		this.state = {
			modalShow: false,
			visible: false,
			taskselectValue: -1,
			taskStatusselectValue: -1,
			taskSearchVal: "",
			currentPage: props.currentPage,
			taskNumber: [],
			actionsType: "",
			taskId: "",
		}
	}

	componentDidMount()
	{
		let {taskselectValue,taskStatusselectValue,taskSearchVal,currentPage} = this.state;
		this.getCallOutTask(taskselectValue,taskStatusselectValue,taskSearchVal,currentPage);

	}

	componentWillReceiveProps(nextProps)
	{	
		let {taskselectValue,taskStatusselectValue,taskSearchVal,currentPage} = this.state;
		if(nextProps.reloadFlag && !this.props.reloadFlag)
		{
			this.getCallOutTask(taskselectValue,taskStatusselectValue,taskSearchVal,currentPage);
		}
	}

	getCallOutTask(resource, status, taskName, currentPage = 1)
	{
		let {actions} = this.props;

		actions.getCallOutTaskList(resource, status, taskName, currentPage);
	}

	getColumn()
	{
		return [
			{
				key: 'taskName',
				dataIndex: 'taskName',
				title: '任务名称',
				width: 110,
                className:"calloutTask",
                render:((text)=>{
                    let templateDom=document.getElementsByClassName("calloutTask"),
                        widths=87,
                        ReturnContent=truncateToPop(text,widths,12);

                    if(ReturnContent.show){
                        return (
                                <span title={ReturnContent.popString}>{ReturnContent.content}</span>
                        )
                    }else{
                        return text;
                    }
                })

			}, {
				key: 'startTime',
				dataIndex: 'startTime',
				title: '开始时间',
				width: 140,
				render: ((text) => {
					text = moment(text)
					.format("YYYY-MM-DD HH:mm:ss");
					return <span>{text}</span>;
				})

			}, {
				key: 'endTime',
				dataIndex: 'endTime',
				title: '结束时间',
				width: 140,
				render: ((text) => {
					text = moment(text)
					.format("YYYY-MM-DD HH:mm:ss");
                    return <span>{text}</span>;
				})
			}, {
				key: 'vistorNumber',
				dataIndex: 'vistorNumber',
				title: '客户数量',
				width: 80,
			},
			{
				key: 'waiterNumber',
				dataIndex: 'waiterNumber',
				title: '坐席数量',
				width: 80,
			},{
				key: 'resource',
				dataIndex: 'resource',
				title: '任务来源',
				width: 80,
				render: ((text) => {
					let resourceArr = ['', '客户导入', '呼入未接', '呼出未接'];
					text = resourceArr[text];

					return text;
				})
			}, {
				key: 'status',
				dataIndex: 'status',
				title: '状态',
				width: 80,
				render: ((text) => {
					let statusArr = ['', '未开始', '进行中', '已完成', '已过期', '滞后完成', '暂停'];
					text = statusArr[text];

					return text;
				})
			}, {
				key: 'callNumber',
				dataIndex: 'callNumber',
				title: '呼叫次数',
				width: 80,
			}, {
				key: 'executeNumber',
				dataIndex: 'executeNumber',
				title: '执行量',
				width: 80,
			}, {
				key: 'connectNumber',
				dataIndex: 'connectNumber',
				title: '接通量',
				width: 80,
			}, {
				key: 'taskId',
				dataIndex: 'taskId',
				title: '操作',
				width: 100,
				render: (text, data, index) => (
						//状态    0或者空选择所有； 1未开始；2进行中；3已完成；4已过期；5滞后完成；6暂停
		
				<div onClick={this.eStopPropagation.bind(this)}>
					{ this.props.setting.includes('callcenter_outbound_task_edit')?
					 		<div >
							 {
								 data.status == 6 ? <Button className="CalloutTask_btn" icon="caret-right"
															onClick={this.onUpdateFn.bind(this, text, 'start')}></Button> : null
							 }
							 {
								 data.status == 4 || data.status == 2 ?
									 <Button className="CalloutTask_btn" icon="pause"
											 onClick={this.onUpdateFn.bind(this, text, 'stop')}></Button> : null
							 }
							 {
								 data.status == 1 || data.status == 6 ?
									 <i className="icon-bianji iconfont CalloutTask_btn"
											 onClick={this.onCallTaskEdit.bind(this, text)} /> : null
							 }
							 {
								 data.status == 1 || data.status == 6 ?
									 <i className="icon-shanchu iconfont CalloutTask_btn"
											 onClick={this.onUpdateFn.bind(this, text, 'delete')} /> : null
							 }
						 </div>
				:<div>
						 		<Button className="CalloutTask_btn" icon="caret-right"
															onClick={this.onTaskQuery.bind(this,text)}></Button>
							
				</div>
				}
				</div>
		
				),
			}
		]
	}

	onTaskQuery(taskId)
	{
		let {actions} = this.props;
		
		this.onCalloutDetails(taskId);
		
		actions.setBraedCrumbFlag(true);
	}

    eStopPropagation(e){
        e.stopPropagation();
    }	

	onUpdateFn(taskId, types,)
	{

		let _this=this;
		if(types == 'delete')
		{
			confirm({
				title: '提示',
				content: '是否确认删除?',
				onOk()
				{
					let {actions} = _this.props;
					actions.updateCalloutTask(taskId, types)
				},
				onCancel()
				{
				},
			});
		}
		else
		{
			let {actions} = _this.props;
			actions.updateCalloutTask(taskId, types)
		}
	
	}

	/*打开新建外呼任务*/
	onEnClosure()
	{
		this.setState({
			modalShow: true,
			visible: true
		});
	}

	/*关闭Modal*/
	onEnClosureClose()
	{
		this.setState({
			modalShow: false,
			visible: false
		});
	}

	onCallOutTaskCreate()
	{
		this.onEnClosure();
		this.setState({
			actionsType: 'create'
		})
	}

	onCallTaskEdit(taskId, e)
	{

		this.setState({
			actionsType: 'edit',
			taskId
		})

		this.onEnClosure();
		let {actions} = this.props;

		actions.queryCallOutTask(taskId);
	}

	/*搜索 = 状态 任务*/
	_onTaskSelectValue(type, value, searchVal = "")
	{

		let {taskselectValue, taskStatusselectValue, taskSearchVal, currentPage} = this.state;
		currentPage = 1;

		if(type)
		{
			if(type == 'taskselectValue')
			{
				this.setState({
					taskselectValue: value,
					currentPage: currentPage,
				})
                this.getCallOutTask(value,taskStatusselectValue,taskSearchVal)
			}
			else if(type == "taskStatusselectValue")
			{
				this.setState({
					taskStatusselectValue: value,
					currentPage: currentPage,
				})
                this.getCallOutTask(taskselectValue,value,taskSearchVal)
			}
		}
	}

	/*搜索 = 任务名*/
	ontaskSearchVal(value)
	{
		let {taskselectValue, taskStatusselectValue} = this.state;
		this.setState({
			taskSearchVal: value,
		})

		this.getCallOutTask(taskselectValue, taskStatusselectValue, value);

	}

	onCurrentPage(value)
	{
		let {taskselectValue, taskStatusselectValue, taskSearchVal} = this.state;
		this.setState({
			currentPage: value
		})
		this.getCallOutTask(taskselectValue, taskStatusselectValue, taskSearchVal, value)
	}

	onFormDatachange(form)
	{
		let {actions} = this.props,
			{taskNumber, actionsType} = this.state,
			startTime = moment(form.startTime)
			.valueOf(),
			endTime = moment(form.endTime)
			.valueOf();

		form.taskNumber = taskNumber;
		form.startTime = startTime;
		form.endTime = endTime;
		form.resource=1;
		form.userIds = form.userIds.join(",");
		if(actionsType == 'edit')
		{
			delete form['userIds']
			delete form['taskNumber']
			this.enclosureCalloutTaskPut(form);
		}
		else
		{
			actions.enclosureCallOutTask(form);
		}
		this.onEnClosureClose();
	}

	enclosureCalloutTaskPut(form)
	{
		let {actions} = this.props,
			{taskId} = this.state;

		    actions.CalloutTaskPut(taskId, form);
	}

	taskNumberForm(value)
	{
		this.setState({
			taskNumberList: value
		})
	}

	_getProgressComp()
	{
		let {progress, dataList} = this.props;

		if(progress)
		{
			if(progress === LoadProgressConst.LOAD_COMPLETE)
				return;
			if(dataList == null)
			{
				return;
			}
			if(progress === LoadProgressConst.LOADING)  //正在加载
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

	reFreshFn()
	{
		this.getCallOutTask();
	}

	onCalloutDetails(taskId)
	{
		let {actions} = this.props;

		actions.queryCallOutTask(taskId),
			actions.sitTableCallOutTask(taskId)

		this.props.DetailsShow(true, this.state.currentPage);
	}

	onRow(data)
	{
        let {actions} = this.props;
		if(data)
		{
			this.onCalloutDetails(data.taskId);
            actions.setBraedCrumbFlag(true);
		}
	}

    calloutExportfn(){

        let {taskselectValue, taskStatusselectValue, taskSearchVal} = this.state,
            {siteId,userId} = loginUserProxy();

        return `${configProxy().xNccRecordServer}/tasks/export/${siteId}/?userId=${userId}&resource=${taskselectValue}&status=${taskStatusselectValue}&taskName=${taskSearchVal}`

	}
	
    onCalloutTaskExport() {

        return this.calloutExportfn();
    }

	render()
	{
		let {taskselectValue, taskStatusselectValue, currentPage, actionsType,modalShow,visible} = this.state;
		let {dataList,setting} = this.props,
			{list, totalRecord} = dataList;

		return <div className="callOutTask">
			<CalloutTaskSearchComponent _onSelect={this._onTaskSelectValue.bind(this)} taskselectValue={taskselectValue}
			                            taskStatusselectValue={taskStatusselectValue}
			                            _ontaskSearchVal={this.ontaskSearchVal.bind(this)}/>
			<div className="callRecordListSelectedWrap" style={{left:"6px"}}>
				{
				setting.includes('callcenter_outbound_task_export')?
				<ExportComponent clsName="newoutTast-Export"  isexportAll={true} url={this.onCalloutTaskExport()}/>
				:null
				}
				{
					setting.includes('callcenter_outbound_task_edit')?
					<Button type="primary" className="newoutTast-Insert"
					onClick={this.onCallOutTaskCreate.bind(this)}>新建外呼任务</Button>
					:null
				}
	
			</div>
			<div>
				<NTTableWithPage onRow={this.onRow.bind(this)}
				                 currentPage={currentPage} dataSource={list} columns={this.getColumn()}
				                 total={totalRecord} selectOnChange={this.onCurrentPage.bind(this)}/>
			</div>
			<div>
				<CalloutTaskComponent ontaskNumber={this.taskNumberForm.bind(this)}
				                      actionsType={actionsType}
				                      onformData={this.onFormDatachange.bind(this)} modalShow={modalShow}
				                      visible={visible} handleCancel={this.onEnClosureClose.bind(this)}/>
			</div>
			{
				this._getProgressComp()
			}
		</div>;
	}
}

const mapStateToProps = (state) => {
	let {calloutTaskReducer,startUpData} = state;
	return {
		dataList: calloutTaskReducer.get("dataList") || {},
		progress: calloutTaskReducer.get("progress") || {},
		setting :startUpData.get("callcenter") || [],
		reloadFlag: calloutTaskReducer.get("calloutTaskReloadFlag") || false,

	};
}

const mapDispatchToProps = (dispatch) => ({
	actions: bindActionCreators({
		getCallOutTaskList, enclosureCallOutTask, queryCallOutTask, updateCalloutTask,
		sitTableCallOutTask, CalloutTaskPut,setBraedCrumbFlag
	}, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(CalloutTask);
