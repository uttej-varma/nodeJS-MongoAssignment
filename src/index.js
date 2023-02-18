const express = require('express')
const app = express()
// const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector');



//recovered count
app.get("/totalRecovered",async (req,res)=>{
    const data=await connection.find();
    let recoveredcount=0;
    data.map((value)=>{
        recoveredcount+=value.recovered
    })
    
    res.status(200).json({
        _id:"total",
        recovered:recoveredcount
    })
})
//active count
app.get("/totalActive",async (req,res)=>{
    const data=await connection.find();
    let count=0;
    data.map((value)=>{
        count+=value.infected
    })
    
    res.status(200).json({
        _id:"total",
        active:count
    })
})
//death count
app.get("/totalDeath",async (req,res)=>{
    const data=await connection.find();
    let count=0;
    data.map((value)=>{
        count+=value.death
    })
    
    res.status(200).json({
        _id:"total",
        death:count
    })
})
//getting the hotspot states
app.get("/hotspotStates",async (req,res)=>{
    const data=await connection.aggregate([
        {
            $addFields: {
              rate: {
                $round: [
                  {
                    $subtract: [1, { $divide: ["$recovered","$infected" ]}]
                  },5
                ]
              }
            }
        },
          {
            $match: {
              rate: { $gt: 0.1 }
            }
          },
          {
            $project: {
              _id: 0,
              state: 1,
              rate: 1
            }
          }
      ])
    // let infectedCount=0;
    // let recoveredCount=0;
    // let arr=[];
    // function checkout(a,b){
    //     let rate=1-(a/b);
    //     if($round(rate))
    // }
    // data.map((value)=>{
    //     infectedCount+=value.infected;
    //     recoveredCount+=value.recovered;
    // })
    // checkout(infectedCount,recoveredCount);
    
    res.status(200).json({
        
        data
    })
})
///getting the healthy states
app.get("/healthyStates",async (req,res)=>{
    const data=await connection.aggregate([
        {
            $addFields:{
                mortality:{
                    $round:[{$divide:["$death","$infected"]},5]
                }
            }
        },
        {
            $match:{
                mortality:{$lt:0.005}
            },
        },
        {
            $project:{
                _id:0,
                state:1,
                mortality:1
            }
        }
    ]);
    res.status(200).json({
        
        data
    })
})
///initially to post all the data which was given initially in the question..hotspotStates
app.post("/dataPosting",async (req,res)=>{
    try{
        await connection.create(req.body);
        res.status(201).json({
            message:"success"
        })
    }
    catch(e){
        res.status(400).json({
            message:e.message
        })
    }
})


app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;