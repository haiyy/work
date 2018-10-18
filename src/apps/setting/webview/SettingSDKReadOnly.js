import React, { Component } from 'react';
import { Checkbox } from 'antd';
import { getLangTxt } from "../../../utils/MyUtil";

const sdkData = [
	{label: getLangTxt("setting_webview_smile"), id: "enable_face"},
	{label: getLangTxt("setting_webview_image"), id: "enable_picture"},
	{label: getLangTxt("setting_webview_file"), id: "enable_file"},
	{label: getLangTxt("setting_webview_evalue"), id: "enable_evaluate"},
	{label: getLangTxt("setting_webview_pos"), id: "enable_position"},
	{label: getLangTxt("setting_webview_audio1"), id: "enable_voiceInfo"},
	{label: getLangTxt("setting_webview_video"), id: "enable_smallVideo"},
	{label: getLangTxt("setting_faq"), id: "common_problems"}];

class SettingSDKReadOnly extends Component {
	
	render()
	{
		let FormItem = this.props.FormItem, getFieldDecorator = this.props.getFieldDecorator,
			sdkArr = [getLangTxt("setting_webview_smile"), getLangTxt("setting_webview_image"),
				getLangTxt("setting_webview_evalue"), getLangTxt("setting_webview_audio1"),
				getLangTxt("setting_webview_video")], // , '常见问题','位置','文件'
			sdk_test = [], sdk = [],
			state = (this.props.state && this.props.state) ? this.props.state.sdk : null;
		
		if(state)
		{
			sdk_test = sdkData.filter(item => state[item.id] == 1)
			.map(item => item.label);
		}
		
		return (
			<div className="settingSDK"
			     style={{width: '100%', height: 'auto', display: 'flex', boxSizing: 'border-box', padding: '0 10px'}}>
				<div className="sameWebBox" style={{flex: 1, marginTop: '16px'}}>
					<FormItem className="SDKFormItem">
						<span className="sameWebTitle" style={{color: '#000', display: 'block'}}>访客端功能</span>
						{getFieldDecorator('settingSDK', {initialValue: sdk_test})(
							<Checkbox.Group disabled options={sdkArr}/>
						)}
					</FormItem>
				</div>
			
			</div>
		)
	}
}

export default SettingSDKReadOnly;
/*

 <div style={{textAlign:'center',borderLeft:'1px solid #e9e9e9',position:'relative',left:'-1px',top:'0px'}}>
 <span style={{display:'block',padding:'20px'}}>
 <i style={{width:"300px",height:'500px',display:'block',background:`url(../../../public/images/phone.png) no-repeat center center`}}></i></span>
 <span style={{}}>预览图</span>
 </div>*/
