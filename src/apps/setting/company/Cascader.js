import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Input, Form } from 'antd';
import { getCity, getProvince, getRegion } from "./redux/companyInfoReducer";
import { is, List, Map } from "immutable";
import { getLangTxt, shallowEqual } from "../../../utils/MyUtil";
import { stringLen, bglen, ruleForLenght, getHelp } from "../../../utils/StringUtils";
import '../autoResponder/style/autoAnswer.scss';
import Select from "../../public/Select";
import checkLength from "../../../components/checkLength";

const Option = Select.Option,
    FormItem = Form.Item;

class Cascader extends React.Component {

    constructor(props)
    {
        super(props);

        const {address = Map()} = props,
            addressObj = address.toObject();

        this.state = {...addressObj};

        this.getAddress = typeof props.getAddress === "function" ? props.getAddress : () => {
        };
    }

    componentWillReceiveProps(nextProps)
    {
        const {address} = nextProps,
            {address: oldAddr} = this.props;

        if(!is(address, oldAddr))
        {
            const addressObj = address.toObject();
            this.setState({...addressObj});

            let {country, city, province} = addressObj;
            this.props.getRegion(0);
            this.props.getProvince(1);

            if(province)
            {
                this.props.getCity(province);
            }
            else
            {
                this.props.getCity(107);
            }

        }
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        const {companyInfo, address} = nextProps,
            {companyInfo: old, address: oldAddr} = this.props;

        return !is(address, oldAddr) || !is(companyInfo, old) || !shallowEqual(nextState, this.state);
    }

    componentDidUpdate()
    {
        this._getProvince();

    }

    countryChange(cur, value, {props: {data}})
    {
        if(!data/* || cur == data.get("name")*/)
            return;

        /*this.props.getProvince(value);

         if(data)
         {
         const address = {country: data.get("id"), province: "", city: "", street:""};
         this.getAddress(address);
         this.setState({...address});
         }*/
    }

    provinceChange(cur, value, {props: {data}})
    {
        if(!data)
            return;

        this.props.getCity(value);

        if(data)
        {
            this.props.form.setFieldsValue({"selectThir": ""});
            const address = {...this.state.address, province: data.get("id"), city: ""};
            this.getAddress(address);
            this.setState({...address});
        }
    }

    cityChange(value, {props: {data}})
    {
        if(data)
        {
            const address = {...this.state.address, city: data.get("id")};
            this.getAddress(address);
            this.setState({...address});
        }
    }

    judgeStreetLen(rule, value, callback)
    {
        if(bglen(value) <= 40)
        {
            callback();
        }

        callback(" ");
    }

    _onChange({target: {value}})
    {
        const address = {...this.state.address, street: value};
        this.getAddress({street: value});
        this.setState({...address});
       
    }

    _getProvince()
    {
        let {companyInfo, address = Map()} = this.props,
            province = companyInfo.get("province") || List(),
            countryId = address.get("country") || "1";
        if(province.size > 0)
            return;
        this.props.getProvince(countryId);
    }

    normalizeAll(value)
    {
        return checkLength(value,40)
    }

    getRegionOption(treeData, treeDataSuccess, isProvince)
    {
        let value = isProvince ? "10" : "0";
        return treeDataSuccess != false ?
            treeData.map((item) =>
            {
                const name = item && item.get("name"),
                    id = item && item.get("id");

                return <Option key={id} value={id} data={item}>{name}</Option>
            })
            :
            <Option value={value} disabled>Not Found</Option>
    }

    render()
    {
        let {companyInfo, address = Map()} = this.props,
            region = companyInfo.get("region") || List(),
            province = companyInfo.get("province") || List(),
            city = companyInfo.get("city") || List(),
            regionDataSuccess = region.get("success"),
            provinceDataSuccess = province.get("success"),
            cityDataSuccess = city.get("success"),
            countryId = address.get("country") || "1", //中国
            provinceId = address.get("province") || "107", //北京
            cityId = address.get("city") || "1096", //北京
            {street: stt} = this.state,
            streetStr = !stt ? (address.get("street") || "") : stt;

        const {getFieldDecorator, getFieldValue, getFieldsValue} = this.props.form;

        return (
            <div style={{display: "inline-block", position: "relative"}}>
                <Form>
                    <FormItem style={{position: "relative"}} className="selectFormItem" help={getFieldValue("selectFir") != "" ? "" : getLangTxt("please_select")}
                        validateStatus={getFieldValue("selectFir") != "" ? "" : "error"}>
                        {getFieldDecorator('selectFir', {
                            initialValue: countryId,
                            rules: [
                                {required: true, message: ' '}
                            ]
                        })(
                            <Select style={{width: "276px"}}
                                getPopupContainer={() => document.querySelector(".selectFormItem")}
                                onSelect={this.countryChange.bind(this, countryId)}
                                option={this.getRegionOption(region, regionDataSuccess)}
                            />
                        )}
                    </FormItem>

                    <FormItem help={getFieldValue("selectSec") != "" ? "" : getLangTxt("please_select")}
                        validateStatus={getFieldValue("selectSec") != "" ? "" : "error"}>
                        {getFieldDecorator('selectSec', {
                            initialValue: provinceId,
                            rules: [
                                {required: true, message: ' '}
                            ]
                        })(
                            <Select style={{width: "276px"}}
                                getPopupContainer={() => document.querySelector(".ant-layout-aside")}
                                onSelect={this.provinceChange.bind(this, provinceId)}
                                option={this.getRegionOption(province, provinceDataSuccess, true)}
                            />
                        )}
                    </FormItem>

                    <FormItem help={getFieldValue("selectThir") != "" ? "" : getLangTxt("please_select")}
                        validateStatus={city.size < 1 || getFieldValue("selectThir") != "" ? "" : "error"}>
                        {getFieldDecorator('selectThir', {
                            initialValue: cityId
                        })(
                            <Select style={{width: "276px"}}
                                getPopupContainer={() => document.querySelector(".ant-layout-aside")}
                                onSelect={this.cityChange.bind(this)}
                                option={this.getRegionOption(city, cityDataSuccess)}
                            />
                        )}
                    </FormItem>

                    <FormItem help={getHelp(streetStr, 40)}>
                        {getFieldDecorator('selectFou', {
                            initialValue: streetStr,
                            rules: [{validator: ruleForLenght.bind(this, 40)}],
                            normalize: this.normalizeAll,
                        })(
                            <Input style={{width: '276px'}} onChange={this._onChange.bind(this)}  />
                        )}
                    </FormItem>
                </Form>
            </div>
        )
    }
}

Cascader = Form.create()(Cascader);

function mapStateToProps(state)
{
    const {companyInfo} = state;

    return {companyInfo};
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({getRegion, getProvince, getCity}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Cascader);
