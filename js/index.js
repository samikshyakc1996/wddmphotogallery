

var uid;
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
   
      getImages();
      // ...
    } else {
      // User is signed out
      window.location.href = './login.html'; 

      // ...
    }
  });
  var  db = firebase.firestore(app);
  var storage = firebase.storage(app);

function submitImage(){
    var file=document.getElementById("files").files[0];
    var storageref=storage.ref();

    var name=document.getElementById("fileName").value ? document.getElementById("fileName").value : file.name.replace(/\.[^/.]+$/, "")
    var uploadTask=storageref.child("images").child(name).put(file);
    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
    }, 
    (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
        case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
        case 'storage/canceled':
            // User canceled the upload
            break;

        // ...

        case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
    }, 
    () => {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log('File available at', downloadURL);
        var userid = firebase.auth().currentUser.uid;
        db.collection("users").doc(userid).collection("images").doc().set({
            imageName: name,
            imageUrl: downloadURL
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

$(".submitimage").on("click",function(e){
    submitImage();

});

function getImages(){
    var uid =firebase.auth().currentUser.uid;
    var userRef = db.collection("users").doc(uid);
    var index = 0;
    userRef.collection("images").get()
    .then(querySnapshot => {
        querySnapshot.forEach(doc => {
            index++;
            console.log(index,doc.id, " => ", doc.data());
            createImageList(doc.data().imageUrl,doc.data().imageName, index);
        });
    });
}

function createImageList(url, name, index){   
    var x='<div class="box"><div class="boxInner"><div class="titleBox">'+name+'</div><img src="'+url+'" id="img'+index+'"/></div></div>';
    $(".wrap").append(x);
    $(".wrap")[0].style.background = "linear-gradient(120deg,#2980b9, #8e44ad)";
    $("#img"+index).on("click",function(e){
        enlargeImg(url,name);
    });
}
var modal = document.getElementById("myModal1");
var modalImg = document.getElementById("img001");
var captionText = document.getElementById("captiontext");
function enlargeImg(url,name){ 
    console.log("------+++++--------"+url);
    modal.style.display = "block";
    modalImg.src = url;
    captionText.innerHTML = name;  
}
function createImageList(url, name){
    var x='<div class="box"><div class="boxInner"><img src="'+url+'"/><div class="titleBox"><b>'+name+'</b></div></div></div>';
    $(".wrap").append(x)

}

var span = document.getElementsByClassName("closebut")[0];
span.onclick = function() {
  modal.style.display = "none";
};

function logout(){
    firebase.auth().signOut().then(() => {
        // Sign-out successful.

    }).catch((error) => {
        // An error happened.
        console.log(error);
      });
}
$(".logout").on("click", function(e){
    e.preventDefault();
    logout();
});