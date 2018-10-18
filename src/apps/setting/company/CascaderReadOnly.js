import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Input, Select, Form } from 'antd';
import { getCity, getProvince, getRegion } from "./redux/companyInfoReducer";
import { is, List, Map } from "immutable";
import { getLangTxt, shallowEqual } from "../../../utils/MyUtil";
import { stringLen, bglen } from "../../../utils/StringUtils";
import '../autoResponder/style/autoAnswer.scss';
const Option = Select.Option;
let FormItem = Form.Item;
class CascaderReadOnly extends React.Component {

	constructor(props)
	{
		super(props);

		const {address = Map()} = props,
			addressObj = address.toObject();

		this.state = {...addressObj};

		this.getAddress = typeof props.getAddress === "function" ? props.getAddress : () =>
		{
		};
	}

	componentWillReceiveProps(nextProps)
	{
		const {address} = nextProps,
			{ address: oldAddr} = this.props;

		if(!is(address, oldAddr))
		{
			const addressObj = address.toObject();
			this.setState({...addressObj});

            let {country, city, province} = addressObj;
            this.props.getRegion(0);
            this.props.getProvince(1);

            if (province)
            {
                this.props.getCity(province);
            }else
            {
                this.props.getCity(107);
            }

		}
	}

	shouldComponentUpdate(nextProps,nextState)
	{
		const {companyInfo,address} = nextProps,
			{companyInfo:old,address:oldAddr} = this.props;

		return !is(address,oldAddr) || !is(companyInfo, old) || !shallowEqual(nextState, this.state);
	}

	render()
	{
		let {companyInfo, address = Map()} = this.props,
			region = companyInfo.get("region") || List(),
			province = companyInfo.get("province") || List(),
			city = companyInfo.get("city") || List(),
            regionDataSuccess = region.get("success"),
            provinceDataSuccess= province.get("success"),
            cityDataSuccess = city.get("success"),
            countryId = address.get("country") || "1", //中国
			provinceId = address.get("province") || "107", //北京
			cityId = address.get("city") || "1096", //北京
            {street: stt} = this.state,
			streetStr = stt === undefined ? address.get("street") || "" :  stt;

        let streetByteLen = streetStr && stringLen(streetStr) || 0;

		const { getFieldDecorator, getFieldValue } = this.props.form;

		return (
			<div style={{display: "inline-block", position: "relative"}}>
				<Form>
					<FormItem help={getFieldValue("selectFir") !="" ? "" : getLangTxt("please_select")} validateStatus = {getFieldValue("selectFir") != "" ? "" : "error"}>
						{getFieldDecorator('selectFir', {
							initialValue: countryId
						})(
							<Select disabled style={{width: "276px", marginBottm:"20px"}}
                                getPopupContainer={()=>document.querySelector(".ant-layout-aside")}>
								{
                                    regionDataSuccess != false ?
                                        region.map((item) =>
                                        {
                                                const name = item && item.get("name"),
                                                    id = item && item.get("id");

                                                return (<Option key={id} value={id} data={item}>{name}</Option>)

                                        }) : <Option value={"0"} disabled>Not Found</Option>
								}
							</Select>
						)}
					</FormItem>

					<FormItem help={getFieldValue("selectSec") != "" ? "" : getLangTxt("please_select")} validateStatus = {getFieldValue("selectSec") != "" ? "" : "error"}>
						{getFieldDecorator('selectSec', {
							initialValue: provinceId
						})(
							<Select disabled style={{width: "276px"}}
                                getPopupContainer={()=>document.querySelector(".ant-layout-aside")}>
								{
                                    provinceDataSuccess != false ?
                                        province.map((item) =>
                                        {
                                            const name = item&&item.get("name"),
                                                id = item&&item.get("id");

                                            return (<Option key={id} value={id} data={item}>{name}</Option>)
                                        })
                                        :
                                        <Option value={"10"} disabled>Not Found</Option>
								}
							</Select>
						)}
					</FormItem>

                    <FormItem help={getFieldValue("selectThir") !="" ? "" : getLangTxt("please_select")} validateStatus = {city.size < 1 || getFieldValue("selectThir") != "" ? "" : "error"}>
                        {getFieldDecorator('selectThir', {
                            initialValue: cityId
                        })(
                            <Select disabled style={{width: "276px"}}
                                getPopupContainer={()=>document.querySelector(".ant-layout-aside")}>
                                {
                                    cityDataSuccess != false ?
                                        city.map((item) =>
                                        {
                                            const name = item&&item.get("name"),
                                                id = item&&item.get("id");

                                            return (<Option key={id} value={id} data={item}>{name}</Option>)
                                        })
                                        :
                                        <Option value={"0"} disabled>Not Found</Option>
                                }
                            </Select>
                        )}
                    </FormItem>

					<FormItem help={streetStr ? streetByteLen + "/20" : "0/20"}>
						{getFieldDecorator('selectFou', {
							initialValue: streetStr
						})(
							<Input style={{width:'276px'}} disabled />
						)}
					</FormItem>
				</Form>
			</div>
		)
	}
}
CascaderReadOnly = Form.create()(CascaderReadOnly);

function mapStateToProps(state)
{
	const {companyInfo} = state;

	return {companyInfo};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getRegion, getProvince, getCity}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CascaderReadOnly);
