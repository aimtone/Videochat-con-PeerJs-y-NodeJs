// HTML Escape function
    var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;"
    };

    function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function(s) {
        return entityMap[s];
    });
    }

// Perfect Scrollbar loader
    new PerfectScrollbar("#message-box");
    new PerfectScrollbar("#user-section");

// Ion Sounds preloader
    ion.sound({
    sounds: [
        {
        name: "iPhoneRingtone",
        loop: true
        },
        {
        name: "marimba",
        loop: true
        },
        {
        name: "ping"
        },
        {
        name: "repique",
        loop: true
        }
    ],
    volume: 0.5,
    path: "sounds/",
    preload: true
    });

// Local webcam request
    function requestLocalVideo(callbacks) {
    navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
    navigator.getUserMedia(
        {
        audio: true,
        video: true
        },
        callbacks.success,
        callbacks.error
    );
    }

// Toggle Info Section
    $("#toggleInfo").click(function() {
    if (toggle) {
        $("#camera-section").animate(
        {
            left: "-=350",
            width: "toggle"
        },
        100,
        function() {
            toggle = false;
            $("#chatbox-section").removeClass("col-lg-9");
            $("#chatbox-section").addClass("col-lg-6");
        }
        );
    } else {
        $("#camera-section").animate(
        {
            left: "+=350",
            width: "toggle"
        },
        100,
        function() {
            toggle = true;
            $("#chatbox-section").removeClass("col-lg-6");
            $("#chatbox-section").addClass("col-lg-9");
        }
        );
    }
    });

// Blob to file Function
    function blobToFile(theBlob, fileName) {
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        theBlob.lastModifiedDate = new Date();
        theBlob.name = fileName;
        return theBlob;
    }
// Funcion nula
    function doNothing(e) {
        e.preventDefault();
        e.stopPropagation();
    }