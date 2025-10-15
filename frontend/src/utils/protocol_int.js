// xverseWallet.ts
import { RpcProvider, Contract } from 'starknet';
import { formatUnits, mainTrovesAddress, mainVesuAddress, primeVesuAddress } from "./cn";
import { Main_Vesu_Abi } from "./main_vesu_abi";
import { Main_Trooves_Abi } from './main_trooves_abi';


export async function get_PreviewDeposit(amount, protocol, pool) {
  const provider = new RpcProvider({ nodeUrl: import.meta.env.VITE_STARKNET_RPC });
  const vesuCont = new Contract(Main_Vesu_Abi, mainVesuAddress, provider);
  const primeVesuCont = new Contract(Main_Vesu_Abi, primeVesuAddress, provider);
  const TrovesCont = new Contract(Main_Trooves_Abi, mainTrovesAddress, provider);

  if (protocol === "troves-vault") {
    const [val] = await Promise.all([
      TrovesCont.preview_deposit(BigInt(Math.floor(Number(amount) * 1e8))),
    ]);
  
    return {
      formattedVal: formatUnits(val, 8),
    }; 
  } else {

    if (pool.name === "Prime") {
      const [val] = await Promise.all([
        primeVesuCont.preview_deposit(BigInt(Math.floor(Number(amount) * 1e8))),
        ]);
  
        return {
          formattedVal: formatUnits(val, 18),
        };
    }
      const [val] = await Promise.all([
      vesuCont.preview_deposit(BigInt(Math.floor(Number(amount) * 1e8))),
      ]);

      return {
        formattedVal: formatUnits(val, 18),
      };
  }
}