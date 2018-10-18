import React from "react";
import { Table, Button } from 'antd';
import { List } from "immutable";
import './style/callOutRecord.less'
import './style/searchListComp.less'
import { removeInvalidData } from "../util/callCenterUtils";
import Tags from "../util/Tags";
import SearchComponent from "../util/SearchComponent";
import ExportComponent from "../util/ExportComponent";
import DatePickerComponent from "../../record/public/DatePickerComponent"
import NTTableWithPage from "../../../components/NTTableWithPage"

const searchMap = [
	{key: "kfs.kfid"},
	{key: "pleased"},
	{key: "memberacts.actiontype"},
	{key: "customeridentity"},
	{key: "terminal"},
	{key: "region", commitKey: "country"},
	{key: "region", commitKey: "province"},
	{key: "region", commitKey: "city"},
	{key: "source"},
	{key: "solve"}
];

class CalloutUnanswer extends React.Component {
	constructor(props)
	{
		super(props);
		
		this.state = {
			advancedSearchIsShow: false,
			isShowAllFilterData: false,
			//Select val
			selectValue: '',
			// RangeTime Val
			selectedRangeTime: '',
			//current Page(index)
			currentPage: '',
			//total (总计)
			total: '',
			//table (表格内容数据)
			dataSource: [],
			//table (关联header)
			columns: [],
			//table header(数据)
			headers: [],
		}
	}
	
	getColumn()
	{
		return [
			{
				key: 'callid',
				dataIndex: 'callid',
				fieldName: '通话ID',
				width: 100,
				format: 1,
			}, {
				key: 'calltype',
				dataIndex: 'calltype',
				fieldName: '类型',
				width: 100,
				format: 1,
				
			}, {
				key: 'calltime',
				dataIndex: 'calltime',
				fieldName: '呼叫时间',
				format: 1,
				width: 100,
			}, {
				key: 'dialnumber',
				dataIndex: 'dialnumber',
				fieldName: '主叫号码',
				format: 1,
				width: 100,
			}, {
				key: 'diaosource',
				dataIndex: 'diaosource',
				fieldName: '号码归属地',
				format: 1,
				width: 100,
			}, {
				key: 'callkf',
				dataIndex: 'callkf',
				fieldName: '责任客服',
				format: 1,
				width: 100,
			}, {
				key: 'callduration',
				dataIndex: 'callduration',
				fieldName: '通话时长',
				format: 1,
				width: 100,
			}, {
				key: 'callsummarytype',
				dataIndex: 'callsummarytype',
				fieldName: '咨询分类',
				format: 1,
				width: 100,
			}, {
				key: 'callrecord',
				dataIndex: 'callrecord',
				fieldName: '录音',
				format: 1,
				width: 100,
			}, {
				key: 'callsatisfy',
				dataIndex: 'callsatisfy',
				fieldName: '满意度',
				format: 1,
				width: 100,
			}
		]
	}
	
	dataList = [
		{
			callid: "234234234",
			calltype: "2342342342",
			calltime: "342342342342",
			dialnumber: "34234234234234",
			diaosource: "234234234234234",
			callkf: "234234234234",
			callduration: "2423234234234",
			callsummarytype: "234234234234234",
			callrecord: "234234234234234",
			callsatisfy: "234234234234"
			
		}, {
			callid: "234234234",
			calltype: "2342342342",
			calltime: "342342342342",
			dialnumber: "34234234234234",
			diaosource: "234234234234234",
			callkf: "234234234234",
			callduration: "2423234234234",
			callsummarytype: "234234234234234",
			callrecord: "234234234234234",
			callsatisfy: "234234234234"
		}, {
			callid: "234234234",
			calltype: "2342342342",
			calltime: "342342342342",
			dialnumber: "34234234234234",
			diaosource: "234234234234234",
			callkf: "234234234234",
			callduration: "2423234234234",
			callsummarytype: "234234234234234",
			callrecord: "234234234234234",
			callsatisfy: "234234234234"
		},
	];
	
	/*删除tag函数*/
	delTag(key)
	{
		let {startTamp, endTamp} = this.state,
			selectedConditions = this.selectedConditions,
			index = selectedConditions.findIndex(tag => tag.key === key);
		
		if(!this.searchConditions.starttime)
		{
			if(startTamp)
				this.searchConditions.starttime = [{"sign": ">=", "value": parseInt(startTamp / 1000)}];
			
			if(endTamp)
				this.searchConditions.starttime.push({"sign": "<=", "value": parseInt(endTamp / 1000)});
		}
		
		if(index > -1)
		{
			selectedConditions.splice(index, 1);
			
			this.props.updateSelectedConditions(selectedConditions);
			
			searchMap.forEach(data => {
				let filterO = selectedConditions.filter(this.regionFilterFn.bind(this, data));
				
				if(data.key === 'region')
				{
					this.searchConditions[data.commitKey || data.key] = filterO.map(tag => tag.value);
				}
				else
				{
					this.searchConditions[data.commitKey || data.key] = filterO.map(tag => tag.getKey());
				}
			});
			
			removeInvalidData(this.searchConditions);
			
		}
	}
	
	//点击展开筛选条件列表
	isShowAllFilterData(isShowAllFilterData)
	{
		this.setState({isShowAllFilterData: !isShowAllFilterData})
	}
	
	getWidth(width)
	{
		this.clientWidth = width
	}
	
	get selectedConditions()
	{
		return [];
	}
	
	/*清空已选择的搜索条件*/
	emptySelectedConditions()
	{
		let selectedConditions = List(),
			{startTamp, endTamp} = this.state,
			obj = {
				starttime: [
					{
						"sign": ">=",
						"value": parseInt(startTamp / 1000)
					},
					{
						"sign": "<=",
						"value": parseInt(endTamp / 1000)
					}
				]
			};
		
		this.props.updateSelectedConditions(selectedConditions);
		
		this.props.getConsultList(this.isEffective, obj, this.extra);
	}
	
	/*点击筛选图标*/
	onAdvancedSearchCancel()
	{
		this.setState({
			advancedSearchIsShow: !this.state.advancedSearchIsShow
		})
	}
	
	/*SearchVal*/
	changeSearchVal(startTamp, endTamp, value)
	{
		console.log(startTamp, endTamp, value);
	}
	
	render()
	{
		const pagination = {
			total: this.state.total,
			showQuickJumper: true,
			current: this.state.currentPage,
			showTotal: (total) => {
				return `总计 ${total} 条`;
			},
			onChange: (pageData) => {
			}
		};
		
		let widthMore = false,
			className = "",
			filterDataBox = document.getElementById("inComingRecordTags"),
			filterWrapBox = document.getElementsByClassName("callRecordListSelectedWrap")[0],
			{advancedSearchIsShow, isShowAllFilterData, searchTime} = this.state;
		
		if(filterDataBox && filterWrapBox)
		{
			widthMore = filterDataBox.clientWidth > filterWrapBox.clientWidth - 290;
		}
		
		if(!isShowAllFilterData)
		{
			filterDataBox && filterDataBox.setAttribute("class", "selectedBox hideExtra");
		}
		else
		{
			filterDataBox && filterDataBox.setAttribute("class", "selectedBox showExtra");
		}
		
		className = !widthMore || isShowAllFilterData ? "showExtra" : "hideExtra";
		
		return <div className="callOutRecord">
			<DatePickerComponent
				selectValue={this.state.selectValue}
				selectedRangeTime={this.state.selectedRangeTime}
				_onOk={this.changeSearchVal.bind(this)}
			/>
			<div className="callRecordListSelectedWrap">
				<div className="listSelectedWrap">
					<label>已选条件：</label>
					<Tags tags={this.selectedConditions} delDataFn={this.delTag} getWidth={this.getWidth.bind(this)}
					      classname={className} idnames="inComingRecordTags"/>
					{
						widthMore ?
							<a className="stretch" onClick={this.isShowAllFilterData.bind(this, isShowAllFilterData)}>
								{isShowAllFilterData ? '收起' : '展开'}
							</a> : null
					}
					{
						!List.isList(this.selectedConditions) && this.selectedConditions.length > 0 ?
							<a className="empty" onClick={this.emptySelectedConditions.bind(this)}>清空</a> : null
					}
				</div>
				<SearchComponent advancedSearchFun={this.onAdvancedSearchCancel.bind(this)}/>
				<ExportComponent/* search={this.extra.search}*//>
				<Button type="primary" className="showRow">显示列</Button>
			</div>
			<div>
				<NTTableWithPage dataSource={this.dataList} headers={this.getColumn()} pagination={pagination}/>
			</div>
		</div>;
	}
	
}

export default CalloutUnanswer;
