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

const ADMIN_EMAIL = "admin@example.com";

async function showAllScoresForAdmin() {
  const output = document.getElementById("output");
  output.innerHTML = "<h2>All User Scores</h2>";

  try {
    const querySnapshot = await getDocs(collection(db, "quiz_results"));

    // Group scores by email
    const scoresByUser = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const email = data.email;
      const scoreEntry = `Score: ${data.score}, Time: ${new Date(data.timestamp?.seconds * 1000).toLocaleString()}`;

      if (!scoresByUser[email]) {
        scoresByUser[email] = [];
      }
      scoresByUser[email].push(scoreEntry);
    });

    // Render grouped results
    for (const email in scoresByUser) {
      output.innerHTML += `<h4>${email}</h4><ul>`;
      scoresByUser[email].forEach(score => {
        output.innerHTML += `<li>${score}</li>`;
      });
      output.innerHTML += "</ul>";
    }

  } catch (err) {
    output.textContent = "Error fetching scores: " + err.message;
    console.error(err);
  }
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
const loginHero = document.getElementById("loginHero");

quizForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to submit the quiz.");
    return;
  }

  let score = 0;
  const answers = {
    q1: "4",
    q2: "blue"
  };

  const userAnswers = {
    q1: quizForm.q1.value,
    q2: quizForm.q2.value
  };

  Object.keys(answers).forEach(q => {
    if (userAnswers[q] === answers[q]) {
      score++;
    }
  });

  try {
    await setDoc(doc(db, "quiz_results", user.uid), {
      email: user.email,
      score: score,
      q1: quizForm.q1.value,
      q2: quizForm.q2.value,
      timestamp: new Date()
    });

    quizForm.style.display = "none";
    document.getElementById("quizResult").textContent = `Your score: ${score} / ${Object.keys(answers).length}`;
    document.getElementById("redoQuizBtn").style.display = "inline-block";
    // alert(`Quiz submitted! Your score: ${score}`);
  } catch (e) {
    alert("Error saving result: " + e.message);
    console.error(e);
  }
});

document.getElementById("redoQuizBtn").addEventListener("click", () => {
  // Reset form, show quiz again
  quizForm.reset();
  quizForm.style.display = "block";
  document.getElementById("quizResult").textContent = "";
  document.getElementById("redoQuizBtn").style.display = "none";
});

onAuthStateChanged(auth, async (user) => {
  const loginBtn = document.getElementById("loginBtn");
  //const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const output = document.getElementById("output");

  if (user) {
    loginBtn.style.display = "none";
    // registerBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    quizSection.style.display = "block";
    quizSection.style.height = "100dvh";
    quizForm.style.display = "block";
    loginHero.style.display = "none";
    output.style.display = "none";

    if (user.email === ADMIN_EMAIL) {
      await showAllScoresForAdmin();
      output.style.display = "block";
      quizForm.style.display = "none";
      quizSection.style.height = "125px";
    }
  } else {
    loginBtn.style.display = "inline";
    // registerBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    quizSection.style.display = "none";
    loginHero.style.display = "flex";
    output.textContent = "";
    output.style.display = "none";
  }
});

