import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, setDoc, addDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

const ADMIN_EMAIL = "tes59541@gmail.com";

async function showAllScoresForAdmin() {
  const output = document.getElementById("output");
  output.innerHTML = "<h2>All User Scores</h2>";

  const questions = {
    q1: {
      text: "What is 2 + 2?",
      correct: "4"
    },
    q2: {
      text: "What color is the sky?",
      correct: "blue"
    }
  };

  try {
    const querySnapshot = await getDocs(collection(db, "quiz_results"));
    if (querySnapshot.empty) {
      output.innerHTML += "<p>No quiz results found.</p>";
      return;
    }

    const scoresByUser = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const email = data.email || "unknown";
      const timestamp = data.timestamp?.seconds
        ? new Date(data.timestamp.seconds * 1000).toLocaleString()
        : "No time";
      // const scoreLine = `Score: ${data.score ?? "?"}, Time: ${timestamp}`;
      const passedText = data.passed ? "✅ Passed" : "❌ Failed";

      // const scoreLine = `Attempt #${data.attempt ?? "?"} - Score: ${data.score ?? "?"}, Time: ${timestamp}`;

      const scoreLine = `Attempt #${data.attempt ?? "?"} - Score: ${data.score ?? "?"} - ${passedText} - Time: ${timestamp}`;



      if (!scoresByUser[email]) scoresByUser[email] = [];

      scoresByUser[email].push({
        scoreLine,
        answers: data.answers
      });
    });

    for (const email in scoresByUser) {
      output.innerHTML += `<h4>${email}</h4><ul>`;
      scoresByUser[email].forEach(entry => {
        output.innerHTML += `<li>${entry.scoreLine}`;

        if (entry.answers) {
          output.innerHTML += "<ul>";
          for (const qid in entry.answers) {
            const userAnswer = entry.answers[qid];
            const question = questions[qid];
            const correct = question?.correct ?? "N/A";
            const text = question?.text ?? qid;

            output.innerHTML += `<li><strong><b>${text}</b></strong><br>
              <b>User Answer</b>: <em>${userAnswer}</em><br>
              <b>Correct Answer</b>: <strong>${correct}</strong></li>`;
          }
          output.innerHTML += "</ul>";
        }

        output.innerHTML += "</li>";
      });
      output.innerHTML += "</ul>";
    }

  } catch (err) {
    console.error("Error fetching scores:", err);
    output.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}


// async function showAllScoresForAdmin() {
//   const output = document.getElementById("output");
//   output.innerHTML = "<h2>All User Scores</h2>";

//   try {
//     const querySnapshot = await getDocs(collection(db, "quiz_results"));

//     const scoresByUser = {};
//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       const email = data.email;
//       const scoreEntry = `Score: ${data.score}, Time: ${new Date(data.timestamp?.seconds * 1000).toLocaleString()}`;

//       if (!scoresByUser[email]) {
//         scoresByUser[email] = [];
//       }
//       scoresByUser[email].push(scoreEntry);
//     });

//     for (const email in scoresByUser) {
//       output.innerHTML += `<h4>${email}</h4><ul>`;
//       scoresByUser[email].forEach(score => {
//         output.innerHTML += `<li>${score}</li>`;
//       });
//       output.innerHTML += "</ul>";
//     }

//   } catch (err) {
//     output.textContent = "Error fetching scores: " + err.message;
//     console.error(err);
//   }
// }


window.submitQuizResult = async function() {
  const user = auth.currentUser;
  if (user) {
    const userAnswers = {
      q1: quizForm.q1.value,
      q2: quizForm.q2.value
    }
    const score = Math.floor(Math.random() * 100); // Dummy score
    await setDoc(doc(db, "quiz_results", user.uid), {
      email: user.email,
      score: score,
      answers: userAnswers,
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

  const attempts = await getUserSubmissionCount(user.email);
  if (attempts >= 3) {
    alert("You've already taken the quiz 3 times. Please check in with Tye.");
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

  if (userAnswers.q1 === "4") score++;
  if (userAnswers.q2.toLowerCase() === "blue") score++;

  const totalQuestions = 2;
  // const totalQuestions = Object.keys(userAnswers).length;
  const percent = (score / totalQuestions) * 100;

  // Object.keys(answers).forEach(q => {
  //   if (userAnswers[q] === answers[q]) {
  //     score++;
  //   }
  // });

  const passed = percent >= 80;

  try {
    // await setDoc(doc(db, "quiz_results", user.uid), {
    await addDoc(collection(db, "quiz_results"), {
      email: user.email,
      score: score,
      // q1: quizForm.q1.value,
      // q2: quizForm.q2.value,
      answers: userAnswers,
      attempt: attempts + 1,
      timestamp: new Date(),
      passed: passed
    });

    quizForm.style.display = "none";

    const newAttempts = attempts + 1;
    const remaining = 3 - newAttempts;

    output.innerHTML = `<p>Your score: <strong>${score}</strong></p>`;
    if (percent >= 80) {
      output.innerHTML += `<p style="color:green;"><strong>Congratulations! You passed the quiz. ✅</strong></p>`;
    } else {
      output.innerHTML += `<p style="color:red;"><strong>You did not pass. Try again.</strong></p>`;
    }

    output.innerHTML += `<p>You have <strong>${2 - attempts}</strong> attempt(s) remaining.</p>`;
    document.getElementById("quizResult").textContent = `Your score: ${score} / ${Object.keys(answers).length}. You have ${remaining} quiz attempt${remaining === 1 ? "" : "s"} remaining.`;
    // document.getElementById("redoQuizBtn").style.display = "inline-block";
    if (remaining == 0) {
      document.getElementById("redoQuizBtn").style.display = "none";
    } else {
      document.getElementById("redoQuizBtn").style.display = "inline-block";
    }
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

async function getUserSubmissionCount(email) {
  const q = query(
    collection(db, "quiz_results"),
    where("email", "==", email)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

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
    // output.style.display = "none";
    output.style.display = "block";

    const attempts = await getUserSubmissionCount(user.email);
    const remaining = 3 - attempts;

    if (remaining <= 0) {
      quizForm.style.display = "none";
      quizSection.style.height = "125px";
      output.innerHTML = `<p style="color:black";>You have already taken the quiz 3 times. Please check in with Tye.</p>`;
    } else {
      output.innerHTML = `<p>You have <strong>${remaining}</strong> quiz attempt${remaining === 1 ? "" : "s"} remaining.</p>`;
    }

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

