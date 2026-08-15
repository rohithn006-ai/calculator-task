// ==========================================
// SMART CALCULATOR
// ==========================================

// Get HTML elements
const display = document.getElementById("display");
const previousDisplay = document.getElementById("previousDisplay");

const buttons = document.querySelector(".buttons");

const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");

const themeButton = document.getElementById("themeBtn");


// Calculator state
let expression = "";

let lastResult = false;


// ==========================================
// DISPLAY UPDATE
// ==========================================

function updateDisplay() {

    // If expression is empty, show zero
    if (expression === "") {

        display.value = "0";

    } else {

        // Replace symbols for better visual appearance
        display.value = expression
            .replace(/\*/g, "×")
            .replace(/\//g, "÷");

    }
}


// ==========================================
// ADD VALUE
// ==========================================

function addValue(value) {

    // If previous calculation was completed
    // and user enters a number, start a new calculation
    if (lastResult && /[0-9.]/.test(value)) {

        expression = "";

        lastResult = false;
    }

    // Prevent multiple decimal points
    if (value === ".") {

        const parts = expression.split(/[+\-*/%]/);

        const currentNumber = parts[parts.length - 1];

        if (currentNumber.includes(".")) {

            return;
        }
    }

    // Prevent two operators together
    if (/[+\-*/%]/.test(value)) {

        const lastCharacter =
            expression.charAt(expression.length - 1);

        if (/[+\-*/%]/.test(lastCharacter)) {

            // Replace previous operator
            expression =
                expression.slice(0, -1) + value;

            updateDisplay();

            return;
        }
    }

    expression += value;

    updateDisplay();
}


// ==========================================
// CLEAR
// ==========================================

function clearCalculator() {

    expression = "";

    previousDisplay.textContent = "";

    lastResult = false;

    updateDisplay();
}


// ==========================================
// DELETE LAST CHARACTER
// ==========================================

function deleteLast() {

    expression = expression.slice(0, -1);

    lastResult = false;

    updateDisplay();
}


// ==========================================
// CALCULATE RESULT
// ==========================================

function calculate() {

    // Don't calculate an empty expression
    if (expression === "") {

        return;
    }

    try {

        // Remove trailing operator
        if (/[+\-*/%]$/.test(expression)) {

            expression = expression.slice(0, -1);
        }

        if (expression === "") {

            return;
        }

        // Check for division by zero
        if (/\/0(?![0-9.])/.test(expression)) {

            throw new Error("Division by zero");
        }

        /*
            Allow only calculator characters.

            This prevents unwanted JavaScript
            code from being executed.
        */

        if (!/^[0-9+\-*/%.() ]+$/.test(expression)) {

            throw new Error("Invalid expression");
        }

        /*
            Convert percentage.

            Example:
            50% → 0.5
        */

        expression = expression.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );

        /*
            Calculate expression.

            The expression has already been
            validated above.
        */

        const result = Function(
            `"use strict"; return (${expression})`
        )();

        // Check whether result is valid
        if (!Number.isFinite(result)) {

            throw new Error("Invalid calculation");
        }

        // Remove unnecessary decimal digits
        const formattedResult =
            Number(result.toFixed(10));

        // Show previous expression
        previousDisplay.textContent =
            expression
                .replace(/\*/g, "×")
                .replace(/\//g, "÷")
            + " =";

        // Add calculation to history
        addToHistory(expression, formattedResult);

        // Set result
        expression = String(formattedResult);

        lastResult = true;

        updateDisplay();

    } catch (error) {

        display.value = "Error";

        expression = "";

        lastResult = true;

        setTimeout(() => {

            updateDisplay();

        }, 1000);
    }
}


// ==========================================
// HISTORY
// ==========================================

function addToHistory(
    calculation,
    result
) {

    // Remove empty-history message
    const emptyMessage =
        document.querySelector(".empty-history");

    if (emptyMessage) {

        emptyMessage.remove();
    }

    const historyItem =
        document.createElement("div");

    historyItem.classList.add("history-item");

    const expressionElement =
        document.createElement("span");

    expressionElement.classList.add(
        "history-expression"
    );

    expressionElement.textContent =
        calculation
            .replace(/\*/g, "×")
            .replace(/\//g, "÷");

    const resultElement =
        document.createElement("span");

    resultElement.classList.add(
        "history-result"
    );

    resultElement.textContent = result;

    historyItem.appendChild(
        expressionElement
    );

    historyItem.appendChild(
        resultElement
    );

    historyList.prepend(historyItem);
}


// ==========================================
// CLEAR HISTORY
// ==========================================

clearHistoryButton.addEventListener(
    "click",
    function () {

        historyList.innerHTML =
            `<p class="empty-history">
                No calculations yet
            </p>`;
    }
);


// ==========================================
// BUTTON EVENT LISTENER
// ==========================================

buttons.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest("button");

        if (!button) {

            return;
        }

        const value =
            button.dataset.value;

        const action =
            button.dataset.action;

        // If button contains a value
        if (value !== undefined) {

            addValue(value);

            return;
        }

        // If button performs an action
        if (action === "clear") {

            clearCalculator();

        } else if (action === "delete") {

            deleteLast();

        } else if (action === "calculate") {

            calculate();
        }
    }
);


// ==========================================
// KEYBOARD SUPPORT
// ==========================================

document.addEventListener(
    "keydown",
    function (event) {

        const key = event.key;

        // Numbers
        if (/[0-9]/.test(key)) {

            addValue(key);

            return;
        }

        // Decimal
        if (key === ".") {

            addValue(".");

            return;
        }

        // Operators
        if (["+", "-", "*", "/", "%"].includes(key)) {

            addValue(key);

            return;
        }

        // Enter or =
        if (key === "Enter" || key === "=") {

            event.preventDefault();

            calculate();

            return;
        }

        // Backspace
        if (key === "Backspace") {

            deleteLast();

            return;
        }

        // Escape
        if (key === "Escape") {

            clearCalculator();
        }
    }
);


// ==========================================
// DARK / LIGHT MODE
// ==========================================

themeButton.addEventListener(
    "click",
    function () {

        document.body.classList.toggle("dark");

        if (
            document.body.classList.contains("dark")
        ) {

            themeButton.textContent = "☀";

        } else {

            themeButton.textContent = "☾";
        }
    }
);


// ==========================================
// INITIAL DISPLAY
// ==========================================

updateDisplay();