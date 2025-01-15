// Raydium Swap Script leveraging Shyft.to GraphQL API to get pool keys
// bypassing the very slow process of downloading mainnet.json
// Atilla Birer 2024 - 2025

import {
  Liquidity,
  LiquidityPoolKeysV4,
  Percent,
  TOKEN_PROGRAM_ID,
  Token,
  TokenAmount,
  TxVersion,
  jsonInfo2PoolKeys,
} from "@raydium-io/raydium-sdk";
import { getPoolInfo, addMarketInfo } from "./getPoolKeys";
import { DEFAULT_TOKEN, connection, wallet } from "./config";
import { buildAndSendTx, getWalletTokenAccount } from "./util";

async function main() {
  // ammId for raydium v4 pools
  const walletTokenAccounts = await getWalletTokenAccount(
    connection,
    wallet.publicKey
  );
  const poolId = "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2"; //WSOL-USDC
  const pool = await getPoolInfo(poolId);
  const poolAndMarketInfo = await addMarketInfo(
     // @ts-ignore
    pool!.Raydium_LiquidityPoolv4[0]
  );

  const inputToken = DEFAULT_TOKEN.WSOL;
  const outputToken = DEFAULT_TOKEN.USDC; // USDC
  const inputTokenAmount = new TokenAmount(inputToken, 1);
  const slippage = new Percent(1, 100);
 

  if (pool && poolAndMarketInfo) {
    const parsedPoolKeys = jsonInfo2PoolKeys(poolAndMarketInfo);
    //step 1 - compute amount out
    const { amountOut, minAmountOut } = Liquidity.computeAmountOut({
      poolKeys: parsedPoolKeys as LiquidityPoolKeysV4,
      poolInfo: await Liquidity.fetchInfo({
        connection,
        poolKeys: parsedPoolKeys as LiquidityPoolKeysV4,
      }),
      amountIn: inputTokenAmount,
      currencyOut: outputToken,
      slippage: slippage,
    });
    console.log("amountOut", amountOut, "minAmountOut", minAmountOut);

    // -------- step 2: create instructions by SDK function --------
    const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
      connection,
      poolKeys: parsedPoolKeys as LiquidityPoolKeysV4,
      userKeys: {
        tokenAccounts: walletTokenAccounts,
        owner: wallet.publicKey,
      },
      amountIn: inputTokenAmount,
      amountOut: minAmountOut,
      fixedSide: "in",
      makeTxVersion: TxVersion.V0,
    });
    // -------- step 3: send transaction --------
    const txids = await buildAndSendTx(innerTransactions);
    console.log("txids", txids);
  }
}

main()
  .then((value) => console.log(value))
  .catch((err) => console.error(err));
