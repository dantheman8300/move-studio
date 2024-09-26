import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cross2Icon } from "@radix-ui/react-icons";
import CodeEditor from "./codeEditor";
import PackageWindow from "./PackageWindow";
import { useContext } from "react";
import { MagicSpinner } from "react-spinners-kit";
import { TypeAnimation } from "react-type-animation";
import { BuildContext } from "@/Contexts/BuildProvider";

const quotes = [
  "First, solve the problem. Then, write the code.\n - John Johnson",
  "I’m not a great programmer; I’m just a good programmer with great habits.\n - Kent Beck",
  "It’s not a bug; it’s an undocumented feature.\n - Anonymous",
  "Talk is cheap. Show me the code.\n - Linus Torvalds",
  "Code is like humor. When you have to explain it, it’s bad.\n - Cory House",
  "Fix the cause, not the symptom.\n - Steve Maguire",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.\n - Martin Fowler",
  "You might not think that programmers are artists, but programming is an extremely creative profession. It’s logic-based creativity.\n - John Romero",
  "Programming is learned by writing programs.\n - Brian Kernighan",
  "If, at first, you do not succeed, call it version 1.0.\n - Khayri R.R. Woulfe",
];

const interleave = (arr: any, thing: any) =>
  [].concat(...arr.map((n: any) => [n, thing])).slice(0, -1);

export default function MainWindow() {
  const { tabs, removeTab } = useContext(BuildContext);

  return (
    <Tabs className="border rounded-xl w-full h-full overflow-hidden">
      <TabsList className="w-full h-10 rounded-none items-center justify-start px-6 border-b">
        {tabs.map((tab, i) => {
          if (tab.type === "code") {
            return (
              <TabsTrigger
                key={i}
                value={tab.path}
                className="font-mono flex flex-row items-center justify-center gap-1"
              >
                {tab.name}
                <Cross2Icon
                  className="w-4 h-4 hover:text-red-500 hover:cursor-pointer active:scale-75 transition-transform"
                  onClick={(e) => {
                    e.preventDefault();
                    removeTab(tab.type, tab.path);
                  }}
                />
              </TabsTrigger>
            );
          } else if (tab.type === "package") {
            return (
              <TabsTrigger
                key={i}
                value={tab.digestId}
                className="font-mono flex flex-row items-center justify-center gap-1"
              >
                {tab.name}
                <Cross2Icon
                  className="w-4 h-4 hover:text-red-500 hover:cursor-pointer active:scale-75 transition-transform"
                  onClick={(e) => {
                    e.preventDefault();
                    removeTab(tab.type, tab.digestId);
                  }}
                />
              </TabsTrigger>
            );
          }
        })}
      </TabsList>
      <div className="h-full flex flex-col items-center justify-start">
        {tabs.map((tab, index) => {
          if (tab.type === "code") {
            return (
              <TabsContent
                key={index}
                value={tab.path}
                className="mt-0 w-full h-full"
              >
                <CodeEditor path={tab.path} />
              </TabsContent>
            );
          } else if (tab.type === "package") {
            return (
              <TabsContent
                key={index}
                value={tab.digestId}
                className="mt-0 w-full h-full"
              >
                <PackageWindow
                  package={{ name: tab.name, digestId: tab.digestId }}
                  removeMe={() => {
                    removeTab(tab.type, tab.digestId);
                  }}
                />
              </TabsContent>
            );
          }
        })}
        {tabs.length == 0 && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <MagicSpinner color="#f59e0b" size={60} />
            <span className="font-mono text-white text-xl antialiased">
              Move Studio IDE
            </span>
            <span className="font-mono text-teal-600 w-[300px] text-center whitespace-pre-line break-words">
              <TypeAnimation
                sequence={[
                  ...interleave(
                    quotes.sort(() => 0.5 - Math.random()),
                    2000
                  ),
                  "That's all folks!",
                  5000,
                  "Seriously, that's all folks!",
                  5000,
                  "Ok, I'm done now.",
                ]}
                wrapper="span"
                cursor={true}
                speed={25}
              />
            </span>
          </div>
        )}
      </div>
    </Tabs>
  );
}
