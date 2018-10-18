import React from 'react'
import moment from 'moment';
import { Table, Form, Switch, Popover, Button, Upload, Tooltip } from 'antd';
import ScrollArea from 'react-scrollbar';
import ListHead from './ListHead';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { getSummaryLeafSearchData, editSummaryTypeRank, importSummary, getSummaryAll } from './action/summarySetting';
import { bglen, substr } from "../../../utils/StringUtils"
import { downloadByATag, getLangTxt } from "../../../utils/MyUtil";
import { loginUserProxy } from "../../../utils/MyUtil";
import { upOrDown } from "../../../utils/MyUtil";
import Settings from "../../../utils/Settings";
import { truncateToPop } from "../../../utils/StringUtils";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

//const confirm = Modal.confirm;

class SummaryList extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {
			currentPage: 1,
			importVisible: false,
			selectedRowKeys: [],
			rangeRows: []
		};
		
		this.showAddSummaryLeafModel = this.showAddSummaryLeafModel.bind(this);
		this.showEditSummaryLeafModel = this.showEditSummaryLeafModel.bind(this);
		this.editSummaryLeaf = this.editSummaryLeaf.bind(this);
		this.removeSummaryLeaf = this.removeSummaryLeaf.bind(this);
	}
	
	onSearchSummaryList(data)
	{
		this.props.getSummaryLeafSearchData(data);
	}
	
	showAddSummaryLeafModel()
	{
		this.props.notifyEditSummary({
			isCommon: false,
			startTime: null,
			stopTime: null,
			summaryLeafParentid: "",
			summaryLeafContent: ""
		});
		this.props.showSummaryModel('addSummaryLeaf');
	}
	
	showEditSummaryLeafModel(item)
	{
		item.summaryLeafContent = item.content;
		item.summaryLeafParentid = item.parentid;
		this.props.notifyEditSummary(item);
		this.props.showSummaryModel('editSummaryLeaf');
	}
	
	editSummaryLeaf(data, checked)
	{
		data.isCommon = checked;
		data.parentid = this.props.selectedSummaryType;
		data.oldParentid = this.props.selectedSummaryType;
		
		this.props.editSummaryLeaf(data);
	}
	
	removeSummaryLeaf(id)
	{
		let {summaryLeafList, summaryLeafListCount = 0, getAllItems} = this.props,
			{currentPage = 1} = this.state,
			isUpdate = getAllItems && currentPage < summaryLeafListCount / 10;
		confirm({
			title: getLangTxt("del_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'warnTip',
			content: getLangTxt("del_content"),
			onOk: () => {
				this.props.removeSummaryLeaf({
					summaryid: id
				}, isUpdate, currentPage);
				
				if(getAllItems && summaryLeafList.length === 1)
				{
					currentPage = currentPage > 1 ? currentPage - 1 : currentPage;
					let obj = {
						page: currentPage,
						rp: 10
					};
					this.props.getSummaryAllItems(obj);
					this.setState({currentPage});
					this.props.getCurrentListPage(currentPage)
				}
			},
			onCancel()
			{
			}
		});
	}
	
	//下载模板
	downLoadModal()
	{
		
		let {siteId} = loginUserProxy(),
			downLoadUrl = Settings.querySettingUrl("/exportExcel/summary?siteid=", siteId, "&sample=sample");
		
		downloadByATag(downLoadUrl);
		
	}
	
	//导出模板
	exportSummarys()
	{
		let {siteId} = loginUserProxy(),
			exportUrl = Settings.querySettingUrl("/exportExcel/summary?siteid=", siteId);
		
		downloadByATag(exportUrl);
	}
	
	//导入列表
	importFile(info)
	{
		this.setState({
			importVisible: true
		})
	}
	
	//取消导入
	importVisibleCancel()
	{
		this.setState({
			importVisible: false
		})
	}
	
	//导入咨询总结
	onSelectFile(info)
	{
		
		let {file, fileList} = info, {originFileObj} = file;
		fileList = fileList.slice(-1);
		
		if(info.event)
		{
			this.props.importSummary(originFileObj)
			.then(res => {
				if(!res.success && res.result.code != 400)
				{
					let {result: {msg = ""}} = res,
						msgObject = JSON.parse(msg),
						{groupFailed = [], itemFailed = []} = msgObject,
						groupFailedString = groupFailed.join(","),
						itemFailedString = itemFailed.join(",");
					
					info({
						title: getLangTxt("import_tip"),
						width: '320px',
						iconType: 'exclamation-circle',
						className: 'errorTip',
						okText: getLangTxt("save"),
						content: <div>
							{
								groupFailed.length > 0
									?
									<p className="importErrorMsg" style={{wordBreak: "break-all"}}>
										<span style={{fontWeight: "900"}}>{getLangTxt("setting_summary_note3")}</span>
										{groupFailedString}
									</p> : null
							}
							{
								itemFailed.length > 0
									?
									<p className="importErrorMsg" style={{wordBreak: "break-all"}}>
										<span style={{fontWeight: "900"}}>{getLangTxt("setting_summary_note4")}</span>
										{itemFailedString}
									</p> : null
							}
						</div>,
						onOk: () => {
							this.props.getSummaryAll();
						}
					});
				}
				else if(!res.success && res.result.code == 400)
				{
					error({
						title: getLangTxt("import_tip"),
						width: '320px',
						iconType: 'exclamation-circle',
						className: 'errorTip',
						okText: '确定',
						content: <div>{getLangTxt("setting_import_content5")}</div>
					});
				}
				else
				{
					success({
						title: getLangTxt("import_tip"),
						width: '320px',
						iconType: 'exclamation-circle',
						className: 'commonTip',
						content: <div>{getLangTxt("setting_import_content6")}</div>,
						onOk: () => {
							this.props.getSummaryAllData();
							this.setState({currentPage: 1});
						}
					});
				}
			})
		}
	}
	
	//确认导入
	importVisibleConfirm()
	{
		this.setState({
			importVisible: false
		})
	}
	
	onSelectChange(selectedRowKeys, selectedRows)
	{
		let rangeRows = [];
		selectedRows.forEach(item => {
			rangeRows.push(item.summaryid)
		});
		this.setState({
			selectedRowKeys,
			rangeRows
		});
	}
	
	//咨询总结项排序 type： -1向上； 1向下；
	handleRangeSummaryItem(type)
	{
		let {summaryLeafList = []} = this.props,
			{rangeRows = []} = this.state,
			copyCheckedKeys = [...rangeRows];
		
		summaryLeafList.sort((a, b) => a.rank - b.rank);
		
		let rangeArray = upOrDown(summaryLeafList, copyCheckedKeys, "summaryid", type);
		
		if(rangeRows.length < 1)
			return;
		
		if(rangeArray && rangeArray.length > 0)
			this.props.editSummaryTypeRank(rangeArray);
		
		this.setState({
			itemRangeChange: !this.state.itemRangeChange
		});
	}
	
	getColumns()
	{
		let {isRangeItem} = this.props;
		return [{
			title: '',
			dataIndex: 'rank',
			width: '6%'
		}, {
			title: getLangTxt("setting_summary_common_set"),
			dataIndex: 'isCommon',
			width: '11%',
			render: (isCommon, record) => {
				return (
					<div>
						<Switch checked={isCommon} onChange={this.editSummaryLeaf.bind(this, record.leaf)}/>
					</div>
				)
			}
		}, {
			title: getLangTxt("summary_title"),
			dataIndex: 'name',
			/*sorter: (a, b) => a.name.length - b.name.length,*/
			width: '26%',
			render: (record) => {
				let typeEle = document.querySelector(".consultContent"),
					nameWidth = typeEle && typeEle.clientWidth,
					nameInfo = truncateToPop(record, nameWidth) || {};
				
				return (
					nameInfo.show ?
						<Popover content={<div
							style={{maxWidth: nameWidth + "px", height: 'auto', wordWrap: 'break-word'}}>{record}</div>}
						         placement="topLeft"
						>
							<div className="consultContent">{nameInfo.content}</div>
						</Popover>
						:
						<div className="consultContent">{record}</div>
				)
			}
		}, {
			title: getLangTxt("setting_group_type"),
			dataIndex: 'type',
			width: '25%',
			render: (record) => {
				let typeEle = document.querySelector(".listParentType"),
					typeWidth = typeEle && typeEle.clientWidth,
					typeInfo = truncateToPop(record, typeWidth) || {};
				
				return (
					typeInfo.show ?
						<Popover
							content={<div
								style={{maxWidth: "200px", height: 'auto', wordWrap: 'break-word'}}>{record}</div>}
							placement="topLeft"
						>
							<div className="listParentType">{typeInfo.content}</div>
						</Popover>
						:
						<div className="listParentType">{record}</div>
				)
			}
		}, {
			title: getLangTxt("effective_time"),
			dataIndex: 'time',
			width: '20%'
		}, {
			title: getLangTxt("operation"),
			width: '12%',
			render: (text, record) => {
				return (
					<div className="summaryOperateBox">
						<Tooltip placement="bottom" title={getLangTxt("edit")}>
							<i className="icon-bianji iconfont"
							   onClick={this.showEditSummaryLeafModel.bind(this, record.leaf)}/>
						</Tooltip>
						<Tooltip placement="bottom" title={getLangTxt("del")}>
							<i className="icon-shanchu iconfont"
							   onClick={this.removeSummaryLeaf.bind(this, record.summaryid)}/>
						</Tooltip>
					</div>
				)
			}
		}]
	}
	
	render()
	{
		
		let data = [];
		let {summaryLeafList = [], selectingKey = [], summaryLeafListCount = 0} = this.props,
			{selectedRowKeys = []} = this.state,
			nowTimeStamp = Date.parse(new Date()), judgeOverDue;
		
		summaryLeafList ? summaryLeafList.map((item, index) => {
			if(item.stopTime < nowTimeStamp && item.stopTime != 0)
			{
				judgeOverDue = "overDue"
			}
			else
			{
				judgeOverDue = "due"
			}
			data.push({
				summaryid: item.summaryid,
				key: item.summaryid,
				rank: index + 1,
				name: item.content,
				isCommon: item.isCommon,
				type: item.allSummaryType,
				time: <div className="summaryTimeBox" style={{position: 'relative'}}>
					<div className="startTimeBox">{moment(item.startTime)
					.format('YYYY-MM-DD HH:mm:ss')}</div>
					<div className="endTimeBox">{item.stopTime != 0 ? moment(item.stopTime)
					.format('YYYY-MM-DD HH:mm:ss') : getLangTxt("forever")}</div>
					<div className={judgeOverDue}></div>
				</div>,
				leaf: item
			});
		}) : null;
		
		const pagination = {
				total: summaryLeafListCount,
				current: this.state.currentPage,
				/*showSizeChanger: true,*/
				/*onShowSizeChange(current, pageSize) {
				 },*/
				showQuickJumper: true,
				showTotal: (total) => {
					return getLangTxt("total", total);
				},
				onChange: currentPage => {
					if(this.props.getAllItems)
					{
						let obj = {
							page: currentPage,
							rp: 10
						};
						this.props.getSummaryAllItems(obj);
					}
					this.setState({currentPage});
					this.props.getCurrentListPage(currentPage)
				}
			},
			props = {
				name: 'file',
				accept: '.xls,.xlsx',
				listType: 'file',
				action: "http://xiaonenggood.cn"
			},
			rowSelection = {
				selectedRowKeys,
				onChange: this.onSelectChange.bind(this)
			};
		
		return (
			<div className="summaryListContainer">
				<ListHead
					isRangeItem={this.props.isRangeItem}
					addClick={this.showAddSummaryLeafModel}
					onSearchSummaryList={this.onSearchSummaryList.bind(this)}
					exportSummarys={this.exportSummarys.bind(this)}
					downLoadModal={this.downLoadModal.bind(this)}
					importFile={this.importFile.bind(this)}
					handleRangeSummaryItem={this.handleRangeSummaryItem.bind(this)}
				/>
				<div className='list-con'>
					<ScrollArea
						speed={1}
						horizontal={false}
						className="summaryScrollArea">
						
						{
							this.props.isRangeItem ?
								<Table columns={this.getColumns()} dataSource={data} pagination={pagination}
								       rowSelection={rowSelection}/>
								:
								<Table columns={this.getColumns()} dataSource={data} pagination={pagination}/>
						}
					</ScrollArea>
				</div>
				
				<Modal visible={this.state.importVisible} className="usualTipsRightModal" title={getLangTxt("import")}
				         onCancel={this.importVisibleCancel.bind(this)}
				         footer={
					         [
						         <Button key="back" type="ghost" size="large" style={{marginRight: "8px"}}
						                 onClick={this.importVisibleCancel.bind(this)}>{getLangTxt("cancel")}</Button>,
						         <Upload showUploadList={false} key="submit" {...props}
						                 onChange={this.onSelectFile.bind(this)}>
							         <Button type="primary" size="large"
							                 onClick={this.importVisibleConfirm.bind(this)}>{getLangTxt("import")}</Button>
						         </Upload>
					         ]
				         }>
					<p>{getLangTxt("setting_import_note1")}</p>
					<p>{getLangTxt("setting_import_note2")}</p>
					<p>{getLangTxt("setting_import_note3")}</p>
					<p>{getLangTxt("setting_import_note4")}</p>
					<p>{getLangTxt("setting_import_note5")}</p>
				</Modal>
			</div>
		)
	}
	
}

SummaryList = Form.create()(SummaryList);

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getSummaryLeafSearchData,
		editSummaryTypeRank,
		importSummary,
		getSummaryAll
	}, dispatch);
}

function mapStateToProps(state)
{
	return {
		summaryTypeTree: state.summaryReducer.summaryTypeTree,
		groupProgress: state.summaryReducer.groupProgress,
		summaryLeafList: state.summaryReducer.summaryLeafList,
		summaryLeafListCount: state.summaryReducer.summaryLeafListCount,
		summaryItemErrorMsg: state.summaryReducer.summaryItemErrorMsg,
		progress: state.summaryReducer.progress
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SummaryList);
