

var db = firebase.firestore();
const form = document.querySelector('#input_fields');

//Secret key provided by Google
const apiKey = '6Lee_eIUAAAAAKER_ubQ1xR10bsikHiH3Fi-beBq';
// const apiString = < YOUR BACKEND API > ;

db.collection("helpers").get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            //console.log(doc.id, " => ", doc.data());
            //console.log(doc.data().firstName)
            //console.log(customUrl)
            var url = "https://coronahelpmap.com/send.html?id="
            var customId = doc.id
            var urlFinal = url+customId

            // Poplulate Table
            var xmlString = 
                `<div class="d-flex w-100 justify-content-between">
                    <h4 class="mb-1">${doc.data().typeOfHelp}</h4> <small> vor 1 Minute </small>
                    </div>
                    <h5> ${doc.data().firstName } <span class="badge badge-secondary"> 1, 2 km </span></h5>
                    <div class="categories"></div>
                    <p> ${doc.data().typeOfHelp } </p>
                    <a href = "${urlFinal}" class="btn btn-primary" > Nachricht </button>
                </div>`;

            var el = document.createElement('article')
            el.innerHTML = xmlString
            el.classList.add('list-group-item')
            el.classList.add('list-group-item-action')
            document.querySelector('#seeker-list').append(el)
            // TODO: Poplulate with categories & weekdays
            // TODO: Populate with Post Date
            // TODO: Populate with distance



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
        paid: form.paid.value,
        categories: {
            laundry: form.laundry.checked,
            medication: form.medication.checked,
            shopping: form.shopping.checked,
            nature: form.nature.checked,
            handicap: form.handicap.checked
        },
        weekdays: {
            monday: form.monday.checked,
            tuesday: form.tuesday.checked,
            wednesday: form.wednesday.checked,
            thursday: form.thursday.checked,
            friday: form.friday.checked,
            saturday: form.saturday.checked,
            sunday: form.sunday.checked,
        },
        age: form.age.value
    })
.then(docRef => {
    console.log("Document written with ID: ", docRef.id);
    console.log("You can now also access .this as expected: ", this.foo);
    console.log("Form Data: ", docRef);
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

