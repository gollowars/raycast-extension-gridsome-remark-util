import { Form, showToast, Toast, List, ActionPanel, Action } from "@raycast/api";
import { useEffect, useState } from "react";
import { format, parse } from "date-fns";
import { writeFileSync } from "fs";
import { getContentDir, isExistFile, openFileAndFinish } from "./utility";
import path from "path";

const DATE_FORMAT = "yyyy-MM-dd";
const DAFAULT_KEYWORDS = "blog";

type ArticleFrontMatter = {
  unique: string;
  title: string;
  date: string;
  keywords: string;
  description: string;
  published: boolean;
};

export default function Create() {
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const todayStr = format(new Date(), DATE_FORMAT);
  const [date, setDate] = useState(todayStr);

  const checkForm = (): boolean => {
    if (id == "") {
      return false;
    } else {
      const filepath = makeFilePath(id);
      if (isExistFile(filepath)) {
        showToast({
          style: Toast.Style.Failure,
          title: "Specified ID is not Unique.",
        });

        return false;
      }
    }

    if (title == "") {
      showToast({
        style: Toast.Style.Failure,
        title: "Title is Required",
      });
      return false;
    }

    try {
      parse(date, DATE_FORMAT, new Date());
      // const st = format(d, DATE_FORMAT);
    } catch (e) {
      showToast({
        style: Toast.Style.Failure,
        title: "Date Format is yyyy-MM-dd",
      });

      return false;
    }

    return true;
  };

  const createArticle = (values: ArticleFrontMatter): string => {
    const tags = values.keywords != "" ? values.keywords.split(",") : [DAFAULT_KEYWORDS];

    const tagstr = tags
      .map((key) => {
        return `    - ${key.trim()}`;
      })
      .join("\n");

    const keywords = values.keywords != "" ? values.keywords : values.unique;
    const description = values.description != "" ? values.description : values.title;
    const markdown = `---
published: ${values.published}
unique: ${values.unique}
title: |-
  ${values.title}
date: ${values.date}
meta:
  keywords: ${keywords}
  description: ${description}
  tags:
${tagstr}
---
# ${values.title}
`;
    return markdown;
  };

  const makeFilePath = (unique: string): string => {
    const contentDir = getContentDir();
    const fileName = `${unique}.md`;
    const fileDist = path.join(contentDir, fileName);
    return fileDist;
  };

  const createArticleHandler = (values: ArticleFrontMatter) => {
    if (!checkForm()) return;
    const md = createArticle(values);
    const fileDist = makeFilePath(values.unique);
    writeFileSync(fileDist, md);

    openFileAndFinish(fileDist);
  };

  useEffect(() => {
    console.log("-----");
    console.log("id :", id);
    console.log("title : ", title);
    console.log("date:", date);

    checkForm();
  }, [id, title, date]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create New Article"
            onSubmit={(values) => createArticleHandler(values as ArticleFrontMatter)}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="unique" title="ID" placeholder="Enter ID" value={id} onChange={setId} />
      <Form.TextField id="title" title="Title" placeholder="Enter Title" value={title} onChange={setTitle} />
      <Form.TextField id="date" title="Date" placeholder="Enter Date" value={date} onChange={setDate} />

      <Form.TextField id="keywords" title="Keywords" placeholder="Enter keywords" />
      <Form.TextField id="description" title="Description" placeholder="Enter Description" />

      <Form.Checkbox id="published" label="Published?" defaultValue={false} />
    </Form>
  );
}
