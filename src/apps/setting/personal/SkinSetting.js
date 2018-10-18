import React  from 'react'
import { Card, Radio, Button } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Immutable from "immutable"
import { fetchTheme, themeSetting, clearThemeProgress } from './action/personalSetting';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

const RadioGroup = Radio.Group;

class SkinSetting extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {}
	}

	onCancel()
	{
		this.props.onCancel(false);
	}

	onOk()
	{
		let theme = this.props.theme;
		let obj = {};
		obj.skin = theme.skin;
		obj.personalskin = this.state.personalskin >= 0 ? this.state.personalskin : theme.personalskin;

		this.props.themeSetting(obj);
	}

	componentDidMount()
	{
		this.props.fetchTheme();
	}

    componentWillReceiveProps(nextProps) {
        let {progress: nextProgress} = nextProps,
            {progress: thisProgress} = this.props;

        if (thisProgress === LoadProgressConst.SAVING_SUCCESS)
        {
            // this.props.onCancel();
            this.props.clearThemeProgress()
        }
        if (nextProgress !== thisProgress)
        {
           if (nextProgress === LoadProgressConst.SAVING_FAILED)
            {
                this.getSavingErrorMsg();
            }
        }
    }

    getSavingErrorMsg()
    {
        error({
            title: getLangTxt("tip1"),
            iconType: 'exclamation-circle',
            className: 'errorTip',
            content: <div>{getLangTxt("20034")}</div>,
            width: '320px',
            okText: getLangTxt("sure"),
            onOk:()=>{
                this.props.clearThemeProgress()
            }
        });
    }

	onChange(e)
	{
		this.setState({
			personalskin: e.target.value
		});
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		return !Immutable.is(Immutable.fromJS(this.props), Immutable.fromJS(nextProps)) ||
			!Immutable.is(Immutable.fromJS(this.state), Immutable.fromJS(nextState));
	}

	_getThemesComp(themedata, personalskin)
	{
		return themedata.map(({icon, id, label}) => (
			<Radio key={id} value={ id }>
				<Card style={{width: '1.39rem'}} bodyStyle={{padding: 0}} key={id}>
					<div className="custom-image">
						{
							icon != "" ? <img width="100%" src={this._getIconUrl(icon)}/> :
								<img width="100%" style={{background: "#0177d7"}}/>
						}
					</div>
					{
						id == personalskin ? <i className="icon iconfont icon-001zhengque"/> : ''
					}
					<div className="custom-title">
						{label}
					</div>
				</Card>
			</Radio>
		));
	}

	_getIconUrl(value)
	{
		if(!value || value.indexOf("http") > -1)
			return value;

		return require("../../../public/images/skin/thumbnails/" + value + "1.png");
	}

	reFreshFn()
	{
		this.props.fetchTheme();
	}

	render()
	{
		let {theme = {}, progress} = this.props,
			{skin: themedata = [], personalskin} = theme;

		personalskin = this.state.personalskin >= 0 ? this.state.personalskin : personalskin;

		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		return (
			<div className="skin personalise" style={{padding: '0px 10px'}}>
				<RadioGroup onChange={this.onChange.bind(this)}>
					{
						this._getThemesComp(themedata, personalskin)
					}
				</RadioGroup>
				<div className="footer">
					<Button type="ghost" onClick={this.onCancel.bind(this)}>{getLangTxt("cancel")}</Button>
					<Button type="primary" onClick={this.onOk.bind(this)}>{getLangTxt("sure")}</Button>
				</div>
				{
                    _getProgressComp(progress, "submitStatus userSaveStatus")
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	let {personalReducer} = state,
		themeData = personalReducer.get("theme") || Map(),
		theme = themeData.get("data") || {},
		progress = themeData.get("progress");

	return {theme, progress};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({fetchTheme, themeSetting, clearThemeProgress}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SkinSetting);
