// =====================================
// US TOGETHER - APP FUNCTIONS
// =====================================

import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
    doc,
    getDoc,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =====================================
// RELATIONSHIP COUNTER
// =====================================

const relationshipDate = "2025-07-16";

function updateCounter() {

    const start = new Date(relationshipDate + "T00:00:00");
    const today = new Date();

    const difference = today - start;

    const days = Math.max(
        0,
        Math.floor(difference / (1000 * 60 * 60 * 24))
    );

    document.getElementById("days").textContent = days;
}

updateCounter();


// =====================================
// NAVIGATION
// =====================================

function showPage(pageName) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {
        page.classList.add("hidden");
    });

    document.getElementById(pageName).classList.remove("hidden");
}


// =====================================
// DEMO MESSAGING
// =====================================

function sendMessage() {

    const input = document.getElementById("messageInput");
    const messages = document.getElementById("messages");

    const message = input.value.trim();

    if (message === "") return;

    const empty = messages.querySelector(".empty");

    if (empty) {
        empty.remove();
    }

    const bubble = document.createElement("div");

    bubble.className = "message";
    bubble.textContent = message;

    messages.appendChild(bubble);

    input.value = "";

    messages.scrollTop = messages.scrollHeight;
}


// =====================================
// DEMO ALBUM CREATION
// =====================================

function createAlbum() {

    const albumName = prompt("Enter your album name:");

    if (!albumName || albumName.trim() === "") return;

    const album = document.createElement("div");

    album.className = "message";
    album.textContent = "📸 " + albumName.trim();

    document.getElementById("albumList").appendChild(album);
}


// =====================================
// LOGIN ELEMENTS
// =====================================

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authMessage = document.getElementById("authMessage");


// =====================================
// CREATE ACCOUNT
// =====================================

document.getElementById("signupBtn").addEventListener("click", async () => {

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {

        await createUserWithEmailAndPassword(auth, email, password);

        authMessage.textContent = "Account created successfully!";

    } catch (error) {

        authMessage.textContent = error.message;

    }
});


// =====================================
// LOGIN
// =====================================

document.getElementById("loginBtn").addEventListener("click", async () => {

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {

        await signInWithEmailAndPassword(auth, email, password);

        authMessage.textContent = "Logged in successfully!";

    } catch (error) {

        authMessage.textContent = error.message;

    }
});


// =====================================
// PROFILE SCREEN
// =====================================

function showProfileSetup() {

    document.querySelector(".header").style.display = "none";
    document.querySelector(".container").style.display = "none";
    document.querySelector("footer").style.display = "none";

    document.getElementById("profileSetup").classList.remove("hidden");
}


// =====================================
// MAIN APP SCREEN
// =====================================

function showMainApp() {

    document.getElementById("profileSetup").classList.add("hidden");

    document.querySelector(".header").style.display = "";
    document.querySelector(".container").style.display = "";
    document.querySelector("footer").style.display = "";
}


// =====================================
// SAVE PROFILE
// =====================================

document.getElementById("saveProfileBtn").addEventListener("click", async () => {

    const user = auth.currentUser;

    const usernameInput = document.getElementById("username");
    const profileMessage = document.getElementById("profileMessage");

    if (!user) {
        profileMessage.textContent = "Please log in first.";
        return;
    }

    const username = usernameInput.value.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {

        profileMessage.textContent =
            "Use 3-20 characters: letters, numbers, or underscores.";

        return;
    }

    const button = document.getElementById("saveProfileBtn");

    button.disabled = true;

    profileMessage.textContent = "Saving your profile...";

    try {

        const userRef = doc(db, "users", user.uid);
        const usernameRef = doc(db, "usernames", username);

        await runTransaction(db, async (transaction) => {

            const usernameSnapshot = await transaction.get(usernameRef);

            if (usernameSnapshot.exists()) {
                throw new Error("That username is already taken. Try another!");
            }

            transaction.set(usernameRef, {
                uid: user.uid
            });

            transaction.set(userRef, {
                username: username,
                usernameLower: username,
                photoURL: "",
                createdAt: serverTimestamp()
            });

        });

        profileMessage.textContent = "Profile created successfully! 💗";

        showMainApp();

    } catch (error) {

        profileMessage.textContent = error.message;

    } finally {

        button.disabled = false;

    }
});


// =====================================
// FIND PEOPLE
// =====================================

document.getElementById("searchUserBtn").addEventListener("click", async () => {

    const searchInput = document.getElementById("searchUsername");
    const searchResults = document.getElementById("searchResults");

    const username = searchInput.value.trim().toLowerCase();

    if (!username) {

        searchResults.textContent = "Please enter a username.";

        return;
    }

    searchResults.textContent = "Searching...";

    try {

        const usernameRef = doc(db, "usernames", username);

        const usernameSnapshot = await getDoc(usernameRef);

        if (!usernameSnapshot.exists()) {

            searchResults.textContent = "User not found.";

            return;
        }

        const userId = usernameSnapshot.data().uid;

        if (userId === auth.currentUser.uid) {

            searchResults.textContent = "That's your own profile!";

            return;
        }

        const profileRef = doc(db, "users", userId);

        const profileSnapshot = await getDoc(profileRef);

        if (!profileSnapshot.exists()) {

            searchResults.textContent = "Profile unavailable.";

            return;
        }

        const profile = profileSnapshot.data();

        searchResults.textContent = "Found: @" + profile.username;

    } catch (error) {

        console.error("Search error:", error);

        searchResults.textContent =
            "Search failed. Please try again.";

    }
});


// =====================================
// CHECK LOGIN AND EXISTING PROFILE
// =====================================

onAuthStateChanged(auth, async (user) => {

    const loginScreen = document.getElementById("loginScreen");
    const appContent = document.getElementById("appContent");

    if (user) {

        loginScreen.style.display = "none";
        appContent.style.display = "block";

        try {

            const userRef = doc(db, "users", user.uid);

            const profileSnapshot = await getDoc(userRef);

            if (profileSnapshot.exists()) {

                showMainApp();

            } else {

                showProfileSetup();

            }

        } catch (error) {

            console.error("Profile loading error:", error);

            alert(
                "Could not load your profile. Please check your connection and Firestore rules."
            );

        }

    } else {

        loginScreen.style.display = "flex";
        appContent.style.display = "none";

    }

});


// =====================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================

window.showPage = showPage;
window.sendMessage = sendMessage;
window.createAlbum = createAlbum;

#forgotPassword {
    display: inline-block;
    position: relative;
    z-index: 10;
    color: #e75480;
    text-decoration: none;
    cursor: pointer;
    padding: 8px;
}

#forgotPassword:hover {
    text-decoration: underline;
}
