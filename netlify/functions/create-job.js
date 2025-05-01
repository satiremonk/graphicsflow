// netlify/functions/create-job.js
const { MongoClient, ServerApiVersion } = require('mongodb');

// Connection URI from Netlify environment variable
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const jobData = JSON.parse(event.body);

    // Add server-side validation if needed

    await client.connect();
    const database = client.db("graphicsflow"); // Use your database name
    const jobsCollection = database.collection("jobs"); // Use your collection name

    // Optional: Add a timestamp or other server-generated fields
    jobData.createdAt = new Date();

    const result = await jobsCollection.insertOne(jobData);

    console.log(`Job inserted with _id: ${result.insertedId}`);

    return {
      statusCode: 201, // 201 Created
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Job created successfully', insertedId: result.insertedId }),
    };
  } catch (error) {
    console.error('Error creating job:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create job', details: error.message }),
    };
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};