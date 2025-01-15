"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMarketInfo = exports.getPoolInfo = void 0;
const graphql_request_1 = require("graphql-request");
const web3_js_1 = require("@solana/web3.js");
const serum_1 = require("@project-serum/serum");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const SHYFT_API_KEY = "API KEY HERE";
const endpoint = `https://programs.shyft.to/v0/graphql?api_key=${SHYFT_API_KEY}`; //Shyft's gQl endpoint
const rpcEndpoint = `https://rpc.shyft.to/?api_key=${SHYFT_API_KEY}`;
const graphQLClient = new graphql_request_1.GraphQLClient(endpoint, {
    method: `POST`,
    jsonSerializer: {
        parse: JSON.parse,
        stringify: JSON.stringify,
    },
}); //Initialize gQL Client
function getPoolInfo(address) {
    return __awaiter(this, void 0, void 0, function* () {
        // We only fetch fields necessary for us
        const query = (0, graphql_request_1.gql) `
    query MyQuery($where: Raydium_LiquidityPoolv4_bool_exp) {
  Raydium_LiquidityPoolv4(
    where: {pubkey: {_eq: ${JSON.stringify(address)}}}
  ) {
    amountWaveRatio
    baseDecimal
    baseLotSize
    baseMint
    baseNeedTakePnl
    baseTotalPnl
    baseVault
    depth
    lpMint
    lpReserve
    lpVault
    marketId
    marketProgramId
    maxOrder
    maxPriceMultiplier
    minPriceMultiplier
    minSeparateDenominator
    minSeparateNumerator
    minSize
    nonce
    openOrders
    orderbookToInitTime
    owner
    pnlDenominator
    pnlNumerator
    poolOpenTime
    punishCoinAmount
    punishPcAmount
    quoteDecimal
    quoteLotSize
    quoteMint
    quoteNeedTakePnl
    quoteTotalPnl
    quoteVault
    resetFlag
    state
    status
    swapBase2QuoteFee
    swapBaseInAmount
    swapBaseOutAmount
    swapFeeDenominator
    swapFeeNumerator
    swapQuote2BaseFee
    swapQuoteInAmount
    swapQuoteOutAmount
    systemDecimalValue
    targetOrders
    tradeFeeDenominator
    tradeFeeNumerator
    volMaxCutRatio
    withdrawQueue
    pubkey
  }
}`;
        return yield graphQLClient.request(query);
    });
}
exports.getPoolInfo = getPoolInfo;
function addMarketInfo(pool) {
    return __awaiter(this, void 0, void 0, function* () {
        //to load Market Info from openbook
        const connection = new web3_js_1.Connection(rpcEndpoint, "confirmed");
        const marketPubKey = new web3_js_1.PublicKey(pool.marketId);
        const nullProgramId = new web3_js_1.PublicKey("11111111111111111111111111111111");
        const marketProgramPubKey = new web3_js_1.PublicKey(pool.marketProgramId);
        const market = yield serum_1.Market.load(connection, marketPubKey, undefined, marketProgramPubKey);
        // @ts-ignore
        const marketInfo = market === null || market === void 0 ? void 0 : market._decoded;
        //Fetch market authority
        const associatedAuthority = getAssociatedAuthority({
            programId: marketProgramPubKey,
            marketId: marketPubKey,
        });
        const account = yield connection.getAccountInfo(new web3_js_1.PublicKey(pool.pubkey));
        //This is in the same format as you get from Raydium's mainnet.json
        return {
            baseDecimals: pool.baseDecimal,
            baseMint: new web3_js_1.PublicKey(pool.baseMint),
            baseVault: new web3_js_1.PublicKey(pool.baseVault),
            quoteDecimals: pool.quoteDecimal,
            quoteMint: new web3_js_1.PublicKey(pool.quoteMint),
            quoteVault: new web3_js_1.PublicKey(pool.quoteVault),
            marketId: marketPubKey,
            authority: raydium_sdk_1.Liquidity.getAssociatedAuthority({
                programId: account.owner,
            }).publicKey.toString(),
            // @ts-ignore
            marketAuthority: associatedAuthority === null || associatedAuthority === void 0 ? void 0 : associatedAuthority.publicKey,
            marketProgramId: marketProgramPubKey,
            version: 4,
            withdrawQueue: new web3_js_1.PublicKey(pool === null || pool === void 0 ? void 0 : pool.withdrawQueue),
            lpVault: new web3_js_1.PublicKey(pool.lpVault),
            openOrders: new web3_js_1.PublicKey(pool.openOrders),
            marketVersion: 3,
            marketBaseVault: marketInfo === null || marketInfo === void 0 ? void 0 : marketInfo.baseVault,
            marketQuoteVault: marketInfo === null || marketInfo === void 0 ? void 0 : marketInfo.quoteVault,
            marketBids: marketInfo === null || marketInfo === void 0 ? void 0 : marketInfo.bids,
            marketAsks: marketInfo === null || marketInfo === void 0 ? void 0 : marketInfo.asks,
            marketEventQueue: marketInfo === null || marketInfo === void 0 ? void 0 : marketInfo.eventQueue,
            lpMint: new web3_js_1.PublicKey(pool.lpMint),
            programId: new web3_js_1.PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"), //hardcoded raydium program id
            targetOrders: new web3_js_1.PublicKey(pool.targetOrders),
            lookupTableAccount: nullProgramId,
            lpDecimals: pool.baseDecimal,
            id: new web3_js_1.PublicKey(pool.pubkey),
        };
    });
}
exports.addMarketInfo = addMarketInfo;
function getAssociatedAuthority({ programId, marketId, }) {
    const seeds = [marketId.toBuffer()];
    let nonce = 0;
    let publicKey;
    while (nonce < 100) {
        try {
            // Buffer.alloc(7) nonce u64
            const seedsWithNonce = seeds.concat(Buffer.from([nonce]), Buffer.alloc(7));
            publicKey = web3_js_1.PublicKey.createProgramAddressSync(seedsWithNonce, programId);
        }
        catch (err) {
            if (err instanceof TypeError) {
                throw err;
            }
            nonce++;
            continue;
        }
        return { publicKey, nonce };
    }
    return console.log("unable to find a viable program address nonce", "params", {
        programId,
        marketId,
    });
}
