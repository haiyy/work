//绩效看板  数字
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {TreeSelect, Button} from 'antd';
import KpiTopRight from './KpiTopRight';
import {addQuery, fetchFilter, setQueryTime} from "../redux/filterReducer";
import "./scss/performance.scss";
import {getProgressComp, reoperation} from "../../../utils/MyUtil";
import ScrollArea from 'react-scrollbar'
import {fetchList, getDashboardLibrary, manualUpdateList} from '../redux/kpiListReducer'
import {loadReport} from '../redux/loadReportData'
import NumberCar from "./kpiService/NumberCar.js";
import ShowKpiData from "./ShowKpiData";
import LoadReportDataRefactor from "./kpiService/LoadReportDataRefactor";
import moment from "moment/moment";
import ReportDetails from './kpiListComp/ReportDetails'
import {reportDetails} from "../redux/reportDetails";
import Settings from "../../../utils/Settings";
import {loginUserProxy} from "../../../utils/MyUtil";
import {urlLoader} from "../../../lib/utils/cFetch";
import {requestReport} from "../redux/requestReportData";
import cloneDeep from "lodash.clonedeep";
import NoData from "./NoData";

//树选择
const TreeNode = TreeSelect.TreeNode;

class Performance extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: "",
            servicevalue: undefined,
            servicegroupvalue: undefined,
            date: [
                moment()
                    .startOf('d')
                    .subtract(1, 'd')
                    .add(1, 'days')
                    .format("YYYY-MM-DD HH:mm:ss"),
                moment({hour: 0, minute: 0, seconds: 0})
                    .add(1, 'day')
                    .format("YYYY-MM-DD HH:mm:ss")
            ]
        };
        this.nextQry = "";
        this.onOption = this.onOption.bind(this);
        this.scrollData = reoperation(this.scrollData.bind(this), 500);
    }

    componentDidMount() {
        let kpiName = this.props.kpiName;
        this.props.getDashboardLibrary(kpiName);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.kpiName !== this.props.kpiName) {
            this.scrollArea && this.scrollArea.scrollTop();
            this.setState({isShowDetail: false});
            this.props.getDashboardLibrary(nextProps.kpiName);
        }
        else if (nextProps.list !== this.props.list) {
            this.scrollPosData && this.scrollData(this.scrollPosData);
        }
        if(nextProps.isMyself&&this.state.isShowDetail){
            this.scrollArea && this.scrollArea.scrollTop();
            this.setState({isShowDetail: false});
            this.props.getDashboardLibrary(nextProps.kpiName);
        }
    }

    /**
     * 获取当前宽高
     * */
    cal(item, curW, curH, containerWidth) {
        let {width, height} = item,
            percentW = width > 1 ? width / containerWidth : width;

        //当宽度超过当前行，或者该行开始时
        if (percentW + curW > 1 || !curW) {
            curH += height;
            curW = percentW;
        }
        else {
            curW += percentW;
        }

        return [curW, curH];
    }

    scrollData(value) {
        let {containerHeight = 0, containerWidth = 0, topPosition = 0} = value || {},
            {list = []} = this.props,
            bottomPostion = topPosition + containerHeight,
            curW = 0, curH = 0;

        list = this.forceList || list;

        this.scrollPosData = value;

        let newlist = [], len = list.length, item;

        for (let i = 0; i < len; i++) {
            item = list[i];

            let pos = this.cal(item, curW, curH, containerWidth);

            curW = pos[0];
            curH = pos[1];

            if (curH >= topPosition) {
                if (curH - bottomPostion < item.height) {
                    newlist.push(item);
                }
                else {
                    //超出屏幕显示
                    break;
                }
            }
        }

        if (!newlist)
            newlist = this.list.slice(0, 6);

        this.props.loadReport({list: newlist, query: this.query});
    }

    //日历选择
    quickDate(date, isChange) {
        let {list = []} = this.props;
        list.forEach(value => delete value.progress);

        this.props.setQueryTime(date, isChange);
        this.setState({date, value: isChange});
    }

    onOption() {
        return (
            <TreeNode value="parent 1" title="parent 1" key="0-1">
                <TreeNode value="parent 1-0" title="parent 1-0" key="0-1-1">
                    <TreeNode value="leaf1" title="my leaf" key="random"/>
                    <TreeNode value="leaf2" title="your leaf" key="random1"/> </TreeNode>
                <TreeNode value="parent 1-1" title="parent 1-1" key="random2"> <TreeNode value="sss" title={
                    <b style={{color: '#08c'}}>sss</b>} key="random3"/> </TreeNode> </TreeNode>
        )
    }

    getChartComp() {
        let {list = []} = this.props;

        return list.map((item, index) => {
            let {titile, width = 1, isCard, height, ui} = item,
                // itemWidth = width * 100 +"%",
                itemWidth = width * 100 + "%",
                calcWidth = 'calc(' + itemWidth + ' - 10px)',
                // itemHeight = height + "px";
                itemHeight = "384px",
                containerWidth = this.scrollPosData && this.scrollPosData.containerWidth || 0;

            if (ui === "card")
                return <NumberCar name={item.name} style={{width: itemWidth}} title={titile}/>;

            return <ShowKpiData key={item.name} width={calcWidth} height={itemHeight} containerWidth={containerWidth}
                                item={item} group="reportsLibrary" click={this.details.bind(this)}
                                onCollect={this._onCollect.bind(this)}/>
        })
    }

    details(item) {
        if (item.ui == "number")
            return;

        this.setState({
            item: item,
            value: "报表库",
            isShowDetail: true
        })
    }

    handleUpdateData() {
        let {isShowDetail, item = {}} = this.state;
        if (isShowDetail) {
            let childName = item.child,
                {siteId: siteid, userId: userid} = loginUserProxy(),
                url = `${Settings.getPantherUrl()}/api/v1/dashboard/${childName}/${item.id}/data`,
                options = {headers: {siteid, userid}, method: 'put'},
                {queryTime = []} = this.props;

            options.body = JSON.stringify({time: {starttime: queryTime[0], endtime: queryTime[1]}});

            urlLoader(url, options)
                .then(({jsonResult}) => {
                    if (jsonResult.code === 500)  //加载数据失败
                    {
                        this.props.requestReport(2, '', item);
                    }

                    if (jsonResult.state === "ok") {
                        this.props.requestReport(2, jsonResult.result, item);
                    }
                });
        }
        else {
            let {list = []} = this.props;
            list = cloneDeep(list);
            list.forEach(value => delete value.progress);
            this.props.manualUpdateList(list);

            //this.scrollPosData && this.scrollData(this.scrollPosData);
        }
    }

    backToMain() {
        this.setState({
            item: null,
            value: "",
            isShowDetail: false
        });
        let {list = []} = this.props;
        list = cloneDeep(list);
        list.forEach(value => delete value.progress);
        this.props.manualUpdateList(list);

    }

    displayNoData() {
        setTimeout(() => {
            let {list = []} = this.props;
            return !list.length ? <NoData/> : null
        }, 1000)

    }

    _onCollect(value, e) {
        let name = value.name,
            {attention} = this.props,
            index = attention.findIndex(item => item.name === name);

        e.stopPropagation();

        if (index > -1) {
            this.props.unsubscribe(name);
        }
        else {
            this.props.subscribe(name, value);
        }
    }

    render() {
        let {value, isShowDetail} = this.state;

        return (
            <div className="performance">
                <header>
                    {
                        isShowDetail ? <Button onClick={() => {
                            this.backToMain()
                        }}>返回</Button> : <div></div>
                    }
                    <div className="kpiHeaderRight">
                        <KpiTopRight quickDate={this.quickDate.bind(this)} value=""/>
                        <i className="icon-shuaxin iconfont" onClick={this.handleUpdateData.bind(this)}/>
                    </div>
                </header>
                <section>
                    {this.displayNoData()}
                    {
                        !isShowDetail ?
                            <ScrollArea ref={node => this.scrollArea = node} onScroll={this.scrollData} speed={1}
                                        horizontal={false} smoothScrolling
                                        style={{height: '100%'}}>
                                <LoadReportDataRefactor/>
                                <div className="chartsComp">
                                    {
                                        this.getChartComp()
                                    }
                                </div>
                            </ScrollArea>
                            :
                            <ReportDetails
                                isBack={true}
                                item={this.state.item}
                                value={value}
                                date={this.state.date}
                            />
                    }
                </section>
                {
                    getProgressComp(this.props.progress)
                }
            </div>
        )
    }
}

function mapStateToProps(state) {
    let {queryTime = {queryDate: {}}} = state,
        {queryDate = {date: []}} = queryTime,
        {date = []} = queryDate;

    return {
        list: state.reportsList.data,
        query: state.query.data,
        progress: state.reportsList.progress,
        attention: state.attentionList.data,
        cooperate: state.cooperateReducer,
        queryTime: date
    };
}

function mapDispatchToProps(dispatch) {

    return bindActionCreators({
        fetchFilter,
        addQuery,
        setQueryTime,
        fetchList,
        getDashboardLibrary,
        loadReport,
        reportDetails,
        requestReport,
        manualUpdateList
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Performance);
