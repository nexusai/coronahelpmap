

var db = firebase.firestore();
const form = document.querySelector('#input_fields');

//Secret key provided by Google
const apiKey = '6Lee_eIUAAAAAKER_ubQ1xR10bsikHiH3Fi-beBq';
// const apiString = < YOUR BACKEND API > ;

db.collection("helpers").get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            //console.log(doc.id, " => ", doc.data());
            console.log(doc.data().firstName)
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
// saving data:


form.addEventListener('submit', (e) => {
    e.preventDefault();
    db.collection('helpersPreZip').add({
        address: form.address.value,
        contactInfo: form.contactInfo.value,
        firstName: form.first_name.value,
        typeOfHelp: form.typeOfHelp.value,
        age: form.age.value
    })
.then(docRef => {
    console.log("Document written with ID: ", docRef.id);
    console.log("You can now also access .this as expected: ", this.foo);
    form.querySelector('.alert.success').style.display = 'block';
    let data = {
          id: docRef.id
          };

          
    db.collection("helpersPreZip").doc(docRef.id)
.set(data, {merge: true});
    form.reset();

})
.catch(error => console.error("Error adding document: ", error))
    form.querySelector('.alert.error').style.display = 'block';
    //window.location.assign("https://coronahelpmap.com/");


})






