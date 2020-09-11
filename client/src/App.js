// /client/App.js
import React, { Component } from 'react';
import axios from 'axios';
import * as math from 'mathjs';
import "./App.css"

class App extends Component {
  // initialize our state
  state = {
    calculationLog: [],
    expression: "0",
    displayTextContent: '0',
    modValue: '',
    operator: '',
    previousKeyType: '',
    clearButtonText: "AC",
  };
  componentDidMount() {
    const calculator = document.querySelector('.calculator');
    const keys = calculator.querySelector('.calculator__keys');
    const display = document.querySelector('.calculator__display');

    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    const clearResult = () => {
      this.setState({
        expression: "0",
        displayTextContent: '0',
        modValue: '',
        operator: '',
        previousKeyType: ''
      });
    }

    keys.addEventListener('click', e => {
      if (e.target.matches('button')) {
        const key = e.target;
        const keyContent = key.textContent;
        const previousKeyType = this.state.previousKeyType;
        
        if (isNumeric(keyContent)) {
          if (this.state.expression === "0") {
            this.setState({expression: ""});
          }
          this.setState({
            expression: `${this.state.expression}${keyContent}`,
            previousKeyType: 'number'
          });
        }
        // user pressed an operator
        switch (keyContent) {
          case "+": //fallthrough
          case "-": 
          case "*": 
          case "/": 
            if (previousKeyType !== 'number') {
              return;
            }
            this.setState({
              expression: this.state.expression + keyContent,
              previousKeyType: 'operator',
              operator: keyContent
            });
            break;
          case ".":
            if(this.state.expression.endsWith(".")){
              return;
            }
            this.setState({
              expression: this.state.expression + ".",
            });
            break;
          case "AC": clearResult();
            break;
          case "=":
            if (previousKeyType !== 'number') {
              return;
            }
            const result = math.evaluate(this.state.expression);
            this.setState({
              expression: this.state.expression + ` = ${result}`
            });
            this.state.calculationLog.unshift(this.state.expression);
            axios.post(`/api/expressions`, {
              expression: this.state.expression,
            });
            clearResult()
            break;
        }
      }
    })
    this.fetchExpressions();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.fetchExpressions, 1000);
      this.setState({ intervalIsSet: interval });
    }
  }

  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  fetchExpressions = () => {
    fetch(`/api/expressions`, { method: "GET" })
      .then((data) => {
        data
          .text()
          .then((text) => {
            try {
              let parsed = JSON.parse(text);
              this.setState({ calculationLog: parsed.data.map((d) => d.expression) });
            } catch (e) {
              console.error(e);
            }
          })
      })
  };

  render() {
    return (
      <div className="calculator">
        <div className="calculator__controls">
          <div className="calculator__display">{this.state.expression}</div>
          <div className="calculator__keys">
            <button>+</button>
            <button>-</button>
            <button>*</button>
            <button>/</button>
            <button>7</button>
            <button>8</button>
            <button>9</button>
            <button>4</button>
            <button>5</button>
            <button>6</button>
            <button>1</button>
            <button>2</button>
            <button>3</button>
            <button>0</button>
            <button data-action="decimal">.</button>
            <button data-action="clear">AC</button>
            <button className="key--equal" data-action="calculate">=</button>
          </div>
        </div>
        <div className="calculator__history">
          <h3>History</h3>
          {this.state.calculationLog.map((item) => <div id="calculation--log">{item}</div>)}
        </div>
      </div>
    );
  }
}

export default App;
