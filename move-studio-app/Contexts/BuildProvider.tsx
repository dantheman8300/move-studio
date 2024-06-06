import { useLiveQuery } from "dexie-react-hooks";
import { createContext, useEffect, useState } from "react";
import { IProject, db } from "../app/db/db";
import { track } from "@vercel/analytics";

const demoCode = `module demoPackage::party {

  // Libraries being used
  use sui::transfer;

  // Object that can be deployed
  public struct Balloon has key {
    id: UID,
    popped: bool
  }

  // Deploy a new balloon
  fun init(ctx: &mut TxContext) {
    new_balloon(ctx);
  }

  public entry fun pop_balloon(balloon: &mut Balloon) {
    balloon.popped = true;
  }

  public entry fun fill_up_balloon(ctx: &mut TxContext) {
    new_balloon(ctx);
  }

  // Create a new balloon object and make it available to anyone
  fun new_balloon(ctx: &mut TxContext) {
    let balloon = Balloon{
      id: object::new(ctx), 
      popped: false
    };
    transfer::share_object(balloon);
  }
            
}`;

export type BuildContextType = {
  projectList: IProject[];
  packageDigests: { digestId: string; name: string }[];
  objectDigests: { digestId: string; name: string }[];
  selectedProjectName: string;
  tabs: (
    | { type: "code"; path: string; name: string }
    | { type: "package"; digestId: string; name: string }
  )[];
  activeTab: string;
  transactionDigests: {
    digestId: string;
    objects: { type: string; modified: string; objectId: string }[];
  }[];
  setPackageDigests: (digests: { digestId: string; name: string }[]) => void;
  setObjectDigests: (digests: { digestId: string; name: string }[]) => void;
  setSelectedProjectName: (name: string) => void;
  setTabs: (
    tabs: (
      | { type: "code"; path: string; name: string }
      | { type: "package"; digestId: string; name: string }
    )[]
  ) => void;
  setActiveTab: (tab: string) => void;
  setTransactionDigests: (
    digests: {
      digestId: string;
      objects: { type: string; modified: string; objectId: string }[];
    }[]
  ) => void;
  addTab: (type: string, identifier: string, name: string) => void;
  removeTab: (type: string, identifier: string) => void;
  addToDigests: (
    newDigests: { digestId: string; type: "package" | "object"; name: string }[]
  ) => void;
  addTransactionDigest: (
    digestId: string,
    objects: { type: string; modified: string; objectId: string }[]
  ) => void;
};

export const BuildContext = createContext<BuildContextType>({
  projectList: [],
  packageDigests: [],
  objectDigests: [],
  selectedProjectName: "",
  tabs: [],
  activeTab: "",
  transactionDigests: [],
  setPackageDigests: () => {},
  setObjectDigests: () => {},
  setSelectedProjectName: () => {},
  setTabs: () => {},
  setActiveTab: () => {},
  setTransactionDigests: () => {},
  addTab: () => {},
  removeTab: () => {},
  addToDigests: () => {},
  addTransactionDigest: () => {},
});

export default function BuildProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const projectList = useLiveQuery(() => db.projects.toArray()) || [];
  const [packageDigests, setPackageDigests] = useState<
    { digestId: string; name: string }[]
  >([]);
  const [objectDigests, setObjectDigests] = useState<
    { digestId: string; name: string }[]
  >([]);
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [tabs, setTabs] = useState<
    (
      | { type: "code"; path: string; name: string }
      | { type: "package"; digestId: string; name: string }
    )[]
  >([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [transactionDigests, setTransactionDigests] = useState<
    {
      digestId: string;
      objects: { type: string; modified: string; objectId: string }[];
    }[]
  >([]);

  useEffect(() => {
    const newUser = localStorage.getItem("newUserV2");
    if (!newUser) {
      addDemoProject();
    }
  }, []);

  useEffect(() => {
    const newTabs = tabs.filter((tab) => {
      return tab.type === "package";
    });
    setTabs(newTabs);

    console.log("newTabs", newTabs);

    if (!(activeTab in newTabs.map((tab) => tab.name))) {
      if (newTabs.length == 0) {
        setActiveTab("");
      } else {
        //TODO: Fix this
        console.log("activeTab", activeTab);
        console.log("newTabs[0].name", newTabs[0].name);
        setActiveTab(newTabs[0].name);
      }
    }
  }, [selectedProjectName]);

  const addTab = (type: string, identifier: string, name: string) => {
    if (type == "code") {
      const isAlreadyTab = tabs.find(
        (tab) => tab.type === "code" && tab.path === identifier
      );
      if (!isAlreadyTab) {
        setTabs([...tabs, { type, path: identifier, name }]);
        setActiveTab(identifier);
      } else {
        setActiveTab(identifier);
      }
    } else if (type == "package") {
      const isAlreadyTab = tabs.find(
        (tab) => tab.type === "package" && tab.digestId === identifier
      );
      if (!isAlreadyTab) {
        setTabs([...tabs, { type, digestId: identifier, name }]);
        setActiveTab(identifier);
      } else {
        setActiveTab(identifier);
      }
    }
  };

  const removeTab = (type: string, identifier: string) => {
    if (type == "code") {
      const newTabs = tabs.filter(
        (tab) =>
          tab.type === "package" ||
          (tab.type === "code" && tab.path !== identifier)
      );
      setTabs(newTabs);
      
    } else if (type == "package") {
      const newTabs = tabs.filter(
        (tab) =>
          tab.type === "code" ||
          (tab.type === "package" && tab.digestId !== identifier)
      );
      setTabs(newTabs);
    }

    if (activeTab === identifier) {
      if (tabs.length === 1) {
        setActiveTab("");
      } else {
        const newTabs = tabs.filter(
          (tab) =>
            (tab.type === "code" && tab.path !== identifier) ||
            (tab.type === "package" && tab.digestId !== identifier)
        );
        const lastTab = newTabs[newTabs.length - 1];
        setActiveTab(lastTab.type === "code" ? lastTab.path : lastTab.digestId);
      }
    }
  };

  const addToDigests = (
    newDigests: { digestId: string; type: "package" | "object"; name: string }[]
  ) => {
    const newPackageDigests = newDigests.filter(
      (newDigest) => newDigest.type === "package"
    );
    const newObjectDigests = newDigests.filter(
      (newDigest) => newDigest.type === "object"
    );

    setPackageDigests([...packageDigests, ...newPackageDigests]);
    setObjectDigests([...objectDigests, ...newObjectDigests]);
  };

  const addTransactionDigest = (
    digestId: string,
    objects: { type: string; modified: string; objectId: string }[]
  ) => {
    setTransactionDigests([{ digestId, objects }, ...transactionDigests]);
  };

  const addDemoProject = async () => {
    await db.projects.add({
      name: "demoPackage",
      files: [
        {
          type: "folder",
          name: "sources",
          children: [
            {
              type: "file",
              name: "party.move",
              content: demoCode,
            },
          ],
        },
        {
          type: "file",
          name: "Move.toml",
          content: `[package]
name = "${"demoPackage"}"
version = "0.0.1"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "testnet" }

[addresses]
${"demoPackage"} = "0x0"
`,
        },
      ],
    });
    localStorage.setItem("newUserV2", "true");
    track("demo-project-created");
  };

  return (
    <BuildContext.Provider
      value={{
        projectList,
        packageDigests,
        objectDigests,
        selectedProjectName,
        tabs,
        activeTab,
        transactionDigests,
        setPackageDigests,
        setObjectDigests,
        setSelectedProjectName,
        setTabs,
        setActiveTab,
        setTransactionDigests,
        addTab,
        removeTab,
        addToDigests,
        addTransactionDigest,
      }}
    >
      {children}
    </BuildContext.Provider>
  );
}
