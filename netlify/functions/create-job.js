// netlify/functions/create-job.js
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const jobData = JSON.parse(event.body);
    console.log("Received job data in function:", jobData); // Log received data

    // Basic validation example (expand as needed)
    if (!jobData || !jobData.clientName || !jobData.assignedTo || !Array.isArray(jobData.assignedTo) || jobData.assignedTo.length === 0) {
       console.error("Validation failed for job data:", jobData);
       return { statusCode: 400, body: JSON.stringify({ error: 'Missing required job data or invalid assignedTo field.'}) };
    }


    await client.connect();
    const database = client.db("graphicsflow");
    const jobsCollection = database.collection("jobs");

    jobData.createdAt = new Date(); // Add creation timestamp

    const result = await jobsCollection.insertOne(jobData);
    console.log(`Job inserted with _id: ${result.insertedId}`); // Log success

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Job created successfully', insertedId: result.insertedId }),
    };
  } catch (error) {
    console.error('Error in create-job function:', error); // Log specific error
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create job', details: error.message }),
    };
  } finally {
    // Ensure the client closes (important in serverless)
    // Use try-catch around close if needed, though await usually handles it
    try {
        await client.close();
    } catch (closeError) {
        console.error("Error closing MongoDB connection:", closeError);
    }
  }
};