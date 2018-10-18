import {
	GET_SUMMARY_ALL,
    GET_SUMMARY_ALL_ITEMS,
	ADD_SUMMARY_TYPE,
	EDIT_SUMMARY_TYPE,
	REMOVE_SUMMARY_TYPE,
	GET_SUMMARY_LEAF,
	ADD_SUMMARY_LEAF,
	EDIT_SUMMARY_LEAF,
	REMOVE_SUMMARY_LEAF,
	GET_SUMMARY_LEAF_SEARCH,
	GET_CHATSUMMARY_ALL,
    EDIT_SUMMARY_TYPE_RANK,
	GET_COMMONSUMMARY,
    IS_SET_COMMON_OK,
    CLEAR_SET_COMMON_MSG,
    EDIT_SUMMARY_LEAF_RANK,
    IMPORT_SUMMARY
} from '../../../../model/vo/actionTypes';
import {by} from "../../../../utils/MyUtil";

let chatSummaryAll=[], summaryTypeTree = [],
    summaryLeafList = [],
    summaryLeafListCount = 0, commonSummaryList, summaryGroupErrorMsg = "", summaryItemErrorMsg = "", isCommonOk = true;

export default function summaryReducer(state = {}, action)
{
	let summaryAll = {
		"summaryid": "",
		"type": 1,
		"rank": 1,
		"isCommon": false,
		"content": "根目录"
	};
	let rootid = "",
		groupProgress,
		progress;

	switch(action.type)
	{
		case GET_CHATSUMMARY_ALL:
			if(action.result && action.result.success)
			{
				chatSummaryAll = action.result.data || [];
				rootid = summaryAll.summaryid;

				let loopGroup = data => data.map(summary =>
				{
					let {children} = summary;
					summary.label = summary.content;
					summary.key = summary.summaryid;
					summary.value = summary.summaryid;

					if(children && children.length > 0)
					{
						summary.disabled = true;
						loopGroup(children);
					}
					else if(children && children.length === 0 || !children)
					{
						summary.allable = true;
						delete summary.children;
					}
				});
				
				loopGroup(chatSummaryAll);
			}

			groupProgress = changeProgress(action);

			return {
				...state,
				chatSummaryAll,
				rootid,
				groupProgress
			};

		case GET_SUMMARY_ALL:

			if(action.result && action.result.success)
			{
				summaryTypeTree = action.result.data || [];
				rootid = summaryAll.summaryid;

				let loopGroup = data => data.map((summary,index) =>
				{
					let {children} = summary;
					summary.label = summary.content;
					summary.key = summary.summaryid;
					summary.value = summary.summaryid;

					if(children && children.length > 0)
					{
						summary.disabled = true;
                        children.sort(by("rank"));
                        loopGroup(children);
					}
					else if(children && children.length === 0 || !children)
					{
						summary.allable = true;
						delete summary.children;
					}
				});
                summaryTypeTree.sort(by("rank"));
                loopGroup(summaryTypeTree);
			}

			groupProgress = changeProgress(action);

			return {
				...state,
				summaryTypeTree,
				rootid,
				groupProgress
			};

		case GET_COMMONSUMMARY:

			if(action.result && action.result.success)
			{
				commonSummaryList = action.result.data || [];
			}

			groupProgress = changeProgress(action);

			return {
				...state,
				commonSummaryList,
				groupProgress
			};

        case ADD_SUMMARY_TYPE:

			if(action.result && action.result.success)
			{
				let addSummaryType = action.result.data;

				addSummaryType.label = addSummaryType.content;
				addSummaryType.value = addSummaryType.key = addSummaryType.summaryid;
				addSummaryType.allable = true;
				addSummaryType.disabled = false;

				let loop = data => data.forEach((summary) =>
				{
					let {summaryid, children} = summary;

					if(addSummaryType.parentid === summaryid)
					{
						summary.disabled = true;
						if(children)
						{
							summary.children.push(addSummaryType);
						}
						else
						{
							summary.children = [addSummaryType];
						}
					}

					if(children && children.length > 0)
					{
						summary.disabled = true;
					}
					else
					{
						summary.allable = true;
					}

					if(children)
					{
						loop(children, summaryid);
					}
				});

				if(!addSummaryType.parentid)
				{
					summaryTypeTree.push(addSummaryType);
				}
				else
				{
					loop(summaryTypeTree);
				}
                summaryTypeTree.sort(by("rank"));
			}else if (action.result && !action.result.success)
            {
                summaryGroupErrorMsg = action.result.msg;
            }

			groupProgress = changeProgress(action);

			return {
                ...state,
				summaryTypeTree,
                summaryGroupErrorMsg,
				groupProgress
			};

		case EDIT_SUMMARY_TYPE:

			if(action && action.success)
			{
                let changeItem = [],
                loop = function(tableData)
                {
                    tableData.map(function(item, index)
                    {
                        if(item.summaryid == action.result.data.summaryid)
                        {
                            item.label = action.result.data.content;
                            item.content = action.result.data.content;
                            item.parentid  = action.result.data.parentid ;
                            changeItem = item;

                            if(action.result.data.oldParentid != undefined && action.result.data.oldParentid != action.result.data.parentid)
                            {
                                tableData.splice(index, 1);

                                if (action.result.data.parentid === "")
                                {
                                    summaryTypeTree.push(changeItem);
                                }else
                                {
                                    let pidChange = function(tableData)
                                    {
                                        tableData.map(function(item)
                                        {
                                            if(item.summaryid == action.result.data.parentid)
                                            {
                                                if(item.children)
                                                {
                                                    item.children.push(changeItem);
                                                }
                                                else
                                                {
                                                    item.children = [];
                                                    item.children.push(changeItem);
                                                }
                                            }
                                            else if(item.children)
                                            {
                                                pidChange(item.children)
                                            }
                                        });
                                    };
                                    pidChange(summaryTypeTree);
                                }
                            }
                        }
                        else if(item.children)
                        {
                            loop(item.children)
                        }
                    });
                };
                loop(summaryTypeTree);
                summaryTypeTree.sort(by("rank"));
			}else if (action && !action.success)
            {
                summaryGroupErrorMsg = action.result && action.result.msg;
            }

			groupProgress = changeProgress(action);

			return {
                ...state,
				summaryTypeTree: [...summaryTypeTree],
                summaryGroupErrorMsg,
				groupProgress
			};

        case EDIT_SUMMARY_TYPE_RANK:
            if (action && action.success){
                summaryTypeTree.sort(by("rank"));
                summaryLeafList.sort(by("rank"));
            }

            return {
                summaryTypeTree,
                summaryLeafList,
                summaryLeafListCount,
                groupProgress
            };

		case REMOVE_SUMMARY_TYPE:

			if(action && action.success)
			{
				const deleteSummaryTypeId = action.data.summaryid;
				let deleteloop = function(summaryTypeTree)
				{
					summaryTypeTree.map(function(summary, index)
					{
						if(summary.summaryid === deleteSummaryTypeId)
						{
							summaryTypeTree.splice(index, 1)
						}
						if(summary.children)
						{
							deleteloop(summary.children)
						}
					});
				};
				deleteloop(summaryTypeTree);
                summaryTypeTree.sort(by("rank"));
			}

			groupProgress = changeProgress(action);

			return {
                ...state,
				summaryTypeTree,
				groupProgress
			};
		case GET_SUMMARY_LEAF :

			if(action && action.success)
			{
				summaryLeafList = action.data || [];
                summaryLeafList.map(leafItem =>
				{
					let loop = data => data.map(groupItem =>
					{
						if(leafItem.parentid == groupItem.summaryid)
						{
							leafItem.allSummaryType = groupItem.content
						}
						if(groupItem.children)
						{
							loop(groupItem.children);
						}
					});
					loop(summaryTypeTree);
				});
                summaryLeafListCount = action.count;
                summaryLeafList.sort(by("rank"));
			}

			progress = changeProgress(action);
            summaryItemErrorMsg = "";
			return {
				...state,
				summaryLeafList,
                summaryLeafListCount,
                summaryItemErrorMsg,
				progress
			};

		case GET_SUMMARY_LEAF_SEARCH :

            if (action.result && action.result.success)
            {
                summaryLeafList = action.result.data || [];
                summaryLeafList.map(leafItem =>
                {
                    let loop = data => data.map(groupItem =>
                    {
                        if(leafItem.parentid == groupItem.summaryid)
                        {
                            leafItem.allSummaryType = groupItem.content
                        }
                        if(groupItem.children)
                        {
                            loop(groupItem.children);
                        }
                    });
                    loop(summaryTypeTree);
                });
                summaryLeafListCount = action.result.count || 0;
                summaryLeafList.sort(by("rank"));
            }

			return {
				...state,
				summaryLeafList,
                summaryLeafListCount,
				progress
			};

        case IS_SET_COMMON_OK :

            isCommonOk = action.result && action.result.success;

            return {
                ...state,
                isCommonOk
            };

        case CLEAR_SET_COMMON_MSG :
            isCommonOk = true;
            return {
                ...state,
                isCommonOk
            };

        case ADD_SUMMARY_LEAF:

			if(action.result && action.result.success)
			{
				let addSummaryLeaf = action.result.data;
				addSummaryLeaf.disabled = false;
				let loop = data => data.map(groupItem =>
				{
					if(addSummaryLeaf.parentid == groupItem.summaryid)
					{
						addSummaryLeaf.allSummaryType = groupItem.content
					}
					if(groupItem.children)
					{
						loop(groupItem.children);
					}
				});

				loop(summaryTypeTree);

				summaryLeafList.push(addSummaryLeaf);
                summaryLeafListCount = summaryLeafList.length;
                summaryLeafList.sort(by("rank"));
			}else if (action.result && !action.result.success)
            {
                summaryItemErrorMsg = action.result.msg;
            }

			progress = changeProgress(action);

			return {
				...state,
				summaryLeafList,
                summaryLeafListCount,
                summaryItemErrorMsg,
				progress
			};

		case EDIT_SUMMARY_LEAF:

			if(action && action.success)
			{
				let editSummaryLeaf = action.data,
					editParentid = editSummaryLeaf.parentid,
					editOldParentid = editSummaryLeaf.oldParentid;

				if(editOldParentid === editParentid)
				{

					summaryLeafList.map(item =>
					{
						if(item.summaryid === editSummaryLeaf.summaryid)
						{
							item.content = editSummaryLeaf.content;
							item.type = editSummaryLeaf.type;
							item.isCommon = editSummaryLeaf.isCommon;
							item.startTime = editSummaryLeaf.startTime;
							item.stopTime = editSummaryLeaf.stopTime;
						}
					});
				}
				else
				{
					let loop = data => data.map(groupItem =>
					{
						if(editParentid == groupItem.summaryid)
						{
							editSummaryLeaf.allSummaryType = groupItem.content
						}
						if(groupItem.children)
						{
							loop(groupItem.children);
						}
					});

					loop(summaryTypeTree);
					summaryLeafList.push(editSummaryLeaf);
				}
                summaryLeafList.sort(by("rank"));
			}else
            {
                summaryItemErrorMsg = action && action.msg
            }

			progress = changeProgress(action);

			return {
				...state,
				summaryLeafList,
                summaryItemErrorMsg,
				progress
			};

        case EDIT_SUMMARY_LEAF_RANK:

			if(action && action.success)
			{
			}else
            {
                summaryItemErrorMsg = action && action.msg
            }

			progress = changeProgress(action);

			return {
				...state,
				summaryLeafList,
                summaryItemErrorMsg,
				progress
			};

		case REMOVE_SUMMARY_LEAF:

			if(action && action.success)
			{

				let removeSummaryLeaf = action.data.summaryid;

				summaryLeafList.map((item, i) =>
				{
					if(item.summaryid === removeSummaryLeaf)
					{
						summaryLeafList.splice(i, 1);

					}
				});
                summaryLeafListCount -= 1;
                summaryLeafList.sort(by("rank"));
			}

			progress = changeProgress(action);

			return {
				...state,
				summaryLeafList,
                summaryLeafListCount,
				progress
			};

        case IMPORT_SUMMARY:

			if(action && action.success)
			{

				let removeSummaryLeaf = action.data.summaryid;

				summaryLeafList.map((item, i) =>
				{
					if(item.summaryid === removeSummaryLeaf)
					{
						summaryLeafList.splice(i, 1);

					}
				});
                summaryLeafListCount -= 1;
                summaryLeafList.sort(by("rank"));
			}

			progress = changeProgress(action);

			return {
				...state,
				summaryLeafList,
                summaryLeafListCount,
				progress
			};



		default:
			return {
				...state
			}
	}
}

function changeProgress(action)
{
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
