import React, {Component} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import ScrollArea from "react-scrollbar";
import LogUtil from "../../../lib/utils/LogUtil"
import {Menu} from 'antd'
import "../../../utils/css/kpi/kpi.less"
import KpiContent from "./KpiContent";
import {kpiTabList} from "../redux/kpiListReducer";
import {attentionReportList} from "../redux/attentionReducer";
import {getLangTxt, shallowEqual} from "../../../utils/MyUtil";
import {Icon} from 'antd';
import {kpiCompetenceTab} from "../redux/kpiListReducer";

const SubMenu = Menu.SubMenu,
    Item = Menu.Item;

const option = [

    {
        "title": "kpi_my_kanban", "key": "sub1", "icon": "line-chart",
        "subMenu": [
            {"title": "kpi_concerned_data", "key": "attentionData"}
            // {"title": "kpi_custom_kanban", "key": ""},
        ]
    },
    {
        "title": "kpi_online_service", "key": "sub2", "icon": "message",
        "subMenu": [
            {"title": "kpi_performance_board", "key": "dbd_performance_anaylsis", name: "dbd_performance_anaylsis"},
            {"title": "kpi_service_board", "key": "dbd_service_quality", name: "dbd_service_quality"},
            {"title": "kpi_operation_board", "key": "dbd_operation_anaylsis", name: "dbd_operation_anaylsis"},
            {"title": "kpi_flow_board", "key": "dbd_flow_anaylsis", name: "dbd_flow_anaylsis"},
            //{"title": "kpi_customer_board", "key": "kpi_customer_board", name: "dbd_primary_visitor"},
            {"title": "kpi_synergy_detail", "key": "dbd_cs_cooperation", name: "dbd_cs_cooperation"},
            {"title": "kpi_weekly_monthly", "key": "dbd_month_week", name: "dbd_month_week"}
        ]
    },
    {
        "title": "kpi_call_board", "key": "sub3",
        "subMenu": [
            {"title": "kpi_CsReport_board", "key": "CsReport"},
            {"title": "kpi_GroupReport_board", "key": "GroupReport"},
            {"title": "kpi_SiteReport_board", "key": "SiteReport"},
        ]
    },
    {
        "title": "kpi_report_base", "key": "reportsLibrary",
        "subMenu": [
            {"title": "kpi_flow", "key": "FlowAnalyze"},
            {"title": "kpi_consultation", "key": "ConsultAnalyze"},
            {"title": "kpi_evaluate", "key": "CommentAnalyze"},
            {"title": "kpi_summary", "key": "ConsultSummary"},
            {"title": "kpi_worktime", "key": "WortTime"},
            {"title": "kpi_leavewordanalysis", "key": "LeaveMessage"},
            {"title": "kpi_order", "key": "OrderAnalyze"},
            {"title": "kpi_queue", "key": "QueueAnalyze"},
            {"title": "kpi_operational", "key": "OperationAnalyze"}
        ]
    }
];

class KpiTabs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedKey: '1',
            openKeys: ["sub1"],
            path: [],
            isMyself:1,//点击自己标签也离开详情
        };

        this.state.option = this.getOptionsLoop(option.map(item => {
            return {...item}
        }), props.setting);

        this.getDefaultPath();

        this._getMenuMap();

        this.props.attentionReportList();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!shallowEqual(nextProps.kpiLimit, this.props.kpiLimit, true, 2) || !this.state.option) {
            this.state.option = this.getOptionsLoop(option.map(item => {
                return {...item}
            }), nextProps.kpiLimit);

            this.getDefaultPath();

            return true;
        }

        return !shallowEqual(nextState, this.state, true, 2);
    }

    getDefaultPath() {
        if (this.state.path && this.state.path.length > 0)
            return;

        this.state.option.find(item => {
            if (item.hasOwnProperty("subMenu")) //属性是否存在
            {
                if (item.subMenu && item.subMenu.length > 0) {
                    let {title, key} = item,
                        {title: t, key: k, fns} = item.subMenu[0];

                    this.state.path = [{title, key}, {title: t, key: k, fns}];
                    this.state.selectedKey = k;
                    this.state.openKeys = [key];
                }
            }
            else {
                this.state.path = [{...item}];
                this.state.selectedKey = item.key;
            }

            return this.state.path.length;
        });
    }

    componentDidMount() {
        this.props.kpiTabList();
        this.props.kpiCompetenceTab();
    }

    _getMenuMap() {
        this._menuMap = {};
        let loop = option => option.forEach(item => {
            this._menuMap[item.key] = item.title;

            if (item.subMenu && item.subMenu.length)
                loop(item.subMenu);
        });

        loop(option)
    }

    onKpiOpenChange(openKeys) {
        this.setState({openKeys});
    }

    handleKpiMenuClick({item, key, keyPath}) {
        let {props = {children: ""}} = item,
            {children, data} = props,
            {name} = data || {};

        let path = keyPath.map(key => {
            return {key, title: this._menuMap[key], name};
        });
        if(key===this.state.selectedKey){
            this.setState({
                isMyself:this.state.isMyself+1
            });
        }
        this.setState({
            selectedKey: key,
            path: path.reverse()
        });
    }

    getOptionsLoop(opts, setting) {
        if (!setting || setting.length < 0)
            return [];

        return opts.filter(item => {
            if (item.subMenu) {
                item.subMenu = this.getOptionsLoop(item.subMenu, setting);
                return item.subMenu.length;
            }

            return setting.includes(item.key);
            // return fns.find(key => setting.includes(key));
        });
    }

    _getMenuItems() {
        let opts = this.state.option;

        return opts.map(menu => {
            if (menu.subMenu && menu.subMenu.length > 0) {
                return (
                    <SubMenu key={menu.key} title={<span>
                        <i className='iconfont ' style={{
                            marginRight: '8px',
                            position: 'relative',
                            top: '1px',
                            width: '14px',
                            height: '12px',
                            display: 'inline-block'
                        }}/>

                        {getLangTxt(menu.title)}</span>} style={{position: "relative"}}>

                        {
                            menu.subMenu.map(item => {
                                if (item.subMenu && item.subMenu.length > 0) {
                                    return (
                                        <SubMenu key={item.key} data={item}
                                                 title={<span>{getLangTxt(item.title)}</span>}>
                                            {
                                                item.subMenu.map(unit => {
                                                    return (
                                                        <Item key={unit.key} style={{position: "relative"}}
                                                              fns={unit.fns} custom={unit.custom}>
                                                            {/*<i className={unit.icon}/>*/}
                                                            <span>{getLangTxt(unit.title)}</span>
                                                        </Item>
                                                    );
                                                })
                                            }
                                        </SubMenu>
                                    )
                                }

                                return (
                                    <Item key={item.key} style={{position: "relative"}} fns={item.fns}
                                          custom={item.custom} data={item}>
                                        {getLangTxt(item.title)}
                                    </Item>
                                );
                            })
                        }
                    </SubMenu>
                );
            }
            else {
                return (
                    <Item key={menu.key} style={{position: "relative"}}>
                        <i className={menu.icon} style={{marginRight: '8px', position: 'relative', top: '1px'}}/>
                        {
                            getLangTxt(menu.title)
                        }
                    </Item>
                );
            }
        });
    }

    changeRoute(path) {
        let key, selectedKey, {openKeys} = this.state;
        if (path.length === 2 || path.length === 3) {
            key = path[0].key;
            selectedKey = path[path.length - 1].key;
        }
        else {
            key = selectedKey = path[0].key;
        }

        openKeys.push(key);

        this.setState({selectedKey, openKeys, path});
    }

    render() {

        try {
            const {openKeys, selectedKey, path,isMyself} = this.state;

            return (
                <div className="kpi">
                    <ScrollArea className="settingTabsMenuScrollArea" speed={1} horizontal={false} smoothScrolling>
                        <Menu className="user-select-disable" theme="dark" mode="inline"
                              selectedKeys={[selectedKey]} openKeys={openKeys}
                              onOpenChange={this.onKpiOpenChange.bind(this)}
                              onClick={this.handleKpiMenuClick.bind(this)}>
                            {
                                this._getMenuItems()
                            }
                        </Menu>
                    </ScrollArea>
                    <KpiContent path={path} isMyself={isMyself} changeRoute={this.changeRoute.bind(this)}/>
                </div>

            );
        }
        catch (e) {
            LogUtil.trace("KpiPage", LogUtil.ERROR, "render stack = " + e.stack);
        }

        return null;
    }
}

function mapStateToProps(state) {
    let {reportsList} = state,
        {kpiLimit} = reportsList;

    return {kpiLimit};
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({kpiTabList, attentionReportList, kpiCompetenceTab}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(KpiTabs);
