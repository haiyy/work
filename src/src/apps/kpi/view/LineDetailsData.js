import React, { Component } from 'react'
import { Table } from 'antd'
import ScrollArea from 'react-scrollbar'
import { lineDetailsData } from '../redux/lineDetailsReducer'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { getReportId } from './ExportTable'
import { gridData } from './kpiService/gridData'
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
import Loading from './Loading'
import SelectData from './SelectData'
import NoData from './NoData'
import getQuery from './kpiService/getQuery';
import NTModal from "../../../components/NTModal";
import { getLangTxt } from "../../../utils/MyUtil";

//import './scss/reportDetails.scss'

class LineDetailsData extends Component {
	constructor(props)
	{
		super(props);
		this.state = {
			showDetails: true
		}
	}
	
	componentWillMount()
	{
		let query = this.props.query,
			lineData = this.props.lineData,
			nextQry = getQuery(query, this.props.date);
		
		nextQry = nextQry + lineData.split("&&")[1];
		this.props.lineDetailsData({name: lineData.split("&&")[0], qry: nextQry});
	}
	
	handleCancel(e)
	{
		this.props.close();
		this.setState({
			showDetails: false,
		});
	}
	
	_getProgress(progress)
	{
		if(progress === LoadProgressConst.LOADING)
		{
			return (
				<Loading position="absolute"/>
			)
		}
	}
	
	_returnTable(columns, rows)
	{
		const pagination = {
			total: rows.length, //数据总条数
			pageSize: 10,
			showQuickJumper: true,
			showTotal: (total) => {
				return getLangTxt("total", total);
			}
		};
		if(columns && columns.length < 10)
		{
			columns.length && delete columns[0].fixed
		}
		let scrollX = columns && columns.length >= 10 ? columns.length * 100 : 0;
		return <Table columns={columns} dataSource={rows} pagination={pagination} scroll={{x: scrollX, y: 454}}/>
	}
	
	render()
	{
		let showDetails = this.state.showDetails,
			progress = this.props.progress,
			lineDetails = this.props.lineDetails;
		
		return (
			<NTModal title={getLangTxt("kpi_detail")} footer="" width="925px" wrapClassName="datailes" visible={showDetails}
			         onCancel={this.handleCancel.bind(this)}>
				{this._getProgress(progress)}
				{
					lineDetails && lineDetails.hasOwnProperty('columns') ?
						this._returnTable(lineDetails.columns, lineDetails.rows) : <NoData height="99%"/>
				}
			</NTModal>
		)
	}
}

function mapStateToProps(state)
{
	return {
		lineDetails: state.lineDetails.data,
		progress: state.lineDetails.progress
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({lineDetailsData}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LineDetailsData);






