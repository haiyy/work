import React from 'react';
import { Input, Checkbox, Select, Radio, Switch, message } from 'antd';
import { by, getLangTxt } from "../../../utils/MyUtil";

const Option = Select.Option, RadioGroup = Radio.Group;

const toolbarData = [{label: getLangTxt("setting_webview_smile"), id: "enable_face"},
	{label: getLangTxt("setting_webview_image"), id: "enable_picture"},
	{label: getLangTxt("setting_webview_file"), id: "enable_file"},
	{label: getLangTxt("setting_webview_evalue"), id: "enable_evaluate"},];

/*,
 {label: "截图", id: "enable_capture"},
 {label: "下载", id: "enable_download"},
 {label: "聊天记录", id: "enable_history"},
 {label: "新消息声音", id: "enable_voice"}*/

class SettingWebReadOnly extends React.Component {

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
				display: "inline-block", width: "50px", marginLeft: '20px', marginBottom: "0px", height: '32px',
				borderRadius: '5px'
			},
			select: {display: "inline-block", width: "50px", marginBottom: "0px", height: '32px'},
			company: {position: "absolute", top: "49px", left: "85px", cursor: "pointer"},
			tabsIcon: {cursor: "pointer", position: "relative", top: "2px", left: "-12px"},
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

	error(data)
	{
		message.error(data);
	}

	render()
	{
		let state = (this.props.state && this.props.state.web) ? this.props.state.web : null,
			FormItem = this.props.FormItem, getFieldDecorator = this.props.getFieldDecorator,
			webarr = [getLangTxt("setting_webview_smile"), getLangTxt("setting_webview_image"), getLangTxt("setting_webview_file"),
				getLangTxt("setting_webview_evalue")],///*, '截图', '下载', '聊天记录', '新消息声音'*/
			test = [],
			offset = [getLangTxt("setting_webview_up"), getLangTxt("setting_webview_right"), getLangTxt("setting_webview_down"), getLangTxt("setting_webview_left")],
			offsetArr = [],
			tabarr = [],
			webTab = [],
			num = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];

		if(state)
		{

			let toolbar = state.toolbar;
			test = toolbarData.filter(item => toolbar[item.id] == 1)
			.map(item => item.label);

			state.tabs.tab = state.tabs.tab.sort(by("id"));

			state.tabs.tab.map(item => {
				tabarr.push(item.name);
				if(item.onoff) webTab.push(item.name)
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

		return (
			<div style={this.styles.div0}>
				<div style={this.styles.div0_0}>
					<div className="settint_web">
						<FormItem className="sameWebBox">
							<span className="sameWebTitle" style={this.styles.list}>{getLangTxt("setting_webview_funcs")}</span>
							{
								getFieldDecorator('webtext', {initialValue: test})(
									<Checkbox.Group disabled options={webarr}/>
								)
							}
						</FormItem>

						<FormItem className="web-tabs sameWebBox" style={{position: "relative"}}>
							<span className="sameWebTitle" style={this.styles.list}>{getLangTxt("setting_webview_webtag")}</span>
							{
								getFieldDecorator('webtabs', {initialValue: webTab})(
									<Checkbox.Group disabled options={tabarr}/>
								)
							}
						</FormItem>

						<FormItem className="sameWebBox">
							<span className="sameWebTitle" style={this.styles.list}>{getLangTxt("setting_webview_newmsg_tip")}</span>
							{
								getFieldDecorator('newMessageType', {initialValue: state ? state.messageTips : 0})(
									<RadioGroup disabled>
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
									<RadioGroup disabled>
										<Radio value={1}>{getLangTxt("setting_webview_open")}</Radio>
										<Radio value={0}>{getLangTxt("setting_webview_takeup")}</Radio>
									</RadioGroup>
								)
							}
						</FormItem>

						<div className="sameWebBox">
							<span className="sameWebTitle" style={this.styles.list}>{getLangTxt("setting_webview_absolute")}</span>
							<FormItem className="positionStyle" style={{
								display: "inline-block", width: "140px", paddingLeft: "12px", marginBottom: "0",
								boxSizing: "border-box"
							}}>
								{
									getFieldDecorator('positionSelected',
										{initialValue: !selected})
									(
										<Switch disabled checked={!selected}
										        style={{marginLeft: '0'}}/>
									)
								}
								<span style={{paddingRight: '15px'}}>{getLangTxt("setting_webview_location")}</span>
							</FormItem>

							<FormItem className="positionStyle"
							          style={{display: "inline-block", width: "160px", marginBottom: "0"}}>
								<Switch disabled checked={selected}/>
								<span>{getLangTxt("setting_webview_relative")}</span>
							</FormItem>

							<div style={{height: "142px"}}>
								<div className="clearFix" style={!selected ? this.styles.div0_0_0 : {display: 'none'}}>
									<div style={this.styles.div0_0_0_0}>
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
														<Input disabled style={this.styles.xPos}/>
													)
												}
												<span>{getLangTxt("setting_webview_pixel")}</span>
											</div>

											<div>
												<span>{getLangTxt("setting_webview_y_offset")}</span>
												{
													getFieldDecorator('yoffset', {initialValue: (offsetArr && offsetArr.length != 0) ? offsetArr[0].num : 0})(
														<Input disabled style={this.styles.xPos}/>
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
													<Input disabled style={{width: '257px', height: '32px'}}
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
																<Select disabled style={{width: "52px"}} size='large'
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
																<Input disabled/>
															)
														}
													</FormItem>
												</div>

												<div style={{marginTop: '16px'}}>
													<FormItem style={this.styles.select}>
														{
															getFieldDecorator('bottomOffset', {initialValue: (state && state.position.selected && offsetArr.length > 1) ? offsetArr[1].os : "下"})(
																<Select disabled style={{width: "52px"}} size='large'
																        getPopupContainer={() => document.querySelector(".ant-layout-aside")}>
																	<Option value="下">{getLangTxt("setting_webview_down")}</Option>
																	<Option value="左">{getLangTxt("setting_webview_left")}</Option>
																</Select>
															)
														}
													</FormItem>
													<FormItem style={this.styles.inputNum}>
														{
															getFieldDecorator('bottomNumber', {initialValue: (state && state.position.selected && offsetArr.length > 1) ? offsetArr[1].num : 0})(
																<Input disabled/>
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

export default SettingWebReadOnly;
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
