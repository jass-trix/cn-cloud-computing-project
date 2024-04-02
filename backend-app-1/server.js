const express = require('express');
const data = require('./data');
const AWS = require('aws-sdk');
const app = express();
const port = 8080;
const S3BucketName = process.env.S3_BUCKET_NAME|| 'UPDATE_THIS_VIA_ENV';

// Enable CORS (for development purposes)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// API endpoint to get items
app.get('/api/items', async (req, res) => {
    const allData = await data.getAllData();
    res.json(allData);
});

app.get('/api/list-images', async (req, res) => {
  try {
      let s3 = null;
      if (process.env.NODE_ENV === 'production') {
          s3 = new AWS.S3();
      } else {          
          s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
  console.log(`Server is running on http://localhost:${port}`);
});
