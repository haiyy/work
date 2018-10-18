import React from 'react'

class Process extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {}
	}

	render()
	{
		return (
			<div className='distribute-process'>
				<div className='distribute-process-top'>
                    {
                        this.props.data != null ?
                            <span className='bg-top'>
                                <span className='word-top'>
                                    {
                                        this.props.data && this.props.data != "" ? this.props.data : ""
                                    }
                                </span>
                                {
                                    this.props.data && this.props.data != "" ? <span className='bg-top-circle'/> : null
                                }
                            </span>
                            :
                            null
                    }
				</div>
				{
					this.props.blue && this.props.blue != "" ?
						<div className='distribute-process-bottom'>
							<span className='bg-bot'/>
							<span className='word-bot'>
							<span className='bg-bot-circle'/>{this.props.blue}</span>
						</div> : null
				}
			</div>
		)
	}
}

export default Process;
