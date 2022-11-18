import {
  getDefaultApplication,
  popToRoot,
  closeMainWindow,
  open,
  List,
  ActionPanel,
  Form,
  Icon,
  showToast,
  Toast,
  Action,
  Clipboard,
  Detail,
} from "@raycast/api";
import got from "got";
import { useEffect, useState } from "react";
import { getPreferenceValues } from "@raycast/api";
import { readdirSync } from "fs";
import path from "path";
import expandTilde from "expand-tilde";
import glob, { Glob, GlobSync } from "glob";

import { getContentDir, openFileAndFinish, Preferences } from "./utility";

export default function Command() {
  const contentsDir = getContentDir();
  const [searchText, setSearchText] = useState("");

  const markdownPath = path.join(contentsDir, "**/*.md");
  const absFiles = glob.sync(markdownPath);
  const files = absFiles.map((file) => {
    return file.replace(contentsDir, "");
  });

  const [filteredList, filterList] = useState(files);

  useEffect(() => {
    filterList(files.filter((file) => file.includes(searchText)));
  }, [searchText]);

  const selectFileHandler = async (file: string) => {
    const filepath = path.join(contentsDir, file);
    openFileAndFinish(filepath);
  };

  return (
    <List
      filtering={false}
      navigationTitle="Search Articles"
      searchBarPlaceholder="Search your articles"
      searchText={searchText}
      onSearchTextChange={setSearchText}
    >
      {filteredList.map((file) => (
        <List.Item
          key={file}
          title={file}
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => selectFileHandler(file)} />
            </ActionPanel>
          }
        ></List.Item>
      ))}
    </List>
  );
}

export const MarkdownRender = () => {
  const preferences = getPreferenceValues<Preferences>();
  console.log("preferences:", preferences.projectDir);

  const md = `
# hello world
## test 
`;

  return (
    <>
      <Detail markdown={md} />
    </>
  );
};

function ShareSecretAction() {
  async function handleSubmit(values: { secret: string; expireViews: number; expireDays: number }) {
    if (!values.secret) {
      showToast({
        style: Toast.Style.Failure,
        title: "Secret is required",
      });
      return;
    }

    const toast = await showToast({ style: Toast.Style.Animated, title: "Sharing secret" });

    try {
      const { body } = await got.post("https://api.doppler.com/v1/share/secrets/plain", {
        json: { secret: values.secret, expire_views: values.expireViews, expire_days: values.expireDays },
        responseType: "json",
      });

      await Clipboard.copy((body as any).authenticated_url);

      toast.style = Toast.Style.Success;
      toast.title = "Shared secret";
      toast.message = "Copied link to clipboard";
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed sharing secret";
      toast.message = String(error);
    }
  }

  return <Action.SubmitForm icon={Icon.Upload} title="Share Secret" onSubmit={handleSubmit} />;
}
