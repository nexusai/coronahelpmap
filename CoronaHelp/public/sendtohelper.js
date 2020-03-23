

    var db = firebase.firestore();



    const form = document.querySelector('#input_fields');

 
// saving data:
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const receiverId = urlParams.get('id').toString();

/*
var docRef = db.collection("helper").doc(receiverId);

docRef.get().then(function(doc) {
    if (doc.exists) {
        console.log(doc.data().contactInfo;
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
}).catch(function(error) {
    console.log("Error getting document:", error);
});

*/

form.addEventListener('submit', (e) => {
    e.preventDefault();
    db.collection('messages').add({
        address: form.address.value,
        contactInfo: form.contactInfo.value,
        firstName: form.first_name.value,
        lastName: form.last_name.value,
        message: form.typeOfHelp.value,
        receiverId: receiverId
    })
.then(docRef => {
    console.log("Document written with ID: ", docRef.id);
    console.log("You can now also access .this as expected: ", this.foo);
    let data = {
          id: docRef.id
          };

          
    db.collection("messages").doc(docRef.id)
.set(data, {merge: true});
    form.reset();

})
.catch(error => console.error("Error adding document: ", error))
    //window.location.assign("https://coronahelpmap.com/");


})






