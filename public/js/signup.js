// Firebase Setup
firebase.initializeApp({
    apiKey: "AIzaSyCsP4Vck2NE9jdJ0ydt0jplHMpCvahI5zc",
    authDomain: "project-lunar-91677.firebaseapp.com",
    projectId: "project-lunar-91677",
});
var firestore = firebase.firestore(); 
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

// On Timeline Entry Submit
$("#newaccountformsubmitbutton").click((e) => {
    e.preventDefault();

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');

    // Loop over them and prevent submission 
    var validation = Array.prototype.filter.call(forms, function(form) {
        if (form.checkValidity() === false) {
            e.preventDefault(); 
            e.stopPropagation();
        }
        form.classList.add('was-validated');
    });


    if($("#newaccountform").hasClass('was-validated')) {
        var newAccountFirstName = $("#firstName").val(); 
        var newAccountLastName = $("#lastName").val(); 
        var newAccountEmail = $("#email").val(); 
        var newAccountPassword = $("#password").val(); 
        var newAccountDateOfBirth = $("#dateOfBirth").val(); 

        firebase.auth().createUserWithEmailAndPassword(newAccountEmail, newAccountPassword).then(() => {
            firestore.collection("users")
            .doc(firebase.auth().currentUser.uid)
            .collection("userData")
            .doc("personalInformation")
                .set({
                    firstName: newAccountFirstName,
                    lastName: newAccountLastName,
                    dateOfBirth: newAccountDateOfBirth,
                }).then(() => {
                    window.location.href="post.html";
                })
                .catch( (error) => {
                    $("#newaccountform").prepend('<div class="alert alert-danger alert-dismissible" id="duplicateerror"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Uh Oh! Something went wrong.</strong> Please refer to the console.</div>');
                    console.log(error);
                });
        }).catch((error) => {
            console.log(error.code);
            console.log(error.message);
        });

    }
}); 