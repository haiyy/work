import React from 'react';
import { Table, Popover ,Icon,Tooltip} from 'antd';
import '../public/styles/enterpriseSetting/tableAndTurnpage.scss';
import { formatTime, formatTimestamp ,formatTimes} from "../utils/MyUtil";
import { truncateToPop, formatint, phonetype, checkPhone } from "../utils/StringUtils";
import RecordFormatType from "../apps/record/RecordFormatType";
import { getCellToPopover } from "../utils/ComponentUtils";
import Audio from "../apps/callcenter/util/callAudio";
import {PhoneStatus} from "../../src/apps/callcenter/lib/Xn.PhoneCall"
import {callOut,getStatus} from "../utils/PhoneUtils";
import { getLangTxt } from "../utils/MyUtil";

class NTTableWithPage extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {selectedRows: []};
	}

	componentDidMount()
	{

	}

	pageChange(thePage)
	{
		this.props.selectOnChange(thePage);
	}

	get columns()
	{
		let {columns, headers} = this.props;

		if(Array.isArray(columns) && columns.length > 0) return columns;

		return this.createColunms(headers) || [];
	}

	getColumnWidth(itemWidth, isPercent, totalWidth)
	{
		return isPercent ? itemWidth / totalWidth * 100 + '%' : itemWidth;
	}

	/**
	 * @param Object text col data
	 * @param Object record 单元数据
	 * @param Object format 单元数据类型（自定义）
	 * @param Object width 单元宽度
	 * */
	getColums(text, record, format, width, realWidth)
	{
		let comp = null,
			popObj = null;

		realWidth = realWidth * 2;

		switch(format)
		{
			case RecordFormatType.STRING: //根据宽算出可显示字数，popup,
				popObj = truncateToPop(text, realWidth);
				break;
			case RecordFormatType.PERCENT: //float(0.1) => 10%
				return <span>{(parseFloat(text)) * 100 + '%'}</span>;
				break;
			case RecordFormatType.INT: //1000000 => 1,000,000
				 let value = text == -1 ? formatint(text) : "会话进行中";

				return <span>{value}</span>;
				break;
			case RecordFormatType.ARRAY://1.  [1,2] => 1,2(Array.toString()) 2. //根据宽算出可显示字数，popup, //truncateToFit
				popObj = truncateToPop(text.toString(), realWidth);
				break;
			case RecordFormatType.TIME:
				return <span>{formatTimes(text)}</span>;
				break;
			case RecordFormatType.DATE:
				return text?
				<span>{formatTimestamp(text, true)}</span>
			:null
			 
				break;
			case RecordFormatType.LINK:
				return this.getPage(text);
				break;
			case RecordFormatType.PHONETYPE:
				let cursor = "pointer",
	
				    {callType,activeCallNumber,passiveCallNumber} =record,
					phoneContext;

					if (getStatus() == PhoneStatus.DIS_CONNECT || !checkPhone(text)) {
						cursor = "not-allowed";
					}
				// console.log(callType)
				if(callType=='呼入'){
					return (<div style={{minWidth:95}} className="aKeyToCall"><span>{text}</span>
					<i onClick={this.callOut.bind(this, text)} className={cursor}/></div>);
				 
				}else if(callType=='呼出'){
					return (<div style={{minWidth:95}} className="aKeyToCall"><span>{text}</span>
						<i onClick={this.callOut.bind(this, text)} className={cursor}/></div>);
				}
				break;

			case RecordFormatType.AUDIO :
				// return <Audio src={"http://www.ytmp3.cn/down/51298.mp3"} />;
				return text ?
				<div style={{display:"flex",justifyContent:"center"}}>
				<Audio src={text}/> 
				</div>
				: null;
				break;
			case RecordFormatType.ACTION:
				popObj = truncateToPop(text, realWidth);
				break;
		}

		if(popObj)
		{
			comp = getCellToPopover(popObj.content, popObj.popString, popObj.show);
		}

		return comp;
	}

	callOut(phone,e){
		e.stopPropagation();
		if (getStatus() == PhoneStatus.DIS_CONNECT || !checkPhone(phone)) return;
        callOut(phone,'',4,'');
	}

	createColunms(data)
	{
		if(!Array.isArray(data) || !data.length)
			return [];

		let arr = data,
			newArr = [],
			totalWidth = arr.reduce((accumulator, item) => accumulator + parseInt(item.width), 0),
			tableWidth = this.props.width || 0,
			isPercent = tableWidth > totalWidth;

		this.scrollX = Math.max(totalWidth, this.clientWidth);

		arr.map((item,index) => {
			let {fieldName, key, width = 100, format} = item,
				clientwidth = this.getColumnWidth(width, isPercent, tableWidth),
				realWidth = isPercent ? width / totalWidth * this.scrollX : width;

			let itemObj = {
				title: fieldName,
				dataIndex: key,
				key:key,
				width: clientwidth,
				render: (text, record) => {
					return this.getColums(text, record, format, clientwidth, realWidth);
				}
			};

			newArr.push(itemObj);
		});



		// console.log("lsdkfjlsdkfjlsdfjk", newArr)
		return newArr;
	}

	onrowSelectChange(selectedRowKeys, selectedRows)
	{
		let arr = [],
			{flagTypes} = this.props;
		
		selectedRows.map((item) => {
			if(item.callType == '呼入')
			{
				arr.push({
					"number": item.activeCallNumber,
					"vistorName": item.userName
				})
		
			}
			else
			{
				arr.push({
					"number": item.passiveCallNumber,
					"vistorName": item.userName
				})
		
			}

		})

		this.setState({
			selectedRowKeys
		})


		this.props.onRowSelectChange(arr);
	}

	// 暂停函数
	pauseAll()
	{
		var self = this;
		var audios = document.getElementsByTagName("audio");

		[].forEach.call(audios, function(i) {
			// 将audios中其他的audio全部暂停
			i !== self && i.pause();
		})
	}

	// 给play事件绑定暂停函数
	play()
	{
		var audios = document.getElementsByTagName("audio");
		let _this = this;
		[].forEach.call(audios, (i) => {
			i.addEventListener("play", _this.pauseAll.bind(i));
		})
	}

	onRowListClick(record)
	{
		if(typeof this.props.rowListData === "function")
		{
			this.props.rowListData(record);
		}
	}

	get rowSelection()
	{
		let {checkboxFlag} = this.props,
			{selectedRowKeys=[]} = this.state;

		
		if(checkboxFlag)
		{
			return ({
				selectedRowKeys,
				onChange: this.onrowSelectChange.bind(this)
			})
		}
	}

	get clientWidth()
	{
		let recordTableEle = document.getElementsByClassName('recordTable');

		if(recordTableEle && recordTableEle[0])
		{
			return recordTableEle[0].clientWidth;
		}

		return 0;
	}

	onRow(record, index)
	{
		if(this.props.onRow)
		{
			this.props.onRow(record, index);
		}
	}

	render()
	{
		const pagination = this.props.total !== undefined ? {
				total: this.props.total,
				showQuickJumper: true,
				current: this.props.currentPage || 1,
				onChange: this.pageChange.bind(this),
				showTotal: (total) => {
				return getLangTxt("total", total);
			},
			} : {},
			{dataSource, rowKey} = this.props,
			data = dataSource && dataSource.length ? dataSource : [];

			// console.log("NTTableWithPage roeSelection = ", this.rowSelection)

		return (
			<div className="tableAndTurnpage">
				{
					//需要checkbox 针对呼入未接 呼出未接
					<Table className="recordTable" rowSelection={this.rowSelection} scroll={{x: this.scrollX || false}} rowKey={rowKey}
					       pagination={pagination} dataSource={data} columns={this.columns}
					       onRowClick={this.onRow.bind(this)}/>
				}
				
			</div>
		)
	}
}

export default NTTableWithPage
