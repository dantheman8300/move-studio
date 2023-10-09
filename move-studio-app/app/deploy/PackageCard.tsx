import { Card } from "@/components/ui/card";
import { useWallet } from "@suiet/wallet-kit";
import { useEffect, useState } from "react"


export default function PackageCard(
  props: {
    digest: string
  }
) {

  const wallet = useWallet();

  const [packageDetails, setPackageDetails] = useState<any>({});

  useEffect(() => {
    getPackageDetails();
  })

  const getPackageDetails = async () => {
    const response = await fetch(
      'http://localhost:80/package-details',
      {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({packageId: props.digest, rpc: wallet.chain?.rpcUrl || ''})
      }
    );

    const data = await response.json();
    console.log(data);
  }

  return (
    <Card className="flex flex-col items-center justify-start">
      <span>
        packageDetails.
      </span>
    </Card>
  )
}