import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Button, Form, Input} from 'antd';
import {upload, UPLOAD_IMAGE_ACTION, _getProgressComp, getLangTxt} from "../../../utils/MyUtil";
import Cascader from './Cascader';
import {is, Map} from "immutable";
import {getCompanyInfomation, modifyCompanyInfo} from "./redux/companyInfoReducer";
import './style/infomation.scss';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import {ReFresh} from "../../../components/ReFresh";
import NTModal from "../../../components/NTModal";
import Uploads from "../personal/Upload";
import {bglen, getHelp, ruleForLenght} from "../../../utils/StringUtils";

let FormItem = Form.Item;

class CompanyInfo extends Component {

    constructor(props) {
        super(props);

        let {companyInfo = Map()} = props,
            info = companyInfo.get("companyInfo") || Map();

        this._address = info.toObject();

        this.state = {
            name_help: null,
            imgHelp: '#999',
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

    componentDidMount() {
        this.props.getCompanyInfomation();
    }

    componentWillReceiveProps(nextProps) {
        let {companyInfo = Map()} = nextProps,
            info = companyInfo.get("companyInfo") || Map(),
            {companyInfo: company = Map()} = this.props,
            oldInfo = company.get("companyInfo") || Map();

        if (!is(info, oldInfo) && info.size > 0) {
            this._address = info.toObject();
        }
    }

    submit(e) {
        e.preventDefault();

        let {form, companyInfo} = this.props,
            allCity = companyInfo.get("city") || List();

        form.validateFields((errors) => {
            if (errors)
                return false;

            let fromData = form.getFieldsValue(),
                {name, phone} = fromData,
                {city, street, country = "1", province} = this._address;

            if (street && bglen(street) > 40 || city == "" && allCity.size > 0)
                return false;

            let companyInfoData = {
                name, phone, city, street, country: "1", province,
                logo: this.state.logo ? this.state.logo : ""
            };

            this.setState({
                imgHelp: "#999"
            });

            this.props.modifyCompanyInfo(companyInfoData);
        });
    }

    _getAddress(value) {
        Object.assign(this._address, value);
    }

    handleCancel() {
        this.setState({previewVisible: false})
    };

    setNameHelp({target: {value}}) {
        this.setState({name_help: getHelp(value || "", 40)});
    }

    reFreshFn() {
        this.props.getCompanyInfomation();
    }

    //点击弹出上传头像组件
    handleUploadAvatar() {
        this.setState({isAvatarModalShow: true})
    }

    //点击保存头像
    handleAvatarOk() {
        this.setState({isAvatarModalShow: false})
    }

    //点击取消保存头像
    handleAvatarCancel() {
        this.setState({isAvatarModalShow: false})
    }

    getCroperImage(srcData) {
        let cropResult = srcData.cropResult,
            type = UPLOAD_IMAGE_ACTION, imagesInfo = this.state.imagesInfo;

        upload(cropResult, type, true)
            .then((res) => {
                let jsonResult = res.jsonResult,
                    {data = {srcFile: {}, thumbnailImage: {}}, success} = jsonResult,
                    {srcFile = {}, thumbnailImage = {}} = data;

                if (!success) {
                    this.setState({
                        imgHelp: "#f50",
                        imgTips: getLangTxt("20031")
                    });
                    return;
                }

                imagesInfo.cropResult = srcFile.url;
                imagesInfo.thumbImage = thumbnailImage.url;
                imagesInfo.style = srcData.style;
                this.setState({imagesInfo: {...imagesInfo}});
                this.setState({logo: srcFile.url, logoThumb: thumbnailImage.url, imgTips: getLangTxt("20036")});
            });
    }

    companyNameRule(rule, value, callback) {
        if (value && value.trim() && bglen(value) <= 40) {
            callback();
            return;
        }

        callback(" ");
    }

    render() {
        let {getFieldDecorator} = this.props.form,
            {imgTips, isAvatarModalShow} = this.state,
            {companyInfo = Map()} = this.props,
            info = companyInfo.get("companyInfo") || Map(),
            logo = this.state.logo || info.get("logo"),
            progress = companyInfo.get("progress"),
            companyName = info.get("name"),
            title = (
                <span>
					<i style={{position: "relative", top: "2px", paddingRight: "5px"}}
                       className="icon iconfont icon-ren"/> {getLangTxt("setting_change_avatar")}
				</span>
            ),
            minCropBoxSize = {width: 260, height: 150};

        this.state.name_help || Object.assign(this.state, {name_help: companyName && getHelp(companyName, 40)});

        if (progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        return (
            <div className="companyInfo_one">
                <div className="CompanyInfo">
                    <Form onSubmit={this.submit.bind(this)}>
                        <FormItem className="companyLogo">
							<span className="companyLogoTitle">
								{getLangTxt("setting_company_image")}
                            </span>
                            {
                                logo ?
                                    <div className="fileList" onClick={this.handleUploadAvatar.bind(this)}>
                                        <img src={logo} className="logoImg"/>
                                        <span className="change-image">
	                                        {getLangTxt("modify")}
                                        </span>
                                    </div>
                                    :
                                    <div className="avatar" onClick={this.handleUploadAvatar.bind(this)}>
                                        <i className="iconfont icon-tianjia1 uploadPlus"/>
                                        <div className="ant-upload-text">Upload</div>
                                    </div>
                            }

                            {
                                isAvatarModalShow ?
                                    <NTModal title={title} style={{height: "550px"}} footer={null}
                                             okText={getLangTxt("save")}
                                             className="model-upload companyInfoAvastar" width={820} visible={true}
                                             onCancel={this.handleAvatarCancel.bind(this)}>
                                        <Uploads getCroperImage={this.getCroperImage.bind(this)}
                                                 onOk={this.handleAvatarOk.bind(this)}
                                                 onCancel={this.handleAvatarCancel.bind(this)}
                                                 imagesInfo={this.state.imagesInfo}
                                                 minCropBoxSize={minCropBoxSize}
                                        />
                                    </NTModal> : null
                            }

                            <span style={{
                                display: 'inline-block', verticalAlign: 'bottom', color: this.state.imgHelp,
                                marginBottom: '2px', marginLeft: '23px'
                            }}
                                  className="uploadImgTip">
                                {imgTips}
							 </span>
                        </FormItem>

                        <FormItem className="companyInfoMargin" help={this.state.name_help}>
                            <span className="companyInfoTitle">{getLangTxt("setting_company_name")}</span>
                            {
                                getFieldDecorator('name', {
                                    initialValue: info ? info.get("name") : "",
                                    rules: [{required: true, validator: this.companyNameRule.bind(this), message: ' '}]
                                })(<Input style={{width: "276px"}} onKeyUp={this.setNameHelp.bind(this)}/>)
                            }
                        </FormItem>

                        <FormItem className="companyInfoMargin">
                            <div>
                                <span className="companyAddressTitle">{getLangTxt("setting_company_addr")}</span>
                                <Cascader address={info} getAddress={this._getAddress.bind(this)}/>
                            </div>
                        </FormItem>

                        <FormItem className="companyInfoMargin" help={getLangTxt("setting_company_phone_note")}>
                            <span className="companyInfoTitle">{getLangTxt("setting_company_phone")}</span>
                            {
                                getFieldDecorator('phone', {
                                    initialValue: info ? info.get("phone") : "",
                                    rules: [{pattern: /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/}]
                                })(<Input style={{width: "276px"}}/>)
                            }
                        </FormItem>

                        <FormItem className="companyInfo_subBtn">
                            <Button type="primary" htmlType="submit" disabled={progress == LoadProgressConst.SAVING}>
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

CompanyInfo = Form.create()(CompanyInfo);

function mapStateToProps(state) {
    return {
        companyInfo: state.companyInfo
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getCompanyInfomation, modifyCompanyInfo}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CompanyInfo);
