import React, {PropTypes} from 'react'
import {Table, Button} from 'antd'
import {weeklyMonthly} from '../redux/weeklyReducer'
import {getSelectColumns} from '../redux/selectColumnsReducer'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
//import Loading from './Loading'
import Loading from "../../../components/xn/loading/Loading"
import {getReportId} from './ExportTable'
import SelectData from './SelectData'
import ScrollArea from 'react-scrollbar'
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
import NoData from './NoData'
import {ReFresh} from "../../../components/ReFresh"
import getQuery, {dateTime, querySiteid} from './kpiService/getQuery'
import Background from './Background'
import ShowScreen from './ShowScreen'
import { fetchFilter, filterData, addQuery, getAccount, setQueryTime} from '../redux/filterReducer'
import KpiTopRight from "./KpiTopRight";
import {getLangTxt, loginUserProxy} from "../../../utils/MyUtil";
import SearchByShopComp from "../../record/public/SearchByShopComp";
import {gridData} from "../../../reducers/kpi/gridData";
import {getProgressComp} from "../../../utils/MyUtil";

class WeeklyMonthly extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = {
			visible: false,
            value: "",
            isShowShopSearch: false,
            weeklyReportName: "rpt_cs_month_platform"
		};
		this.nextQry = "";
	}

    componentDidMount() {
        let qry = getQuery(undefined, this.props.date),
            {siteId = ""} = loginUserProxy(),
            siteIdArr = siteId.split("_"),
            isShowShopSearch = siteIdArr[0] !== "kf" && siteIdArr[1] === "1000",
            {weeklyReportName} = this.state;

        this.setState({isShowShopSearch});

        this.nextQry = qry;
        this.props.fetchFilter(weeklyReportName);

        if (this.props.selectColumns && this.props.selectColumns[weeklyReportName]) {
            this.weekly = {...this.props.weekly};
            this._changeColumn(this.props.selectColumns[weeklyReportName]);
        } else {
            this.props.getSelectColumns(weeklyReportName);//开始加载的时候需要获取选择的显示列
        }

        this.props.getSelectColumns(weeklyReportName);
        this.props.weeklyMonthly({qry}, weeklyReportName);
    }

    componentWillReceiveProps(nextProps) {

        let {weeklyReportName, merchantIds} = this.state;

        if (nextProps.weekly !== this.props.weekly) {
            this.weekly = {...nextProps.weekly};
            if (this.props.selectColumns && this.props.selectColumns[weeklyReportName]) {
                this._changeColumn(this.props.selectColumns[weeklyReportName]);
            }
        }
        if (this.props.date !== nextProps.date) {
            let qry = getQuery(undefined, nextProps.date);
            if (qry !== this.nextQry) {
                this.nextQry = qry;
            }

            if (merchantIds)
                qry = querySiteid(this.nextQry, merchantIds.join(","));

            this.props.weeklyMonthly({qry}, weeklyReportName);
        }
    }

    _changeColumn(data) {
        if (!this.props.weekly.hasOwnProperty("columns")) {
            return;
        }
        let newColumns = this.props.weekly.columns.slice(0, 2),
            columns = this.props.weekly.columns;
        for (let i in data) {
            for (let j = 2; j < columns.length; j++) {
                if (data[i].name === columns[j].name) {
                    newColumns.push(columns[j]);
                }
            }
        }
        // this.weekly.columns = newColumns;
    }

    _selectColumn() {
        this.setState({
            visible: true
        });
    }

    //关闭选择显示内容弹框
    handleClose(status, data) {
        if (status) {
            this._changeColumn(data);
        }
        this.setState({
            visible: false
        });
    }

    //导出报表
    _exportTable() {
        let {weeklyReportName} = this.state;
        getReportId(weeklyReportName, this.nextQry);
    }

    _getProgress() {
        let progress = this.props.progress;
        if (progress === LoadProgressConst.LOADING) {
            return (
                <Loading position="absolute"/>
            )
        }
    }

    reFreshFn() {
        let qry = getQuery(undefined, this.props.date);
        let {weeklyReportName} = this.state;

        this.nextQry = qry;

        if (this.props.selectColumns && this.props.selectColumns[weeklyReportName]) {
            this.weekly = {...this.props.weekly};

            this._changeColumn(this.props.selectColumns[weeklyReportName]);
        } else {
            this.props.getSelectColumns(weeklyReportName);
        }
        this.props.weeklyMonthly({qry}, weeklyReportName);
    }

    _showScreen(query) {

        let stateValue = {display: !this.state.display},
            {merchantIds, weeklyReportName} = this.state,
            qry;

        this.setState(stateValue);

        if (query.length === 0) {
            return;
        }

        let index = query.findIndex(element => element.name === 'datetime');

        if (index >= 0)
        {
            this.nextQry = getQuery(query);
        }
        else
        {
            let newQuery = dateTime(query, this.props.date);

            this.props.addQuery(newQuery, 'weeklyReportName');
            this.nextQry = getQuery(query, this.props.date);
        }

        qry = this.nextQry;

        if (merchantIds)
            qry = querySiteid(this.nextQry, merchantIds.join(","));

        this.props.weeklyMonthly({qry, cols: ""}, weeklyReportName);
    }

    quickDate(date, isChange) {
        this.props.setQueryTime(date, isChange);
    }

    getShopIdList(merchantIds)
    {
        let qry = this.nextQry,
            weeklyReportName = merchantIds ? "rpt_cs_month_shops" : "rpt_cs_month_platform";

        if (merchantIds)
            qry = querySiteid(this.nextQry, merchantIds.join(","));

        this.props.weeklyMonthly({qry, cols: ""}, weeklyReportName);
        this.setState({merchantIds, weeklyReportName});
    }

    getColumnHeader(columnSetting = [], columnKpi = [])
    {
        let dealedCol = [];

        columnSetting.forEach(setItem =>
        {
            let settingItem = columnKpi.find(item => item.name === setItem.name);


            if (settingItem)
            {
                settingItem.width = settingItem.width ? settingItem.width : 120;
                dealedCol.push(settingItem)
            }
        });

        return dealedCol;
    }

    get tableWidth ()
    {
        let recordTableEle = document.getElementsByClassName('weekMonthTable');

        if(recordTableEle && recordTableEle[0])
        {
            return recordTableEle[0].clientWidth;
        }

        return 0;
    }

    getTotalWidth (arr = [])
    {
        let totalWidth = arr.reduce((accumulator, item) => accumulator + parseInt(item.width), 0);

        if(totalWidth > this.tableWidth)
        {
            return totalWidth;
        }

        return this.clientWidth;
    }

    render() {
        let weekly = this.weekly || {},
            {progress} = this.props,
            {display, value, isShowShopSearch, weeklyReportName} = this.state,
            total = weekly && weekly.rows ? weekly.rows.length : 0, //weekly.hasOwnProperty('rows')
            {exportLimit, selectColumns = {}} = this.props,
            columnFormat = {
                result: {
                    columns: selectColumns[weeklyReportName] || [],
                    rows: []
                }
            },
            columnOption = gridData(columnFormat) || {},
            dealedColumn = this.getColumnHeader(columnOption.columns, weekly.columns),
            totalWidth = this.getTotalWidth(dealedColumn);

        if (this.props.progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        const pagination = {
            total: total, //数据总条数
            showQuickJumper: true,
            showTotal: (total) => {

                return getLangTxt("total", total);
            },
            onChange: (current) => {
                console.log('Current: ', current);
            }
        };

        return (
            <div className="weekMonthContainer">
                <Background height='100%'/>
                <div className="data weekly">
                    { weekly && weekly.hasOwnProperty('rows') ?
                        <div className="main kpiTableWrapper">
                            <div className="tabTitle">
                                <div className="tabTitleLeft">
                                    <div className="tabTitleLeftTitle">
                                        {getLangTxt("kpi_weekly_monthly")}
                                    </div>
                                    {
                                        isShowShopSearch ?
                                            <SearchByShopComp getShopIdList={this.getShopIdList.bind(this)} queryType={3}/> : null
                                    }
                                </div>
                                <div className="tabTitleRight">
                                    <KpiTopRight quickDate={this.quickDate.bind(this)} value={value}/>
                                    <Button shape="circle" onClick={this._showScreen.bind(this, [])}>
                                        <i className="iconfont icon icon-shaixuan kpiFilterIcon"/>
                                    </Button>
                                    <Button type="primary" size="large"
                                        onClick={this._selectColumn.bind(this)}
                                        style={{fontSize:'12px'}}>
                                        {getLangTxt("kpi_select_content")}
                                    </Button>
                                    {
                                        exportLimit ?
                                            <Button type="primary" size="large"
                                                onClick={this._exportTable.bind(this)}
                                                style={{fontSize:'12px'}}
                                                >
                                                {getLangTxt("export")}
                                            </Button> : null
                                    }
                                </div>
                            </div>
                            <div className="weekMonthTable">
                                <ScrollArea speed={1} className="area" style={{height:'100%'}} horizontal={false} smoothScrolling>
                                    <Table columns={dealedColumn} dataSource={weekly.rows} pagination={pagination} scroll={{x: totalWidth}}/>
                                </ScrollArea>
                            </div>
                            {
                                this.state.visible ?
                                <SelectData name={weeklyReportName} callBack={this.handleClose.bind(this)}/> : null
                            }
                        </div> : <NoData />
                    }
                </div>
                {
                    display ? <ShowScreen close={this._showScreen.bind(this)} name={weeklyReportName}/> : null
                }
                {
                    getProgressComp(progress)
                }
            </div>
        )
    }
}

function mapStateToProps(state) {

    return {
		query: state.query.data,
		progress: state.weeklyDetails.progress,
		weekly: state.weeklyDetails.data,
		selectColumns: state.selectColumnsReducer.data,
        exportLimit: state.reportsList.exportLimit,
        date: state.queryTime.queryDate.date,
        isChangeTime: state.queryTime.queryDate.isChangeTime
	};
}
function mapDispatchToProps(dispatch)
{
	return bindActionCreators({ weeklyMonthly, getSelectColumns , fetchFilter, addQuery, setQueryTime}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(WeeklyMonthly);

