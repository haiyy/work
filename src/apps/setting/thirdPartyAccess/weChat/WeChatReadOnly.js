import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Button, Table, Tooltip} from 'antd';
import ScrollArea from 'react-scrollbar';
import './../style/thirdPartyAccess.scss';
import {
    getDeveloperWeChatList,
    deleteWeChatInfo
} from '../reducer/weChatReducer';
import WeChatTopSpeedModel from "./WeChatTopSpeedModel";
import WeChatDevelopModel from "./WeChatDevelopModel";
import WeChatAuthorization from "./WeChatAuthorization";
import SelectModel from "../public/SelectModel";
import { formatTimestamp, getLangTxt, getProgressComp } from "../../../../utils/MyUtil";
import {getAccountGroup} from "../../account/accountAction/sessionLabel";
import Modal,{ confirm, info, error, success, warning } from "../../../../components/xn/modal/Modal";

//const confirm = Modal.confirm,
const modeComponentMap = {
        1: WeChatTopSpeedModel,
        2: WeChatDevelopModel,
        3: WeChatAuthorization
    };

class WeChatReadOnly extends React.Component {

    constructor(props) {
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
            else if (text === 3) {
                typeName = getLangTxt("setting_wechat_access_mode");
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

    render() {
        let { weChatReducer } = this.props,
            developerWXList = weChatReducer.getIn(['developerWXList']) || [],
            progress = weChatReducer.getIn(['progress']) || [],
            {deleteModalIsShow, mode, isNew, isClickBtn, openId} = this.state;

        return (
            <div className="weixinWrapper thirdPartyAccessWrapper">
                {
                    !isClickBtn ?
                        <div className="weixinBox">
                            <div className="weixinHeader">
                                <span className="weixinHeaderText">
                                    <i className="iconfont icon-weixin1"></i>
                                    <span>{getLangTxt("setting_wechat_butt")}</span>
                                </span>
                                <Button type="primary" disabled>+{getLangTxt("setting_wechat_access")}</Button>
                            </div>

                            <div className="weixinContent">
                                <p>{getLangTxt("setting_wechat_note1")}</p>
                                <p>{getLangTxt("setting_wechat_note2")}</p>
                                <ScrollArea speed={1} horizontal={false} smoothScrolling style={{height: 'calc(100% - 60px)'}}>
                                    <Table dataSource={developerWXList} columns={this.columns} pagination={false} />
                                </ScrollArea>

                            </div>
                        </div>
                        :
                        <SelectModel onSelectMode={this.onSelectMode.bind(this)} closePage={this.backToMain.bind(this)} type="weChat" />
                }

                {
                    mode ? this.getModeView(mode, isNew, openId) : null
                }

                {
                    deleteModalIsShow ? this.showDeleteModal() : null
                }

                {
                    getProgressComp(progress)
                }
            </div>
        )
    }
}

function mapStateToProps(state) {
    const weChatReducer = state.weChatReducer;

    return {
        weChatReducer
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getDeveloperWeChatList,
        deleteWeChatInfo,
        getAccountGroup
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(WeChatReadOnly);
