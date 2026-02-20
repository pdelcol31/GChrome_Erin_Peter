// let data = {
//     "event": "onStop/onStart",
//     "prefs": {
//         "locationId": '123',
//         "startDate": '2026-02-20',
//         "endDate": '2026-02-20'
//     }
// }

chrome.runtime.onMessage.addListener(data => {
    alert("background");
    switch(data.event){
        case 'onstop':
            console.log("On stop");
            break;
        case 'onstart':
            console.log("On start");
            break;
        default:
            break;
    };
})