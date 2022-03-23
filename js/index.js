var uid;
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    getImages();

    // ...
  } else {
    // User is signed out
    window.location.href = "./login.html";

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
  var storageref = storage.ref(`images/${id}.${extension}`);

  var name = document.getElementById("fileName").value
    ? document.getElementById("fileName").value
    : file.name.replace(/\.[^/.]+$/, "");
  var uploadTask = storageref.put(file);
  // Listen for state changes, errors, and completion of the upload.
  uploadTask.on(
    firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
  var user = firebase.auth().currentUser;
  if (user !== null) {
    user.providerData.forEach((profile) => {
      if (profile.displayName != null) {
        $(".displayName")[0].innerText = "Hi " + profile.displayName + "!";
      } else {
        $(".displayName")[0].innerText = "Hi!";
      }
    });
  }
  var userRef = db.collection("users").doc(uid);
  var index = 0;
  userRef
    .collection("images")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        index++;
        createImageList(doc.data().imageUrl, doc.data().imageName, index);
      });
    });
}

var modal = document.getElementById("myModal1");
var modalImg = document.getElementById("img001");
var captionText = document.getElementById("captiontext");
function enlargeImg(url, name) {
  modal.style.display = "block";
  modalImg.src = url;
  captionText.innerHTML = name;
}
function createImageList(url, name, index) {
  var x =
    '<div class="box"><div class="boxInner"><div class="titleBox">' +
    name +
    '</div><button class="deleteBtn" id="deleteBtn' +
    index +
    '">Delete</button><img src="' +
    url +
    '" id="img' +
    index +
    '"/>' +
    "</div></div>";
  $(".wrap").append(x);
  var wrap = $(".wrap")[0];
  if (wrap != null || undefined) {
    wrap.style.background = "linear-gradient(120deg,#2980b9, #8e44ad)";
  }
  $("#img" + index).on("click", function (e) {
    enlargeImg(url, name);
  });
  $("#deleteBtn" + index).on("click", function (e) {
    deletePicture(url);
  });
}

function deletePicture(url) {
  var uid = firebase.auth().currentUser.uid;
  var userRef = db.collection("users").doc(uid);
  let pictureRef = storage.refFromURL(url);
  pictureRef
    .delete()
    .then(() => {
      db.collection("users")
        .doc(uid)
        .collection("images")
        .doc(pictureRef.name.split(".").shift())
        .delete()
        .then(() => {
          location.reload();
        })
        .catch((err) => console.log(err));
    })
    .catch(() => console.log("error deleting"));
}
closeCheck = document.getElementsByClassName("closebut");
if (closeCheck) {
  var span = closeCheck[0];
  if (span != null || undefined) {
    span.onclick = function () {
      modal.style.display = "none";
    };
  }
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
