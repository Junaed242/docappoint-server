const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();
const uri = process.env.MONGODB_URI;
const app = express();
const cors = require("cors");

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //     // Connect the client to the server	(optional starting in v4.7)
    //     await client.connect();
    //     // Send a ping to confirm a successful connection
    //     await client.db("admin").command({ ping: 1 });
    //     console.log("Pinged your deployment. You successfully connected to MongoDB!");
    //   } finally {
    //     // Ensures that the client will close when you finish/error
    //     await client.close();

    const db = client.db("docAppointDB");
    const doctorsCollection = db.collection("doctors");
    const appointmentsCollection = db.collection("appointments");

    console.log("Connected to MongoDB: June 2026 Spec");

    // 1. GET Top 3 Rated Doctors (For Home Page)
    app.get("/top-doctors", async (req, res) => {
      const result = await doctorsCollection.find().limit(3).toArray();
      res.send(result);
    });

    // 2. GET All Doctors (For All Appointments Page)

    app.get("/doctors", async (req, res) => {
      const { search } = req.query;
      let query = {};

      if (search) {
        query = {
          name: { $regex: search, $options: "i" }, // Case-insensitive search
        };
      }

      const result = await doctorsCollection.find(query).toArray();
      res.send(result);
    });

    // 3. GET Single Doctor Details
    app.get("/doctors/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await doctorsCollection.findOne(query);
      res.send(result);
    });
  } catch (error) {
    console.error("Database connection error:", error);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("DocAppoint Data API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});