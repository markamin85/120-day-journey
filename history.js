// -------------------------
// FIREBASE IMPORTS
// -------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// -------------------------
// FIREBASE CONFIGURATION
// -------------------------

// Copy the SAME firebaseConfig block
// that you already have in script.js.

const firebaseConfig = {

  apiKey: "PUT THE SAME API KEY FROM script.js HERE",

  authDomain: "day-journey-5d91e.firebaseapp.com",

  projectId: "day-journey-5d91e",

  storageBucket: "day-journey-5d91e.firebasestorage.app",

  messagingSenderId: "159472568464",

  appId: "1:159472568464:web:7a7e227275bdc5e7faf015"

};


// -------------------------
// INITIALIZE FIREBASE
// -------------------------

const app =
  initializeApp(firebaseConfig);

const db =
  getFirestore(app);

const auth =
  getAuth(app);


// -------------------------
// PAGE ELEMENTS
// -------------------------

const historyStatus =
  document.getElementById("historyStatus");

const historyList =
  document.getElementById("historyList");


// -------------------------
// FORMAT DATE
// -------------------------

function formatDate(dateString) {

  const parts =
    dateString.split("-");

  const year =
    Number(parts[0]);

  const month =
    Number(parts[1]) - 1;

  const day =
    Number(parts[2]);

  const date =
    new Date(
      year,
      month,
      day
    );

  return date.toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric"
    }
  );

}


// -------------------------
// LOAD HISTORY
// -------------------------

async function loadHistory(user) {

  historyStatus.textContent =
    "Loading history...";


  const logsReference =
    collection(
      db,
      "users",
      user.uid,
      "dailyLogs"
    );


  const historyQuery =
    query(
      logsReference,
      orderBy("date", "desc")
    );


  const snapshot =
    await getDocs(historyQuery);


  historyList.innerHTML = "";


  if (snapshot.empty) {

    historyStatus.textContent =
      "No history yet.";

    return;

  }


  historyStatus.textContent = "";


  snapshot.forEach((documentSnapshot) => {

    const data =
      documentSnapshot.data();


    const historyItem =
      document.createElement("div");


    historyItem.className =
      "history-item";


    const percentage =
      Number(data.percentage || 0);


    const completed =
      Number(data.completed || 0);


    const total =
      Number(data.total || 9);


    historyItem.innerHTML = `

      <div class="history-date">
        ${formatDate(data.date)}
      </div>

      <div class="history-score">
        ${percentage.toFixed(1)}%
      </div>

      <div class="history-count">
        ${completed} of ${total} completed
      </div>

    `;


    historyList.appendChild(
      historyItem
    );

  });

}


// -------------------------
// AUTHENTICATION STATUS
// -------------------------

onAuthStateChanged(
  auth,
  async (user) => {

    if (user) {

      try {

        await loadHistory(user);

      } catch (error) {

        console.error(
          "History load error:",
          error
        );

        historyStatus.textContent =
          "Could not load history.";

      }

    } else {

      historyStatus.textContent =
        "Please sign in on the main page first.";

    }

  }
);
