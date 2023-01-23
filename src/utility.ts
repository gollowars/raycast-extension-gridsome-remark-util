import { closeMainWindow, getDefaultApplication, getPreferenceValues, open, popToRoot, trash, confirmAlert} from "@raycast/api";
import expandTilde from "expand-tilde";
import { statSync } from "fs";
import path from "path";

export interface Preferences {
  projectDir: string;
  markdownBaseDir: string;
}

export const getContentDir = (): string => {
  const preference = getPreferenceValues<Preferences>();
  const rootDir = expandTilde(preference.projectDir);
  const contentDir = path.join(rootDir, preference.markdownBaseDir);
  return contentDir;
};

export const isExistFile = (file: string) => {
  try {
    statSync(file);
    return true;
  } catch (e) {
    return false;
  }
}


export const openFileAndFinish = async (filepath: string)=>{
    const defaultApp = await getDefaultApplication(filepath);
    await open(filepath, defaultApp.bundleId);
    await finish() 
}

export const trashFileAndFinish = async (filepath: string)=>{
  if (await confirmAlert({ title: "Are you sure to Delete?" })) {
    await trash(filepath);
    await finish();
    // do something
  } else {
    await finish();
  }

  
}


const finish = async ()=>{
  popToRoot({ clearSearchBar: true });
  await closeMainWindow({ clearRootSearch: true });
}