import React from "react";
import { Button, Input } from 'antd';
import './style/searchListComp.less'
import './style/bindonaccount.less'
import OnAccountchild from "./OnAccountchild"
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { getBindOnAccoutList, deleteBindOnAccout, putBindOnAccout, updateProgress } from "../redux/reducers/bindOnAccoutReducer"
import NTTableWithPage from "../../../components/NTTableWithPage"
import { getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import {bglen} from "../../../utils/StringUtils";
import {getTableTdContent} from "../../../utils/ComponentUtils";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

class BindOnAccount extends React.Component {
	constructor(props)
	{
		super(props);
		
		this.state = {
			Searval: "",
			currentPage: 1,
			ModalShow: false,
			Visible: false,
			tableWidth:0
		}
	}
	
	componentDidMount()
	{
		this.getBingingList();
		this.setState({
			tableWidth:(this.refs.bindOnAccount&&this.refs.bindOnAccount.clientWidth)?this.refs.bindOnAccount.clientWidth:0
		});
	}
	
	/**
	 * 获取账户绑定数据列表
	 * page 代表页码,未传参数则读取currentPage,例如点击搜索时,currentPage需重置为1
	 */
	getBingingList(page)
	{
		let {actions} = this.props,
			{currentPage, Searval} = this.state;
		
		if(page)
		{
			currentPage = page;
			this.setState({currentPage});
		}
		
		actions.getBindOnAccoutList(Searval, currentPage);
	}

 
	
	getData()
	{
		return [
			{
				key: 'extensionNumber',
				dataIndex: 'extensionNumber',
				title: '分机号',
				width:100
			}, {
				key: 'attendantAccount',
				dataIndex: 'attendantAccount',
				title: '员工号',
				width: 80
			}, {
				key: 'userName',
				dataIndex: 'userName',
				title: '账户名',
				width: 115,
				render:(text, data)=>{
					let {tableWidth} = this.state;
					return getTableTdContent(data.userName, 100/1100.0*tableWidth);
				}
			}, {
				key: 'nickName',
				dataIndex: 'nickName',
				title: '内部名',
				width: 115,
				render:(text, data)=>{
					let {tableWidth} = this.state;
					return getTableTdContent(data.nickName, 100/1100.0*tableWidth);
				}
			}, {
				key: 'externalName',
				dataIndex: 'externalName',
				title: '外部名',
				width: 115,
				render:(text, data)=>{
					let {tableWidth} = this.state;
					return getTableTdContent(data.externalName, 100/1100.0*tableWidth);
				}
			}, {
				key: 'roleName',
				dataIndex: 'roleName',
				title: '角色',
				width: 90,
				render:(text, data)=>{
					let {tableWidth} = this.state;
					return getTableTdContent(data.roleName, 75/1100.0*tableWidth);
				}
			}, {
				key: 'groupName',
				dataIndex: 'groupName',
				title: '所在行政组',
				width: 115,
				render:(text, data)=>{
					let {tableWidth} = this.state;
					return getTableTdContent(data.groupName, 100/1100.0*tableWidth);
				}
			}, {
				key: 'operation',
				dataIndex: 'operation',
				title: '操作',
				width:70,
				render: (text, data) => (
					<div>
						{parseInt(data.enabled) ?
							<a className="operation_btn"
							   onClick={this.OnaccountSolution.bind(this, data.extensionNumber)}>解绑</a>
							: <a className="operation_btn"
							     onClick={this.OnaccountTieup.bind(this, data.extensionNumber)}>绑定</a>
						}
					</div>
				)
			}]
	}
	
	/*Search_val*/
	OnaccountSearch_val(event)
	{
		if (bglen(event.target.value.length) > 50) {
			return;
		}
		this.setState({
			Searval: event.target.value
		})
	}
	
	/*Searchval_reset 重置btn */
	OnaccountSearchval_reset()
	{
		this.setState({
			Searval: "",
			currentPage: 1
		});
		this.props.actions.getBindOnAccoutList("", 1);
	}
	
	/*Search fn */
	OnaccountSearch()
	{
		this.getBingingList(1);
	}
	
	/*Put fn */
	OnaccountPut()
	{
		this.ModalHandler();
	}
	
	/* 解绑 */
	OnaccountSolution(item)
	{
		let {actions} = this.props,
			data = {};
		data.extensionNumber = item;
		confirm({
			title: '提示',
			content: '是否确定解除绑定关系?',
			onOk()
			{
				actions.deleteBindOnAccout(data);
			},
			onCancel()
			{
			},
		});
	}
	
	/*绑定*/
	OnaccountTieup(extensionNumber)
	{
		this.setState({
			extensionNumber: extensionNumber
		})
		this.ModalHandler();
	}
	
	/*打开责任客服*/
	ModalHandler()
	{
		this.setState({
			ModalShow: true,
			Visible: true
		});
	}
	
	/*关闭Modal*/
	ModalClose()
	{
		this.setState({
			ModalShow: false,
			Visible: false
		});
	}
	
	handleOk(userid)
	{
		this.setState({
			ModalShow: false,
			Visible: false
		});
		this.props.actions.putBindOnAccout(this.state.extensionNumber, userid);
	}
	
	//点击页码跳转动作
	onCurrentPage(value)
	{
		this.getBingingList(value);
	}
	
	reFreshFn()
	{
		this.getBingingList();
	}
	
	//错误提示弹框
	errorTip(msg)
	{
		error({
			title: '提示',
			content: msg,
			okText: '确定'
		});
		this.props.actions.updateProgress();
	}
	
	render()
	{
		let {page, totalPage, list} = this.props.dataList;
		
		let {progress, msg} = this.props;
		
		if(progress === LoadProgressConst.LOAD_FAILED)  //加载失败
		{
			return <ReFresh reFreshStyle={{left: 0, top: 0}} reFreshFn={this.reFreshFn.bind(this)}/>;
		}
		
		return <div className="bindonaccount">
			<div className="bindonSearch searchBox search">
				<Input value={this.state.Searval} maxlength={50} onChange={this.OnaccountSearch_val.bind(this)} onPressEnter={this.OnaccountSearch.bind(this)} placeholder="请输入账号名\内部名" className="searchIpt" style={{paddingRight:35}}/>
				<Button className="searchBtn" type="primary" onClick={this.OnaccountSearch.bind(this)} icon="search"></Button>
			</div>
			
			<div ref="bindOnAccount"><NTTableWithPage pageShow="true" columns={this.getData()} dataSource={list} selectOnChange={this.onCurrentPage.bind(this)} total={totalPage} currentPage={page}/></div>
			<div>
				<OnAccountchild
					Modalshow={this.state.ModalShow}
					Visible={this.state.Visible}
					handleCancel={this.ModalClose.bind(this)}
					handleOk={this.handleOk.bind(this)}
					extensionNumber={this.state.extensionNumber}
				/>
			</div>
			{
				getProgressComp(progress)
			}
			{
				progress == LoadProgressConst.SAVING_FAILED ? this.errorTip(msg) : ""
			}
		</div>
	}
}

const mapStateToProps = (state) => {
	let {bindOnAccoutReducer} = state;
	
	return {
		dataList: bindOnAccoutReducer.get("binDingList") || {},
		progress: bindOnAccoutReducer.get("progress") || "",
		msg: bindOnAccoutReducer.get("msg") || ""
	};
}

const mapDispatchToProps = (dispatch) => ({
	actions: bindActionCreators({getBindOnAccoutList, deleteBindOnAccout, putBindOnAccout, updateProgress}, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(BindOnAccount);
