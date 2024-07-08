
let paymentobject = JSON.parse(localStorage.getItem("paymentobject"));
let b_cost = localStorage.getItem("b_cost");


async function generatedetails () {

    await fetch('http://localhost:3000/reference')
    .then(onResponse)
    .then(onTestReady);
    
    function onTestReady(text){
        console.log(text);
        const reserve = JSON.parse(text).data[0];
        console.log(reserve);
        const b_ref = reserve.b_ref
        const c_no = reserve.c_no
        const c_name = reserve.c_name
        const c_email = reserve.c_email
        const results = document.querySelector(".reference");
        results.innerHTML = `
        <div class="total">
            <h2>Your Booking Reference: ${b_ref}</h2>
            <h2>Total amount paid: £${b_cost}</h2>
        </div>
        <div class="book">
            <div>
                <i class="fa-solid fa-user fa-xl user"></i>
                <p>Customer Number: ${c_no}</p>
                <p>Name: ${c_name} </p>
                <p>Email: ${c_email}</p>
            </div>
        </div>
        `;
    }
    
    function onResponse(response){
            return response.text();
    }

    let paymentobjectfilter = paymentobject.filter((x) => x.qty !== 0);
    let rooms = document.querySelector(".room")
    return (rooms.innerHTML = paymentobjectfilter.map((x)=>{
        const {id, name, checkin, checkout, price, qty} = x;
        return `
        <div  id=${id} class="col">
                <div>
                        <h4>${name}</h4>
                        <p id="checkin">Check-in Date: <b>${checkin}</b></p>
                        <p id="checkout">Check-out Date: <b>${checkout}</b></p>
                        <p id="price">Rate: <b>£${price}</b></p>
                        <p id="qty">Room Quantity: <b>${qty}</b></p>
                </div>
        </div>        
        `;
    }).join(""));
}

generatedetails ();
