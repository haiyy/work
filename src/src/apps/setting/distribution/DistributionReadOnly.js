import React from 'react'
import { Button, Modal } from 'antd';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { getUserSkillTag, getAccountGroup } from '../account/accountAction/sessionLabel';
import { distribute, getUserCurstem, delCurstem, curstemChecked, clearUserMsg } from './action/distribute';
import ScrollArea from 'react-scrollbar';
import DistributionItemReadOnly from './DistributionItemReadOnly';
import ShowUsers from './ShowUsers';
import './style/distribution.scss';
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";

class DistributionReadOnly extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {
			usershow: false,
			TypeShow: false,
			customerShow: false,
			distriShow: false,
			link: "",
			id: null,
			usersData: null,
			allData: null
		}
	}

	componentDidMount()
	{
		this.props.distribute("template");
		this.props.getUserSkillTag();
		this.props.getAccountGroup();
	}

	makeDistribution()
	{
		this.setState({usershow: true, TypeShow: false, customerShow: false, link: "new", id: null})
	}

    //显示下一步页面
	getShowPage(usersData, currentPage)
	{
        let pageSet = {},
            {users = {}} = this.props;
		if(usersData == "close")
		{
			this.setState({usershow: false, TypeShow: false, customerShow: false})
		}
		else
		{
            pageSet = {usersData};
            Object.assign(pageSet, currentPage);
            Object.assign(users, usersData);

			this.setState(pageSet)
		}
	}

	getPreserve()
	{
		this.setState({usershow: false, TypeShow: false, customerShow: false});
		this.props.distribute("template");
        this.props.clearUserMsg();
	}

	// 显示总览分配情况
	showDistribute()
	{
		this.setState({distriShow: true})
	}

	returnDistribute()
	{
		this.setState({distriShow: false})
	}

	getItemChange(data)
	{
		if(data.type == "editor")
		{
			this.props.getUserCurstem(data.templateid);
			this.setState({
				usershow: true,
				TypeShow: false,
				customerShow: false,
				link: "editor",
				id: data.templateid
			});
		}
		else if(data.type == "remove")
		{
			this.props.delCurstem(data.templateid)
		}
		else if(data.type == "checked")
		{
			this.props.curstemChecked(data.templateid, data.status)
		}
	}

	reFreshFn()
	{
		this.props.distribute("template");
	}

	render()
	{
		let {users, progress} = this.props;

		if(progress === LoadProgressConst.LOAD_FAILED)
		{
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
		}

		return (
			<div className='distribution'>
				<div className="distri-make">
					{ this.state.distriShow ? <ShowUsers returnDistribute={this.returnDistribute.bind(this)}
					                                     height={this.props.height - 65}/> : null}
				</div>

				<div className='distribution-head'>
					<Button disabled type="primary">{getLangTxt("setting_distribution_add")}</Button>
					{/*<Button type="primary" onClick={this.showDistribute.bind(this)}>总览分配情况</Button>*/}
				</div>
				<ScrollArea
					speed={1}
					horizontal={false}
					style={{height: 'calc(100% - 40px)'}} smoothScrolling>
					{
						this.props.state && !this.state.usershow && !this.state.TypeShow && !this.state.customerShow && !this.state.distriShow
							?
							this.props.state.map((item) =>
							{
								return (
									<DistributionItemReadOnly getItemChange={this.getItemChange.bind(this)}
									                  distributionData={item}
									                  key={item.templateid + "1"}/>
								);
							})
							: null
					}
				</ScrollArea>
				{
					getProgressComp(progress)
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		state: state.distributeReducer.data,
		progress: state.distributeReducer.progress,
		users: state.getCurstomer.users
	}
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({distribute, getUserCurstem, delCurstem, curstemChecked, getUserSkillTag, getAccountGroup, clearUserMsg}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DistributionReadOnly);
