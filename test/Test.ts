import assert from "assert";
import { 
  TestHelpers,
  Trading_Callback
} from "generated";
const { MockDb, Trading } = TestHelpers;

describe("Trading contract Callback event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for Trading contract Callback event
  const event = Trading.Callback.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("Trading_Callback is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await Trading.Callback.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualTradingCallback = mockDbUpdated.entities.Trading_Callback.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedTradingCallback: Trading_Callback = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      target: event.params.target,
      resut: event.params.resut,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualTradingCallback, expectedTradingCallback, "Actual TradingCallback should be the same as the expectedTradingCallback");
  });
});
