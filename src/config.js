"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TOKEN = exports.addLookupTableInfo = exports.makeTxVersion = exports.connection = exports.wallet = void 0;
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
//phantom private key format
exports.wallet = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode("5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG"));
exports.connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("mainnet-beta"));
exports.makeTxVersion = raydium_sdk_1.TxVersion.V0;
exports.addLookupTableInfo = raydium_sdk_1.LOOKUP_TABLE_CACHE;
exports.DEFAULT_TOKEN = {
    SOL: new raydium_sdk_1.Currency(9, "USDC", "USDC"),
    WSOL: new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, new web3_js_1.PublicKey("So11111111111111111111111111111111111111112"), 9, "WSOL", "WSOL"),
    USDC: new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, new web3_js_1.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), 6, "USDC", "USDC"),
    RAY: new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, new web3_js_1.PublicKey("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"), 6, "RAY", "RAY"),
    "RAY_USDC-LP": new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, new web3_js_1.PublicKey("FGYXP4vBkMEtKhxrmEBcWN8VNmXX8qNgEJpENKDETZ4Y"), 6, "RAY-USDC", "RAY-USDC"),
};
