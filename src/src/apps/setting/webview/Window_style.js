import React, { Component } from 'react';
import { Card, Radio } from 'antd';
import NTModal from "../../../components/NTModal";
import { getLangTxt } from "../../../utils/MyUtil";

const RadioGroup = Radio.Group;

class Window_style extends Component {

	typeCheck = true;

	constructor(props)
	{
		super(props);

		this.state = {
			isOpen: false,
			viewtype: '1',
			openkey: "1",
			settingType: "1",
			previewImage: 1
		}
	}

	previewVisible(i)
	{
		this.setState({
			isOpen: true,
			previewImage: i
		})
	}

	handleClickViewType(i)
	{
		this.typeCheck = false;
		this.setState({viewtype: i});
	}

	handleCancel()
	{
		this.setState({isOpen: false})
	}

	_getWindowStyle(type)
	{//[1, 2, 3, 4, 5, 6]
		return [1, 2, 3, 6].map(
			(item, index) =>
			{
				return (
					<Radio value={item} key={index}>
						<Card style={{width: '142px', height: '92px'}} bodyStyle={{padding: 0}}>
							<div className="custom-image">
								<img style={{width: "100%", height: '92px'}}
								     src={this._getImgUrl(item)}/>
							</div>
							{
								item == (this.typeCheck ? type : this.state.viewtype) ?
									<i className="icon-001zhengque iconfont selectedStyle" style={{color: "#00a854"}}/> : ''
							}
							<span className="change">
                              <span onClick={this.previewVisible.bind(this, item)}>
                                  <i className="iconfont icon-002yincang"/>{getLangTxt("preview")}
                              </span>
                              <span onClick={this.handleClickViewType.bind(this, item)}>
                                  <i className="iconfont icon-001zhengque"/>{getLangTxt("use")}
                              </span>
                          </span>
						</Card>
					</Radio>
				)
			}
		);
	}

	_getImgUrl(value)
	{
		return require("../../../public/images/webviewtype/" + value + ".png");
	}

	render()
	{
		const {previewImage} = this.state,
			{FormItem, chatwindowid = 1} = this.props,
			getFieldDecorator = this.props.getFieldDecorator;

		return (
			<div className="window_style"
			     style={{float: 'left', width: '100%', display: 'flex', marginTop: '15px', padding: '0 30px'}}>
				<span style={{color: '#000', width: '107px', marginTop: "15px"}}>{getLangTxt("setting_webview_style")}</span>
				<FormItem style={{marginBottom: "0px"}}>
					{
						getFieldDecorator('window_style', {initialValue: chatwindowid.toString()})(
							<RadioGroup>
								{
									this._getWindowStyle(chatwindowid)
								}
							</RadioGroup>
						)
					}
				</FormItem>

				<NTModal visible={this.state.isOpen} footer={null} onCancel={this.handleCancel.bind(this)}
				       closable={false} width={1020} wrapClassName="windowStyle">
					<img alt="example" style={{width: '100%'}}
					     src={this._getImgUrl(previewImage +  "-1")}/>
					<i onClick={this.handleCancel.bind(this)} className="icon-guanbi1 iconfont cancelView"/>
				</NTModal>
			</div>
		)
	}
}

export default Window_style;
