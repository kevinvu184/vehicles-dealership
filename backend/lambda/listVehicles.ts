import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';

export const handler: APIGatewayProxyHandler = async (event) => {
  const retries = 3
  const url = `https://bb61co4l22.execute-api.us-west-2.amazonaws.com/development/vehicles/${event.pathParameters.bac}`;

  try {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url);
        return {
          statusCode: 200,
          body: JSON.stringify(response.data),
        };
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};