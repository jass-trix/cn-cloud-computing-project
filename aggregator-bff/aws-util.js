const AWS = require('aws-sdk');

async function assumeRole(roleToAssumeArn, roleSessionName, credentials) {

  const sts = new AWS.STS({credentials});
  try {
    const assumeRoleParams = {
      RoleArn: roleToAssumeArn,
      RoleSessionName: roleSessionName,
    };
    const assumeRoleResponse = await sts.assumeRole(assumeRoleParams).promise();

    const temporaryCredentials = {
      accessKeyId: assumeRoleResponse.Credentials.AccessKeyId,
      secretAccessKey: assumeRoleResponse.Credentials.SecretAccessKey,
      sessionToken: assumeRoleResponse.Credentials.SessionToken,
    };

    return temporaryCredentials;
  } catch (error) {
    console.error('Error assuming IAM role:', error);
    throw error;
  }};  

module.exports = { assumeRole };
