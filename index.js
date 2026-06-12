const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();
const uri = process.env.MONGODB_URI;
const app = express();
const cors = require("cors");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

async function run() {
  try {
    const db = client.db("docAppointDB");
    const doctorsCollection = db.collection("doctors");
    const appointmentsCollection = db.collection("appointments");

    console.log("Connected to MongoDB");

    // 1. GET Top 3 Rated Doctors (For Home Page)
    app.get("/top-doctors", async (req, res) => {
      const result = await doctorsCollection.find().limit(3).toArray();
      res.send(result);
    });

    // 2. GET All Doctors (For All Appointments Page with Search)
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

    // 4. POST Book an Appointment (MISSING ROUTE - NOW ADDED!)
    app.post('/appointments', verifyToken, async (req, res) => {
        const appointment = req.body;
        const result = await appointmentsCollection.insertOne(appointment);
        res.send(result);
    });

    // 5. GET Appointments by User Email (MOVED INSIDE TRY BLOCK)
    app.get('/appointments', verifyToken, async (req, res) => {
        const { email } = req.query;
        let query = {};
        if (email) {
            query = { userEmail: email };
        }
        const result = await appointmentsCollection.find(query).toArray();
        res.send(result);
    });

    // 6. PATCH (Update) Appointment by IDs
    app.patch('/appointments/:id', verifyToken, async (req, res) => {
        const id = req.params.id;
        const updatedBooking = req.body;
        const filter = { _id: new ObjectId(id) };
        
        const updateDoc = {
            $set: {
                patientName: updatedBooking.patientName,
                phone: updatedBooking.phone,
                gender: updatedBooking.gender,
                appointmentDate: updatedBooking.appointmentDate,
                appointmentTime: updatedBooking.appointmentTime
            }
        };
        
        const result = await appointmentsCollection.updateOne(filter, updateDoc);
        res.send(result);
    });

    // 7. DELETE Appointment by ID
    app.delete('/appointments/:id', verifyToken, async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await appointmentsCollection.deleteOne(query);
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