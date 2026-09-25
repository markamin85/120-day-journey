import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

// -------------------------
// FIREBASE CONFIGURATION
// -------------------------

const firebaseConfig = {
  apiKey: "AIzaSyDTRC9byQ7TlfPXt0B_JwAxrJe8KcS3yXM",
  authDomain: "day-journey-5d91e.firebaseapp.com",
  projectId: "day-journey-5d91e",
  storageBucket: "day-journey-5d91e.firebasestorage.app",
  messagingSenderId: "159472568464",
  appId: "1:159472568464:web:7a7e227275bdc5e7faf015"
};


// -------------------------
// INITIALIZE FIREBASE
// -------------------------

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// -------------------------
// SETTINGS
// -------------------------

const TOTAL_DAYS = 60;

const START_YEAR = 2026;

// JavaScript months start at 0
// January = 0
// February = 1
// ...
// September = 8
const START_MONTH = 8;

const START_DAY = 25;


// -------------------------
// CREATE START DATE
// -------------------------

const startDate = new Date(
  START_YEAR,
  START_MONTH,
  START_DAY
);


// -------------------------
// CALCULATE END DATE
// -------------------------

const endDate = new Date(startDate);

// Day 1 is September 20.
// Day 60 is 59 days after the starting date.
endDate.setDate(
  endDate.getDate() + TOTAL_DAYS - 1
);


// -------------------------
// GET TODAY'S DATE
// -------------------------

const today = new Date();


// -------------------------
// CONVERT DATES TO UTC
// -------------------------

// Using UTC here prevents daylight-saving-time
// changes from affecting the number of days.

const startUTC = Date.UTC(
  startDate.getFullYear(),
  startDate.getMonth(),
  startDate.getDate()
);

const todayUTC = Date.UTC(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);


// -------------------------
// CALCULATE DAYS
// -------------------------

const millisecondsPerDay =
  1000 * 60 * 60 * 24;

let daysElapsed = Math.floor(
  (todayUTC - startUTC) / millisecondsPerDay
);


// Don't allow negative values
if (daysElapsed < 0) {
  daysElapsed = 0;
}


// Don't allow values beyond 60
if (daysElapsed > TOTAL_DAYS) {
  daysElapsed = TOTAL_DAYS;
}


// September 20 = Day 1
const currentDay = Math.min(
  daysElapsed + 1,
  TOTAL_DAYS
);


// Percentage of completed days
const percentage =
  (daysElapsed / TOTAL_DAYS) * 100;


// Days still remaining
const daysRemaining =
  TOTAL_DAYS - daysElapsed;


// -------------------------
// FORMAT DATES
// -------------------------

const dateOptions = {
  month: "long",
  day: "numeric",
  year: "numeric"
};


// -------------------------
// DISPLAY START DATE
// -------------------------

document.getElementById("startDate").textContent =
  "Start: " +
  startDate.toLocaleDateString(
    "en-US",
    dateOptions
  );


// -------------------------
// DISPLAY END DATE
// -------------------------

document.getElementById("endDate").textContent =
  "Day " +
  TOTAL_DAYS +
  ": " +
  endDate.toLocaleDateString(
    "en-US",
    dateOptions
  );


// -------------------------
// DISPLAY CURRENT DAY
// -------------------------

document.getElementById("day").textContent =
  "Day " +
  currentDay +
  " of " +
  TOTAL_DAYS;


// -------------------------
// DISPLAY PERCENTAGE
// -------------------------

document.getElementById("percentage").textContent =
  percentage.toFixed(1) +
  "% Complete";


// -------------------------
// DISPLAY DAYS REMAINING
// -------------------------

document.getElementById("remaining").textContent =
  daysRemaining +
  " Days Remaining";


// -------------------------
// DISPLAY FINISH LABEL
// -------------------------

document.getElementById("finishLabel").textContent =
  "DAY " + TOTAL_DAYS;


// -------------------------
// UPDATE GREEN ROAD
// -------------------------

document.getElementById("roadProgress").style.width =
  percentage + "%";


// -------------------------
// MOVE WALKER
// -------------------------

document.getElementById("walker").style.left =
  percentage + "%";

// -------------------------
// GOOGLE SIGN-IN BUTTON
// -------------------------

const signInButton =
  document.getElementById("signInButton");

const userStatus =
  document.getElementById("userStatus");


signInButton.addEventListener("click", async () => {

  try {

    await signInWithPopup(
      auth,
      provider
    );

  } catch (error) {

    console.error(
      "Sign-in error:",
      error
    );

  }

});


// -------------------------
// CHECK SIGN-IN STATUS
// -------------------------

onAuthStateChanged(auth, (user) => {

  if (user) {

    signInButton.style.display =
      "none";

    userStatus.textContent =
      "Signed in as " + user.email;

  } else {

    signInButton.style.display =
      "inline-block";

    userStatus.textContent =
      "Not signed in";

  }

});


// -------------------------
// DAILY CHECKLIST
// -------------------------

const checklistItems = [
  "morningTeeth",
  "morningExercise",
  "morningPrayer",
  "morningJournal",
  "screensCar",
  "nightTeeth",
  "nightExercise",
  "nightPrayer",
  "nightJournal"
];


// Show today's date above checklist
document.getElementById("checklistDate").textContent =
  today.toLocaleDateString(
    "en-US",
    dateOptions
  );


// -------------------------
// UPDATE DAILY PROGRESS
// -------------------------

function updateDailyProgress() {

  let completed = 0;

  checklistItems.forEach((itemId) => {

    const checkbox =
      document.getElementById(itemId);

    if (checkbox.checked) {
      completed++;
    }

  });


  const total =
    checklistItems.length;


  const dailyPercent =
    (completed / total) * 100;


  document.getElementById(
    "dailyProgressText"
  ).textContent =
    completed +
    " of " +
    total +
    " completed";


  document.getElementById(
    "dailyPercentage"
  ).textContent =
    dailyPercent.toFixed(1) +
    "%";


  document.getElementById(
    "dailyProgressBar"
  ).style.width =
    dailyPercent + "%";

}


// -------------------------
// LISTEN FOR CHECKBOX CHANGES
// -------------------------

checklistItems.forEach((itemId) => {

  const checkbox =
    document.getElementById(itemId);

  checkbox.addEventListener(
    "change",
    updateDailyProgress
  );

});


// Set initial progress
updateDailyProgress();
