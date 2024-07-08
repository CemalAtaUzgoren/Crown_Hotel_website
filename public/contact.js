//POST contact form
const form = document.querySelector("#form");
form.addEventListener('submit', processSubmit);

function processSubmit (e) {
    e.preventDefault();

    const formdata = new FormData(form);
    const data = Object.fromEntries(formdata);
    console.log(data);

    const jsondata = JSON.stringify(data);

    const fetchOptions = {
        method: 'POST',
        headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: jsondata
    }

    fetch('http://localhost:3000/contact', fetchOptions)
    .then(onResponse)
    .then(onTestReady);

    function onTestReady(text){
        console.log(text);
        document.querySelector("#response").innerHTML = text;                           
        };
            
    //callback function to return the response
    function onResponse(response){
        return response.text();
    }
}

