var  db = firebase.firestore(app);
var storage = firebase.storage(app);
function signup(email,password){
    console.log("attempt to signup")

    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Signed in 
        var user = userCredential.user;
        console.log(user);
        db.collection("users").doc(user.uid).set({
            email: user.email,
        })
        .then(() => {
            console.log("Document successfully written!");
            login(email,password)
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage)
        // ..
    });
}
function login(email,password){
    console.log("attempt to login")
    firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in
    var user = userCredential.user;
    localStorage.setItem('uid', user.uid);
    window.location.href = '/gallery.html'; 
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
  });
}

$("#submitbutton").on("click",function(e){

    e.preventDefault()
    var email = $("input[name='email']")[0].value
    var password = $("input[name='password']")[0].value
    if($("#submitbutton").hasClass("login")) login(email,password)
    else signup(email,password)
});

$("#signupButton").on("click",function(e){
    e.preventDefault();
    if($("#signupButton").hasClass("loginbut")){
        $(".action")[0].innerText="Login"
        $(".action").removeClass("signupaction")
        $(".action").addClass("loginaction")
        $(".signup_link p")[0].innerText = "Not a Member?"
        $(".signup_link a")[0].innerText = "Signup"
        $(".signup_link a").removeClass("loginbut")
        $(".signup_link a").addClass("signupbut")
        $("#submitbutton").removeClass("signup");
        $("#submitbutton").addClass("login");
        $("#submitbutton")[0].value="Login"

    }
    else{
        $(".action")[0].innerText="Sign up"
        $(".action").addClass("signupaction")
        $(".action").removeClass("loginaction")
        $(".signup_link p")[0].innerText = "Already a member?"
        $(".signup_link a")[0].innerText = "Login"
        $(".signup_link a").removeClass("signupbut")
        $(".signup_link a").addClass("loginbut")
        $("#submitbutton").addClass("signup");
        $("#submitbutton").removeClass("login");
        $("#submitbutton")[0].value="Sign Up"

    }
});