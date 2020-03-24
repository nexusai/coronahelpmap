

    var db = firebase.firestore();



const form = document.querySelector('#input_fields');

 
// saving data:
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const receiverId = urlParams.get('id').toString();

//var docRef = db.collection("helpers").doc(receiverId);




form.addEventListener('submit',async (e) => {
    e.preventDefault();

        const docRefHelper = db.collection("helpers").doc(receiverId);
        const docRefSeeker = db.collection("searcher").doc(receiverId);

        var docHelper = await docRefHelper.get();
        var docSeeker = await docRefSeeker.get();

        if (!docHelper.exists) {
            docHelper = docSeeker
        }
        
        const mailadresse = docHelper.data().contactInfo;

        //console.log(mailadresse)

    db.collection('mail').add({
        from: '"Corona Helpmap" <noreply@coronahelpmap.com>',
        to: mailadresse,
        message: {
        subject: 'Du hast eine Nachricht von ' + form.first_name.value + ' ' + form.last_name.value,
        text: form.first_name.value + ' hat dir eine Nachricht geschickt',
        html: 'Name: ' + form.first_name.value + ' ' + form.last_name.value + '<br>' + 'E-Mail: ' + form.contactInfo.value + '<br>' + 'Adresse: ' + form.address.value + '<br><br>' + form.typeOfHelp.value + '<br><br><tbody><tr><td align="center" bgcolor="#000000" class="inner-td" style="border-radius:6px; font-size:16px; text-align:left; background-color:inherit;"><a href=mailto:' + form.contactInfo.value + ' style="background-color:#000000; border:1px solid #000000; border-color:#000000; border-radius:0px; border-width:1px; color:#ffffff; display:inline-block; font-size:18px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid; font-family:inherit;" target="_blank">Antworten</a></td></tr></tbody>',
    }
    }).then(docRef => {
        console.log("Document written with ID: ", docRef.id);
        form.reset();
        form.querySelector('#success-message').style.display = 'block';
    })
    .catch(error => {
        form.querySelector('#error-message').style.display = 'block';
        console.error("Error adding document: ", error)
    })

    





})






