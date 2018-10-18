import React from "react"
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { getVisilPlanList, operationVisilPlanList, getTimesVisilPlanList } from "../redux/reducers/visitPlanReducer";
import { Button, Table, Icon,Select,Input} from 'antd';
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
import { ReFresh } from "../../../components/ReFresh";
import DatePickerComponent from "../../record/public/DatePickerComponent"
import './style/CallRecord.less'
import './style/searchListComp.less'
import './style/callwatch.less'
import {getProgressComp} from "../../../utils/MyUtil";
import NTTableWithPage from "../../../components/NTTableWithPage";
const Option = Select.Option;
const Search = Input.Search;
class CallWatch extends React.Component {

    constructor(props)
    {
        super(props);
        this.state = {

        };
    }

    //callType callResult  startTime endTime
    componentDidMount()
    {

    }

    getCallWatchList()
    {
        let { actions } = this.props;
    }




    _getProgressComp() {

        let {progress} = this.props,
            errorMsg = "数据保存失败！",
            errorTitle = "操作失败";
        if (progress) {
            if (progress === LoadProgressConst.LOAD_COMPLETE || progress === LoadProgressConst.SAVING_SUCCESS)
                return;
            if (progress=== LoadProgressConst.LOADING || progress === LoadProgressConst.SAVING)  //正在加载或正在保存
            {
                return getProgressComp(progress);
            }else  if (progress === LoadProgressConst.LOAD_FAILED)  //加载失败
            {
                return <ReFresh reFreshStyle={{width: "calc(100% - 2.03rem)"}} reFreshFn={this.reFreshFn.bind(this)}/>;
            }
        }
        return null;
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
                key: 'phoneNumber',
                dataIndex: 'phoneNumber',
                title: '电话号码',
                width: 100,
            }, {
                key: 'planTime',
                dataIndex: 'planTime',
                title: '计划时间',
                width: 100,
            }, {
                key: 'result',
                dataIndex: 'result',
                title: '备注',
                width: 100,
            }, {
                key: 'userId',
                dataIndex: 'userId',
                title: '坐席分配',
                width: 100,
            }, {
                key: 'remarks',
                dataIndex: 'remarks',
                title: '回访结果',
                width: 100,
            },
            {
                title: 'actions',
                dataIndex: 'actions',
                width: 150,
                render: (text, record) => {
                    return (
                        this.props.dataList.list.length > 1
                            ? (
                                <div>
                                    <Button  style={{border:'none',background:'none'}}><Icon type="edit" /></Button>
                                    <Button  style={{border:'none',background:'none'}}><Icon type="delete"/></Button>
                                </div>
                            ) : null
                    );
                },
            }
        ]
    }

    onCallWatchSelectChange(value){
        console.log(value)
    }

    onCallWatchReload(value)
    {
        //api 刷新
    }

    onCurrentPage(value)
    {
        console.log(value)
    }

    _getProgressComp() {

        let {progress} = this.props,
            errorMsg = "数据保存失败！",
            errorTitle = "操作失败";
        if (progress) {
            if (progress === LoadProgressConst.LOAD_COMPLETE || progress === LoadProgressConst.SAVING_SUCCESS)
                return;
            if (progress=== LoadProgressConst.LOADING || progress === LoadProgressConst.SAVING)  //正在加载或正在保存
            {
                return getProgressComp(progress);
            }else  if (progress === LoadProgressConst.LOAD_FAILED)  //加载失败
            {
                return <ReFresh reFreshStyle={{width: "calc(100% - 2.03rem)"}} reFreshFn={this.reFreshFn.bind(this)}/>;
            }
        }
        return null;
    }

    render()
    {
        let {dataList, timeList} = this.props,
            {list,totalPage}=dataList;
        return (
            <div className="CallWatch-Main">
                <div  className="CallWatch-HeaderLeft">
                    <span>{"数据采集时间   "+new Date() +"   距离下次刷新时间30秒"}</span>
                </div>
                <div className="CallWatch-HeaderRight">
                    <Select className="CallWatch-HeaderRight-Select"  onChange={this.onCallWatchSelectChange.bind(this)}>
                        <Option value="1"> 待分配 </Option>
                        <Option value="2"> 未开始 </Option>
                        <Option value="3"> 进行中 </Option>
                        <Option value="4"> 已完成 </Option>
                        <Option value="5"> 已过期 </Option>
                        <Option value="6"> 滞后完成</Option>
                        <Option value="7"> 暂停 </Option>
                    </Select>
                    <Button onClick={this.onCallWatchReload.bind(this)}>
                        <Icon type="reload" />刷新
                    </Button>
                </div>

                <div className="CallWatch-Message">
                <dl>
                    <dt>客服监听</dt>
                    <dd><span>空闲</span><span>2</span></dd>
                    <dd><span>忙碌</span><span>2</span></dd>
                    <dd><span>通话</span><span>2</span></dd>
                    <dd><span>离线</span><span>2</span></dd>
                </dl>
                <dl>
                    <dt>通话监听</dt>
                    <dd><span>今日接通</span><span>2</span></dd>
                    <dd><span>今日未接</span><span>2</span></dd>
                    <dd><span>今日呼叫</span><span>2</span></dd>
                    <dd><span>今日呼通</span><span>2</span></dd>

                </dl>
                <dl>
                    <dt>排队监听</dt>
                    <dd><span>当前排队</span><span>2</span></dd>
                    <dd><span>今日放弃排队</span><span>2</span></dd>
                    <dd><span>今日排队超时</span><span>2</span></dd>
                </dl>
                </div>

                <div className="CallWatch-Search">
                    <div className="CallWatch-Search-Left">
                        客户监听
                    </div>
                    <div className="CallWatch-Search-Right">
                    <Select className="CallWatch-Search-Status"  onChange={this.onCallWatchSelectChange.bind(this)}>
                        <Option value="1"> 待分配 </Option>
                        <Option value="2"> 未开始 </Option>
                        <Option value="3"> 进行中 </Option>
                        <Option value="4"> 已完成 </Option>
                        <Option value="5"> 已过期 </Option>
                        <Option value="6"> 滞后完成</Option>
                        <Option value="7"> 暂停 </Option>
                    </Select>
                    <Select className="CallWatch-Search-Results"  onChange={this.onCallWatchSelectChange.bind(this)}>
                        <Option value="1"> 待分配 </Option>
                        <Option value="2"> 未开始 </Option>
                        <Option value="3"> 进行中 </Option>
                        <Option value="4"> 已完成 </Option>
                        <Option value="5"> 已过期 </Option>
                        <Option value="6"> 滞后完成</Option>
                        <Option value="7"> 暂停 </Option>
                    </Select>
                    <Search
                        className="-CallWatch-Search-Input"
                        enterButton="Search"
                    />
                    </div></div>
                <div>
                    <NTTableWithPage  dataSource={list} columns={this.getColumn()}  total={totalPage} selectOnChange={this.onCurrentPage.bind(this)}/>
                </div>

                {this._getProgressComp()}
            </div>
        );

    }
}

const mapStateToProps = (state) => {
    let {visitPlanReducer} = state;

    return {
        dataList: visitPlanReducer.get("dataList") || {},
        timeList: visitPlanReducer.get("timerList") || {},
        progress: visitPlanReducer.get("progress") || {},
    };
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getVisilPlanList, operationVisilPlanList, getTimesVisilPlanList
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(CallWatch);
