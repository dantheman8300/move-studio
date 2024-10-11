import { db } from "@/app/db/db";
import { useLiveQuery } from "dexie-react-hooks";


export default function useCodeLiveQuery({
  path
}: {
  path: string;
}) {
  const code = useLiveQuery(async () => {
    if (path != "") {
      const forks = path.split("/");
      const project = await db.projects.get(forks.shift() || "");
      let files = project?.files || [];
      while (forks.length > 1) {
        let fork = forks.shift();
        const searchedDir = files.find((file) => file.name === fork);
        if (searchedDir == undefined) {
          break;
        }
        files = searchedDir.children || [];
      }
      const file = files.find((file) => file.name === forks[0]);
      return file?.content || "";
    }
  }, [path]);

  return code;
}