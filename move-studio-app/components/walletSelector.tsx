"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

import {useWallet} from '@suiet/wallet-kit';

/* 
  Component that displays a button to connect a wallet. If the wallet is connected, it displays the 
  wallet's APT balance, address and a button to disconnect the wallet. 

  When the connect button is clicked, a dialog is displayed with a list of all supported wallets. If 
  a supported wallet is installed, the user can click the connect button to connect the wallet. If
  the wallet is not installed, the user can click the install button to install the wallet.
*/
export default function WalletSelector(
  props: {
    isTxnInProgress?: boolean;
  }
) {

  // wallet state variables 
  const { select, account, connected, disconnect, configuredWallets, connecting } = useWallet();
  // State to hold the current account's APT balance. In string - floating point format.
  const [balance, setBalance] = useState<string | undefined>(undefined);

  /* 
    Gets the balance of the connected account whenever the connected, account, and isTxnInProgress
    variables change.
  */
  useEffect(() => {
    if (connected && account) {
      // getBalance(account.address);
    }
  }, [connected, account, props.isTxnInProgress]);

  return (
    <div>
      {!connected && !connecting && (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Connect Wallet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect your wallet</DialogTitle>
              {
                configuredWallets.map((wallet) => {
                  if (wallet.installed) {
                    return (
                      <div
                        key={wallet.name}
                        className="flex w-fulls items-center justify-between rounded-xl p-2"
                      >
                        <h1>{wallet.name}</h1>
                        <Button
                          variant="secondary"
                          onClick={() => select(wallet.name)}
                        >
                          Connect
                        </Button>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={wallet.name}
                        className="flex w-fulls items-center justify-between rounded-xl p-2"
                      >
                        <h1>{wallet.name}</h1>
                        <a href={wallet.downloadUrl.browserExtension || ''} target="_blank">
                          <Button variant="secondary">
                            Install
                          </Button>
                        </a>
                      </div>
                    );
                  }
                })
              }
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
      {
        connecting && 
        (
          <Button variant="secondary" disabled>
            Loading...
          </Button>
        )
      }
      {
        connected && account && 
        (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="font-mono">
                {account.address.slice(0, 5)}...{account.address.slice(-4)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => disconnect()}>
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    </div>
  );
}
