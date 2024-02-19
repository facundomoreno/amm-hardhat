import { useCallback, useState } from "react";
import useAmmControllerContract from "./useAmmControllerContract";
import { ethers, BaseWallet } from "ethers";
import { WalletState } from "@/components/Registration";
import { toast } from "react-toastify";
import decodeEthersError from "@/utils/decodeEthersError";

const GAS_SPONSOR_KEY = process.env.NEXT_PUBLIC_GAS_SPONSOR_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_NODE;

const useRegistration = () => {
  const { contract } = useAmmControllerContract();

  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);

  const register = useCallback(
    async (userWallet: WalletState, username: string) => {
      if (!contract) return;

      setIsLoading(true);

      try {
        let url = RPC_URL;

        const provider = new ethers.JsonRpcProvider(url);

        const gasSponsorWallet = new ethers.Wallet(GAS_SPONSOR_KEY!, provider);

        const newUserWallet = new ethers.Wallet(
          userWallet?.privateKey!,
          provider
        );

        const userAlreadyRegistered = await contract.checkIfUserExists(
          newUserWallet.address
        );

        if (!userAlreadyRegistered) {
          let gasSponsorTxNonce = await gasSponsorWallet.getNonce();
          const gasFeeEstimation = await contract.createUser.estimateGas(
            username
          ); // @ts-ignore

          const gasPrice = (await provider.getFeeData()).gasPrice;

          const aproxEthToSponsor = Number(gasFeeEstimation) * Number(gasPrice);

          await gasSponsorWallet.sendTransaction({
            from: gasSponsorWallet.address,
            to: newUserWallet.address,
            value: aproxEthToSponsor,
            nonce: gasSponsorTxNonce,
          });

          gasSponsorTxNonce += 1;

          let success = false;
          let retries = 0;
          let ethSponsorMultiplier = 0.1;

          while (!success && retries <= 8) {
            retries += 1;
            try {
              await gasSponsorWallet.sendTransaction({
                from: gasSponsorWallet.address,
                to: newUserWallet.address,
                value: Math.ceil(aproxEthToSponsor * ethSponsorMultiplier),
                nonce: gasSponsorTxNonce,
              });
              gasSponsorTxNonce += 1;
              ethSponsorMultiplier *= 2;

              const tx = await contract
                .connect(newUserWallet)
                // @ts-ignore
                .createUser(username);
              await tx.wait();

              success = true;
              setIsRegisterSuccess(true);
            } catch (e: any) {
              let forceTxToFinish = false;
              if (typeof e.message != undefined) {
                if (
                  !e.message.includes(
                    "sender doesn't have enough funds to send tx"
                  )
                ) {
                  forceTxToFinish = true;
                }
              } else {
                forceTxToFinish = true;
              }

              if (retries == 8 || forceTxToFinish) {
                toast.error("Error en la creación de usuario");
              }
            }
          }
        } else {
          toast.error("Usuario ya registrado");
        }
      } catch (e: any) {
        if (e.message.includes("unknown custom error")) {
          const eDecoded = await decodeEthersError(e);

          toast.error(eDecoded.reason?.split("_")[1]);
        } else {
          toast.error(e.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return { register, isLoading, isRegisterSuccess };
};

export default useRegistration;
