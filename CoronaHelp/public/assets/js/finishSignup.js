if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
  // Additional state parameters can also be passed via URL.
  // This can be used to continue the user's intended action before triggering
  // the sign-in operation.
  // Get the email if available. This should be available if the user completes
  // the flow on the same device where they started it.
  let email = window.localStorage.getItem("emailForSignIn");
  console.log('email', email);
  while (!email) {
    // User opened the link on a different device. To prevent session fixation
    // attacks, ask the user to provide the associated email again. For example:
    email = window.prompt("Please provide your email for confirmation");
  }
  // The client SDK will parse the code from the link for you.
  firebase
    .auth()
    .signInWithEmailLink(email, window.location.href)
    .then(function(result) {
      // Clear email from storage.
      window.localStorage.removeItem("emailForSignIn");
      //console.log(result.user.uid);
      user = result.user;

      try {
        firebase.firestore().collection('publishRequests').add({
          uid: result.user.uid,
          email: email,
        });
      } catch (err) {
        console.log("Something went wrong");
      }
    })
    .catch(function(error) {
        console.log(error);
      // Some error occurred, you can inspect the code: error.code
      // Common errors could be invalid email and invalid or expired OTPs.
    });
} else {
  console.log('Not a valid signin link');
}