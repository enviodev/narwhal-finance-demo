/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  Trading,
  Trading_Callback,
  Trading_CancelOpen,
  Trading_Close,
  Trading_ExecRequestClose,
  Trading_ExecRequestOpen,
  Trading_Initialized,
  Trading_Open,
  Trading_OwnershipTransferStarted,
  Trading_OwnershipTransferred,
  Trading_RequestClose,
  Trading_RequestOpen,
  Trading_SetContract,
  Trading_SetNativeFeeForKeeper,
  Trading_SetParams,
  Trading_SetReserve,
  Trading_TradeClosed,
  Trading_UpdateMargin,
  Trading_UpdateOpenRequest,
  Trading_UpdateTPAndSL,
  OrderToTrader,
  TraderStats,
} from "generated";


Trading.Callback.handler(async ({ event, context }) => {
  const entity: Trading_Callback = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    target: event.params.target,
    resut: event.params.resut,
  };

  context.Trading_Callback.set(entity);
});

Trading.CancelOpen.handler(async ({ event, context }) => {
  const entity: Trading_CancelOpen = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
  };

  context.Trading_CancelOpen.set(entity);
});

Trading.Close.handler(async ({ event, context }) => {
  const entity: Trading_Close = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
    closePrice: event.params.closePrice,
    _closeMargin: event.params._closeMargin,
    fundingFee: event.params.fundingFee,
    rolloverFee: event.params.rolloverFee,
    closeFee: event.params.closeFee,
    afterFee: event.params.afterFee,
    s: event.params.s,
  };

  context.Trading_Close.set(entity);

  // Get the OrderToTrader data using orderId
  const orderId = event.params.orderId.toString();
  const orderData = await context.OrderToTrader.get(orderId);
  
  if (!orderData) {
    // If we can't find the order data, skip PnL calculation
    return;
  }

  // Extract data from close event
  const closePrice = event.params.closePrice;
  const afterFee = event.params.afterFee; // Final amount returned to trader

  // Calculate PnL: what trader gets back minus what they put in  
  const pnl = afterFee - orderData.margin;

  // Determine if it's a win, loss, or draw
  const isWin = pnl > 0n;
  const isDraw = pnl === 0n;
  const isLoss = pnl < 0n;

  // Get or create TraderStats
  const traderAddress = orderData.traderAddress;
  let traderStats = await context.TraderStats.get(traderAddress);

  if (!traderStats) {
    // Create new trader stats
    traderStats = {
      id: traderAddress,
      totalTrades: 0n,
      totalVolume: 0n,
      totalPnL: 0n,
      wins: 0n,
      draws: 0n,
      losses: 0n,
      winRate: 0n,
    };
  }

  // Calculate position size for volume tracking
  const positionSize = orderData.margin * orderData.leverage;

  // Update trader stats
  const newWins = isWin ? traderStats.wins + 1n : traderStats.wins;
  const newDraws = isDraw ? traderStats.draws + 1n : traderStats.draws;
  const newLosses = isLoss ? traderStats.losses + 1n : traderStats.losses;
  
  // Calculate win rate (wins / total closed trades) * 100 for percentage with 2 decimals
  const totalClosedTrades = newWins + newDraws + newLosses;
  const newWinRate = totalClosedTrades > 0n ? 
    (newWins * 100n) / totalClosedTrades : 0n;

  const updatedStats: TraderStats = {
    ...traderStats,
    totalTrades: traderStats.totalTrades + 1n,
    totalVolume: traderStats.totalVolume + positionSize,
    totalPnL: traderStats.totalPnL + pnl,
    wins: newWins,
    draws: newDraws,
    losses: newLosses,
    winRate: newWinRate,
  };

  context.TraderStats.set(updatedStats);
});

Trading.ExecRequestClose.handler(async ({ event, context }) => {
  const entity: Trading_ExecRequestClose = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
    index: event.params.index,
    status: event.params.status,
  };

  context.Trading_ExecRequestClose.set(entity);
});

Trading.ExecRequestOpen.handler(async ({ event, context }) => {
  const entity: Trading_ExecRequestOpen = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
    status: event.params.status,
  };

  context.Trading_ExecRequestOpen.set(entity);
});

Trading.Initialized.handler(async ({ event, context }) => {
  const entity: Trading_Initialized = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    version: event.params.version,
  };

  context.Trading_Initialized.set(entity);
});

Trading.Open.handler(async ({ event, context }) => {
  const entity: Trading_Open = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
    t_0_0: event.params.t
        [0]
        [0]
    ,
    t_0_1: event.params.t
        [0]
        [1]
    ,
    t_0_2: event.params.t
        [0]
        [2]
    ,
    t_0_3: event.params.t
        [0]
        [3]
    ,
    t_0_4: event.params.t
        [0]
        [4]
    ,
    t_0_5: event.params.t
        [0]
        [5]
    ,
    t_0_6: event.params.t
        [0]
        [6]
    ,
    t_1: event.params.t
        [1]
    ,
    t_2: event.params.t
        [2]
    ,
    fee: event.params.fee,
  };

  const orderToTrader: OrderToTrader = {
    id: `${event.params.orderId}`,
    traderAddress: event.params.t[0][0],    // trader address
    margin: event.params.t[0][2],           // margin amount  
    openPrice: event.params.t[1],           // open price
    isLong: event.params.t[0][3],           // long/short direction
    leverage: event.params.t[0][4],         // leverage multiplier
  };

  context.Trading_Open.set(entity);
  context.OrderToTrader.set(orderToTrader);
});

Trading.OwnershipTransferStarted.handler(async ({ event, context }) => {
  const entity: Trading_OwnershipTransferStarted = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
  };

  context.Trading_OwnershipTransferStarted.set(entity);
});

Trading.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity: Trading_OwnershipTransferred = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
  };

  context.Trading_OwnershipTransferred.set(entity);
});

Trading.RequestClose.handler(async ({ event, context }) => {
  const entity: Trading_RequestClose = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
    index: event.params.index,
    _closeMargin: event.params._closeMargin,
    requstTime: event.params.requstTime,
  };

  context.Trading_RequestClose.set(entity);
});

Trading.RequestOpen.handler(async ({ event, context }) => {
  const entity: Trading_RequestOpen = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
    _request_0: event.params._request
        [0]
    ,
    _request_1_0: event.params._request
        [1]
        [0]
    ,
    _request_1_1: event.params._request
        [1]
        [1]
    ,
    _request_1_2: event.params._request
        [1]
        [2]
    ,
    _request_1_3: event.params._request
        [1]
        [3]
    ,
    _request_1_4: event.params._request
        [1]
        [4]
    ,
    _request_1_5: event.params._request
        [1]
        [5]
    ,
    _request_1_6: event.params._request
        [1]
        [6]
    ,
    _request_2: event.params._request
        [2]
    ,
    _request_3: event.params._request
        [3]
    ,
    _request_4: event.params._request
        [4]
    ,
    _request_5: event.params._request
        [5]
    ,
  };

  context.Trading_RequestOpen.set(entity);
});

Trading.SetContract.handler(async ({ event, context }) => {
  const entity: Trading_SetContract = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    _tradingStorage: event.params._tradingStorage,
    _usdt: event.params._usdt,
  };

  context.Trading_SetContract.set(entity);
});

Trading.SetNativeFeeForKeeper.handler(async ({ event, context }) => {
  const entity: Trading_SetNativeFeeForKeeper = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    _forOpen: event.params._forOpen,
    _forClose: event.params._forClose,
    _forCallback: event.params._forCallback,
    _gasLimit: event.params._gasLimit,
  };

  context.Trading_SetNativeFeeForKeeper.set(entity);
});

Trading.SetParams.handler(async ({ event, context }) => {
  const entity: Trading_SetParams = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    _liquidationP: event.params._liquidationP,
    _spreadReductionP: event.params._spreadReductionP,
    _maxMarketTradeOpenTime: event.params._maxMarketTradeOpenTime,
    _tradeSwitch: event.params._tradeSwitch,
  };

  context.Trading_SetParams.set(entity);
});

Trading.SetReserve.handler(async ({ event, context }) => {
  const entity: Trading_SetReserve = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    _receiver: event.params._receiver,
    _rate: event.params._rate,
  };

  context.Trading_SetReserve.set(entity);
});

Trading.TradeClosed.handler(async ({ event, context }) => {
  const entity: Trading_TradeClosed = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
  };

  context.Trading_TradeClosed.set(entity);
});

Trading.UpdateMargin.handler(async ({ event, context }) => {
  const entity: Trading_UpdateMargin = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
    amount: event.params.amount,
    isAdd: event.params.isAdd,
    margin: event.params.margin,
    leverage: event.params.leverage,
  };

  context.Trading_UpdateMargin.set(entity);
});

Trading.UpdateOpenRequest.handler(async ({ event, context }) => {
  const entity: Trading_UpdateOpenRequest = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
    limitPrice: event.params.limitPrice,
    tp: event.params.tp,
    sl: event.params.sl,
  };

  context.Trading_UpdateOpenRequest.set(entity);
});

Trading.UpdateTPAndSL.handler(async ({ event, context }) => {
  const entity: Trading_UpdateTPAndSL = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
    tp: event.params.tp,
    sl: event.params.sl,
  };

  context.Trading_UpdateTPAndSL.set(entity);
});
