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
    const studentUsername = event.queryStringParameters?.assignedTo; // Use optional chaining safely

    if (studentUsername) {
      // Query for documents where the 'assignedTo' array contains the student's username
      // Make sure 'assignedTo' in MongoDB is an array if filtering this way
      query.assignedTo = studentUsername;
      console.log(`Querying jobs for student: ${studentUsername}`);
    } else {
      console.log("Querying all jobs (no student specified)");
    }

    await client.connect();
    const database = client.db("graphicsflow"); // Ensure DB name is correct
    const jobsCollection = database.collection("jobs"); // Ensure Collection name is correct

    console.log("Executing MongoDB query:", query);
    const jobs = await jobsCollection.find(query).sort({ createdAt: -1 }).toArray();
    console.log(`Found ${jobs.length} jobs matching query.`);

    // Ensure client closes AFTER retrieving data
    await client.close(); // Close connection after successful operation
    console.log("Connection closed after fetching jobs.");

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobs), // Return the actual array of jobs
    };
  } catch (error) {
    console.error('Error in get-jobs function:', error);
     // Try closing client even on error, but be careful
     try { await client.close(); } catch (closeErr) { console.error("Error closing client after error:", closeErr); }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch jobs', details: error.message }),
    };
  }
  // Removed finally block as close is handled within try/catch now
};