import React, { Component } from 'react';
import { Checkbox, Button, Radio } from 'antd';
import { getLangTxt } from "../../../utils/MyUtil";

const sdkData = [
	{label: getLangTxt("setting_webview_smile"), value: "enable_face"},
	{label: getLangTxt("setting_webview_image"), value: "enable_picture"},
	{label: getLangTxt("setting_webview_file"), value: "enable_file"},
	{label: getLangTxt("setting_webview_evalue"), value: "enable_evaluate"},
	{label: getLangTxt("setting_webview_pos"), value: "enable_position"},
	{label: getLangTxt("setting_webview_audio1"), value: "enable_voiceInfo"},
	{label: getLangTxt("setting_webview_voice_recog"), value: "enable_voice_recognition"},
	{label: getLangTxt("setting_webview_video"), value: "enable_smallVideo"},
	{label: getLangTxt("setting_faq"), value: "common_problems"},
	{label: getLangTxt("setting_webview_robot_to_people"), value: "enable_staffservice"},

	{label: getLangTxt("setting_webview_realTime_voice"), value: "enable_realTime_voice"},
	{label: getLangTxt("setting_webview_realTime_video"), value: "enable_realTime_video"},
	{label: getLangTxt("setting_webview_input_guide"), value: "enable_input_guide"},
	{label: getLangTxt("setting_webview_remote_assistance"), value: "enable_remote_assistance"}
],
    RadioGroup = Radio.Group;

class SettingSDK extends Component {
    constructor(props)
    {
        super(props);

        this.state = {
            isShowInfos: false
        };
    }

    componentDidMount()
    {
        let {state = {sdk: {}}} = this.props,
            {sdk = {}} = state,
            {voice_recognition_position} = sdk;

        this.setState({voiceRecoRadioVal: voice_recognition_position ? 1 : 0})
    }

    isShowInfos()
    {
        this.setState({isShowInfos: !this.state.isShowInfos})
    }

    voiceRecogOk()
    {
        let {voiceRecoRadioVal} = this.state,
            obj = {
                voice_recognition_position: voiceRecoRadioVal
            };
        this.props.getExtraInfoVal(obj);
        this.setState({isShowInfos: !this.state.isShowInfos})
    }

    onVoiceRecoChange = (e) =>
    {
        this.setState({voiceRecoRadioVal: e.target.value});
    };

	render()
	{
		let FormItem = this.props.FormItem, getFieldDecorator = this.props.getFieldDecorator,
			sdk_test = [], sdk = [],
			state = (this.props.state && this.props.state) ? this.props.state.sdk : null,
            {isShowInfos, voiceRecoRadioVal} = this.state,
            dropDownCls = isShowInfos ? "icon-xiala1-xiangshang" : "icon-xiala1",
            radioStyle = {
                    display: 'block',
                    height: '30px',
                    lineHeight: '30px'
                };

		if(state)
		{
			sdk_test = sdkData.filter(item => state[item.value] == 1)
			.map(item => item.value);
		}

		return (
			<div className="settingSDK"
			     style={{width: '100%', height: 'auto', display: 'flex', boxSizing: 'border-box', padding: '0 10px'}}>
				<div className="sameWebBox" style={{flex: 1, marginTop: '16px'}}>
					<FormItem className="SDKFormItem">
						<span className="sameWebTitle" style={{color: '#000', display: 'block'}}>{getLangTxt("setting_webview_funcs")}</span>
						{
                            getFieldDecorator('settingSDK', {initialValue: sdk_test})(
							<Checkbox.Group options={sdkData}/>
						)}
                        <i className={dropDownCls + " iconfont videoRecogi"} onClick={this.isShowInfos.bind(this)}/>
                        {
                            isShowInfos ?
                                <div className="voiceRecogTab">
                                    <div className="voiceRecogCon">
                                        <p>{getLangTxt("setting_webview_voice_recog_title")}</p>
                                        <RadioGroup onChange={this.onVoiceRecoChange} value={voiceRecoRadioVal}>
                                            <Radio style={radioStyle} value={0}>{getLangTxt("setting_webview_voice_recog1")}</Radio>
                                            <Radio style={radioStyle} value={1}>{getLangTxt("setting_webview_voice_recog2")}</Radio>
                                        </RadioGroup>
                                    </div>
                                    <div className="voiceRecogFooter clearFix">
                                        <Button type="primary"onClick={this.voiceRecogOk.bind(this)}>{getLangTxt("setting_webview_complete")}</Button>
                                        <Button onClick={this.isShowInfos.bind(this)}>{getLangTxt("cancel")}</Button>
                                    </div>
                                </div> : null
                        }
                    </FormItem>
                </div>

			</div>
		)
	}
}

export default SettingSDK;
/*

 <div style={{textAlign:'center',borderLeft:'1px solid #e9e9e9',position:'relative',left:'-1px',top:'0px'}}>
 <span style={{display:'block',padding:'20px'}}>
 <i style={{width:"300px",height:'500px',display:'block',background:`url(../../../public/images/phone.png) no-repeat center center`}}></i></span>
 <span style={{}}>预览图</span>
 </div>*/
