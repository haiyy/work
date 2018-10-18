import React from 'react';
import {connect} from 'react-redux';
import { Button } from 'antd';
import './../style/thirdPartyAccess.scss'
import { getLangTxt } from "../../../../utils/MyUtil";

class SelectModel extends React.Component {

    constructor(props) {
        super(props);
    }

    onSelectMode(mode)
    {
        this.props.onSelectMode(mode);
    }

    handleCancel()
    {
        this.props.closePage();
    }

    render()
    {
        let { type } = this.props;

        return (
            <div className="modelWrapper">
                <p>{getLangTxt("setting_wechat_butt_mode_select")}</p>

                <div className="modelContent">
                    {
                        type === 'weChat' ?
                            <div className="modelItemBox" onClick={this.onSelectMode.bind(this, 3)}>
                                <i className="iconfont icon-gaojigongnengshouquancopy"></i>
                                <span className="modelText">{getLangTxt("setting_wechat_access_butt")}</span>
                            </div> : null
                    }

                    <div className="modelItemBox" onClick={this.onSelectMode.bind(this, 1)}>
                        <i className="iconfont icon-jisu"></i>
                        <span className="modelText">{getLangTxt("setting_wechat_speed_mode")}</span>
                    </div>

                    <div className="modelItemBox" onClick={this.onSelectMode.bind(this, 2)}>
                        <i className="iconfont icon-kaifazhezhongxin"></i>
                        <span className="modelText">{getLangTxt("setting_wechat_mode")}</span>
                    </div>
                </div>
                <div className="bottomBtnWrapper clearFix">
                    <Button type="primary" onClick={this.handleCancel.bind(this)}>{getLangTxt("pre_step")}</Button>
                    <Button onClick={this.handleCancel.bind(this)}>{getLangTxt("cancel")}</Button>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {}
}

function mapDispatchToProps(dispatch) {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectModel);
