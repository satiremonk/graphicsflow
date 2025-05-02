// Temporary debug version of get-jobs.js
const { MongoClient } = require('mongodb'); // Removed ServerApiVersion for extreme simplicity test
const uri = process.env.MONGODB_URI;
// DO NOT log the full uri here in production logs, but maybe temporarily for debugging if desperate
// console.log("Attempting connection with URI starting with:", uri ? uri.substring(0, uri.indexOf('@')) : "URI UNDEFINED");

const client = new MongoClient(uri); // Removed options for simplicity test

exports.handler = async (event, context) => {
  try {
    console.log("Function invoked. Attempting connection...");
    await client.connect();
    console.log("MongoDB Connection Successful!"); // If you see this, auth worked!
    // You could optionally try a simple DB command here like listCollections
    // const db = client.db("graphicsflow");
    // const collections = await db.listCollections().toArray();
    // console.log("Collections:", collections.map(c => c.name));

    await client.close();
    console.log("Connection closed.");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Connection test successful", jobs: [] }), // Return empty for now
    };
  } catch (error) {
    console.error('Connection or command failed:', error); // Log the exact error
    // Ensure sensitive parts of error aren't logged if needed, but auth errors usually okay
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Connection test failed', details: error.message }),
    };
  }
  // No finally block needed if client.close() is inside try
};