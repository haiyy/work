import React from 'react'
import {Breadcrumb, Button, Table,  BackTop, Anchor} from 'antd'
import ScrollArea from 'react-scrollbar';
import {loadReport} from '../../redux/loadReportData'
import {requestReport} from '../../redux/requestReportData'
import {reportDetails} from '../../redux/reportDetails'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {getReportId} from '../ExportTable'
import {gridData} from '../kpiService/gridData'
import LoadProgressConst from "../../../../model/vo/LoadProgressConst"
//import Loading from '../Loading'
import Loading from "../../../../components/xn/loading/Loading"
import NoData from '../NoData'
import ShowScreen from '../ShowScreen'
import getQuery, {dateTime} from '../kpiService/getQuery'
import {ReFresh} from "../../../../components/ReFresh"
import {dashBoardFetchFilter, filterData, addQuery, getAccount, setQueryTime} from '../../redux/filterReducer'
import {subscribe, unsubscribe} from '../../redux/attentionReducer'
import ChartItems from '../ChartItems'
import '../scss/ReportDetails.less'
import { loginUserProxy } from "../../../../utils/MyUtil"
import { urlLoader } from "../../../../lib/utils/cFetch"
import Settings from "../../../../utils/Settings";

class ReportDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showTable: false,
            display: false,
            filteredInfo: null,
            sortedInfo: null,
            value: "",
            query: [],
            progress: '2',
            isConcern: null
        }
    }

    componentDidMount()
    {
        let {item, attention = [], compName} = this.props,
            {isConcern} = this.state,
            query = undefined,
            concern = compName === "attentionData" ? true : item.isconcern;

        if (isConcern === null)
            this.setState({isConcern: concern});

        // this.props.dashBoardFetchFilter(item.name, item.id);

        if (this.props.query && this.props.query[item.name])
        {
            query = this.props.query[item.name]
        }

        this.nextQry = getQuery(query, this.props.date);

        delete item.loadId;

        item.progress = -1;

        this.props.loadReport({list: [item], query: this.nextQry});

        this.getDetailReportData(item);
    }

    getDetailReportData(item, dashQuery)
    {
        let name = item.child,
            {siteId: siteid, userId: userid} = loginUserProxy(),
            url = `${Settings.getPantherUrl()}/api/v1/dashboard/${name}/${item.id}/data`,
            options = {headers: {siteid, userid}, method: 'put'},
            {queryTime = []} = this.props;

        options.body = JSON.stringify({time: {starttime: queryTime[0], endtime: queryTime[1]}});

        if(dashQuery)
        {
            url = `${Settings.getPantherUrl()}/api/v1/dashboard/${name}/${item.id}/data`;
            options.body = JSON.stringify(dashQuery);
        }

        urlLoader(url, options)
            .then(({jsonResult}) => {
                if(jsonResult.code === 500)  //加载数据失败
                {
                    this.props.requestReport(2, '', item);
                }

                if(jsonResult.state === "ok")
                {
                    this.props.requestReport(2, jsonResult.result, item);
                }
            });
    }

    componentWillReceiveProps(nextProps)
    {
        let name = nextProps.item.name;

        if (!nextProps.item)
            return;

        if (this.props.date !== nextProps.date)
        {
            if (nextProps.query && nextProps.query.hasOwnProperty(name))
            {
                let queryList = nextProps.query[name],
                    query = dateTime(queryList, nextProps.date);

                this.props.addQuery(query, name);
            }

            this.date = nextProps.date;

            let {item = {}} = nextProps,
                childName = nextProps.item.child,
                {siteId: siteid, userId: userid} = loginUserProxy(),
                url = `${Settings.getPantherUrl()}/api/v1/dashboard/${childName}/${item.id}/data`,
                options = {headers: {siteid, userid}, method: 'put'},
                {queryTime = []} = nextProps;

            options.body = JSON.stringify({time: {starttime: queryTime[0], endtime: queryTime[1]}});

            urlLoader(url, options)
                .then(({jsonResult}) => {
                    if(jsonResult.code === 500)  //加载数据失败
                    {
                        this.props.requestReport(2, '', item);
                    }

                    if(jsonResult.state === "ok")
                    {
                        this.props.requestReport(2, jsonResult.result, item);
                    }
                });
        }

        if (nextProps.item.child !== "")
        {
            name = nextProps.item.child;
        }
        if (nextProps.requestReportData[name] && (this.state.progress !== nextProps.requestReportData[name][0])) {
            this.setState({
                progress: nextProps.requestReportData[name][0]
            })
        }
    }

    get isConcern()
    {
        let {item, isConcern} = this.props;

        if (isConcern)
            return true;

        return item.isconcern || false;
    }

    //导出报表
    _exportTable(data)
    {
        let name;
        if (data.child !== "") {
            name = data.child;
        }
        else {
            name = data.name;
        }
        getReportId(name, this.nextQry);
    }

    //查看详情
    _showDetails(name)
    {
        //let query = this.props.query,
        //	nextQry = getQuery(query, this.props.date);
        //
        //this.props.reportDetails({name, qry: nextQry, cols: ""});
        //this.setState({
        //	showDetails: true
        //})
    }

    handleCancel(e) {
        this.setState({
            showDetails: false
        });
    }

    _getButton(data)
    {
        if (!data.hasOwnProperty('operations'))
        {
            return null;
        }
        let disabled = this.state.progress === 3;
        return data.operations.map(item =>
        {
            switch (item.cmd)
            {
                case 'link':
                    return (<Button type="primary" size="large" key={item.name}
                                    onClick={this._showDetails.bind(this, item.tag)}>{item.title}</Button>);
                    break;
                case 'selectcols':
                    return (<Button type="primary" size="large" key={item.name}>{item.title}</Button>);
                    break;
                case 'export':
                    return (
                        <Button type="primary" size="large" key={item.name} onClick={this._exportTable.bind(this, data)}
                                disabled={disabled}>{item.title}</Button>);
                    break;
            }

        });
    }

    get tableWidth()
    {
        let recordTableEle = document.getElementsByClassName('reportDetailTableCls');

        if (recordTableEle && recordTableEle[0]) {
            return recordTableEle[0].clientWidth;
        }

        return 0;
    }

    getTotalWidth(arr) {
        let totalWidth = arr.reduce((accumulator, item) => accumulator + parseInt(item.width), 0);

        if (totalWidth > this.tableWidth) {
            return totalWidth;
        }

        return this.clientWidth;
    }

    _returnTable(columns, rows)
    {
        //解决后台返回数据有空位情况
        for (let i = 0; i < columns.length; i++) {
            for (let j = 0; j < rows.length; j++) {
                let tempCol=columns[i].name,
                    tempRow=rows[j];
                if(tempCol in tempRow){
                }else{
                    tempRow[tempCol]=0;
                }
            }
        }
        const pagination = {
            total: rows.length, //数据总条数
            pageSize: 10,
            showQuickJumper: true
        };
        if (columns && columns.length < 10) {
            columns.length && delete columns[0].fixed
        }

        let totalWidth = this.getTotalWidth(columns);

        return <div id="reportDetailTable" className="reportDetailTableCls">

            <Table columns={columns} dataSource={rows} pagination={pagination} scroll={{x: totalWidth}}/>
        </div>;
    }

    quickDate(date, isChange)
    {
        this.props.setQueryTime(date, isChange);
    }

    //报表显示样式
    reportDispaly(item) {
        let value = {},
            data,
            progress = this.state.progress,
            name = item.name;

        data = this.props.requestReportData[name];

        if (!data)
        {
            //无数据处理
            return;
        }

        if (item.ui != "grid")
        {
            if (data && data.length !== 1) {
                value = gridData(data[1]);
            }
            return (
                [
                    <ChartItems item={item} reFreshFn={this.reFreshFn.bind(this)}/>,
                    <div>
                        {value && value.hasOwnProperty('columns') ?
                            <div className="showTable">
                                {
                                    this._getProgress(progress, "absolute")
                                }
                                {
                                    this._returnTable(value.columns, value.rows)
                                }
                            </div>
                            : <Loading position='absolute'/>
                        }
                    </div>
                ]
            )

        }
        else {
            let columns = data[2].columns,
                rows = data[2].rows;

            return (
                <div style={{marginBottom: '50px'}}>
                    {this._getProgress(progress, "fixed")}
                    {this._returnTable(columns, rows)}
                </div>
            )
        }
    }

    _getProgress(progress, position)
    {
        if (!progress || progress === LoadProgressConst.LOADING)
        {
            return <Loading position={position} key={position}/>
        }

        if (progress === LoadProgressConst.LOAD_FAILED)
            return (
                <div style={{position: 'relative', height: '200px'}}>
                    <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>
                </div>
            );
    }

    reFreshFn()
    {
        let item = this.props.item,
            query = [];
        if (this.props.query && this.props.query[item.name]) {
            query = this.props.query[item.name]
        }

        this.nextQry = getQuery(query, this.date ? this.date : this.props.date);
        delete item.loadId;
        item.progress = -1;

        this.props.loadReport({list: [item], query: this.nextQry});

        this.getDetailReportData(item);
    }

    getDashBoardQuery(query)
    {
        let conditions = [],
            time;
        query.forEach(item =>
        {
            if (item.name === "datetime" && item.value)
            {
                let timeArr = item.value.split(",");
                time = {
                    starttime: timeArr[0],
                    endtime: timeArr[1]
                }
            }else
            {
                let {operation, type, value = [], name} = item,
                    {date = []} = this.props,
                    queryItem = {
                    operation: operation,
                    type: type,
                    values: value.split(","),
                    name: name
                };

                time = {
                    starttime: date[0],
                    endtime: date[1]
                };

                conditions.push(queryItem)
            }
        });

        return {time, conditions}
    }


    _showScreen(query = [])
    {
        let stateValue = {display: !this.state.display},
            { item = {} } = this.props;

        this.setState(stateValue);

        if (query.length === 0)
        {
            return;
        }
        let index = query.findIndex(element => element.name === 'datetime'),
            dashQuery = this.getDashBoardQuery(query);

        if (index >= 0)
        {
            this.nextQry = getQuery(query);
        }
        else
        {
            let newQuery = dateTime(query, this.props.date);

            this.props.addQuery(newQuery, item.name);
            this.nextQry = getQuery(query, this.props.date);
        }

        delete item.loadId;
        item.progress = -1;

        this.props.loadReport({list: [item], query: this.nextQry});

        this.getDetailReportData(item, dashQuery);
    }

    render()
    {
        let {display, value, isConcern} = this.state,
            {item} = this.props,
            name = item.name,
            requestReportData = this.props.requestReportData;

        if (!requestReportData[name] || requestReportData[name].length === 1) {
            return (
                <div className="reportDetails">
                    <NoData style={{height: '98%'}}/>
                    {
                        this._getProgress(requestReportData[name], "absolute")
                    }
                </div>
            )
        }
        return (
            <div className="data reportDetails">
                <ScrollArea speed={1} className="area" horizontal={false} smoothScrolling
                            style={{height: '100%'}}>
                    <div className="reportMain">
                        <div className="filtrate">
                            {
                                /*item.ui === "grid" ?
                                    <div className="buttons">
                                        {this._getButton(item)}
                                        <Button shape="circle" onClick={this._showScreen.bind(this, [])}
                                                style={{position: 'relative', top: '-2px'}}>
                                            <i className="iconfont icon icon-shaixuan"/>
                                        </Button>
                                    </div>
                                    :
                                    <div className="buttons">
                                        <Button shape="circle" onClick={this._showScreen.bind(this, [])}
                                                style={{position: 'relative', top: '-2px'}}>
                                            <i className="iconfont icon icon-shaixuan" />
                                        </Button>
                                    </div>*/
                            }
                        </div>

                        {
                            this.reportDispaly(item)
                        }
                    </div>
                </ScrollArea>

                {
                    display ? <ShowScreen close={this._showScreen.bind(this)} name={item.name}/> : null
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
        query: state.query.data,
        filterConditions: state.filterConditions.data,
        requestReportData: state.requestReportData,
        reportDetailsReducer: state.reportDetailsReducer.data,
        attention: state.attentionList.data,
        date: state.queryTime.queryDate.date,
        isChangeTime: state.queryTime.queryDate.isChangeTime,
        queryTime: date
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        reportDetails, loadReport, dashBoardFetchFilter, addQuery, subscribe, unsubscribe, setQueryTime, requestReport
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReportDetails);
