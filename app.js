// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "yourproject.firebaseapp.com",
  projectId: "yourproject",
  storageBucket: "yourproject.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login/Register functions
window.register = function() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Registered"))
    .catch(e => alert(e.message));
}

window.login = function() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Logged In"))
    .catch(e => alert(e.message));
}

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
