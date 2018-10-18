//NumberCar 数字卡片
import React,{ Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import NumberCarItem from "./NumberCarItem.js";
import "../scss/NumberCar.scss";
import { getAllOptions } from "../../redux/getAllOptions";
import LogUtil from "../../../../lib/utils/LogUtil";

class NumberCar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cardIconkey: '',
            float:false
        };
    }

    _getWokrDataUI(cardData = [], cardType = [])
    {

        if (!cardData.length)
            return null;

        return cardData.map((item, i) =>
        {
            return (
                <NumberCarItem item={item} i={i} dataType={cardType[i]} />
            )
        });
    }

    render()
    {
        let {requestReportData = [], name} = this.props,
            cardData = requestReportData[name] && requestReportData[name][2],
            height = cardData && cardData.length ? "auto" : "288px",
            Columns = requestReportData[name] && requestReportData[name][1],
            cardType = Columns && Columns.columns;

        return (
            <div className="NumberCar" style={{height}} onClick={(e) => e.stopPropagation()}>
                <div className='filterCard'></div>
                {
                    this._getWokrDataUI(cardData,cardType)
                }
            </div>
        )
    }
}

function log(log, info = LogUtil.INFO)
{
    LogUtil.trace("WorkStatistics", info, log);
}

function mapStateToProps(state)
{
    const {
        requestReportData
    } = state;

    return {
        requestReportData
    };
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({
        getAllOptions
    }, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(NumberCar);



