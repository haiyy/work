import React from "react";
import { connect } from "react-redux";
import NTTableWithPage from "../../../components/NTTableWithPage";
import ScrollArea from 'react-scrollbar';
import {ReFresh} from "../../../components/ReFresh";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { getTableTdContent } from "../../../utils/ComponentUtils";
import { getAttendanceData } from "../redux/reducers/attendantTableReportReducer";
import { bindActionCreators } from "redux";
import ShowScreen from '../../kpi/view/ShowScreen';
import { Button } from 'antd';
import './style/attendantTableReport.less';
import moment from 'moment';
import {fetchFilter, setQueryTime} from '../../kpi/redux/filterReducer';
import ExportComponent from "../../../components/ExportComponent";
import Settings from "../../../utils/Settings";
import { loginUserProxy, getFormatTime } from "../../../utils/MyUtil";
import KpiTopRight from "../../kpi/view/KpiTopRight";

function rateToString(number) {
    if (parseInt(number*100) != parseFloat(number*100)) {
        number = parseFloat(number*100).toFixed(2).toString()+"%";
    } else {
        number = parseFloat(number*100).toString()+"%";
    }
    return number;
}

class AttendantTableReport extends React.Component {
    constructor(props) {
        super(props);
        let startTamp = "", endTamp = "";
        if (props.date && props.date.length == 2) {
            startTamp = (new Date(props.date[0])).getTime();
            endTamp = (new Date(props.date[1])).getTime();
        } else {
            let timeStamp = new Date(new Date().setHours(0, 0, 0, 0));
			startTamp = timeStamp.getTime(),
            endTamp = timeStamp.getTime() + (86400 - 1) * 1 * 1000;
        }
		
        this.state = {
            currentPage: 1,
            startTamp: startTamp,
            endTamp: endTamp,
            display: false,//筛选条件是否显示
            userIds: [],//需要查询的userId
        };
    }

    componentDidMount() {
        this.props.fetchFilter('rpt_attendancttablereport');
        this.props.getAttendanceData();
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
                return <ReFresh reFreshStyle={{left:0,top:0}} reFreshFn={this.reFreshFn.bind(this,true)}/>;
            }
        }
        return null;
    }
    
    reFreshFn() {
        let {userIds, startTamp, endTamp, currentPage} = this.state;
        this.props.getAttendanceData(userIds, startTamp, endTamp, currentPage);
    }

    //客服考勤tableheader
    getDataHeader() {
        return [{title:"日期", key:"currentTime", dataIndex:"currentTime", width:95,
                    render:(text)=>(<p style={{minWidth:80}}>{text}</p>)},
                {title:"姓名", key:"userName", dataIndex:"userName", width:115,
                 render:(text, current)=>{
                 return getTableTdContent(current.userName, 100);
                 }},
                {title:"工号", key:"attendantAccount", dataIndex:"attendantAccount", width:57,
                 render:(text)=>(<p style={{minWidth:42}}>{text}</p>)},
                {title:"首次签入时间", key:"firstSignInTime", dataIndex:"firstSignInTime", width:140,
                 render:(text)=>(<p style={{minWidth:125}}>{text?moment(text).format("YYYY-MM-DD HH:mm:ss"):""}</p>)},
                {title:"最后签出时间", key:"lastSignOutTime", dataIndex:"lastSignOutTime", width:140,
                 render:(text)=>(<p style={{minWidth:125}}>{text?moment(text).format("YYYY-MM-DD HH:mm:ss"):""}</p>)},
                {title:"在线时长", key:"onlineLength", dataIndex:"onlineLength", width:90,
                 render:(text)=>(<p style={{minWidth:75}}>{getFormatTime(text)}</p>)},
                {title:"离线时长", key:"offlineLength", dataIndex:"offlineLength", width:90,
                 render:(text)=>(<p style={{minWidth:75}}>{getFormatTime(text)}</p>)},
                {title:"空闲时长", key:"freeLength", dataIndex:"freeLength", width:90,
                 render:(text)=>(<p style={{minWidth:75}}>{getFormatTime(text)}</p>)},
                {title:"置闲率", key:"freeRatio", dataIndex:"freeRatio", width:65,
                  render:(text)=>(<p style={{minWidth:50}}>{rateToString(text)}</p>)},
                {title:"忙碌时长", key:"busyLength", dataIndex:"busyLength", width:90,
                  render:(text)=>(<p style={{minWidth:75}}>{getFormatTime(text)}</p>)},
                {title:"置忙率", key:"busyRatio", dataIndex:"busyRatio", width:65,
                 render:(text)=>(<p style={{minWidth:50}}>{rateToString(text)}</p>)},
                {title:"小休时长", key:"littleHughLength", dataIndex:"littleHughLength", width:90,
                 render:(text)=>(<p style={{minWidth:75}}>{getFormatTime(text)}</p>)},
                {title:"小休率", key:"littleHughRatio", dataIndex:"littleHughRatio", width:65,
                 render:(text)=>(<p style={{minWidth:50}}>{rateToString(text)}</p>)},
                {title:"会议时长", key:"meetingLength", dataIndex:"meetingLength", width:90,
                 render:(text)=>(<p style={{minWidth:75}}>{getFormatTime(text)}</p>)},
                {title:"会议率", key:"meetingRatio", dataIndex:"meetingRatio", width:65,
                 render:(text)=>(<p style={{minWidth:50}}>{rateToString(text)}</p>)}
            ];
    }

    //筛选按钮点击
    showScreen(query) {
        this.setState({
            display: !this.state.display
        });

        if (query.length === 0)
            return;

        let {userIds, startTamp, endTamp} = this.state, isChange=false;
        for (let i = 0; i < query.length; i++) {
            let json = query[i];
            if (json.name == 'datetime') {
                let time = json.value.split(',');
                if(time.length == 2) {
                    startTamp = (new Date(time[0])).getTime();
                    endTamp = (new Date(time[1])).getTime();
                } else {
                    break;
                }
            } else if (json.name == 'cs') {
                userIds = json.value.split(',');
                isChange = true;
                if (json.value == "") {
                    userIds = [];
                }
            }
        }
        if (!isChange) {
            userIds = [];
        }
        this.setState({userIds, startTamp, endTamp});

        this.props.getAttendanceData(userIds, startTamp, endTamp);
    }

    //开始时间结束时间改变
	changeSearchVal(date, isChange)//(startTamp, endTamp)
	{
        this.props.setQueryTime(date, isChange);
        let {userIds, startTamp, endTamp} = this.state;

        if(date.length == 2) {
            startTamp = (new Date(date[0])).getTime();
            endTamp = (new Date(date[1])).getTime();
            this.setState({startTamp, endTamp});
        }

        this.props.getAttendanceData(userIds, startTamp, endTamp);
    }
    
    //分页点击
    onCurrentPage(value) {
        this.setState({currentPage:value});
        let {userIds, startTamp, endTamp} = this.state;
        this.props.getAttendanceData(userIds, startTamp, endTamp, value);
    }

    //导出
    dataExport() {
        let {userIds, startTamp, endTamp} = this.state;
        let {ntoken, siteId, userId} = loginUserProxy()
        return Settings.getCallServerUrl(`${siteId}/attendance/export/${userId}`,`?accessToken=${ntoken}&&userId=${userId}&&siteId=${siteId}&&userIds=${userIds}&&startTime=${startTamp}&&endTime=${endTamp}`);
    }

    render() {
        let {display} = this.state,
         {attendanceList} = this.props,
         dataSource = attendanceList.list || [];
        return (<div className="data reportDatails">
                    <ScrollArea speed={1} className="area" horizontal={false} smoothScrolling
				            style={{height: '100%'}}>
                        <div className="reportMain">
                            <div className="top">
                                <KpiTopRight quickDate={this.changeSearchVal.bind(this)} value={""}/>
                                    {/* <i className={className + " iconfont icon-005shoucang collection"}
                                    onClick={this._onCollect.bind(this, item)}/> */}
                                    <div className="buttons">
                                        <ExportComponent url={this.dataExport()} clsName="export"/>
                                        <Button shape="circle" onClick={this.showScreen.bind(this, [])}
                                                style={{position: 'relative', top: '5px'}}>
                                            <i className="iconfont icon icon-shaixuan"/>
                                        </Button>
                                    </div>
                            </div>
                            <NTTableWithPage columns={this.getDataHeader()} dataSource={dataSource} total={attendanceList.totalNumber} currentPage={attendanceList.currentPage} selectOnChange={this.onCurrentPage.bind(this)}/>
                        </div>
                    </ScrollArea>
                    {display ? (<ShowScreen close={this.showScreen.bind(this)} name='rpt_attendancttablereport'/>) : ""}
                    {this._getProgressComp()}
                </div>);
    }
}

function mapStateToProps(state) {
    let {attendantTableReportReducer} = state;
    return {attendanceList: attendantTableReportReducer.get("attendanceDataList")||{},
            progress: attendantTableReportReducer.get("progress")
        };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getAttendanceData, fetchFilter, setQueryTime}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AttendantTableReport);

