import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Form, Button, Table, Popover } from 'antd';
import ScrollArea from 'react-scrollbar';
import moment from 'moment';
import "./style/blackList.scss"
import {getAllBlacklist, getSearchBlacklist} from "./action/blacklistActions";
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import {bglen} from "../../../utils/StringUtils";
import {ReFresh} from "../../../components/ReFresh";


class BlackListReadOnly extends React.PureComponent {

    constructor(props)
    {
        super(props);

        this.state = {
            selectedRowKeys: [],// 黑名单选中项
            isShowAddModal: false,//是否弹出添加黑名单窗口
            importModal: false,//导入窗口
            currentPage: 1
        };
    }

    componentDidMount()
    {
        let obj = {
            page:1,
            rp: 10
        };
        this.props.getAllBlacklist(obj);
    }

    //刷新数据
    reFreshFn()
    {
        this.setState({currentPage: 1});

        let obj = {
            page:1,
            rp: 10
        };
        this.props.getAllBlacklist(obj);
    }

    render()
    {
        let {setting} = this.props,
            {currentPage} = this.state,
            {blacklistArray = [], progress, listCount} = this.props,
            isShowAddBtn = setting.includes("blacklist_setting_add");

        const pagination = {
                total: listCount,
                current: currentPage,
                showQuickJumper: true,
                showTotal: (total) => {
                    return getLangTxt("total", total);
                },
                onChange: currentPage => {
                    let obj = {
                        page: currentPage,
                        rp: 10
                    };

                    this.setState({currentPage});
                    this.props.getAllBlacklist(obj);
                }
            };

        if(progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        return (
            <div className='blackListContent'>
                <div className="blackListHeader clearFix">
                    {
                        isShowAddBtn ? <div>
                            <Button disabled type="primary">{getLangTxt("setting_blacklist_add")}</Button>
                            {
                                /*<Button type="primary" onClick={this.isShowImportModal.bind(this)}>批量导入</Button>
                                 <Button type="primary" onClick={this.handleExportBlackList.bind(this)}>导出</Button>
                                 <Search className="searchBlackList" placeholder="用户名/IP地址" onSearch={this.handleSearchBlack.bind(this)}/>*/
                            }
                        </div>
                            :
                            null
                    }
                </div>
                <div className="blackListTable">
                    <ScrollArea
                        speed={1}
                        horizontal={false}
                        className="blackListScrollArea">
                        <Table dataSource={blacklistArray} columns={this.getColumn()} pagination={pagination}/* rowSelection={rowSelection}*//>
                    </ScrollArea>
                </div>
                {
                    getProgressComp(progress)
                }
            </div>
        )
    }

    getColumn()
    {
        let column = [{
                key: 'rank',
                title: getLangTxt("serial_number"),
                dataIndex: 'rank',
                width: '5%',
                render:(text) => {

                    let {currentPage = 1} = this.state,
                        rankNum,
                        calcCurrent = (currentPage - 1) * 10;
                    calcCurrent === 0 ? rankNum = text : rankNum = calcCurrent + text;
                    return <div>{rankNum}</div>
                }
            }, {
                key: 'userSign',
                title: getLangTxt("setting_blacklist_id"),
                dataIndex: 'ntid',
                width: '13%',
                render:(text, record)=>
                {
                    return bglen(text) >= 16 ?
                        <Popover
                            content={
                            <div style={{width: '135px', height: 'auto', wordWrap: 'break-word'}}>{text}</div>
                            }
                            placement="topLeft"
                        >
                            <div className="blackListTd">{text}</div>
                        </Popover>
                        :
                        <div className="blackListTd">{text}</div>
                }
            }, {
                key: 'userName',
                title: getLangTxt("setting_blacklist_username"),
                dataIndex: 'username',
                width: '13%',
                render:(text, record)=>
                {
                    return bglen(text) >= 16 ?
                        <Popover
                            content={
                        <div style={{width: '135px', height: 'auto', wordWrap: 'break-word'}}>{text}</div>
                        }
                            placement="topLeft"
                        >
                            <div className="blackListTd">{text}</div>
                        </Popover>
                        :
                        <div className="blackListTd">{text}</div>
                }
            }, {
                key: 'IP',
                title: getLangTxt("setting_blacklist_ip1"),
                dataIndex: 'requestIP',
                width: '13%',
                render:(text)=>
                    <div className="blackListTd">{text}</div>
            }/*, {
             key: 'tel',
             title: '手机号',
             dataIndex: 'tel',
             width: '10%'
             }, {
             key: 'email',
             title: '电子邮箱',
             dataIndex: 'email',
             width: '9%',
             render:(text)=>
             <div className="blackListTd">{text}</div>
             }, {
             key: 'region',
             title: '地域',
             dataIndex: 'region',
             width: '9%',
             render:(text)=>
             <div className="blackListTd">{text}</div>
             }*/, {
                key: 'reason',
                title: getLangTxt("blacklist_reson"),
                dataIndex: 'blackenReason',
                width: '12%',
                render:(text)=>
                {
                    return bglen(text) >= 14 ?
                        <Popover
                            content={
                                <div style={{width: '135px', height: 'auto', wordWrap: 'break-word'}}>{text}</div>
                            }
                            placement="topLeft"
                        >
                            <div className="blackListTd">{text}</div>
                        </Popover>
                        :
                        <div className="blackListTd">{text}</div>
                }
            }, {
                key: 'time',
                title: getLangTxt("setting_blacklist_time"),
                dataIndex: 'blackenTime',
                width: '13%',
                render: (text) =>{
                    let time = text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : "";
                    return <div className="blackListTd">{time}</div>
                }
            }, {
                key: 'removetime',
                title: getLangTxt("blacklist_relieve_time"),
                dataIndex: 'relieveTime',
                width: '13%',
                render: (text) =>{
                    let time = text != -1 ? moment(text).format('YYYY-MM-DD HH:mm:ss') : getLangTxt("forever");
                    return <div className="blackListTd">{time}</div>
                }
            }, {
                key: 'customer',
                title: getLangTxt("setting_blacklist_kf"),
                dataIndex: 'nickname',
                width: '12%',
                render:(text)=>
                {
                    return bglen(text) >= 14 ?
                        <Popover
                            content={
                            <div style={{width: '135px', height: 'auto', wordWrap: 'break-word'}}>{text}</div>
                            }
                            placement="topLeft"
                        >
                            <div className="blackListTd">{text}</div>
                        </Popover>
                        :
                        <div className="blackListTd">{text}</div>
                }
            }];

        return column;
    }
}

BlackListReadOnly = Form.create()(BlackListReadOnly);

function mapStateToProps(state)
{
    let {startUpData} = state,
        setting = startUpData.get("setting") || [];

    return {
        blacklistArray: state.blacklistReducer.blacklist,
        listCount: state.blacklistReducer.listCount,
        progress: state.blacklistReducer.progress,
        errorMsg: state.blacklistReducer.errorMsg,
        setting
    }
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({
        getAllBlacklist,
        getSearchBlacklist
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BlackListReadOnly);
