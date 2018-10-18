import React, {Component} from 'react'
import echarts from 'echarts'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {is} from 'immutable'
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
import {ReFresh} from "../../../components/ReFresh"
import Loading from './Loading'
import getQuery from './kpiService/getQuery'
import EnterFrameComp from "../../../components/EnterFrameComp"

class ChartDetails extends EnterFrameComp {
    constructor(props) {
        super(props);
        this.state = {
            showTable: false,
            value: "",
            showDetails: false,
            showSelect: false,
            progress: '2'
        };
        this.value = {};
        this._echart = null;

        this.onWindowResize = this.onWindowResize.bind(this);
    }

    componentDidMount() {
        this.getDome();
        if (this._echart) {
            window.addEventListener('resize', this.onWindowResize)
        }
    }

    onWindowResize() {
        this._echart && this._echart.resize();
    }

    getDome() {
        let {ui, name} = this.props.item,
            requestReportData = this.props.requestReportData,
            chartData = requestReportData[name];

        if (!chartData)
            return;

        let isChart = ui != "grid" && ui != "number",
            seriesData = chartData.length === 3 && chartData[2] || {},
            hasData = seriesData.hasOwnProperty("series");
        if (chartData && isChart && hasData) {
            if (!this._echart) {
                this._echart = echarts.init(document.getElementById(name));
            }
            this._echart.clear();
            this._echart.setOption(seriesData, false);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!is(this.props.requestReportData, nextProps.requestReportData)) {
            this.getDome();
            let name = nextProps.item.name;
            if (nextProps.requestReportData[name] && (this.state.progress !== nextProps.requestReportData[name][0])) {
                this.setState({
                    progress: nextProps.requestReportData[name][0]
                })
            }
        }
    }

    _getProgress(progress, position) {
        if (!progress || progress === LoadProgressConst.LOADING) {
            return (
                <Loading position={position} key={position}/>
            )
        }
        if (progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
    }

    reFreshFn() {
        this.props.reFreshFn();
    }

    componentWillUnmount() {
        if (this._echart) {
            window.removeEventListener('resize', this.onWindowResize);
            this._echart.dispose();
        }

        this._echart = null;
    }

    render() {
        let progress = this.state.progress;
        let {ui, name} = this.props.item;
        return (
            <div className="detailChart">
                <div id={name} className="detailCanvasBox" style={{width:'100%',height:'360px'}}>
                    {this._getProgress(progress, "absolute")}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        requestReportData: state.requestReportData,
        reportDetailsReducer: state.reportDetailsReducer.data
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartDetails);

