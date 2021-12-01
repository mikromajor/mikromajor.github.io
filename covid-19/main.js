const select = document.getElementById("countriesList");
const arrCovidInf = []; //Covid for statistic calculation

//    get Inf from  Server
async function getServerInf(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Response status fetch is : ${response.status}`
    );
  } else {
    const arrObjects = await response.json();
    return arrObjects;
  }
}

// call fetch  get country names and covid inf
function addCountriesList() {
  getServerInf("https://api.covid19api.com/countries")
    .then((arrObjs) => {
      arrObjs.forEach((obj) => {
        const option = document.createElement("option");
        option.value = obj.Slug;
        option.textContent = obj.Country;
        select.appendChild(option);
      });
    })
    .catch((e) => {
      console.log("Error: " + e.message);
    });
}

// set country
select.addEventListener("change", () => {
  const statistic = clearContent("statistic");
  statistic.classList.add("hidden");
  pullCovidInf(select.value);
});

function pullCovidInf(country) {
  getServerInf(
    "https://api.covid19api.com/country/" + country
  )
    .then((Covid) => {
      const h2 = document.createElement("h2");
      if (!Covid.length) {
        h2.textContent =
          "Server hasn't information about covid-19 in this country";
        document.getElementById("content").appendChild(h2);
      } else {
        arrCovidInf.length = 0;

        arrCovidInf.push(...Covid);
        createContent();
      }
    })
    .catch((error) => console.log("error  =>", error));
}

// C O N T E N T
function createContent() {
  const content = clearContent("content");
  const h2 = document.createElement("h2");
  const lastData = arrCovidInf[arrCovidInf.length - 2];
  h2.textContent = lastData.Country;

  const p0 = document.createElement("p");
  p0.textContent = `Last statistic day: ${lastData.Date.slice(
    0,
    10
  )}`;

  const p1 = document.createElement("p");
  p1.textContent = `Amount of Active: ${lastData.Active}`;
  const p2 = document.createElement("p");
  p2.textContent = `Amount Confirmed: ${lastData.Confirmed}`;

  const p3 = document.createElement("p");
  p3.textContent = `Amount of deaths: ${lastData.Deaths}`;

  content.appendChild(h2);
  content.appendChild(p0);
  content.appendChild(p1);
  content.appendChild(p2);
  content.appendChild(p3);
  content.classList.add("content");

  //create BUTTON
  const lastDay = document.createElement("button");
  lastDay.textContent = "Statistics for last day";
  lastDay.addEventListener("click", () => {
    addStatistic(
      arrCovidInf[arrCovidInf.length - 2],
      arrCovidInf[arrCovidInf.length - 3],
      "last statistic day"
    );
  });
  const week = document.createElement("button");
  week.textContent = "Statistics for last week";
  week.addEventListener("click", () => {
    addStatistic(
      arrCovidInf[arrCovidInf.length - 2],
      arrCovidInf[arrCovidInf.length - 9],
      "last statistic week"
    );
  });
  const month = document.createElement("button");
  month.textContent = "Statistics for last month";
  month.addEventListener("click", () => {
    addStatistic(
      arrCovidInf[arrCovidInf.length - 2],
      arrCovidInf[arrCovidInf.length - 32],
      "last statistic month"
    );
  });
  const menuInput = document.createElement("button");
  menuInput.textContent = "Input menu";
  menuInput.addEventListener("click", () => {
    const menuInput = document.getElementById("menuInput");
    createInputMenu();
  });
  const anchorForMenu = document.createElement("a");
  anchorForMenu.href = "#menuInput";
  anchorForMenu.appendChild(menuInput);

  content.appendChild(lastDay);
  content.appendChild(week);
  content.appendChild(month);
  content.appendChild(anchorForMenu);
}

function clearContent(id) {
  const elemDOM = document.getElementById(id);
  if (elemDOM) {
    while (elemDOM.firstChild) {
      elemDOM.removeChild(elemDOM.firstChild);
    }
    return elemDOM;
  }
}

//  I n p u t
function createInputMenu() {
  const menuInput = clearContent("menuInput");
  menuInput.classList.remove("hidden");

  const warning = document.createElement("h4");
  warning.id = "warning";
  warning.classList.add("hidden");

  const headerMenu = document.createElement("h4");
  headerMenu.textContent = `Choose the period min - ${arrCovidInf.length} days ago max - yesterday`;

  const labelFirstDate = document.createElement("label");
  labelFirstDate.name = "inputFirstDate";
  labelFirstDate.textContent = "First date";

  const inputFirstDate = document.createElement("input");
  inputFirstDate.id = "inputFirstDate";
  inputFirstDate.type = "Date";

  const labelSecondDate = document.createElement("label");
  labelSecondDate.name = "inputLastDate";
  labelSecondDate.textContent = "Last date";

  const inputLastDate = document.createElement("input");
  inputLastDate.id = "inputLastDate";
  inputLastDate.type = "Date";

  const buttonEnter = document.createElement("button");
  buttonEnter.textContent = "ENTER";
  buttonEnter.addEventListener("click", () => {
    calculationPeriod(
      inputFirstDate.value,
      inputLastDate.value
    );
  });
  const anchorForStatistic = document.createElement("a");
  anchorForStatistic.href = "#statistic";
  anchorForStatistic.appendChild(buttonEnter);

  const buttonHide = document.createElement("button");
  buttonHide.textContent = "Hide menu";
  buttonHide.addEventListener("click", () => {
    menuInput.classList.add("hidden");
  });
  menuInput.appendChild(headerMenu);
  menuInput.appendChild(labelFirstDate);
  menuInput.appendChild(inputFirstDate);
  menuInput.appendChild(labelSecondDate);
  menuInput.appendChild(inputLastDate);
  menuInput.appendChild(anchorForStatistic);
  menuInput.appendChild(buttonHide);
  menuInput.appendChild(warning);
  menuInput.classList.add("content");
}

function calculationPeriod(first, last) {
  let statistic;
  const warning = document.getElementById("warning");
  const dateToday = new Date();
  const dateFirst = new Date(first);
  const dateLast = new Date(last);
  const startPeriod = Math.trunc(
    (dateToday - dateFirst) / 86400000
  );
  const endPeriod = Math.trunc(
    (dateToday - dateLast) / 86400000
  );

  if (
    startPeriod > arrCovidInf.length ||
    endPeriod > arrCovidInf.length ||
    startPeriod < 1 ||
    endPeriod < 1
  ) {
    warning.textContent = `No information available for this period`;
    warning.classList.remove("hidden");
    statistic = clearContent("statistic");
    statistic.classList.add("hidden");
  } else {
    warning.classList.add("hidden");
    addStatistic(
      arrCovidInf[arrCovidInf.length - 1 - startPeriod],
      arrCovidInf[arrCovidInf.length - 1 - endPeriod],
      Math.abs(startPeriod - endPeriod) + " days"
    );
  }
}

// add Statistic inf
function addStatistic(today, dayAgo, time) {
  const statistic = clearContent("statistic");
  statistic.classList.remove("hidden");

  const deaths = document.createElement("p");
  deaths.textContent =
    "People DEATHS: " +
    Math.abs(today.Deaths - dayAgo.Deaths);

  const confirmed = document.createElement("p");
  confirmed.textContent =
    "People CONFIRMED: " +
    Math.abs(today.Confirmed - dayAgo.Confirmed);

  const active = document.createElement("p");
  active.textContent =
    "People ACTIVE: " +
    Math.abs(today.Active - dayAgo.Active);

  const headerToPeriodTime = document.createElement("h2");
  headerToPeriodTime.textContent = `Period: ${time}`;

  const buttonHideStatistic =
    document.createElement("button");
  buttonHideStatistic.id = "buttonHideStatistic";
  buttonHideStatistic.textContent = "Hide statistics";
  buttonHideStatistic.addEventListener("click", () => {
    clearContent("statistic");
    statistic.classList.add("hidden");
  });
  statistic.classList.remove("hidden");
  statistic.classList.add("content");
  statistic.appendChild(headerToPeriodTime);
  statistic.appendChild(active);
  statistic.appendChild(confirmed);
  statistic.appendChild(deaths);
  statistic.appendChild(buttonHideStatistic);
}

//    S   T   A   R    T
document.addEventListener("DOMContentLoaded", () =>
  addCountriesList()
);

// document.querySelector('#form').addEventListener('submit', (e) => {
//   e.preventDefault();

//   const data = new FormData(e.target);

//   fetch('test.com', {method: 'POST', body: data, 'Content-Type': 'multipart / form - data'});
//   console.log(data.get('first'), data.get('last'), data.get('countries'));
// });
