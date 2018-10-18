import React  from 'react';
import { Form, Button, Radio, Tabs } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ScrollArea from 'react-scrollbar';
import SettingWebReadOnly from './SettingWebReadOnly';
import SettingSDKReadOnly from './SettingSDKReadOnly';
import SettingWap from './SettingWap';
import SettingWeixin from './SettingWeiXin';
import Window_style from './Window_style';
import { getWebView, setWebView } from './action/webView';
import './style/webView.scss';
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";

const TabPane = Tabs.TabPane,
	RadioGroup = Radio.Group,
	FormItem = Form.Item;

class WebviewReadOnly extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
			type: null,
			company: null,
			tags: null
		};

		this._webViewData = {};
	}

	componentWillReceiveProps(nextProps)
	{
		this._webViewData = nextProps.webViewData || {};
	}

	componentWillMount()
	{
		this.props.getWebView();
	}

	_setData(path = [], value)
	{
		path.reduce((pre, cur, curIndex) =>
		{
			if(pre && pre.hasOwnProperty(cur))
			{
				if(path.length - 1 === curIndex)
				{
					pre[cur] = value;
				}
				return pre[cur];
			}

			return pre;
		}, this._webViewData);
	}

	getWeb(type, link)
	{
		if(link == "type")
		{
			this.setState({type: type})
		}
		else if(link == "company")
		{
			this.setState({company: type})
		}
		else if(link == "tags")
		{
			this.setState({tags: type})
		}
	}

	setWebviewClick()
	{
		let state = this.props.webViewData,
			toolbarArr = [getLangTxt("setting_webview_smile"), getLangTxt("setting_webview_image"), getLangTxt("setting_webview_file"),
				getLangTxt("setting_webview_evalue"), getLangTxt("setting_webview_screenshot"), getLangTxt("down"), getLangTxt("setting_webview_record"), getLangTxt("setting_webview_newmsg"),
				getLangTxt("setting_webview_robot_to_people")
			],
			toolbars = [],
			toolbarValue = this.props.form.getFieldValue("webtext"),
			tabs = [],
			tabarrValue = this.props.form.getFieldValue("webtabs"),
			sdkArr = [getLangTxt("setting_webview_smile"), getLangTxt("setting_webview_image"), getLangTxt("setting_webview_file"),
				getLangTxt("setting_webview_evalue"), getLangTxt("setting_webview_pos"), getLangTxt("setting_webview_audio1"), getLangTxt("setting_webview_video"), getLangTxt("setting_faq"),
				getLangTxt("setting_webview_robot_to_people")
			],
			sdkarr = [],
			sdkValue = this.props.form.getFieldValue("settingSDK"), sdk = {},
			wapArr = [getLangTxt("setting_faq")],
			waparr = [],
			wapValue = this.props.form.getFieldValue("settingWap"),
			wap = {},
			wxArr = [getLangTxt("setting_faq")],
			wxarr = [],
			wxValue = this.props.form.getFieldValue("settingWx"),
			wx = {},
			top = this.props.form.getFieldValue("topOffset"),
			bottom = this.props.form.getFieldValue("bottomOffset"),
			offsetCon = [null, null, null, null],
			position = {};

		toolbarArr.map(
			item =>
			{
				if(toolbarValue.indexOf(item) > -1)
				{
					toolbars.push(1)
				}
				else
				{
					toolbars.push(0)
				}
			});


        state&&state.web.tabs&&state.web.tabs.tab.map((item) =>
		{
			if(tabarrValue.indexOf(item.name) > -1)
			{
				tabs.push(1)
			}
			else
			{
				tabs.push(0)
			}
		});

		if(sdkValue)
		{
			sdkArr.map((item) =>
			{
				if(sdkValue.indexOf(item) > -1)
				{
					sdkarr.push(1)
				}
				else
				{
					sdkarr.push(0)
				}
			});
			sdk = {
				enable_face: sdkarr[0],
				enable_picture: sdkarr[1],
				enable_file: sdkarr[2],
				enable_evaluate: sdkarr[3],
				enable_position: sdkarr[4],
				enable_voiceInfo: sdkarr[5],
				enable_smallVideo: sdkarr[6],
				common_problems: sdkarr[7]
			}
		}
		else
		{
			sdk = state && state.sdk
		}

		if(wapValue)
		{
			wapArr.map((item) =>
			{
				if(wapValue.indexOf(item) > -1)
				{
					waparr.push(1)
				}
				else
				{
					waparr.push(0)
				}
			});
			wap = {common_problems: waparr[0]}
		}
		else
		{
			wap = state.wap
		}

		if(wxValue)
		{
			wxArr.map((item) =>
			{
				if(wxValue.indexOf(item) > -1)
				{
					wxarr.push(1)
				}
				else
				{
					wxarr.push(0)
				}
			});
			wx = {common_problems: wxarr[0]}
		}
		else
		{
			wx = state.wx
		}

		if(top == "上")
		{
			offsetCon[0] = this.props.form.getFieldValue("topNumber")
		}
		else
		{
			offsetCon[1] = this.props.form.getFieldValue("topNumber")
		}

		if(bottom == "下")
		{
			offsetCon[2] = this.props.form.getFieldValue("bottomNumber")
		}
		else
		{
			offsetCon[3] = this.props.form.getFieldValue("bottomNumber")
		}

		if(this.props.form.getFieldValue("positionSelected"))
		{
			if(this.props.form.getFieldValue("xoffset"))
			{
				offsetCon[3] = this.props.form.getFieldValue("xoffset");
			}

			if(this.props.form.getFieldValue("yoffset"))
			{
				offsetCon[0] = this.props.form.getFieldValue("yoffset");
			}
			offsetCon[2] = null;
			position = {
				selected: 0,
				offset: offsetCon,
				type: this.state.type || (state ? state.web && state.web.position.type : 0)
			}
		}
		else
		{
			position = {
				selected: 1,
				offset: offsetCon,
				selector: this.props.form.getFieldValue("domId")
			}
		}

		let data = {
			"autoconnect": this.props.form.getFieldValue("text"),
			"chatwindowid": 1/*parseInt(this.props.form.getFieldValue("window_style"))*/,
			"web": {
				toolbar: {
					enable_face: toolbars[0],
					enable_picture: toolbars[1],
					enable_file: toolbars[2],
					enable_evaluate: toolbars[3],
					enable_capture: toolbars[4],
					enable_download: toolbars[5],
					enable_history: toolbars[6],
					enable_voice: toolbars[7]
				},
				autoexpansion: this.props.form.getFieldValue("autoexpansion"),
				tabs: {
					selected: 2,
					tab: [
						{
							id: 2,
							onoff: tabs[1],
							name: getLangTxt("setting_faq"),
							content: ""
						},
						{
							id: 1,
							onoff: tabs[0],
							name: this.state.company ? this.state.company.name : (state && state.web ? state.web.tabs.tab[0].name : ""),
							content: this.state.company ? this.state.company.content : (state && state.web ? state.web.tabs.tab[0].content : "")
						},
						{
							id: 3,
							onoff: tabs[2],
							name: this.state.tags ? this.state.tags.name : (state && state.web ? state.web.tabs.tab[2].name : ""),
							content: this.state.tags ? this.state.tags.content : (state && state.web ? state.web.tabs.tab[2].name : "")
						}
					]
				},
				messageTips: this.props.form.getFieldValue("newMessageType"),
				position: position,
				//outPageChat: this.props.form.getFieldValue("outPageChat")
				outPageChat: state.web ? state.web.outPageChat : 0
			},
			"sdk": sdk,
			"wap": wap,
			"wx": wx
		};

		this.props.setWebView(data);
	}

	_onAutoConChange({target: {value}})
	{
		this._setData(["autoconnect"], value);
	}

	reFreshFn()
	{
		this.props.getWebView();
	}

	render()
	{
		let {getFieldDecorator} = this.props.form,
			{webViewData = {}, progress} = this.props,
			{chatwindowid} = webViewData,
			styles = {marginTop: '-16px'};

		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		return (
			<div className="webViewScrollWrap" style={{height: '100%'}}>
				<ScrollArea speed={1} className="area" contentClassName="GoodList" horizontal={false} smoothScrolling
				            style={{height: 'calc(100% - 64px)'}}>
					<Form >
						<div style={{padding: '15px 30px 0'}}>
							<span style={{
								display: 'block', float: 'left', marginRight: '30px', color: '#000', lineHeight: "32px"
							}}>{getLangTxt("setting_webview_connect_mode")}</span>

							<FormItem style={{marginBottom: "0px"}}>
								{
									getFieldDecorator('text', {initialValue: webViewData && webViewData.autoconnect})(
										<RadioGroup disabled style={{display: 'block', float: 'left'}}>
											<Radio value={1}
											       style={{display: 'block', float: 'left', marginRight: '30px'}}>
												{getLangTxt("setting_webview_connect")}
											</Radio>
											<Radio value={0} style={{display: 'block', float: 'left'}}>
												{getLangTxt("setting_webview_connect_delay")}
											</Radio>
										</RadioGroup>
									)
								}
							</FormItem>
						</div>
                        {
                            /*<Window_style chatwindowid={chatwindowid} FormItem={FormItem}
                                getFieldDecorator={getFieldDecorator} setWebView={this._setData.bind(this)}/>*/
                        }

						<div style={{float: 'left', width: '100%'}}>
							<Tabs mode="horizontal" style={{width: '100%', marginBottom: '0px'}}>
								<TabPane tab="web聊窗" key="1" style={styles} className="settingWebStyle">
									{
										webViewData ?
											<SettingWebReadOnly state={ webViewData } _this={this}
											            getWeb={this.getWeb.bind(this)}
											            FormItem={FormItem}
											            getFieldDecorator={getFieldDecorator}/>
											: null
									}
								</TabPane>

								<TabPane tab="SDK" key="2" style={styles}>
									<SettingSDKReadOnly state={ webViewData } FormItem={FormItem}
									            getFieldDecorator={getFieldDecorator}/>
								</TabPane>

								{/*<TabPane tab="wap" key="3" style={styles}>*/}
								{/*<SettingWap state={ webViewData } FormItem={FormItem}*/}
								{/*getFieldDecorator={getFieldDecorator}/>*/}
								{/*</TabPane>*/}

								{/*<TabPane tab="微信" key="4" style={styles}>*/}
								{/*<SettingWeixin state={ webViewData } FormItem={FormItem}*/}
								{/*getFieldDecorator={getFieldDecorator}/>*/}
								{/*</TabPane>*/}
							</Tabs>
						</div>
					</Form>

				</ScrollArea>
				<div className="company-footer">
					<Button disabled className="primary" type="primary">
						{getLangTxt("save")}
					</Button>
				</div>

				{
                    _getProgressComp(progress, 'submitStatus')
				}
			</div>
		)
	}
}

WebviewReadOnly = Form.create()(WebviewReadOnly);

function mapStateToProps(state)
{
	return {
		webViewData: state.getWebview.data,
		progress: state.getWebview.progress
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getWebView, setWebView}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(WebviewReadOnly);
