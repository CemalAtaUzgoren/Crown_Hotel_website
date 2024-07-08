let cartobject = [
    {
        id:"std_d",
        img:"images/Double Standard Room.webp",
        name: "Double Standard Room",
        desc: "1 Double Bed",
        price: "",
        availability: sessionStorage.getItem("std_d"),
        TV: "20",
        clas:"stdd",
        checkin: sessionStorage.getItem("checkin"),
        checkout: sessionStorage.getItem("checkout"),
        qty: 0
    },

    {
        id:"sup_d",
        img:"images/Double Superior room.webp",
        name: "Double Superior Room",
        desc: "1 Double Bed",
        price: "",
        availability: sessionStorage.getItem("sup_d"),
        TV: "32",
        clas:"supd",
        checkin: sessionStorage.getItem("checkin"),
        checkout: sessionStorage.getItem("checkout"),
        qty: 0
    },
    {
        id:"std_t",
        img: "images/Twin standard room.webp",
        name: "Twin Standard Room",
        desc: "2 Single Beds",
        price: "",
        availability: sessionStorage.getItem("std_t"),
        TV: "20",
        clas:"stdt",
        checkin: sessionStorage.getItem("checkin"),
        checkout: sessionStorage.getItem("checkout"),
        qty: 0

    },
    {
        id:"sup_t",
        img: "images/Twin superior rooom.webp",
        name: "Twin Superior Room",
        desc: "2 Single Beds",
        price: "",
        availability: sessionStorage.getItem("sup_t"),
        TV: "32",
        clas:"supt",
        checkin: sessionStorage.getItem("checkin"),
        checkout: sessionStorage.getItem("checkout"),
        qty: 0
    }
];

localStorage.setItem("cartobject", JSON.stringify(cartobject));

//POST booking request
const bookingform = document.querySelector("#booking");
bookingform.addEventListener('submit', processSubmit);
let roomtype = ["std_d", "std_t", "sup_t", "sup_d"];
// let cartobject = JSON.parse(localStorage.getItem("cartobject"));

function processSubmit (e) {
    e.preventDefault();
    //add conditions
    if(cartobject.filter((x) => x.qty !== 0).length == "0") {
        booking()} else {
        if(window.confirm("Are you sure to start over? Rooms of your current selection will be removed.")) {
            removeall();
            booking();
        }}
    
    function booking () {
    const formdata = new FormData(bookingform);
    const data = Object.fromEntries(formdata);
    console.log(data);
    const checkindate = data.checkin;
    const checkoutdate = data.checkout;
    const roomreq = data.room;
    console.log(checkindate);

    const jsonbkdata = JSON.stringify(data);

    const fetchOptions = {
        method: 'POST',
        headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, // header configurations to indicate the data is in JSON format
        body: jsonbkdata //the message is sent in the request body
    }

    fetch('http://localhost:3000/booking', fetchOptions)
    .then(onResponse)
    .then(onTestReady);

    function onTestReady(text){
        console.log(text);
        const availability = JSON.parse(text).data;
        // console.log(availability);
        // cal total number of available rooms
        const roomqty = availability.map((x)=>x.count).reduce((x,y)=>Number(x)+Number(y),0);
        // console.log(roomqty);
        const count = JSON.parse(text).count;
        console.log(count);
        roomtype.forEach(element =>{
            if(availability.find((x) => x.r_class == element) == undefined) {
                sessionStorage.setItem(element,0);
        }});
        availability.forEach(element =>{     
            sessionStorage.setItem(element.r_class, element.count);
        });
        //local storage
        sessionStorage.setItem("checkin", checkindate);
        sessionStorage.setItem("checkout", checkoutdate);

        //show results
        const results = document.querySelector("#results");
        if(roomqty == 0) {
            results.innerHTML = `
            <h3> Searched Results:</h3>
            <span> Sorry, we are all booked out for your selected period. Please try different dates.`;

        } else if(roomqty == 1) {
            results.innerHTML = `
            <h3> Searched Results:</h3>
            <span> We only have <b>${roomqty}</b> room available for your selected period. Hurry up before it is gone!</span>
            <button><a href="Rooms.html" style="color: white">Check your options</a></button>`; 
        } else if(roomreq <= roomqty) {
            if(count == 1) {
                results.innerHTML = `
                <h3> Searched Results:</h3>
                <span> We only have <b>${count}</b> type of rooms available for your selected period. </span>
                <button><a href="Rooms.html" style="color: white">Check your options</a></button>`;
            } else {
            results.innerHTML = `
            <h3> Searched Results:</h3>
            <span> Good news! We have <b>${count}</b> types of rooms available for your selected period. Book with us now!</span>
            <button><a href="Rooms.html" style="color: white">Check your options</a></button>`;}
        } else {
            results.innerHTML = `
            <h3> Searched Results:</h3>
            <span> We only have <b>${roomqty}</b> rooms available for your selected period. Hurry up before they are all gone!</span>
            <button><a href="Rooms.html" style="color: white">Check your options</a></button>`; 
        }
    }
        
    //callback function to return the response
    function onResponse(response){
        return response.text();
    }
}

}


//weather API
function onSuccess(data){ 
    // console.log(data);
    // console.log(data.weather[0].description);
    // console.log(data.main.temp);
    const weatherdesc = document.querySelector("#desc");
    weatherdesc.append(data.weather[0].description);
    const temp = (data.main.temp-273.15).toFixed(0);
    const weathertemp = document.querySelector("#temp");
    weathertemp.append(temp);
    }

function onError(response){
    console.error(response);
    console.log('weather unavailable');
    }

fetch('https://api.openweathermap.org/data/2.5/weather?lat=52.6285694&lon=1.2923049&appid=0128e1fd68ed3e6afcd200cdfd4cd8dc')
    .then((response)=>response.json())
    .then((data)=>onSuccess(data))
    .catch(onError);


function removeall(){
    cartobject.forEach(element =>{element.qty = 0});
    localStorage.setItem("cartobject", JSON.stringify(cartobject));  
};
