import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyChPsd4j6PPJ_PjSGSS_pdGfCSMrKjAD84",
  authDomain: "eders-73638.firebaseapp.com",
  projectId: "eders-73638",
  storageBucket: "eders-73638.firebasestorage.app",
  messagingSenderId: "245841327354",
  appId: "1:245841327354:web:da6fa492929ff2b3fc4543",
  measurementId: "G-PE0EKZJGFQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app);

// Login/Register functions
window.register = function() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Registered"))
    .catch(e => alert(e.message));
}

// document.getElementById("registerBtn").addEventListener("click", async () => {
//   const email = document.getElementById("email").value;
//   const pass = document.getElementById("password").value;
//   try {
//     console.log("register");
//     await createUserWithEmailAndPassword(auth, email, pass);
//     alert("Registered");
//   } catch (e) {
//     alert(e.message);
//   }
// });

document.getElementById("loginBtn").addEventListener("click", async () => {
// window.login = function() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Logged In"))
    .catch(e => alert(e.message));
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("Logged out");
  } catch (e) {
    alert("Logout failed: " + e.message);
  }
});

// Example: Save quiz result
async function saveQuizResult(score) {
  const user = auth.currentUser;
  if (user) {
    await setDoc(doc(db, "quiz_results", user.uid), {
      email: user.email,
      score: score,
      timestamp: new Date()
    });
  }
}

// For viewing all results as master account
async function viewAllScores() {
  const querySnapshot = await getDocs(collection(db, "quiz_results"));
  querySnapshot.forEach((doc) => {
    console.log(doc.data()); // Each user’s score + email
  });
}

window.submitQuizResult = async function() {
  const user = auth.currentUser;
  if (user) {
    const score = Math.floor(Math.random() * 100); // Dummy score
    await setDoc(doc(db, "quiz_results", user.uid), {
      email: user.email,
      score: score,
      timestamp: new Date()
    });
    alert("Quiz result saved: " + score);
  } else {
    alert("Not logged in.");
  }
};

const quizSection = document.getElementById("quizSection");
const quizForm = document.getElementById("quizForm");

onAuthStateChanged(auth, async (user) => {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const output = document.getElementById("output");

  if (user) {
    loginBtn.style.display = "none";
    // registerBtn.style.display = "none";
    logoutBtn.style.display = "inline";

    if (user.email === "admin@example.com") {
      const querySnapshot = await getDocs(collection(db, "quiz_results"));
      output.textContent = "";
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        output.textContent += `Email: ${data.email}, Score: ${data.score}\n`;
      });
    }
  } else {
    loginBtn.style.display = "inline";
    // registerBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    output.textContent = "";
  }

  // if (user && user.email === "admin@example.com") {
  //   const output = document.getElementById("output");
  //   const querySnapshot = await getDocs(collection(db, "quiz_results"));
  //   output.textContent = "";
  //   querySnapshot.forEach((doc) => {
  //     const data = doc.data();
  //     output.textContent += `Email: ${data.email}, Score: ${data.score}\\n`;
  //   });
  // }
});

