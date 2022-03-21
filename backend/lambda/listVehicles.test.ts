import { APIGatewayProxyEvent } from "aws-lambda";
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import axios from "axios";
import { handler } from "./listVehicles";

jest.spyOn(global.console, "error").mockImplementation(() => undefined);

// https://stackoverflow.com/questions/51495473/typescript-and-jest-avoiding-type-errors-on-mocked-functions
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

// Used a wrapper mock dynamoDB https://aws.amazon.com/blogs/developer/mocking-modular-aws-sdk-for-javascript-v3-in-unit-tests/
const mockDDB = mockClient(DynamoDBClient);

it("success called external api - should return a list of vehicles", async () => {
  const event = {
    pathParameters: { bac: "122345" },
  } as unknown as APIGatewayProxyEvent;

  const mockValue = {
    _id: "5ba47ea11e867b8c0ac40c91",
    bac: "122348",
    vin: "VIN00000000000005",
    ctpStatus: "IN-SERVICE",
    onstarStatus: "CONNECTED",
    events: [
      {
        _id: "5ba47ea11e867b8c0ac40c9e",
        eventDate: "2019-09-19T14:00:00.000+0000",
        eventType: "created",
      },
    ],
    createdAt: "2019-09-21T05:16:17.927+0000",
    updatedAt: "2019-10-09T02:50:29.624+0000",
    make: "GMC",
    model: "C",
    telemetryPnid: "67891",
    color: "Red",
    stockNumber: "12349",
    year: 2019,
  };

  mockAxios.get.mockResolvedValue({ data: mockValue });

  mockDDB.on(UpdateItemCommand).resolves({});

  const response = await handler(event, null, null);
  expect(response).toStrictEqual({
    statusCode: 200,
    body: JSON.stringify(mockValue),
  });
});

it("failure called external api but dynamodb get cache success - should return a list of vehicles", async () => {
  const event = {
    pathParameters: { bac: "122345" },
  } as unknown as APIGatewayProxyEvent;

  const mockValue = {
    _id: "5ba47ea11e867b8c0ac40c91",
    bac: "122348",
    vin: "VIN00000000000005",
    ctpStatus: "IN-SERVICE",
    onstarStatus: "CONNECTED",
    events: [
      {
        _id: "5ba47ea11e867b8c0ac40c9e",
        eventDate: "2019-09-19T14:00:00.000+0000",
        eventType: "created",
      },
    ],
    createdAt: "2019-09-21T05:16:17.927+0000",
    updatedAt: "2019-10-09T02:50:29.624+0000",
    make: "GMC",
    model: "C",
    telemetryPnid: "67891",
    color: "Red",
    stockNumber: "12349",
    year: 2019,
  };

  mockAxios.get.mockRejectedValue({ message: "error" });

  mockDDB.on(GetItemCommand).resolves({
    Item: {
      response: {
        S: JSON.stringify(mockValue),
      },
    },
  });

  const response = await handler(event, null, null);
  expect(axios.get).toHaveBeenCalledTimes(3);
  expect(console.error).toHaveBeenCalledTimes(3);
  expect(response).toStrictEqual({
    statusCode: 200,
    body: JSON.stringify(mockValue),
  });
});

it("failure called external api and dynamodb get cache failure - should return a list of vehicles", async () => {
  const event = {
    pathParameters: { bac: "122345" },
  } as unknown as APIGatewayProxyEvent;

  mockAxios.get.mockRejectedValue({ message: "error" });

  mockDDB.on(GetItemCommand).rejects({ message: "error" });

  const response = await handler(event, null, null);
  expect(axios.get).toHaveBeenCalledTimes(3);
  expect(console.error).toHaveBeenCalledTimes(3);
  expect(response).toStrictEqual({
    statusCode: 500,
    body: JSON.stringify({ message: "error" }),
  });
});
