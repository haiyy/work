import React from 'react'
import {Breadcrumb, Button, Table,  BackTop, Anchor} from 'antd'
import ScrollArea from 'react-scrollbar';
import {loadReport} from '../../redux/loadReportData'
import {requestChildReport} from '../../redux/requestReportData'
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
import ChartDetails from '../ChartDetails'
import getQuery, {dateTime} from '../kpiService/getQuery'
import {ReFresh} from "../../../../components/ReFresh"
import {fetchFilter, filterData, addQuery, getAccount, setQueryTime} from '../../redux/filterReducer'
import KpiTopRight from "../KpiTopRight";

const {Link} = Anchor;
import {subscribe, unsubscribe} from '../../redux/attentionReducer'

class KpiReportDetails extends React.Component {
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

    componentDidMount() {
        let {item, attention = [], compName} = this.props,
            {isConcern} = this.state,
            query = undefined,
            concern = compName === "attentionData" ? true : item.isconcern;

        if (isConcern === null)
            this.setState({isConcern: concern});

        this.props.fetchFilter(item.name);
        if (this.props.query && this.props.query[item.name]) {
            query = this.props.query[item.name]
        }
        this.nextQry = getQuery(query, this.props.date);
        delete item.loadId;
        item.progress = -1;

        this.props.loadReport({list: [item], query: this.nextQry});

        if (item.child !== '') {
            let name = item.child;
            this.props.requestChildReport({name, qry: this.nextQry, cols: ""})
        }
    }

    componentWillReceiveProps(nextProps) {
        let name = nextProps.item.name;

        if (!nextProps.item)
            return;

        if (this.props.date !== nextProps.date) {
            if (nextProps.query && nextProps.query.hasOwnProperty(name)) {
                let queryList = nextProps.query[name],
                    query = dateTime(queryList, nextProps.date);

                this.props.addQuery(query, name);
            }

            this.date = nextProps.date;
            this.reFreshFn();
        }

        if (nextProps.item.child !== "") {
            name = nextProps.item.child;
        }
        if (nextProps.requestReportData[name] && (this.state.progress !== nextProps.requestReportData[name][0])) {
            this.setState({
                progress: nextProps.requestReportData[name][0]
            })
        }
    }

    get isConcern() {
        let {item, isConcern} = this.props;

        if (isConcern)
            return true;

        return item.isconcern || false;
    }

    //导出报表
    _exportTable(data) {
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
    _showDetails(name) {
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

    _getButton(data) {
        if (!data.hasOwnProperty('operations')) {
            return null;
        }
        let disabled = this.state.progress === 3;
        return data.operations.map(item => {
            switch (item.cmd) {
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
                                disabled={disabled} style={{marginTop:'-3px'}}>{item.title}</Button>);
                    break;
            }

        });
    }

    get tableWidth() {
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

    _returnTable(columns = [], rows = []) {
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

    quickDate(date, isChange) {
        this.props.setQueryTime(date, isChange);
    }

    //报表显示样式
    reportDispaly(item) {
        let value = {},
            data,
            progress = this.state.progress,
            name = item.child ? item.child : item.name;

        data = this.props.requestReportData[name];

        if (item.ui != "grid") {
            if (data && data.length !== 1) {
                value = gridData(data[1]);
            }

            return (
                [
                    <ChartDetails item={item} reFreshFn={this.reFreshFn.bind(this)}/>,
                    <div>
                        {value && value.hasOwnProperty('columns') ?
                            <div className="showtable">
                                <div className="top">
                                    <div className="allDetailTitle">全部详情</div>
                                    <div className="buttons allDetailBtn">
                                        {this._getButton(item)}
                                    </div>
                                </div>
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

    _getProgress(progress, position) {
        if (!progress || progress === LoadProgressConst.LOADING) {
            return <Loading position={position} key={position}/>
        }

        if (progress === LoadProgressConst.LOAD_FAILED)
            return (
                <div style={{position: 'relative', height: '200px'}}>
                    <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>
                </div>
            );
    }

    reFreshFn() {
        let item = this.props.item,
            query = [];
        if (this.props.query && this.props.query[item.name]) {
            query = this.props.query[item.name]
        }

        this.nextQry = getQuery(query, this.date ? this.date : this.props.date);
        delete item.loadId;
        item.progress = -1;

        this.props.loadReport({list: [item], query: this.nextQry});
        if (item.child !== '') {
            let name = item.child;
            this.props.requestChildReport({name, qry: this.nextQry, cols: ""})
        }
    }

    _showScreen(query) {
        let stateValue = {display: !this.state.display};
        this.setState(stateValue);
        if (query.length === 0) {
            return;
        }
        let index = query.findIndex(element => element.name === 'datetime');
        if (index >= 0) {
            this.nextQry = getQuery(query);
        }
        else {
            let newQuery = dateTime(query, this.props.date);

            this.props.addQuery(newQuery, this.props.item.name);
            this.nextQry = getQuery(query, this.props.date);
        }

        let item = this.props.item;
        delete item.loadId;
        item.progress = -1;

        this.props.loadReport({list: [item], query: this.nextQry});
        if (item.child !== '') {
            let name = item.child;
            this.props.requestChildReport({name, qry: this.nextQry, cols: ""})
        }
    }

    /**
     * 添加删除收藏
     **/
    _onCollect(value, e) {
        let name = value.name,
            {attention} = this.props,
            isConcern = {isConcern: !this.state.isConcern},
            index = attention.findIndex(item => item.name === name);

        this.setState(isConcern);
        e.stopPropagation();

        if (index > -1) {
            this.props.unsubscribe(name);
        }
        else {
            this.props.subscribe(name, value);
        }
    }
    displayNoData()
    {
        setTimeout(() => {
            let {list = []} = this.props;
            return !list.length ? <NoData style={{height: '98%'}}/> : null
        }, 1000)

    }
    render() {
        let {display, value, isConcern} = this.state,
            {item, isBack} = this.props,
            name = item.name,
            requestReportData = this.props.requestReportData,
            className = isConcern ? "concernedReport" : "unConcernedReport";

        if (!requestReportData[name] || requestReportData[name].length === 1) {
            return (
                <div className="data reportDatails">
                    {this.displayNoData()}
                    {
                        this._getProgress(requestReportData[name], "absolute")
                    }
                </div>
            )
        }

        return (
            <div className="data reportDatails">
                {isBack ? <div onClick={this.props.backToMain.bind(this)}>返回</div> : null}
                <ScrollArea speed={1} className="area" horizontal={false} smoothScrolling
                            style={{height: '100%'}}>
                    <div className="reportMain">
                        <div className="top">
                            <KpiTopRight quickDate={this.quickDate.bind(this)} value={value}/>
                            <i className={className + " iconfont icon-005shoucang collection"}
                                style={{position: 'relative', top: '0px'}}
                               onClick={this._onCollect.bind(this, item)}/>
                            {
                                item.ui === "grid" ?
                                    <div className="buttons">
                                        {this._getButton(item)}
                                        <Button shape="circle" onClick={this._showScreen.bind(this, [])}
                                                style={{position: 'relative', top: '2px'}}>
                                            <i className="iconfont icon icon-shaixuan"/>
                                        </Button>
                                    </div>
                                    :
                                    <div className="buttons">
                                        <Button shape="circle" onClick={this._showScreen.bind(this, [])}
                                                style={{position: 'relative', top: '2px'}}>
                                            <i className="iconfont icon icon-shaixuan" />
                                        </Button>
                                    </div>
                            }
                        </div>
                        {/*<BackTop target={() => document.querySelector(".reportMain")} visibilityHeight="10"/>*/}
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
    return {
        query: state.query.data,
        filterConditions: state.filterConditions.data,
        requestReportData: state.requestReportData,
        reportDetailsReducer: state.reportDetailsReducer.data,
        attention: state.attentionList.data,
        date: state.queryTime.queryDate.date,
        isChangeTime: state.queryTime.queryDate.isChangeTime
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        reportDetails, loadReport, requestChildReport, fetchFilter, addQuery, subscribe, unsubscribe, setQueryTime
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(KpiReportDetails);
