import React, { Component } from 'react';
import { Select, Table, Tooltip } from 'antd';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import UserGroupSetting from './UserGroupSetting';
import UserGroupSettingReadOnly from './UserGroupSettingReadOnly';
import { distribute } from '../distribution/action/distribute';
import './style/userGroupConfig.scss';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { getLangTxt } from "../../../utils/MyUtil";
import {getProgressComp} from "../../../utils/MyUtil";

class UserGroupConfig extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
			disabled: false,
			settings: false,
			record: null,
			recordArr: null,
			name: null,
			webChat: false,
			usualQuestion: false,
			greetWorld: false,
			autoReply: false
		}
	}

	componentWillMount()
	{
		//this.props.getSkilltag();
		this.props.distribute("managetemplate");
	}

	handleChange(value)
	{
		if(value == getLangTxt("setting_webview"))
		{
			this.setState({webChat: true, usualQuestion: false, greetWorld: false, autoReply: false})
		}
		if(value == getLangTxt("setting_faq"))
		{
			this.setState({webChat: false, usualQuestion: true, greetWorld: false, autoReply: false})
		}
		if(value == getLangTxt("setting_autoreply_greeting"))
		{
			this.setState({webChat: false, usualQuestion: false, greetWorld: true, autoReply: false})
		}
		if(value == getLangTxt("autoResp"))
		{
			this.setState({webChat: false, usualQuestion: false, greetWorld: false, autoReply: true})
		}
		if(this.state.disabled)
		{
			this.settingClick(this.state.record, value);
			//this.setState({disabled: false});
		}
	}

	settingClick(record, name)
	{
		this.setState({disabled: false, settings: true, recordArr: record, name: name})
	}

	returnToMain(msg)
	{
		this.setState({settings: msg})
	}

    reFreshFn()
    {
        this.props.distribute("managetemplate");
    }

	render()
	{
		let {state: data = [], progress} = this.props,
            pagination = {
                total: data.length,
                showTotal: (total) => {
                    return getLangTxt("total", total);
                }
            };

		data?data.forEach((item, index) =>
		{
			item.key = index + 1;
		}):null;

		const columns = [{
				key: 'key',
				dataIndex: 'key',
				title: getLangTxt("serial_number"),
				width: '60px'
			}, {
				key: 'name',
				dataIndex: 'name',
				title: getLangTxt("setting_users_name"),
				width: '40%',
                render: (record) =>
                {
                    return(
                        <div className="userGroupName">{record}</div>
                        )
                }
			}, {
				key: 'status',
				dataIndex: 'status',
				title: getLangTxt("setting_early_warning_state"),
				width: '40%',
				render: (status) =>
				{
					return status == 1 ? getLangTxt("open1") : getLangTxt("close");
				}
			}/*,{
			 title: '访客聊窗',
			 render: (record)=>{
			 return (
			 <span className="settings" onClick={this.settingClick.bind(this, [record], '访客聊窗')}>{record.web}</span>
			 )
			 }
			 },{
			 title: '常见问题',
			 render: (record)=>{
			 return (
			 <span className="settings" onClick={this.settingClick.bind(this, [record], '常见问题')}>{record.problem}</span>
			 )
			 }
			 },{
			 title: '问候语',
			 render: (record)=>{
			 return (
			 <span className="settings" onClick={this.settingClick.bind(this, [record], '问候语')}>{record.greet}</span>
			 )
			 }
			 },{
			 title: '自动回复',
			 render: (record)=>{
			 return (
			 <span className="settings" onClick={this.settingClick.bind(this, [record], '自动回复')}>{record.greet}</span>
			 )
			 }
			 }*/, {
				title: getLangTxt("operation"),
				width: '20%',
				render: (record) =>
				{
					return (
                        <Tooltip placement="bottom" title={getLangTxt("edit")}>
                            <i style={{cursor: "pointer"}} className="icon-bianji iconfont"
                                onClick={this.settingClick.bind(this, [record], getLangTxt("setting_webview"))}/>
                        </Tooltip>
                    )
				}
			}],
			/*data = [
			 {
			 key: 0,
			 name: "缺省用户111",
			 checked: true,
			 web: "已修改",
			 problem: "已修改",
			 greet: "已修改",
			 response: "已修改"
			 }, {
			 key: 1,
			 name: "缺省用户222",
			 checked: false,
			 web: "默认设置",
			 problem: "默认设置",
			 greet: "默认设置",
			 response: "默认设置"
			 }
			 ],*/
			/*rowSelection = {
				onChange: (selectedRowKeys, selectedRows) =>
				{
					console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
				},
				onSelect: (record, selected, selectedRows) =>
				{
					if(selectedRows.length > 0)
					{
						this.setState({disabled: true, record: selectedRows});

					}
				},
				onSelectAll: (selected, selectedRows, changeRows) =>
				{
					this.setState({disabled: true, record: selectedRows})
				}
			},*/
			list = (
				<div className="userGroupTable">
                    <ScrollArea
                        speed={1}
                        horizontal={false}
                        className="userGroupScrollArea">
                        {/*<div className="btn" style={{padding: "0 20px"}}>
                            <Select value="批量设置" style={{width: "100px", height: "32px", float: "right", marginTop: "4px"}}
                                    onChange={this.handleChange.bind(this)}>
                                <Option value="常见问题">常见问题</Option>
                                <Option value="问候语">问候语</Option>
                                <Option value="自动回复">自动回复</Option>
                            </Select>
                        </div>*/}

                        <Table dataSource={data} columns={columns}/* rowSelection={rowSelection}*/ pagination={pagination}/>
                    </ScrollArea>
				</div>
			);

        if(progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		return (
			<div className="userGroupConfig">
				{
					this.state.settings ?
						<UserGroupSetting
							recordArr={this.state.recordArr}
							webChat={this.state.webChat}
							usualQuestion={this.state.usualQuestion}
							greetWorld={this.state.greetWorld}
							autoReply={this.state.autoReply}
							name={this.state.name}
							returnToMain={this.returnToMain.bind(this)}
							route={this.props.route}
						/> : list
				}
                {
                    getProgressComp(progress)
                }
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		state: state.distributeReducer.data,
        progress: state.distributeReducer.progress
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({distribute}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(UserGroupConfig);

