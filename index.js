const express = require("express");
var cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.u8jfe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const inventoryItemCollection = client
      .db("InventoryItem")
      .collection("Items");
    const newItemCollection = client.db("InventoryItem").collection("NewItems");

    app.post("/login", (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.SECRET_ACCESS_TOKEN);
      res.send({ token });
    });

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = inventoryItemCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/myitems", async (req, res) => {
      const tokenInfo = req.headers.authorization;
      const [email, accessToken] = tokenInfo.split(" ");
      const decoded = verifyToken(accessToken);

      if (email === decoded.email) {
        const cursor = await newItemCollection.find({ email: email });
        const result = await cursor.toArray();
        res.send(result);
      } else {
        res.send({ success: "UnAuthoraized Access" });
      }
    });
    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryItemCollection.findOne(query);
      res.send(result);
    });
    app.post("/additem", async (req, res) => {
      const body = req.body;
      const item = await body.item;
      const result = await newItemCollection.insertOne(item);
      res.send(result);
    });
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryItemCollection.deleteOne(query);
      res.send(result);
    });
    app.delete("/myitemsdelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await newItemCollection.deleteOne(query);
      res.send(result);
    });
    app.put("/item/:id", async (req, res) => {
      const id = req.params.id;
      const body = await req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateQuantity = {
        $set: {
          quantity: body.quantity,
        },
      };
      const result = await inventoryItemCollection.updateOne(
        filter,
        updateQuantity,
        options
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!, store dress");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function verifyToken(token) {
  let email;
  jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      email = "Error from email";
    }
    if (decoded) {
      email = decoded;
    }
  });
  return email;
}
