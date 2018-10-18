import React, { Component } from "react"
import { Switch, Table, Radio, Input, Popover, Button } from "antd"
import { connect } from "react-redux";
import { bindActionCreators } from "redux"
import "../../../../public/styles/chatpage/asideNavSetting.scss"
import { getChatRightTabsComplete } from "../../../../reducers/startUpLoadReduce";
import cloneDeep from "lodash.clonedeep";
import { urlLoader } from "../../../../lib/utils/cFetch";
import Settings from "../../../../utils/Settings";
import { getDataFromResult, getLangTxt, token } from "../../../../utils/MyUtil";
import NTModal from "../../../../components/NTModal";
import { App } from "../../../App";
import { bglen, substr } from "../../../../utils/StringUtils";

class AsideNavSetting extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.chatRightTabs = cloneDeep(props.chatRightTabs) || [];
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(this.props.chatRightTabs !== nextProps.chatRightTabs)
		{
			this.chatRightTabs = cloneDeep(nextProps.chatRightTabs);
		}
		
		if(columns && columns.length > 0)
		{
			columns[0].title = getLangTxt("rightpage_tab_name");
		}
	}
	
	_onMoveUp(record)
	{
		if(record.show === 0 || !this.eiditEnable)
			return;
		
		let
			show = record.show,
			upRecord = this.chatRightTabs[show - 1];
		
		record.show = show - 1;
		
		if(upRecord)
		{
			upRecord.show = upRecord.show + 1;
		}
		
		this.chatRightTabs.sort(this._tabsSort);
		
		this.forceUpdate();
	}
	
	_onMoveDown(record)
	{
		if(record.show === this.tabCount || !this.eiditEnable)
			return;
		
		let
			show = record.show;
		
		record.show = show + 1;
		
		let downRecord = this.chatRightTabs[record.show];
		if(downRecord)
		{
			downRecord.show = downRecord.show - 1;
		}
		
		this.chatRightTabs.sort(this._tabsSort);
		
		this.forceUpdate();
	}
	
	_onChecked(record, checked)
	{
		record.enabled = (checked || record.defaultoption === 1) ? 1 : 0;
		this.forceUpdate();
	}
	
	_onRadioChanged(record)
	{
		if(!this.eiditEnable)
			return;
		
		if(defaultSelected)
		{
			delete defaultSelected.defaultoption;
			defaultSelected = record;
		}
		
		record.defaultoption = 1;
		this.forceUpdate();
	}
	
	_onNameDoubleClick(record)
	{
		if(!this.eiditEnable)
			return;
		
		record.editor = true;
		this.forceUpdate();
	}
	
	_onNameBlurs(record, e)
	{
		let input = e.target.value;
		record.showname = input || record.showname;
		record.editor = false;
		this.forceUpdate();
	}
	
	_tabsSort(a, b)
	{
		if(!a || !b)
			return 0;
		
		let gap = a.show - b.show;
		if(isNaN(gap))
			return 0;
		
		return gap;
	}
	
	_onSubmitTabsData()
	{
		this.chatRightTabs.map(item => {
			if(item)
				delete item.editor;
		});
		
		urlLoader(Settings.getChatRightTabsUrl(),
			{
				method: "put",
				body: JSON.stringify(this.chatRightTabs),
				headers: {token: token()}
			})
		.then(getDataFromResult)
		.then(({jsonResult}) => {
			
			let chatRightTabs = this.props.chatRightTabs || [];
			Object.assign(chatRightTabs, this.chatRightTabs);
			
			this.props.update();
		});
		
		this.props.onCancel();
	}
	
	get eiditEnable()
	{
		let settingOperation = this.props.settingOperation;
		
		return this.checkEnable && settingOperation.includes("kf_right_tab_edit");
	}
	
	get checkEnable()
	{
		let settingOperation = this.props.settingOperation;
		
		return settingOperation.includes("kf_right_tab_check");
	}
	
	render()
	{
		
		if(!Array.isArray(this.chatRightTabs))
			this.chatRightTabs = [];
		
		this.tabCount = this.chatRightTabs.length - 1;
		
		let styleRight = (Type === 1 && !App.isMaximizable) ? {right: '6px'} : {right: 0};
		
		return (
			<NTModal wrapClassName="tabManage" style={styleRight} width={457}
			         title={getLangTxt("rightpage_tab_manager")} visible
			         footer={[
				         <Button key="back" onClick={this.props.onCancel}>{getLangTxt("cancel")}</Button>,
				         <Button key="submit" type="primary" onClick={this._onSubmitTabsData.bind(this)}
				                 disabled={!this.eiditEnable}>
					         {getLangTxt("sure")}
				         </Button>,
			         ]} onCancel={this.props.onCancel}>
				<div className="asideSetting">
					<Table pagination={false} columns={this.columns} dataSource={this.chatRightTabs}/>
				</div>
			</NTModal>
		);
	}
	
	columns = [
		{
			title: getLangTxt("rightpage_tab_name"),
			dataIndex: "name",
			key: "name",
			width: '30%',
			render: (text, record) => (
				<span>
				{
					bglen(record.name) > 8 ?
						<Popover content={<div>{record.name}</div>} placement="top">
							<span>{substr(record.name, 4) + '...'}</span>
						</Popover>
						:
						<span>{record.name}</span>
				}
	        </span>
			)
		},
		{
			width: '13%',
			render: (text, record) => (
				<span>
	           <Switch checked={record.enabled === 1} onChange={this._onChecked.bind(this, record)}
	                   disabled={!this.eiditEnable}/>
            </span>
			)
		},
		{
			title: getLangTxt("rightpage_tab_default"),
			width: '15%',
			render: (text, record) => {
				let bdefault = record.defaultoption === 1;
				if(bdefault)
					defaultSelected = record;
				
				return <span>
                        <Radio onChange={this._onRadioChanged.bind(this, record)} checked={bdefault}
                               disabled={record.enabled !== 1 && !this.eiditEnable}/>
                    </span>
			}
		},
		{
			title: getLangTxt("rightpage_tab_showname"),
			width: '31%',
			render: (text, record) => (
				<span>
				{
					!record.editor ?
						bglen(record.showname) > 8 ?
							<Popover content={<div>{record.showname}</div>} placement="top">
								<span
									onDoubleClick={this._onNameDoubleClick.bind(this, record)}>{substr(record.showname, 4) + '...'}</span>
							</Popover>
							:
							<span onDoubleClick={this._onNameDoubleClick.bind(this, record)}>
                                {record.showname}
                            </span>
						: <Input defaultValue={record.showname} style={{width: "90px"}}
						         onBlur={this._onNameBlurs.bind(this, record)}/>
				}
	        </span>
			)
		},
		{
			key: "action",
			width: '11%',
			render: (text, record) => (
				<span>
                    <i className="iconfont icon-shangyi"
                       style={record.show === 0 || !this.eiditEnable ? {color: "#ccc"} : {}}
                       onClick={this._onMoveUp.bind(this, record)}/>
		            <i className="iconfont icon-xiayi"
		               style={record.show === this.tabCount || !this.eiditEnable ? {color: "#ccc"} : {}}
		               onClick={this._onMoveDown.bind(this, record)}/>
                </span>
			)
		}];
}

let defaultSelected = null;

function mapStateToProps(state)
{
	let {startUpData} = state,
		chatRightTabs = startUpData.get("chatRightTabs") || [],
		settingOperation = startUpData.get("settingOperation") || [];
	
	return {chatRightTabs, settingOperation};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getChatRightTabsComplete}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AsideNavSetting);
