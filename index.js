const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kiav5mh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 4000

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

    const db = await client.db(`${process.env.DB_NAME}`);
    const productsCollection = await db.collection(`${process.env.PROD_COLL_NAME}`);
    const ordersCollection = await db.collection(`${process.env.ORDER_COLL_NAME}`);

    // View root directory
    app.get('/', async (req, res) => {
      res.send("Hello Ema-John Server. It's Working");
    })

    // CREATE OPERATION
    app.post('/addProduct', async (req, res) => {
        await client.connect();
        const products = req.body;

        // await productsCollection.insertMany(products) // front end theke fakeData pathaitase & akhan theke data ek sathe mongoDB te insert kore detase.
        await productsCollection.insertOne(products) // front end theke 1 ta kore data pathaitase & backend teheke mongoDB te save hobe.
        .then((result) => {
          res.send(result.insertedCount);
        })
    })

    // READ OPERATION
    app.get('/products', async (req, res) => {
        await client.connect();

        const cursor = productsCollection.find({}) // sob data read kortase.
        const services = await cursor.toArray();
        res.send(services);
    })

    // single product load from database when click on product title
    app.get('/product/:key', async (req, res) => {
        await client.connect();

        const clientKey = req.params.key;
        const cursor = productsCollection.find({key: req.params.key})
        const services = await cursor.toArray();
        res.send(services[0]); // jehetu amra 1 ta single item k return kortase tai array[0] dea lagbe.
    })

    // multiple product load from database when passed keys from client-side
    app.post('/productsByKeys', async (req, res) => {
      await client.connect();

      const productKeys = req.body;
      const cursor = productsCollection.find({key: { $in: productKeys }})
      const services = await cursor.toArray();
      res.send(services);

    })

    // Shipment er order information gulo database e save korbo.
    app.post('/addOrder', async (req, res) => {
      await client.connect();
      const order = req.body;

      // await productsCollection.insertMany(products) // front end theke fakeData pathaitase & akhan theke data ek sathe mongoDB te insert kore detase.
      await ordersCollection.insertOne(order) // front end theke 1 ta kore data pathaitase & backend teheke mongoDB te save hobe.
      .then((result) => {
        res.send(result);
      })
  })
    
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// port will change dynamically
app.listen(process.env.PORT || port)