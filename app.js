const env = process.env.NODE_EDV || 'development';

//import database configurations
const config = require('./config.js')[env];

const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;
app.use(cors());
//load PG library
const pg = require('pg');
const pool = new pg.Pool(config);

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.use(bodyParser.urlencoded({extended: false}));
const crypto = require('crypto');

app.set('view engine', 'ejs');

app.use(express.static('public'));


app.get('/', (req,res) => {
    res.sendFile('Index.html', (err) => {
        if (err) {
            console.log(err);
        }
    })
});


app.listen(port, () => {
    console.log(`My first app listening on port ${port}!`)
})

//get request by index.html page
app.post('/booking', jsonParser, async(req,res) => {
    const body = req.body;
    console.log(body);
    const checkin = req.body.checkin;
    const checkout = req.body.checkout;
    
    try{
        let results;
        // const pool = new pg.Pool(config);
        const client = await pool.connect();

        const sql = 'SELECT room.r_class, COUNT(room.r_no) FROM hotelbooking.room WHERE room.r_no NOT IN ( Select roombooking.r_no FROM hotelbooking.roombooking WHERE checkin >= $1 AND checkout <= $2) GROUP BY room.r_class;'
        await client.query(sql, [checkin, checkout], (err, results) => {
            if (err) {
                console.log(err.stack)
                errors = err.stack.split(" at ");
                res.json({
                    message: 'Sorry something went wrong. The data has not been processed' + errors[0]
                });
            } else {
                client.release();
                console.log(results);
                data = results.rows;
                count = results.rows.length;
                res.json({
                    data, count
                    
                });
            }
        });
    }
    catch(e){
        console.log(e);
    }
});

//POST route for availability
app.post('/Availability', jsonParser, async(req,res) => {
    const body = req.body;
    // console.log(body);
    const checkin = body.checkin;
    const checkout = body.checkout;
    
    try{
        let results;
        const pool = new pg.Pool(config);
        const client = await pool.connect();

        const sql = 'SELECT room.r_class, COUNT(room.r_no) FROM hotelbooking.room WHERE room.r_no NOT IN ( Select roombooking.r_no FROM hotelbooking.roombooking WHERE checkin >= $1 AND checkout <= $2) GROUP BY room.r_class;'
        await client.query(sql, [checkin, checkout], (err, results) => {
            if (err) {
                console.log(err.stack)
                errors = err.stack.split(" at ");
                res.json({
                    message: 'Sorry something went wrong. The data has not been processed' + errors[0]
                });
            } else {
                client.release();
                console.log(results);
                data = results.rows;
                count = results.rows.length;
                res.json({
                    data
                });
            }
        });
    }
    catch(e){
        console.log(e);
    }
});

//POST request by contact.html page
app.post('/contact', jsonParser, (req,res) => {
    const body = req.body;
    const name = body.name;
    res.send(`Hi ${name}, thank you for contacting us. We will reply to your message in 3 days.`)
});

//GET route for rates
app.get('/rates', async(req,res) => {
    // console.log("ssdf");
    try{
        let results;
        const pool = new pg.Pool(config);
        const client = await pool.connect();
        const sql = 'Select * from hotelbooking.rates;'
        await client.query(sql, (err, results) => {
            if (err) {
                console.log(err.stack)
                errors = err.stack.split(" at ");
                res.json({
                    message: 'Sorry something went wrong. The data has not been processed' + errors[0]
                });
            } else {
                client.release();
                console.log(results);
                data = results.rows;
                res.json({
                    data
                });
            }
        });
    }
    catch(e){
        console.log(e);
    }
});

//login

// var password = 'housekeeper'
// var hash = crypto. createHash('md5').update(password).digest('hex');
// console.log('MD5: ',hash); 
// reception, 11000
// housekeeper, 12000
app.post('/loginhk', async function (req, res) {
  const email = req.body.email;
  const ref = req.body.ref;

  var hashed = crypto. createHash('md5').update(email).digest('hex');
  var sql = "SELECT c_email, b_ref FROM hotelbooking.customer, hotelbooking.booking WHERE customer.c_no = booking.c_no AND c_email = $1 AND b_ref = $2";
  
  await pool.query(sql, [hashed, ref], function (err, result){
    console.log(result);
    if (err) {
      console.log(err);}
    if (result.rowCount>0) res.sendFile('/public/Housekeeping.html',{ root: __dirname });
    else res.send('Invalid login. Please try again.');
  })
  
});

app.post('/loginrep', async function (req, res) {
  const email = req.body.email;
  const ref = req.body.ref;

  var hashed = crypto. createHash('md5').update(email).digest('hex');
  var sql = "SELECT c_email, b_ref FROM hotelbooking.customer, hotelbooking.booking WHERE customer.c_no = booking.c_no AND c_email = $1 AND b_ref = $2";
  
  await pool.query(sql, [hashed, ref], function (err, result){
    console.log(result);
    if (err) {
      console.log(err);}
    if (result.rowCount>0) res.sendFile('/public/Reception.html',{ root: __dirname });
    else res.send('Invalid login. Please try again.');
  })
  
});


//fetch booking reference to confirmation page
app.get('/reference', async (req,res) => {
	try{
  	let results;
    const client = await pool.connect();
		const sql = 'SELECT b_ref, customer.c_no, b_cost, c_name, c_email FROM hotelbooking.customer, hotelbooking.booking WHERE customer.c_no = booking.c_no AND b_ref = (SELECT max(b_ref) FROM hotelbooking.booking); '
		await client.query(sql, (err, results) => {
		  if (err) {
		    console.log(err.stack)
			errors = err.stack.split(" at ");
		    res.json({ message:'Sorry something went wrong! The data has not been processed ' + errors[0]});
		  } else {
			client.release();
		  //  console.log(results); //
	   		data = results.rows;
	   		// count = results.rows.length;
            res.json({ data });
		  }
		});

	}catch(e){
		console.log(e);
	}	
});

// //For customer booking login
// app.post('/logincus', async function (req, res) {
//   const email = req.body.email;
//   const ref = req.body.ref;
//   console.log(email);

//   var sql = "SELECT b_ref, customer.c_no, b_cost, c_name, c_email FROM hotelbooking.customer, hotelbooking.booking WHERE customer.c_no = booking.c_no AND c_email = $1 AND b_ref = $2";
  
//   await pool.query(sql, [email, ref], function (err, result){
//     console.log(result);
//     if (err) {
//       console.log(err);}
//     if (result.rowCount>0) res.render('Details',{ data: results.rows });
//     else res.send('Invalid login. Please try again.');
//   })
  
// });


//below from Ata
app.post('/payment_card.html', async (req,res)=>{
  console.log(req.body);
    //Inserting customer info to the DB
        try{
        const cardNum = req.body.cardNumber;
        const month = req.body.Month;
        const year = req.body.Year;
        const cvv = req.body.cvv;
        const cardType = req.body.cardType;
        const name = req.body.name;
        const address = req.body.address;
        const email = req.body.email;
  
        
        const client = await pool.connect();
        const result1 =await client.query(`SELECT max(c_no) FROM hotelbooking.customer `);
        const c_no = result1.rows[0].max === null ? 10000 : result1.rows[0].max + 1;
  
        const query = `INSERT INTO hotelbooking.customer VALUES ($1, $2, $3, $4, $5, $6, $7);`;
        await client.query(query , [c_no, name, email, address, cardType, `${month}/${year}` , cardNum]);
  
        const result2 =await client.query(`SELECT max(b_ref) FROM hotelbooking.booking `);
        const b_ref = result2.rows[0].max === null ? 10234 : result2.rows[0].max + 1;
       
        await client.query(`insert into hotelbooking.booking values ($1, $2, 0, 0, '');`,[b_ref,c_no]);
        await client.query(`COMMIT`);
       
    }catch(error){
        console.log(error);
    }
     //client.end();
     res.status(200).send(`<script> window.location.href='/Confirmation.html';</script>`);
  });
  
  
app.post('/booking_card.html', jsonParser, async (req,res)=>{
  
  const client = await pool.connect();
  const availableRoomsFunc=async function(type){
    return new Promise(async (resolve, reject) => {
      try{
        const date_in = req.body[0].checkin;
        const date_out = req.body[0].checkout;  
        const availableroom =await client.query('SELECT r_no FROM hotelbooking.room WHERE r_class = $1 AND r_no NOT IN (Select roombooking.r_no FROM hotelbooking.roombooking WHERE checkin >= $2 AND checkout <= $3);',[type, date_in, date_out]);           
        console.log(availableroom.rows);
        var availabler_no = [];

        for(let i=0;i<availableroom.rows.length;i++){
          availabler_no[i]=availableroom.rows[i].r_no;
        }
        console.log('available room numbers of '+type+' '+availabler_no)
        
        resolve(availabler_no);
      }catch(error){
        console.error(error);
        reject(error);
      }
    });
  }

  //For Twin Superior Room


    try{
      
      const date_in1 = new Date (req.body[0].checkin);
      const date_out1 =new Date(req.body[0].checkout);
      const quantity1 = req.body[0].qty;
      const type1= req.body[0].id;
      const price1 = ((req.body[0].price)*((date_out1-date_in1)/(1000 * 60 * 60 * 24)))*quantity1;
      console.log(  price1)
      await new Promise(resolve => setTimeout(resolve, 1000));
        const maxBref =await client.query(`SELECT max(b_ref) FROM hotelbooking.booking`)
        const b_ref2 =  maxBref.rows[0].max === null ? 10234 : maxBref.rows[0].max ;
        console.log(b_ref2)

        if(quantity1!==0){
          await client.query(`update hotelbooking.booking set b_cost=b_cost+ $1  where b_ref= $2;`,[ price1,b_ref2]);
          // await client.query(`update hotelbooking.booking set b_outstanding=b_outstanding+$1  where b_ref= $2;`,[ price1,b_ref2]);

        }
        const roomNumber = await availableRoomsFunc(type1);
        console.log(roomNumber);
        const availabler_no = roomNumber
        

        for(let i=0;i<quantity1;i++){
            await client.query(`insert into hotelbooking.roombooking values ($1, $2, $3, $4);`,[availabler_no[i] , b_ref2 , date_in1 , date_out1])
        }

    }catch(error){
      console.log(error)
    }
  //For Twin Standard Room
    try{
      const date_in2 =new Date(req.body[1].checkin);
      const date_out2 =new Date (req.body[1].checkout);
      const quantity2 = req.body[1].qty;
      const type2= req.body[1].id;
      const price2 = ((req.body[1].price)*((date_out2-date_in2)/(1000 * 60 * 60 * 24)))*quantity2;

      await new Promise(resolve => setTimeout(resolve, 1000));
        const maxBref =await client.query(`SELECT max(b_ref) FROM hotelbooking.booking`)
        const b_ref2 =  maxBref.rows[0].max === null ? 10234 : maxBref.rows[0].max ;
        console.log(b_ref2)
        if(quantity2!==0){
          
          await client.query(`update hotelbooking.booking set b_cost = b_cost + $1 where b_ref =  $2;`,[ price2,b_ref2]);
        }
        const roomNumber = await availableRoomsFunc(type2);

        const availabler_no = roomNumber

        for(let i=0;i<quantity2;i++){
          await client.query(`insert into hotelbooking.roombooking values ($1, $2, $3, $4);`,[availabler_no[i] , b_ref2 , date_in2 , date_out2])
        }
    }catch(error){
      console.log('You havent booked this room')
    }
  //For Double Standart Room
    try{
      const date_in3 =new Date (req.body[2].checkin);
      const date_out3 =new Date (req.body[2].checkout);
      const quantity3 = req.body[2].qty;
      const type3= req.body[2].id;
      const price3 = ((req.body[2].price)*((date_out3-date_in3)/(1000 * 60 * 60 * 24)))*quantity3;

      await new Promise(resolve => setTimeout(resolve, 1000));
        const maxBref =await client.query(`SELECT max(b_ref) FROM hotelbooking.booking`)
        const b_ref2 =  maxBref.rows[0].max === null ? 10234 : maxBref.rows[0].max ;
        console.log(b_ref2)
        
        if(quantity3!==0){
          
          await client.query(`update hotelbooking.booking set b_cost=b_cost + $1 where b_ref =  $2;`,[ price3,b_ref2]);
        }
        const roomNumber = await availableRoomsFunc(type3);

        const availabler_no = roomNumber

        for(let i=0;i<quantity3;i++){
          await client.query(`insert into hotelbooking.roombooking values ($1, $2, $3, $4);`,[availabler_no[i] , b_ref2 , date_in3 , date_out3])
        }

    }catch(error){
      console.log('You havent booked this room')
    }
  //For Double Superior Room
    try{
      
      const date_in4 = new Date(req.body[3].checkin);
      const date_out4 =new Date(req.body[3].checkout);
      const quantity4 = req.body[3].qty;
      const type4= req.body[3].id;
      const price4 =((req.body[3].price)*((date_out4-date_in4)/(1000 * 60 * 60 * 24)))*quantity4;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
        const maxBref =await client.query(`SELECT max(b_ref) FROM hotelbooking.booking`)
        const b_ref2 =  maxBref.rows[0].max === null ? 10234 : maxBref.rows[0].max ;
        console.log(b_ref2)

        console.log( typeof price4)
        if(quantity4!==0){
          
          await client.query(`update hotelbooking.booking set b_cost=b_cost + $1 where b_ref =  $2;`,[ price4,b_ref2]);
        }
        const roomNumber = await availableRoomsFunc(type4);

        const availabler_no = roomNumber

        for(let i=0;i<quantity4;i++){
          await client.query(`insert into hotelbooking.roombooking values ($1, $2, $3, $4);`,[availabler_no[i] , b_ref2 , date_in4 , date_out4])
        }
    }catch(error){
      console.log('You havent booked this room')
    }
      

});

//below from Stephen

// Update the routing of the room status
app.post('/updateRoomStatus', (req, res) => {
  const roomNumber = req.body.roomNumber;
  const status = req.body.status;
  console.log(status);
  console.log(roomNumber);

  const newStatus = status === ('A' || 'C')? 'X' : 'A';

  const postgresQuery = 'UPDATE hotelbooking.room SET r_status = $1 WHERE r_no = $2';
  pool.query(postgresQuery, [newStatus, roomNumber], (err, results) => {
      if (err) {
          console.error('Error updating room status:', err.stack);
          res.status(500).send('Error updating room status');
          return;
      }

      console.log(`Room ${roomNumber} status updated to '${newStatus}'`);
      res.send('Room status updated successfully');
  });
});

// Get a route to the room status
app.get('/getRoomStatus', (req, res) => {
    // Query the database to obtain the status of all rooms
    const query = 'SELECT r_no, r_status FROM hotelbooking.room';

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error getting room status:', err.stack);
            res.status(500).json({});
            return;
        }

        const roomStatus = {};
        results.rows.forEach(row => {
            roomStatus[row.r_no] = row.r_status;
        });

        res.json(roomStatus);
    });
});


app.get('/getReceptionList',async (req,res) => { 

  const {key} = req.query;
  console.log(key)
  const client = await pool.connect();
  // console.log(client)
  const queryString = key?`where (c.c_name = $1 or b.b_ref::text = $1 or c.c_email = $1)`:'where c.c_name != $1';
  const sqlString = `select * from hotelbooking.roombooking r 
                      join hotelbooking.booking b on r.b_ref = b.b_ref  
                      join hotelbooking.customer c on b.c_no =c.c_no 
                      join hotelbooking.room r2 on r2.r_no =r.r_no ${queryString}`;
  client.query(sqlString,[key],(err,data) => { 
 
    if(err){
        return console.error(err.message);
    }else{
        return res.send({code:200,data:data.rows})
    }
  })
 })

 app.get('/checkIn',async (req,res) => { 
  const client = await pool.connect();
  const {r_no} = req.query;
  console.log(r_no)
  const status ='C'
    const sqlString = "update hotelbooking.room set r_status = $2 where r_no = $1";
    client.query(sqlString, [r_no,status],(err,data) => { 
        if(err){
            console.error(err.message);
            return res.send({code:200,data:false})
            
        }else{
            return res.send({code:200,data:true})
        }

    })
  }) 
  app.get('/checkOut',async(req,res) => { 
    const client = await pool.connect();
    const {r_no} = req.query;
    const status ='X'
    const sqlString = "update hotelbooking.room set r_status = $2 where r_no = $1";
    client.query(sqlString, [r_no,status],(err,data) => { 
        if(err){
            console.error(err.message);
            return res.send({code:200,data:false})
            
        }else{
            return res.send({code:200,data:true})
        }

    })
  })