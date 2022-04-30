const express = require("express");
var cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.u8jfe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
console.log(uri);
console.log("start the route");
async function run() {
  try {
    await client.connect();
    const inventoryItemCollection = client
      .db("InventoryItem")
      .collection("Items");
    console.log("into the try");

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = inventoryItemCollection.find(query);
      const result = await cursor.toArray();
      console.log("into the products");
      console.log(result);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);
console.log("end the route");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
