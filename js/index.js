$(document).ready(function () {
  // $(".signin_link").dis
  // if(localStorage.getItem("uid"))
  //     getImages()
  // else{
  //     window.location.href = '/login.html';
  // }
});
var uid;
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    var uid = user.uid;
    getImages();
    // ...
  } else {
    // User is signed out
    window.location.href = "/login.html";

    // ...
  }
});
var db = firebase.firestore(app);
var storage = firebase.storage(app);

function submitImage() {
  var file = document.getElementById("files").files[0];
  fileName = file.name.split(".").shift();
  extension = file.name.split(".").pop();
  const id = db.collection("Images").doc().id;
  var storageRef = storage.ref(`images/${id}.${extension}`);

  var name = document.getElementById("fileName").value;
  // var uploadTask = storageRef.child("images").child(name).put(file);
  const uploadTask = storageRef.put(file);
  // Listen for state changes, errors, and completion of the upload.
  uploadTask.on(
    firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log("Upload is paused");
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log("Upload is running");
          break;
      }
    },
    (error) => {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case "storage/unauthorized":
          // User doesn't have permission to access the object
          break;
        case "storage/canceled":
          // User canceled the upload
          break;

        // ...

        case "storage/unknown":
          // Unknown error occurred, inspect error.serverResponse
          break;
      }
    },
    () => {
      // Upload completed successfully, now we can get the download URL
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log("File available at", downloadURL);
        var userid = firebase.auth().currentUser.uid;
        db.collection("users")
          .doc(userid)
          .collection("images")
          .doc(id)
          .set({
            imageName: name,
            imageUrl: downloadURL,
            id,
          })
          .then(() => {
            console.log("Document successfully written!");
            location.reload();
          })
          .catch((error) => {
            console.error("Error writing document: ", error);
          });
      });
    }
  );
}

$(".submitimage").on("click", function (e) {
  submitImage();
});

function getImages() {
  var uid = firebase.auth().currentUser.uid;
  var userRef = db.collection("users").doc(uid);
  userRef
    .collection("images")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // console.log(doc.id, " => ", doc.data());
        createImageList(doc.data().imageUrl, doc.data().imageName);
      });
    });
}

function createImageList(url, name) {
  var x =
    '<div class="box"><div class="boxInner"><img src="' +
    url +
    '"/><span class="deleteBtn">X</span><div class="titleBox">' +
    name +
    "</div></div></div>";

  $(".wrap").append(x);
  const deleteBtn = document.querySelectorAll(".deleteBtn");
  // console.log("deleteBtn:", deleteBtn);

  Array.from(deleteBtn).forEach((item) => {
    // console.log("item", item);
    item.addEventListener("click", function () {
      var uid = firebase.auth().currentUser.uid;
      console.log("uid: is a userid", uid);
      var userRef = db.collection("users").doc(uid);
      console.log("userref", userRef);
      let pictureRef = storage.refFromURL(url);
      // let checkWhatItReturns = userRef
      //   .collection("images")
      //   .doc("RHqmRbN147sioZPsR6ow");
      console.log("pictureRef: ", pictureRef);
      console.log("pictureRef.name", pictureRef.name);
      pictureRef
        .delete()
        .then(() => {
          console.log("deleted");
          db.collection("users")
            .doc(uid)
            .collection("images")
            .doc(pictureRef.name.split(".").shift())
            .delete()
            .then(() => {
              console.log("document deleted successfully from db");
              location.reload();
            })
            .catch((err) => console.log(err));
        })
        .catch(() => console.log("error deleting"));
    });
  });
}

function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      // An error happened.
      console.log(error);
    });
}
$(".logout").on("click", function (e) {
  e.preventDefault();
  logout();
});
