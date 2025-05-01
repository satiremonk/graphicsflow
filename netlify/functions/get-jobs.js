// netlify/functions/get-jobs.js
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    await client.connect();
    const database = client.db("graphicsflow");
    const jobsCollection = database.collection("jobs");

    const query = {};
    // Check if filtering by student username
    if (event.queryStringParameters && event.queryStringParameters.assignedTo) {
      // Assumes assignedTo is stored as an array of usernames in the job document
      query.assignedTo = event.queryStringParameters.assignedTo;
    }

    // Fetch jobs, sort by creation date descending (newest first)
    const jobs = await jobsCollection.find(query).sort({ createdAt: -1 }).toArray();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobs),
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch jobs', details: error.message }),
    };
  } finally {
    await client.close();
  }
};