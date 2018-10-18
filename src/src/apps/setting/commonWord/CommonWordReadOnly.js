import React from 'react';
import { bindActionCreators } from 'redux';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { Button, Table, Tree, Input, Form, Popover, Tooltip } from 'antd';
import TreeNode from "../../../components/antd2/tree/TreeNode";
import {
	getAllTipsData, getSearchTipsData, getTipsGroup,
	getTipsData
} from './action/commonWord';
import './style/usualContent.scss';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { downloadByATag, getLangTxt } from '../../../utils/MyUtil';
import { bglen, truncateToPop } from "../../../utils/StringUtils";
import {getProgressComp} from "../../../utils/MyUtil";

const FormItem = Form.Item;

class CommonWordReadOnly extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			display: true,
			searching: false,
			selectGroupInfo: null,
			selectingKey: [],
			currentPage: 1,
			getAllTips: false
		};
	}
	
	//页面渲染完成请求分组信息数据
	componentDidMount()
	{
		this.props.getTipsGroup();
		let obj = {
			page: this.state.currentPage,
			rp: 10
		};
		this.props.getAllTipsData(obj);
		this.setState({currentPage: 1, getAllTips: true});
	}
	
	//点击确认后关闭弹框
	changeNewGroup()
	{
		this.setState({newGroup: false});
	}
	
	//点击获取分组下常用话术条目
	onSelect(selectedKeys, info)
	{
		let obj = {
			groupId: info.node.props.gid
		}, data = [];
		data.push(info.node.props.gid);
		let {dataList = []} = this.props;
		dataList && dataList.map((item) => {
			if(item.groupId == obj.groupId)
			{
				this.setState({selectGroupInfo: item})
			}
		});
		
		this.props.getTipsData(obj);
		this.setState({searching: false, getAllTips: false, selectingKey: data, currentPage: 1});
	}
	
	//点击收起或展开分组展示区
	changeClick()
	{
		this.setState({
			display: !this.state.display
		})
	}
	
	getContainerWidth()
	{
		if(!getComputedStyle(window.document.documentElement)['font-size'])
			return;
		
		let htmlFontSizepx = getComputedStyle(window.document.documentElement)['font-size'],
			htmlFontSize = htmlFontSizepx.substring(0, htmlFontSizepx.length - 2),
			maxWidth = 1.95 * htmlFontSize;
		
		return maxWidth - 94;
	}
	
	//创建常用话术组树
	_createTreeNodes(states)
	{
		if(states) return states.map(item => {
			let boxWidth = this.getContainerWidth(),
				contentInfo = truncateToPop(item.groupName, boxWidth) || {};
			
			return (
				<TreeNode key={item.groupId} gid={item.groupId} title={
					<div className="clearFix">
						{
							contentInfo.show ?
								<Popover content={<div style={{
									maxWidth: "1.4rem", height: "auto", wordBreak: "break-word"
								}}>{item.groupName}</div>} placement="topLeft">
									<div className="tipsGroupStyle">{item.groupName}</div>
								</Popover>
								:
								<div className="tipsGroupStyle">{item.groupName}</div>
						}
						<span className="tipsGroupItemOperate">
                            <Tooltip placement="bottom" title={getLangTxt("edit")}>
                                <i className="icon-bianji iconfont"/>
                            </Tooltip>
                            <Tooltip placement="bottom" title={getLangTxt("del")}>
                                <i className="icon-shanchu iconfont"/>
                            </Tooltip>
                        </span>
					</div>}>
				</TreeNode>
			);
		});
	}
	
	//分组重新加載
	reFreshFnLeft()
	{
		this.props.getTipsGroup();
	}
	
	//条目重新加载
	reFreshFnRight()
	{
		let obj = {
			page: this.state.currentPage,
			rp: 10
		};
		
		this.props.getAllTipsData(obj);
		this.setState({selectingKey: []});
	}
	
	downLoadFile(url, fileName)
	{
		if(url.indexOf("?") > -1 && fileName)
		{
			url += "&downLoadFileName=" + fileName;
		}
		
		downloadByATag(url, fileName);
	}
	
	getColumn()
	{
		return [{
			key: 'rank',
			dataIndex: 'index',
			width: '6%',
			render: (record) => {
				let {currentPage, getAllTips} = this.state,
					rankNum,
					calcCurrent = (currentPage - 1) * 10;
				
				if(!getAllTips)
				{
					calcCurrent = 0;
				}
				calcCurrent === 0 ? rankNum = record : rankNum = calcCurrent + record;
				return (
					<div style={{textAlign: "center"}}>{rankNum}</div>
				)
			}
		}, {
			key: 'title',
			title: getLangTxt("title"),
			dataIndex: 'title',
			width: '30%',
			render: (record) => {
				let typeEle = document.querySelector(".tipTitleStyle"),
					titleWidth = typeEle && typeEle.clientWidth,
					titleInfo = truncateToPop(record, titleWidth) || {};
				
				return (
					titleInfo.show ?
						<Popover content={<div
							style={{width: titleWidth + "px", height: "auto", wordBreak: "break-word"}}>{record}</div>}
						         placement="topLeft">
							<div className="tipTitleStyle">{titleInfo.content}</div>
						</Popover>
						:
						<div className="tipTitleStyle">{record}</div>
				)
			}
		}, {
			key: 'response',
			title: getLangTxt("content"),
			dataIndex: 'response',
			width: '51%',
			render: (record) => {
				return (
					<div>
						{
							record && record.notText ?
								<div>
									{
										record.imgUrl ?
											<div className="tipsImgBox"
											     onClick={this.downLoadFile.bind(this, record.imgUrl, record.imgName)}>
												<img className="imgStyle" src={record.imgUrl} alt={record.imgName}/>
												{
													bglen(record.imgName) > 46 ?
														<Popover
															content={<div
																style={{width: '300px'}}>{record.imgName}</div>}
															placement="topLeft"
														>
															<a className="imgNameStyle">{record.imgName}</a>
														</Popover>
														:
														<a className="imgNameStyle">{record.imgName}</a>
												}
											</div>
											:
											bglen(record.fileName) >= 30 ?
												<Popover
													content={<div style={{
														width: "300px", height: "auto", wordWrap: "break-word"
													}}>{record.fileName}</div>}
													placement="topLeft">
													<div className="fileStyle"
													     onClick={this.downLoadFile.bind(this, record.fileUrl, record.fileName)}>
														<a>{record.fileName}</a>
													</div>
												</Popover>
												:
												<div className="fileStyle"
												     onClick={this.downLoadFile.bind(this, record.fileUrl, record.fileName)}>
													<a>{record.fileName}</a>
												</div>
										
									}
								</div>
								:
								bglen(record) >= 52 ?
									<Popover
										content={<div style={{
											width: "300px", height: "auto", wordWrap: "break-word"
										}}>{record}</div>} placement="topLeft">
										<div className="textStyle">{record}</div>
									</Popover>
									:
									<div className="textStyle">{record}</div>
						}
					</div>
				)
			}
		}, {
			key: 'remove',
			title: getLangTxt("operation"),
			width: '13%',
			render: (record) => {
				return (
					<div className="tipOperateBox">
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
	
	//选中常用话术项
	onSelectChange(selectedRowKeys, selectedRows)
	{
		let rangeRows = [];
		selectedRows.forEach(item => {
			rangeRows.push(item.itemId)
		});
		this.setState({
			selectedRowKeys,
			rangeRows
		});
	}
	
	render()
	{
		let {dataList = [], tableData = [], progress = {}, groupProgress = {}, allTipsCount = 0} = this.props,
			initialSelectGroup = dataList[0],
			{selectedRowKeys = [], getAllTips, searching} = this.state;
		
		const {getFieldDecorator} = this.props.form,
			pagination = {
				total: allTipsCount || tableData.length,
				showQuickJumper: true,
				current: this.state.currentPage,
				showTotal: (total) => {
					return getLangTxt("total", total);
				},
				onChange: (pageData) => {
					if(!this.state.selectGroupInfo && !this.state.searching)
					{
						let obj = {
							page: pageData,
							rp: 10
						};
						if(this.state.getAllTips)
						{
							this.props.getAllTipsData(obj);
						}
						
					}
					else if(this.state.searching)
					{
						let searchVal = this.props.form.getFieldValue("search");
						let obj = {
							keyWord: searchVal,
							page: pageData,
							rp: 10
						};
						this.props.getSearchTipsData(obj);
					}
					this.setState({currentPage: pageData})
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
			<div className='usualTipsContent'>
				
				<div className='usualTipsLeft' style={this.state.display ? {width: '1.95rem'} : {width: '0.05rem'}}>
					{
						groupProgress.left === LoadProgressConst.LOAD_FAILED ?
							<ReFresh reFreshFn={this.reFreshFnLeft.bind(this)}/>
							:
							this.state.display ?
								<div className="tipsLFcontent">
									<div className='tipsTypeHeader'>
										<div className="typeHeaderTitle">{getLangTxt("setting_add_common_word")}</div>
										<div className='tipsGroupOperate'>
											<Tooltip placement="bottom" title={getLangTxt("move_up")}>
												<i className="iconfont icon-shangyi rangeIconUp"/>
											</Tooltip>
											<Tooltip placement="bottom" title={getLangTxt("move_down")}>
												<i className="iconfont icon-xiayi rangeIconDown"/>
											</Tooltip>
											<Tooltip placement="bottom" title={getLangTxt("add_group")}>
												<i className=" iconfont icon-tianjia1"/>
											</Tooltip>
										</div>
									</div>
									<ScrollArea
										speed={1}
										horizontal={false}
										className="tipsGroupScrollArea">
										<Tree
											selectedKeys={this.state.selectingKey}
											onSelect={this.onSelect.bind(this)}
											checkable
											/*draggable
											onDragEnter={this.onDragEnter.bind(this)}
											onDrop={this.onDrop.bind(this)}*/
										>
											{this._createTreeNodes(dataList)}
										</Tree>
									</ScrollArea>
									
									<img src={require("./image/groupClose.png")} className="usualTipsTypeClose"
									     onClick={this.changeClick.bind(this)}/>
								</div>
								:
								<img src={require("./image/groupOpen.png")}
								     className="usualTipsTypeClose usualTipsTypeOpen"
								     onClick={this.changeClick.bind(this)}/>
					}
					{
						this.state.display ?
                            getProgressComp(groupProgress && groupProgress.left)
							:
							null
					}
				</div>
				
				<div className='usualTipsRight'
				     style={this.state.display ? {padding: '0.05rem 0 0 1.97rem'} : {padding: '0.05rem 0 0 0.07rem'}}>
					
					{
						progress.right === LoadProgressConst.LOAD_FAILED ?
							<ReFresh reFreshFn={this.reFreshFnRight.bind(this)}
							         reFreshStyle={this.state.display ? {
								         width: "calc(100% - 1.97rem)", zIndex: "0"
							         } : {width: "calc(100% - 0.2rem)", zIndex: "0"}}/>
							:
							<div className="tipsBox">
								<div className="tipsOperateBox clearFix">
									<div className="newTips">
										<Button disabled type="primary">{getLangTxt("setting_add_word")}</Button>
										<Button disabled type="primary">{getLangTxt("down_templete")}</Button>
										<Button disabled type="primary">{getLangTxt("import")}</Button>
										<Button disabled type="primary">{getLangTxt("export")}</Button>
										{
											getAllTips || searching ?
												null
												:
												<span>
                                                <Tooltip placement="bottom" title={getLangTxt("move_up")}>
                                                    <Button type="primary">
                                                        <i className="iconfont icon-shangyi rangeBtn"/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip placement="bottom" title={getLangTxt("move_down")}>
                                                    <Button type="primary">
                                                        <i className="iconfont icon-xiayi rangeBtn"/>
                                                    </Button>
                                                </Tooltip>
                                            </span>
										}
									</div>
									<div className="contentOpera">
										<div className="searchBox">
											<Form>
												<FormItem>
													{getFieldDecorator('search')(
														<Input disabled className="searchIpt"/>
													)}
												</FormItem>
											</Form>
											<Button disabled className="searchBtn" type="primary"
											        icon="search"></Button>
										</div>
									</div>
								</div>
								
								<div className="tableContainer">
									<ScrollArea
										speed={1}
										horizontal={false}
										className="tableScrollArea">
										{
											getAllTips || searching ?
												<Table dataSource={tableData} columns={this.getColumn()}
												       pagination={pagination}/>
												:
												<Table dataSource={tableData} columns={this.getColumn()}
												       pagination={pagination} rowSelection={rowSelection}/>
										}
									</ScrollArea>
									{
                                        getProgressComp(progress && progress.right)
									}
								</div>
							</div>
					}
				</div>
			</div>
		)
	}
}

CommonWordReadOnly = Form.create()(CommonWordReadOnly);

function mapStateToProps(state)
{
	return {
		dataList: state.getTipsGroup.data,
		importTips: state.getTipsGroup.importTips,
		groupProgress: state.getTipsGroup.groupProgress,
		errorMsg: state.getTipsGroup.errorMsg,
		tableData: state.getTips.data,
		allTipsCount: state.getTips.tipsCount,
		progress: state.getTips.progress,
		tipsErrorMsg: state.getTips.errorMsg
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getAllTipsData, getSearchTipsData, getTipsGroup,
		getTipsData
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CommonWordReadOnly);

