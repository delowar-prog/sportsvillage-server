const express=require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors=require('cors')
require('dotenv').config()
const app=express()
const port=process.env.PORT||'5000'

//middleware
app.use(cors())
app.use(express.json())


app.get('/', (req, res)=>{
    res.send('Server connected')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ow6kx3p.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
        const categoryCollection=client.db('sportsVillageDB').collection('category')
        const toyCollection=client.db('sportsVillageDB').collection('toys')
      app.get('/categories', async(req,res)=>{
        const result = await categoryCollection.find().toArray();
        res.send(result)
      })
      app.post('/toys', async(req,res)=>{
        const toy=req.body
        const result = await toyCollection.insertOne(toy);
        res.send(result)
      })
      app.get('/toys', async(req,res)=>{
        let query={}
        if(req.query?.email){
          query={sellerEmail:req.query.email}
        }
        const result = await toyCollection.find(query).toArray();
        res.send(result)
      })
      //update 
      app.get('/toys/:id', async(req,res)=>{
        const id=req.params.id
        const filter={_id:new ObjectId(id)}
        const result = await toyCollection.findOne(filter)
        res.send(result)
      })

      app.put('/toys/:id', async(req,res)=>{
        const id=req.params.id
        const filter={_id:new ObjectId(id)}
        const options = { upsert: true }
        const updateToys=req.body
        const newToys = {
          $set: {
            toyName:updateToys.toyName,
            category:updateToys.quantity,
            price:updateToys.price,
            rating:updateToys.rating,
            qty:updateToys.qty,
            toyImg:updateToys.toyImg,
            details:updateToys.details
          },
        };
       const result = await toyCollection.updateOne(filter, newToys, options);
       res.send(result)
      })

      //delete
      app.delete('/toys/:id', async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result=await toyCollection.deleteOne(query)
        res.send(result)
      })
      //search 
   
      app.get('/toySearch/:text', async(req,res)=>{
        const searchText=req.params.text;
        const result=await toyCollection.find({
          $or:[{toyName:{$regex:searchText,$options:'i'}}
        ]}).toArray()
        res.send(result)
      })
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run().catch(console.dir);
  
  
  app.listen(port, ()=>{
      console.log(`Example app listening on port ${port}`)
  })