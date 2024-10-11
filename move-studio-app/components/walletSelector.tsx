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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConnectWallet, useCurrentAccount, useCurrentWallet, useDisconnectWallet, useSuiClientContext, useWallets } from "@mysten/dapp-kit";
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";


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

  const { isConnected, isConnecting } = useCurrentWallet();
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const ctx = useSuiClientContext();

  return (
    <div>
      {!isConnected && !isConnecting && (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Connect Wallet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect your wallet</DialogTitle>
              {
                wallets.map((wallet) => {
                  return (
                    <div
                      key={wallet.name}
                      className="flex w-fulls items-center justify-between rounded-xl p-2"
                    >
                      <h1>{wallet.name}</h1>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          connect({
                            wallet
                          })
                        }}
                      >
                        Connect
                      </Button>
                    </div>
                  );
                })
              }
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
      {
        isConnecting && 
        (
          <Button variant="secondary" disabled>
            Loading...
          </Button>
        )
      }
      {
        isConnected && 
        (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="font-mono">
                {account!.address.slice(0, 6)}... | {ctx.network}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => ctx.selectNetwork("mainnet")}>
                  Mainnet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => ctx.selectNetwork("testnet")}>
                  Testnet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => ctx.selectNetwork("devnet")}>
                  Devnet
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
