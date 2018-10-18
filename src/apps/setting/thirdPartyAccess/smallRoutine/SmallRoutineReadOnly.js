import React from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import { Button, Table, Tooltip } from 'antd';
import SmallRoutineDevelopModel from "./SmallRoutineDevelopModel";
import SmallRoutineTopSpeedModel from "./SmallRoutineTopSpeedModel";
import { formatTimestamp, getLangTxt } from "../../../../utils/MyUtil";
import './../style/thirdPartyAccess.scss';
import {
    getDeveloperWeChatList,
    deleteWeChatInfo
} from '../reducer/smallRoutineReducer';
import SelectModel from "../public/SelectModel";
import {getAccountGroup} from "../../account/accountAction/sessionLabel";
import Modal,{ confirm, info, error, success, warning } from "../../../../components/xn/modal/Modal"
//const confirm = Modal.confirm,
const modeComponentMap = {
        1: SmallRoutineTopSpeedModel,
        2: SmallRoutineDevelopModel
    };

class SmallRoutineReadOnly extends React.Component {

    constructor(props)
    {
        super(props);

        this.state = {
            isClickBtn: false,
            deleteModalIsShow: false,
            isNew: true,
            openId: ''
        };
    }

    columns = [{
        title: getLangTxt("setting_wechat_name"),
        dataIndex: 'name',
        key: 'name'
    }, {
        title: getLangTxt("setting_wechat_butt_mode"),
        dataIndex: 'type',
        key: 'type',
        render: (text) => {
            let typeName = '';
            if (text === 1) {
                typeName = getLangTxt("setting_wechat_speed_mode");
            }
            else if (text === 2) {
                typeName = getLangTxt("setting_wechat_mode");
            }

            return (
                <span>{typeName}</span>
            );
        }
    }, {
        title: getLangTxt("setting_wechat_butt_time"),
        dataIndex: 'time',
        key: 'time',
        render: (text) => {
            return(
                <span> {formatTimestamp(text, true)} </span>
            )
        }
    }, {
        title: getLangTxt("operation"),
        dataIndex: 'operate',
        key: 'operate',
        render: (text, record) => {
            return <div className="thirdPartyAccessOperateBox">
                <Tooltip placement="bottom" title={getLangTxt("edit")}>
                    <i className="iconfont icon-bianji"/> </Tooltip>
                <Tooltip placement="bottom" title={getLangTxt("del")}>
                    <i className="iconfont icon-shanchu"/> </Tooltip>
            </div>
        }
    }];

    componentDidMount()
    {
        this.props.getDeveloperWeChatList();
        this.props.getAccountGroup();
    }

    selectModel()
    {
        this.setState({
            isClickBtn: true
        })
    }

    editList(record) {
        let {type, openid: openId} = record;

        this.setState({mode: type, isNew: false, openId, isClickBtn: true});
    }

    delList(record) {
        this.setState({
            deleteModalIsShow: true,
            openId: record.openid
        })
    }

    showDeleteModal() {
        confirm({
            title: getLangTxt("del_tip"),
            width: '320px',
            iconType: 'exclamation-circle',
            className: 'warnTip skillWarnTip',
            content: <p style={{textAlign: 'center'}}>{getLangTxt("del_content")}</p>,
            cancelText: getLangTxt("cancel"),
            okText: getLangTxt("sure"),
            onOk: this.removeOk.bind(this),
            onCancel: this.removeCancel.bind(this)
        });
    }

    removeOk() {
        let {openId} = this.state;

        this.setState({
            deleteModalIsShow: false
        });

        this.props.deleteWeChatInfo({openid: openId});
    }

    removeCancel() {
        this.setState({
            deleteModalIsShow: false
        })
    }

    backToMain(isPrev)
    {
        this.setState({isClickBtn: isPrev, mode: null})
    }

    getModeView(mode, isNew, openId = "") {
        let weixinModelWrapper = document.getElementsByClassName('weixinModelWrapper');
        if (weixinModelWrapper && weixinModelWrapper.length > 0)
            weixinModelWrapper[0].style.display = 'none';

        let ModeComponent = modeComponentMap[mode];

        if (ModeComponent) {
            return <ModeComponent isNew={isNew} openId={openId} closePage={this.backToMain.bind(this)}/>
        }

        return null;
    }

    onSelectMode(mode, isNew = true) {
        this.setState({mode, isNew, isClickBtn: false});
    }

    render()
    {
        let { smallRoutineReducer } = this.props,
            developerWXList = smallRoutineReducer.getIn(['developerWXList']) || [],
            progress = smallRoutineReducer.getIn(['progress']) || [],
            {deleteModalIsShow, mode, isNew, isClickBtn, openId} = this.state;

        return (
            <div className="weixinWrapper thirdPartyAccessWrapper">
                {
                    !isClickBtn ?
                        <div className="weixinBox">
                            <div className="weixinHeader">
                                <span className="weixinHeaderText">
                                    <i className="iconfont icon-xiaochengxu1"></i>
                                    <span>{getLangTxt("setting_smallroutine_butt")}</span>
                                </span>
                                <Button type="primary" disabled>+{getLangTxt("setting_smallroutine_access")}</Button>
                            </div>

                            <div className="weixinContent">
	                            {getLangTxt("setting_smallroutine_note")}
                                <Table dataSource={developerWXList} columns={this.columns}/>
                            </div>
                        </div> 
                        :
                        <SelectModel onSelectMode={this.onSelectMode.bind(this)} closePage={this.backToMain.bind(this)} type="smallRoutine"/>
                }

                {
                    mode ? this.getModeView(mode, isNew, openId) : null
                }

                {
                    deleteModalIsShow ? this.showDeleteModal() : null
                }
            </div>
        )
    }
}

function mapStateToProps(state)
{
    const smallRoutineReducer = state.smallRoutineReducer;

    return {
        smallRoutineReducer
    }
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({
        getDeveloperWeChatList,
        deleteWeChatInfo,
        getAccountGroup
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SmallRoutineReadOnly);
