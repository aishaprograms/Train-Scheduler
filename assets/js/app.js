// Reference to firebase database
var database = firebase.database();
//Current time in military time
var currentTime;

updateTime();

setInterval(updateTime, 1000);
$('#add-train-button').on('click', function() {
    var name = $("#add-train-name").val().trim();
    var destination = $("#add-destination").val().trim();
    var trainTime = $("#add-train-time").val().trim();
    var frequency = parseInt($("#add-frequency").val().trim());
    //push the values to the database
    database.ref().push({
        name: name,
        destination: destination,
        trainTime: trainTime,
        frequency: frequency,
        timeAdded: firebase.database.ServerValue.TIMESTAMP
    });
    // Don't refresh the page!
    return false;
});

updateSchedule();

//Function definitions
function updateTime() {
    currentTime = moment(new Date());
    currentTime = moment().format('HH:mm:ss');
    $('#time-update').text(currentTime);
}

function updateSchedule() {
    database.ref().on("child_added", function(childSnapshot) {
        // Train time converted
        var trainTimeConverted = moment(childSnapshot.val().trainTime, "HH:mm");
        //Checks to see train time is before current time
        var trainTimeBeforeCurrent = trainTimeConverted.isBefore(currentTime);
        // Difference between the times
        var diffTime = moment().diff(moment(trainTimeConverted), "minutes");
        // Time apart (remainder)
        var tRemainder = diffTime % childSnapshot.val().frequency;
        // Minute Until Train
        var minutesAway = childSnapshot.val().frequency - tRemainder;
        // Next Train
        var nextArrival = moment().add(minutesAway, "minutes");
        var nextArrivalConverted = moment(nextArrival).format("HH:mm");
        //Add train times to schedule
        var row = $('<tr>');
        $(row).append($('<td>').text(childSnapshot.val().name));
        $(row).append($('<td>').text(childSnapshot.val().destination));
        $(row).append($('<td>').text(childSnapshot.val().frequency));
        $(row).append($('<td>').text(nextArrivalConverted));
        $(row).append($('<td>').text(minutesAway));
        $('#schedule-tbody').append(row);
        // Handle the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });
}
