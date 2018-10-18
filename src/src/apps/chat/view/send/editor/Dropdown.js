import React, {Component} from 'react';
import autobind from '../../../../../components/common/autobind';

type Props = {
  choices: Map<string, string>;
  selectedKey: ?string;
  onChange: (selectedKey: string) => any;
};

export default class Dropdown extends Component {
  props: Props;

  constructor() {
    super(...arguments);
    autobind(this);
  }

  render() {
    let {choices, selectedKey, ...otherProps} = this.props;
    let selectedValue = (selectedKey == null) ? '' : choices.get(selectedKey);
    return (
      <span title={selectedValue}>
        <select {...otherProps} value={selectedKey} onChange={this._onChange} style={{height: '20px', width: '40px',borderRadius: '4px', outline:'none'}}>
          {this._renderChoices()}
        </select>
      </span>
    );
  }

  _onChange(event: Object) {
    let value: string = event.target.value;
    this.props.onChange(value);
  }

  _renderChoices() {
    let {choices} = this.props;
    let entries = Array.from(choices.entries());
    return entries.map(([key, text]) => (
      <option key={key} value={key}>{text}</option>
    ));
  }
}
