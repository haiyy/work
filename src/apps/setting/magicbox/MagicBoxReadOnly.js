import React from 'react';
import { connect } from 'react-redux';
import { Table, message, Tooltip } from 'antd';
import { bindActionCreators } from 'redux';
import './style/magicBox.scss';
import { getMagicBoxList } from "./reducer/magicBoxReducer";
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import ImageView from "../../chat/view/pictureviewer/ImageView";
import NTDragView from "../../../components/NTDragView";
import copy from 'copy-to-clipboard';
import Portal from "../../../components/Portal";

class MagicBoxReadOnly extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		this.state = {
			copyText: '',
			yulanImg: false
		}
	}
	
	componentDidMount()
	{
		this.props.getMagicBoxList();
	}
	
	previewImg(data)
	{
		this.setState({
			yulan: true,
			data
		})
	}
	
	_onClose()
	{
		this.setState({
			yulan: false
		})
	}
	
	getImgModal()
	{
		let {data} = this.state;
		return (
			<Portal>
				<NTDragView enabledDrag={true} enabledClose={true} wrapperProps={{width: 630, height: 600}}
				            _onClose={this._onClose.bind(this)}>
					<ImageView
						images={data.thumbnailimage.split(",")}
						currentImage={0}
					/>
				</NTDragView>
			</Portal>
		);
	}
	
	render()
	{
		let {magicData} = this.props,
			{yulan} = this.state,
			magicList = magicData.getIn(["magicBoxList"]).length ? magicData.getIn(["magicBoxList"]) : [],
			progress = magicData.getIn(["progress"]),
			pagination = {
				showTotal: (total) => {
					return getLangTxt("total", total);
				}
			};
		
		const columns = [{
			key: 'rank',
			dataIndex: 'rank',
			title: '',
			width: '10%'
		}, {
			key: 'name',
			dataIndex: 'name',
			title: getLangTxt("setting_hypermedia_name"),
			width: '40%',
			render: (record) => {
				return (
					<div>{record}</div>
				)
			}
		}, {
			key: 'pname',
			dataIndex: 'pname',
			title: getLangTxt("setting_hypermedia_type"),
			width: '40%'
		}, {
			key: 'operate',
			title: getLangTxt("operation"),
			width: '10%',
			render: (record, data) => {
				return (
					<div className="handleWrapper">
						<Tooltip placement="bottom" title={getLangTxt("preview")}>
							<i className="iconfont icon-yulan1" onClick={this.previewImg.bind(this, data)}/>
						</Tooltip>
					</div>
				)
			}
		}];
		
		return (
			<div className="magicBoxWrapper">
				<Table dataSource={magicList} columns={columns} pagination={pagination}/>
				{
					getProgressComp(progress)
				}
				{
					yulan ? this.getImgModal() : null
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		magicData: state.magicBoxReducer
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getMagicBoxList}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MagicBoxReadOnly);
