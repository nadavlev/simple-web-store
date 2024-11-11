import express, { Request, Response } from "express";
import path from "path";
import productRoutes from "./routes/productRoutes";
import { WebSocketServer, WebSocket } from "ws";
import mongoose from "mongoose";
import { products } from "./mock_data/mock-products";
import { Order } from "./model/Order";

export const connection = mongoose.connection;

const app = express();
const PORT = process.env.PORT || 5000;

let openSocketDictionary: { [key: string]: Set<WebSocket> } = {};

initServerData();

app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../../public")));

// Product routes
app.use("/api/products", productRoutes);

app.get("/api", (_req: Request, res: Response) => {
  res.json({ message: "Hello from the Express server!" });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log(`Server Received message: ${message}`);
    const { customerName, action, productId, orderQuantity } = JSON.parse(
      message.toString(),
    );
    switch (action) {
      case "onopen":
        setNewSession(customerName, ws);
        updateClientQuantity(customerName, ws);
        break;
      case "buy":
        if (connection.db) {
          connection.db
            .collection("orders")
            .updateOne(
              { customerName, productId },
              { $set: { orderQuantity: orderQuantity } },
              { upsert: true },
            );
        } else {
          console.error("Database connection is not established");
        }

        if (openSocketDictionary[customerName]) {
          openSocketDictionary[customerName].forEach((socket) => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  action: "quantityChange",
                  customerName,
                  productId,
                  orderQuantity,
                }),
              );
            } else {
              console.log("Client not connected");
              openSocketDictionary[customerName].delete(socket);
            }
          });
        } else {
          console.warn("Worning status - Client not connected");
        }
        break;
      default:
        console.warn("Unknown action recieved from client socket");
        ws.send(JSON.stringify({ message: "Unknown action" }));
        break;
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

function setNewSession(customerName: string, ws: WebSocket) {
  if (!openSocketDictionary[customerName]) {
    openSocketDictionary[customerName] = new Set<WebSocket>();
  }
  openSocketDictionary[customerName].add(ws);
}

function updateClientQuantity(customerName: string, ws: WebSocket) {
  if (connection.db) {
    try {
      const ordersCollection = connection.db.collection("orders");
      ordersCollection
      .find<Order>({ customerName })
      .toArray()
      .then((orders: Order[]) => {
        orders.forEach((order) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                action: "quantityChange",
                customerName,
                productId: order.productId,
                orderQuantity: order.orderQuantity,
              }),
            );
          }
        });
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
      });
    } catch (error) {
      console.error("Error accessing orders collection:", error);
      return;
    }
  } else {
    console.error("Database connection is not established");
  }
}

function initServerData() {
  mongoose.connect("mongodb://localhost:27017/eshop");

  connection.once("open", () => {
    console.log("MongoDB database connection established successfully");
  });
  connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  connection.once("open", async () => {
    const db = connection.db;
    if (!db) {
      console.error("Database connection is not established");
      return;
    }
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);

    if (!collectionNames.includes("products")) {
      await db.createCollection("products");
      const productsCollection = db.collection("products");
      await productsCollection.insertMany(products);
      console.log("Products collection created");
    } else {
      console.log("Products collection already exists");
    }

    if (!collectionNames.includes("orders")) {
      await db.createCollection("orders");
      console.log("Orders collection created");
    } else {
      console.log("Orders collection already exists");
    }
  });
}
