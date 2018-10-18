import React from 'react'
import { Table, Switch, Alert } from 'antd'
import '../../../public/styles/header/queuedList.scss'
import ScrollArea from 'react-scrollbar'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { getQueueList, getSelectedColumns, setSelectedColumns } from "../redux/queueListReducer";
import { List, is, fromJS } from "immutable";
import NTModal from "../../../components/NTModal";
import Nodata from "../../.././public/images/dataNo.png";

class QueuedList extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.columns = [];
		this.allColumns = List();
		this.state = {};
		
		window.queueList = this;
	}
	
	componentWillMount()
	{
		this.height = document.documentElement.clientHeight - 342;
	}
	
	componentDidMount()
	{
		this.props.getSelectedColumns();
		this.props.getQueueList();
	}
	
	//选择显示字段
	showModal()
	{
		this.setState({visible: true});
	}
	
	componentWillReceiveProps(nextProps)
	{
		let {queueColumns} = nextProps;
		
		if(!is(queueColumns, this.props.queueColumns))
		{
			this.columns = [];
			
			this.allColumns = queueColumns;
			
			queueColumns.filter(col => col.get("enable") === 1)
			.map(col =>
			{
				this.columns.push({
					title: col.get("title"),
					dataIndex: col.get("name"),
				});
			});
			
			this.columns.push({
				title: '操作',
				key: 'operation',
				fixed: 'right',
				width: 100,
				//render: (text, record, index) => (
				//	<span className="operating" onClick={this._startConversation.bind(this, record, index)}>
				//      开始会话
				//    </span>
				//),
			});
		}
	}
	
	_closeWarning()
	{
		this.setState({isWarn: false});
	}
	
	_changeChecked(index, item, checked)
	{
		this.allColumns = this.allColumns.setIn([index], item.set("enable", checked ? 1 : 0));
	}
	
	//关闭选择显示字段弹窗
	handleCancel(e)
	{
		this.props.setSelectedColumns(this.columns);
	}
	
	////开始会话
	//_startConversation(record, index)
	//{
	//	//console.log(record, index);
	//}
	
	close()
	{
		this.props.close();
	}
	
	_getQueueColumnsComp()
	{
		let {isOpenColumns, isWarn} = this.state;
		
		if(!isOpenColumns)
			return null;
		
		return (
			<NTModal title="选择字段" wrapClassName="grid-options" visible={this.state.visible} footer={""}
			       style={{top: '225px'}} onCancel={this.handleCancel.bind(this)}>
				{
					isWarn ?
						<Alert message="请最少选择一条显示内容" type="warning" closable
						       onClose={this._closeWarning.bind(this)}/> : ""
				}
				{
					this.allColumns.map((item, index) =>
					{
						return (
							<div className='grid-option-item' key={item.get("name")}>
								<span className="item">{item.get("title")}</span>
								<Switch defaultChecked={item.get("enable") === 1}
								        onChange={this._changeChecked.bind(this, index, item)}/>
							</div>
						);
					})
				}
			</NTModal>
		);
	}
	
	render()
	{
		let queueList = this.props.queueList;
		
		return (
			<div className='grid' ref='quque'>
				<p>
					<span className='grid-list'>排队人数列表</span>
					<span className='grid-word' onClick={this.showModal.bind(this)}>选择字段</span>
				</p>
				<div style={{height: "236px"}}>
					{
						(queueList !== undefined || queueList.length > 0) ?
							<ScrollArea speed={1} className="queued" style={{height: '100%'}} horizontal={false}
							            smoothScrolling>
								<Table dataSource={queueList} columns={this.columns} pagination={false}/>
							</ScrollArea>
							:
							<div style={{paddingTop: "20px", textAlign: "center", color: "#999"}}>
								{/* <i className="icon-011tishi iconfont" style={{fontSize: "15px", lineHeight: "24px"}}/>
								<span> 暂无数据</span> */}
								<img src={Nodata}/>
								<p style={{paddingTop: "20px", textAlign: "center", color: "#999"}}> 暂无数据</p>
							</div>
					}
				</div>
				
				<div style={{
					backgroundColor: "rgba(55, 55, 55, 0.6)", height: this.height, position: "relative", zIndex: "1000"
				}} onClick={this.close.bind(this)}/>
				{
					this._getQueueColumnsComp()
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	let {queueListReducer} = state,
		queueList = queueListReducer.get("queueList") || [],
		//queueColumns = queueListReducer.get("queueColumns") || List();
		queueColumns = queueColumns1;
	
	return {queueList, queueColumns};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getQueueList, getSelectedColumns, setSelectedColumns}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(QueuedList);

var queueColumns1 = fromJS([
	{
		"name": "business",
		"title": "商户",
		"enabled": 1
	},
	{
		"name": "cs_group",
		"columnType": "dms",
		"id": 0,
		"fieldName": "cs_group",
		"title": "接待组",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "vs",
		"columnType": "dms",
		"id": 0,
		"fieldName": "vs",
		"title": "访客",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "vs_id",
		"columnType": "dms",
		"id": 0,
		"fieldName": "vs_id",
		"title": "访客id",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "vs_group",
		"columnType": "dms",
		"id": 0,
		"fieldName": "vs_group",
		"title": "访客用户群",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "vs_level",
		"columnType": "dms",
		"id": 0,
		"fieldName": "vs_level",
		"title": "访客等级",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "device",
		"columnType": "dms",
		"id": 0,
		"fieldName": "device",
		"title": "终端",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "search_from",
		"columnType": "dms",
		"id": 0,
		"fieldName": "search_from",
		"title": "来源渠道",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "search_key",
		"columnType": "dms",
		"id": 0,
		"fieldName": "search_key",
		"title": "关键词",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "ip",
		"columnType": "dms",
		"id": 0,
		"fieldName": "ip",
		"title": "IP",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "region1",
		"columnType": "dms",
		"id": 0,
		"fieldName": "region1",
		"title": "地域国家",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "region2",
		"columnType": "dms",
		"id": 0,
		"fieldName": "region2",
		"title": "地域省份",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "region3",
		"columnType": "dms",
		"id": 0,
		"fieldName": "region3",
		"title": "地域市县",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "landing_page",
		"columnType": "dms",
		"id": 0,
		"fieldName": "landing_page",
		"title": "着陆页",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "referer",
		"columnType": "dms",
		"id": 0,
		"fieldName": "referer",
		"title": "来源页",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "consult_launch_page",
		"columnType": "dms",
		"id": 0,
		"fieldName": "consult_launch_page",
		"title": "咨询发起页",
		"dataType": "String",
		"enabled": 1
	},
	{
		"name": "queue_enter_time",
		"columnType": "dms",
		"id": 0,
		"fieldName": "queue_enter_time",
		"title": "进入排队时间",
		"dataType": "Long",
		"enabled": 1
	}
]);
