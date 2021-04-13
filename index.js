const express = require('express');
const cors = require('cors');
const fs = require ('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const port = process.env.PORT || 5000;
require('dotenv').config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x4zzn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload());
// app.use(express.static('doctors'));


app.get('/', (req, res)=>{
    res.send('403 - Direct Access Denied')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentsCollection = client.db(`${process.env.DB_NAME}`).collection("appointments");
    const doctorCollection = client.db(`${process.env.DB_NAME}`).collection("doctors");


    // perform actions on the collection object
    
    app.post('/addAppointment', (req, res) => {
       const appointment = req.body;
       appointmentsCollection.insertOne(appointment)
       .then(result=> {
           res.send(result.insertedCount > 0)
       })
    });

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        
        doctorCollection.find({email: email})
        .toArray((err, doctors) => {
            const filter = {date: date.date};
            if(doctors.length === 0){
                filter.email = email;
            }
            
            appointmentsCollection.find(filter)
            .toArray((err, documents) => {
                // console.log(email, date.date, doctors, documents);
            res.send(documents);
            })

        })
    });

    app.get('/appointments', (req, res) => {
        appointmentsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })

    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
           
            var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
    
            doctorCollection.insertOne({ name, email, image })
            .then(result => {
                res.send(result.insertedCount > 0);
                })
            })
    
    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    });


    })

   

  
  


app.listen(port)