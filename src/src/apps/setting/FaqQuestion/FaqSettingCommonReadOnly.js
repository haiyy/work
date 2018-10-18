import React from 'react'
import { Form, Input, Button, Table, Select, message, Modal, Tree, Popover, Upload, Tooltip, Spin } from 'antd'
import TreeNode from "../../../components/antd2/tree/TreeNode";
import moment from 'moment'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ScrollArea from 'react-scrollbar'
import {
	getCompanyFaqGroupList, getTemalatesGroup,getCompanyFaqItemList, getCompanySearchFaqData, getAllCompanyFaqItemData, clearFaqItem
} from "./action/faqCompanySetting"
import './style/faqSetting.scss';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { loginUserProxy, downloadByATag, getLangTxt } from '../../../utils/MyUtil';
import { bglen, truncateToPop } from "../../../utils/StringUtils"
import Settings from '../../../utils/Settings';
import { getLocalTime } from "../../../utils/MyUtil";
import { upOrDown } from "../../../utils/MyUtil";
import { getHyperMessageForJSON, isJsonString } from "../../../utils/HyperMediaUtils";
import NTModal from "../../../components/NTModal";

const Option = Select.Option, confirm = Modal.confirm;

class FaqSettingCommonReadOnly extends React.PureComponent {
	constructor(props)
	{
		super(props);

		this.state = {
			listSetting: true,
			outputvisible: false,
			newfaq: false,
			newlist: false,
			faqnewlist: [{"title": "", "time": "", "parent": "", "answer": "", "key": "1"}],
			faqopen: 1,
			faqagain: false,
			startTime: 0,
			endTime: 0,
			newFaqName: '',
			groupId: '',
			parentId: '',
			groupIds: [],
			editGroup: false,
			newGroupName: '',
			newItemName: '',
			editData: null,
			editItemData: '',
			editItem: false,
			changeGroup: false,
			changeStartTime: false,
			changeStopTime: false,
			disabledStartValue: null,
			endOpen: false,
			gidForSearch: '',
			searchValue: '',
			searchFaqItem: true,
			isRangeItem: false,
			pageNumber: 1,
			display: true,
			faqItemParentId: "",
			selectedRowKeys: [],
			rangeRows: []
		};
		this.selectedKey = [];
	}

	//开局获取常见问题分组信息
	componentDidMount()
	{
		let data = {
			groupId: "",
			keywords: "",
			templateid: "",
			page: "1",
			rp: "10"
		};
		let {recordArr, userFaqSetting} = this.props;
		if(userFaqSetting)
		{
			if(recordArr.length == 1)
			{
				let {recordArr} = this.props, obj;
				obj = {templateid: recordArr[0].templateid};
				data.templateid = recordArr[0].templateid;
				this.props.getCompanyFaqGroupList(obj);
				this.props.getCompanySearchFaqData(data);
				/*this.props.clearFaqItem()*/
			}
			else
			{
				this.props.getTemalatesGroup(true);
			}
		}
		else
		{
			this.props.getCompanyFaqGroupList();
			this.props.getCompanySearchFaqData(data);
		}
	}


	range(start, end)
	{
		const result = [];
		for(let i = start; i < end; i++)
		{
			result.push(i);
		}
		return result;
	}


	//编辑常见问题条目
	editFaqItem(item)
	{
		this.props.form.setFieldsValue({"title": item.title});
		this.props.form.setFieldsValue({"answer": item.answer});
		this.setState({editItemData: item, newfaq: true, editItem: true});
	}

	//删除常见问题条目
	delFaqItem(id, gid)
	{
		confirm({
			title: getLangTxt("del_tip"),
			width: '320px',
            iconType: 'exclamation-circle',
            className: 'warnTip',
			content: getLangTxt("del_content"),
			onOk: () => {
				let obj = {
						"groupId": gid,
						"itemIds": [id]
					},
					{companyFaqItem, faqCompanyItemCount = 0} = this.props,
					{pageNumber = 1, gidForSearch, searchFaqItem, searchValue = ""} = this.state,
					isUpdate = pageNumber < faqCompanyItemCount / 10;
				if(this.props.userFaqSetting)
				{
					let record = this.props.recordArr[0];

					obj.templateid = record.templateid;

					this.props.delCompanyFaqItem(obj, isUpdate, searchFaqItem, pageNumber, searchValue);

				}
				else
				{
					this.props.delCompanyFaqItem(obj, isUpdate, searchFaqItem, pageNumber, searchValue);
				}

				if(companyFaqItem.length === 1)
				{
					pageNumber = pageNumber > 1 ? pageNumber - 1 : pageNumber;
					let obj = {
						groupId: gidForSearch,
						page: pageNumber,
						rp: "10"
					};
					this.props.getCompanyFaqItemList(obj);

					this.setState({pageNumber});

				}
			},
			onCancel: () => {
			}
		});
	}

	error(data)
	{
		message.error(data);
	}

	//点击收起常见问题分组
	changeClick()
	{
		this.setState({
			display: !this.state.display
		})
	}

	uniqueParent(array)
	{
		return [...new Set(array)]
	}

	//多选常见问题分组
	onCheck = (checkedKeys, info) => {

		let rangeCheckedKeys = [],
			checkedParents = [],
			{checkedNodes = []} = info;
		checkedNodes.forEach(item => {
			rangeCheckedKeys.push(item.key);
			checkedParents.push(item.props.parentId);
		});

		checkedParents = this.uniqueParent(checkedParents);

		if(checkedParents.length == 1 && checkedKeys.checked.length > 0)
		{
			this.setState({rangeCheckedParent: checkedParents[0]})
		}
		else
		{
			this.setState({rangeCheckedParent: null})
		}

		this.setState({
			groupIds: rangeCheckedKeys
		});
	};

	//点击获取分组下条目信息
	onSelect(selectedKeys, e)
	{
		let {companyGroupData = []} = this.props;
		this.selectedKey = selectedKeys;
		this.setState({parentId: selectedKeys[0], gidForSearch: selectedKeys[0], searchFaqItem: false, pageNumber: 1});

		if(selectedKeys[0])
		{
			let obj = {
				groupId: selectedKeys[0],
				page: 1,
				rp: "10"
			};
			this.props.getCompanyFaqItemList(obj)
		}

		for(var i = 0; i < companyGroupData.length; i++)
		{
			if(companyGroupData[i].groupId === selectedKeys[0])
			{
				this.setState({
					firstLevel: true,
					isRangeItem: true
				});
				if(companyGroupData[i].fastQuestionGroups)
				{
					this.setState({isRangeItem: false})
				}

				return
			}
			else
			{
				this.setState({
					firstLevel: false,
					isRangeItem: true
				})
			}
		}
	}

	//搜索常见问题条目
	searchQuestion(e)
	{
		let obj = {
			groupId: "", // groupId: this.state.gidForSearch
			keywords: e.target.value,
			templateid: "",
			page: 1,
			rp: "10"
		};

		if(!obj.keywords)
		{
			obj.keywords = "";
		}
		if(this.props.userFaqSetting)
		{
			let record = this.props.recordArr[0];
			obj.templateid = record.templateid;
			this.props.getCompanySearchFaqData(obj)
		}
		else
		{
			this.props.getCompanySearchFaqData(obj)
		}
		this.setState({
			searchValue: e.target.value,
			searchFaqItem: true,
			pageNumber: 1
		})
	}

	//点击放大镜搜索
	getSearchQuestion()
	{
		let obj = {
			groupId: "",
			keywords: this.state.searchValue,
			templateid: "",
			page: "1",
			rp: "10"
		};
		if(this.state.searchValue != "")
		{
			if(this.props.userFaqSetting)
			{
				let record = this.props.recordArr[0];
				obj.templateid = record.templateid;
				this.props.getCompanySearchFaqData(obj)
			}
			else
			{
				this.props.getCompanySearchFaqData(obj)
			}
			this.setState({
				searchFaqItem: true
			})
		}
	}

	//点击获取下一页数据
	nextPageItem(pageNum)
	{
		this.setState({pageNumber: pageNum});
		let obj = {
			groupId: this.state.gidForSearch,
			page: pageNum,
			rp: 10
		};
		if(this.state.searchFaqItem)
		{
			obj.keywords = this.state.searchValue;
			obj.groupId = "";
			if(this.props.userFaqSetting)
			{
				let record = this.props.recordArr[0];
				obj.templateid = record.templateid;
				this.props.getCompanySearchFaqData(obj)
			}
			else
			{
				obj.templateid = "";
				this.props.getCompanySearchFaqData(obj)
			}
		}
		else
		{
			this.props.getCompanyFaqItemList(obj)
		}
	}

	getContainerWidth(floor)
	{
		if(!getComputedStyle(window.document.documentElement)['font-size'])
			return;

		let htmlFontSizepx = getComputedStyle(window.document.documentElement)['font-size'],
			htmlFontSize = htmlFontSizepx.substring(0, htmlFontSizepx.length - 2),
			maxWidth = 1.95 * htmlFontSize;

		return floor > 1 ? maxWidth - 18 * floor - 107 : maxWidth - 18 * floor - 52;
	}

	//常见问题分组树渲染
	_createTreeNodes(states, level = 0)
	{
		let {recordArr = []} = this.props;
		if(states && states.length > 0) return states.map(item => {
			let boxWidth = this.getContainerWidth(level + 1),
				contentInfo = truncateToPop(item.groupName, boxWidth) || {};

			return (
				<TreeNode parentId={item.parentId} isLeaf={item.isLeaf} key={item.groupId}
				          title={
					          <div>
						          {
							          contentInfo.show ?
								          <Popover content={<div style={{
									          maxWidth: '200px', height: 'auto', wordWrap: 'break-word'
								          }}>{item.groupName}</div>} placement="topLeft">
									          <div className="groupNameStyle">{item.groupName}</div>
								          </Popover>
								          :
								          <div className="groupNameStyle"> {item.groupName} </div>
						          }
						          {
							          recordArr.length > 1 ? null :
								          <span>
                                     <Tooltip placement="bottom" title={getLangTxt("edit")}>
                                        <i className="iconfont icon-bianji"
                                           style={{fontSize: '16px', cursor: 'pointer', marginRight: "8px"}}/>
                                    </Tooltip>
                                    <Tooltip placement="bottom" title={getLangTxt("del")}>
                                        <i className="iconfont icon-shanchu"
                                           style={{fontSize: '16px', cursor: 'pointer'}}/>
                                    </Tooltip>
                                 </span>
						          }
					          </div>
				          }
				>
					{item.fastQuestionGroups ? this._createTreeNodes(item.fastQuestionGroups, level + 1) : null}
				</TreeNode>
			);
		});
	}

	//上级分组树渲染
	loopUpperGroup(data)
	{
		let _this = this;
		return data.map((item) => {
			if(item.fastQuestionGroups)
			{
				return <TreeNode title={item.groupName} key={item.groupId} value={item.groupId}>
					{
						_this.loopUpperGroup(item.fastQuestionGroups)
					}
				</TreeNode>;
			}

			return <TreeNode title={item.groupName} key={item.groupId} value={item.groupId}/>;
		});
	}

	//点击获取所有分组下常见问题
	getAllFaq()
	{

		this.setState({
			gidForSearch: "",
			parentId: ""
		});
		this.selectedKey = [];

		/*let data;
		 if (this.props.userFaqSetting) {
		 data = {page: 1, rp: 10};
		 } else {
		 data = {page: 1, rp: 10};
		 }
		 this.props.getAllCompanyFaqItemData(data);*/
	}

	//加载进度
	_getProgressComp(progress, className)
	{
		let progressNum = progress && progress.left ? progress && progress.left : progress && progress.right;

		if(progressNum === LoadProgressConst.SAVING || progressNum === LoadProgressConst.LOADING)//正在保存 || 正在加载
		{
			return (
				progress.right ?
					<div style={{height: '100%', position: 'relative'}}>
                        <Spin style={{
					width: "100%",
					height: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center"
				}}/>
					</div>
					:
					<div style={{position: 'absolute', top: '0', width: '100%', height: '100%'}}>
                        <Spin style={{
					width: "100%",
					height: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center"
				}}/>
					</div>
			);
		}
		else if(progressNum === LoadProgressConst.LOAD_FAILED)//加载失败
		{
			if(progress.left)
			{
				return <ReFresh reFreshFn={this.reFreshLeftFn.bind(this)}/>;
			}
			else
			{
				return <ReFresh
					reFreshStyle={this.state.display ? {width: "calc(100% - 1.99rem)"} : {width: "calc(100% - 0.2rem)"}}
					reFreshFn={this.reFreshRightFn.bind(this)}/>;
			}
		}

		return null;
	}

	//重新加载常见问题分组
	reFreshLeftFn()
	{
		this.props.getCompanyFaqGroupList();
	}

	//重新加载常见问题条目
	reFreshRightFn()
	{
        let obj = {
            groupId: this.state.parentId,
            page: this.state.pageNumber || 1,
            rp: "10"
        };
		this.props.getCompanyFaqItemList(obj);
	}

	scrollIng(value)
	{
		if(!value.topPosition)
		{
			value.topPosition = 0;
		}
	}

//常见问题条目选中
	onSelectChange(selectedRowKeys, selectedRows)
	{
		let rangeRows = [];
		selectedRows.forEach(item => {
			rangeRows.push(item.key)
		});
		this.setState({
			selectedRowKeys,
			rangeRows
		})
	}


	render()
	{
		let _this = this, nowTimeStamp = Date.parse(new Date()), judgeOverDue;
		let {editData, selectedRowKeys, isRangeItem} = this.state,
			faqGroupData;
		let {progress, groupProgress, recordArr, userFaqSetting} = this.props;


		//获取分组数据
		faqGroupData = this.props.companyGroupData;

		//选择上级分组渲染

		let faqnewlistparent = [];

		if(faqGroupData)
		{
			let disabled = false;
			faqGroupData.map((item) => {
				let keyCount = Math.random();
				disabled = this.state.editGroup && editData && item.groupId === editData.groupId;
				faqnewlistparent.push(<Option key={keyCount} value={item.groupId} disabled={disabled}>
					{item.groupName}
				</Option>);
			});
		}


		const columns = [{
			title: '',
			dataIndex: 'rank',
			width: '5%',
			render: (record) => {
				let {pageNumber} = this.state;
				let rankNum,
					calcCurrent = (pageNumber - 1) * 10;
				calcCurrent === 0 ? rankNum = record : rankNum = calcCurrent + record;
				return (
					<div style={{textAlign: "center"}}>{rankNum}</div>
				)
			}
		}, {
			title: getLangTxt("title"),
			dataIndex: 'title',
			width: '20%'
		}, {
			title: getLangTxt("setting_faq_answer"),
			dataIndex: 'answer',
			width: '25%'
		}, {
			title: getLangTxt("setting_faq_group"),
			dataIndex: 'zu',
			width: '17%'
		}, {
			title: getLangTxt("effective_time"),
			dataIndex: 'time',
			width: '20%'
		}, {
			title: getLangTxt("operation"),
			dataIndex: 'act',
			width: '13%'
		}], data = [];
		let i = 1;
		let faqItemData;

		if(this.props.userFaqSetting && this.props.recordArr.length > 1)
		{
			faqItemData = [];
		}
		else
		{
			faqItemData = this.props.companyFaqItem;
		}

		//获取常见问题条目渲染
		let loop = (data, groupData) => {
			data ? data.map((item) => {
				if(!item.groupName)
				{
					groupData ? groupData.map((gItem) => {
						if(item.groupId == gItem.groupId)
						{
							item.groupName = gItem.groupName;
						}
						else if(gItem.fastQuestionGroups)
						{
							loop(data, gItem.fastQuestionGroups)
						}
					}) : null
				}
			}) : null;
		};
		loop(faqItemData, faqGroupData);

		if(faqItemData && faqItemData.length > 0)
		{

			let answerTrans = "";
			faqItemData.map((item, index) => {
				if(isJsonString(item.answer))
				{
					let parseAnswer = JSON.parse(item.answer) || {};
					answerTrans = parseAnswer.message || "";
				}
				else
				{
					answerTrans = item.answer;
				}

				if(item.stopTime < nowTimeStamp && item.stopTime != 0)
				{
					judgeOverDue = "overDue"
				}
				else
				{
					judgeOverDue = "due"
				}
				data.push({
					key: item.itemId,
					num: i,
					rank: index + 1,
					title: <div>
						{
							bglen(item.title) >= 18 ?
								<Popover
									content={
										<div style={{width: '150px', height: 'auto', wordWrap: 'break-word'}}>
											{item.title}
										</div>
									}>
									<div className="title_groupStyle">{item.title}</div>
								</Popover>
								:
								<div className="title_groupStyle">{item.title}</div>
						}
					</div>,
					answer:
						<div>
							{
								bglen(answerTrans) >= 22 ?
									<Popover
										content={
											<div style={{width: '150px', height: 'auto', wordWrap: 'break-word'}}>
												{answerTrans}
											</div>
										}>
										<div className="answer_groupStyle">{answerTrans}</div>
									</Popover>
									:
									<div className="answer_groupStyle">{answerTrans}</div>
							}
						</div>
					,
					zu: <div className="title_groupStyle">{item.groupName}</div>,
					time: <div style={{position: "relative", width: "95px"}}>
						<div>{getLocalTime(item.startTime)}</div>
						<div>{item.stopTime != 0 ? getLocalTime(item.stopTime) : getLangTxt("forever")}</div>
						<div className={judgeOverDue}></div>
					</div>,
					timeStamp: item.startTime,
					act: <div>
                            <span>
                                <Tooltip placement="bottom" title={getLangTxt("edit")}>
                                    <i className="iconfont icon-bianji" style={{cursor: 'pointer'}}/>
                                </Tooltip>
                            </span>
						<span style={{cursor: 'pointer', marginLeft: '18px'}}>
                                <Tooltip placement="bottom" title={getLangTxt("del")}>
                                    <i className="iconfont icon-shanchu"/>
                                </Tooltip>
                            </span>
					</div>
				});
				i++;
			});
		}

		let pagination = {
				total: this.props.faqCompanyItemCount || 0,
				showQuickJumper: true,
				showTotal: (total) => {
					return getLangTxt("total", total);
				},
				current: this.state.pageNumber,

				onChange: (current) => {
					this.nextPageItem(current);
				}
			},
			rowSelection = {
				selectedRowKeys,
				onChange: this.onSelectChange.bind(this)
			};

		let importAvail = false;

		const companyType = (
			<div style={{
				display: 'flex', borderTop: '1px solid #e9e9e9', width: '100%', height: "100%", position: "relative"
			}}>
				<div className="faqsetting_maincontent_left"
				     style={this.state.display ? {width: '1.92rem'} : {
					     width: '0.05rem'
				     }}>
					{
						this.state.display ?
							<div style={{height: "100%"}}>
								<div className="faqsetting_maincontent_left_title">
									<span onClick={_this.getAllFaq.bind(_this)} style={{cursor: 'pointer'}}>{getLangTxt("setting_faq_type")}</span>
									<div className="faqGroupOperate">
										{/*<Icon style={styles.icon} type="arrow-up" onClick={_this.clickToUp.bind(_this)}/>
                                         <Icon style={styles.icon} type="arrow-down" onClick={_this.clickToDown.bind(_this)}/>*/}
										<Tooltip placement="bottom" title={getLangTxt("move_up")}>
											<i className="iconfont icon-shangyi"/>
										</Tooltip>
										<Tooltip placement="bottom" title={getLangTxt("move_down")}>
											<i className="iconfont icon-xiayi"/>
										</Tooltip>
										<Tooltip placement="bottom" title={getLangTxt("add_group")}>
											<i className="iconfont icon-tianjia1"
											   style={{marginRight: '10px', fontSize: '12px', cursor: 'pointer'}}/>
										</Tooltip>
									</div>
								</div>
								{/*<div style={{width:"262px"}}>
                                 <span style={{float:'right', marginTop:'10px', marginLeft:'15px'}}>
                                 <i className="iconfont icon-bianji" onClick={_this.editFaqGroup.bind(_this)} style={{fontSize:'16px',cursor:'pointer',marginRight:"10px"}}/>
                                 <i className="iconfont icon-shanchu" onClick={_this.delFaqGroup.bind(_this)} style={{fontSize:'16px',cursor:'pointer'}}/>
                                 </span>
                                 </div>*/}
								<div className="faqsetting_maincontent_left_tree">
									<ScrollArea
										speed={1}
										horizontal={false} smoothScrolling
										onScroll={this.scrollIng.bind(this)}
										style={{height: "100%"}}>
										<Tree
											selectedKeys={this.selectedKey}
											onSelect={_this.onSelect.bind(_this)}
											checkable
											checkStrictly={true}
											onCheck={_this.onCheck}
											style={{marginTop: '20px'}}
										>
											{this._createTreeNodes(faqGroupData, 0)}
										</Tree>
									</ScrollArea>
                                    <img src={require("./image/faqGroupClose.png")} className="faq-setting-button" onClick={this.changeClick.bind(this)}/>
								</div>
							</div>
							:
                            <img src={require("./image/faqGroupOpen.png")} className="faq-setting-button faq-setting-button-open" onClick={this.changeClick.bind(this)}/>
					}
					{
						this.state.display ?
							this._getProgressComp(groupProgress, 'la-square-jelly-box_accountGroup')
							:
							null
					}
				</div>

				<div className="faqsetting_maincontent_right" style={this.state.display ? {
					padding: '0.05rem 0 0 2rem', height: "100%"
				} : {padding: '0.05rem 0 0 0.13rem', height: "100%"}}>
					<div className="faqsetting_maincontent_right_title">
						<div className="faqSearch">
							<Input className="faqSearchIpt" onKeyUp={this.searchQuestion.bind(this)}/>
							<Button type="primary" className="faqSearchBtn" onClick={this.getSearchQuestion.bind(this)} icon="search"/>
						</div>

						<div className="right_title_btn">
								<Button disabled>{getLangTxt("setting_faq_add")}</Button>
							    <Button disabled type="primary">{getLangTxt("setting_faq_templete")}</Button>
								<Button disabled>{getLangTxt("import")}</Button>
								<Button disabled>{getLangTxt("export")}</Button>
						</div>
					</div>

					<div className="faqsetting_maincontent_right_content">
						<ScrollArea speed={1} className="faqScrollArea" horizontal={false} smoothScrolling>
							{
								isRangeItem ?
									<Table pagination={pagination} columns={columns} dataSource={data}
									       rowSelection={rowSelection}/>
									:
									<Table pagination={pagination} columns={columns} dataSource={data}/>
							}
						</ScrollArea>

					</div>
					{this._getProgressComp(progress, 'la-square-jelly-box_accountList')}
				</div>
			</div>
		);
		//编辑获取条目分组name
		let props = {
			name: 'file',
			accept: '.xls, .xlsx',
			listType: 'file',
			action: "http://xiaonenggood.cn"
		};

		return (
			<div className="faqsetting">
				<div style={{height: '100%'}}>
					{companyType}
				</div>
			</div>
		)
	}
}

FaqSettingCommonReadOnly = Form.create()(FaqSettingCommonReadOnly);

function mapStateToProps(state)
{
	return {
		companyGroupData: state.getFaqCompanyGroup.data,
		groupProgress: state.getFaqCompanyGroup.groupProgress,
		faqGroupErrorMsg: state.getFaqCompanyGroup.faqGroupErrorMsg,
		companyFaqItem: state.getFaqCompanyItem.data,
		faqCompanyItemCount: state.getFaqCompanyItem.faqItemCount,
		progress: state.getFaqCompanyItem.progress,
		faqItemErrorMsg: state.getFaqCompanyItem.faqItemErrorMsg
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getCompanyFaqGroupList,
		getTemalatesGroup,
		getCompanyFaqItemList,
		getCompanySearchFaqData,
		getAllCompanyFaqItemData,
		clearFaqItem,
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(FaqSettingCommonReadOnly));
