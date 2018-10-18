import React from 'react';
import { Button } from 'antd';
import './../style/thirdPartyAccess.scss';
import NTIFrame from "../../../../components/NTIFrame";
import { configProxy, getLangTxt, loginUserProxy, token } from "../../../../utils/MyUtil";

class WxAuthorization extends React.Component {

    constructor(props)
    {
        super(props);
    }

    /*点击取消按钮*/
    handleCancel()
    {
        this.props.closePage();
    }

    /*点击上一步*/
    handlePrevStep()
    {
        this.props.closePage(true);
    }

    render()
    {
        let { siteId } = loginUserProxy(),
        src = configProxy().nAuthorize + '/auth/wechat/loginpage/' + siteId + '?token=' + token();
        
        return (
            <div className="topspeedModelContent">
                <div className="iframeContent">
                    <NTIFrame style={{width: '100%', height: '100%'}} src={src}/>
                </div>

                <div className="bottomBtnWrapper">
                    <Button type="primary" onClick={this.handlePrevStep.bind(this)}>{getLangTxt("pre_step")}</Button>
                    <Button type="primary" onClick={this.handleCancel.bind(this)}>{getLangTxt("cancel")}</Button>
                </div>
            </div>
        )
    }
}

export default WxAuthorization;
