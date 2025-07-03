const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ibgq1ve.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        await client.connect();

        const allBlogCollection = client.db('openjournal').collection('blogs')
        const allWishList = client.db('openjournal').collection('wishlist')
        const allComments = client.db('openjournal').collection('comments')

        app.post('/blogs', async (req, res) => {
            const user = req.body;
            const result = await allBlogCollection.insertOne(user);
            res.send(result)
        })

        //http//:localhost:3000/blogs?searchParams=text
        app.get('/blogs', async (req, res) => {
            const { searchParams } = req.query;
            let query = {}
            if (searchParams) {
                query = { title: { $regex: searchParams, $options: "i" } };
            }

            const blogs = await allBlogCollection.find(query).toArray()
            res.send(blogs)
        })

        app.get('/blogs/sorted', async (req, res) => {
            const blogs = await allBlogCollection.find().toArray();
            blogs.sort((a, b) => b.description.length - a.description.length);
            res.send(blogs);
        })

        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await allBlogCollection.findOne(query)
            res.send(result)
        })

        app.patch('/blogs', async (req, res) => {
            const { title, image, category, description, shortdescription, _id } = req.body;
            const query = { _id: new ObjectId(_id) }
            const updateDoc = {
                $set: {
                    title: title,
                    image: image,
                    category: category,
                    description: description,
                    shortdescription: shortdescription
                }
            }
            const result = await allBlogCollection.updateOne(query, updateDoc);
            res.send(result)
        })

        app.post('/wishlist', async (req, res) => {
            const data = req.body;
            const result = await allWishList.insertOne(data);
            res.send(result);
        })

        app.get('/wishlist', async (req, res) => {
            const data = req.body;
            const result = await allWishList.find(data).toArray();
            res.send(result)
        })

        app.delete('/wishlist/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await allWishList.deleteOne(query);
            res.send(result)
        })

        app.post('/comments', async (req, res) => {
            const data = req.body;
            const result = await allComments.insertOne(data);
            res.send(result);
        })

        app.get('/comments', async (req, res) => {
            const data = req.body;
            const result = await allComments.find(data).toArray();
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
    
    }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
    res.send('Open Journal servel runing')
})

app.listen(port, () => {
    console.log(`Open journal server runing on port`, (port));
})