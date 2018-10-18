import React from 'react';
import SettingsBreadcrumb from './SettingsBreadcrumb';
import './style/enterpriseSetting.scss';
import CompanyUsedWords from "../commonWord/CompanyUsedWords";
import CommonWordReadOnly from "../commonWord/CommonWordReadOnly";
import Summary from "../summary/Summary";
import SummaryReadOnly from "../summary/SummaryReadOnly";
import LeaveMessage from "../leaveMessage/LeaveMessage";
import LeaveMessageReadOnly from "../leaveMessage/LeaveMessageReadOnly";
// import QueueManage from "../queueManage/QueueManage";
import QueueManage from "../queueManageRefactor/QueueManage";
import QueueManageReadOnly from "../queueManageRefactor/QueueManageReadOnly";
import SensitiveWord from "../sensitiveWord/SensitiveWord";
import SensitiveWordReadOnly from "../sensitiveWord/SensitiveWordReadOnly";
import ConsultativeEvaluation from "../consultativeEvaluation/ConsultativeEvaluation";
import ConsultativeEvaluationReadOnly from "../consultativeEvaluation/ConsultativeEvaluationReadOnly";
import AutoResponder from "../autoResponder/AutoResponder";
import Account from "../account/Account";
import AccountReadOnly from "../account/AccountReadOnly";
import Webview from "../webview/Webview";
import WebviewReadOnly from "../webview/WebviewReadOnly";
import FaqSetting from "../FaqQuestion/FaqSetting";
import FaqSettingReadOnly from "../FaqQuestion/FaqSettingReadOnly";
import Distribution from "../distribution/Distribution";
import DistributionReadOnly from "../distribution/DistributionReadOnly";
import EarlyWarning from "../earlyWarning/EarlyWarning";
import EarlyWarningReadOnly from "../earlyWarning/EarlyWarningReadOnly";
import KeyPage from "../keyPage/keyPage";
import VisitorSource from "../visitorsource/VisitorSource";
import VisitorSourceReadOnly from "../visitorsource/VisitorSourceReadOnly";
import Skilltag from "../skilltag/Skilltag";
import SkilltagReadOnly from "../skilltag/SkilltagReadOnly";
import UserGroupConfig from "../usergroupconfig/UserGroupConfig";
import CompanyInfo from "../company/CompanyInfo";
import CompanyInfoReadOnly from "../company/CompanyInfoReadOnly";
import RoleManage from "../account/rolemanager/RoleManage";
import RoleManageReadOnly from "../account/rolemanager/RoleManageReadOnly";
import CreateRoleComp from "../account/rolemanager/roleManagerRefactor/CreateRoleComp";
import BlackList from "../blackList/BlackList";
import CustomTabComp from "../customTab/CustomTabComp";
import CustomTabCompReadOnly from "../customTab/CustomTabCompReadOnly";
import LogUtil from "../../../lib/utils/LogUtil";
import MagicBox from "../magicbox/MagicBox";
import MagicBoxReadOnly from "../magicbox/MagicBoxReadOnly";
import ErrorBoundary from "../../../components/ErrorBoundary";
import ReceptionTime from "../receptiontime/ReceptionTime";
import ReceptionTimeReadOnly from "../receptiontime/ReceptionTimeReadOnly";
import KeyPageReadOnly from "../keyPage/KeyPageReadOnly";
import SmallRoutine from "../thirdPartyAccess/smallRoutine/SmallRoutine";
import SmallRoutineReadOnly from "../thirdPartyAccess/smallRoutine/SmallRoutineReadOnly";
import WeChat from "../thirdPartyAccess/weChat/WeChat";
import WeChatReadOnly from "../thirdPartyAccess/weChat/WeChatReadOnly";
import Weibo from "../thirdPartyAccess/weibo/Weibo";
import WeiboReadOnly from "../thirdPartyAccess/weibo/WeiboReadOnly";
import { getLangTxt } from "../../../utils/MyUtil";
import ShopManageComp from "../shopAccount/ShopManageComp";
import ConsultBinding from "../consultBinding/ConsultBinding";

class EnterpriseSetting extends React.Component {

	constructor(props)
	{
		super(props);

		this.state = {editRoleData: null};
	}

	componentDidMount()
	{
		if(!this.refs.setting)
			return;

		let heightSmall = this.refs.setting.clientHeight;
		if(heightSmall < 768)
		{
			heightSmall = 768;
		}
		this.setState({height: heightSmall});
	}

	_getRightContent()
	{
		try
		{
			let {path, setting = {}} = this.props,
				{editData} = this.state,
				item = path.length && path[path.length - 1] || {},
				{key, fns, custom} = item,
				moduleName;

			if(path.length <= 0)
				return null;

			let rightContent = null;
			let Comp = fns ? fnMap[getFnkey(fns, setting)] : null;

			if(custom)
				Comp = fnMap[fns[0]];

			if(Comp)
			{
				rightContent = <Comp
					route={this.route.bind(this)}
					isNew={this.state.isNew}
					editData={editData}
				/>;
			}
			else
			{
				moduleName = getLangTxt(item.title) || getLangTxt("setting_note1");
				rightContent = <div className="noLimitModuleComp">
					<span>{getLangTxt("setting_note2") + moduleName + getLangTxt("setting_note3")}</span></div>
			}

			return (
				<div className="mailCon">
					{
						rightContent
					}
					{/*<ErrorBoundary>
						{
							rightContent
						}
					</ErrorBoundary>*/}
				</div>
			);
		}
		catch(e)
		{
			LogUtil.trace("EnterpriseSetting", LogUtil.INFO, "_getRightContent stack = " + e.stack);
		}

		return null;
	}

	route(path, isNew, editData)
	{
		this.props.changeRoute(path);
		this.setState({isNew, editData});
	}

	render()
	{
		const {path} = this.props;

		return (
			<div ref="setting" className="settingRight">
				<SettingsBreadcrumb path={path} key="0" iconClass="icon-shezhi1 iconfont"/>
				{
					this._getRightContent()
				}
			</div>
		);
	}
}

const fnMap = {
	information_check: CompanyInfoReadOnly,
	information_check_eidt: CompanyInfo,

	usedwords_check: CommonWordReadOnly,
	usedwords_edit: CompanyUsedWords,

	summary_check: SummaryReadOnly,
	summary_edit: Summary,

	sensitiveword_check: SensitiveWordReadOnly,
	sensitiveword_edit: SensitiveWord,

	reception_time_check: ReceptionTimeReadOnly,
	reception_time_edit: ReceptionTime,

	rolemanage_check: RoleManageReadOnly,
	rolemanage_eidt: RoleManage,
	newrolemanage: CreateRoleComp,

	skilltag_check: SkilltagReadOnly,
	skilltag_edit: Skilltag,

	account_check: AccountReadOnly,
	account_edit: Account,

	distribution_check: DistributionReadOnly,
	distribution_edit: Distribution,

	queuemanage_check: QueueManageReadOnly,
	queuemanage_edit: QueueManage,

	keypage_check: KeyPageReadOnly,
	keypage_edit: KeyPage,

	visitorsource_check: VisitorSourceReadOnly,
	visitorsource_edit: VisitorSource,

	custom_tab_check: CustomTabCompReadOnly,
	custom_tab_edit: CustomTabComp,

	wechat_agent_check: WeChatReadOnly,
	wechat_agent_edit: WeChat,

	wechat_applet_agent_check: SmallRoutineReadOnly,
	wechat_applet_agent_edit: SmallRoutine,

	weibo_agent_check: WeiboReadOnly,
	weibo_agent_edit: Weibo,

	webview_check: WebviewReadOnly,
	webview_edit: Webview,

	autoreplay: AutoResponder,

	enterpeise_faqsetting_check: FaqSettingReadOnly,
	enterpeise_faqsetting_edit: FaqSetting,

	consultative_check: ConsultativeEvaluationReadOnly,
	consultative_edit: ConsultativeEvaluation,

	leavemessage_check: LeaveMessageReadOnly,
	leavemessage_edit: LeaveMessage,

	blacklist_setting_check: BlackList,

	basictemplateinfo: UserGroupConfig,

	magicbox_copy: MagicBox,
	magicbox_check: MagicBoxReadOnly,

	earlywarning_check: EarlyWarningReadOnly,
	earlywarning_edit: EarlyWarning,

    account_management_check: ShopManageComp,
    account_management_edit: ShopManageComp,

    consulting_binding_check: ConsultBinding,
    consulting_binding_edit: ConsultBinding
};

function getFnkey(fns, setting)
{
	let showFns = fns.filter(item => setting.includes(item));

	if(showFns.length > 1)
	{
		return showFns[0];
	}
	else if(showFns.length === 1)
	{
		if(fns.length === 1)
		{
			return showFns[0];
		}
		else
		{
			if(showFns[0] === fns[1]) //确保check
			{
				return showFns[0];
			}
		}
	}

	return '';
}

export default EnterpriseSetting;
