import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Form, Input, Button, Table, Icon, DatePicker, Upload, Popover, Tooltip } from 'antd';
import ScrollArea from 'react-scrollbar';
import moment from 'moment';
import "./style/blackList.scss"
import { getLangTxt, UPLOAD_FILE_ACTION } from "../../../utils/MyUtil";
import { getAllBlacklist, addBlackList, removeBlackList, clearProgress, getSearchBlacklist } from "./action/blacklistActions";
import { getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { bglen } from "../../../utils/StringUtils";
import { ReFresh } from "../../../components/ReFresh";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

const Search = Input.Search,  FormItem = Form.Item, dateFormat = 'YYYY-MM-DD HH:mm:ss';

class BlackList extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
			selectedRowKeys: [],// 黑名单选中项
			isShowAddModal: false,//是否弹出添加黑名单窗口
			importModal: false,//导入窗口
			currentPage: 1,
            relieveTime: null
		};
	}

	componentDidMount()
	{
		let obj = {
			page: 1,
			rp: 10
		};
		this.props.getAllBlacklist(obj);
	}

	//点击新增黑名单
	handleAddBlack()
	{
		this.props.form.resetFields();
		this.setState({isShowAddModal: true});
	}

	//判断是否仅输入空格
	judgeSpace(rule, value, callback)
	{
		if(value && value.trim() !== "")
		{
			callback();
		}
		callback(" ");
	}

	judgeIptLength(len, rule, value, callback)
	{
		if(value && value.trim() !== "" || !value)
		{
			if((value && value.length <= len) || !value)
			{
				callback();
			}
			callback(" ");
		}
		else
		{
			callback(" ")
		}
	}

	judgeIp(rule, value, callback)
	{
		// let regex = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/;
		let regex = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
		if(value && regex.test(value) || !value)
		{
			callback();
		}
		callback(" ")
	}

    getRemoveTime(value)
    {
        this.setState({
            relieveTime: value.valueOf()
        })
    }

	//点击关闭新增黑名单弹框  isOk : true点击确定
	handleCloseAddModal(isOk)
	{
		if(isOk)
		{
			let {form} = this.props,
				{currentPage = 1, relieveTime} = this.state;
			form.validateFields((errors, values) => {
				if(errors || (!values.userName && !values.userSign && !values.visitorIP))
					return false;

				let blackenTime = new Date().getTime(),
					addInfo = {
						ntid: values.userSign, //客户标识
						requestIP: values.visitorIP, //IP地址
						username: values.userName, //用户名
						blackenTime, //加黑时间
						relieveTime, //解除时间(默认永久,若为0,默认一个月, null为永久)
						blackenReason: values.reason //	加黑理由
					};

				this.props.addBlackList(addInfo, currentPage);

				this.setState({isShowAddModal: false});
				form.setFieldsValue({userSign: "", userName: "", visitorIP: "", removeTime: null, reason: ""});
			})
		}
		else
		{
			this.setState({isShowAddModal: false})
		}
	}

	//点击导入黑名单
	isShowImportModal()
	{
		this.setState({importModal: true})
	}

	onSelectFile(info)
	{
		let type = UPLOAD_FILE_ACTION, {file, fileList} = info, {originFileObj, size} = file;
		fileList = fileList.slice(-1);
	}

	//点击关闭导入框
	handleCloseImportModal()
	{
		this.setState({importModal: false})
	}

	//点击导出黑名单
	handleExportBlackList()
	{

	}

	//点击搜索黑名单
	handleSearchBlack(value)
	{
		this.props.getSearchBlacklist();
	}

	//点击选中table中黑名单
	handleRowSelect(selectedRowKeys)
	{
		this.setState({selectedRowKeys})
	}

	//点击查看黑名单项
	handleShowDetail(record)
	{

	}

	//点击删除黑名单项
	handleDelBlack(record = {})
	{
		confirm({
			title: getLangTxt("tip4"),
			width: '320px',
			content: getLangTxt("blacklist_note1"),
			onOk: () => {
				if(!record.ntid)
					return;
				let obj = {ntid: record.ntid},
					{currentPage = 1} = this.state,
					{blacklistArray = []} = this.props,
					calcPage = blacklistArray.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
				this.props.removeBlackList(obj, calcPage);
				if(blacklistArray.length === 1)
				{
					this.setState({currentPage: calcPage})
				}
			}
		})
	}

	//刷新数据
	reFreshFn()
	{
		this.setState({currentPage: 1});

		let obj = {
			page: 1,
			rp: 10
		};
		this.props.getAllBlacklist(obj);
	}

	clearErrorProgress()
	{
		this.props.clearProgress();
	}

	range(start, end)
	{
		const result = [];
		for(let i = start; i < end; i++)
		{
			result.push(i);
		}
		return result;
	}

	disabledDate(current)
	{
		let nowDate = moment()
		.subtract(1, 'days');

		return current && current.isBefore(nowDate.endOf('day'));
	}

	disabledDateTime(data)
	{
		let nowHour = moment()
			.get('hour'),
			nowMin = moment()
			.get('minute'),
			currentYear = moment()
			.get('year'),
			currentMonth = moment()
			.get('month'),
			currentDate = moment()
			.get('date'),
			selectYear = data && data.get('year'),
			selectMonth = data && data.get('month'),
			selectDate = data && data.get('date');

		if(currentYear === selectYear && currentMonth === selectMonth && currentDate === selectDate)
			return {
				disabledHours: () => this.range(0, nowHour),
				disabledMinutes: () => this.range(0, nowMin)
			};
	}

    getErrorModal(progress, errorMsg)
    {
        if(this.modal)
        {
            this.modal.destroy();
            this.modal = null;
        }
        if(progress === LoadProgressConst.DUPLICATE)
            this.modal = info({
                title: getLangTxt("err_tip"),
                width: '320px',
                iconType: 'exclamation-circle',
                className: 'errorTip',
                content: errorMsg,
                okText: getLangTxt("sure"),
                onOk: () => {
                    this.clearErrorProgress();
                }
            });

        if(progress === LoadProgressConst.SAVING_FAILED)
        {
            this.modal = info({
                title: getLangTxt("err_tip"),
                width: '320px',
                iconType: 'exclamation-circle',
                className: 'errorTip',
                content: getLangTxt("20034"),
                okText: getLangTxt("sure"),
                onOk: () => {
                    this.clearErrorProgress();
                }
            });
        }
    }

	render()
	{
		let {selectedRowKeys = [], isShowAddModal = false, importModal = false, currentPage} = this.state,
			{blacklistArray = [], progress, listCount, form, setting, errorMsg} = this.props,
			isShowAddBtn = setting.includes("blacklist_setting_add"),
			blackReasonCount = form.getFieldValue("reason") ? form.getFieldValue("reason").length : 0;

		const rowSelection = {
				selectedRowKeys,
				onChange: this.handleRowSelect.bind(this)
			},
			pagination = {
				total: listCount,
				current: currentPage,
				showQuickJumper: true,
				showTotal: (total) => {
					return getLangTxt("total", total);
				},
				onChange: currentPage => {
					let obj = {
						page: currentPage,
						rp: 10
					};

					this.setState({currentPage});
					this.props.getAllBlacklist(obj);
				}
			},
			formItemLayout = {
				labelCol: {span: 6},
				wrapperCol: {span: 14}
			},
			{getFieldDecorator} = this.props.form,
			props = {
				name: 'file',
				accept: '.xls,.xlsx',
				listType: 'file',
				action: "http://xiaonenggood.cn"
			};

		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        this.getErrorModal(progress, errorMsg);

		return (
			<div className='blackListContent'>
				<div className="blackListHeader clearFix">
					{
						isShowAddBtn ? <div>
							<Button type="primary"
							        onClick={this.handleAddBlack.bind(this)}>{getLangTxt("setting_blacklist_add")}</Button>
							{
								/*<Button type="primary" onClick={this.isShowImportModal.bind(this)}>批量导入</Button>
								 <Button type="primary" onClick={this.handleExportBlackList.bind(this)}>导出</Button>
								 <Search className="searchBlackList" placeholder="用户名/IP地址" onSearch={this.handleSearchBlack.bind(this)}/>*/
							}
						</div> : null
					}
				</div>
				<div className="blackListTable">
					<ScrollArea
						speed={1}
						horizontal={false}
						className="blackListScrollArea">
						<Table dataSource={blacklistArray} columns={this.getColumn()}
						       pagination={pagination}/* rowSelection={rowSelection}*//>
					</ScrollArea>
				</div>
				<Modal
					className="newBlackModal"
					visible={isShowAddModal}
					title={getLangTxt("setting_blacklist_add_tag")}
					onOk={this.handleCloseAddModal.bind(this, true)}
					onCancel={this.handleCloseAddModal.bind(this, false)}
				>
					<Form>
						<div className="createRules">
							<i className="iconfont icon-010yiwen"/>
							<span>{getLangTxt("setting_blacklist_add_tip")}</span>
						</div>
						<FormItem
							{...formItemLayout}
							label={getLangTxt("setting_blacklist_id")}
							hasFeedback>
							{getFieldDecorator('userSign', {
								initialValue: "",
								rules: [{validator: this.judgeIptLength.bind(this, 100000000000)}]
							})(
								<Input/>
							)}
						</FormItem>
						<FormItem{...formItemLayout} label={getLangTxt("setting_blacklist_username")} hasFeedback>
							{getFieldDecorator('userName', {
								initialValue: "",
								rules: [{validator: this.judgeIptLength.bind(this, 20)}]
							})(
								<Input/>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label={getLangTxt("setting_blacklist_ip")}
							hasFeedback>
							{getFieldDecorator('visitorIP', {
								initialValue: "",
								rules: [{validator: this.judgeIp.bind(this)}]
							})(
								<Input/>
							)}
						</FormItem>
						<FormItem
							className="removeTime"
							{...formItemLayout}
							label={getLangTxt("blacklist_relieve_time")}
							hasFeedback>
							{getFieldDecorator('removeTime')(
								<DatePicker
									format={dateFormat}
									showTime
									disabledDate={this.disabledDate.bind(this)}
									disabledTime={this.disabledDateTime.bind(this)}
                                    onChange={this.getRemoveTime.bind(this)}
								/>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							className="blackReason"
							label={getLangTxt("blacklist_reson")}
							hasFeedback>
							{getFieldDecorator('reason', {
								initialValue: "",
								rules: [{max: 50}, {validator: this.judgeSpace.bind(this)}]
							})(
								<Input className="blackReasonIpt" type="textarea"/>
							)}
							<span className="reasonIptCount">{blackReasonCount}/50</span>
						</FormItem>
					</Form>
				</Modal>
				<Modal
					className="importModal"
					visible={importModal}
					title={getLangTxt("import")}
					onCancel={this.handleCloseImportModal.bind(this)}
					footer={
						[
							<Button key="back" type="ghost" size="large" style={{marginRight: "8px"}}
							        onClick={this.handleCloseImportModal.bind(this)}>{getLangTxt("cancel")}</Button>,
							<Upload showUploadList={false} key="submit" {...props}
							        onChange={this.onSelectFile.bind(this)}>
								<Button type="primary" size="large"
								        onClick={this.handleCloseImportModal.bind(this)}>{getLangTxt("import")}</Button>
							</Upload>
						]
					}
				>
					<div className="attentions">
						<p>{getLangTxt("blacklist_note2")}</p>
						<p>{getLangTxt("blacklist_note3")}</p>
						<p>{getLangTxt("blacklist_note4")}</p>
						<p>{getLangTxt("blacklist_note5")}</p>
						<p>{getLangTxt("blacklist_note6")}</p>
					</div>
				</Modal>
				{
					getProgressComp(progress)
				}
			</div>
		)
	}

	getColumn()
	{
		const operateColumn = [{
			key: 'operation',
			title: getLangTxt("operation"),
			width: '6%',
			render: (text, record) => <div className="blackListOperate">
				{/*<Icon type="search" onClick={this.handleShowDetail.bind(this, record)}/>*/}
				<Tooltip placement="bottom" title={getLangTxt("remove")}>
					<Icon type="delete" onClick={this.handleDelBlack.bind(this, record)}/>
				</Tooltip>
			</div>
		}];
		let {setting} = this.props,
			isShowOperate = setting.includes("blacklist_setting_relieve"),
			col = [...operateColumn],
			column = [{
				key: 'rank',
				title: getLangTxt("serial_number"),
				dataIndex: 'rank',
				width: '5%',
				render: (text) => {

					let {currentPage = 1} = this.state,
						rankNum,
						calcCurrent = (currentPage - 1) * 10;
					calcCurrent === 0 ? rankNum = text : rankNum = calcCurrent + text;
					return <div>{rankNum}</div>
				}
			}, {
				key: 'userSign',
				title: getLangTxt("setting_blacklist_id"),
				dataIndex: 'ntid',
				width: '13%',
				render: (text, record) => {
					return bglen(text) >= 16 ?
						<Popover
							content={
								<div style={{width: '135px', height: 'auto', wordWrap: 'break-word'}}>{text}</div>
							}
							placement="topLeft"
						>
							<div className="blackListTd">{text}</div>
						</Popover>
						:
						<div className="blackListTd">{text}</div>
				}
			}, {
				key: 'userName',
				title: getLangTxt("setting_blacklist_username"),
				dataIndex: 'username',
				width: '13%',
				render: (text, record) => {
					return bglen(text) >= 16 ?
						<Popover
							content={
								<div style={{width: '135px', height: 'auto', wordWrap: 'break-word'}}>{text}</div>
							}
							placement="topLeft"
						>
							<div className="blackListTd">{text}</div>
						</Popover>
						:
						<div className="blackListTd">{text}</div>
				}
			}, {
				key: 'IP',
				title: getLangTxt("setting_blacklist_ip1"),
				dataIndex: 'requestIP',
				width: '13%',
				render: (text) =>
					<div className="blackListTd">{text}</div>
			}/*, {
             key: 'tel',
             title: '手机号',
             dataIndex: 'tel',
             width: '10%'
             }, {
             key: 'email',
             title: '电子邮箱',
             dataIndex: 'email',
             width: '9%',
             render:(text)=>
             <div className="blackListTd">{text}</div>
             }, {
             key: 'region',
             title: '地域',
             dataIndex: 'region',
             width: '9%',
             render:(text)=>
             <div className="blackListTd">{text}</div>
             }*/, {
				key: 'reason',
				title: getLangTxt("blacklist_reson"),
				dataIndex: 'blackenReason',
				width: '12%',
				render: (text) => {
					return bglen(text) >= 14 ?
						<Popover
							content={
								<div style={{width: '135px', height: 'auto', wordWrap: 'break-word'}}>{text}</div>
							}
							placement="topLeft"
						>
							<div className="blackListTd">{text}</div>
						</Popover>
						:
						<div className="blackListTd">{text}</div>
				}
			}, {
				key: 'time',
				title: getLangTxt("setting_blacklist_time"),
				dataIndex: 'blackenTime',
				width: '13%',
				render: (text) => {
					let time = text ? moment(text)
					.format('YYYY-MM-DD HH:mm:ss') : "";
					return <div className="blackListTd">{time}</div>
				}
			}, {
				key: 'removetime',
				title: getLangTxt("blacklist_relieve_time"),
				dataIndex: 'relieveTime',
				width: '13%',
				render: (text) => {
					let time = text != -1 ? moment(text)
					.format('YYYY-MM-DD HH:mm:ss') : getLangTxt("forever");
					return <div className="blackListTd">{time}</div>
				}
			}, {
				key: 'customer',
				title: getLangTxt("setting_blacklist_kf"),
				dataIndex: 'nickname',
				width: '12%',
				render: (text) => {
					return bglen(text) >= 14 ?
						<Popover
							content={
								<div style={{width: '135px', height: 'auto', wordWrap: 'break-word'}}>{text}</div>
							}
							placement="topLeft"
						>
							<div className="blackListTd">{text}</div>
						</Popover>
						:
						<div className="blackListTd">{text}</div>
				}
			}];

		return isShowOperate ? column.concat(col) : column;
	}
}

BlackList = Form.create()(BlackList);

function mapStateToProps(state)
{
	let {startUpData} = state,
		setting = startUpData.get("settingOperation") || [];

	return {
		blacklistArray: state.blacklistReducer.blacklist,
		listCount: state.blacklistReducer.listCount,
		progress: state.blacklistReducer.progress,
		errorMsg: state.blacklistReducer.errorMsg,
		setting
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getAllBlacklist,
		addBlackList,
		removeBlackList,
		clearProgress,
		getSearchBlacklist
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BlackList);
