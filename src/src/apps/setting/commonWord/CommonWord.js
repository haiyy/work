import React from 'react';
import { bindActionCreators } from 'redux';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { Button, Table, Modal, Tree, Input, Form, Upload, Popover, Tooltip } from 'antd';
import TreeNode from "../../../components/antd2/tree/TreeNode";
import {
	getAllTipsData, getSearchTipsData, getTipsGroup, newTipsGroup, editTipsGroup, removeTipsGroup,
	getTipsData, newTips, editorTips, removeTips, importCommonWord, editTipsGroupRank, editorTipsRank
} from './action/commonWord';
import NewTips from './NewTips';
import NewTipsGroup from './NewTipsGroup';
import './style/usualContent.scss';
import { getLangTxt, UPLOAD_FILE_ACTION } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { loginUserProxy, downloadByATag, upOrDown } from '../../../utils/MyUtil';
import Settings from '../../../utils/Settings';
import { bglen, truncateToPop } from "../../../utils/StringUtils";
import NTModal from "../../../components/NTModal";
import {getProgressComp} from "../../../utils/MyUtil";

const confirm = Modal.confirm, FormItem = Form.Item;
class CommonWorld extends React.PureComponent {
	static NEW_TIP = 1;
	static EDIT_TIP = 2;
	static NEW_GROUP = 1;
	static EDIT_GROUP = 2;

	constructor(props)
	{
		super(props);

		this.state = {
			display: true,
			newTip: false,
			newGroup: false,
			newGroupName: null,
			newTipName: null,
			editorData: null,
			isEdit: false,
			searching: false,
			selectGroupInfo: null,
			selectingKey: [],
			currentPage: 1,
			importVisible: false,
			getAllTips: false,
			checkedKeys: []
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

	//弹出新建常用话术
	showTip()
	{
		this.setState({
			newTip: true, newTipName: CommonWorld.NEW_TIP, isEdit: false
		});
	}

	//判断是否修改
	judgeEdit(msg)
	{
		this.setState({isEdit: msg})
	}

	//弹出编辑常用话术
	editorTip(record)
	{
		this.setState({newTip: true, newTipName: CommonWorld.EDIT_TIP, editorData: record, isEdit: true});
	}

	//点击确认或取消后关闭弹框
	changeNewTip()
	{
		this.setState({newTip: false});
	}

	//删除常用话术
	removeTip(record)
	{
		if(record)
		{
			let obj = {
				groupId: record.groupId,
				itemId: record.itemId
			};
			confirm({
				title: getLangTxt("del_tip"),
				width: '320px',
				iconType: 'exclamation-circle',
				className: 'warnTip',
				content: getLangTxt("del_content"),
				onOk: () => {
					let {tableData, allTipsCount = 0} = this.props,
						{currentPage, getAllTips} = this.state,
						isUpdate = getAllTips && currentPage < allTipsCount / 10;

					this.props.removeTips(obj, isUpdate, currentPage);
					if(getAllTips && tableData.length === 1)
					{
						currentPage = currentPage > 1 ? currentPage - 1 : currentPage;
						let obj = {page: currentPage, rp: 10};
						this.props.getAllTipsData(obj);

						this.setState({currentPage});
					}
				}
			});
		}
	}

	//弹出新建分组
	showType()
	{
		this.setState({newGroup: true, newGroupName: CommonWorld.NEW_GROUP});
	}

	//弹出编辑分组
	editorType(item, event)
	{
		event.stopPropagation();

		this.setState({newGroup: true, newGroupName: CommonWorld.EDIT_GROUP, editorData: item});
	}

	//点击确认后关闭弹框
	changeNewGroup()
	{
		this.setState({newGroup: false});
	}

	//删除常用话术分组
	removeType(item, e)
	{
		e.stopPropagation();
		let obj = {groupId: item.groupId},
			data = {page: 1, rp: 10},
			{selectingKey = []} = this.state;
		this.props.getTipsData(obj);
		if(item.groupId === selectingKey[0])
		{
			this.setState({
				selectingKey: []
			})
		}
		confirm({
			title: getLangTxt("del_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'warnTip',
			content: getLangTxt("del_content"),
			onOk: () => {
				this.props.removeTipsGroup(obj);
				this.props.getAllTipsData(data);
				this.setState({selectGroupInfo: null, getAllTips: true, currentPage: 1})
			},
			onCancel: () => {

			}
		});
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

	//常用话术组checked 点击顺序不同会影响排序结果 需将checkedKeys排序后进行排序
	onCheckGroup = (checkedKeys, info) => {
		let rangeCheckedKeys = [],
			{checkedNodes = []} = info;
		checkedNodes.forEach(item => {
			rangeCheckedKeys.push(item.key);
		});

		this.setState({
			checkedKeys: rangeCheckedKeys
		});
	};

	//常用话术组排序 @param type: -1向上 || 1向下;  1、type从1改为2 选中数组不变  此时需要将数组reverse回来
	rangeTipsGroup(type)
	{
		let {dataList = []} = this.props,
			{checkedKeys = []} = this.state,
			copyCheckedKeys = [...checkedKeys],
			rangeArray = upOrDown(dataList, copyCheckedKeys, "groupId", type);

		if(checkedKeys.length < 1)
			return;

		if(rangeArray && rangeArray.length > 0)
			this.props.editTipsGroupRank(rangeArray);

		this.setState({
			rangeChanged: !this.state.rangeChanged
		});
	}

	//点击获取分组下常用话术条目
	onNewTipsSelectGroup(groupId)
	{
		let obj = {
			groupId: groupId
		}, data = [];
		data.push(groupId);
		this.props.getTipsData(obj);
		this.setState({searching: false, getAllTips: false, selectingKey: data, currentPage: 1, selectGroupInfo: obj})
	}

	//点击收起或展开分组展示区
	changeClick()
	{
		this.setState({
			display: !this.state.display
		})
	}

	//搜索常用话术
	onSearch()
	{
		let searchVal = this.props.form.getFieldValue("search");
		if(searchVal)
		{
			let obj = {
				keyWord: searchVal,
				page: 1,
				rp: 10
			};
			if(searchVal)
			{
				this.props.getSearchTipsData(obj);
			}
			else
			{
				let {selectGroupInfo} = this.state;
				let obj;
				if(selectGroupInfo)
				{
					obj = {groupId: selectGroupInfo.groupId};
					this.props.getTipsData(obj);
				}
				else
				{
					obj = {page: this.state.currentPage, rp: 10};
					this.props.getAllTipsData(obj);
				}
			}
			this.setState({searching: true, getAllTips: true, currentPage: 1, selectingKey: [], selectGroupInfo: null});
		}
		else
		{
			let obj = {
				page: 1,
				rp: 10
			};
			this.props.getAllTipsData(obj);
			this.setState({
				searching: false, getAllTips: true, currentPage: 1, selectingKey: [], selectGroupInfo: null
			});
		}
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
                                <i className="icon-bianji iconfont" onClick={this.editorType.bind(this, item)}/>
                            </Tooltip>
                            <Tooltip placement="bottom" title={getLangTxt("del")}>
                                <i className="icon-shanchu iconfont" onClick={this.removeType.bind(this, item)}/>
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

	//下载模板
	downLoadModal()
	{

		let {siteId} = loginUserProxy(),
			downLoadUrl = Settings.querySettingUrl("/exportExcel/fastResponse?siteid=", siteId, "&sample=sample");

		downloadByATag(downLoadUrl);

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

	//导入常用话术
	onSelectFile(info)
	{

		let type = UPLOAD_FILE_ACTION, {file, fileList} = info;
		if(!file)
		{
			Modal.error({
				title: getLangTxt("import_tip"),
				iconType: 'exclamation-circle',
				className: 'errorTip',
				width: '320px',
				okText: getLangTxt("sure"),
				content: <div>{getLangTxt("import_content")}</div>
			});
			return;
		}

		let {originFileObj, size} = file;
		fileList = fileList.slice(-1);

		if(info.event)
		{
			this.props.importCommonWord(originFileObj)
			.then(res => {
				if(!res.success && res.result.code != 400)
				{
					let {result: {msg = ""}} = res,
						msgObject = JSON.parse(msg),
						{groupExist = [], groupFailed = [], itemExist = [], itemFailed = []} = msgObject,
						groupExistString = groupExist.join(","),
						groupFailedString = groupFailed.join(","),
						itemExistString = itemExist.join(","),
						itemFailedString = itemFailed.join(",");

					Modal.info({
						title: getLangTxt("import_tip"),
						width: '320px',
						iconType: 'exclamation-circle',
						className: 'errorTip usedWordErrorModal',
						okText: getLangTxt("sure"),
						content: <div>
							{
								groupExist.length > 0 ? <p className="importErrorMsg" style={{wordBreak: "break-all"}}>
								<span
									style={{fontWeight: "900"}}>{getLangTxt("setting_import_content1")}</span>{groupExistString}
								</p> : null
							}
							{
								groupFailed.length > 0 ? <p className="importErrorMsg" style={{wordBreak: "break-all"}}>
								<span
									style={{fontWeight: "900"}}>{getLangTxt("setting_import_content2")}</span>{groupFailedString}
								</p> : null
							}
							{
								itemExist.length > 0 ? <p className="importErrorMsg" style={{wordBreak: "break-all"}}>
								<span
									style={{fontWeight: "900"}}>{getLangTxt("setting_import_content3")}</span>{itemExistString}
								</p> : null
							}
							{
								itemFailed.length > 0 ? <p className="importErrorMsg" style={{wordBreak: "break-all"}}>
								<span
									style={{fontWeight: "900"}}>{getLangTxt("setting_import_content4")}</span>{itemFailedString}
								</p> : null
							}
						</div>,
						onOk: () => {
							this.props.getTipsGroup();
							let {selectingKey = []} = this.state,
								obj;
							if(selectingKey.length > 0)
							{
								obj = {groupId: selectingKey[0]};
								this.props.getTipsData(obj);
							}
						}
					});
				}
				else if(!res.success && res.result.code == 400)
				{
					Modal.error({
						title: getLangTxt("import_tip"),
						iconType: 'exclamation-circle',
						className: 'errorTip',
						width: '320px',
						okText: getLangTxt("sure"),
						content: <div>{getLangTxt("setting_import_content5")}</div>
					});
				}
				else
				{
					Modal.success({
						title: getLangTxt("import_tip"),
						width: '320px',
						iconType: 'exclamation-circle',
						className: 'commonTip',
						content: <div>{getLangTxt("setting_import_content6")}</div>
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

	//导出列表
	exportTips()
	{
		let {siteId} = loginUserProxy(),
			exportUrl = Settings.querySettingUrl("/exportExcel/fastResponse?siteid=", siteId);

		downloadByATag(exportUrl);
	}

	savingErrorTips(msg, isGroup)
	{
		Modal.warning({
			title: getLangTxt("err_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'errorTip',
			okText: getLangTxt("sure"),
			content: msg
		});
		if(isGroup)
		{
			this.props.getTipsGroup();
		}
		else
		{
			let obj = {groupId: this.state.selectingKey[0]};
			this.props.getTipsData(obj);
		}
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
							<i className="icon-bianji iconfont"
							   onClick={this.editorTip.bind(this, record)}
							/>
						</Tooltip>
						<Tooltip placement="bottom" title={getLangTxt("del")}>
							<i onClick={this.removeTip.bind(this, record)}
							   className="icon-shanchu iconfont"/>
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

	//咨询总结项排序 type： -1向上； 1向下；
	handleRangeTipsItem(type)
	{
		let {tableData = []} = this.props,
			{rangeRows = []} = this.state,
			copyCheckedKeys = [...rangeRows];

		tableData.sort((a, b) => a.rank - b.rank);

		let rangeArray = upOrDown(tableData, copyCheckedKeys, "itemId", type);

		if(rangeRows.length < 1)
			return;

		if(rangeArray && rangeArray.length > 0)
			this.props.editorTipsRank(rangeArray);

		this.setState({
			itemRangeChange: !this.state.itemRangeChange
		});
	}

	render()
	{
		let {dataList = [], tableData = [], progress = {}, groupProgress = {}, errorMsg = getLangTxt("setting_import_content7"), tipsErrorMsg, allTipsCount = 0} = this.props,
			initialSelectGroup = dataList[0],
			{selectedRowKeys = [], getAllTips, searching} = this.state;

		if(groupProgress && groupProgress.left === LoadProgressConst.SAVING_FAILED)
		{
			this.savingErrorTips(errorMsg, true)
		}
		else if(progress && progress.right === LoadProgressConst.DUPLICATE && tipsErrorMsg)
		{
			this.savingErrorTips(tipsErrorMsg, false)
		}
		else if(progress && progress.right === LoadProgressConst.SAVING_FAILED)
		{
			this.savingErrorTips(getLangTxt("setting_import_content7"), false)
		}
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
										<div className="typeHeaderTitle">{getLangTxt("setting_company_classify")}</div>
										<div className='tipsGroupOperate'>
											<Tooltip placement="bottom" title={getLangTxt("move_up")}>
												<i className="iconfont icon-shangyi rangeIconUp"
												   onClick={this.rangeTipsGroup.bind(this, -1)}/>
											</Tooltip>
											<Tooltip placement="bottom" title={getLangTxt("move_down")}>
												<i className="iconfont icon-xiayi rangeIconDown"
												   onClick={this.rangeTipsGroup.bind(this, 1)}/>
											</Tooltip>
											<Tooltip placement="bottom" title={getLangTxt("add_group")}>
												<i className=" iconfont icon-tianjia1"
												   onClick={this.showType.bind(this)}/>
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
											checkStrictly={true}
											onCheck={this.onCheckGroup}
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
					<NTModal visible={this.state.importVisible} className="usualTipsRightModal" title={getLangTxt("import")}
					         onCancel={this.importVisibleCancel.bind(this)}
					         footer={
						         [
							         <Button key="back" type="ghost" size="large" className="cancelImportBtn"
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
					</NTModal>

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
										<Button type="primary" onClick={this.showTip.bind(this)}>
											{
												getLangTxt("setting_add_word")
											}
										</Button>

										<Button type="primary" onClick={this.downLoadModal.bind(this)}>
											{
												getLangTxt("down_templete")
											}
										</Button>

										<Button type="primary" onClick={this.importFile.bind(this)}>
											{
												getLangTxt("import")
											}
										</Button>

										<Button type="primary" onClick={this.exportTips.bind(this)}>
											{
												getLangTxt("export")
											}
										</Button>
										{
											getAllTips || searching ?
												null
												:
												<span>
                                                <Tooltip placement="bottom" title={getLangTxt("move_up")}>
                                                    <Button type="primary"
                                                            onClick={this.handleRangeTipsItem.bind(this, -1)}>
                                                        <i className="iconfont icon-shangyi rangeBtn"/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip placement="bottom" title={getLangTxt("move_down")}>
                                                    <Button type="primary"
                                                            onClick={this.handleRangeTipsItem.bind(this, 1)}>
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
														<Input onKeyUp={this.onSearch.bind(this)}
														       className="searchIpt"/>
													)}
												</FormItem>
											</Form>
											<Button className="searchBtn" type="primary"
											        onClick={this.onSearch.bind(this)} icon="search"></Button>
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
												<Table dataSource={tableData}
												       columns={this.getColumn()}
												       pagination={pagination}
												/>
												:
												<Table dataSource={tableData}
												       columns={this.getColumn()}
												       pagination={pagination}
												       rowSelection={rowSelection}
												/>
										}
									</ScrollArea>
									{
                                        getProgressComp(progress && progress.right)
									}
								</div>
							</div>
					}
				</div>

				{
					this.state.newTip ?
						<NewTips
							newTipName={this.state.newTipName}
							changeNewTip={this.changeNewTip.bind(this)}
							isEdit={this.state.isEdit}
							getTipsData={this.props.getTipsData.bind(this)}
							newTips={this.props.newTips}
							removeTips={this.props.removeTips}
							editorTips={this.props.editorTips}
							state={dataList}
							selectedKeys={this.state.selectingKey}
							selectGroupInfo={this.state.selectGroupInfo || initialSelectGroup}
							editorData={this.state.editorData}
							onNewTipsSelectGroup={this.onNewTipsSelectGroup.bind(this)}
						/> : null
				}

				{
					this.state.newGroup ?
						<NewTipsGroup
							newGroupName={this.state.newGroupName}
							newTipsGroup={this.props.newTipsGroup}
							editorTipsGroup={this.props.editTipsGroup}
							changeNewGroup={this.changeNewGroup.bind(this)}
							state={dataList}
							editorData={this.state.editorData}
						/> : null
				}
			</div>
		)
	}
}

CommonWorld = Form.create()(CommonWorld);

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
		getAllTipsData, getSearchTipsData, getTipsGroup, newTipsGroup, editTipsGroup, removeTipsGroup,
		getTipsData, newTips, editorTips, removeTips, importCommonWord, editTipsGroupRank, editorTipsRank
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CommonWorld);

