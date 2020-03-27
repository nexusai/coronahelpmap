let db = firebase.firestore();
let auth = firebase.auth();

// Guarantees that there is always a user signed in (anonymously)
auth.onAuthStateChanged(user => {
    if (updatedUser) {
        const url_string = window.location.href;
        const url = new URL(url_string);
        const uid = url.searchParams.get("uid");
        
        try {
            let ref = db.collection('users').doc(uid);
            const snapshot = ref.once('value');
            if (snapshot.exists()) {
                ref.update({
                    isPublished: true,
                });
                document.getElementById('msg').innerHTML = "Your account is now created and your post is published. Thank you very much!"
            } else {
                document.getElementById('msg').innerHTML = "Something went wrong."
            }
        } catch (err) {
            document.getElementById('msg').innerHTML = "Something went wrong."
        }

    }
});