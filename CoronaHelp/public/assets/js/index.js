let db = firebase.firestore();
let auth = firebase.auth();

const formSeeker = document.querySelector("#input_fields_seeker");
const formHelper = document.querySelector("#input_fields_helper");
const apiKey = "6Lee_eIUAAAAAKER_ubQ1xR10bsikHiH3Fi-beBq";

// The currently logged in (firebase) user
let user;

// The coordinates the map centers on by default.
let fallbackCoordinates = [50.627540588378906, 9.958450317382812];
// The precise coordinates. Is set by the updateMapPrecisely(), if the Geolocation API query was successful and precise coordinates are known.
let preciseCoordinates;

let mymap = L.map("mapid").setView(fallbackCoordinates, 5);
// Center the approximate location of the user without using the Geolocation API, which might not be allowed by the user
updateMapApproximately();
// Try to get more precise coordinates via the Geolocation API
updateMapPrecisely();
// Load all users and show them on the map
loadUsers();

let markers = L.markerClusterGroup({
  iconCreateFunction: function(cluster) {
    var childCount = cluster.getChildCount();
    var c = " markerGreen-cluster-";
    if (childCount < 10) {
      c += "small";
    } else if (childCount < 100) {
      c += "medium";
    } else {
      c += "large";
    }
    return new L.DivIcon({
      html: "<div><span>" + childCount + "</span></div>",
      className: "marker-cluster" + c,
      iconSize: new L.Point(40, 40)
    });
  },
  //Disable all of the defaults:
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true
});

// Guarantees that there is always a user signed in (anonymously)
auth.onAuthStateChanged(updatedUser => {
  if (updatedUser) {
    user = updatedUser;
  } else {
    auth.signInAnonymously();
  }
});

var blueIcon = L.icon({
  iconUrl: "assets/img/MarkerBlue.png",

  iconSize: [60, 60], // size of the icon
  iconAnchor: [30, 60], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -60] // point from which the popup should open relative to the iconAnchor
});

var greenIcon = L.icon({
  iconUrl: "assets/img/MarkerGreen.png",

  iconSize: [60, 60], // size of the icon
  iconAnchor: [30, 60], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -60] // point from which the popup should open relative to the iconAnchor
});

async function searchAddressCoordinates(address) {
  address = address.replace(/ /g, "+");
  const result = await fetch(
    `https://nominatim.openstreetmap.org/search/search?q=${address}&format=json`
  );
  const json = await result.json();
  if (json && json.length > 0) {
    return {
      lat: parseFloat(json[0].lat),
      lon: parseFloat(json[0].lon)
    };
  } else {
    return null;
  }
}
// Search handler
document.querySelector("#searchCity").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    // code for enter
    var cityInputField = document.getElementById("searchCity").value;
    mapUpdateForQuery(cityInputField);
  }
});
document
  .querySelector("#searchCity-button")
  .addEventListener("click", function(e) {
    var cityInputField = document.getElementById("searchCity").value;
    mapUpdateForQuery(cityInputField);
  });

// Requests the coordinates for the query and centers the map on these coordinates.
async function mapUpdateForQuery(query, zoomLevel = 13) {
  const result = await searchAddressCoordinates(query);
  if (result && result !== null) {
    preciseCoordinates = [result.lat, result.lon];
    mymap.setView(preciseCoordinates, zoomLevel);
  }
}

// Tries to get an approximate geolocation via external APIs without using the Geolocation API of the browser.
// Updates the map accordingly.
async function updateMapApproximately(zoomLevel = 12) {
  try {
    const ipResponse = await fetch("https://api.ipify.org/?format=json");
    const ip = (await ipResponse.json()).ip;
    const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
    const geoJson = await geoResponse.json();
    // Update the fallback coordinates for the app
    fallbackCoordinates = [geoJson.lat, geoJson.lon];
  } catch (err) {
    console.log(err);
  }
  if (preciseCoordinates == null) {
    // Only update if we dont have more precise coordinates already
    mymap.setView(fallbackCoordinates, zoomLevel);
  }
}

// Tries to get a precise geolocation via the Geolocation API of the browser.
// Updates the map accordingly.
async function updateMapPrecisely(zoomLevel = 12) {
  if (navigator.geolocation) {
    await navigator.geolocation.getCurrentPosition(
      position => {
        preciseCoordinates = [
          position.coords.latitude,
          position.coords.longitude
        ];
        mymap.setView(preciseCoordinates, zoomLevel);
      },
      error => {
        console.log(error);
      }
    );
  }
}

// Add title to map
L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    detectRetina: true,
    zoomOffset: -1,
    accessToken:
      "pk.eyJ1IjoiZ2FuZ2hhbmciLCJhIjoiY2pxdmp2bXhqMHc1ZzQzb2NpOWY5NmRuMCJ9.LTrUYDuCAPXnJ-0vzQ9gsQ"
  }
).addTo(mymap);

// Loads all users and shows them on the map
async function loadUsers() {
  const snapshot = await db.collection("users").get();
  snapshot.forEach(doc => {
    const url = "send.html?id=";
    const customId = doc.id;
    const urlFinal = url + customId;
    console.log(urlFinal);

    const accountType = doc.data().accountType;

    let accountTypeConverted;
    if (accountType == "private") {
      accountTypeConverted = "Privatperson";
    } else {
      accountTypeConverted = "Organisation";
    }

    if (doc.isHelper) {
      markers.addLayer(
        L.marker(
          [doc.data().location.latitude, doc.data().location.longitude],
          { icon: greenIcon }
        )
          .bindPopup(
            accountTypeConverted +
              "<br>" +
              '<span style="font-size:12pt;font-weight:bold">' +
              doc.data().profession +
              "</span>" +
              '<br><br><i>"' +
              doc.data().helpDescription +
              '"</i><br><br><a href=' +
              urlFinal +
              ' target="_parent"><button type="submit" class="btn btn-primary btn-lg" style="height:35px;width:100px;font-size:12px;background-color:#75cb3d;border:none">Nachricht</button></a>'
          )
          .openPopup()
      );
    } else if (doc.isRequester) {
      markers.addLayer(
        L.marker(
          [doc.data().location.latitude, doc.data().location.longitude],
          { icon: blueIcon }
        )
          .bindPopup(
            accountTypeConverted +
              "<br>" +
              '<span style="font-size:12pt;font-weight:bold">' +
              doc.data().profession +
              "</span>" +
              '<br><br><i>"' +
              doc.data().requestDescription +
              '"<br><br><a href=' +
              urlFinal +
              ' target="_parent"><button type="submit" class="btn btn-primary btn-lg" style="height:35px;width:100px;font-size:12px;background-color:#0095e1;border:none">Nachricht</button></a>'
          )
          .openPopup()
      );
    }
  });
  mymap.addLayer(markers);
}

async function createUser(data, email) {
  console.log("data", data);
  if (!user)
    throw new Exception("No user is logged in (not even anonymously).");
  try {
    const coordinates = await searchAddressCoordinates(data.address);
    console.log("coordinates", coordinates);
    const ref = db.collection("users").doc(user.uid);
    await ref.set({
      ...data,
      location: new firebase.firestore.GeoPoint(
        coordinates.lat,
        coordinates.lon
      ),
      uid: user.uid,
      emailValidated: false,
      createdAt: new firebase.firestore.FieldValue.serverTimestamp()
    });
    const actionCodeSettings = {
      url: `https://www.coronahelpmap.com/finishSignUp?id=${user.uid}`,
      handleCodeInApp: true
    };
    await auth.sendSignInLinkToEmail(email, actionCodeSettings);
    window.localStorage.setItem("emailForSignIn", email);
  } catch (err) {
    console.log("err", err);
    throw err;
  }
}

formHelper.addEventListener("submit", async e => {
  e.preventDefault();
  try {
    createUser(
      {
        isHelper: true,
        address: formHelper.address_helper.value,
        profession: formHelper.work_helper.value,
        helpDescription: formHelper.helpDescription_helper.value,
        accountType: formHelper.accountType_helper.value,
        categories: {
          household: formHelper.household_helper.checked,
          courier_services: formHelper.courier_services_helper.checked,
          pets: formHelper.pets_helper.checked,
          craft: formHelper.craft_helper.checked,
          agriculture: formHelper.agriculture_helper.checked,
          retail: formHelper.retail_helper.checked,
          health: formHelper.health_helper.checked,
          care: formHelper.care_helper.checked,
          consultation: formHelper.consultation_helper.checked,
          other: formHelper.other_helper.checked,
          handicap: formHelper.handicap_helper.checked,
          car: formHelper.car_helper.checked
        }
      },
      formHelper.email_helper.value
    ).then(
      () =>
        (formHelper.querySelector("#success-message").style.display = "block")
    );
    formHelper.reset();
  } catch (error) {
    formHelper.querySelector("#error-message").style.display = "block";
    console.error("Error adding document: ", error);
  }
});

formSeeker.addEventListener("submit", e => {
  e.preventDefault();
  try {
    createUser(
      {
        isRequester: true,
        address: formSeeker.address_seeker.value,
        profession: formSeeker.profession_seeker.value,
        requestDescription: formSeeker.requestDescription_seeker.value,
        accountType: formSeeker.accountType_seeker.value,
        categories: {
          household: formHelper.household_seeker.checked,
          courier_services: formHelper.courier_services_seeker.checked,
          pets: formHelper.pets_seeker.checked,
          craft: formHelper.craft_seeker.checked,
          agriculture: formHelper.agriculture_seeker.checked,
          retail: formHelper.retail_seeker.checked,
          health: formHelper.health_seeker.checked,
          care: formHelper.care_seeker.checked,
          consultation: formHelper.consultation_seeker.checked,
          other: formHelper.other_seeker.checked,
          handicap: formHelper.handicap_seeker.checked,
          car: formHelper.car_seeker.checked
        }
      },
      formSeeker.email_seeker.value
    ).then(
      () =>
        (formHelper.querySelector("#success-message").style.display = "block")
    );
    formHelper.reset();
  } catch (error) {
    formSeeker.querySelector("#error-message").style.display = "block";
    console.error("Error adding document: ", error);
  }
});

function renderCategories(categories) {
  var icons = "";
  if (categories.household_seeker) {
    icons += '<i class="material-icons">house</i>';
  }
  if (categories.courier_services_seeker) {
    icons += '<i class="material-icons">directions_run</i>';
  }
  if (categories.pets_seeker) {
    icons += '<i class="material-icons">pets</i>';
  }
  if (categories.craft_seeker) {
    icons += '<i class="material-icons">build</i>';
  }
  if (categories.agriculture_seeker) {
    icons += '<i class="material-icons">eco</i>';
  }
  if (categories.retail_seeker) {
    icons += '<i class="material-icons">shopping_cart</i>';
  }
  if (categories.health_seeker) {
    icons += '<i class="material-icons">local_pharmacy</i>';
  }
  if (categories.care_seeker) {
    icons += '<i class="material-icons">local_hotel</i>';
  }
  if (categories.consultation_seeker) {
    icons += '<i class="material-icons">local_phone</i>';
  }
  if (categories.other_seeker) {
    icons += '<i class="material-icons">help</i>';
  }
  if (categories.handicap_seeker) {
    icons += '<i class="material-icons">accessible</i>';
  }
  if (categories.car_seeker) {
    icons += '<i class="material-icons">directions_car</i>';
  }
  if (categories.household_helper) {
    icons += '<i class="material-icons">house</i>';
  }
  if (categories.courier_services_helper) {
    icons += '<i class="material-icons">directions_run</i>';
  }
  if (categories.pets_helper) {
    icons += '<i class="material-icons">pets</i>';
  }
  if (categories.craft_helper) {
    icons += '<i class="material-icons">build</i>';
  }
  if (categories.agriculture_helper) {
    icons += '<i class="material-icons">eco</i>';
  }
  if (categories.retail_helper) {
    icons += '<i class="material-icons">shopping_cart</i>';
  }
  if (categories.health_helper) {
    icons += '<i class="material-icons">local_pharmacy</i>';
  }
  if (categories.care_helper) {
    icons += '<i class="material-icons">local_hotel</i>';
  }
  if (categories.consultation_helper) {
    icons += '<i class="material-icons">local_phone</i>';
  }
  if (categories.other_helper) {
    icons += '<i class="material-icons">help</i>';
  }
  if (categories.handicap_helper) {
    icons += '<i class="material-icons">accessible</i>';
  }
  if (categories.car_helper) {
    icons += '<i class="material-icons">directions_car</i>';
  }
  return icons;
}
