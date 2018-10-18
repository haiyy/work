import React from "react"
import CalloutTask from "./CalloutTask"
import CallOutTaskdetails from "../util/CallOutTaskdetails"

class ReceptiongroupFlag extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {
			detailsFlag: false,
			currentPage: 1
		};
	}

	componentDidMount()
	{
	}

	onCalloutDetailsType(type,currentPage)
	{
		this.setState({
			detailsFlag: type,
			currentPage: currentPage ? currentPage : this.state.currentPage
		})
	}

	render()
	{
		let {detailsFlag, currentPage} = this.state;

		return (
			<div>
				{
					detailsFlag ?
						<CallOutTaskdetails DetailsShow={this.onCalloutDetailsType.bind(this)}/>
						:
						<CalloutTask DetailsShow={this.onCalloutDetailsType.bind(this)} currentPage={currentPage}/>
				}

			</div>
		);

	}
}

export default (ReceptiongroupFlag);
