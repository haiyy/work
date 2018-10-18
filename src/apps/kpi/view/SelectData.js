import React, { PropTypes } from 'react'
import { Button, Table, Input, Checkbox, Row, Col, Tree, Alert } from 'antd'
import { getAllColumns, getSelectColumns, setSelectColumns } from '../redux/selectColumnsReducer'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ScrollArea from 'react-scrollbar'
import LoadProgressConst from "../../../model/vo/LoadProgressConst"
//import Loading from './Loading'
import Loading from "../../../components/xn/loading/Loading"
import Modal from "../../../components/xn/modal/Modal";
import TreeNode from "../../../components/antd2/tree/TreeNode";
import { getLangTxt } from "../../../utils/MyUtil";

let nexRows = [], nexTreeNode = [];
const Search = Input.Search;

class SelectData extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {
			selectedRowKeys: [],
			selectRows: [],
			selectTreeNode: [],
			indeterminate: true,
			warning: 0,
			checkAll: false,
			expandedKeys: [],
			searchValue: '',
			autoExpandParent: true,
		};
		this.name = this.props.name;
		this.allSelectTreeNode = [];
		this.checkedKeys = [];
	}

	componentWillReceiveProps(nextProps)
	{
		let tableRows = nextProps.selectColumns && nextProps.selectColumns[this.name] ? nextProps.selectColumns[this.name] : [],
			selectTreeNode = [];

		for(let i in tableRows)
		{
			selectTreeNode.push(tableRows[i].title);
		}
		this.setState({
			selectRows: tableRows,
			selectTreeNode: selectTreeNode
		});
	}

	componentDidMount()
	{
		let name = this.props.name;
		if(!this.props.allColumns || !this.props.allColumns[this.name])
		{
			this.props.getAllColumns(name);
		}
		this.props.getSelectColumns(name);
	}

	//右侧行选择
	onSelectChange(selectedRowKeys, selectedRows)
	{

		this.setState({selectedRowKeys});
	}

	//右侧表格批量删除显示列
	_batchDeletion()
	{
		let selectedRowKeys = this.state.selectedRowKeys.sort(),
			data = this.state.selectRows;
		nexTreeNode = this.state.selectTreeNode;

		for(let i = selectedRowKeys.length - 1; i >= 0; i--)
		{
			nexTreeNode.splice(selectedRowKeys[i], 1);
			data.splice(selectedRowKeys[i], 1);
		}
		this.onCheck(nexTreeNode);
		this.setState({
			selectedRowKeys: [],
			indeterminate: !!data.length && (data.length < this.allSelectTreeNode.length),
			checkAll: data.length === this.allSelectTreeNode.length,
			selectRows: data

		})
	}

	//删除右侧表格某一列
	_deleteRows(index)
	{
		let data = this.state.selectRows,
			rowKey = this.state.selectedRowKeys.sort();

		for(let i = rowKey.length - 1; i >= 0; i--)
		{
			if(rowKey[i] > index)
			{
				rowKey[i]--;
			}
			else if(rowKey[i] == index)
			{
				rowKey.splice(i, 1)
			}
		}
		nexTreeNode = this.state.selectTreeNode;
		nexTreeNode.splice(index, 1);
		data.splice(index, 1);
		this.onCheck(nexTreeNode);
		this.setState({
			selectRows: data,
			indeterminate: !!data.length && (data.length < this.allSelectTreeNode.length),
			checkAll: data.length === this.allSelectTreeNode.length
		})
	}

	//选择显示列
	onCheck(checkedKeys, info)
	{
		let selectRows = this.state.selectRows,
			title, data = [];

		for(let j = 0; j < selectRows.length; j++)
		{
			data.push(selectRows[j].title);
			//if(selectRows[i].title == )
		}

		if(info != undefined)
		{
			if(info.node.props.hasOwnProperty('children'))
			{
				let node = info.node.props.children;
				for(let i in node)
				{
					title = node[i].key;

					if(info.checked)
					{
						if(!data.includes(title))
						{
							data.push(title);
						}
					}
					else
					{
						let index = data.indexOf(title);
						data.splice(index, 1);
					}
				}
			}
			else
			{
				title = info.node.props.eventKey;
				if(info.checked)
				{
					data.push(title);
				}
				else
				{
					let index = data.indexOf(title);
					data.splice(index, 1);
				}
			}
		}
		else
		{
			data = checkedKeys;
		}

		nexRows = [];
		nexTreeNode = [];
		let allColumns = this.props.allColumns[this.name];
		//let data = checkedKeys;
		for(let i = 0; i < data.length; i++)
		{
			getData(allColumns, data[i]);
		}
		this.checkedKeys = checkedKeys;
		this.setState({
			selectRows: nexRows,
			indeterminate: !!nexRows.length && (nexRows.length < this.allSelectTreeNode.length),
			checkAll: nexRows.length === this.allSelectTreeNode.length,
			selectTreeNode: nexTreeNode
		})
	}

	//上移
	_moveUp()
	{
		let selectedRowKeys = this.state.selectedRowKeys,
			selectRows = this.state.selectRows,
			key = selectedRowKeys[0];
		if(selectedRowKeys.length == 1 && key != 0)
		{
			let data = selectRows[key];
			selectRows[key] = selectRows[key - 1];
			selectRows[key - 1] = data;
			selectedRowKeys[0] = key - 1;
			this.setState({
				selectRows: selectRows,
				selectedRowKeys: selectedRowKeys
			})
		}

	}

	//下移
	_moveDown()
	{
		let selectedRowKeys = this.state.selectedRowKeys,
			selectRows = this.state.selectRows,
			key = selectedRowKeys[0];
		if(selectedRowKeys.length == 1 && key != selectRows.length - 1)
		{
			let data = selectRows[key];
			selectRows[key] = selectRows[key + 1];
			selectRows[key + 1] = data;
			selectedRowKeys[0] = key + 1;
			this.setState({
				selectRows: selectRows,
				selectedRowKeys: selectedRowKeys
			})
		}

	}

	//全选
	checkedAll(e)
	{
		this.setState({
			indeterminate: false,
			checkAll: e.target.checked,
		});
		if(e.target.checked)
		{
			this.onCheck(this.allSelectTreeNode);
		}
		else
		{
			this.setState({
				selectRows: [],
				selectTreeNode: []
			})
		}

	}

	//关闭警告
	_closeWarning(e)
	{
		this.setState({
			warning: 0
		});
	};

	//确定
	handleOk()
	{
		//没有选择时无法关闭弹窗
		if(this.state.selectTreeNode.length == 0)
		{
			this.setState({
				warning: 1
			});
			return;
		}
		let name = this.props.name,
			selectRows = this.state.selectRows;
		this.props.setSelectColumns(name, selectRows)
		.then(result => {
			if(result.success)
			{
				this.props.callBack(true, selectRows);
			}
			else
			{
				this.setState({
					warning: 2
				});
			}
		});
	}

	//取消
	handleCancel(e)
	{
		this.props.callBack(false);
	}

	//改变搜索框
	onChangeInput(data, e)
	{
		const value = e.target.value,
			allColumns = this.props.allColumns && this.props.allColumns[this.name] ? this.props.allColumns[this.name] : [];
		const expandedKeys = data.map((item) => {
			if(item.indexOf(value) > -1)
			{
				return getParentKey(item, allColumns);
			}
			return null;
		})
		.filter((item, i, self) => item && self.indexOf(item) === i);

		this.setState({
			expandedKeys,
			searchValue: value,
			autoExpandParent: true,
		});

	}

	onExpand(expandedKeys)
	{
		this.setState({
			expandedKeys,
			autoExpandParent: false,
		});
	}

	_alertWaring(key)
	{
		switch(key)
		{
			case 0:
				return "";
			case 1:
				return (
					<Alert message={getLangTxt("kpi_note1")} type="warning" closable
					       onClose={this._closeWarning.bind(this)}/>
				);
			case 2:
				return (
					<div style={{position: 'absolute', lineHeight: '53px', color: 'red', bottom: '0', right: '160px'}}>
						<i className="iconfont icon icon-009cuowu" style={{fontSize: '14px', padding: '8px'}}/>
						{getLangTxt("20034")}
					</div>
				);
		}
	}

	_getProgress(allColumns, selectColumns)
	{
		let reportAllColumns = !allColumns || !allColumns[this.name] || allColumns.progress === LoadProgressConst.LOADING,
			reportSelectColumns = !selectColumns || selectColumns.progress === LoadProgressConst.LOADING || selectColumns.progress === LoadProgressConst.SAVING;
		if(reportAllColumns || reportSelectColumns)
		{
			return (
				<Loading position="absolute"/>
			)
		}
	}

	render()
	{
		let allColumns = this.props.allColumns && this.props.allColumns[this.name] ? this.props.allColumns[this.name] : [],
			selectColumns = this.props.selectColumns && this.props.selectColumns[this.name] ? this.props.selectColumns[this.name] : [],
			selectRows = this.state.selectRows,
			allSelectTreeNode = this.allSelectTreeNode = [],
			searchValue = this.state.searchValue;

		if(allColumns.length != 0)
		{
			for(let m = 0; m < allColumns.length; m++)
			{
				if(allColumns[m].hasOwnProperty('metrics') && allColumns[m].metrics.length != 0)
				{
					let selectChildren = allColumns[m].metrics;
					for(let n in selectChildren)
					{
						allSelectTreeNode.push(selectChildren[n].title);
					}
				}

			}
		}
		const columns = [{
			title: '',
			dataIndex: 'title',
			render: (text, record, index) => (
				<div className="tableRows">
					{text}
					<i className="icon iconfont icon-shanchu" onClick={this._deleteRows.bind(this, index)}/>
				</div>
			)
		}];

		const {selectedRowKeys} = this.state;
		const rowSelection = {
			selectedRowKeys,
			onChange: this.onSelectChange.bind(this),
		};

		const hasSelected = selectedRowKeys.length > 0;

		let loop = data => data.map((item) => {
			if(item.metrics)
			{
				let groupName = nodeTitle(item.groupName, searchValue);
				return <TreeNode key={item.groupName} title={groupName}>
					{loop(item.metrics)}
				</TreeNode>;
			}
			let title = nodeTitle(item.title, searchValue);
			return <TreeNode key={item.title} title={title} isLeaf={true}/>;
		});

		return (
			<Modal title={getLangTxt("kpi_select_content")} visible={true}
			         wrapClassName="showDataTitle" onOk={this.handleOk.bind(this)}
			         onCancel={this.handleCancel.bind(this)}
			>
				{
					this._alertWaring(this.state.warning)
				}
				<div style={{overflow: 'hidden'}}>
					<div className="left">
						<div className="top">
							<Row>
								<Col span={18}>
									<Checkbox indeterminate={this.state.indeterminate} checked={this.state.checkAll}
									          onChange={this.checkedAll.bind(this)}>
										{getLangTxt("all_select")}
									</Checkbox>
								</Col>
								<Col span={6}>
									<Search onChange={this.onChangeInput.bind(this, allSelectTreeNode)}/>
								</Col>
							</Row>
						</div>
						<ScrollArea ref="selectTree" speed={0.2} style={{height: 'calc(100% - 34px)'}} smoothScrolling>
							<Tree
								checkable
								checkedKeys={this.state.selectTreeNode}
								expandedKeys={this.state.expandedKeys}
								autoExpandParent={this.state.autoExpandParent}
								onExpand={this.onExpand.bind(this)}
								onCheck={this.onCheck.bind(this)}
							>
								{allColumns.length != 0 ? loop(allColumns) :
									<TreeNode key="0-0-0" title={getLangTxt("noData1")} isLeaf={true}/>}

							</Tree>
						</ScrollArea>
					</div>
					<div className="right">
						<div className="top">
							<Button type="primary" onClick={this._moveDown.bind(this)}>
								<i className="icon iconfont icon-xiala1"/>
							</Button>
							<Button type="ghost" onClick={this._moveUp.bind(this)}>
								<i className="icon iconfont icon-xiala1-xiangshang"/>
							</Button>
							<Button type="ghost" style={{border: "none"}} disabled={!hasSelected}
							        onClick={this._batchDeletion.bind(this)}>
								<i className="icon iconfont icon-shanchu"/>
							</Button>
						</div>
						{selectColumns ?
							<ScrollArea ref="selectTable" speed={0.2} style={{height: 'calc(100% - 35px)'}} smoothScrolling>
								<Table pagination={false} columns={columns} dataSource={selectRows} showHeader={false}
								       rowSelection={rowSelection}/>
							</ScrollArea>
							: null
						}
					</div>
				</div>
				{this._getProgress(this.props.allColumns, this.props.selectColumns)}
			</Modal>
		)
	}
}

function getData(value, name)
{
	if(value.length == 0)
	{
		return;
	}
	for(let i = 0; i < value.length; i++)
	{
		if(value[i].metrics && value[i].metrics.lenght != 0)
		{
			Array.from(value[i].metrics);
			getData(value[i].metrics, name)
		}
		else if(value[i].title == name)
		{

			nexTreeNode.push(name);
			nexRows.push(value[i]);
		}
	}
}

function getParentKey(key, tree)
{
	let parentKey;
	for(let i = 0; i < tree.length; i++)
	{
		const node = tree[i];
		if(node.metrics)
		{
			if(node.metrics.some(item => item.title === key))
			{
				parentKey = node.groupName;
			}
		}
	}
	return parentKey;
}

function nodeTitle(key, searchValue)
{
	const index = key.search(searchValue);
	const beforeStr = key.substr(0, index);
	const afterStr = key.substr(index + searchValue.length);
	const title = index > -1 ? (
		<span>
				{beforeStr}
			<span style={{background: 'yellow'}}>{searchValue}</span>
			{afterStr}
			</span>
	) : <span>{key}</span>;
	return title;
}

function mapStateToProps(state)
{
	return {
		allColumns: state.getAllColumns.data,
		selectColumns: state.selectColumnsReducer.data

	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getAllColumns, getSelectColumns, setSelectColumns}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectData);
