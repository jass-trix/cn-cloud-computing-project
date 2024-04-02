require('dotenv').config();
const express = require('express');
const axios = require('axios');
const AWS = require('aws-sdk');
const app = express();
const port = 8081; 
const { assumeRole } = require('./aws-util');

// For local purpose only don't alter this.
const roleToAssumeArn = 'arn:aws:iam::286823151846:role/service-role/LambdaHelloWorldFunction-role-vvrvn7w0'; 
const roleSessionName = 'AggregatorBFF-session-' + new Date().getTime();

const S3BucketName = process.env.S3_BUCKET_NAME|| 'UPDATE_THIS_VIA_ENV';
const apiURL = process.env.BACKEND_APP_1_URL || 'UPDATE_THIS_VIA_ENV';

process.env.NODE_ENV = process.env.NODE_ENV || 'development'; // Default to development environment
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'SET YOUR AWS ACCESS KEY ID VIA .ENV FILE',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'SET YOUR AWS SECRET ACCESS KEY VIA .ENV FILE',
  region: process.env.AWS_REGION || 'ap-southeast-1',
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

function getImageUrl(bucketName, imageName) {
  return `https://${bucketName}.s3.amazonaws.com/${imageName}`;
}

app.get('/v1/items', async (req, res) => {
  try {
    const response = await axios.get(`${apiURL}/api/items`);
    const data = response.data;
    const imageResponse = await axios.get(`${apiURL}/api/list-images`);
    const { objects, bucketName } = imageResponse.data;
    data.map((item) => {
      item.image = getImageUrl(bucketName, objects[Math.floor(Math.random() * objects.length)]);
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from the previous backend:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// API endpoint to trigger an AWS Lambda function
app.get('/api/trigger-lambda', async (req, res) => {
    try {
        let lambda = null;
        if (process.env.NODE_ENV === 'production') {
            lambda = new AWS.Lambda();
        } else {
            const temporaryCredentials = await assumeRole(roleToAssumeArn, roleSessionName, credentials);
            lambda = new AWS.Lambda({
                accessKeyId: temporaryCredentials.accessKeyId,
                secretAccessKey: temporaryCredentials.secretAccessKey,
                sessionToken: temporaryCredentials.sessionToken,
                region: process.env.AWS_REGION || 'ap-southeast-1'
            });
        }
        // -------------

        const functionName = process.env.LAMBDA_NAME || 'UPDATE_THIS_VIA_ENV';
    
        const params = {
            FunctionName: functionName,
            InvocationType: 'RequestResponse',
        };
  
        // Trigger the Lambda function
        const result = await lambda.invoke(params).promise();
    
        res.json({ message: 'Lambda function triggered successfully', result });
    } catch (error) {
        console.error('Error triggering Lambda function:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/listS3Objects', async (req, res) => {
    try {
        let s3 = null;
        if (process.env.NODE_ENV === 'production') {
            s3 = new AWS.S3();
        } else {
            const temporaryCredentials = await assumeRole(roleToAssumeArn, roleSessionName, credentials);
            s3 = new AWS.S3({
                accessKeyId: temporaryCredentials.accessKeyId,
                secretAccessKey: temporaryCredentials.secretAccessKey,
                sessionToken: temporaryCredentials.sessionToken,
                region: process.env.AWS_REGION || 'ap-southeast-1'
            });
        }

        try {
            const params = {
              Bucket: S3BucketName,
            };
        
            const response = await s3.listObjectsV2(params).promise();
            const objects = response.Contents.map((object) => object.Key);

            res.json({ objects, bucketName: S3BucketName });
            return objects;
          } catch (error) {
            console.error('Error listing objects:', error);
            throw error;
          }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
  console.log(`Aggregator BFF is running on http://localhost:${port}`);
});

