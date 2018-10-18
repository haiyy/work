/**
 * 顶部实时数据类
 * */
import React from "react"
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getAllOptions, getCheckedOptions, updateCheckedOptions, updateWorkData, updatePropsCheckedOptions } from "../redux/workbenchDataReducer";
import WorkBenchOptions from "./WorkBenchOptions";
import LogUtil from "../../../lib/utils/LogUtil";
import { getLangTxt, shallowEqual } from "../../../utils/MyUtil";
import { is, List, Map } from "immutable";
import { Modal } from 'antd';
import NTModal from "../../../components/NTModal";
import SessionEvent from "../../event/SessionEvent";

const warning = Modal.warning;

class WorkStatistics extends React.Component {

	constructor(props)
	{
		super(props);

		this.state = {
			zIndex: false,
			itemShow: false,
			listShow: false
		};

		this.props.getCheckedOptions();
	}

	componentWillUnmount()
	{
		stop();
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		const {workData, user} = nextProps,
			wd = this.props.workData;

		if(!user)
		{
			stop();
			return false;
		}
		
		if(!shallowEqual(this.props.canDrag, nextProps.canDrag))
			return true;

		if(!is(workData.get("checkedOptions"), wd.get("checkedOptions")))
		{
			let checkedOptions = workData.get("checkedOptions");

			this.startToUpdate(checkedOptions);

			return true;
		}

		return !is(workData, wd) || !shallowEqual(nextState, this.state);
	}

	startToUpdate(checkedOptions)
	{
		this.props.updateWorkData(this._getWorkDataParam(checkedOptions));
		update = () => {
			this.props.updateWorkData();
		};

		start();
	}

	change()
	{
		this.setState({
			zIndex: !this.state.zIndex
		})
	}

	_onMoreClick()
	{
		this.props.getAllOptions();
		this.setState({itemShow: true})
	}

	_onCloseAllOptions()
	{
		let checkedOpts = this.allOptions.filter(option => {
			return option.get("on") === 1;
		})
		.toJS();

		this.setState({itemShow: false});

		if(checkedOpts.length <= 0)
		{
			//保存失败
			let content = getLangTxt("workstatistics_select_tip"),
				title = getLangTxt("tip"),
				width = '320px',
				className = 'warnTip',
				okText = getLangTxt("sure");

			warning({title, content, width, className, okText});

			return;
		}

		updateCheckedOptions(JSON.stringify(checkedOpts))
		.then(result => {
			if(result && result.code === 200)
			{
				this.props.updatePropsCheckedOptions(checkedOpts);
			}

			log(["updateCheckedOptions", result]);
		});
	}

	_getWorkDataParam(checkedOpts)
	{
		if(!checkedOpts || checkedOpts.size < 0)
			return "";

		let params = {name: "rpt_top_dashboard"};

		params.cols = checkedOpts.map(item => item.get("name"))
		.join(",");

		return params;
	}

	//排队列表显示
	showQueue()
	{
		this.setState({
			listShow: !this.state.listShow,
		});
	}

	_getAllOptions()
	{
		let workData = this.props.workData,
			checkedOptions = workData.get("checkedOptions") || List();

		this.allOptions = workData.get("allOptions") || List();

		this.allOptions.forEach((option, index) => {
			checkedOptions.forEach(opt => {

				option.get("name") === opt.get("name") && (this.allOptions = this.allOptions.setIn([index, "on"], opt.get("on")))
			});
		});

		return this.allOptions;
	}

	_getWokrDataUI(workData, checkedOptions)
	{
		log(["_getWokrDataUI workData = ", workData]);

		if(!checkedOptions)
			return null;

		workData = workData ? workData : Map();

		let name, data;

		return checkedOptions.map((item, i) => {
			if(!item || item.get("on") !== 1)
				return null;

			name = item.get("name");

			data = workData.get(name);

			if(data === undefined && item.has("defaultValue"))
				data = item.get("defaultValue");

			if(item.get("dataType") === "Percent")
			{
				data = parseFloat((parseFloat(data) * 100).toFixed(2)) + "%";
			}

			let listShow = this.state.listShow ? "inline-block" : "none";

			if(name === "queue_vs_count")
			{
				return (
					<div key={i} className="queueBox" onClick={this.showQueue.bind(this)}>
						<div className="box" style={{width: 1 / (checkedOptions.size) * 100 + '%'}}>
							<div className="boxData" style={{display: !listShow}}>
								{data}
							</div>
							<div className="explain">{item.get("title")}</div>
						</div>
					</div>
				);
			}

			return (
				<div key={i} className="box" ref={(node) => {
					this["box_" + i] = node
				}} style={{width: 1 / (checkedOptions.size) * 100 + '%'}}>
					<div className="boxData">{data}</div>
					<div className="explain">
						{
							item.get("title")
						}
					</div>
				</div>
			)
		});
	}

	_getWorkData()
	{
		let workData = this.props.workData;
		workData = workData.get("workData");

		log(["_getWorkData>>", workData]);

		return workData;
	}

	_updateSelected(index, on)
	{
		this.allOptions = this.allOptions.setIn([index, "on"], on ? 1 : 0);
	}

	render()
	{
		let workData = this.props.workData,
			checkedOptions = workData.get("checkedOptions"),
			//allOptions = workData.get("allOptions"), noData1
			isHaveMarginLeft = checkedOptions ? "more" : "more borderLeftShow",
            allOptionData = this._getAllOptions();

		return (
			<div className="headerMiddle">
				<div className="headerMiddleInner">
					<div className="workStatistics" style={this.props.canDrag} onClick={(e) => e.stopPropagation()}>
						{
							this._getWokrDataUI(this._getWorkData(), checkedOptions)
						}
					</div>

					<div className={isHaveMarginLeft} onClick={this._onMoreClick.bind(this)}>
						<span>+</span>
					</div>

					<NTModal wrapClassName="items" title={getLangTxt("workstatistics_select_opt")}
					         visible={this.state.itemShow} width={545}
					         footer={""} className="selectShowData" onCancel={this._onCloseAllOptions.bind(this)}>
                        {
                            allOptionData.size ? <WorkBenchOptions allOptions={this._getAllOptions()}
                                _updateSelected={this._updateSelected.bind(this)}/>
                                :
                                <div className="selectNoData">{getLangTxt("noData1")}</div>

                        }

					</NTModal>

					{/*<Menu className="queueNumber" style={{display: listShow}}>*/}
					{/*{*/}
					{/*this.state.listShow ? <QueuedList items={items} close={this.showQueue.bind(this)}/> : ''*/}
					{/*}*/}
					{/*</Menu>*/}
				</div>
			</div>
		);
	}
}

let interval = 30000,
	index = -1,
	update = null;

function start()
{
	stop();

	if(typeof update !== "function")
		return;

	index = setInterval(update, interval);
}

function stop()
{
	clearTimeout(index);
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("WorkStatistics", info, log);
}

function mapStateToProps(state)
{
	const {
		workDataReducer: workData = Map(),
		loginReducer: {user}
	} = state;

	return {
		workData, user
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getAllOptions, getCheckedOptions, updateWorkData, updatePropsCheckedOptions
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkStatistics);
