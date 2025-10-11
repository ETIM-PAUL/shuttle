// xverseWallet.ts
import { RpcProvider, Contract } from 'starknet';
import { formatUnits } from "./cn";
import { Main_Vesu_Abi } from "./main_vesu_abi";


export async function get_PreviewVesuDeposit(amount) {
  const provider = new RpcProvider({ nodeUrl: import.meta.env.VITE_STARKNET_RPC || 'https://starknet-sepolia.public.blastapi.io' });
  const vesuSepoliaAddress = "0x033d52ef1746ab58c5a22f8e4d80eaaf7c5a08fcfaa6c5e5365680d0ed482f34";
  const vesuCont = new Contract(Main_Vesu_Abi, vesuSepoliaAddress, provider);

  const [val] = await Promise.all([
    vesuCont.preview_deposit(BigInt(Math.floor(Number(amount) * 1e8))),
  ]);

console.log("val", val);

  return {
    formattedVal: formatUnits(val, 18),
  };
}