// Changecolor.js



function queryParse(query){
			let queryText = "";
			for(let key in query){	
				queryText += `${key}=${query[key]}&`;
			}
			return queryText.slice(0,-1);
		}
		

function Changecolor(e) {
	var id = e.target.id;
	
	
	var a =  document.getElementById(id);
	//a.setAttribute("class","N red");
	var b = a.getAttribute("class");
	var status = "A";
    
    if (b == "N green") {
		status = "A";
        a.setAttribute("class","N red");   
    }else {
        status = "X";
        a.setAttribute("class","N green");   
	}

			
	var c = {
		status:status,
		roomNumber:id
	}
    

    // Send an AJAX request to update the room status
    fetch('/updateRoomStatus', {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: queryParse(c)
    })
        .then(response => response.text())
        .then(() => {
            // Update page room status
			
		
		
            
        })
        .catch(error => console.error('Error:', error));
    
    location.reload();
}

function updateRoomStatus() {
    // Send an AJAX request to get the room status
    fetch('/getRoomStatus')
        .then(response => response.json())
        .then(roomStatus => {
            Object.keys(roomStatus).forEach(roomNumber => {
                const roomDiv = document.getElementById(roomNumber);

                if (roomDiv) {
                    // Set the background color according to the state
                    if (roomStatus[roomNumber] === 'X') {
                        roomDiv.classList.remove('red');
                        roomDiv.classList.add('green');
                    } else {
                        roomDiv.classList.remove('green');
                        roomDiv.classList.add('red');
                    }
                }
            });
        })
        .catch(error => console.error('Error:', error));
}
