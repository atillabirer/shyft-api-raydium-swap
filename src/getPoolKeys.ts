import { gql, GraphQLClient } from "graphql-request";
import { Connection, PublicKey } from "@solana/web3.js";
import { Market } from "@project-serum/serum";
import { Liquidity } from "@raydium-io/raydium-sdk";

const SHYFT_API_KEY = "API KEY HERE";

const endpoint = `https://programs.shyft.to/v0/graphql?api_key=${SHYFT_API_KEY}`; //Shyft's gQl endpoint
const rpcEndpoint = `https://rpc.shyft.to/?api_key=${SHYFT_API_KEY}`;

const graphQLClient = new GraphQLClient(endpoint, {
  method: `POST`,
  jsonSerializer: {
    parse: JSON.parse,
    stringify: JSON.stringify,
  },
}); //Initialize gQL Client

export async function getPoolInfo(address: string) {
  // We only fetch fields necessary for us
  const query = gql`
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

  return await graphQLClient.request(query);
}

export async function addMarketInfo(pool: any) {
  //to load Market Info from openbook
  const connection = new Connection(rpcEndpoint, "confirmed");

  const marketPubKey = new PublicKey(pool.marketId);
  const nullProgramId = new PublicKey("11111111111111111111111111111111");
  const marketProgramPubKey = new PublicKey(pool.marketProgramId);
  const market = await Market.load(
    connection,
    marketPubKey,
    undefined,
    marketProgramPubKey
  );
  const marketInfo = market?._decoded;

  //Fetch market authority
  const associatedAuthority = getAssociatedAuthority({
    programId: marketProgramPubKey,
    marketId: marketPubKey,
  });

  const account = await connection.getAccountInfo(new PublicKey(pool.pubkey));

  //This is in the same format as you get from Raydium's mainnet.json
  return {
    baseDecimals: pool.baseDecimal,
    baseMint: new PublicKey(pool.baseMint),
    baseVault: new PublicKey(pool.baseVault),
    quoteDecimals: pool.quoteDecimal,
    quoteMint: new PublicKey(pool.quoteMint),
    quoteVault: new PublicKey(pool.quoteVault),
    marketId: marketPubKey,
    authority: Liquidity.getAssociatedAuthority({
      programId: account!.owner,
    }).publicKey.toString(),
    marketAuthority: associatedAuthority?.publicKey,
    marketProgramId: marketProgramPubKey,
    version: 4,
    withdrawQueue: new PublicKey(pool?.withdrawQueue),
    lpVault: new PublicKey(pool.lpVault),
    openOrders: new PublicKey(pool.openOrders),
    marketVersion: 3,
    marketBaseVault: marketInfo?.baseVault,
    marketQuoteVault: marketInfo?.quoteVault,
    marketBids: marketInfo?.bids,
    marketAsks: marketInfo?.asks,
    marketEventQueue: marketInfo?.eventQueue,
    lpMint: new PublicKey(pool.lpMint),
    programId: new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"), //hardcoded raydium program id
    targetOrders: new PublicKey(pool.targetOrders),
    lookupTableAccount: nullProgramId,
    lpDecimals: pool.baseDecimal,
    id: new PublicKey(pool.pubkey),
  };
}

function getAssociatedAuthority({
  programId,
  marketId,
}: {
  programId: PublicKey;
  marketId: PublicKey;
}) {
  const seeds = [marketId.toBuffer()];

  let nonce = 0;
  let publicKey: PublicKey;

  while (nonce < 100) {
    try {
      // Buffer.alloc(7) nonce u64
      const seedsWithNonce = seeds.concat(
        Buffer.from([nonce]),
        Buffer.alloc(7)
      );
      publicKey = PublicKey.createProgramAddressSync(seedsWithNonce, programId);
    } catch (err) {
      if (err instanceof TypeError) {
        throw err;
      }
      nonce++;
      continue;
    }
    return { publicKey, nonce };
  }

  return console.log(
    "unable to find a viable program address nonce",
    "params",
    {
      programId,
      marketId,
    }
  );
}
