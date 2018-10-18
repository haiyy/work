import React from "react"
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { Button, Select, Card, Popover, message } from 'antd';
import { getCallListenRecord, getMonitorStatistics, updateCallListenRecord, getReceptionList, getCallListenStatus } from "../redux/reducers/callListenreducer";
import NTTableWithPage from "../../../components/NTTableWithPage";
import {ReFresh} from "../../../components/ReFresh";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import './style/callListen.less';
import './style/searchListComp.less';
import {formatTimestamp, getProgressComp, getFormatTime} from "../../../utils/MyUtil";
import {on, callManager, releaseCall, removeListener, getStatus, isInTheCall} from "../../../utils/PhoneUtils";
import { PhoneStatus } from "../lib/Xn.PhoneCall";
import { getTableTdContent } from "../../../utils/ComponentUtils";

const Option = Select.Option;

const monitorList = [{name:"实时监控",value:[{name:"当前通话",key:"callNumber"},
											{name:"当前排队",key:"lineUpNumber"},
											{name:"空闲",key:"freeNumber"},
											{name:"忙碌",key:"busyNumber"},
											{name:"会议",key:"meetingNumber"},
											{name:"小休",key:"restNumber"},
											{name:"离线",key:"offline"}]},
						{name:"通话统计",value:[{name:"今日接通",key:"answerNumber"},
												{name:"今日未接",key:"unansweredNumber"},
												{name:"今日接通率",key:"answerNumberRate"},
												{name:"今日呼出",key:"callOutNumber"},
												{name:"今日呼通",key:"callOutConnectNumber"},
												{name:"今日呼通率",key:"callOutConnectNumberRate"}]},
						{name:"排队统计",value:[{name:"今日排队成功",key:"lineUpSuccessNumber"},
												{name:"今日放弃排队",key:"giveUpQueueNumber"},
												{name:"今日排队超时",key:"lineUpTimeOutNumber"}]},
						{name:"参评统计",value:[{name:"满意度",key:"satisfaction"},
											{name:"参评率",key:"evaluationRate"},
											{name:"参评",key:"evaluationNumber"},
                                            {name:"满意",key:"satisfactionNumber"},
                                            {name:"一般",key:"generalNumber"},
                                            {name:"不满意",key:"noSatisfactionNumber"}]}
						];//呼叫监控相关数据
//在线状态
const onlineStatus = ["离线", "空闲", "忙碌", "小休", "会议"];
//通话状态
const callStatus = ["未通话", "振铃中", "通话中", "静音中", "保持中", "三方中", "转接中", "咨询中"];
//刷新时间
const refreshTime = [5,10,15,30];

class CallListen extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {
			currentPage:1,
			operate:2,
			templateId:"",//接待组id
			onlineStatus:"",//0离线，1在线，2忙碌，3小休，4会议
			callStatus:"",//0:未通话，1：振铃中，2：通话中，3：静音中，4：保持中，5：三方中，6：转接中
			pageSize:10,
			refreshOnceTime:30,//刷新间隔时间
			restTime:30,//距离下次刷新剩余时间
			restRefreshTime:formatTimestamp(new Date(),true),//上次刷新数据时间
		};

		this.receptionHandleChange = this.receptionHandleChange.bind(this);
		this.refreshCallListen = this.refreshCallListen.bind(this);
		this.loadMonitorList = this.loadMonitorList.bind(this);
		this.refreshData = this.refreshData.bind(this);
		this.onlineHandleChange = this.onlineHandleChange.bind(this);
		this.phoneHandleChange = this.phoneHandleChange.bind(this);
		this.tableHandleChange = this.tableHandleChange.bind(this);
		this.listenResult = this.listenResult.bind(this);
	}

	componentDidMount()
	{
		let {operate, templateId, onlineStatus, callStatus, pageSize, currentPage} = this.state;
		this.props.getCallListenRecord(operate, templateId, onlineStatus, callStatus, currentPage, pageSize);
		this.props.getReceptionList();
		this.props.getMonitorStatistics();

		this.refreshCallListen();

		on("Event_NotifyResult", this.listenResult);
	}

	componentWillUnmount() {
		if (this.interval) {
			clearInterval(this.interval);
		}
		removeListener("Event_NotifyResult", this.listenResult);
	}

	listenResult(eventType, result) {
		console.log("listenResult eventType = ", eventType, "result = ", result, this.props);

		let record = this.props.dataList;
		for (let i = 0;i < record.list.length;i++) {
			if (record.list[i].userId == result.content.targetUserId) {
				let r = result.content.result,//0表示成功
				errorTip = "";
				if (result.status == 80) {//监听
					if (r == 0) {
						record.list[i].operatedisabled = false;
						record.list[i].isMonitor = 1;
					} else {
						errorTip = "监听失败，请刷新后再试";
					}
				} else if (result.status == 81) {//停止监听
					if (r == 0) {
						record.list[i].operatedisabled = false;
						record.list[i].isMonitor = 0;
					} else {
						errorTip = "停止监听失败，请刷新后再试";
					}
				} else if (result.status == 82) {//强插
					if (r == 0) {
						record.list[i].callStatus = 5;
						record.list[i].operatedisabled = false;
						record.list[i].isStrongInsertion = 1;
					} else {
						errorTip = "强插失败，请刷新后再试";
					}
				} else if (result.status == 83) {//强拆
					if (r == 0) {
						record.list[i].callStatus = 0;//未接通
						record.list[i].isStrongInsertion = 0;
						record.list[i].isMonitor = 0;
					} else {
						errorTip = "强拆失败，请刷新后再试";
					}
				} else if (result.status == 84) {//强制置闲
					if (r == 0) {
						record.list[i].status = 1;
						record.list[i].statusdisabled = false;
					} else {
						errorTip = "强制置闲失败，请刷新后再试";
					}
				} else if (result.status == 85) {//强制置忙
					if (r == 0) {
						record.list[i].status = 2;
						record.list[i].statusdisabled = false;
					} else {
						errorTip = "强制置忙失败，请刷新后再试";
					}
				} else if (result.status == 86) {//强制签出坐席
					if (r == 0) {
						record.list[i].status = 0;
						record.list[i].statusdisabled = false;
					} else {
						errorTip = "强注销失败，请刷新后再试";
					}
				}
				if (r == 0) {
					this.props.updateCallListenRecord(record);
				} else {
					message.error(errorTip);
					this.reFreshFn();
				}
				break;
			}
		}
		
	}

	//接待组列表
	receptionList(list) {
		return list.map((value, index)=>(
			<Option value={value.xntemplateId} key={index}>{value.templateName}</Option>
		));
	}

	//接待组选项
	receptionHandleChange(value) {
		this.setState({
			templateId:value
		});
		let {operate,onlineStatus,callStatus,pageSize,currentPage} = this.state;
		this.props.getCallListenRecord(operate, value, onlineStatus,callStatus, currentPage, pageSize);
	}

	//倒计时30s
	refreshCallListen() {
		this.interval = setInterval(()=>{
			let rest = this.state.restTime;
			if (rest == 0) {
				//每30秒刷新一次
				this.reFreshFn();
				return;
			}
			this.setState({
				restTime:rest-1
			});
		},1000);
	}

	//刷新按钮点击
	refreshData() {
		this.reFreshFn();
	}

	//加载监控数据
	loadMonitorList(monitorStatics) {
		return monitorList.map(({name, value}, index)=>{
			let settingW = this.refs.callListen?this.refs.callListen.clientWidth-24:0;
            let w = (settingW-20*4-30-8*2)/12;//card与card之间是10,3个是30;每个card的padding是10,左右两边加起来是20,4个card则是20*4
			let right = 10;
			if (w < 81) {//81为一列的最小宽度
				if (index == 0 || index == 1) {
					w = (settingW - 20*2 - 10 - 10)/7;
					if (index == 1) {
						right = 0;
					}
				} else if (index == 2 || index == 3) {
					w = (settingW - 20*2 - 10 - 10)/5;
				}
			}
			if (index == 3) {
				right = 0;
			}
			let inner = value.map(({name,key}, index)=>{
				let number = monitorStatics[key]?monitorStatics[key]:0;
				//今日接通率 今日呼通率 满意度 参评率
				if (key == "answerNumberRate" || key == "callOutConnectNumberRate" || key == "satisfaction" || key == "evaluationRate") {
					if (parseInt(number*100) != parseFloat(number*100)) {
						number = parseFloat(number*100).toFixed(2).toString()+"%";
					} else {
						number = parseFloat(number*100).toString()+"%";
					}
				}
				return (
				<div className="floatleft" key={index}>
					<div className="column" style={{width:w}}>
						<p className="name">{name}</p>
						<p className="numer">{number}</p>
					</div>
					<div className="vertical"/>
				</div>
			)});
			let classname = "card realtimeCard";
            if (index == 0) {
                classname = "card realtimeCard1";
            } else if (index == 2) {
				classname = "card realtimeCard2";
			}
			return (<Card key={index} title={name} className={classname} style={{marginRight:right}}>
						<div>{inner}</div>
					</Card>);
		});
	}

	//在线状态选择
	onlineHandleChange(value) {
		this.setState({
			onlineStatus:value
		});
		let {operate,templateId,callStatus,pageSize,currentPage} = this.state;
		this.props.getCallListenRecord(operate, templateId, value,callStatus, currentPage, pageSize);
	}

	//通话状态选择
	phoneHandleChange(value) {
		this.setState({
			callStatus:value
		});
		let {operate, templateId, onlineStatus, pageSize, currentPage} = this.state;
		this.props.getCallListenRecord(operate, templateId, onlineStatus, value, currentPage, pageSize);
	}

	//操作加载
	loadOperate(data,current) {
		let {item1, item2, item3, operatedisabled, isMonitor, isStrongInsertion, callStatus} = current, cannotQiangCha = true;
		if (!operatedisabled) {
			operatedisabled = false;
		}

		if (getStatus() == PhoneStatus.DIS_CONNECT) {
			operatedisabled = true;
		} else {
			if (callStatus == 2) {//通话中的才可编辑
				operatedisabled = false;
			} else {
				operatedisabled = true;
			}
		}
		
		if (isMonitor == 1) {//被监听
			item1 = {type:6, name:"停止监听", icon:"canclemonitor"};
		} else {
			item1 = {type:0, name:"监听", icon:"monitor"};
		}
		current.item1 = item1;
		
		if (isStrongInsertion == 1) {//被强插
			item2 = {type:11, name:"挂机", icon:"guaduan"};
			cannotQiangCha = operatedisabled;
		} else {
			item2 = {type:1, name:"强插", icon:"qiangcha"};
			if (!operatedisabled && !isInTheCall()) {
				cannotQiangCha = false;//可强插
			}
		}
		current.item2 = item2;

		item3 = {type:2,name:"强拆",icon:"qiangchai"};
		current.item3 = item3;
		
		if (current.callStatus == 2) {//通话中
			return (<div className="tableoperate">
						<Popover content={item1.name} trigger="hover">
							<Button onClick={this.tableOperate.bind(this,item1.type,current)} disabled={operatedisabled}>
								<i className={item1.icon}></i>
							</Button>
						</Popover>
						<Popover content={item2.name} trigger="hover">
							<Button onClick={this.tableOperate.bind(this,item2.type,current)} disabled={cannotQiangCha}>
								<i className={item2.icon}></i>
							</Button>
						</Popover>
						<Popover content={item3.name} trigger="hover">
							<Button onClick={this.tableOperate.bind(this,item3.type,current)} disabled={operatedisabled}>
								<i className={item3.icon}></i>
							</Button>
						</Popover>
					</div>);
		} else if (current.callStatus == 5) {//三方中
			return (<div className="tableoperate">
						<Popover content={item2.name} trigger="hover">
							<Button onClick={this.tableOperate.bind(this,item2.type,current)} disabled={cannotQiangCha}>
								<i className={item2.icon}></i>
							</Button>
						</Popover>
						<Popover content={item3.name} trigger="hover">
							<Button onClick={this.tableOperate.bind(this,item3.type,current)} disabled={operatedisabled}>
								<i className={item3.icon}></i>
							</Button>
						</Popover>
					</div>);
		} else {
			return (<div style={{width:30}}></div>);
		}
	}

	//分页点击
	tableHandleChange(page) {
		this.setState({currentPage:page});
		let {operate, onlineStatus, callStatus, pageSize, templateId} = this.state;
		this.props.getCallListenRecord(operate, templateId, onlineStatus, callStatus, page, pageSize);
	}

	_getProgressComp() {

        let {progress} = this.props;
        if (progress) {
            if (progress === LoadProgressConst.LOAD_COMPLETE || progress === LoadProgressConst.SAVING_SUCCESS)
                return;
            if (progress=== LoadProgressConst.LOADING || progress === LoadProgressConst.SAVING)  //正在加载或正在保存
            {
                return getProgressComp(progress);
            }else  if (progress === LoadProgressConst.LOAD_FAILED)  //加载失败
            {
				if (this.interval) {
					clearInterval(this.interval);
				}
                return <ReFresh reFreshStyle={{left:0,top:0}} reFreshFn={this.reFreshFn.bind(this)}/>;
            }
        }
        return null;
	}

	//need 判断是否需要计时器
	reFreshFn(need){
		let {operate, templateId, onlineStatus, callStatus, pageSize, currentPage} = this.state;
		this.props.getCallListenRecord(operate, templateId, onlineStatus, callStatus, currentPage, pageSize);
		this.props.getMonitorStatistics();

		this.setState({
			restRefreshTime:formatTimestamp(new Date(),true),
			restTime:this.state.refreshOnceTime
		});
		if (need) {
			this.refreshCallListen();
		}
	}
	
	//获取表头信息
	getDataHeader() {
		return [{ title: "姓名", key: "nickName", dataIndex:"nickName", width:135,
	              render: (text, current)=>{
					 let tableWidth = (this.refs.callListen) ? this.refs.callListen.clientWidth : 0;
					 return getTableTdContent(current.nickName, 120 / 1100.0 * tableWidth);
				 }},
				{title: "工号",key: "attendantAccount",dataIndex:"attendantAccount", width:57},
				{title: "整理时间",key: "workTime",dataIndex:"workTime", width:63},
				{title: "在线状态",key: "status",dataIndex:"status",
				render:(data,current)=>{
					let {statusdisabled} = current;
					if(data == 0) {
						return <p style={{minWidth:48}}>离线</p>;
					} else {
						if (getStatus() == PhoneStatus.DIS_CONNECT || current.callStatus != 0) {
							statusdisabled = true;
						}
						let fhtml = "", bhtml = "";//插入前面还是后面front behind
						let classname = "callStateImg callStateImg" + current.answermode;
						if (data == 1) {
							bhtml = (<Option value="2">
										<i className={classname}/>
										<span className="stateSpan">忙碌</span>
									</Option>);
						} else {
							fhtml = (<Option value="1">
										<i className={classname}/>
										<span className="stateSpan">空闲</span>
									</Option>);
						}
						return (<Select defaultValue={parseInt(data).toString()} value={parseInt(data).toString()} onChange={this.callStatusChange.bind(this,current)} disabled={statusdisabled}>
									{fhtml}
									<Option value={parseInt(data).toString()}>
										<i className={classname}/>
										<span className="stateSpan">{onlineStatus[data]}</span>
									</Option>
									{bhtml}
									<Option value="0">
										<i className={classname}/>
										<span className="stateSpan">离线</span>
									</Option>

								</Select>)
					}
				}},
				{title: "状态时长",key: "statusTime",dataIndex:"statusTime",
			     render:(data)=>{
					 return <p style={{minWidth:65}}>{getFormatTime(data, true)}</p>;
				 }},
				{title: "接听",key: "answerNumber",dataIndex:"answerNumber", width:45},
				{title: "未接",key: "unansweredNumber",dataIndex:"unansweredNumber", width:45},
				{title: "呼出",key: "callOutNumber",dataIndex:"callOutNumber", width:45},
				{title: "呼通",key: "callOutConnectNumber",dataIndex:"callOutConnectNumber", width:45},
				{title: "通话状态",key: "callStatus",dataIndex:"callStatus",
			    render:(data)=>(
					<p style={{minWidth:48}}>{callStatus[data]}</p>
				)},
				{title: "电话号码",key: "phoneNumber",dataIndex:"phoneNumber", render:(data)=>(<p style={{minWidth:85}}>{data}</p>)},
				{title: "通话类型",key: "callType",dataIndex:"callType",
			    render:(data,current)=>{
					if (current.callStatus == 0) {//未接通
						return <p style={{minWidth:48}}></p>;
					} else {
						return <p style={{minWidth:48}}>{data==0?"呼入":"呼出"}</p>;
					}
				}},
				{title: "通话时长",key: "callTime",dataIndex:"callTime",
				render:(data)=>{
					return <p style={{minWidth:55}}>{getFormatTime(data, true)}</p>;
				}},
				{title: "操作",key: "operate",dataIndex:"operate",render: this.loadOperate.bind(this)}];
	}

	//操作 监听 强插 强拆...
	tableOperate(type,data) {

		getCallListenStatus(data.userId, this.tableOperateCallback.bind(this), type, data);

		//更新本条数据,操作按钮变为不可点
		data.operatedisabled = true;
		let record = this.props.dataList;
		for (let i = 0;i < record.list.length;i++) {
			if (record.list[i].userId == data.userId) {
				record.list[i] = data;
				break;
			}
		}
		this.props.updateCallListenRecord(record);
	}

	//强插强拆callback
	tableOperateCallback(status, type, data) {
		if (status == 2) {//通话中才可进行强插等操作
			if (type == 11) {//挂机
				releaseCall();
			} else {
				let param = {
					type:type, 
					callid:data.callId, 
					targetUserId:data.userId,
					targetAttendantAccount:data.attendantAccount,
					targetAttendantNumber:data.attendantNumber,
					caller:data.caller,
					callee:data.callee
				};
				callManager(param);
			}
		} else {
			if (type == 11) {
				message.error("非通话中，无法强拆");
			} else if (type == 0) {
				message.error("非通话中，无法监听");
			} else if (type == 1) {
				message.error("非通话中，无法强插");
			} else if (type == 2) {
				message.error("非通话中，无法强拆");
			} else if (type == 6) {
				message.error("非通话中，无法停止监听");
			} else {
				message.error("操作失败, 请稍后重试");
			}
			this.reFreshFn();
		}
	}

	//在线状态切换
	callStatusChange(data, value) {
        getCallListenStatus(data.userId, this.callStatusCallback.bind(this), data, value);

		//更新本条数据,在线切换按钮变为不可点
		let record = this.props.dataList;
		for (let i = 0;i < record.list.length;i++) {
			if (record.list[i].userId == data.userId) {
				record.list[i].statusdisabled = true;
				break;
			}
		}
		this.props.updateCallListenRecord(record);
	}

	//置忙置闲callback
	callStatusCallback(status, data, value) {
		if (status == 0) {
			let type = "";		
			if (value == 0) {//强注销
				type = 5;
			} else if (value == 2) {//强置忙
				type = 4;
			} else {//强置闲
				type = 3;
			}
			let param = {
				type:type, 
				callid:data.callId, 
				targetUserId:data.userId,
				targetAttendantAccount:data.attendantAccount,
				targetAttendantNumber:data.attendantNumber,
				caller:data.caller,
				callee:data.callee
			};
			callManager(param);
		} else {
			if (value == 0) {//强注销
				message.error("通话中无法强注销，请稍后再试");
			} else if (value == 2) {//强置忙
				message.error("通话中无法强置忙，请稍后再试");
			} else {//强置闲
				message.error("通话中无法强置闲，请稍后再试");
			}
			
			this.reFreshFn();
		}
	}

	//间隔时间选择
	refreshOnceTimeChange(value) {
		this.setState({
			refreshOnceTime:parseInt(value),
			restTime:parseInt(value)
		});
	}

    render()
	{
		let {dataList,receptionList,monitorStatics} = this.props;
		let dataHeader = this.getDataHeader();
		let dataSource = dataList.list;
		let {refreshOnceTime, restTime, restRefreshTime} = this.state;
		
        return (
				<div className="callListen" ref="callListen">
					<div className="top topFront">
						<span className="tip">数据采集时间{restRefreshTime},数据
							<Select defaultValue={parseInt(refreshOnceTime).toString()} onChange={this.refreshOnceTimeChange.bind(this)} style={{marginLeft:5,marginRight:5}} getPopupContainer={() => document.querySelector(".callCenterScrollArea")}>
								{refreshTime.map((value, index)=>{
									return <Option value={parseInt(value).toString()} key={index}>{value}</Option>
								})}
							</Select>
							秒刷新一次,距离下次刷新时间{restTime}秒</span>
						<Button type="primary" className="refresh" onClick={this.refreshData}>刷新</Button>
					</div>
					<div className="content">
						{this.loadMonitorList(monitorStatics)}
					</div>
					<div className="top">
					    <span>客服监听</span>
						<Select className="select" defaultValue="" style={{right:260,width:120}} onChange={this.onlineHandleChange} getPopupContainer={() => document.querySelector(".callCenterScrollArea")}>
							<Option value="">所有在线状态</Option>
							{onlineStatus.map((value,index)=>(
								<Option value={parseInt(index).toString()} key={index}>{value}</Option>
							))}
						</Select>
						<Select className="select" defaultValue="" style={{right:130,width:120}} onChange={this.phoneHandleChange} getPopupContainer={() => document.querySelector(".callCenterScrollArea")}>
							<Option value="">所有通话状态</Option>
							{callStatus.map((value,index)=>(
								<Option value={parseInt(index).toString()} key={index}>{value}</Option>
							))}
						</Select>
						<Select className="select" style={{right:0}} defaultValue="" onChange={this.receptionHandleChange} getPopupContainer={() => document.querySelector(".callCenterScrollArea")}>
							<Option value="">所有接待组</Option>
							{this.receptionList(receptionList)}
						</Select>
					</div>
					<div className="table" style={{marginTop:10}}>
						<NTTableWithPage dataSource={dataSource} columns={dataHeader} total={dataList.totalNumber} selectOnChange={this.tableHandleChange}  currentPage={dataList.currentPage} style={{marginTop:10}}/>
					</div>
					{this._getProgressComp()}
                </div>
			);
	}

}
function mapStateToProps(state)
{
	let {callListenReducer} = state;
	return {
		dataList: callListenReducer.get("calllistenRecord") || {},
		progress:callListenReducer.get("progress") || {},
		receptionList:callListenReducer.get("receptionlist") || [],
		monitorStatics:callListenReducer.get("monitorstatic")||{},
	};
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({ getCallListenRecord, getMonitorStatistics, getReceptionList, updateCallListenRecord },dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CallListen);
