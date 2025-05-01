// netlify/functions/get-jobs.js
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
  });

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const query = {};
    const studentUsername = event.queryStringParameters?.assignedTo; // Optional chaining

    if (studentUsername) {
      // Query for documents where the 'assignedTo' array contains the student's username
      query.assignedTo = studentUsername;
      console.log(`Querying jobs for student: ${studentUsername}`); // Log the query target
    } else {
      console.log("Querying all jobs (no student specified)"); // Log if fetching all
    }

    await client.connect();
    const database = client.db("graphicsflow");
    const jobsCollection = database.collection("jobs");

    console.log("Executing MongoDB query:", query); // Log the actual query object
    const jobs = await jobsCollection.find(query).sort({ createdAt: -1 }).toArray();
    console.log(`Found ${jobs.length} jobs matching query.`); // Log how many were found

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobs), // Return the array of jobs
    };
  } catch (error) {
    console.error('Error in get-jobs function:', error); // Log specific error
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch jobs', details: error.message }),
    };
  } finally {
     try {
        await client.close();
    } catch (closeError) {
        console.error("Error closing MongoDB connection:", closeError);
    }
  }
};