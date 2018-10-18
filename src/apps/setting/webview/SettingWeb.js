import React from 'react';
import { Input, Checkbox, Button, Select, Radio, InputNumber, Switch, message } from 'antd';
import WebContent from './WebContent';
import { by, getLangTxt } from "../../../utils/MyUtil";

const Option = Select.Option, RadioGroup = Radio.Group;

const toolbarData = [{label: getLangTxt("setting_webview_smile"), id: "enable_face"},
	{label: getLangTxt("setting_webview_image"), id: "enable_picture"},
	{label: getLangTxt("setting_webview_file"), id: "enable_file"},
	{label: getLangTxt("setting_webview_evalue"), id: "enable_evaluate"},
	{label: getLangTxt("setting_webview_robot_to_people"), id: "enable_staffservice"}];

/*,
 {label: "截图", id: "enable_capture"},
 {label: "下载", id: "enable_download"},
 {label: "聊天记录", id: "enable_history"},
 {label: "新消息声音", id: "enable_voice"}*/

class SettingWeb extends React.Component {

	link = true;
	windowPositionBtn = "0";

	constructor(props)
	{
		super(props);
		this.state = {
			viewtype: '1',
			windowPosition: null,
			state: false,
			tabsVisited: false,
			link: false,
			companyContent: null,
			tabsContent: null,
			content: null,
			linkSelect: true
		};

		this.styles = {
			div0: {boxSizing: 'border-box', padding: '0 18px 0 10px', display: 'flex'},
			div0_0: {flex: 1, padding: '16px 0'},
			tabs: {
				border: "1px solid rgb(233, 233, 233)", background: "#fff", position: "absolute",
				zIndex: "999", width: "300px", padding: "12px 0", borderRadius: "8px", boxShadow: "0px 0px 6px #ccc"
			},
			btn: {float: "right", marginLeft: "10px"},
			btnGroup: {borderTop: "1px solid rgb(233, 233, 233)", marginTop: "15px", padding: "15px 12px 0 12px"},
			list: {color: '#000', display: 'block', lineHeight: "40px"},
			inputNum: {
				display: "inline-block", width: "50px", marginLeft: '10px', marginBottom: "0px", height: '32px',
				borderRadius: '5px'
			},
			select: {display: "inline-block", width: "76px", marginBottom: "0px", height: '32px'},
			company: {position: "absolute", top: "49px", left: "85px", cursor: "pointer"},
			tabsIcon: {cursor: "pointer", position: "relative", top: "2px", left: "-25px"},
			div0_0_0: {display: 'block', paddingBottom: '20px', overflow: 'hidden'},
			div0_0_0_0: {
				width: '122px', height: '122px', float: 'left', boxSizing: 'border-box', padding: '9px',
				border: '1px solid #d4d4d4',
				marginLeft: "12px"
			},
			div0_0_0_0_pos: {
				width: '180px', height: '120px', float: 'left', boxSizing: 'border-box', padding: '10px 10px 0 10px'
			},
			xPos: {width: '70px', height: '24px', margin: "0 8px", borderRadius: '5px'},
			yPos: {width: '70px', height: '24px', margin: "0 8px", borderRadius: '5px'}
		}
	}

	componentWillReceiveProps(nextProps)
	{
		let {state} = nextProps;

		if(state && state.web && state.web.tabs)
		{
			this.setState({
				companyContent: state.web.tabs.tab.find(item => item.id === 1),
				tabsContent: state.web.tabs.tab.find(item => item.id === 3)
			})
		}
	}

	handleClickWindowPosition(check, type)
	{
		let {state = {web: {}}} = this.props,
			{web = {position: {}}} = state,
			{position} = web,
			planCheck = check && type || !check && !type ? 0 : 1,
			obj = {selected: planCheck};
		Object.assign(position, obj);

		this.setState({
			windowPosition: !this.state.windowPosition
		})
	}

	handleClickWindowPositionBtn(e)
	{
		console.log("SettingWeb handleClickWindowPositionBtn e.target.value = " + e.target.value);

		if(e.target.value)
		{
			this.windowPositionBtn = e.target.value;
			this.link = false;
			this.setState({
				state: !this.state.state
			});
			this.props.getWeb(e.target.value, "type")
		}
	}

	offCompany()
	{
		if(this.state.companyContent && !this.state.tabsVisited)
		{
			this.setState({tabsVisited: true, link: true, content: this.state.companyContent})
		}
		else if(this.state.tabsVisited)
		{
			this.setState({tabsVisited: false, link: false})
		}
	}

	offTabs()
	{
		if(this.state.tabsContent && !this.state.tabsVisited)
		{
			this.setState({tabsVisited: true, content: this.state.tabsContent})
		}
		else if(this.state.tabsVisited)
		{
			this.setState({tabsVisited: false, link: false})
		}
	}

	error(data)
	{
		message.error(data);
	}

	tabsOk()
	{
		let {_this, state} = this.props,
			data = {
				name: _this.props.form.getFieldValue("webName"),
				content: _this.props.form.getFieldValue("webContent")
			},
			editItem;

		if(data.name.length > 4 || data.content.length > 500 || data.name.length < 1)
		{
			return false;
		}
		else
		{
			if(this.state.link)
			{
				if(state.web.tabs.tab.find(item => item.name === data.name && item.id !== 1))
					return;
				this.props.getWeb(data, "company");
				editItem = state.web.tabs.tab.find(item => item.id == 1);
				if(editItem)
				{
					editItem.name = data.name;
					editItem.content = data.content;
				}
				this.setState({tabsVisited: false, link: false, companyContent: data});
			}
			else
			{
				if(state.web.tabs.tab.find(item => item.name === data.name && item.id !== 3))
					return;
				this.props.getWeb(data, "tags");
				editItem = state.web.tabs.tab.find(item => item.id == 3);
				if(editItem)
				{
					editItem.name = data.name;
					editItem.content = data.content;
				}
				this.setState({tabsVisited: false, tabsContent: data});
			}
		}
	}

	tabsCancle()
	{
		this.setState({tabsVisited: false, link: false})
	}

	_onToolBarChange()
	{
	}

	render()
	{
		let state = (this.props.state && this.props.state.web) ? this.props.state.web : null,
			FormItem = this.props.FormItem, getFieldDecorator = this.props.getFieldDecorator,
			webarr = [getLangTxt("setting_webview_smile"), getLangTxt("setting_webview_image"), getLangTxt("setting_webview_file"),
				getLangTxt("setting_webview_evalue"), getLangTxt("setting_webview_robot_to_people")],///*, '截图'5, '下载'6, '聊天记录'7, '新消息声音'8*/
			test = [],
			offset = [getLangTxt("setting_webview_up"), getLangTxt("setting_webview_right"), getLangTxt("setting_webview_down"), getLangTxt("setting_webview_left")],
			offsetArr = [],
			tabarr = [],
			webTab = [],
			num = ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
			iconCompany = (this.state.tabsVisited && this.state.link) ? "icon-xiala1-xiangshang" : "icon-xiala1",
			iconTabs = (this.state.tabsVisited && !this.state.link) ? "icon-xiala1-xiangshang" : "icon-xiala1";

		if(state)
		{
			let toolbar = state.toolbar;
			test = toolbarData.filter(item => toolbar[item.id] == 1)
			.map(item => item.label);

			state.tabs.tab = state.tabs.tab.sort(by("id"));

			state.tabs.tab.map(item => 
            {
                let tabItem = {label: item.name, value: item.id};
                
				tabarr.push(tabItem);
				if(item.onoff) webTab.push(item.id)
			});

			if(state.position.selected)
			{
				state.position.offset.map((item, index) => {
					if(item != null)
					{
						let obj = {
							os: offset[index],
							num: item
						};
						offsetArr.push(obj);
					}
				})
			}
		}

		if(this.link && state && !state.position.selected)
		{
			this.windowPositionBtn = state.position.type;
			state.position.offset.map((item, index) => {
				if(item != null)
				{
					let obj = {
						os: offset[index],
						num: item
					};
					offsetArr.push(obj);
				}
			})
		}

		let selected = state ? state.position.selected == 1 : false;

		let windowPosition = this.state.windowPosition === null ? selected : this.state.windowPosition;

		return (
			<div style={this.styles.div0}>
				<div style={this.styles.div0_0}>
					<div className="settint_web">
						<FormItem className="sameWebBox">
							<span className="sameWebTitle" style={this.styles.list}>{getLangTxt("setting_webview_funcs")}</span>
							{
								getFieldDecorator('webtext', {initialValue: test})(
									<Checkbox.Group options={webarr} onChange={this._onToolBarChange.bind(this)}/>
								)
							}
						</FormItem>

						<FormItem className="web-tabs sameWebBox" style={{position: "relative"}}>
							<span className="sameWebTitle" style={this.styles.list}>{getLangTxt("setting_webview_webtag")}</span>
							{
								getFieldDecorator('webtabs', {initialValue: webTab})(
									<Checkbox.Group options={tabarr}/>
								)
							}
							<i className="iconfont icon-bianji" style={{position: "absolute", top: "49px", left: "107px", cursor: "pointer"}}
							   onClick={this.offCompany.bind(this)}/>

							<i className="iconfont icon-bianji" style={{cursor: "pointer", position: "relative", top: "2px", left: "-15px"}}
							   onClick={this.offTabs.bind(this)}/>
							{
								this.state.tabsVisited ?
									<div className="tabs_content"
									     style={Object.assign({}, this.styles.tabs, !this.state.link ? {left: "170px"} : {})}>
										<WebContent content={this.state.content} FormItem={this.props.FormItem}
										            getFieldDecorator={this.props.getFieldDecorator}/>

										<div style={this.styles.btnGroup}>
											<Button type="primary" style={this.styles.btn}
											        onClick={this.tabsOk.bind(this)}>{getLangTxt("setting_webview_complete")}</Button>
											<Button style={this.styles.btn}
											        onClick={this.tabsCancle.bind(this)}>{getLangTxt("cancel")}</Button>
										</div>
									</div> : null
							}
						</FormItem>

						<FormItem className="sameWebBox">
							<span className="sameWebTitle" style={this.styles.list}>{getLangTxt("setting_webview_newmsg_tip")}</span>
							{
								getFieldDecorator('newMessageType', {initialValue: state ? state.messageTips : 0})(
									<RadioGroup>
										<Radio value={0}>{getLangTxt("setting_webview_force_open")}</Radio>
										<Radio value={1}>{getLangTxt("setting_webview_tip")}</Radio>
									</RadioGroup>
								)
							}
						</FormItem>

						{/*<FormItem className="sameWebBox">
							<span className="sameWebTitle" style={this.styles.list}>聊窗的打开方式</span>
							{
								getFieldDecorator('outPageChat', {initialValue: state ? state.outPageChat : 0})(
									<RadioGroup>
										<Radio value={0}>页内打开</Radio>
										<Radio value={1}>页外打开</Radio>
									</RadioGroup>
								)
							}
						</FormItem>*/}

						<FormItem className="sameWebBox">
							<span className="sameWebTitle" style={this.styles.list}>{getLangTxt("setting_webview_sidebar")}</span>
							{
								getFieldDecorator('autoexpansion', {initialValue: state ? state.autoexpansion : 0})(
									<RadioGroup>
										<Radio value={1}>{getLangTxt("setting_webview_open")}</Radio>
										<Radio value={0}>{getLangTxt("setting_webview_takeup")}</Radio>
									</RadioGroup>
								)
							}
						</FormItem>

						<div className="sameWebBox">
							<span className="sameWebTitle" style={this.styles.list}>{getLangTxt("setting_webview_absolute")}</span>
							<FormItem className="positionStyle" style={{
								display: "inline-block", width: "184px", paddingLeft: "12px", marginBottom: "0",
								boxSizing: "border-box"
							}}>
								{
									getFieldDecorator('positionSelected',
										{initialValue: !selected})
									(
										<Switch checked={!selected}
										        onChange={this.handleClickWindowPosition.bind(this, true)}
										        style={{marginLeft: '0'}}/>
									)
								}
								<span style={{paddingRight: '15px'}}>{getLangTxt("setting_webview_location")}</span>
							</FormItem>

							<FormItem className="positionStyle"
							          style={{display: "inline-block", width: "212px", marginBottom: "0"}}>
								<Switch checked={selected}
								        onChange={this.handleClickWindowPosition.bind(this, false)}/>
								<span>{getLangTxt("setting_webview_relative")}</span>
							</FormItem>

							<div style={{height: "142px"}}>
								<div className="clearFix" style={!selected ? this.styles.div0_0_0 : {display: 'none'}}>
									<div style={this.styles.div0_0_0_0}
									     onClick={this.handleClickWindowPositionBtn.bind(this)}>
										{
											num.map((item, index) => {
													return (
														<button key={index}
														        style={this.windowPositionBtn == index ? {background: '#67717d'} : {}}
														        className="windowPositionBtn" value={item}>
														</button>
													);
												}
											)
										}
									</div>

									<div style={this.styles.div0_0_0_0_pos}>
										<FormItem>
											<div style={{marginBottom: '20px'}}>
												<span>{getLangTxt("setting_webview_x_offset")}</span>
												{
													getFieldDecorator('xoffset', {initialValue: (offsetArr && offsetArr.length > 1) ? offsetArr[1].num : 0})(
														<Input style={this.styles.xPos}/>
													)
												}
												<span>{getLangTxt("setting_webview_pixel")}</span>
											</div>

											<div>
												<span>{getLangTxt("setting_webview_y_offset")}</span>
												{
													getFieldDecorator('yoffset', {initialValue: (offsetArr && offsetArr.length != 0) ? offsetArr[0].num : 0})(
														<Input style={this.styles.xPos}/>
													)
												}
												<span>{getLangTxt("setting_webview_pixel")}</span>
											</div>
										</FormItem>
									</div>
								</div>

								<div style={selected ? {display: 'block'} : {display: 'none'}}>
									<div style={{width: '350px', height: '130px', float: 'left'}}>
										<FormItem>
											<span style={{
												marginRight: '12px', paddingLeft: "12px", boxSizing: "border-box"
											}}>{getLangTxt("setting_webview_id_node")}</span>
											{
												getFieldDecorator('domId', {initialValue: (state && state.position.selected) ? state.position.selector : ""})(
													<Input style={{width: '257px', height: '32px'}}
													       placeholder="例: #ntalkerid"/>
												)
											}
										</FormItem>
										<div style={{marginTop: '16px', height: "100%"}}>
											<span style={{
												display: 'block', height: '80px', float: 'left', margin: "0 20px 0 12px"
											}}>{getLangTxt("setting_webview_distance_node")}</span>
											<div style={{marginRight: '20px'}}>
												<div style={{marginTop: '16px'}}>
													<FormItem style={this.styles.select}>
														{
															getFieldDecorator('topOffset', {initialValue: (state && state.position.selected && offsetArr.length > 0) ? offsetArr[0].os : "上"})(
																<Select style={{width: "76px"}} size='large'
																        getPopupContainer={() => document.querySelector(".ant-layout-aside")}>
																	<Option value="上">{getLangTxt("setting_webview_up")}</Option>
																	<Option value="右">{getLangTxt("setting_webview_right")}</Option>
																</Select>
															)
														}
													</FormItem>
													<FormItem style={this.styles.inputNum}>
														{
															getFieldDecorator('topNumber', {initialValue: (state && state.position.selected && offsetArr.length > 0) ? offsetArr[0].num : 0})(
																<Input/>
															)
														}
													</FormItem>
												</div>

												<div style={{marginTop: '16px'}}>
													<FormItem style={this.styles.select}>
														{
															getFieldDecorator('bottomOffset', {initialValue: (state && state.position.selected && offsetArr.length > 1) ? offsetArr[1].os : "下"})(
																<Select style={{width: "76px"}} size='large'
																        getPopupContainer={() => document.querySelector(".ant-layout-aside")}>
																	<Option value="下">{getLangTxt("setting_webview_up")}</Option>
																	<Option value="左">{getLangTxt("setting_webview_left")}</Option>
																</Select>
															)
														}
													</FormItem>
													<FormItem style={this.styles.inputNum}>
														{
															getFieldDecorator('bottomNumber', {initialValue: (state && state.position.selected && offsetArr.length > 1) ? offsetArr[1].num : 0})(
																<Input/>
															)
														}
													</FormItem>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default SettingWeb;
/*
 <div style={{
 textAlign: 'center', borderLeft: '1px solid #e9e9e9', position: 'relative', left: '-1px', top: '0px'
 }}>
 <span style={{display: 'block', padding: '20px'}}>
 <i style={{
 width: "500px", height: '300px', display: 'block',
 background: `url(../../../../public/images/webviewtype/${this.state.viewtype}.png)`
 }}></i>
 </span>
 <span style={{}}>预览图</span>
 </div>*/
