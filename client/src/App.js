import React, {Component} from 'react';
import axios from 'axios';
import * as math from 'mathjs';
import './App.css';

class App extends Component {
  state = {
    calculationLog: [],
    expression: '0',
    operator: '',
    previousKeyType: '',
    previousCalculation: '',
  };
  clear = () => {
    this.setState({
      expression: '0',
      modValue: '',
      operator: '',
      previousKeyType: '',
    });
  };

  handleClick = (event) => {
    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    const keyContent = event.currentTarget.textContent;
    const previousKeyType = this.state.previousKeyType;

    if (isNumeric(keyContent)) {
      this.setState({
        expression: `${this.state.expression === '0'
            ? ''
            : this.state.expression}${keyContent}`,
        previousKeyType: 'number',
      });
    }
    // user pressed an operator
    switch (keyContent) {
      case '+': //fallthrough
      case '-':
      case '*':
      case '/':
        if (previousKeyType !== 'number') {
          return;
        }
        this.setState({
          expression: this.state.expression + keyContent,
          previousKeyType: 'operator',
          operator: keyContent,
        });
        break;
      case '.':
        if (this.state.expression.endsWith('.')) {
          return;
        }
        if (this.state.previousKeyType !== "number"){
          this.setState({
            expression: this.state.expression + '.',
          });
        }
        break;
      case 'AC':
        this.clear();
        break;
      case '=':
        if (previousKeyType !== 'number') {
          return;
        }
        const result = `${this.state.expression} = ${math.evaluate(
            this.state.expression)}`;
        this.setState({
          previousCalculation: result,
        });
        this.state.calculationLog.unshift(result);
        axios.post(`/api/expressions`, {
          expression: result,
        }).catch((e) => console.error(`Error while trying to post: ${e}`));
        this.clear();
        break;
      default:
        return;
    }
  };

  componentDidMount() {
    this.fetchExpressions();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.fetchExpressions, 1000);
      this.setState({intervalIsSet: interval});
    }
  }

  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({intervalIsSet: null});
    }
  }

  fetchExpressions = () => {
    fetch(`/api/expressions`, {method: 'GET'}).then((data) => {
      data.text().then((text) => {
        try {
          let parsed = JSON.parse(text);
          this.setState({calculationLog: parsed.data.map((d) => d.expression)});
        } catch (e) {
          console.error(e);
        }
      });
    });
  };

  render() {
    const buttons = [
      '+',
      '-',
      '*',
      '/',
      '7',
      '8',
      '9',
      '4',
      '5',
      '6',
      '1',
      '2',
      '3',
      '0',
      '.',
      'AC',
    ].map((button) => <button
        onClick={(event) => this.handleClick(event)}>{button}</button>);
    return (
        <div className="calculator">
          <div className="calculator__display">
            <div className="calculator__previous">{this.state.previousCalculation}</div>
            <div className="calculator__expression">{this.state.expression}</div>
            <div className="calculator__keys">
              {buttons}
              <button onClick={(event) => this.handleClick(event)} className="key--equal">=</button>
            </div>
          </div>
          <div className="calculator__history">
            <h3>History</h3>
            <ul style={{'list-style-type': 'none'}}>
              {this.state.calculationLog.map(
                  (item) => <li id="calculation--log">{item}</li>)}
            </ul>
          </div>
        </div>
    );
  }
}

export default App;
