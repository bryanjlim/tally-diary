// Firebase Setup
firebase.initializeApp({
    apiKey: "AIzaSyCsP4Vck2NE9jdJ0ydt0jplHMpCvahI5zc",
    authDomain: "project-lunar-91677.firebaseapp.com",
    projectId: "project-lunar-91677",
});
var firestore = firebase.firestore(); 
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

// On Firebase Authentication State Change
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        $(".submission").hide();
        window.location.href="authentication.html";
    } else {
        $(".submission").show();
        updatePostList();
    }
});

// On Timeline Entry Submit
$("#timelineentrysubmitbutton").click((e) => {
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


    if($("#newtimelineentryform").hasClass('was-validated')) {
        var newTimelineEntryTitle = $("#title").val(); 
        var newTimelineEntryTags = $("#tags").val(); 
        var newTimelineEntryDate = $("#date").val(); 
        var newTimelineEntryPost = $("#post").val(); 
        var newTimelineEntryLinks = $("#link").val(); 

        var radios = document.getElementsByName('mood');
        var selectedMood = "Regular";
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
                selectedMood = radios[i].value; 
                break;
            }
        }

        alert(firebase.auth().currentUser.uid);
        // Add a new document in user's collection
        firestore.collection("users")
                 .doc(firebase.auth().currentUser.uid)
                 .collection("diaryEntries")
                 .doc(newTimelineEntryDate)
        .set({
            title: newTimelineEntryTitle,
            date: newTimelineEntryDate,
            tags: newTimelineEntryTags,
            post: newTimelineEntryPost,
            mood: selectedMood,
            links: newTimelineEntryLinks
        })
        .then(() => {
            $("#newtimelineentryform")[0].reset(); 
            $("#newtimelineentryform.was-validated").removeClass("was-validated");
            $("#newtimelineentryform").prepend('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Entry Posted!</strong></div>');
        })
        .catch( (error) => {
            $("#deleteAPost").prepend('<div class="alert alert-danger alert-dismissible" id="duplicateerror"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Uh Oh! Something went wrong.</strong> Please refer to the console.</div>');
            console.log(error);
        });
    }
}); 

function updatePostList(){
    $('#timelineentrylist').empty();

    firestore.collection("users")
             .doc(firebase.auth().currentUser.uid)
             .collection("diaryEntries")
             .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var addToList = '<option value="' + doc.id + '">' + doc.data().title + " (" + doc.id + ") </option>"; 
                $('#timelineentrylist').append(addToList); 
        });
    });
}

// On Timeline Entry Delete
$("#timelineentrydeletebutton").click(function(e) {
    const deleteRef = $("#timelineentrylist").val(); 
    firestore.collection("users")
             .doc(firebase.auth().currentUser.uid)
             .collection("diaryEntries")
             .doc(deleteRef)
             .delete().then(() => {
                $("#deleteAPost").prepend('<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Entry Successfully Deleted</strong></div>');
                updatePostList();
            }).catch((error) => {
                $("#deleteAPost").prepend('<div class="alert alert-danger alert-dismissible" id="duplicateerror"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Uh Oh! Something went wrong.</strong> Please refer to the console.</div>');
                console.log(error);
            });
}); 
