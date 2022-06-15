// 'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2022-06-11T23:36:17.929Z',
    '2022-06-12T10:51:36.790Z',
    // '2020-07-11T23:36:17.929Z',
    // '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//Initial state:
let currentAcc = '';
let isSorted = false;
let timer;

/////////////////////////////////////////////////
/////////////////////////////////////////////////

//Create userName property in all of account object
const getUserName = function (accounts) {
  console.log(accounts[0].owner);
  accounts.forEach(account => {
    const userName = account.owner
      .toLowerCase()
      .split(' ')
      .map(namePart => namePart[0])
      .join('');
    account.userName = userName;
  });
};

getUserName(accounts);

//Set timer with format mm:ss
const timerFormat = function (time) {
  const min = String(Math.trunc(time / 60)).padStart(2, 0);
  const second = String(time % 60).padStart(2, 0);
  labelTimer.textContent = `${min}:${second}`;
};

//Rest Timer
const timerReset = function () {
  clearInterval(timer);
  timer = timerActive();
};

//Active timer
const timerActive = function () {
  //set start time
  let time = 120;
  timerFormat(time);

  //showing timer decreasing
  const countdown = setInterval(function () {
    time--;
    timerFormat(time);

    //if timer count down to 0, logout
    if (time === 0) {
      clearInterval(countdown);
      currentAcc = '';
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
  }, 1000);

  return countdown;
};

//Format Date display
const formatDateDisplay = function (date, locale) {
  console.log(date);
  const movDateInterval = Math.round(
    (new Date() - new Date(date)) / (1000 * 60 * 60 * 24)
  );

  if (movDateInterval === 0) {
    return 'Today';
  }
  if (movDateInterval === 1) {
    return 'Yesterday';
  }
  if (movDateInterval < 11) {
    return `${movDateInterval} days ago`;
  } else {
    const option = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };
    const movDate = new Intl.DateTimeFormat(locale, option).format(
      new Date(date)
    );
    return movDate;
  }
};

//Format movement (amount)
const formatMov = function (mov, locale, currency) {
  const option = {
    style: 'currency',
    currency: currency,
  };
  return new Intl.NumberFormat(locale, option).format(mov);
};

//Display movement functionality
const displayMov = function (acc) {
  containerMovements.innerHTML = '';

  //if isSorted is true, make movements accending
  const movs = isSorted
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    //get movement date
    const movDateFormat = formatDateDisplay(acc.movementsDates[i], acc.locale);

    //get formated amount
    const formatAmout = formatMov(mov, acc.locale, acc.currency);
    const movType = mov > 0 ? 'deposit' : 'withdrawal';
    const movHtml = `<div class="movements__row">
        <div class="movements__type movements__type--${movType}">${
      i + 1
    } ${movType}</div>
    <div class="movements__date">${movDateFormat}</div>
    <div class="movements__value">${formatAmout}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', movHtml);
  });
};

//Display balance functionality
const balanceCalcDisplay = function (acc) {
  acc.balance = acc.movements.reduce(function (acc, movement) {
    return acc + movement;
  }, 0);
  labelBalance.textContent = formatMov(acc.balance, acc.locale, acc.currency);
  // return balance;
};

//Display Summary functionality
const SummayCalcDisplay = function (acc) {
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, income) => acc + income);
  const outcome = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, outcome) => acc + outcome, 0);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit =>
      (deposit * acc.interestRate) / 100 >= 1
        ? (deposit * acc.interestRate) / 100
        : 0
    )
    .reduce((acc, int) => acc + int); //income * 0.012;

  labelSumIn.textContent = formatMov(income, acc.locale, acc.currency);
  labelSumOut.textContent = formatMov(
    Math.abs(outcome),
    acc.locale,
    acc.currency
  );
  labelSumInterest.textContent = formatMov(interest, acc.locale, acc.currency);
};

//Update UI functionality(movement, summary, balance)
const updateUI = function () {
  displayMov(currentAcc);
  SummayCalcDisplay(currentAcc);
  balanceCalcDisplay(currentAcc);
};

//Initialzation
const initialize = function () {
  containerApp.style.opacity = 0;
  labelWelcome.textContent = 'Log in to get started';
  currentAcc = undefined;
};

//////////////////////////////////////////////////
//////////////////////////////////////////////////

//Login in
btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); //解除click event on form buttom預設動作 - 解除自動reload
  const inputUserName = inputLoginUsername.value;
  const inputPin = Number(inputLoginPin.value);

  //Verify wether the userName input exists, if so, set it to currentAcc.
  currentAcc = accounts.find(function (acc) {
    return acc.userName === inputUserName;
  });

  //Verify pin
  if (currentAcc.pin === inputPin) {
    containerApp.style.opacity = 1;
    labelWelcome.textContent = `welcome back, ${
      currentAcc.owner.split(' ')[0]
    }`;
  }

  //active timer
  timerReset();

  //Show current date
  const now = new Date();
  const option = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  };
  const dateFormated = new Intl.DateTimeFormat(
    currentAcc.locale,
    option
  ).format(now);

  labelDate.textContent = dateFormated;

  //Clear input and focus
  inputLoginUsername.value = '';
  inputLoginPin.value = '';
  inputLoginPin.blur();

  updateUI();
});

//Transfer money
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  //Get transfer amount and receiver's account
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );

  //Clear input value & focus
  inputTransferAmount.value = '';
  inputTransferTo.value = '';
  inputTransferAmount.blur();
  inputTransferTo.blur();

  //Verify amount and receiver are valid, then execute transfer
  if (
    amount > 0 &&
    amount < currentAcc.balance &&
    receiverAcc &&
    receiverAcc?.userName !== currentAcc.userName
  ) {
    currentAcc.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    currentAcc.movements.push(-amount);
    receiverAcc.movements.push(amount);
    timerReset();
    updateUI();
  } else console.log('invalid transfer');
});

//Loan money
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  //get loan amount
  const amount = Math.floor(inputLoanAmount.value);
  //check if amount's valid if so, execute
  if (amount > 0 && currentAcc.movements.some(mov => amount * 0.1 <= mov)) {
    setTimeout(() => {
      currentAcc.movements.push(amount);
      currentAcc.movementsDates.push(new Date().toISOString());
      timerReset();
      updateUI();
    }, 4000);
  }

  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

//Close account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const closeUser = inputCloseUsername.value;
  const closePin = Number(inputClosePin.value);

  //delete account, hide UI  and clear currentAcc & welcome message
  if (closeUser === currentAcc.userName && closePin === currentAcc.pin) {
    const index = accounts.findIndex(function (account) {
      return account.userName === closeUser;
    });
    accounts.splice(index, 1);
    inputCloseUsername.value = inputClosePin.value = '';
    initialize();
  }
});

//Sort movements
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  //toggle isSorted value
  isSorted = !isSorted;
  displayMov(currentAcc);
});

console.log(
  new Intl.NumberFormat(navigator.language, {
    style: 'currency',
    currency: 'TWD',
  }).format(4932057923)
);
