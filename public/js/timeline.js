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
        $("#timeline").hide();
        window.location.href="authentication.html";
    } else {
        repopulateTimeline();
        $("#timeline").show();
    }
});

const moodsToShow = ["Sad", "Regular", "Happy"]; 

function repopulateTimeline(){
    let timelineList = []; 

    firestore.collection("users")
             .doc(firebase.auth().currentUser.uid)
             .collection("userData")
             .doc("personalInformation")
             .get()
             .then((personalInformation) => {
                 const dateOfBirth = personalInformation.data().dateOfBirth;
                 firestore.collection("users")
                     .doc(firebase.auth().currentUser.uid)
                     .collection("diaryEntries")
                     .get()
                     .then((querySnapshot) => {
                         querySnapshot.forEach((doc) => {
                             console.log(`${doc.id} => ${doc.data()}`);
                             const date = doc.data().date; 
                             const daysAlive = Math.round((new Date(date) - new Date(dateOfBirth)) / (1000 * 60 * 60 * 24)); 
                             const title = doc.data().title ? doc.data().title + " (Day " + daysAlive + ")" : "Day " + daysAlive;  // Show days alive in title
                             const mood = doc.data().mood;
                             const post = doc.data().post; 
                             const tags = doc.data().tags; 
                             const link = doc.data().link; 
                             timelineList.push(new TimelineEntryObject(title, date, post, mood, tags, link));  
                         });
 
                         timelineList.sort(function(a,b){
                             const aDateArray = a.date.split("-"); 
                             const aYear = aDateArray[0];
                             const aMonth = aDateArray[1];
                             const aDate = aDateArray[2]; 
 
                             const bDateArray = b.date.split("-"); 
                             const bYear = bDateArray[0];
                             const bMonth = bDateArray[1];
                             const bDate = bDateArray[2]; 
                             return new Date(bYear,bMonth,bDate) - new Date(aYear,aMonth,aDate);
                         }); 
 
                         $('#timelineWrapper').empty(); 
 
                         for(let i=0; i < timelineList.length; i++) { 
                             if(moodsToShow.includes(timelineList[i].mood)) {
                                 let timelinepostmeta = '<p class="timeline-post-meta">' + timelineList[i].date + '</p>';
                                 if(timelineList[i].tags != "" && timelineList[i].tags != undefined){
                                     timelinepostmeta = '<p class="timeline-post-meta">' + timelineList[i].date + '</p>';
                                 } 
                                 let postLines = timelineList[i].post.split(/\r\n|\r|\n/g); 
                                 let addpost = ""; 
                                 for(let i = 0; i < postLines.length; i++){
                                     addpost += '<p>'+postLines[i]+'</p>'; 
                                 }
                                 let addlink = ""; 
                                 if(timelineList[i].link != "" && timelineList[i].link != undefined){
                                     addlink = '<b>Link: </b><a href="'+timelineList[i].link+'">'+timelineList[i].link+'</a>'; 
                                 }
                                 $('#timelineWrapper').append(
                                     '<div class="timeline-post-wrapper">' + 
                                         '<div class="timeline-post">' + 
                                             '<h2 class="timeline-post-title">' + timelineList[i].title + '</h2>' + 
                                             timelinepostmeta +
                                             '<strong class="d-inline-block mb-2 text-primary"> Mood: '+timelineList[i].mood+"</strong> "+  
                                             "<p class='tags'><strong class='tags'>Tags: "+timelineList[i].tags+"</strong></p>" + 
                                             addpost +
                                             addlink +
                                         '</div>' +
                                     '</div>'
                                 )
                             } 
                         }
                     });
             });
 
    // Refine what timeline entries are shown

    $("#sad").click(function(e) {
        e.preventDefault(); 
        if($("#sad").hasClass("disabled")) { 
            $("#sad").removeClass("disabled"); 
            moodsToShow.push("Sad");  
            repopulateTimeline();
        } 
        else {
            $("#sad").addClass("disabled"); 
            for(let i = 0; i < moodsToShow.length; i++) {
                if(moodsToShow[i] == "Sad"){
                    if (i !== -1) {
                        moodsToShow.splice(i, 1);
                    }
                }
            }
            repopulateTimeline();
        }
    }); 
    $("#reg").click(function(e) {
        e.preventDefault(); 
        if($("#reg").hasClass("disabled")) {
            $("#reg").removeClass("disabled"); 
            moodsToShow.push("Regular"); 
            repopulateTimeline(); 
        } else {
            $("#reg").addClass("disabled"); 
            for(let i = 0; i < moodsToShow.length; i++){
                if(moodsToShow[i] == "Regular"){
                    if (i !== -1) {
                        moodsToShow.splice(i, 1);
                    }
                }
            }
            repopulateTimeline();
        }
    }); 
    $("#hap").click(function(e) {
        e.preventDefault(); 
        if($("#hap").hasClass("disabled")){
            $("#hap").removeClass("disabled"); 
            moodsToShow.push("Happy");  
            repopulateTimeline();
        } else {
            $("#hap").addClass("disabled"); 
            for(let i = 0; i < moodsToShow.length; i++){
                if(moodsToShow[i] == "Happy"){
                    if (i !== -1) {
                        moodsToShow.splice(i, 1);
                    }
                }
            }
            repopulateTimeline();
        }
    });
} 