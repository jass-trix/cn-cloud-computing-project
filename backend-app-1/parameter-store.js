const { SSM } = require('aws-sdk');

let ssm = null;
if (process.env.NODE_ENV === 'production') {
    ssm = new SSM();
} else {
    ssm = new SSM({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'ap-southeast-1'
    });
}

const getParameter = async (name) => {
  const params = {
    Name: name,
    WithDecryption: true, // Decrypt the SecureString parameter
  };

  const response = await ssm.getParameter(params).promise();
  return response.Parameter.Value;
};

const getDatabaseCredentials = async () => {
  try {
    const username = await getParameter(process.env.PARAMETER_STORE_NAME_USERNAME);
    const password = await getParameter(process.env.PARAMETER_STORE_NAME_PASSWORD);
    return { username, password };
  } catch (error) {
    console.error('Error retrieving database credentials:', error);
    throw error;
  }
};

module.exports = {
  getDatabaseCredentials,
};
