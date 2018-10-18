import React, { Component } from 'react'
import './scss/loading.scss'
import { Spin } from 'antd'

class Loading extends Component {
  render () {
  	  let style = this.props.position ? {position: this.props.position} : {};
      return(
	      <div className="loading" style={style}>
              <Spin style={{
								width: "100%",
								height: "100%",
								display: "flex",
								justifyContent: "center",
								alignItems: "center"
							}}/>
	      </div>
      )
  }
}

export default Loading;
