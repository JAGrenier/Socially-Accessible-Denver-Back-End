require("dotenv").config();
const express = require("express")
const db = require("./db")
const cors = require("cors");

const morgan = require('morgan') 
const app = express()

app.use(cors())
app.use(express.json())

// get all restaurants
app.get("/api/v1/restaurants", async(req, res) => {
        try{
            //  const results = await db.query("select * from restaurants");
            const restaurantRatingsData = await db.query(
                "SELECT * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating), 1)  average_rating from reviews group by restaurant_id)reviews on restaurants.id = reviews.restaurant_id;"
            );
            res.status(200).json({
                status: "success",
                results: restaurantRatingsData.rows.length, 
                data:{
                    restaurants:restaurantRatingsData.rows
            }, 
        });
    }catch(err){
        console.log(err)
    }
});

// get a restaurant
app.get(
    "/api/v1/restaurants/:id", 
    async (req, res) => {
    console.log(req.params.id)
    try{ 
        const restaurant = await db.query('SELECT * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id where id = $1',
        [req.params.id,]);
        const reviews = await db.query('SELECT * from reviews where restaurant_id = $1', [
            req.params.id,
        ]);
            res.status(200).json({
                    status: "success",
                    data: {
                        restaurant: restaurant.rows[0],
                        reviews: reviews.rows
                    }
                })
    }catch (err){
        console.log(err);
    }
    
})

// create a restaurant 
app.post("/api/v1/restaurants", async (req, res) => {
    console.log(req.body);

    try{
        const results = await db.query("INSERT INTO restaurants (name, lat, lng, image) values ($1, $2, $3, $4) returning *", [req.body.name, req.body.lat, req.body.lng, req.body.image])
        console.log(results)
        res.status(201).json({
        status: "success",
        data: {
            restaurant: results.rows[0]
        }
    })
    }catch(err){
        console.log(err)
    }
});

// update a restaurant not currently implemented 
app.put("/api/v1/restaurants/:id", async (req, res) =>{
    try{
        const results = await db.query('UPDATE restaurants SET name = $1, location = $2, price_range = $3 where id = $4 returning *', 
        [req.body.name, req.body.location, req.body.price_range, req.params.id]
        );
        res.status(200).json({
            status: "success",
            data: {
                restaurant: results.rows[0]
            }
    })
    }catch(err){
        console.log(err)
    }
    console.log(req.params.id)
    console.log(req.body)
})
// delete a restaurant not currently implemented 
app.delete("/api/v1/restaurants/:id", async (req, res) =>{
    try{
        const results = await db.query("DELETE FROM reviews where restaurant_id = $1", 
        [req.params.id]
        );
        console.log("here", req)
        res.status(204).json({
        status: "success"
    })
    }catch (err){
        console.log(err)
    }
})
//add review
app.post("/api/v1/restaurants/:id/addReview", async(req, res) => {
    console.log(req.body)
    try{
        const newReview = await db.query(
            "INSERT INTO reviews (restaurant_id, name, disability, rating, review, image) values ($1, $2, $3, $4, $5, $6) returning *;" , 
        [req.params.id, req.body.name, req.body.disability, req.body.rating, req.body.review, req.body.image])
        console.log("name", req.body.name)
        res.status(201).json({
            status: 'success',
            data: {
                review: newReview.rows[0],
            }
        })
    }catch(err) {
        console.log(err)
    }
})

const port = process.env.PORT || 9000;

app.listen(port, () => {
    console.log(`server is up and on port ${port}`)
});

