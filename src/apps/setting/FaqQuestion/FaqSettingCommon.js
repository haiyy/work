import React from 'react'
import { Form, Input, Checkbox, Button, Table, message, Tree, DatePicker, Popover, Upload, Tooltip } from 'antd'
import moment from 'moment'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ScrollArea from 'react-scrollbar'
import {
	addCompanyFaqGroup, addTemplateFaqGroup, editCompanyFaqGroup, delCompanyFaqGroup, getCompanyFaqGroupList, getTemalatesGroup,
	addCompanyFaqItem, editCompanyFaqItem, delCompanyFaqItem, getCompanyFaqItemList, getCompanySearchFaqData, getAllCompanyFaqItemData,
	importFaqData, clearFaqItem, editCompanyFaqGroupRank, editCompanyFaqItemRank
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
import Modal from "../../../components/xn/modal/Modal";
import { confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";
import Loading from "../../../components/xn/loading/Loading";
import TreeSelect from "../../public/TreeSelect";
import TreeNode from "../../../components/antd2/tree/TreeNode";
const dateFormat = 'YYYY-MM-DD HH:mm:ss',

	FormItem = Form.Item;

class FaqSettingCommon extends React.PureComponent {
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

	//下载模板
	downLoadModule()
	{
		let {siteId} = loginUserProxy(),
			downLoadUrl = Settings.querySettingUrl("/exportExcel/fastQuestion?siteid=", siteId, "&sample=sample");
		downloadByATag(downLoadUrl);
	}

	//弹出导入
	handleClickOutput()
	{
		this.setState({outputvisible: true})
	}

	//选择导入文件
	onSelectFile(info)
	{
		if(info.event)
		{
			let {file} = info,
				{originFileObj} = file,
				templateid;
			if(this.props.userFaqSetting && this.props.recordArr.length == 1)
			{
				let record = this.props.recordArr;
				templateid = record[0].templateid;
			}
			else
			{
				templateid = null;
			}
			this.props.importFaqData(originFileObj, templateid)
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

					info({
						title: getLangTxt("import_tip"),
						width: '320px',
						iconType: 'exclamation-circle',
						className: 'errorTip',
						okText: getLangTxt("sure"),
						content: <div>
							{groupExist.length > 0 ?
								<p className="importErrorMsg">{getLangTxt("setting_faq_note2")}{groupExistString}</p> : null}
							{groupFailed.length > 0 ?
								<p className="importErrorMsg">{getLangTxt("setting_faq_note3")}{groupFailedString}</p> : null}
							{itemExist.length > 0 ?
								<p className="importErrorMsg">{getLangTxt("setting_faq_note4")}{itemExistString}</p> : null}
							{itemFailed.length > 0 ?
								<p className="importErrorMsg">{getLangTxt("setting_faq_note5")}{itemFailedString}</p> : null}
						</div>,
						onOk: () => {
							let {recordArr, userFaqSetting} = this.props, groupIdInfo = {
								groupId: this.state.parentId,
								page: this.state.pageNumber || 1,
								rp: "10"
							};

							if(userFaqSetting)
							{
								if(recordArr.length == 1)
								{
									let {recordArr} = this.props, obj;
									obj = {templateid: recordArr[0].templateid};

									this.props.getCompanyFaqGroupList(obj);
									this.props.clearFaqItem()

								}
								else
								{
									this.props.getTemalatesGroup();
								}
							}
							else
							{
								this.props.getCompanyFaqGroupList();
							}

							if(this.state.parentId)
								this.props.getCompanyFaqItemList(groupIdInfo);

						}
					});
				}
				else if(!res.success && res.result.code == 400)
				{
					error({
						title: getLangTxt("import_tip"),
						width: '320px',
						iconType: 'exclamation-circle',
						className: 'errorTip',
						okText: getLangTxt("sure"),
						content: <div>{getLangTxt("setting_import_content5")}</div>
					});
				}
				else
				{
					success({
						title: getLangTxt("import_tip"),
						width: 320,
						iconType: 'exclamation-circle',
						className: 'commonTip',
						okText: getLangTxt("sure"),
						content: <div>{getLangTxt("setting_import_content6")}</div>
					});
				}
			});
		}
	}

	//取消导入
	handleClickOutputVisibleCancel()
	{
		this.setState({outputvisible: false})
	}

	//确认导入
	handleClickOutputVisibleConfirm()
	{
		this.setState({outputvisible: false})
	}

	//导出
	exportFaq()
	{
		let {siteId} = loginUserProxy(),
			exportUrl = "";
		if(this.props.userFaqSetting && this.props.recordArr.length == 1)
		{
			let record = this.props.recordArr,
				templateid = record[0].templateid;
			exportUrl = Settings.querySettingUrl("/exportExcel/fastQuestion?siteid=", siteId, "&templateid=" + templateid);
		}
		else
		{
			exportUrl = Settings.querySettingUrl("/exportExcel/fastQuestion?siteid=", siteId);
		}
		downloadByATag(exportUrl);
	}

	//弹出新建常见问题
	handleClickNewFaq()
	{
		this.props.form.setFieldsValue({"title": ""});
		this.props.form.setFieldsValue({"answer": ""});
		this.setState({
			newfaq: true,
			editItem: false,
			changeGroup: true,
			changeStartTime: false,
			changeStopTime: false,
			endOpen: false,
			disabledStopValue: null,
			disabledStartValue: null
		})
	}

	//弹出新建常见问题分组
	handleClickNewList()
	{
		this.props.form.setFieldsValue({"groupName": ""});
		this.setState({editGroup: false, newlist: true, newGroupName: "新建分组"})
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

	//新建常见问题分组选取上级分组
	choiceUpperGroup(value)
	{
		if(value == " ")
		{
			value = ""
		}
		this.selectedKey = [value];
		this.setState({parentId: value, changeGroup: true});
	}

	//常见问题条目选择上级分组
	choiceItemUpperGroup(value)
	{
		let faqGroupData, data = [], {companyGroupData = []} = this.props,
			obj = {
				groupId: value,
				keywords: "",
				page: this.state.pageNumber || 1,
				rp: "10"
			};

		data.push(value);

		this.props.getCompanyFaqItemList(obj);

		this.setState({parentId: value, gidForSearch: value, changeGroup: true, faqItemParentId: value});
		this.selectedKey = data;

		for(var i = 0; i < companyGroupData.length; i++)
		{
			if(companyGroupData[i].groupId === value)
			{
				this.setState({
					firstLevel: true
				});
				return
			}
			else
			{
				this.setState({
					firstLevel: false
				})
			}
		}
	}

	//选取常见问题有效时间范围

	//选择开始时间
	newFaqStartTime(value)
	{
		let openTime = value && value._d.getTime();
		this.setState({
			startTime: openTime,
			changeStartTime: true,
			disabledStartValue: value
		});
	}

	//开始时间选择之后打开结束时间
	handleStartOpenChange(open)
	{
		if(!open)
		{
			this.setState({endOpen: true});
		}
	}

	//不可选开始时间
	disabledStartDate(startValue)
	{
		let endValue = this.state.disabledStopValue,
			{editItem, editItemData = {}} = this.state;

		if(editItem && editItemData.stopTime != 0)
		{
			endValue = this.state.disabledStopValue === undefined ? moment(getLocalTime(editItemData.stopTime)) : this.state.disabledStopValue;
		}

		if(!startValue || !endValue)
		{
			return false;
		}
		return startValue.valueOf() > endValue.valueOf();
	}

	//选择结束时间
	newFaqEndTime(value)
	{
		let closeTime = value ? value._d.getTime() : 0;
		this.setState({
			endTime: closeTime,
			changeStopTime: true,
			disabledStopValue: value
		});
	}

	//点击打开结束时间
	handleEndOpenChange(open)
	{

		let {editItem, editItemData} = this.state,
			editStartTime = this.state.startTime === 0 ? editItemData.startTime : this.state.startTime;

		if(!open && this.state.endTime < editStartTime)
		{
			if(editItem && editItemData.stopTime != 0)
			{
				let stopTime = getLocalTime(editItemData.stopTime);
				this.setState({
					endTime: editItemData.stopTime,
					disabledStopValue: moment(stopTime)
				});
				this.props.form.setFieldsValue({summaryStopTime: moment(stopTime)})
			}
			else
			{
				this.setState({
					endTime: 0,
					disabledStopValue: null
				});
				this.props.form.setFieldsValue({summaryStopTime: null})
			}

		}
		this.setState({endOpen: open});
	}

	//不可选结束时间
	disabledEndDate(endValue)
	{

		let {editItem, editItemData} = this.state,
			startValue = this.state.disabledStartValue;

		if(editItem)
		{
			startValue = this.state.disabledStartValue ? this.state.disabledStartValue : moment(getLocalTime(editItemData.startTime));
		}

		if(!endValue || !startValue)
		{
			return false;
		}

		return endValue.valueOf() < startValue.valueOf();

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

	//保存新建常见问题
	handleClickNewFaqConfirm()
	{
		const {getFieldValue} = this.props.form,
			{form} = this.props;

		let obj, faqItemTitle, faqItemAnswer,
			{parentId, faqItemParentId, editItem, editItemData, changeStartTime, changeStopTime, startTime, endTime, gidForSearch, pageNumber} = this.state;

		form.validateFields((errors) => {
			if(errors)
				return false;
			let answerJson = getHyperMessageForJSON(getFieldValue("answer"), 11);
			if(this.state.editItem)
			{
				obj = {
					"groupId": faqItemParentId ? faqItemParentId : editItemData.groupId,
					"oldGid": editItemData.groupId,
					"title": getFieldValue("title"),
					"answer": JSON.stringify(answerJson),
					"startTime": editItem && !changeStartTime ? editItemData.startTime : startTime || 0,
					"stopTime": editItem && !changeStopTime ? editItemData.stopTime : endTime || 0,
					"itemId": editItemData.itemId,
					"rank": editItemData.rank
				}
			}
			else
			{
				let gids = [];
				gids.push(parentId);
				obj = {
					"groupId": gids,
					"title": getFieldValue("title"),
					"answer": JSON.stringify(answerJson),
					"startTime": startTime || 0,
					"stopTime": endTime || 0
				};
			}
			if(this.state.editItem)
			{
				if(this.props.userFaqSetting)
				{
					let record = this.props.recordArr[0];
					obj.templateid = record.templateid;
					this.props.editCompanyFaqItem(obj);
				}
				else
				{
					this.props.editCompanyFaqItem(obj);
				}
			}
			else
			{
				if(this.props.userFaqSetting)
				{
					let record = this.props.recordArr[0];
					obj.templateid = record.templateid;
				}
				this.props.addCompanyFaqItem(obj);
				if(this.state.searchFaqItem)
				{
					let getCurrentGroup = {
						groupId: gidForSearch,
						page: pageNumber,
						rp: "10"
					};
					this.props.getCompanyFaqItemList(getCurrentGroup);
					this.setState({searchFaqItem: false})
				}
			}
			this.setState({
				newfaq: false,
				editItem: false,
				changeGroup: false,
				changeStartTime: false,
				changeStopTime: false,
				disabledStopValue: null,
				disabledStartValue: null,
				startTime: 0,
				endTime: 0,
				endOpen: false
			})
		});
	}

	//取消新建常见问题
	handleClickNewFaqCancel()
	{
		this.setState({
			newfaq: false,
			editItem: false,
			newItemName: getLangTxt("setting_faq_add"),
			changeGroup: false,
			changeStartTime: false,
			changeStopTime: false,
			startTime: 0,
			disabledStopValue: null,
			disabledStartValue: null,
			endTime: 0,
			endOpen: false
		})
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

	//保存新建常见问题分组
	handleClickNewListConfirm()
	{
		let {form} = this.props,
			faqGroupName = this.props.form.getFieldValue("groupName")
			.trim(),
			{changeGroup, editGroup, editData, parentId} = this.state,
			{companyGroupData} = this.props;

		form.validateFields((errors) => {
			if(errors)
				return false;

			let obj = {
				"groupName": this.props.form.getFieldValue("groupName")
			};

			if(editGroup)
			{
				obj.groupId = editData.groupId;
				obj.preParentId = editData.parentId;
                obj.rank = editData.rank;

				if(changeGroup)
				{
					obj.parentId = parentId;
				}
				else
				{
					let loop = (data) => {
						data.map(item => {
							if(item.groupId === editData.groupId)
							{
								item.groupName = this.props.form.getFieldValue("groupName")
							}
							if(item.fastQuestionGroups)
							{
								loop(item.fastQuestionGroups)
							}
						})
					};

					loop(companyGroupData);

					obj.parentId = editData.parentId;
				}

				if(this.props.userFaqSetting)
				{
					let record = this.props.recordArr[0];
					obj.templateid = record.templateid;
					obj.groupId = editData.groupId;

					this.props.editCompanyFaqGroup(obj);
				}
				else
				{
					obj.groupId = editData.groupId;
					this.props.editCompanyFaqGroup(obj);
				}

			}
			else
			{
				let findParent = companyGroupData.find(item => item.groupId === this.state.parentId);

				if(this.state.parentId && findParent)
				{
					obj.parentId = parentId;
				}
				else
				{
					obj.parentId = "";
				}
				if(this.props.userFaqSetting)
				{
					let {recordArr} = this.props, templateids = [];
					if(recordArr)
					{
						recordArr.map((item) => {
							templateids.push(item.templateid);
						})
					}

					obj.templateid = templateids;
					this.props.addTemplateFaqGroup(obj);
				}
				else
				{
					this.props.addCompanyFaqGroup(obj);
				}
			}

			this.setState({newlist: false, editGroup: false});

		});
	}

	//取消新建常见问题分组
	handleClickNewListCancel()
	{
		this.props.form.setFieldsValue({"groupName": ""});
		this.setState({newlist: false, editGroup: false})
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

	//常见问题分组排序 type: -1向上； 1向下；
	handleRangeFaqGroup(type)
	{
		let {companyGroupData = []} = this.props,
			{groupIds = [], rangeCheckedParent} = this.state,
			copyCheckedKeys = [...groupIds],
			rangeGroupData = companyGroupData;

		if(rangeCheckedParent)
		{
			let group = companyGroupData.find(item => item.groupId === rangeCheckedParent) || {};
			rangeGroupData = group.fastQuestionGroups;
		}

		let rangeArray = upOrDown(rangeGroupData, copyCheckedKeys, "groupId", type);

		if(groupIds.length < 1 || rangeCheckedParent === null)
			return;

		if(rangeArray && rangeArray.length > 0)
			this.props.editCompanyFaqGroupRank(rangeArray);

		this.setState({
			rangeChanged: !this.state.rangeChanged
		});
	}

	//编辑常见问题分组
	editFaqGroup(data)
	{
		if(!data)
			return;

		this.props.form.setFieldsValue({"groupName": data.groupName});
		this.setState({editData: data, editGroup: true, newlist: true, newGroupName: getLangTxt("edit_group"), changeGroup: false})
	}

	//删除常见问题分组
	delFaqGroup(data, e)
	{
		e.stopPropagation();
		let obj = {
			"groupIds": [data.groupId]
		};
		if(this.state.parentId === data.groupId)
		{
			this.setState({parentId: ""})
		}
		if(this.state.groupIds && this.state.groupIds.length > 0)
		{
			// obj.groupIds = this.state.groupIds;
		}
		else
		{
			let currentGroup = {
				groupId: data.groupId,
				page: 1,
				rp: "10"
			};
			this.props.getCompanyFaqItemList(currentGroup);
			// obj.groupIds.push(data.groupId);
			this.setState({searchFaqItem: false, pageNumber: 1})
		}
		confirm({
			title: getLangTxt("del_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'warnTip',
			content: <div style={{lineHeight: "24px"}}>{getLangTxt("del_content")}</div>,
			onOk: () => {
				this.props.delCompanyFaqGroup(obj);
				this.props.clearFaqItem();
			},
			onCancel: () => {

			}
		});
	}

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
                                           onClick={this.editFaqGroup.bind(this, item)}
                                           style={{fontSize: '16px', cursor: 'pointer', marginRight: "8px"}}/>
                                    </Tooltip>
                                    <Tooltip placement="bottom" title={getLangTxt("del")}>
                                        <i className="iconfont icon-shanchu"
                                           onClick={this.delFaqGroup.bind(this, item)}
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
					<div style={{height: '100%', width: '100%', position: 'absolute', left: '0', top: '0'}}>
                        <Loading style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}/>
					</div>
					:
					<div style={{position: 'absolute', top: '0', left: '0', width: '100%', height: '100%'}}>
                        <Loading style={{
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

	savingErrorTips(msg, isGroup)
	{
		warning({
			title: getLangTxt("err_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'errorTip',
			okText: getLangTxt("sure"),
			content: msg,
			onOk: () => {
				if(isGroup)
				{
					let {userFaqSetting, recordArr} = this.props;
					if(userFaqSetting)
					{
						if(recordArr.length == 1)
						{
							let {recordArr} = this.props, obj;
							obj = {templateid: recordArr[0].templateid};

							this.props.getCompanyFaqGroupList(obj);

						}
						else
						{
							this.props.getTemalatesGroup();
						}
					}
					else
					{
						this.props.getCompanyFaqGroupList();
					}
				}
				else
				{
					let obj = {
						groupId: this.state.parentId,
						page: this.state.pageNumber || 1,
						rp: "10"
					};

					this.props.getCompanyFaqItemList(obj);
				}
			}
		});

	}

	//判断标题长度 100
	judgeTitleSpace(rule, value, callback)
	{
		if(value && value.trim() !== "" && bglen(value) <= 200)
		{
			callback();
		}
		callback(" ");
	}

	//判断是否输入空格 500
	judgeSpace(rule, value, callback)
	{
		if(value && value.trim() !== "" && bglen(value) <= 1000)
		{
			callback();
		}
		callback(" ");
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

	//常见问题条目排序 type: -1向上; 1向下;
	handleRangeFaqItem(type)
	{
		let {companyFaqItem = []} = this.props,
			{rangeRows = []} = this.state,
			copyCheckedKeys = [...rangeRows];
		companyFaqItem.sort((a, b) => a.rank - b.rank);

		let rangeArray = upOrDown(companyFaqItem, copyCheckedKeys, "itemId", type);

		if(rangeRows.length < 1)
			return;

		if(rangeArray && rangeArray.length > 0)
			this.props.editCompanyFaqItemRank(rangeArray);

		this.setState({
			rangeChanged: !this.state.rangeChanged
		});
	}

	render()
	{
		let _this = this, nowTimeStamp = Date.parse(new Date()), judgeOverDue;
		let faqNewList,
			startTimeToString = '',
			stopTimeToString = '',
			{editData, disabledStartValue, disabledStopValue, editItem, editItemData, changeStartTime, changeStopTime, changeGroup, endOpen, selectedRowKeys, searchFaqItem, isRangeItem} = this.state,
			faqGroupData;
		const {getFieldDecorator} = this.props.form,
			formItemLayout = {
				labelCol: {span: 4},
				wrapperCol: {span: 14}
			};
		let {progress, groupProgress, faqGroupErrorMsg = getLangTxt("20034"), faqItemErrorMsg = "", recordArr, userFaqSetting} = this.props;

		if(groupProgress && groupProgress.left === LoadProgressConst.SAVING_FAILED)
		{
			this.savingErrorTips(faqGroupErrorMsg, true)
		}
		else if(progress && progress.right === LoadProgressConst.DUPLICATE)
		{

			this.savingErrorTips(faqItemErrorMsg, false)
		}

		//获取分组数据
		faqGroupData = this.props.companyGroupData;

		//批量设置时分组数据处理
		if(userFaqSetting && recordArr.length > 1)
		{

		}

		//选择上级分组渲染

		let faqnewlistparent = [];

		if(faqGroupData)
		{
			let disabled = false;
			faqGroupData.map((item) => {
				let keyCount = Math.random();
				disabled = this.state.editGroup && editData && item.groupId === editData.groupId;
				faqnewlistparent.push(<TreeNode title={item.groupName} key={keyCount} value={item.groupId}
				                                disabled={disabled}></TreeNode>);
			});
            faqnewlistparent.push(<TreeNode title={getLangTxt("noData3")} value=" "></TreeNode>)
		}

		//新建常见问题页渲染
		if(editItem)
		{
			startTimeToString = getLocalTime(editItemData.startTime);
			stopTimeToString = getLocalTime(editItemData.stopTime)
		}

		faqGroupData && this.state.newfaq ? faqGroupData.map((item) => {
			let editAnswer = "";
			if(editItem && isJsonString(editItemData.answer))
			{
				let editAnswerJson = JSON.parse(editItemData.answer) || {};
				editAnswer = editAnswerJson.message || "";
			}
			else
			{
				editAnswer = editItemData.answer;
			}
			faqNewList = (
				<li style={{transition: "200ms"}}>
					<div className="faq-new-list sameMargin sameErrorStyle">
						<FormItem label={getLangTxt("title")}{...formItemLayout} hasFeedback>
							{getFieldDecorator('title', {
								initialValue: editItem ? editItemData.title : '',
								rules: [{required: true, validator: this.judgeTitleSpace.bind(this)}]
							})(
								<Input className="newFaqTitle" placeholder={getLangTxt("setting_faq_placeholder_title")}/>
							)}
						</FormItem>

						<div className="newfaq_content_check" style={{display: 'none'}}>
							<Checkbox.Group options={[item.groupName]}
							                style={{height: '30px', marginTop: "5px"}}/>
						</div>

						{/*<Icon onClick={this.handleClickFaqExpansion.bind(this)}
                         style={{position:'absolute',top:'5px',right:'20px',fontSize:'20px',cursor:'pointer',transform: "rotateZ(90deg)",transition:"200ms"}}
                         type="right-circle-o"/>*/}
					</div>

					<div className="datapick sameMargin">
						<FormItem
							{...formItemLayout}
							className="newFaqBeginTimeStyle"
							label={getLangTxt("effective_time")}
							hasFeedback>
							{getFieldDecorator('summaryStartTime', {
								initialValue: editItem && !changeStartTime ? moment(startTimeToString) : changeStartTime ? disabledStartValue : null
							})(
								<DatePicker
									style={{float: 'left'}}
									disabledDate={this.disabledStartDate.bind(this)}
									showTime
									showToday={false}
									format={dateFormat}
									onOpenChange={this.handleStartOpenChange.bind(this)}
									placeholder={getLangTxt("start_time")}
									onChange={this.newFaqStartTime.bind(this)}
									/*onOpenChange={this.handleStartOpenChange}*/
								/>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							className="newFaqBeginTimeStyle">
							{getFieldDecorator('summaryStopTime', {
								initialValue: editItem && !changeStopTime ? editItemData.stopTime == 0 ? "" : moment(stopTimeToString) : changeStopTime ? disabledStopValue : null
							})(
								<DatePicker
									style={{float: 'left'}}
									disabledDate={this.disabledEndDate.bind(this)}
									showTime
									showToday={false}
									format={dateFormat}
									onOpenChange={this.handleEndOpenChange.bind(this)}
									placeholder={getLangTxt("end_time")}
									open={endOpen}
									onChange={this.newFaqEndTime.bind(this)}
								/>
							)}
						</FormItem>
					</div>
					<FormItem{...formItemLayout} className="sameErrorStyle"
					         style={{marginBottom: "0", marginTop: "10px"}}
					         label={getLangTxt("setting_faq_group_parent")} hasFeedback>
						{getFieldDecorator('newFaqParentName', {
							initialValue: editItem && !changeGroup && editItemData.groupId ? editItemData.groupId : this.state.parentId,
							rules: [{
								required: true,
								message: ' '
							}]
						})(
							<TreeSelect
								style={{width: "100%"}}
								onSelect={_this.choiceItemUpperGroup.bind(_this)}
								treeDefaultExpandAll
                                treeNode={_this.loopUpperGroup(faqGroupData)}
                            />
						)}
					</FormItem>

					<div className="newFaqAnswer sameMargin">
						<FormItem
							label={getLangTxt("setting_faq_answer")}
							hasFeedback
							{...formItemLayout}
						>
							{getFieldDecorator('answer', {
								initialValue: editItem ? editAnswer : '',
								rules: [{required: true, validator: this.judgeSpace.bind(this)}]
							})(
								<Input
									/*onBlur={_this.getNewFaqAnswer.bind(this,_this)}*/
									style={{maxWidth: "454px", width: "100%", height: "134px", resize: "none"}}
									type="textarea" placeholder={getLangTxt("setting_faq_placeholder_answer")}/>
							)}

						</FormItem>
					</div>
				</li>
			)
		}) : null;
		//主页面渲染
		let styles = {
			icon: {marginLeft: '15px', fontSize: '12px', cursor: 'pointer'}
		};

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
			/*if (this.props.companyFaqItem)
			{
				faqItemData = this.props.companyFaqItem;
			}else
			{
				faqItemData = this.props.companyGroupData && this.props.companyGroupData.length>0 && this.props.companyGroupData[0].fastQuestionItems
			}*/
		}

		/*faqItemData && faqItemData[0] && (this.selectedKey.push(faqItemData[0].groupId));*/
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
                                    <i onClick={this.editFaqItem.bind(this, item)} className="iconfont icon-bianji"
                                       style={{cursor: 'pointer'}}/>
                                </Tooltip>
                            </span>
						<span style={{cursor: 'pointer', marginLeft: '18px'}}
						      onClick={_this.delFaqItem.bind(_this, item.itemId, item.groupId)}>
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

		let groupAvail = faqGroupData && faqGroupData.length == 0,
			importAvail = false;

		if(this.props.userFaqSetting)
		{
			importAvail = this.props.recordArr.length > 1;
		}

		/*pagination.total = this.props.faqCompanyItemCount || 0;*/

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
											<i className="iconfont icon-shangyi"
											   onClick={this.handleRangeFaqGroup.bind(this, -1)}/>
										</Tooltip>
										<Tooltip placement="bottom" title={getLangTxt("move_down")}>
											<i className="iconfont icon-xiayi"
											   onClick={this.handleRangeFaqGroup.bind(this, 1)}/>
										</Tooltip>
										<Tooltip placement="bottom" title={getLangTxt("add_group")}>
											<i className="iconfont icon-tianjia1"
											   style={{marginRight: '10px', fontSize: '12px', cursor: 'pointer'}}
											   onClick={this.handleClickNewList.bind(this)}/>
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
									<img src={require("./image/faqGroupClose.png")} className="faq-setting-button"
									     onClick={this.changeClick.bind(this)}/>
								</div>
							</div>
							:
							<img src={require("./image/faqGroupOpen.png")}
							     className="faq-setting-button faq-setting-button-open"
							     onClick={this.changeClick.bind(this)}/>
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
							<Button type="primary" className="faqSearchBtn" onClick={this.getSearchQuestion.bind(this)}
							        icon="search"/>
						</div>

						<div className="right_title_btn">
							{groupAvail ?
								<Button disabled>{getLangTxt("setting_faq_add")}</Button> :
								<Button type="primary"
								        onClick={this.handleClickNewFaq.bind(this)}>{getLangTxt("setting_faq_add")}</Button>}
							<Button type="primary"
							        onClick={this.downLoadModule.bind(this)}>{getLangTxt("down_templete")}</Button>
							{importAvail ?
								<Button disabled>{getLangTxt("import")}</Button> :
								<Button type="primary"
								        onClick={this.handleClickOutput.bind(this)}>{getLangTxt("import")}</Button>}
							{groupAvail ?
								<Button disabled>{getLangTxt("export")}</Button> :
								<Button type="primary"
								        onClick={this.exportFaq.bind(this)}>{getLangTxt("export")}</Button>}
							{
								isRangeItem ?
									<Tooltip placement="bottom" title={getLangTxt("move_up")}>
										<Button type="primary" onClick={this.handleRangeFaqItem.bind(this, -1)}>
											<i className="iconfont icon-shangyi rangeBtn"/>
										</Button>
									</Tooltip>
									:
									null
							}
							{
								isRangeItem ?
									<Tooltip placement="bottom" title={getLangTxt("move_down")}>
										<Button type="primary" onClick={this.handleRangeFaqItem.bind(this, 1)}>
											<i className="iconfont icon-xiayi rangeBtn"/>
										</Button>
									</Tooltip>
									:
									null
							}
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
                        {this._getProgressComp(progress, 'la-square-jelly-box_accountList')}
					</div>
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

				<Modal visible={this.state.outputvisible} title={getLangTxt("import")} className="leadingInModel"
				         onCancel={this.handleClickOutputVisibleCancel.bind(this)}
				         footer={[
					         <Button key="back" style={{marginRight: "8px"}} type="ghost" size="large"
					                 onClick={this.handleClickOutputVisibleCancel.bind(this)}>{getLangTxt("cancel")}</Button>,
					         <Upload showUploadList={false} key="submit" {...props}
					                 onChange={this.onSelectFile.bind(this)}>
						         <Button key="submitButton" type="primary" size="large"
						                 onClick={this.handleClickOutputVisibleConfirm.bind(this)}>{getLangTxt("import")}</Button>
					         </Upload>
				         ]}>
					<p>{getLangTxt("setting_import_note1")}</p>
					<p>{getLangTxt("setting_import_note2")}</p>
					<p>{getLangTxt("setting_import_note3")}</p>
					<p>{getLangTxt("setting_import_note4")}</p>
					<p>{getLangTxt("setting_import_note5")}</p>
				</Modal>

				{
					this.state.newfaq ?
						<Modal className="newfaq_alert_edit"
						         visible={true}
						         title={this.state.editItem ? getLangTxt("setting_faq_edit") : getLangTxt("setting_faq_add")}
						         onCancel={this.handleClickNewFaqCancel.bind(this)}
						         footer={[
							         <Button key="back" type="ghost" size="large"
							                 onClick={this.handleClickNewFaqCancel.bind(this)}>{getLangTxt("cancel")}</Button>,
							         <Button key="submit" type="primary" size="large"
							                 onClick={this.handleClickNewFaqConfirm.bind(this)}>{getLangTxt("sure")}</Button>
						         ]}
						>
							<ScrollArea speed={1} className="area" contentClassName="GoodList" horizontal={false}
							            smoothScrolling
							            style={{height: "100%"}}>
								<Form>
									<ul className="newfaq_content">{faqNewList}</ul>
								</Form>
							</ScrollArea>
						</Modal> : null
				}

				{
					this.state.newlist ?
						<Modal className="newfaq_alert_group" visible={true} title={this.state.newGroupName}
						         onCancel={this.handleClickNewListCancel.bind(this)} footer={[
							<Button key="back" type="ghost" size="large"
							        onClick={this.handleClickNewListCancel.bind(this)}>{getLangTxt("cancel")}</Button>,
							<Button key="submit" type="primary" size="large"
							        onClick={this.handleClickNewListConfirm.bind(this)}>{getLangTxt("save")}</Button>
						]}>

							<ScrollArea speed={1} className="area" contentClassName="GoodList" horizontal={false}
							            smoothScrolling
							            style={{height: "100%", padding: '16px 0'}}>
								{/*<Button type="primary">{this.state.newGroupName}</Button>*/}
								<Form>
									<FormItem
										{...formItemLayout}
										label={getLangTxt("setting_faq_group_name")}
									>
										{
											getFieldDecorator('groupName', {
												initialValue: this.state.editGroup ? editData.groupName : "",
												rules: [{required: true, validator: this.judgeTitleSpace.bind(this)}]
											})(
												<Input style={{width: '100%', height: '32px'}}/>
											)}
									</FormItem>
									<FormItem
										{...formItemLayout}
										label={getLangTxt("setting_faq_group_parent")}
									>
										{
											getFieldDecorator('parentGroup', {
												initialValue: this.state.editGroup
													?
													editData.parentId
													:
													this.state.firstLevel
														?
														this.state.parentId
														:
														""
											})(
												<TreeSelect
													disabled={this.state.editGroup && editData.fastQuestionGroups && editData.fastQuestionGroups.length > 0}
													size="large" style={{width: "100%"}}
													onSelect={_this.choiceUpperGroup.bind(_this)}
													treeDefaultExpandAll
                                                    treeNode={faqnewlistparent}
												/>
											)
										}
									</FormItem>
								</Form>
							</ScrollArea>
						</Modal> : null
				}
			</div>
		)
	}
}

FaqSettingCommon = Form.create()(FaqSettingCommon);

function mapStateToProps(state)
{
	console.log("FaqSettingCommon companyGroupData = ", state.getFaqCompanyGroup.data);

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
		addCompanyFaqGroup,
		addTemplateFaqGroup,
		editCompanyFaqGroup,
		delCompanyFaqGroup,
		getCompanyFaqGroupList,
		getTemalatesGroup,
		addCompanyFaqItem,
		editCompanyFaqItem,
		delCompanyFaqItem,
		getCompanyFaqItemList,
		getCompanySearchFaqData,
		getAllCompanyFaqItemData,
		importFaqData,
		clearFaqItem,
		editCompanyFaqGroupRank,
		editCompanyFaqItemRank
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(FaqSettingCommon));
