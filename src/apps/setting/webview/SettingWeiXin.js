import React, { Component } from 'react';
import { Checkbox } from 'antd';
import { getLangTxt } from "../../../utils/MyUtil";

class SettingWeixin extends Component {
	render()
	{
		let FormItem = this.props.FormItem, getFieldDecorator = this.props.getFieldDecorator,
			wxArr = [getLangTxt("setting_faq")], wx_test = [], wx = [],
			state = (this.props.state && this.props.state) ? this.props.state.wx : null;
		
		if(state)
		{
			for(var i in state)
			{
				wx_test.push(state[i]);
			}
			
			wx_test.map((item, index) =>
			{
				if(item) wx.push(wxArr[index]);
			});
		}
		
		return (
			<div style={{width: '100%', height: 'auto', display: 'flex', boxSizing: 'border-box', padding: '0 30px'}}>
				<div style={{flex: 1, paddingTop: '16px', borderRight: '1px solid #e9e9e9'}}>
					<FormItem>
						<span style={{color: '#000', display: 'block'}}>{getLangTxt("setting_webview_funcs")}</span>
						{getFieldDecorator('settingWx', {initialValue: wx})(
							<Checkbox.Group options={wxArr}/>
						)}
					</FormItem>
				</div>
			</div>
		)
	}
}

export default SettingWeixin;

/*
 
 <div style={{textAlign:'center',borderLeft:'1px solid #e9e9e9',position:'relative',left:'-1px',top:'0px'}}>
 <span style={{display:'block',padding:'20px'}}>
 <i style={{width:"300px",height:'500px',display:'block',background:`url(../../../public/images/phone.png) no-repeat center center`}}></i></span>
 <span style={{}}>预览图</span>
 </div>
 */
