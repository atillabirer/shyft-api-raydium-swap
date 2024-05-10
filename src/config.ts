import {
  Currency,
  LOOKUP_TABLE_CACHE,
  TOKEN_PROGRAM_ID,
  Token,
  TxVersion,
} from "@raydium-io/raydium-sdk";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";

export const wallet = new Keypair(); // INSERT YOUR WALLET HERE

export const connection = new Connection(clusterApiUrl("mainnet-beta"));

export const makeTxVersion = TxVersion.V0;

export const addLookupTableInfo = LOOKUP_TABLE_CACHE;

export const DEFAULT_TOKEN = {
  SOL: new Currency(9, "USDC", "USDC"),
  WSOL: new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey("So11111111111111111111111111111111111111112"),
    9,
    "WSOL",
    "WSOL"
  ),
  USDC: new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    6,
    "USDC",
    "USDC"
  ),
  RAY: new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"),
    6,
    "RAY",
    "RAY"
  ),
  "RAY_USDC-LP": new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey("FGYXP4vBkMEtKhxrmEBcWN8VNmXX8qNgEJpENKDETZ4Y"),
    6,
    "RAY-USDC",
    "RAY-USDC"
  ),
};
