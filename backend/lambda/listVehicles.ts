import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, UpdateItemCommand, UpdateItemCommandInput, GetItemCommand, GetItemCommandInput } from "@aws-sdk/client-dynamodb";
import axios from 'axios';

const client = new DynamoDBClient({ region: process.env.REGION });
const CACHE_TABLE = process.env.CACHE_TABLE;

export const handler: APIGatewayProxyHandler = async (event) => {
  const retries = 3
  const bac = event.pathParameters.bac;
  const url = `https://bb61co4l22.execute-api.us-west-2.amazonaws.com/development/vehicles/${bac}`;

  // first mechanism - retry 3 times
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(url);

      // second mechanism - Update the cache response
      const updateParams: UpdateItemCommandInput = {
        TableName: CACHE_TABLE,
        Key: {
          PK: { S: `VEHICLES#` },
          SK: { S: `VEHICLES#${bac}` }
        },
        UpdateExpression: 'SET #response = :response',
        ExpressionAttributeValues: {
          ':response': {
            S: JSON.stringify(data)
          }
        },
        ExpressionAttributeNames: {
          '#response': 'response'
        }
      };
      const updateCommand = new UpdateItemCommand(updateParams);
      await client.send(updateCommand);

      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    } catch (error) {
      console.error(error);
    }
  }

  // second mechanism - Get the cache response
  // this segment is only executed if the first mechanism fails
  const getParams: GetItemCommandInput = {
    TableName: CACHE_TABLE,
    Key: {
      PK: { S: `VEHICLES#` },
      SK: { S: `VEHICLES#${bac}` }
    }
  };
  const getCommand = new GetItemCommand(getParams);

  try {
    const response = await client.send(getCommand);
    return {
      statusCode: 200,
      body: JSON.stringify(JSON.parse(response.Item.response.S))
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    };
  }
};