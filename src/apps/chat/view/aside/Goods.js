import React from 'react';
import '../../../../public/styles/chatpage/singleGoods.scss';
import { urlLoader } from "../../../../lib/utils/cFetch";
import Settings from "../../../../utils/Settings";
import { getNoDataComp } from "../../../../utils/ComponentUtils";
import { getLangTxt } from "../../../../utils/MyUtil";

const showKeys = [
	{key: "pn", value: "rightpage_goods_name"},
	{key: "prid", value: "rightpage_goods_id"},
	{key: "mp", value: "rightpage_goods_price"},
	{key: "sp", value: "rightpage_goods_price1"},
	{key: "ca", value: "rightpage_goods_classify"},
	{key: "br", value: "rightpage_goods_brand"}
];

class Goods extends React.Component {
	
	constructor(props)
	{
		super(props);
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(nextProps.chatDataVo.productId)
		{
			this.getProductInfo(nextProps.chatDataVo.productId);
		}
	}
	
	getProductInfo(productId)
	{
		if(productId === -1 || !productId)
			return;
		
		urlLoader(Settings.getProductUrl(productId), {}, "")
		.then((response) => {
			if(!response.jsonResult)
			{
				// console.log("获取数据失败");
			}
			else
			{
				let {chatDataVo = {}} = this.props;
				
				chatDataVo.productInfo = response.jsonResult.params;
				
				this.forceUpdate();
			}
		});
	}
	
	render()
	{
		const {chatDataVo = {}} = this.props,
			{productInfo = null} = chatDataVo;
		
		if(!productInfo)
		{
			return getNoDataComp();
		}
		
		let {iu} = productInfo;
		
		return (
			<div className="singleGoods_box">
				<div className="top_div">
					<div className="singleGoodsMask"/>
					<img src={iu}/>
				</div>
				<dl>
					{
						showKeys.map(item => {
							let value = productInfo[item.key];
							if(value)
							{
								return (
									<dt className="type">
										<span>
											{
												getLangTxt(item.value)
											} :&nbsp;
										</span>
										{
											value
										}
									</dt>
								);
							}
							
							return null;
						})
					}
				</dl>
			</div>
		);
	}
}

export default Goods;
