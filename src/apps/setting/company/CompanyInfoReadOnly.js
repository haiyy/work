import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Form, Input } from 'antd';
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import CascaderReadOnly from './CascaderReadOnly';
import { is, Map } from "immutable";
import { getCompanyInfomation } from "./redux/companyInfoReducer";
import './style/infomation.scss';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";

let FormItem = Form.Item;

class CompanyInfoReadOnly extends Component {
	constructor(props)
	{
		super(props);
		
		let {companyInfo = Map()} = props,
			info = companyInfo.get("companyInfo") || Map();
		
		this._address = info.toObject();
		
		this.state = {
			name_help: null,
			imgHelp: '#c9c9c9',
			imgTips: `${getLangTxt("setting_select_photos_note1")}260*150`,
			isAvatarModalShow: false,
			imagesInfo: {
				cropResult: null,
				thumbImage: null,
				style: null,
				src: null
			}
		};
	}
	
	componentDidMount()
	{
		this.props.getCompanyInfomation();
	}
	
	componentWillReceiveProps(nextProps)
	{
		let {companyInfo = Map()} = nextProps,
			info = companyInfo.get("companyInfo") || Map(),
			{companyInfo: company = Map()} = this.props,
			oldInfo = company.get("companyInfo") || Map();
		
		if(!is(info, oldInfo) && info.size > 0)
		{
			this._address = info.toObject();
		}
	}
	
	reFreshFn()
	{
		this.props.getCompanyInfomation();
	}
	
	render()
	{
		const {getFieldDecorator} = this.props.form,
			{imgTips} = this.state,
			{companyInfo = Map()} = this.props,
			info = companyInfo.get("companyInfo") || Map(),
			logo = this.state.logo || info.get("logo"),
			progress = companyInfo.get("progress"),
			companyName = info.get("name"),
			minCropBoxSize = {width: 260, height: 150};
		
		this.state.name_help || Object.assign(this.state, {name_help: companyName && companyName.length + "/20"});
		
		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
		
		return (
			<div className="companyInfo_one">
				<div className="CompanyInfo">
					<Form>
						<FormItem className="companyLogo">
							<span className="companyLogoTitle">
                               	{getLangTxt("setting_company_image")}
                            </span>
							{
								info ?
									<div className="fileList">
										<img src={logo} className="logoImg"/>
									</div>
									:
									<div className="avatar">
									</div>
							}
							
							<span style={{
								display: 'inline-block',
								verticalAlign: 'bottom',
								color: this.state.imgHelp,
								marginBottom: '2px',
								marginLeft: '23px'
							}}
							      className="uploadImgTip">
                                {imgTips}
							 </span>
						</FormItem>
						
						<FormItem className="companyInfoMargin" help={this.state.name_help}>
							<span className="companyInfoTitle">{getLangTxt("setting_company_name")}</span>
							{
								getFieldDecorator('name', {
									initialValue: info ? info.get("name") : ""
								})(<Input style={{width: "276px"}} disabled/>)
							}
						</FormItem>
						
						<FormItem className="companyInfoMargin">
							<div>
								<span className="companyAddressTitle">{getLangTxt("setting_company_addr")}</span>
								<CascaderReadOnly address={info}/>
							</div>
						</FormItem>
						
						<FormItem className="companyInfoMargin" help={getLangTxt("setting_company_phone_note")}>
							<span className="companyInfoTitle">{getLangTxt("setting_company_phone")}</span>
							{
								getFieldDecorator('phone', {
									initialValue: info ? info.get("phone") : ""
								})(<Input style={{width: "276px"}} disabled/>)
							}
						</FormItem>
						
						<FormItem className="companyInfo_subBtn">
							<Button className="primary" type="primary" htmlType="submit" disabled>
								{getLangTxt("sure")}
							</Button>
						</FormItem>
					</Form>
				</div>
				{
					_getProgressComp(progress)
				}
			</div>
		)
	}
}

CompanyInfoReadOnly = Form.create()(CompanyInfoReadOnly);

function mapStateToProps(state)
{
	return {
		companyInfo: state.companyInfo
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getCompanyInfomation}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CompanyInfoReadOnly);
