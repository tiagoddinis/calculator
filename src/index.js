import React from 'react'
import ReactDom from 'react-dom';
import { evaluate } from 'mathjs';
import './calculator.css';

function Button(props) {
    return <button type="submit" className={props.style} onClick={props.onClick}>{props.value}</button>;
}

const btnList = [
    { value: '(', style: "greyButton"},
    { value: ')', style: "greyButton"},
    { value: 'AC', style: "greyButton"},
    { value: '÷', style: "yellowButton"},
    { value: '7', style: "greyButton"},
    { value: '8', style: "greyButton"},
    { value: '9', style: "greyButton"},
    { value: '×', style: "yellowButton"},
    { value: '4', style: "greyButton"},
    { value: '5', style: "greyButton"},
    { value: '6', style: "greyButton"},
    { value: '-', style: "yellowButton"},
    { value: '1', style: "greyButton"},
    { value: '2', style: "greyButton"},
    { value: '3', style: "greyButton"},
    { value: '+', style: "yellowButton"},
    { value: '0', style: "greyButton"},
    { value: '.', style: "greyButton"},
    { value: 'Ans', style: "greyButton"},
    { value: '=', style: "greenButton"},];

function addToCurrent(newState, newContext, toAdd, replace = false) {
    newState.current = replace ? newState.current.slice(0, -1) + toAdd : newState.current + toAdd;
    newState.context = newContext;
}

function addDot(newState, newContext, toAdd, replace = false) {
    newState.isFloat = true;
    addToCurrent(newState, newContext, toAdd, replace)
}

function addParenthesis(newState, newContext, toAdd, replace = false) {
    newContext === "(" ? newState.openParenthesis++ : newState.openParenthesis--;
    addToCurrent(newState, newContext, toAdd, replace)
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            context: "0",
            isFloat: false,
            openParenthesis: 0,
            previous: '',
            current: '0',
            ans: 0,
        };
        this.onClick = this.onClick.bind(this);
        this.contextFuncList = {
            "0": this.onLeftZero.bind(this),
            "." : this.onDot.bind(this),
            "number" : this.onNumber.bind(this),
            "Ans" : this.onAns.bind(this),
            "operator" : this.onOperator.bind(this),
            "(" : this.onLeftParenthesis.bind(this),
            ")" : this.onRightParenthesis.bind(this),
            "=" : this.onEqual.bind(this),
        };
    }

    onClick(btnLabel) {
        this.setState((state) => {
            let newState = JSON.parse(JSON.stringify(state));
            const isNumber = /[0-9]/.test(btnLabel);
            const isOperator = /÷|×|-|\+/.test(btnLabel);
            this.contextFuncList[newState.context](btnLabel, newState, isNumber, isOperator);
            console.log(newState.context);
            console.log(newState.isFloat);
            return newState;
        });
    }

    onLeftZero(btnValue, ns, isNumber, isOperator) {
        if (btnValue === ".") addDot(ns, "number", btnValue);
        else if (isNumber && btnValue !== "0") addToCurrent(ns, "number", btnValue, true);
        else if (btnValue === "Ans") addToCurrent(ns, btnValue, btnValue, true);
        else if (isOperator) {
            if (ns.current.length === 1 && btnValue === "-") ns.current = btnValue;
            else ns.current += btnValue;
            ns.context = "operator";
        }
        else if (btnValue === "(") addParenthesis(ns, btnValue, btnValue, true);
        else if (ns.openParenthesis > 0 && btnValue === ")") addParenthesis(ns, btnValue, btnValue);
        else if (btnValue === "=") this.onEvalRequest(ns);
        else if (btnValue === "AC") this.setACContext(ns);
    }

    onDot(btnValue, ns, isNumber) {
        if (isNumber) addToCurrent(ns, "number", btnValue);
        else if (btnValue === "Ans") {
            ns.isFloat = false;
            addToCurrent(ns, btnValue, btnValue, true);
        }
        else if (btnValue === "(") {
            ns.isFloat = false;
            addParenthesis(ns, btnValue, btnValue, true);
        }
        else if (btnValue === "AC") this.setACContext(ns);
    }

    onNumber(btnValue, ns, isNumber, isOperator) {
        if (!ns.isFloat && btnValue === ".") addDot(ns, btnValue, btnValue);
        else if (isNumber) addToCurrent(ns, "number", btnValue);
        else if (btnValue === "Ans") {
            ns.isFloat = false;
            addToCurrent(ns, btnValue, "×" + btnValue);
        }
        else if (btnValue === "(") {
            ns.isFloat = false;
            addParenthesis(ns, btnValue, "×" + btnValue);
        }
        else if (ns.openParenthesis > 0 && btnValue === ")") {
            ns.isFloat = false;
            addParenthesis(ns, btnValue, btnValue);
        }
        else if (isOperator) {
            ns.isFloat = false;
            addToCurrent(ns, "operator", btnValue);
        }
        else if (btnValue === "=") this.onEvalRequest(ns);
        else if (btnValue === "AC") this.setACContext(ns);
    }

    onAns(btnValue, ns, isNumber, isOperator) {
        if (btnValue === "0") addToCurrent(ns, btnValue, "×" + btnValue);
        else if (btnValue === ".") addDot(ns, btnValue, "×" + btnValue);
        else if (isNumber) addToCurrent(ns, "number", "×" + btnValue);
        else if (btnValue === "Ans") addToCurrent(ns, btnValue, "×" + btnValue);
        else if (isOperator) addToCurrent(ns, "operator", btnValue);
        else if (btnValue === "(") addParenthesis(ns, btnValue, "×" + btnValue);
        else if (ns.openParenthesis > 0 && btnValue === ")") addParenthesis(ns, btnValue, btnValue);
        else if (btnValue === "=") this.onEvalRequest(ns);
        else if (btnValue === "AC") this.setACContext(ns);
    }

    onOperator(btnValue, ns, isNumber, isOperator) {
        if (btnValue === "0") addToCurrent(ns, btnValue, btnValue);
        else if (btnValue === ".") addDot(ns, btnValue, btnValue);
        else if (isNumber) addToCurrent(ns, "number", btnValue);
        else if (btnValue === "Ans") addToCurrent(ns, btnValue, btnValue);
        else if (isOperator) {
            let currentChar = ns.current.charAt(ns.current.length - 1);
            if (btnValue === "-" && (currentChar === "÷" || currentChar === "×")) {
                ns.current += btnValue;
            } else ns.current = ns.current.slice(0, -1) + btnValue;
        }
        else if (btnValue === "(") addParenthesis(ns, btnValue, btnValue);
        else if (btnValue === "AC") this.setACContext(ns);
    }

    onLeftParenthesis(btnValue, ns, isNumber) {
        if (btnValue === "0") addToCurrent(ns, btnValue, btnValue);
        else if (btnValue === ".") addDot(ns, btnValue, btnValue);
        else if (isNumber) addToCurrent(ns, "number", btnValue);
        else if (btnValue === "Ans") addToCurrent(ns, btnValue, btnValue);
        else if (btnValue === "(") addParenthesis(ns, btnValue, btnValue);
        else if (btnValue === "AC") this.setACContext(ns);
    }

    onRightParenthesis(btnValue, ns, isNumber, isOperator) {
        if (btnValue === "0") addToCurrent(ns, btnValue, "×" + btnValue);
        else if (btnValue === ".") addDot(ns, btnValue, "×" + btnValue);
        else if (isNumber) addToCurrent(ns, "number", "×" + btnValue);
        else if (btnValue === "Ans") addToCurrent(ns, btnValue, "×" + btnValue);
        else if (isOperator) addToCurrent(ns, "operator", btnValue);
        else if (btnValue === "(") addParenthesis(ns, btnValue, "×" + btnValue);
        else if (ns.openParenthesis > 0 && btnValue === ")") addParenthesis(ns, btnValue, btnValue);
        else if (btnValue === "=") this.onEvalRequest(ns);
        else if (btnValue === "AC") this.setACContext(ns);
    }

    onEqual(btnValue, ns, isNumber, isOperator) {
        if (btnValue === "0") {
            ns.current = "";
            addToCurrent(ns, btnValue, btnValue);
        }
        else if (btnValue === ".") {
            ns.current = "";
            addDot(ns, btnValue, btnValue);
        }
        else if (isNumber) {
            ns.current = "";
            addToCurrent(ns, "number", btnValue);
        }
        else if (btnValue === "Ans") {
            ns.current = "";
            addToCurrent(ns, btnValue, btnValue);
        }
        else if (isOperator) addToCurrent(ns, "operator", btnValue);
        else if (btnValue === "(") {
            ns.current = "";
            addParenthesis(ns, btnValue, btnValue);
        }
        else if (btnValue === "AC") {
            ns.current = "0";
            ns.context = "0";
        }

        ns.previous = "Ans = " + ns.ans;
    }

    setACContext(newState) {
        let currentChar = newState.current.charAt(newState.current.length - 1);
        // Compute openParenthesis with char to delete, then go back 1 char (3 if context is Ans)
        newState.openParenthesis += currentChar === ")" ? 1 : currentChar === "(" ? -1 : 0;
        newState.current = newState.current.slice(0, currentChar === "s" ? -3 : -1);
        currentChar = newState.current.charAt(newState.current.length - 1);
        let leftChar = newState.current.charAt(newState.current.length - 2);
        // Compute new context based on current char and the one to its left
        const asd = /÷|×|-|\+/.test(leftChar) || leftChar === "(" || newState.current.length === 1;

        if (newState.current.length < 1) { newState.current = "0"; newState.context = "0"; }
        else if (currentChar === "0" && asd) newState.context = "0";
        else if (currentChar === "." && asd) {
            newState.isFloat = true;
            newState.context = ".";
        }
        else if (/[0-9.]/.test(currentChar)) {
            const lastNumStr = newState.current.match(/([0-9.]+)(?!.*[0-9.]+)/g); // last number
            newState.isFloat = lastNumStr && lastNumStr[0].indexOf(".") !== -1;
            newState.context = "number";
        }
        else if (currentChar === "s") newState.context = "Ans";
        else if (/÷|×|-|\+/.test(currentChar)) newState.context = "operator";
        else if (currentChar === "(") {
            newState.isFloat = false;
            newState.context = "(";
        }
        else if (currentChar === ")") newState.context = ")";

        console.log(newState.context);
    }

    onEvalRequest(newState) {
        newState.isFloat = false;
        newState.context = "=";
        // Add missing parenthesis and store previous expression
        newState.current += ")".repeat(newState.openParenthesis);
        newState.openParenthesis = 0;
        newState.previous = newState.current + " =";
        // Replace macros for eval
        newState.current = newState.current.replace(/Ans/g, "(" + newState.ans + ")");
        newState.current = newState.current.replace(/÷/g, "/");
        newState.current = newState.current.replace(/×/g, "*");
        // Eval
        newState.ans = evaluate(newState.current);
        newState.current = newState.ans.toString();
    }

    render() {
        return (
            <div className="calculator">
                <div className="display">
                    <div className="previousContainer">
                        <div className="previous">{this.state.previous}</div>
                    </div>
                    <div className="currentContainer">
                        <div className="current">{this.state.current}</div>
                        <div className="missingParenthesis">
                            {")".repeat(this.state.openParenthesis)}
                        </div>
                    </div>
                </div>
                <div className="buttonPanel">
                    {btnList.map((btn) => <Button key={btn.value} value={btn.value}
                        style={"button " + btn.style} onClick={()=>this.onClick(btn.value)}/>)}
                </div>
            </div>   
        )
    }
}

ReactDom.render(<App/>, document.getElementById('root'));