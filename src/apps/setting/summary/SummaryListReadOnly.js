import React from 'react'
import moment from 'moment';
import { Table, Form, Switch, Popover, Tooltip } from 'antd';
import ScrollArea from 'react-scrollbar';
import ListHeadReadOnly from './ListHeadReadOnly';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { getSummaryLeafSearchData, getSummaryAll } from './action/summarySetting';
import { truncateToPop } from "../../../utils/StringUtils";
import { getLangTxt } from "../../../utils/MyUtil";

class SummaryListReadOnly extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {
			currentPage: 1,
			importVisible: false,
			selectedRowKeys: [],
			rangeRows: []
		};
	}
	
	onSearchSummaryList(data)
	{
		this.props.getSummaryLeafSearchData(data);
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
	
	getColumns()
	{
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
						<Switch disabled checked={isCommon}/>
					</div>
				)
			}
		}, {
			title: getLangTxt("setting_record_summary"),
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
							<i className="icon-bianji iconfont"/>
						</Tooltip>
						<Tooltip placement="bottom" title={getLangTxt("del")}>
							<i className="icon-shanchu iconfont"/>
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
				<ListHeadReadOnly
					onSearchSummaryList={this.onSearchSummaryList.bind(this)}
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
			</div>
		)
	}
	
}

SummaryListReadOnly = Form.create()(SummaryListReadOnly);

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getSummaryLeafSearchData,
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

export default connect(mapStateToProps, mapDispatchToProps)(SummaryListReadOnly);
