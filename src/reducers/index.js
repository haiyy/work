import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import workDataReducer from '../apps/workbench/redux/workbenchDataReducer'
import cooperateReducer from '../apps/chat/redux/reducers/cooperateReducer'
import chart from './chartReducer'
import rules from '../apps/setting/keyPage/reducer/essentialPages'
import pendTreatment from './pendTreatment'
import chatPageReducer from '../apps/chat/redux/reducers/chatPageReducer'
import events from '../apps/chat/redux/reducers/eventsReducer'
import trajectoryReducer from './trajectoryReducer'
import getRoleList,{getEditData, getUserType, getUserSkillTag} from './getNewUserInfoReducer'
import startUpData from './startUpLoadReduce'
import reportsList from '../apps/kpi/redux/kpiListReducer'
import attentionList from '../apps/kpi/redux/attentionReducer'
import weeklyDetails from '../apps/kpi/redux/weeklyReducer'
import filterConditions, { query, queryTime, filterCriteria } from '../apps/kpi/redux/filterReducer'
import customerService from '../apps/kpi/redux/customerServiceReducer'
import loginReducer from '../apps/login/redux/loginReducer'
import { getWebview } from './webview'
import getAllColumns, {selectColumnsReducer} from '../apps/kpi/redux/selectColumnsReducer'
import { getUsualTips, getPersonUsualTips }from './getUsualTipsReducer'
import { getPersonWords} from '../apps/setting/personal/reducer/personUsualTipsReducer'
import colleagueConverReducer from "../apps/chat/redux/reducers/colleagueConverReducer"
import userGroupConfigReducer from "./userGroupConfigReducer"
import companyInfo from "../apps/setting/company/redux/companyInfoReducer";
import {getEvaluateList} from  "./consultativeEvaluationReducer";
import getUserTerminal from "./getUserTerminalReducer";
import netWork from "../apps/chat/redux/reducers/netWorkReducer";
import pendingConvers from "../apps/chat/redux/reducers/pendingConverReducer";
import queueListReducer from "../apps/workbench/redux/queueListReducer";
import leaveMessageData from "../apps/setting/leaveMessage/leaveMessageReducer";
import reportDetailsReducer from '../apps/kpi/redux/reportDetails'
import personalReducer from "../apps/setting/personal/reducer/personalReducer";
import lineDetails from '../apps/kpi/redux/lineDetailsReducer'
import consultReducer1 from "../apps/record/redux/consultReducer";
import leaveMsgReducer from "../apps/record/redux/leaveMsgReducer";
import requestReportData from "../apps/kpi/redux/requestReportData";
import loadReportData from "../apps/kpi/redux/loadReportData";
import historyListReducer from "../apps/record/redux/historyListReducer";
import queueManageReducer from "../apps/setting/queueManageRefactor/reducer/queueManageReducer";
import customerTabReducer from "../apps/setting/customTab/tabReducer/customerTabReducer";
import accountReducer from "../apps/setting/account/accountReducer/accountReducer";
import blacklistReducer from "../apps/setting/blackList/reducer/blacklistReducer";
import {getVisitorType, getVisitor} from "../apps/setting/visitorsource/reducer/getVisitorType";
import distributeReducer, { getCurstomer, getStrategy, getDatas } from "../apps/setting/distribution/reducer/distributeReducer";
import {getRoleManger, newRoleManger} from "../apps/setting/account/rolemanager/roleReducer/newRoleManger";
import getAccountList from "../apps/setting/account/accountReducer/getAccountList";
import fastAccountManger from "../apps/setting/account/rolemanager/roleReducer/fastAccountManger";
import listAccount from "../apps/setting/account/rolemanager/roleReducer/listAccount";
import editorAccount from "../apps/setting/account/rolemanager/roleReducer/editorAccount";
import {autoresponse, getAutoWelcome, getResponselevel} from "../apps/setting/autoResponder/reducer/autoresponse";
import {skilltag, skilltagList} from "../apps/setting/skilltag/reducer/skilltag";
import {sensitiveWord} from "../apps/setting/sensitiveWord/reducer/sensitiveWord";
import {qualityTest} from "../apps/setting/qualityTesting/reducer/qualityTest";
import {getTipsGroup, getTips} from "../apps/setting/commonWord/reducer/commonWordReducer";
import summaryReducer from "../apps/setting/summary/reducer/summaryReducer";
import {getFaqCompanyGroup, getFaqCompanyItem} from "../apps/setting/FaqQuestion/reducer/faqCompanySettingReducer";
import {getConfigLevel} from "../apps/setting/configLevel/configLevelReducer";
import magicBoxReducer from "../apps/setting/magicbox/reducer/magicBoxReducer";
import receptionTimeReducer from "../apps/setting/receptiontime/reducer/receptionTimeReducer";
import weChatReducer from "../apps/setting/thirdPartyAccess/reducer/weChatReducer";
import weiboReducer from "../apps/setting/thirdPartyAccess/reducer/weiboReducer";
import smallRoutineReducer from "../apps/setting/thirdPartyAccess/reducer/smallRoutineReducer";
import earlyWarningReducer from "../apps/setting/earlyWarning/reducer/earlyWarningReducer";
import getExportOption from "../apps/record/redux/userDefinedExportReducer";
import getRecordCommonTime from "../apps/record/redux/recordTimeReducer";
import shopAccountReducer from "../apps/setting/shopAccount/reducer/shopAccountReducer";
import consultBindingReducer from "../apps/setting/consultBinding/reducer/consultBindingReducer";
import searchTreeDataReducer from "../apps/record/redux/searchTreeDataReducer";
import loadDataReducer from "./loadDataReducer";
import PersonalCallSettingReducer from "../apps/callcenter/redux/reducers/personalcallsettingReducer"
import visitPlanReducer from '../apps/callcenter/redux/reducers/visitPlanReducer';
import bindOnAccoutReducer from '../apps/callcenter/redux/reducers/bindOnAccoutReducer';
import callRecordReducer from '../apps/callcenter/redux/reducers/callRecordReducer';
import calloutTaskReducer from "../apps/callcenter/redux/reducers/calloutTaskReducer";
import receptiongroupReducer from '../apps/callcenter/redux/reducers/receptiongroupReducer';
import telephonyScreenReducer from "../apps/callcenter/redux/reducers/telephonyScreenReducer";
import phonePlayScreenReducer from "../apps/callcenter/redux/reducers/phonePlayScreenReducer";
import callListenReducer from "../apps/callcenter/redux/reducers/callListenreducer";
import attendantTableReportReducer from "../apps/callcenter/redux/reducers/attendantTableReportReducer";

const rootReducer = combineReducers({
	routing: routerReducer,
	consultReducer1,  //有效咨询
	leaveMsgReducer,  //留言
	historyListReducer, //右侧页签互动记录
    personalReducer,
	workDataReducer,
	cooperateReducer,
	chart,
	getVisitorType,
	getVisitor,
	accountReducer,
	rules,
	distributeReducer,
	getCurstomer,
	getStrategy,
	getDatas,
	events,
	pendTreatment,
	trajectoryReducer,
    getUsualTips,
    getPersonUsualTips,
    getRoleList,
    getEditData,
    getUserType,
    getUserSkillTag,
	getRoleManger,
	newRoleManger,
	startUpData,
	getAccountList,
	fastAccountManger,
	listAccount,
	editorAccount,
	attentionList,
	filterConditions,
    queryTime,
    query,
	autoresponse,
	getAutoWelcome,
	getResponselevel,
	sensitiveWord,
	chatPageReducer,
	weeklyDetails,
	customerService,
	skilltag,
	skilltagList,
	getWebview,
	qualityTest,
    getTipsGroup,
    getTips,
	getAllColumns,
	selectColumnsReducer,
    getPersonWords,
	summaryReducer,
	colleagueConverReducer,
    userGroupConfigReducer,
    getFaqCompanyGroup,
    getFaqCompanyItem,
    getConfigLevel,
	companyInfo,
	filterCriteria,
	getEvaluateList,
	getUserTerminal,
	netWork,
	pendingConvers,
	queueListReducer,
    leaveMessageData,
	reportDetailsReducer,
	lineDetails,
	requestReportData,
	loadReportData,
	loginReducer,
    blacklistReducer,//黑名单
    reportsList,
	queueManageReducer,
	customerTabReducer,
	visitPlanReducer, // 回访计划
	bindOnAccoutReducer, // 呼入记录
	magicBoxReducer,
	receptionTimeReducer,
    weChatReducer,
    weiboReducer,
    smallRoutineReducer,
    earlyWarningReducer,
    getExportOption,
    getRecordCommonTime,
    shopAccountReducer,
    consultBindingReducer,
    searchTreeDataReducer,
	loadDataReducer,
	callRecordReducer,  // 呼出记录
	calloutTaskReducer,  //通话记录 外呼任务
	PersonalCallSettingReducer,//设置 个人设置
	receptiongroupReducer, // 设置 接待组
	telephonyScreenReducer,//电话弹屏
	phonePlayScreenReducer,//最近弹屏
	callListenReducer,//实时监控 呼叫监听
	attendantTableReportReducer,//坐席报表
});

export default rootReducer;
