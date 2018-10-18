import React from 'react';
import { Table as ATable } from "antd";
import './style/tableAndTurnpage.less';
import { getCellToPopover, getATag } from "../../utils/ComponentUtils";
import Audio from "../../apps/callcenter/util/callAudio";
import { PhoneStatus } from "../../apps/callcenter/lib/Xn.PhoneCall"
import { formatTimestamp, formatTimes, getLangTxt } from "../../utils/MyUtil";
import { callOut, getStatus } from "../../utils/PhoneUtils";
import { truncateToPop, formatint, checkPhone } from "../../utils/StringUtils";
import RecordFormatType from "../../apps/record/RecordFormatType";
import classNames from 'classnames';

class Table extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {selectedRows: []};
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
	 * @param Object text 选择项显示的文字
	 * @param Object record 选择项数据
	 * @param Object format 单元数据类型（自定义）
	 * @param Object width 单元宽度
	 * @param Object realWidth 真实宽度
	 * */
	getColums(text, record, format, width, realWidth)
	{
		let comp = null,
			popObj = null;
		
		switch(format)
		{
			case RecordFormatType.STRING: //根据宽算出可显示字数，popup,
				popObj = truncateToPop(text, realWidth);
				break;
			
			case RecordFormatType.PERCENT: //float(0.1) => 10%
				return <span>{(parseFloat(text)) * 100 + '%'}</span>;
			
			case RecordFormatType.INT: //1000000 => 1,000,000
				let value = text == -1 ? formatint(text) : "会话进行中";
				
				return <span>{value}</span>;
			
			case RecordFormatType.ARRAY://1.  [1,2] => 1,2(Array.toString()) 2. //根据宽算出可显示字数，popup, //truncateToFit
				popObj = truncateToPop(text.toString(), realWidth);
				break;
			
			case RecordFormatType.TIME:
				return <span>{formatTimes(text)}</span>;
			
			case RecordFormatType.DATE:
				return text ?
					<span>{formatTimestamp(text, true)}</span>
					: null
				
				break;
			
			case RecordFormatType.LINK:
				return this.getPage(text, realWidth);
			
			case RecordFormatType.PHONETYPE:
				let cursor = "pointer";
				
				if(getStatus() == PhoneStatus.DIS_CONNECT || !checkPhone(text))
				{
					cursor = "not-allowed";
				}
				return (
					<div style={{minWidth: 95}} className="aKeyToCall">
						<span>{text}</span>
						<i onClick={this.callOut.bind(this, text)} className={cursor}/>
					</div>
				);
			
			case RecordFormatType.AUDIO:
				if(!text) return null;
				
				return (
					<div style={{display: "flex", justifyContent: "center"}}>
						<Audio src={text}/>
					</div>
				);
			
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
	
	getPage(value, realWidth)
	{
		let {url, title} = value;
		
		return getATag(url, title, "", realWidth);
	}
	
	callOut(phone, e)
	{
		e.stopPropagation();
		
		if(getStatus() == PhoneStatus.DIS_CONNECT || !checkPhone(phone)) return;
		
		callOut(phone, '', 4, '');
	}
	
	createColunms(data)
	{
		if(!Array.isArray(data) || !data.length)
			return [];
		
		let arr = data,
			totalWidth = arr.reduce((accumulator, item) => accumulator + parseInt(item.width), 0),
			tableWidth = this.props.width || 0,
			isPercent = tableWidth > totalWidth;
		
		this.scrollX = Math.max(totalWidth, this.clientWidth);
		
		return arr.map(item => {
			let {fieldName, key, width = 100, format} = item,
				clientwidth = this.getColumnWidth(width, isPercent, tableWidth),
				realWidth = isPercent ? width / totalWidth * this.scrollX : width;
			
			return {
				title: fieldName,
				dataIndex: key,
				key: key,
				width: clientwidth,
				render: (text, record) => {
					return this.getColums(text, record, format, clientwidth, realWidth);
				}
			};
		});
	}
	
	onrowSelectChange(selectedRowKeys, selectedRows)
	{
		let arr = selectedRows.map((item) => {
			let number = item.callType == '呼入' ? "activeCallNumber" : "passiveCallNumber";
			
			return {
				"number": item[number],
				"vistorName": item.userName
			};
		})
		
		this.setState({selectedRowKeys});
		
		this.props.onRowSelectChange(arr);
	}
	
	get rowSelection()
	{
		let {checkboxFlag} = this.props,
			{selectedRowKeys = []} = this.state;
		
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
		
		return (
			<div className={classNames(this.props.className, {"tableAndTurnpage": true})}>
				<ATable className="recordTable" rowSelection={this.rowSelection} scroll={{x: this.scrollX || false}}
				        rowKey={rowKey} pagination={pagination} dataSource={data} columns={this.columns}
				        onRowClick={this.onRow.bind(this)}/>
			</div>
		)
	}
}

export default Table
