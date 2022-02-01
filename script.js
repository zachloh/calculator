const allButtons = document.querySelectorAll('button');
const numberButtons = document.querySelectorAll('.number');
const operatorButtons = document.querySelectorAll('.operator');
const dotButton = document.querySelector('#dot');
const equalButton = document.querySelector('#equal');
const clearButton = document.querySelector('#clear');
const backSpaceButton = document.querySelector('#delete');
const output = document.querySelector('.output');
const miniOutput = document.querySelector('.output-mini');
const message = document.querySelector('.message');

let firstInput;
let secondInput;
let result;
let numberOfInputs = 0;
let lastOperatorButton;
let numberClicked = false;
let dotClicked = false;
let isFirstDigit = true;
let numberOfDigits = 0;
let operatorFunctions = {
  add: add,
  subtract: subtract,
  multiply: multiply,
  divide: divide 
}

dotButton.addEventListener('click', addDecimal);
equalButton.addEventListener('click', evaluate);
clearButton.addEventListener('click', clearDisplay);
backSpaceButton.addEventListener('click', backspace);

numberButtons.forEach(button => {
  button.addEventListener('click', handleNumberButtonEvents);
});

operatorButtons.forEach(button => {
  button.addEventListener('click', setOperation);
});

document.addEventListener('keydown', (e) => {
  if (e.key >= 0 && e.key <= 9) addNumber(e.key);
  if (e.key === '.') addDecimal();
  if (e.key === '=' || e.key === 'Enter') evaluate();
  if (e.key === 'Escape') clearDisplay();
  if (e.key === 'Backspace') backspace();
  if (e.key === '+') document.getElementById('add').click();
  if (e.key === '-') document.getElementById('subtract').click();
  if (e.key === '*') document.getElementById('multiply').click();
  if (e.key === '/') document.getElementById('divide').click(); 
});

function handleNumberButtonEvents(e) {
  addNumber(e.target.id);
}

function addNumber(number) {
  resetMessage();

  if (numberOfDigits < 11) {
    numberClicked = true;

    if (output.textContent === '0') {
      output.textContent = number;
      numberOfDigits = 1;
      isFirstDigit = false;
      return;
    }

    if (isFirstDigit) {
      output.textContent = number;
      isFirstDigit = false;
    } else {
      output.textContent += number;
    }

    numberOfDigits++;
  }
}

function addDecimal() {
  resetMessage();

  if (dotClicked) {
    message.textContent = 'There is already a decimal point';
  } else {
    if (output.textContent === '') {
      output.textContent = '0.';
      numberOfDigits = 2;
      dotClicked = true;
      numberClicked = true;
      isFirstDigit = false;
      return;
    }

    if (numberClicked) {
      output.textContent += '.';
      numberOfDigits++;
    } else {
      output.textContent = '0.';
      numberOfDigits = 2;
    }
    dotClicked = true;
    numberClicked = true;
    isFirstDigit = false;
  }
}

function evaluate() {
  resetMessage();

  if (!isValidOperation()) return;

  if (numberOfInputs > 0 && numberClicked) {
    result = (numberOfInputs === 1) ? firstInput : result;
    miniOutput.textContent = `${result} ${lastOperatorButton.textContent} ${output.textContent} =`;
    displayMainOutput(lastOperatorButton.id, result, output.textContent);
    resetNumberVariables();
    numberOfInputs = 0;
  }
}

function setOperation(e) {
  resetMessage();

  if (!isValidOperation()) return;

  if (numberOfInputs === 0) {
    firstInput = (numberClicked) ? output.textContent : result; 

    // Special case: first operation on calculator without clicking any number (0 + _)
    firstInput = firstInput ?? output.textContent;

    displayMiniOutput(firstInput, e.target.textContent);
    storeLastOperator(e.target);
    resetNumberVariables();
    numberOfInputs++;

  } else if (numberOfInputs === 1 && numberClicked) {
    storeInputs(firstInput, output.textContent);
    displayMainOutput(lastOperatorButton.id, firstInput, secondInput);
    displayMiniOutput(result, e.target.textContent);
    storeLastOperator(e.target);
    resetNumberVariables();
    numberOfInputs++;

  } else if (numberOfInputs > 1 && numberClicked) {
    storeInputs(result, output.textContent);
    displayMainOutput(lastOperatorButton.id, firstInput, secondInput);
    displayMiniOutput(result, e.target.textContent);
    storeLastOperator(e.target);
    resetNumberVariables();

  } else {
    storeLastOperator(e.target);
    result = (numberOfInputs === 1) ? firstInput : result;
    displayMiniOutput(result, e.target.textContent);
  }
}

function clearDisplay() {
  resetMessage();
  numberOfInputs = 0;
  resetNumberVariables();
  output.textContent = '0';
  miniOutput.textContent = '';
  storeInputs(null, null);
  result = null;
}

function backspace() {
  resetMessage();

  if (numberClicked) {
    const lastDigit = output.textContent.slice(-1);
    if (lastDigit === '.') dotClicked = false;
    output.textContent = output.textContent.slice(0, -1);
    if (numberOfDigits > 0) numberOfDigits--; 
  } else {
    message.textContent = 'You must enter a number before deleting';
  }
}

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

function operate(operator, a, b) {
  return operatorFunctions[operator](a, b);
}

function storeInputs(first, second) {
  firstInput = Number(first);
  secondInput = Number(second);
}

function displayMainOutput(operator, firstInput, secondInput) {
  result = operate(operator, Number(firstInput), Number(secondInput));
  result = Math.round(result * 1000) / 1000;
  let formattedResult = result;

  // Check if it exceeds the screen max digit limit
  if (result.toString().length > 11) {
    const exponentLength = getExponentLength(result);
    formattedResult = (result > 0) ? result.toExponential(11 - exponentLength - 3) : result.toExponential(11 - exponentLength - 4);
    message.textContent = 'The answer has been formatted to fit in the screen';
  }

  output.textContent = formattedResult;
}

function displayMiniOutput(output, operator) {
  miniOutput.textContent = `${output} ${operator}`;
}

function storeLastOperator(button) {
  lastOperatorButton = button;
}

function resetNumberVariables() {
  isFirstDigit = true;
  numberClicked = false;
  numberOfDigits = 0;
  dotClicked = false;
}

function getExponentLength(number) {
  return number.toExponential().toString().split('e').pop().length;
}

function resetMessage() {
  message.textContent = '';
}

function isValidOperation() {
  if (output.textContent === '') {
    message.textContent = 'Invalid operation. Please enter a number';
    return false;
  }

  if (output.textContent === '.') {
    message.textContent = 'Invalid operation. Please enter a valid number';
    return false;
  }

  if (numberOfInputs > 0 && lastOperatorButton && lastOperatorButton.id === 'divide' && Number(output.textContent) === 0) {
    message.textContent = 'You cannot divide a number by 0';
    if (output.textContent === '0') isFirstDigit = true;
    return false;
  }

  return true;
}