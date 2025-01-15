"use strict";
// Raydium Swap Script leveraging Shyft.to GraphQL API to get pool keys
// bypassing the very slow process of downloading mainnet.json
// Atilla Birer 2024 - 2025
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
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const getPoolKeys_1 = require("./getPoolKeys");
const config_1 = require("./config");
const util_1 = require("./util");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // ammId for raydium v4 pools
        const walletTokenAccounts = yield (0, util_1.getWalletTokenAccount)(config_1.connection, config_1.wallet.publicKey);
        const poolId = "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2"; //WSOL-USDC
        const pool = yield (0, getPoolKeys_1.getPoolInfo)(poolId);
        const poolAndMarketInfo = yield (0, getPoolKeys_1.addMarketInfo)(
        // @ts-ignore
        pool.Raydium_LiquidityPoolv4[0]);
        const inputToken = config_1.DEFAULT_TOKEN.WSOL;
        const outputToken = config_1.DEFAULT_TOKEN.USDC; // USDC
        const inputTokenAmount = new raydium_sdk_1.TokenAmount(inputToken, 1);
        const slippage = new raydium_sdk_1.Percent(1, 100);
        if (pool && poolAndMarketInfo) {
            const parsedPoolKeys = (0, raydium_sdk_1.jsonInfo2PoolKeys)(poolAndMarketInfo);
            //step 1 - compute amount out
            const { amountOut, minAmountOut } = raydium_sdk_1.Liquidity.computeAmountOut({
                poolKeys: parsedPoolKeys,
                poolInfo: yield raydium_sdk_1.Liquidity.fetchInfo({
                    connection: config_1.connection,
                    poolKeys: parsedPoolKeys,
                }),
                amountIn: inputTokenAmount,
                currencyOut: outputToken,
                slippage: slippage,
            });
            console.log("amountOut", amountOut, "minAmountOut", minAmountOut);
            // -------- step 2: create instructions by SDK function --------
            const { innerTransactions } = yield raydium_sdk_1.Liquidity.makeSwapInstructionSimple({
                connection: config_1.connection,
                poolKeys: parsedPoolKeys,
                userKeys: {
                    tokenAccounts: walletTokenAccounts,
                    owner: config_1.wallet.publicKey,
                },
                amountIn: inputTokenAmount,
                amountOut: minAmountOut,
                fixedSide: "in",
                makeTxVersion: raydium_sdk_1.TxVersion.V0,
            });
            // -------- step 3: send transaction --------
            const txids = yield (0, util_1.buildAndSendTx)(innerTransactions);
            console.log("txids", txids);
        }
    });
}
main()
    .then((value) => console.log(value))
    .catch((err) => console.error(err));
