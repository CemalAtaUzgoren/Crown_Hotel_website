let room = document.querySelector(".rooms") 

let roomdata = [
    {
        id:"std_d",
        img:"images/Double_Standard_Room.webp",
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
        img:"images/Double_Superior_room.webp",
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
        img: "images/Twin_standard_room.webp",
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
        img: "images/Twin_superior_rooom.webp",
        name: "Twin Superior Room",
        desc: "2 Single Beds",
        price: "",
        availability: sessionStorage.getItem("sup_t"),
        TV: "32",
        clas:"supt",
        checkin: sessionStorage.getItem("checkin"),
        checkout: sessionStorage.getItem("checkout"),
        qty: 0
    }]

    
let cartobject = [];

async function generaterooms () {
    
    //update price on roomdata
    await fetch('http://localhost:3000/rates')
    .then(onResponse)
    .then(onTestReady);
    
    function onTestReady(text){
        console.log(text);
        const rates = JSON.parse(text).data;
 
        roomdata.forEach(element =>{
            const searchrate = rates.find((x) => x.r_class === element.id);
            element.price = Number(searchrate.price);        
        })
        // console.log(roomdata);    
                              
    };
    
    function onResponse(response){
        return response.text();
    };

    roomdatafilter = roomdata.filter((x) => x.availability !== "0");

    return (room.innerHTML = roomdatafilter.map((x)=>{
        const {id, img, name, desc, price, availability, TV, clas} = x;
        return `
        <div  class=${id}>
            <img src="${img}" alt="">
            <p><br></p>
            <h3>${name}</h3>
            <p>${desc}</p>
            <p>Maximum Occupancy: 2 Adults</p>
            <p id="availability"><b>${availability}</b> Room(s) Available</p>
            <h4>Room Amenities <a><i onclick="toggleNav(${clas})" class="fa-solid fa-circle-chevron-right"></i></a></h4>
            <ul class="amenity" id=${clas}>
                <li>${TV}-inch TV</li>
                <li>Free Wifi</li>
                <li>Electric kettle</li>                          
                <li>Coffee/tea maker</li>
            </ul>
            <p><br></p>
            <p id="price">Price: <b>£${price}</b> per night</p>
            <label for="qty">Quantity:</label>                   
            <input type="number" id=${id} class="qty" name="qty" value="1" min="1" max=${availability} placeholder="1" required/>
            <button onclick="addtoCart(${id})">Reserve</button>
        </div>        
        `;
    }).join(""));
};


generaterooms();


function toggleNav (clas) {
    // console.log(clas);
    clas.classList.toggle("showNav");

}

function update(){
    //update cartqty
    const cart = document.querySelectorAll(".countqty");
    cart.forEach(element =>{
        element.innerHTML=cartobject.map((x) => x.qty).reduce((x, y) => x + y, 0);
    });

    // update roomdata qty
    cartobject.forEach(element =>{
        const searchrd = roomdata.find((x) => x.id === element.id);
        searchrd.qty = element.qty;
    });

    // cartdata = roomdata.filter((x) => x.qty !== 0);
    localStorage.setItem("cartobject", JSON.stringify(roomdata));      
}

function removeall(){
    cartobject.forEach(element =>{element.qty = 0});
    roomdata.forEach(element =>{element.qty = 0});
    update();
};


// calculate cart items
function addtoCart (id) {
    const searchcart = cartobject.find((x) => x.id === id.id);
    if(searchcart === undefined) {
        if(Number(id.value) > id.max) {
            window.alert("Your room quantity is over its availability. Please change.");
        }else{
            cartobject.push({
                id: id.id,
                qty: Number(id.value)})
        }}            
    else {
        if((Number(id.value)+searchcart.qty) > id.max) {
        window.alert("Your room quantity is over its availability. Please change.");
    } else{
        searchcart.qty += Number(id.value);
        }
    }
    
    update();
}


// update dates selection
const bkform = document.querySelector("#booking");
bkform.addEventListener('submit', (e)=> {
    e.preventDefault();
    //add conditions
    if(cartobject.filter((x) => x.qty !== 0).length == "0") {
        updatedates()} else {
        if(window.confirm("Are you sure to change dates? Rooms of your current selection will be removed.")) {
            removeall();
            updatedates();
        }}

    function updatedates() {
    const bkformData = new FormData(bkform);
    const bkdata = Object.fromEntries(bkformData);
    // console.log(bkdata);
    // update searched results
    roomdata.forEach(element => {
        // console.log(element);
        element.checkin = bkdata.checkin;
        element.checkout = bkdata.checkout;
    });
    const results = document.querySelector("#results");
    results.innerHTML = 
    ` <h3> Searched for Period: </h3>
      <p> Check-In Date: ${bkdata.checkin} Check-Out Date: ${bkdata.checkout} </p>  
    `;

    //post updatebooking to server
    const jsonbkdata = JSON.stringify(bkdata);
    const fetchOptions = {
        method: 'POST',
        headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, // header configurations to indicate the data is in JSON format
        body: jsonbkdata //the message is sent in the request body
    }
    // console.log(jsonbkdata);

    document.querySelector(".rooms").innerHTML="";
   
    fetch('http://localhost:3000/Availability', fetchOptions)
        .then(onResponse1)
        .then(onTestReady1)
        .then(generaterooms)

    function onTestReady1(text){
        // console.log(text);
        const availability = JSON.parse(text).data;
        // console.log(availability);
        // update roomdata availability
        
        roomdata.forEach(element =>{            
            const searchava = availability.find((x) => x.r_class === element.id);
            if (searchava === undefined) {
                element.availability = "0"
            } else {element.availability = searchava.count};        
        });
     }
    
    function onResponse1(response){
        return response.text();
    }}

})

const checkinbk = sessionStorage.getItem("checkin");
const checkoutbk = sessionStorage.getItem("checkout");
const results = document.querySelector("#results");
results.innerHTML = 
` <h3> Searched for Period: </h3>
  <p> Check-In Date: ${checkinbk} Check-Out Date: ${checkoutbk} </p>  
`;



// fetch from cart
cartobject = JSON.parse(localStorage.getItem("cartobject"));
// console.log(cartrobject);
update();









