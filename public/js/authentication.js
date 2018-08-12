// Firebase Setup
firebase.initializeApp({
    apiKey: "AIzaSyCsP4Vck2NE9jdJ0ydt0jplHMpCvahI5zc",
    authDomain: "project-lunar-91677.firebaseapp.com",
    projectId: "project-lunar-91677",
});
var firestore = firebase.firestore(); 
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

// On Sign In
$("#signinbutton").click((e) => {
    e.preventDefault(); 
    const email = $("#usernameform").val();
    const password = $("#passwordform").val(); 
    const promise = firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
        window.location.href="post.html";
    }); 
    promise.catch(e => alert(e.message)); 
}); 

// On Sign Out
$("#signoutbutton").click((e) => {
    e.preventDefault(); 
    firebase.auth().signOut();
}); 

// On Firebase Authentication State Change
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        $("#sign-in-wrapper").hide();
        $("#signoutbutton").show();
    } else {
        $("#signoutbutton").hide();
        $("#sign-in-wrapper").show();
    }
});