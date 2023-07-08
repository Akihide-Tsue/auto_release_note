import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";

const MemberList: { [key in string]: string } = {
  "Akihide-Tsue": "津江",
  sample_user_name: "適宜追加してください",
};

async function main() {
  const RELEASE_NOTE = process.env.RELEASE_NOTE || '{"body": "中身"}';
  const ASSIGNEE = process.env.ASSIGNEE;
  const PREFIX_LABEL = process.env.PREFIX_LABEL;
  const emoji = () => {
    switch (PREFIX_LABEL) {
      case "enhancement":
        return "🚀";
      case "bug":
        return "💊";
      default:
        return "🔧";
    }
  };

  try {
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const release_status = JSON.parse(RELEASE_NOTE);
    const date = new Date();
    date.setTime(date.getTime() + 1000 * 60 * 60 * 9); // JSTに変換

    const params = {
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      icon: {
        type: "emoji",
        emoji: emoji(),
      },
      properties: {
        // NotionのDBのタイトルも同様に変更してください
        Title: {
          title: [
            {
              text: {
                content: release_status.name,
              },
            },
          ],
        },
        "Release date": {
          date: {
            start: date,
            time_zone: "Asia/Tokyo",
          },
        },
        Assignee: {
          rich_text: [
            {
              text: {
                content: MemberList[ASSIGNEE as string] || ASSIGNEE,
              },
            },
          ],
        },
        URL: {
          url: process.env.PR_URL,
        },
      },
      children: markdownToBlocks(release_status.body),
    };

    // @ts-ignore
    await notion.pages.create(params);
  } catch (e) {
    console.error("error:", e);
  }
}

main();
