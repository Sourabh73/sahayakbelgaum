// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBv3vKMih_ia_eADyo70cDHIrNTVBA-DM8",
  authDomain: "sahayak-sss1234.firebaseapp.com",
  projectId: "sahayak-sss1234",
  storageBucket: "sahayak-sss1234.firebasestorage.app",
  messagingSenderId: "883687602128",
  appId: "1:883687602128:web:af63e6f2430a286ab56bd5",
  measurementId: "G-JFRHLLZG1L"
};

firebase.initializeApp(firebaseConfig);

// Get references to the auth and Firestore services
const auth = firebase.auth();
const db = firebase.firestore();

// Sign Up
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const address = document.getElementById('address').value;
    const role = document.getElementById('role').value;

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Send email verification
        user.sendEmailVerification()
          .then(() => {
            alert('Registration successful! Waiting for verification of your email. Please check your email to verify your email ID.');

            // Save user details in Firestore
            return db.collection('User').doc(user.uid).set({
              username: username,
              email: email,
              phone: phone,
              address: address,
              role: role
            });
          })
          .then(() => {
            // Start checking for email verification status
            checkEmailVerification(user);
          })
          .catch((error) => {
            alert(`Failed to send verification email: ${error.message}`);
          });
      })
      .catch((error) => {
        alert(error.message);
      });
  });
}

// Function to continuously check email verification status
function checkEmailVerification(user) {
  const checkInterval = setInterval(() => {
    user.reload()
      .then(() => {
        if (user.emailVerified) {
          clearInterval(checkInterval); // Stop checking once verified
          alert('Your email has been verified successfully! Please log in.');
          auth.signOut(); // Log out the user
          window.location.href = 'login.html'; // Redirect to login page
        }
      })
      .catch((error) => {
        alert(`Error checking verification status: ${error.message}`);
      });
  }, 3000); // Check every 3 seconds
}

// Login
// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const role = document.getElementById('loginRole').value; // Get the selected role

      auth.signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
              const user = userCredential.user;

              // Check the user's role in Firestore
              db.collection('User').doc(user.uid).get().then((doc) => {
                  if (doc.exists) {
                      const userRole = doc.data().role;

                      // Redirect based on role
                      if (userRole === 'admin') {
                          window.location.href = 'admin.html';  // Redirect to admin page
                      } else if (userRole === 'volunteer') {
                          window.location.href = 'volunteer.html';  // Redirect to volunteer page (optional)
                      } else if (userRole === 'donor') {
                          window.location.href = 'donation.html';  // Redirect to donor page (optional)
                      } else {
                          alert('Unknown role');
                      }
                  } else {
                      alert('No user data found');
                  }
              }).catch((error) => {
                  console.error('Error getting user data:', error);
                  alert('Error fetching user data');
              });
          })
          .catch((error) => {
              alert(error.message);
          });
  });
}

// Re-send Verification Email (Optional)
function resendVerificationEmail() {
  const user = auth.currentUser;
  if (user) {
    user.sendEmailVerification()
      .then(() => {
        alert('Verification email sent again!');
      })
      .catch((error) => {
        alert(error.message);
      });
  }
}


document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const address = document.getElementById("address").value;
    const role = document.getElementById("role").value;

    if (!role) {
        alert("Please select a role!");
        return;
    }

    // Document data
    const userData = {
        name: username,
        email: email,
        phone: phone,
        password: password,
        address: address,
        role: role,
        createdAt: firebase.firestore.Timestamp.now()
    };

    try {
        // Determine collection based on role
        let collectionName;
        if (role === "admin") {
            collectionName = "admin_logs";
        } else if (role === "volunteer") {
            collectionName = "volunteers";
        } else if (role === "donor") {
            collectionName = "donations";
        }

        // Save to Firestore
        await db.collection(collectionName).add(userData);
        alert(`User registered successfully as ${role}!`);

        // Clear form fields
        document.getElementById("signupForm").reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("An error occurred while registering. Please try again.");
    }
});