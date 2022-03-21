import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import axios from "axios";
import { handler } from "./listDealers";

jest.spyOn(global.console, "error").mockImplementation(() => undefined);

// https://stackoverflow.com/questions/51495473/typescript-and-jest-avoiding-type-errors-on-mocked-functions
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

// Used a wrapper mock dynamoDB https://aws.amazon.com/blogs/developer/mocking-modular-aws-sdk-for-javascript-v3-in-unit-tests/
const mockDDB = mockClient(DynamoDBClient);

it("success called external api - should return a list of dealers", async () => {
  const mockValue = [
    {
      bac: "122345",
      name: "Cadillac Detriot",
      city: "Detriot",
      state: "WV",
      country: "US",
      brand: "Cadillac",
    },
  ];

  mockAxios.get.mockResolvedValue({ data: mockValue });

  mockDDB.on(UpdateItemCommand).resolves({});

  const response = await handler(null, null, null);
  expect(response).toStrictEqual({
    statusCode: 200,
    body: JSON.stringify(mockValue),
  });
});

it("failure called external api but dynamodb get cache success - should return a list of dealers", async () => {
  const mockValue = [
    {
      bac: "122345",
      name: "Cadillac Detriot",
      city: "Detriot",
      state: "WV",
      country: "US",
      brand: "Cadillac",
    },
  ];

  mockAxios.get.mockRejectedValue({ message: "error" });

  mockDDB.on(GetItemCommand).resolves({
    Item: {
      response: {
        S: JSON.stringify(mockValue),
      },
    },
  });

  const response = await handler(null, null, null);
  expect(axios.get).toHaveBeenCalledTimes(3);
  expect(console.error).toHaveBeenCalledTimes(3);
  expect(response).toStrictEqual({
    statusCode: 200,
    body: JSON.stringify(mockValue),
  });
});

it("failure called external api and dynamodb get cache failure - should return a list of dealers", async () => {
  mockAxios.get.mockRejectedValue({ message: "error" });

  mockDDB.on(GetItemCommand).rejects({ message: "error" });

  const response = await handler(null, null, null);
  expect(axios.get).toHaveBeenCalledTimes(3);
  expect(console.error).toHaveBeenCalledTimes(3);
  expect(response).toStrictEqual({
    statusCode: 500,
    body: JSON.stringify({ message: "error" }),
  });
});
