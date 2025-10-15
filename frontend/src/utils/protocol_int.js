// xverseWallet.ts
import { RpcProvider, Contract } from 'starknet';
import { formatUnits } from "./cn";
import { Main_Vesu_Abi } from "./main_vesu_abi";
import { Main_Trooves_Abi } from './main_trooves_abi';


export async function get_PreviewDeposit(amount, protocol) {
  const provider = new RpcProvider({ nodeUrl: import.meta.env.VITE_STARKNET_RPC });
  const vesuSepoliaAddress = "0x0131cc09160f144ec5880a0bc1a0633999030fa6a546388b5d0667cb171a52a0";
  const trovesSepoliaAddress = "0x05a4c1651b913aa2ea7afd9024911603152a19058624c3e425405370d62bf80c";
  const vesuCont = new Contract(Main_Vesu_Abi, vesuSepoliaAddress, provider);
  const TrovesCont = new Contract(Main_Trooves_Abi, trovesSepoliaAddress, provider);

  if (protocol === "troves-vault") {
    const [val] = await Promise.all([
      TrovesCont.preview_deposit(BigInt(Math.floor(Number(amount) * 1e8))),
    ]);
  
    return {
      formattedVal: formatUnits(val, 18),
    }; 
  } else {
      const [val] = await Promise.all([
      vesuCont.preview_deposit(BigInt(Math.floor(Number(amount) * 1e8))),
      ]);

      return {
        formattedVal: formatUnits(val, 18),
      };
  }
}