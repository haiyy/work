import { urlLoader } from "../../../../lib/utils/cFetch";
import { loginUserProxy, configProxy, token } from "../../../../utils/MyUtil";

//保存咨询总结内容
export function saveConsultationSummary(summaryData = {})
{
    return () => {
        let {siteId, userId} = loginUserProxy(),
            url = configProxy().nCrocodileServer + '/summary/saveSummary';

        Object.assign(summaryData, {creater: userId, siteId});

        return urlLoader(url, {method: "POST", body: JSON.stringify(summaryData), headers: {token: token()}})
            .then(roleMangerCode)
    }
}

function roleMangerCode(response)
{
    return Promise.resolve(response.jsonResult);
}

