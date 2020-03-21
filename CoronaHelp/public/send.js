

    var db = firebase.firestore();



    const form = document.querySelector('#input_fields');

 
// saving data:


form.addEventListener('submit', (e) => {
    e.preventDefault();
    db.collection('messages').add({
        address: form.address.value,
        contactInfo: form.contactInfo.value,
        firstName: form.first_name.value,
        typeOfHelp: form.typeOfHelp.value,
        age: form.age.value
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






