import React from 'react';
import moment from 'moment';
import LogUtil from "../../../lib/utils/LogUtil";
import ErrorBoundary from "../../../components/ErrorBoundary";
import SettingsBreadcrumb from "../../setting/enterprise/SettingsBreadcrumb";
import WeeklyMonthly from "./WeeklyMonthly";
import CustomerService from "./CustomerService";
import './scss/kpiDetail.less';
import CommonReport from "./kpiListComp/CommonReport";
import Performance from "./PerformanceKanban.js";
import {getLangTxt} from "../../../utils/MyUtil";

class KpiContent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: "",//tabPane
        };

    }

    componentDidMount() {
        if (!this.refs.setting)
            return;

        let heightSmall = this.refs.setting.clientHeight;
        if (heightSmall < 768) {
            heightSmall = 768;
        }
        this.setState({height: heightSmall});
    }

    _getRightContent() {
        try {
            let {path,isMyself} = this.props,
                item = path.length && path[path.length - 1] || {},
                {key, name} = item,
                moduleName;
            if (path.length <= 0)
                return null;

            let rightContent = null;
            let Comp = key ? fnMap[key] : null;

            if (Comp) {
                rightContent = <Comp value={key} kpiName={name} isMyself={isMyself}/>;
            }
            else {
                moduleName = item.title || "该模块";
                rightContent =
                    <div className="noLimitModuleComp"><span>未获取到{getLangTxt(moduleName)}权限，请确认开启后重试</span></div>
            }

            return (
                <div className="mailCon">
                    <ErrorBoundary>
                        {
                            rightContent
                        }
                    </ErrorBoundary>
                </div>
            );
        }
        catch (e) {
            LogUtil.trace("EnterpriseSetting", LogUtil.INFO, "_getRightContent stack = " + e.stack);
        }

        return null;
    }

    route(path, isNew, editData) {
        this.props.changeRoute(path);
        this.setState({isNew, editData});
    }

    render() {
        let {path} = this.props;
        return (
            <div ref="setting" className="settingRight kpiRight">
                <SettingsBreadcrumb path={path} key="0" iconClass="icon-shuju iconfont"/>
                {
                    this._getRightContent()
                }
            </div>
        );
    }
}

const fnMap = {
    attentionData: CommonReport,
    dbd_month_week: WeeklyMonthly,
    dbd_cs_cooperation: CustomerService,

    dbd_performance_anaylsis: Performance,//绩效分析
    dbd_service_quality: Performance,//服务质量
    dbd_operation_anaylsis: Performance,//运营分析
    dbd_flow_anaylsis: Performance,//流量
    kpi_customer_board: Performance,//重点客户
    //dbd_cs_cooperation:Performance,//协同
    //dbd_month_week: Performance,//周月

    FlowAnalyze: CommonReport,
    ConsultAnalyze: CommonReport,
    CommentAnalyze: CommonReport,
    ConsultSummary: CommonReport,
    WortTime: CommonReport,
    LeaveMessage: CommonReport,
    OrderAnalyze: CommonReport,
    QueueAnalyze: CommonReport,
    OperationAnalyze: CommonReport,

    CsReport: CommonReport,
    GroupReport: CommonReport,
    SiteReport: CommonReport,

};

export default KpiContent;
