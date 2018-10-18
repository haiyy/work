import React, {Component} from 'react'
import {Table, Button, Breadcrumb} from 'antd'
import SelectData from './SelectData'
import {customerService} from '../redux/customerServiceReducer'
import {getSelectColumns} from '../redux/selectColumnsReducer'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
//import Loading from './Loading'
import Loading from "../../../components/xn/loading/Loading"
import {getReportId} from './ExportTable'
import ScrollArea from 'react-scrollbar'
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
import NoData from './NoData'
import {ReFresh} from "../../../components/ReFresh"
import getQuery, {dateTime} from './kpiService/getQuery'
import Background from './Background'
import ShowScreen from './ShowScreen'
import {fetchFilter, filterData, addQuery, getAccount, setQueryTime} from '../redux/filterReducer'
import {getLangTxt} from "../../../utils/MyUtil";
import KpiTopRight from "./KpiTopRight";
import {getProgressComp} from "../../../utils/MyUtil";

class CustomerService extends Component {
    constructor(props)
    {
        super(props);
        this.state = {
            visible: false,
            value: ""
        };
        this.nextQry = "";
    }

    componentDidMount()
    {
        let qry = getQuery(undefined, this.props.date);
        this.nextQry = qry;
        this.props.fetchFilter('rpt_cooperation');

        if (this.props.selectColumns && this.props.selectColumns["rpt_cooperation"])
        {
            this.customerData = {...this.props.customerData};
            this._changeColumn(this.props.selectColumns["rpt_cooperation"]);
        }
        else
        {
            this.props.getSelectColumns("rpt_cooperation");
        }
        this.props.customerService({qry});
    }

    componentWillReceiveProps(nextProps)
    {
        if (nextProps.customerData !== this.props.customerData)
        {
            this.customerData = {...nextProps.customerData};
            if (this.props.selectColumns && this.props.selectColumns["rpt_cooperation"]) {
                this._changeColumn(this.props.selectColumns["rpt_cooperation"]);
            }
        }

        if (this.props.date !== nextProps.date)
        {
            let qry = getQuery(undefined, nextProps.date);
            if (qry !== this.nextQry) {
                this.nextQry = qry;
                this.props.customerService({qry});
            }
        }
    }

    _changeColumn(data)
    {
        if (this.props.customerData){
            if (!this.props.customerData.hasOwnProperty("columns")) {
                return;
            }

            let newColumns = this.props.customerData.columns.slice(0, 2),
                columns = this.props.customerData.columns;
            for (let i in data) {
                for (let j = 2; j < columns.length; j++) {
                    if (data[i].name === columns[j].name) {
                        newColumns.push(columns[j]);
                    }
                }
            }
            this.customerData.columns = newColumns;
        }else{
            return;
        }
    }

    _selectColumn()
    {
        this.setState({
            visible: true
        });
    }

    //关闭选择显示内容弹框
    handleClose(status, data)
    {
        if (status)
        {
            this._changeColumn(data);
        }
        this.setState({
            visible: false
        });
    }

    //导出报表
    _exportTable()
    {
        getReportId("rpt_cooperation", this.nextQry);
    }

    reFreshFn()
    {
        let qry = getQuery(undefined, this.props.date);
        this.nextQry = qry;
        if (this.props.selectColumns && this.props.selectColumns["rpt_cooperation"])
        {
            this.customerData = {...this.props.customerData};
            this._changeColumn(this.props.selectColumns["rpt_cooperation"]);
        }
        else
        {
            this.props.getSelectColumns("rpt_cooperation");
        }
        this.props.customerService({qry});
    }

    _showScreen(query)
    {
        let stateValue = {display: !this.state.display};

        this.setState(stateValue);

        if (query.length === 0)
            return;

        let index = query.findIndex(element => element.name === 'datetime');

        if (index >= 0)
        {
            this.nextQry = getQuery(query);
        }
        else
        {
            let newQuery = dateTime(query, this.props.date);

            if (this.props.item)
            {
                this.props.addQuery(newQuery, this.props.item.name);
            }

            this.nextQry = getQuery(query, this.props.date);
        }

        this.props.customerService({qry: this.nextQry});
    }

    quickDate(date, isChange)
    {
        this.props.setQueryTime(date, isChange);
    }

    getColumnHeader(columnSetting = [], columnKpi = [])
    {
        let dealedCol = [];

        columnSetting.forEach(setItem =>
        {
            let settingItem = columnKpi.find(item => item.name === setItem.name);

            if (settingItem)
                dealedCol.push(settingItem)
        });

        return dealedCol;
    }

    get tableWidth ()
    {
        let recordTableEle = document.getElementsByClassName('area');

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

    render()
    {
        let customerData = this.customerData || {},
            {display, value} = this.state,
            total = customerData && customerData.hasOwnProperty('rows') ? customerData.rows.length : 0,
            {exportLimit, progress, selectColumns = {}} = this.props,
            dealedColumn = this.getColumnHeader(selectColumns['rpt_cooperation'], customerData.columns),
            totalWidth = this.getTotalWidth(dealedColumn);

        if (progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        const pagination = {
            total: total, //数据总条数
            showQuickJumper: true,
            showTotal: (total) => {

                return getLangTxt("total", total);
            },
            onChange: (current) => {

            }
        };

        return (
            <div className="customerServiceContainer" style={{}}>
                <Background width='100%' height='calc(100% - 10px)'/>
                <div className="customerService data">
                    {customerData && customerData.hasOwnProperty('rows') ?
                        <div className="main kpiTableWrapper">
                            <div className="tabTitle">
                                <div className="tabTitleLeft">{getLangTxt("kpi_synergy_detail")}</div>
                                <div className="tabTitleRight">
                                    <KpiTopRight quickDate={this.quickDate.bind(this)} value={value}/>
                                    <Button shape="circle" onClick={this._showScreen.bind(this, [])}>
                                        <i className="iconfont icon icon-shaixuan kpiFilterIcon"/> </Button>
                                    <Button type="primary" size="large" onClick={this._selectColumn.bind(this)} style={{fontSize:'12px'}}>{getLangTxt("kpi_select_content")}</Button>
                                    {
                                        exportLimit ?
                                            <Button type="primary" size="large" onClick={this._exportTable.bind(this)} style={{fontSize:'12px'}}>{getLangTxt("export")}</Button>
                                            : null
                                    }
                                </div>
                            </div>
                            <ScrollArea speed={1} className="area" style={{height: '100%', width: '100%'}} horizontal={false} smoothScrolling>
                                <Table columns={dealedColumn} dataSource={customerData.rows} pagination={pagination} scroll={{x: totalWidth}}/>
                            </ScrollArea> {this.state.visible ?
                            <SelectData name="rpt_cooperation" callBack={this.handleClose.bind(this)}/> : null}
                        </div> : <NoData/>
                    }
                </div>
                {
                    display ? <ShowScreen close={this._showScreen.bind(this)} name='rpt_cooperation'/> : null
                }
                {
                    getProgressComp(progress)
                }
            </div>
        )
    }
}

function mapStateToProps(state)
{
    return {
        query: state.query.data,
        customerData : state.customerService.data,
        progress: state.customerService.progress,
        selectColumns: state.selectColumnsReducer.data,
        exportLimit: state.reportsList.exportLimit,
        date: state.queryTime.queryDate.date,
        isChangeTime: state.queryTime.queryDate.isChangeTime
    };
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({ customerService, getSelectColumns, fetchFilter,  addQuery, setQueryTime }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomerService);
