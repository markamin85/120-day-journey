import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot,
  runTransaction
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
const START_MONTH = 10;

const START_DAY = 11;


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

  "life20Minutes",

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

updateDailyProgress();

// -------------------------
// FIRESTORE CHECKLIST SAVE
// -------------------------

function getTodayKey() {

  const year =
    today.getFullYear();

  const month =
    String(today.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(today.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}


const todayKey =
  getTodayKey();


// -------------------------
// SAVE TODAY'S CHECKLIST
// -------------------------

async function saveTodayChecklist() {

  const user =
    auth.currentUser;

  // Do not save unless signed in
  if (!user) {
    return;
  }


  const checklistData = {};

  let completed = 0;


  checklistItems.forEach((itemId) => {

    const checked =
      document.getElementById(itemId).checked;

    checklistData[itemId] =
      checked;

    if (checked) {
      completed++;
    }

  });


  const total =
    checklistItems.length;

  const dailyPercent =
    (completed / total) * 100;


  const logReference =
    doc(
      db,
      "users",
      user.uid,
      "dailyLogs",
      todayKey
    );


  await setDoc(
    logReference,
    {
      date: todayKey,

      checklist: checklistData,

      completed: completed,

      total: total,

      percentage: dailyPercent,

      updatedAt: serverTimestamp()
    },
    {
      merge: true
    }
  );

}


// -------------------------
// LOAD TODAY'S CHECKLIST
// -------------------------

async function loadTodayChecklist() {

  const user =
    auth.currentUser;

  if (!user) {
    return;
  }


  const logReference =
    doc(
      db,
      "users",
      user.uid,
      "dailyLogs",
      todayKey
    );


  const snapshot =
    await getDoc(logReference);


  if (snapshot.exists()) {

    const data =
      snapshot.data();


    if (data.checklist) {

      checklistItems.forEach((itemId) => {

        document.getElementById(
          itemId
        ).checked =
          data.checklist[itemId] || false;

      });

    }

  } else {

    // No record for today means
    // start with a fresh checklist.

    checklistItems.forEach((itemId) => {

      document.getElementById(
        itemId
      ).checked = false;

    });

  }


  updateDailyProgress();

}


// -------------------------
// SAVE WHEN CHECKBOX CHANGES
// -------------------------

checklistItems.forEach((itemId) => {

  const checkbox =
    document.getElementById(itemId);


  checkbox.addEventListener(
    "change",
    async () => {

      updateDailyProgress();

      try {

        await saveTodayChecklist();

      } catch (error) {

        console.error(
          "Checklist save error:",
          error
        );

      }

    }
  );

});


// -------------------------
// LOAD CHECKLIST AFTER LOGIN
// -------------------------

onAuthStateChanged(
  auth,
  async (user) => {

    if (user) {

      try {

        await loadTodayChecklist();

      } catch (error) {

        console.error(
          "Checklist load error:",
          error
        );

      }

    }

  }
);


// Set initial progress
updateDailyProgress();


/* -------------------------
   PORN-FREE STREAK TRACKER
------------------------- */

const streakCount =
  document.getElementById("streakCount");

const streakStartDate =
  document.getElementById("streakStartDate");

const streakStatus =
  document.getElementById("streakStatus");

const resetStreakButton =
  document.getElementById("resetStreakButton");

let streakStartKey = null;
let streakUserId = null;
let unsubscribeStreak = null;
let creatingStreak = false;
let resettingStreak = false;


// -------------------------
// CURRENT LOCAL DATE
// -------------------------

function getStreakTodayKey() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// -------------------------
// CALCULATE STREAK DAYS
// -------------------------

function calculateStreakDays(
  startKey,
  endKey = getStreakTodayKey()
) {
  const [sy, sm, sd] =
    startKey.split("-").map(Number);

  const [ey, em, ed] =
    endKey.split("-").map(Number);

  const startUTC = Date.UTC(sy, sm - 1, sd);
  const endUTC = Date.UTC(ey, em - 1, ed);

  const difference =
    Math.round(
      (endUTC - startUTC) / 86400000
    );

  return Math.max(1, difference + 1);
}


// -------------------------
// UPDATE STREAK DISPLAY
// -------------------------

function updateStreakDisplay() {
  if (!streakStartKey) {
    streakCount.textContent = "—";
    streakStartDate.textContent = "Start Date: —";
    return;
  }

  const [year, month, day] =
    streakStartKey.split("-").map(Number);

  const displayDate =
    new Date(year, month - 1, day);

  const days =
    calculateStreakDays(streakStartKey);

  streakCount.textContent =
    "Day " + days;

  streakStartDate.textContent =
    "Start Date: " +
    displayDate.toLocaleDateString(
      "en-US",
      dateOptions
    );
}


// -------------------------
// LOAD AND SYNC STREAK
// -------------------------

onAuthStateChanged(auth, (user) => {

  // Stop listening to the previous account.
  if (unsubscribeStreak) {
    unsubscribeStreak();
    unsubscribeStreak = null;
  }

  streakUserId = user ? user.uid : null;
  streakStartKey = null;
  creatingStreak = false;

  updateStreakDisplay();
  resetStreakButton.disabled = true;

  if (!user) {
    streakStatus.textContent =
      "Sign in to view your streak.";
    return;
  }

  streakStatus.textContent =
    "Loading streak...";

  const streakRef = doc(
    db,
    "users",
    user.uid,
    "streak",
    "current"
  );

  unsubscribeStreak = onSnapshot(
    streakRef,

    async (snapshot) => {

      if (streakUserId !== user.uid) {
        return;
      }

      // First time using the streak tracker:
      // automatically begin on today's date.
      if (!snapshot.exists()) {

        if (creatingStreak) {
          return;
        }

        creatingStreak = true;

        streakStatus.textContent =
          "Starting your streak...";

        try {

          await runTransaction(
            db,
            async (transaction) => {

              const current =
                await transaction.get(streakRef);

              // Don't overwrite a streak created
              // simultaneously on another device.
              if (!current.exists()) {

                transaction.set(streakRef, {
                  startDate: getStreakTodayKey(),
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
                });

              }

            }
          );

        } catch (error) {

          console.error(
            "Streak initialization error:",
            error
          );

          if (streakUserId === user.uid) {
            streakStatus.textContent =
              "Could not start streak. Check Firebase access.";
          }

        } finally {
          creatingStreak = false;
        }

        return;
      }

      const savedDate =
        snapshot.data().startDate;

      if (
        typeof savedDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(savedDate)
      ) {
        streakStatus.textContent =
          "Invalid streak start date.";
        resetStreakButton.disabled = true;
        return;
      }

      streakStartKey = savedDate;

      updateStreakDisplay();

      resetStreakButton.disabled =
        resettingStreak;

      if (!resettingStreak) {
        streakStatus.textContent =
          snapshot.metadata.fromCache
            ? "Showing cached streak data."
            : "Streak synchronized.";
      }

    },

    (error) => {

      console.error(
        "Streak synchronization error:",
        error
      );

      if (streakUserId === user.uid) {
        streakStatus.textContent =
          "Unable to synchronize streak.";

        resetStreakButton.disabled = true;
      }

    }
  );

});


// -------------------------
// RESET STREAK
// -------------------------

resetStreakButton.addEventListener(
  "click",
  async () => {

    const user = auth.currentUser;

    if (
      !user ||
      !streakStartKey ||
      resettingStreak
    ) {
      return;
    }

    const currentDays =
      calculateStreakDays(streakStartKey);

    // Require confirmation before resetting.
    const confirmed = window.confirm(
      `Reset your current streak (Day ${currentDays})?\n\n` +
      "Your previous streak will be saved to history.\n" +
      "A new streak will begin at Day 1."
    );

    if (!confirmed) {
      return;
    }

    resettingStreak = true;
    resetStreakButton.disabled = true;

    streakStatus.textContent =
      "Saving previous streak...";

    const streakRef = doc(
      db,
      "users",
      user.uid,
      "streak",
      "current"
    );

    // Generate a unique history ID.
    const historyRef = doc(
      collection(
        db,
        "users",
        user.uid,
        "streakHistory"
      )
    );

    try {

      await runTransaction(
        db,
        async (transaction) => {

          const snapshot =
            await transaction.get(streakRef);

          if (!snapshot.exists()) {
            throw new Error(
              "No existing streak found."
            );
          }

          const previousStart =
            snapshot.data().startDate;

          if (
            typeof previousStart !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(previousStart)
          ) {
            throw new Error(
              "Invalid previous streak date."
            );
          }

          const resetDate =
            getStreakTodayKey();

          const daysReached =
            calculateStreakDays(
              previousStart,
              resetDate
            );

          // Save the old streak permanently.
          transaction.set(historyRef, {
            startDate: previousStart,
            endDate: resetDate,
            daysReached: daysReached,
            resetAt: serverTimestamp()
          });

          // Begin a new streak today.
          transaction.set(
            streakRef,
            {
              startDate: resetDate,
              updatedAt: serverTimestamp()
            },
            {
              merge: true
            }
          );

        }
      );

      if (streakUserId === user.uid) {
        streakStatus.textContent =
          "Streak reset. Previous streak saved!";
      }

    } catch (error) {

      console.error(
        "Streak reset error:",
        error
      );

      if (streakUserId === user.uid) {
        streakStatus.textContent =
          "Reset failed. Previous streak preserved.";
      }

    } finally {

      resettingStreak = false;

      if (streakUserId === user.uid) {
        resetStreakButton.disabled =
          !streakStartKey;
      }

    }

  }
);


// -------------------------
// REFRESH STREAK DAY
// -------------------------

// Keep the displayed day current if
// the website stays open past midnight.

setInterval(
  updateStreakDisplay,
  60000
);

