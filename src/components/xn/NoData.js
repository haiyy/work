import React from 'react';
import "./style/noData.less";
import { getLangTxt } from "../../utils/MyUtil";
import classNames from 'classnames';

/**
 * NoData
 * props传值
 * text 1. 多语言变量（noData，noData1-noData5, searchNoData）
 *      2. 多语言没有匹配到则显示text
 *      3. 默认值为：noData -> 暂无数据
 * className 样式名称 searchNoData
 * style 样式对象  {margin: "100px auto"}
 * */
class NoData extends React.PureComponent {
	constructor(props)
	{
		super(props);
	}
	
	render()
	{
		let {text, className, search} = this.props,
			noDataText = getLangTxt(text || "noData1") || text,
			imageName = search ? "noData" : "noData";
		
		return (
			<div className={classNames({"noData":true}, className)} style={this.props.style}>
				<img src={require(`./images/${imageName}.png`)}/>
				<p>{noDataText}</p>
			</div>
		);
	}
}

/**
 * SearchNoData
 * 未搜索到内容
 * */
export class SearchNoData extends React.PureComponent {
	constructor(props)
	{
		super(props);
	}
	
	render()
	{
		return <NoData text="searchNoData" search {...this.props}/>
	}
}

export default NoData;
