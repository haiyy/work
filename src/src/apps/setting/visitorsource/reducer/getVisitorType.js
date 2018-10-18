import {
	GET_VISITORDATA, GET_NEW_VISITOR_TYPE, GET_EDITOR_VISITOR_TYPE, REMOVE_VISITOR_TYPE,
	GET_VISITOR, GET_NEW_VISITOR, GET_EDITOR_VISITOR, REMOVE_VISITOR, CLEAR_VISITOR_PROGRESS, CLEAR_VISITOR_ITEM_PROGRESS
} from '../../../../model/vo/actionTypes';
import LogUtil from "../../../../lib/utils/LogUtil";
import LoadProgressConst from "../../../../model/vo/LoadProgressConst";
let VisitorType = [], Visitor = [], obj = {}, loop, groupErrorMsg = "";
export function getVisitorType(state = {}, action)
{
	let groupProgress;
	switch(action.type)
	{
		case GET_VISITORDATA:

			if(action.result && action.result.success)
			{
				loop = function(tableData)
				{
					tableData ?
						tableData.map(function(item)
						{
							if(item)
							{
								item.key = item.source_type_id;
								item.label = item.typename;
								item.value = item.source_type_id;
								if(item.children && item.children.length > 0)
								{
									loop(item.children)
								}
								else
								{
									delete item.children
								}
							}
						}) : null;
				};
				loop(action.result.data);

				VisitorType = action.result.data;
			}

			groupProgress = changeProgress(action);

			return {
				data: VisitorType,
				groupProgress
			};
		case GET_NEW_VISITOR_TYPE:
			if(action.result && action.result.success)
			{
				let actionData = action.result.data;
				obj = {
					key: actionData.source_type_id,
					label: actionData.typename,
					pid: actionData.pid,
					source_type_id: actionData.source_type_id,
					siteid: actionData.siteid,
					typename: actionData.typename,
					value: actionData.source_type_id,
					typeexplain: actionData.typeexplain,
                    sys: 2
				};
				if(actionData.pid == 0)
				{
					VisitorType.push(obj);
				}
				else
				{
					loop = function(tableData)
					{
						tableData ?
							tableData.map(function(item)
							{
								if(item.source_type_id == action.result.data.pid)
								{
									if(item.children)
									{
										item.children.push(obj);
									}
									else
									{
										item.children = [];
										item.children.push(obj);
									}
								}
								else if(item.children)
								{
									loop(item.children)
								}
							}) : null;
					};
				}
				loop(VisitorType);
			}else
            {
                groupErrorMsg = action.result && action.result.msg;
            }
			groupProgress = changeProgress(action);
			return {
				data: [...VisitorType],
				groupProgress,
                groupErrorMsg
			};
		case GET_EDITOR_VISITOR_TYPE:
			if(action && action.success)
			{
				let changeItem = [];
				loop = function(tableData)
				{
					tableData.map(function(item, index)
					{
						if(item.source_type_id == action.data.source_type_id)
						{
							item.label = action.data.typename;
							item.pid = action.data.pid;
							item.siteid = action.data.siteid;
							item.typename = action.data.typename;
							item.typeexplain = action.data.typeexplain;
							changeItem = item;
							if(action.data.ownId != action.data.pid)
							{
								tableData.splice(index, 1);
                                if (action.data.pid === "0")
                                {
                                    VisitorType.push(changeItem)
                                }else
                                {
                                    let pidChange = function(tableData)
                                    {
                                        tableData.map(function(item)
                                        {
                                            if(item.source_type_id == action.data.pid)
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
                                    pidChange(VisitorType)
                                }

							}
						}
						else if(item.children)
						{
							loop(item.children)
						}
					});
				};
				loop(VisitorType);
			}else
            {
                groupErrorMsg = action.result && action.result.msg;
            }
			groupProgress = changeProgress(action);
			return {
				data: [...VisitorType],
				groupProgress,
                groupErrorMsg
			};
		case REMOVE_VISITOR_TYPE:
			if(action && action.success)
			{
				loop = function(tableData)
				{
					tableData ?
						tableData.map(function(item, index)
						{
							if(item.source_type_id == action.data.source_type_id)
							{
								tableData.splice(index, 1)
							}
							else if(item.children)
							{
								loop(item.children)
							}
						}) : null;
				};
				loop(VisitorType);
			}
			groupProgress = changeProgress(action);
			return {
				data: [...VisitorType],
				groupProgress
			};
        case CLEAR_VISITOR_PROGRESS:
            groupProgress = changeProgress(action);
            groupErrorMsg = "";
            return {
                ...state,
                groupProgress
            };
		default:
			return state;
	}
}
export function getVisitor(state = {}, action)
{
	let progress, visitorErrorMsg = "";
	let dealVisitorData = (visitorData, VisitorType) =>
	{
		visitorData ? visitorData.map((item, index) =>
		{
			item.key = index + 1;
			if(VisitorType)
			{
				let loop = (visitorType) => visitorType.map((m) =>
				{
					if(item.source_type_id == m.source_type_id)
					{
						item.type = m.typename
					}
					else if(m.children)
					{
						loop(m.children)
					}
				});
				loop(VisitorType);
			}
		}) : null;
	};
	switch(action.type)
	{
		case GET_VISITOR:

			if(action.result && action.result.success)
			{
				Visitor = action.result.data;
				let judgeSource, judgeWap;
				Visitor && Visitor.map(item =>
				{
					if(item.source_logo)
					{
						judgeSource = item.source_logo.slice(0, 4);
					}
					if(item.wap_logo)
					{
						judgeWap = item.wap_logo.slice(0, 4);
					}

					if(judgeSource == "http")
					{
						item.sourceHttp = 1
					}
					else
					{
						item.sourceHttp = 0
					}

					if(judgeWap == "http")
					{
						item.wapHttp = 1
					}
					else
					{
						item.wapHttp = 0
					}
				});
			}

			progress = changeProgress(action);
			dealVisitorData(Visitor, VisitorType);

			return {
				data: Visitor,
				progress
			};
		case GET_NEW_VISITOR:
			if(action.result && action.result.success)
			{
				obj = {
					cname: action.result.data.cname,
					domain: action.result.data.domain,
					ename: action.result.data.ename,
					encode: action.result.data.encode,
					pk_config_source: action.result.data.pk_config_source,
					ref_word_rex: action.result.data.ref_word_rex,
					siteid: action.result.data.siteid,
					source_logo: action.result.data.source_logo,
					source_type_id: action.result.data.source_type_id,
					sourceexplain: action.result.data.sourceexplain,
					subname: action.result.data.subname,
					type: action.result.data.type,
					url_reg: action.result.data.url_reg,
					wap_logo: action.result.data.wap_logo,
                    sys : action.result.data.sys
				};
				Visitor.push(obj);
				let judgeSou, judgeW;
				Visitor.map((item, index) =>
				{
					if(item.source_logo)
					{
						judgeSou = item.source_logo.slice(0, 4);
					}
					if(item.wap_logo)
					{
						judgeW = item.wap_logo.slice(0, 4);
					}

					if(judgeSou == "http")
					{
						item.sourceHttp = 1
					}
					else
					{
						item.sourceHttp = 0
					}

					if(judgeW == "http")
					{
						item.wapHttp = 1
					}
					else
					{
						item.wapHttp = 0
					}
				});
			}else
            {
                visitorErrorMsg = action.result && action.result.msg;
            }

			progress = changeProgress(action);
			dealVisitorData(Visitor, VisitorType);

			return {
				data: [...Visitor],
				progress,
                visitorErrorMsg
			};
		case GET_EDITOR_VISITOR:
            if(action && action.success)
			{
				Visitor ? Visitor.map((item) =>
				{
					if(item.pk_config_source == action.data.pk_config_source)
					{

						item.cname = action.data.cname;
						item.domain = action.data.domain;
						item.ename = action.data.ename;
						item.encode = action.data.encode;
						item.ref_word_rex = action.data.ref_word_rex;
						item.source_logo = action.data.source_logo;
						item.source_type_id = action.data.source_type_id;
						item.sourceexplain = action.data.sourceexplain;
						item.url_reg = action.data.url_reg;
						item.wap_logo = action.data.wap_logo;
                        item.sys = action.data.sys;

                        if (item.source_logo)
                        {
                            item.sourceHttp = item.source_logo.slice(0, 4) === "http" ? 1 : 0
                        }

                        if (item.wap_logo)
                        {
                            item.wapHttp = item.wap_logo.slice(0, 4) === "http" ? 1 : 0
                        }
					}
				}) : null;
			}else
            {
                visitorErrorMsg = action.result && action.result.msg
            }

			progress = changeProgress(action);
			dealVisitorData(Visitor, VisitorType);

			return {
				data: [...Visitor],
				progress,
                visitorErrorMsg
			};
		case REMOVE_VISITOR:
			if(action && action.success)
			{
				Visitor ? Visitor.map((item, index) =>
				{
					if(item.pk_config_source == action.data.pk_config_source)
					{
						Visitor.splice(index, 1)
					}
				}) : null;
			}

			progress = changeProgress(action);
			dealVisitorData(Visitor, VisitorType);

			return {
				data: [...Visitor],
				progress
			};
        case CLEAR_VISITOR_ITEM_PROGRESS:
            visitorErrorMsg = changeProgress(action);
            visitorErrorMsg = "";
            return {
                ...state,
                progress,
                visitorErrorMsg
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
