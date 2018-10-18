import React  from 'react';
import SettingsBreadcrumb from '../setting/enterprise/SettingsBreadcrumb';
import '../setting/enterprise/style/enterpriseSetting.scss';
import Consult from './consult/Consult.js';
import LeaveMessage from './leavemsg/LeaveMessage.js';

class RecordSetting extends React.Component {

	constructor(props)
	{
		super(props);

		this.state = {};
	}

	_getRightContent()
	{
		try
		{
			const {path} = this.props,
				curRightKey = path.length && path[path.length - 1].key;

			if(path.length <= 0)
				return null;

			let rightContent = null;

			switch(curRightKey)
			{
				case 'effectiveCount':   //有效咨询
					rightContent = <Consult type={Consult.VALIDCONSULT} path={this.props.path} route={this.route.bind(this)}/>;
					break;

				case 'goodStartCount':   //商品页咨询数量
					rightContent = <Consult type={Consult.VALIDCONSULT_GOODSTART} path={this.props.path} route={this.route.bind(this)}/>;
					break;

				case 'summaryCount':   //已总结数量
					rightContent = <Consult type={Consult.VALIDCONSULT_SUMMARY} path={this.props.path} route={this.route.bind(this)}/>;
					break;

				case 'unSummaryCount':   //未总结数量
					rightContent = <Consult type={Consult.VALIDCONSULT_UNSUMMARY} path={this.props.path} route={this.route.bind(this)}/>;
					break;

				case 'cartStartCount':   //购物车咨询数量
					rightContent = <Consult type={Consult.VALIDCONSULT_CARTSTART} path={this.props.path} route={this.route.bind(this)}/>;
					break;

				case 'orderStartCount':   //订单页咨询数量
					rightContent = <Consult type={Consult.VALIDCONSULT_ORDERSTART} path={this.props.path} route={this.route.bind(this)}/>;
					break;

				case 'payStartCount':   //支付页咨询数量
					rightContent = <Consult type={Consult.VALIDCONSULT_PAYSTART} path={this.props.path} route={this.route.bind(this)}/>;
					break;

				case 'otherStartCount':   //其他页面咨询数量
					rightContent = <Consult type={Consult.VALIDCONSULT_OTHERSTART} path={this.props.path} route={this.route.bind(this)}/>;
					break;



				case 'unEffectiveCount':   //无效咨询
					rightContent = <Consult type={Consult.UNVALIDCONSULT} path={this.props.path} route={this.route.bind(this)}/>;
					break;

				case 'customerNotReplyCount':   //访客无应答
					rightContent = <Consult type={Consult.UNVALIDCONSULT_CUSTOMERNOTREPLY} path={this.props.path} route={this.route.bind(this)}/>;
					break;

				case 'csNotReplyCount':   //客服无应答
					rightContent = <Consult type={Consult.UNVALIDCONSULT_CSNOTREPLY} path={this.props.path} route={this.route.bind(this)}/>;
					break;

				case 'validConsult':
					rightContent = <Consult path={this.props.path} route={this.route.bind(this)}/>;
					break;


				case 'pending':   //待处理
					rightContent = <LeaveMessage type={LeaveMessage.PENDING} path={this.props.path} route={this.route.bind(this)}/>;
					break;

				case 'dealed':   //已处理
					rightContent = <LeaveMessage type={LeaveMessage.DEALED} path={this.props.path} route={this.route.bind(this)}/>;
					break;

                case 'searchLeaveMsg':
                    rightContent = <LeaveMessage path={this.props.path} route={this.route.bind(this)}/>;
                    break;

				default:
					rightContent = <Consult path={this.props.path} route={this.route.bind(this)}/>;
					break;
			}

			return <div className="interactRecordWrapper">
				{
					rightContent
				}
			</div>;
		}
		catch(e)
		{
			log("_getRightContent stack = " + e.stack);
		}

		return null;
	}

	_isRecordOrComment(str)
	{
		const pathArray = [
            'validConsult', 'invalidConsult',
            'pending', 'dealed', "summaryCount",
            "unSummaryCount", "goodStartCount",
            "cartStartCount", "orderStartCount",
            "payStartCount", "otherStartCount",
            "csNotReplyCount", "customerNotReplyCount",
            "searchLeaveMsg", "effectiveCount",
            "unEffectiveCount"

        ];
		return pathArray.includes(str);

	}

	route(path)
	{
		this.props.changeRoute(path);
	}

	render()
	{
		const {path} = this.props;

		let curRightKey = (path.length && path[path.length - 1].key) || '';

		return (
			<div ref="setting" className="settingRight">
				{
					this._isRecordOrComment(curRightKey) ? null : <SettingsBreadcrumb path={path} key="0" iconClass="icon-interact iconfont"/>
				}
				{
					this._getRightContent()
				}
			</div>
		);
	}
}

export default RecordSetting;
