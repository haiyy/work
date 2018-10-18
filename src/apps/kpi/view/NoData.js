import React, { Component } from 'react'
import './scss/nodata.scss'

class NoData extends Component {
	render () {
		let style = this.props.style ? this.props.style : {};
		return(
                <div className="noData" style={style}>
                    <div className='text'>暂无数据</div>
                </div>

		)
	}
}

export default NoData;
