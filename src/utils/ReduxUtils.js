import LoadProgressConst from "../model/vo/LoadProgressConst";
import LogUtil from "../lib/utils/LogUtil";

export function getResultCode(response)
{
	LogUtil.trace("getResultCode", LogUtil.INFO, response);

	return Promise.resolve(response.jsonResult);
}

export function dispatchAction(dispatch, type, load, result)
{
	let progress = 2,
		success = result && result.code == 200;

	if(load)
	{
		progress = success ? LoadProgressConst.LOAD_COMPLETE : LoadProgressConst.LOAD_FAILED;
	}
	else
	{
		progress = success ? LoadProgressConst.SAVING_SUCCESS : LoadProgressConst.SAVING_FAILED;
	}

    dispatch(getAction(type, progress, result.data || {}));

	return Promise.resolve({success, result: result})
}

export function getAction(type, progress, result, extra = undefined)
{
	return {type, result, progress, extra}
}
