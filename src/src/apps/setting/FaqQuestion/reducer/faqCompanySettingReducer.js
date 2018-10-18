import {
	ADD_COMPANY_FAQGROUP,
	ADD_TEMPLATE_FAQGROUP,
	EDIT_COMPANY_FAQGROUP,
	DEL_COMPANY_FAQGROUP,
	GET_COMPANY_FAQGROUP_LIST,
	GET_TEMPLATES_GROUP_LIST,
	ADD_COMPANY_FAQITEM,
	EDIT_COMPANY_FAQITEM,
	DEL_COMPANY_FAQITEM,
	GET_COMPANY_FAQITEM_LIST,
	GET_COMPANY_SEARCH_COMPANY_DATA,
	GET_ALL_COMPANY_FAQ_ITEM_DATA,
	IMPORT_FAQ_QUESTION,
	CLEAR_FAQ_ITEM_DATA,
	EDIT_COMPANY_FAQGROUP_RANK,
	EDIT_COMPANY_FAQITEM_RANK
} from '../../../../model/vo/actionTypes';
import { by } from "../../../../utils/MyUtil";

let FaqCompanyGroup = [], FaqCompanyItem = [], obj = {}, loop, groupProgress, progress, faqItemCount = 0,
	faqGroupErrorMsg = "", faqItemErrorMsg = "";

//企业常见问题分组
export function getFaqCompanyGroup(state = {}, action)
{
	switch(action.type)
	{
//批量获取用户群下常见问题组
		case GET_TEMPLATES_GROUP_LIST:
			if(action.result)
			{
				FaqCompanyGroup = action.result;
			}

			FaqCompanyGroup.sort(by('rank'));

			FaqCompanyGroup.forEach(item => {
				if(item.fastQuestionGroups && item.fastQuestionGroups.length > 0)
				{
					item.fastQuestionGroups.sort(by('rank'))
				}
			});

			groupProgress = changeProgress(action);

			return {
				data: [...FaqCompanyGroup],
				groupProgress
			};

//获取企业常见问题分组
		case GET_COMPANY_FAQGROUP_LIST:

			if(action.result && action.result.success)
			{
				FaqCompanyGroup = action.result.data;
				loop = function(tableData) {
					tableData ?
						tableData.map(function(item) {
							if(item)
							{
								item.label = item.groupName;
								if(item.fastQuestionGroups && item.fastQuestionGroups.length > 0)
								{
									item.fastQuestionGroups.sort(by('rank'));
									loop(item.fastQuestionGroups)
								}
								else
								{
									delete item.fastQuestionGroups
								}
							}
						}) : null;
				};
				loop(FaqCompanyGroup);
				FaqCompanyGroup.sort(by('rank'));
			}

			groupProgress = changeProgress(action);

			return {
				data: [...FaqCompanyGroup],
				groupProgress
			};

//创建企业常见问题分组
		case ADD_COMPANY_FAQGROUP:

			if(action.result && action.result.success)
			{
				if(action.result.data)
				{
					let {groupId, parentId} = action.result.data,
						item = FaqCompanyGroup.find(value => value.groupId === parentId);

					if(item)
					{
                        if(item.fastQuestionGroups && item.fastQuestionGroups.length)
                        {
                            item.fastQuestionGroups.push(action.result.data)
                        }else
                        {
                            item.fastQuestionGroups = [action.result.data]
                        }
					}else
                    {
                        FaqCompanyGroup.push(action.result.data)
                    }
				}

				FaqCompanyGroup.sort(by('rank'));
			}
			else if(action.result && !action.result.success)
			{
				faqGroupErrorMsg = action.result.msg;
			}

			groupProgress = changeProgress(action);

			return {
				data: [...FaqCompanyGroup],
				faqGroupErrorMsg,
				groupProgress
			};
//添加用户群分组
		case ADD_TEMPLATE_FAQGROUP:

			if(action.result && action.result.success)
			{
				let actionData = action.result.data;
				if(actionData.length == 1)
				{
					loop = function(tableData) {
						if(!actionData[0].parentId)
						{
							tableData.push(actionData[0]);
						}
						else
						{
							tableData ?
								tableData.map(function(item) {
									if(item.groupId === actionData[0].parentId)
									{
										if(item.fastQuestionGroups)
										{
											item.fastQuestionGroups.push(actionData[0]);
										}
										else
										{
											item.fastQuestionGroups = [];
											item.fastQuestionGroups.push(actionData[0]);
										}
									}
									else if(item.fastQuestionGroups)
									{
										loop(item.fastQuestionGroups)
									}
								}) : null;
						}
					};
					loop(FaqCompanyGroup);
				}
				else
				{
					actionData.map((item, index) => {
						item.label = item.groupName;
						item.rank = index + 1;
						FaqCompanyGroup.push(item);
					});
				}
				FaqCompanyGroup.sort(by('rank'));
			}
			else if(action.result && !action.result.success)
			{
				faqGroupErrorMsg = action.result.msg;
			}

			groupProgress = changeProgress(action);

			return {
				data: [...FaqCompanyGroup],
				faqGroupErrorMsg,
				groupProgress
			};

//企业常见问题分组排序
		case EDIT_COMPANY_FAQGROUP_RANK:

			if(action.success)
			{
				FaqCompanyGroup.sort(by("rank"))
			}
			else
			{
				faqGroupErrorMsg = action.msg;
			}
			groupProgress = changeProgress(action);
			return {
				data: [...FaqCompanyGroup],
				faqGroupErrorMsg,
				groupProgress
			};
//编辑企业常见问题分组
		case EDIT_COMPANY_FAQGROUP:

			let {data, success, msg = ""} = action;

			if(FaqCompanyGroup && data && success)
			{
				update(data);
			}
			else
			{
				faqGroupErrorMsg = msg;
			}

			groupProgress = changeProgress(action);

            FaqCompanyGroup.sort(by("rank"))

			return {
				data: [...FaqCompanyGroup],
				faqGroupErrorMsg,
				groupProgress
			};

//删除企业常见问题分组
		case DEL_COMPANY_FAQGROUP:

			if(action.success)
			{
				loop = function(tableData) {
					tableData ?
						tableData.map(function(item, index) {
							if(item.groupId == action.data.groupIds[0])
							{
								tableData.splice(index, 1)
							}
							else if(item.fastQuestionGroups)
							{
								loop(item.fastQuestionGroups)
							}
						}) : null;
				};
				loop(FaqCompanyGroup);
			}

			groupProgress = changeProgress(action);

			return {
				data: [...FaqCompanyGroup],
				groupProgress
			};

		case IMPORT_FAQ_QUESTION :
			if(action.result && action.result.success)
			{

				let actionData = action.result.data;

				for(var i = 0; i < actionData.length; i++)
				{

					if(actionData[i].fastQuestionGroups.length == 0)
					{
						delete actionData[i].fastQuestionGroups;
					}

					delete actionData[i].fastResponses;

					FaqCompanyGroup.push(actionData[i]);
				}
			}

			return {
				data: [...FaqCompanyGroup],
				groupProgress
			};

		default:
			return state;
	}
}

function update(data)
{
	FaqCompanyGroup.forEach(item => {
		if(data.preParentId === "" && data.preParentId != data.parentId)
		{
			FaqCompanyGroup.forEach((faq, index) => {
				if(faq.groupId === data.groupId)
				{
					FaqCompanyGroup.splice(index, 1);
				}
			})
		}
		if(data.preParentId === item.groupId)
		{
			item.fastQuestionGroups.forEach((faq, index) => {
				if(faq.groupId === data.groupId)
				{
					item.fastQuestionGroups.splice(index, 1);
				}
			})
		}

		if(data.parentId === item.groupId)
		{
			if(item.fastQuestionGroups)
			{
				item.fastQuestionGroups.push(data);
			}
			else
			{
				item.fastQuestionGroups = [data];
			}
		}
	});

	if(data.parentId === "" && data.parentId !== data.preParentId)
	{
		FaqCompanyGroup.push(data);
	}

}

//企业常见问题列表
export function getFaqCompanyItem(state = {}, action)
{

	switch(action.type)
	{
//清空条目列表
		case CLEAR_FAQ_ITEM_DATA:
			FaqCompanyItem = [];
			return {
				data: [...FaqCompanyItem]
			};
//搜索常见问题
		case GET_COMPANY_SEARCH_COMPANY_DATA:
			if(action.result && action.result.success)
			{
				FaqCompanyItem = action.result.data.fastQuestionItemList;
				faqItemCount = action.result.data.count;
				FaqCompanyItem.sort(by("rank"));
			}

			progress = changeProgress(action);

			return {
				data: [...FaqCompanyItem],
				faqItemCount,
				progress
			};

//获取企业常见问题列表
		case GET_COMPANY_FAQITEM_LIST:
			if(action.result && action.result.success)
			{
				FaqCompanyItem = action.result.data.group && action.result.data.group.fastQuestionItems;
				faqItemCount = action.result.data.count;

				FaqCompanyItem.sort(by("rank"));
			}

			progress = changeProgress(action);

			return {
				data: [...FaqCompanyItem],
				faqItemCount,
				progress
			};

//创建企业常见问题

		case ADD_COMPANY_FAQITEM:

			if(action.result && action.result.success)
			{
				let actionData = action.result.data;
				actionData.map(item => {
					FaqCompanyItem.push(item);
					faqItemCount += 1;
				});
				FaqCompanyItem.sort(by("rank"));
			}
			else if(action.result && !action.result.success)
			{
				faqItemErrorMsg = action.result.msg;
			}

			progress = changeProgress(action);

			return {
				data: [...FaqCompanyItem],
				faqItemCount,
				faqItemErrorMsg,
				progress
			};

//编辑企业常见问题
		case EDIT_COMPANY_FAQITEM:
			if(action && action.success)
			{
				let oldGid = action.data.oldGid,
					gid = action.data.groupId;

				if(oldGid == gid)
				{
					FaqCompanyItem ? FaqCompanyItem.map((item) => {
						if(item.itemId == action.data.itemId)
						{
							item.title = action.data.title;
							item.answer = action.data.answer;
							item.startTime = action.data.startTime;
							item.stopTime = action.data.stopTime;
							item.groupId = action.data.groupId;
							item.rank = action.data.rank;
						}
					}) : null;
				}
				else
				{
					FaqCompanyItem.push(action.data);
				}
				FaqCompanyItem.sort(by("rank"));
			}
			else
			{
				if(action.right === 7)
				{
					faqItemErrorMsg = "该常见问题已存在"
				}
			}

			progress = changeProgress(action);

			return {
				data: [...FaqCompanyItem],
				faqItemErrorMsg,
				faqItemCount,
				progress
			};
//编辑企业常见问题项排序
		case EDIT_COMPANY_FAQITEM_RANK:

			if(action && action.success)
			{
				FaqCompanyItem.sort(by("rank"));
			}
			else
			{
				faqItemErrorMsg = "数据保存失败";
			}

			progress = changeProgress(action);

			return {
				data: [...FaqCompanyItem],
				faqItemErrorMsg,
				faqItemCount,
				progress
			};

//删除企业常见问题
		case DEL_COMPANY_FAQITEM:

			if(action && action.success)
			{
				FaqCompanyItem ? FaqCompanyItem.map((item, index) => {
					action.data.itemIds ? action.data.itemIds.map((itemId) => {
						if(item && item.itemId === itemId)
						{
							FaqCompanyItem.splice(index, 1);
							faqItemCount -= 1;
						}
					}) : null;
					item.rank = index + 1
				}) : null;
				FaqCompanyItem ? FaqCompanyItem.map((item, index) => {
					item.rank = index + 1;
				}) : null;
			}

			progress = changeProgress(action);

			return {
				data: [...FaqCompanyItem],
				faqItemCount,
				progress
			};

		case GET_ALL_COMPANY_FAQ_ITEM_DATA:

			progress = changeProgress(action);

			return {
				data: [...FaqCompanyItem],
				faqItemCount: action.data.count,
				progress
			};

		default:
			return state;
	}
}

function changeProgress(action)
{

	console.log("changeProgress action = " + action.left + ", right = " + action.right);

	let progress = {};
	if(action.hasOwnProperty("left"))
	{
		progress["left"] = action.left;
	}
	else if(action.hasOwnProperty("right"))
	{
		progress["right"] = action.right;
	}

	return progress;
}
