import React from 'react';
import ReactDOM from 'react-dom';
import { Steps, Button, Input,  Form, Tooltip, Radio } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { makeUsers, editorCurstem, clearUserMsg } from './action/distribute';
import Process from './Process';
import './style/distributeType.scss';
import { getLangTxt } from "../../../utils/MyUtil";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

let Step = Steps.Step,
	FormItem = Form.Item,
	RadioGroup = Radio.Group;

class DistributeType extends React.PureComponent {

	typeData = getdatas();

	constructor(props)
	{
		super(props);

		this.state = {
			name: null,
			show: false,
			curLeft: 0,
			curTop: 0,
			left: 0,
			top: 0,
			currentX: 0,
			currentY: 0,
			flag: false,
			dragBox: null,
			index: null,
			collspse: false,
			robotValue: null
		};

		this._mouseOver = this._mouseOver.bind(this);
	}

	componentDidMount()
	{
		/*this.props.getTypeData();*/
	}

	getPreserve(dataArr)
	{
		dataArr = dataArr.join("-");

        let data = this.props.usersData,
            userData = this.props.users || {},
            {robotValue} = this.state;

        data.allocation = dataArr || this.props.users.allocation;
		data.allocationName = this.props.form.getFieldValue("allocationName") || this.props.users.allocationName;
        data.robotPriorty = robotValue !== null ? robotValue : userData.robotPriorty || 0;

		if(this.props.link == "new")
		{
			this.props.makeUsers(data)
		}
		else if(this.props.link == "editor")
		{
			data.templateid = this.props.id;
            this.props.editorCurstem(data);
            this.props.clearUserMsg();
        }
        this.props.getShowPage("close");
		/*this.props.getPreserve();*/
	}

	//提交保存
	preserve()
	{
		if(this.distributeData.length > 0)
		{
			let lastData = this.distributeData[this.distributeData.length - 1];
			if(lastData.type === "random" || lastData.type === "rotating")
			{
				this.getPreserve(this.distributeData.map(item => item.link));
				return;
			}
		}

		warning({
			title: getLangTxt("setting_distribution"),
            iconType: 'exclamation-circle',
            className: 'warnTip',
			content: getLangTxt("setting_distribution_tip5"),
		});
	}

	//恢复默认
	prevState()
	{
		this._restore();
	}

	mouseDown(index, e)
	{
		let dragBox = "dragBox" + (index);
		var newState = {};
		var event = e || window.event;
		event.preventDefault();
		newState.currentX = event.clientX;
		newState.currentY = event.clientY;
		newState.flag = true;
		var computedStyle = document.defaultView.getComputedStyle(ReactDOM.findDOMNode(this.refs[dragBox]), null);
		newState.left = computedStyle.left;
		newState.top = computedStyle.top;

		this.setState({
			left: newState.left,
			top: newState.top,
			curLeft: newState.left,
			curTop: newState.top,
			currentX: newState.currentX,
			currentY: newState.currentY,
			flag: newState.flag,
			index: index,
			dragBox: dragBox
		});
	}

	move(event)
	{
		var e = event ? event : window.event;
		let dragBox = this.state.dragBox;
		var dBox = ReactDOM.findDOMNode(this.refs[dragBox]);

		if(this.state.flag)
		{
			var nowX = e.clientX, nowY = e.clientY;
			var disX = nowX - this.state.currentX,
				disY = nowY - this.state.currentY;
			/*增加拖拽范围检测*/

			var currentLeft = parseInt(this.state.left) + disX,
				currentTop = parseInt(this.state.top) + disY;

			if(currentTop < -300)
			{
				currentTop = -300;
			}
			else if(currentTop > 300)
			{
				currentTop = 300;
			}

			let index = this.state.index, left = currentLeft + 135 * (index + 1);

			if(left > 700)
			{
				currentLeft = 700 - 135 * index;
			}
			else if(left < -135)
			{
				currentLeft = -135;
			}

			dBox.style.left = currentLeft + "px";
			dBox.style.top = currentTop + "px";
		}

	}

	endDrag()
	{
		if(this.state.flag)
		{
			let dragBox = this.state.dragBox;
			var dBox = ReactDOM.findDOMNode(this.refs[dragBox]);
			var computedStyle = document.defaultView.getComputedStyle(ReactDOM.findDOMNode(this.refs[dragBox]), null);

			let math = parseInt(computedStyle.left),
				count = Math.round(math / 135);

			let arr = this.distributeData, index = this.state.index;

			if(count > 0)
			{
				arr.splice(index + count + 1, 0, arr[index]);
				arr.splice(index, 1);
			}
			else if(count < 0)
			{
				if(index + count < 0)
					count = -index;

				arr.splice(index + count, 0, arr[index]);
				arr.splice(index + 1, 1);
			}

			dBox.style.left = this.state.curLeft;
			dBox.style.top = this.state.curTop;
			this.distributeData = [...arr];
			this.setState({
				flag: false
			});
		}
	}

	removeClick(index, {type})
	{
		this.typeData.map((m) =>
		{
			if(m.type === type)
				m.link = true
		});

		this.distributeData.splice(index, 1);

		this.setState({collspse: !this.state.collspse});
	}

	componentDidMount()
	{
		this.refs.distributeType.addEventListener('mousemove', this.move.bind(this), false);
		this.refs.distributeType.addEventListener('mouseup', this.endDrag.bind(this), false);
		//this.refs.distributeType.addEventListener('mouseout', this._mouseOut.bind(this), false);
	}

	_mouseOut()
	{
		this.refs.distributeType.addEventListener('mouseover', this._mouseOver, false);
	}

	_mouseOver()
	{
		this.refs.distributeType.removeEventListener('mouseover', this._mouseOver);

		this.endDrag();
	}

	itemClick(index)
	{
        let randomItem = this.distributeData.find(item=>item.type === "random"),
            rotatingItem = this.distributeData.find(item=>item.type === "rotating");
        if (typedata()[index].type === "random" && rotatingItem || typedata()[index].type === "rotating" && randomItem)
        {
            info({
                title: getLangTxt("tip"),
                width: '320px',
                iconType: 'exclamation-circle',
                className: 'warnTip',
                content: getLangTxt("setting_distribution_tip6")
            });
            return
        }

        this.typeData[index].link = false;
        this.distributeData.push(typedata()[index]);
		this.setState({collspse: !this.state.collspse});
	}

	closeClick()
	{
		this.props.getPreserve();
	}

	_restore()
	{
		this.allocationName = getLangTxt("setting_distribution_default");
		let allocations = typedata();

        this.typeData.forEach(item=>{
            item.link = true
        });

		this.distributeData = ["L", "F", "B", "P"].map(link =>
		{
			return allocations.filter((data, index) =>
			{
				let has = data.link === link;
				if(has)
					this.typeData[index].link = false;

				return has;
			})[0];
		});

		this.props.form.setFieldsValue({allocationName: this.allocationName});

		this.setState({collspse: !this.state.collspse});
	}

	onChangeRobot(e)
	{
		this.setState({robotValue: e.target.value})
	}

    judgeSpace(rule, value, callback)
    {
        if(value && value.trim() !== "")
        {
            callback();
        }
        callback(" ");
    }

	render()
	{
		let {getFieldDecorator} = this.props.form,
            {link} = this.props,
			style = {position: "relative", left: "-10px", top: "6px"},
            isEdit = link === "editor";

		if(!this.distributeData)
		{
			let {users: allocationData = {}} = this.props,
				{
					allocationName = getLangTxt("setting_distribution_default"),
					allocation = "L-F-B-P",  //客服优先级—熟客优先—负载均衡—轮值。
					robotPriorty = 0
				} = allocationData,
				allocations = typedata();

			this.allocationName = allocationName;
			this.robotPriorty = robotPriorty;
			this.distributeData = (allocation && allocation.split("-") || [])
			.map(link =>
			{
				return allocations.filter((data, index) =>
				{
					let has = data.link === link;
					if(has)
						this.typeData[index].link = false;

					return has;
				})[0];
			});
		}

		return (
			<div ref="distributeType" className='distribute-type'>
				<Steps current={2} className="distributeTypeSteps">
					<Step title={getLangTxt("setting_distribution_define_group")}/>
					<Step title={getLangTxt("setting_distribution_define_group1")}/>
					<Step title={getLangTxt("setting_distribution_rules")}/>
				</Steps>

				<div className='distribute-type-body'>
					<div className='distribute-type-item'>
						<ul>
							{
								this.typeData ? this.typeData.map((item, index) =>
								{
									if(item.link)
									{
										return (
											<li key={index}
											    className={"dragBox" + (index + 1)}
											    onClick={this.itemClick.bind(this, index)}>
												<Tooltip placement="bottom" title={item.title}>
													<i className={"iconfont icon-style " + item.icon}/>
												</Tooltip>
											</li>
										)
									}
									else
									{
										return (
											<li className={"dragBox" + (index + 1)} key={index}>
												<Tooltip placement="bottom" title={item.title}>
													<i className={"iconfont icon-style " + item.icon}/>
												</Tooltip>
											</li>)
									}
								}) : null
							}
						</ul>
						<RadioGroup className="changeRobotStyle" onChange={this.onChangeRobot.bind(this)}
						            value={ this.state.robotValue === null ? this.robotPriorty : this.state.robotValue }>
							<Radio value={0}>{getLangTxt("setting_account_manpower")}</Radio>
							<Radio value={1}>{getLangTxt("setting_account_robot")}</Radio>
						</RadioGroup>
					</div>

					<div className='distribute-title'>
						<span style={style}>{getLangTxt("setting_distribution_rules")}</span>
						<Form style={{display: "inline-block"}} className="distributeType">
							<FormItem style={{display: "inline-block"}}>
								{
									getFieldDecorator("allocationName", {
                                        initialValue: isEdit ? this.allocationName : getLangTxt("setting_distribution_default"),
                                        rules: [{ required: true, max: 100, message: ' ' },
                                            {validator: this.judgeSpace.bind(this)}]
                                    })(
                                        <Input style={{width: 335}}/>
									)
								}
							</FormItem>
						</Form>
						<Button onClick={this.prevState.bind(this)} className="clear-all" type="primary">{getLangTxt("restore_default")}</Button>
					</div>
				</div>

				<ul className='distribute-type-center'>
					{
						this.distributeData ? this.distributeData.map((item, index) =>
						{
							return (
								<li key={index} onMouseDown={this.mouseDown.bind(this, index)} ref={"dragBox" + index}>
									{
										item ?
											<div>
								                <span className='distribute-icon'>
								                    <i className={"iconfont icon-style " + item.icon}/>
									                <div className='distribute-process-btn'>
									                    <span className='distribute-process-remove'
									                          onClick={this.removeClick.bind(this, index, item)}>
									                        <i className="iconfont icon-guanbi1 remove-process"/>
									                    </span>
			                                         </div>
								                </span>
                                                <Process data={index == this.distributeData.length - 1 ? null : this.distributeData[index].data} blue={item.blue}/>
											</div> :
											null
									}
								</li>
							)
						}) : null
					}
				</ul>

				<div className='distribute-intro'>
					<p>{getLangTxt("setting_distribution_tip7")}</p>
					<p><span>1</span> {getLangTxt("setting_distribution_tip8")}</p>
					<p><span>2</span> {getLangTxt("setting_distribution_tip9")}</p>
					<p><span className="words">1</span>{getLangTxt("setting_distribution_tip10")}</p>
					<p><span className="words">2</span>{getLangTxt("setting_distribution_tip11")}</p>
					<p><span>3</span> {getLangTxt("setting_distribution_tip12")}</p>
				</div>

				<div className="company-footer">
					<Button className="primary" type="primary" onClick={this.preserve.bind(this)}>{getLangTxt("save")}</Button>
					<Button className="ghost" type="ghost" onClick={this.closeClick.bind(this)}>{getLangTxt("cancel")}</Button>
				</div>
			</div>
		)
	}
}

DistributeType = Form.create()(DistributeType);

function mapStateToProps(state)
{
	return {
		state: state
	}
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({makeUsers, editorCurstem, clearUserMsg}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DistributeType);

function getdatas()
{
	return [
		{
			type: "priority",
			link: true,
			icon: "icon-kefu",
			title: "客服优先级策略",
			links: "L"
		}, {
			type: "vip",
			link: true,
			icon: "icon-chengshu",
			title: "熟客优先策略",
			links: "F"
		}, {
			type: "ability",
			link: true,
			icon: "icon-nenglizhi",
			title: "客服能力值策略",
			links: "A"
		}, {
			type: "load",
			link: true,
			icon: "icon-junhengqi",
			title: "负载均衡策略",
			links: "B"
		}, {
			type: "rotating",
			link: true,
			icon: "icon-liebiaoxunhuan",
			title: "轮值分配",
			links: "P"
		}, {
			type: "random",
			link: true,
			icon: "icon-fenpei",
			title: "随机分配",
			links: "R"
		}
	]
}

function typedata()
{
	return [
		{
			type: "priority",
			data: "多个客服优先级最高且相同",
			blue: "分配优先级较高的客服",
			visible: false,
			icon: "icon-kefu",
			link: "L"
		}, {
			type: "vip",
			data: "新访客",
			blue: "分配给熟悉的客服",
			visible: true,
			icon: "icon-chengshu",
			link: "F"
		}, {
			type: "ability",
			data: "",
			blue: "",
			visible: false,
			icon: "icon-nenglizhi",
			link: "A"
		}, {
			type: "load",
			data: "多个客服负载相同",
			blue: "分配负载最小的客服",
			visible: false,
			icon: "icon-junhengqi",
			link: "B"
		}, {
			type: "rotating",
			data: "多个客服同时分配",
			blue: "",
			visible: false,
			icon: "icon-liebiaoxunhuan",
			link: "P"
		}, {
			type: "random",
			data: "",
			blue: "",
			visible: false,
			icon: "icon-fenpei",
			link: "R"
		}
	]
}
