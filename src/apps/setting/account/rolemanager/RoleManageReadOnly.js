import React from 'react'
import { Table, Switch, Popover, Button } from 'antd'
import { bindActionCreators } from 'redux'
import ScrollArea from 'react-scrollbar'
import { getRoleManager } from './roleAction/roleManger'
import { connect } from 'react-redux'
import './style/rolemanager.scss'
import { getLangTxt, getProgressComp } from "../../../../utils/MyUtil";
import {  truncateToPop } from "../../../../utils/StringUtils";

class RoleManageReadOnly extends React.PureComponent {

    constructor(props)
    {
        super(props);
        this.state = {
            currentPage: 1
        };
    }

    componentDidMount()
    {
        let obj={page: 1,rp: 10};
        this.props.getRoleManager(obj);
    }

    render()
    {
        let {roleList = [], roleListCount = 0, progress} = this.props;

        const columns = [{
                key: 'rank',
                dataIndex: 'rank',
                width: '6%',
                render: (text)=> {
                    let { currentPage } = this.state;
                    let rankNum,
                        calcCurrent = (currentPage - 1) * 10;
                    calcCurrent === 0 ? rankNum = text : rankNum = calcCurrent + text;
                    return (
                        <div style={{textAlign: "center"}}>{rankNum}</div>
                    )
                }
            }, {
                key: 'name',
                title: getLangTxt("setting_role_name"),
                dataIndex: 'rolename',
                render: text => {
                    let typeEle = document.querySelector(".roleListStyle"),
                        titleWidth = typeEle && typeEle.clientWidth,
                        roleNameInfo = truncateToPop(text, titleWidth) || {};

                    return (
                        roleNameInfo.show ?
                            <Popover content={<div style={{width: titleWidth + 'px',height:'auto',wordWrap: 'break-word'}}>{text}</div>} placement="topLeft">
                                <div className="roleListStyle">{roleNameInfo.content}</div>
                            </Popover>
                            :
                            <div className="roleListStyle">{text}</div>
                    )
                }
            }, {
                key: 'description',
                title: getLangTxt("setting_role_des"),
                dataIndex: 'description',
                render: text => {
                    let typeEle = document.querySelector(".roleListStyle"),
                        titleWidth = typeEle && typeEle.clientWidth,
                        roleInfo = truncateToPop(text, titleWidth) || {};

                    return (
                        roleInfo.show ?
                            <Popover content={<div style={{width: titleWidth + 'px',height:'auto',wordWrap: 'break-word'}}>{text}</div>} placement="topLeft">
                                <div className="roleListStyle">{roleInfo.content}</div>
                            </Popover>
                            :
                            <div className="roleListStyle">{text}</div>
                    )
                }
            }, {
                key: 'status',
                title: getLangTxt("setting_role_on"),
                dataIndex: 'status',
                render: (text, record)=>
                {
                    return (
                        <Switch disabled checked={record.status == 1}/>
                    )
                }
            }, {
                key: 'usernumber',
                title: getLangTxt("setting_account_count"),
                dataIndex: 'usernumber',
                render: (text, record, index)=>
                {
                    return (
                        <span style={{color: '#067ad8'}}>{text}</span>
                    )
                }
            }],
            pagination = {
                showQuickJumper: true,
                total: roleListCount,
                current: this.state.currentPage,
                showTotal: (total) => {
                    return getLangTxt("total", total);
                },
                onChange: (pageData) => {
                    this.setState({currentPage: pageData});
                    let obj = {page: pageData, rp: 10};
                    this.props.getRoleManager(obj);
                }
            };

        return (
            <div className="rolemanager">
                <div className="rolemanager-head">
                    <Button disabled type="primary">{getLangTxt("setting_add_role")}</Button>
                </div>
                <div className="rolemanager-body">
                    <ScrollArea
                        speed={1}
                        horizontal={false}
                        className="roleScrollArea">
                        <Table dataSource={roleList} columns={columns} pagination={pagination}/>
                    </ScrollArea>
                </div>
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
        roleList: state.newRoleManger.roleList,
        roleListCount: state.newRoleManger.roleListCount,
        progress: state.newRoleManger.progress,
        roleErrorMsg: state.newRoleManger.roleErrorMsg
    }
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({ getRoleManager}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RoleManageReadOnly);
