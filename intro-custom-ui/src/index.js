import api, { route, storage } from "@forge/api";
import Resolver from "@forge/resolver";

const resolver = new Resolver();

const getStorageKey = (issueKey) => `checklist-${issueKey}`;

//Get Issue information
resolver.define("getIssueInfo", async ({ context }) => {
  const issueKey = context.extension.issue.key;

  const issueResponse = await api
    .asUser()
    .requestJira(route`/rest/api/3/issue/${issueKey}?fields=labels`);
  const issueData = await issueResponse.json();

  const commentResponse = await api
    .asUser()
    .requestJira(route`/rest/api/3/issue/${issueKey}/comment`);
  const commentData = await commentResponse.json();

  return {
    labels: issueData.fields.labels || [],
    commentCount: commentData.total || 0,
  };
});

// Get all checklist items for an issue
resolver.define("getItems", async ({ context }) => {
  const issueKey = context.extension.issue.key;
  const items = await storage.get(getStorageKey(issueKey));
  return items || [];
});

// Add new item
resolver.define("addItem", async ({ payload, context }) => {
  const issueKey = context.extension.issue.key;
  const storageKey = getStorageKey(issueKey);
  const items = (await storage.get(storageKey)) || [];

  const newItem = {
    id: Date.now().toString(),
    text: payload.text,
    completed: false,
  };
  items.push(newItem);
  await storage.set(storageKey, items);

  return items;
});

//Toggle item complition
resolver.define("toggleItem", async ({ payload, context }) => {
  const issueKey = context.extension.issue.key;
  const storageKey = getStorageKey(issueKey);
  const items = (await storage.get(storageKey)) || [];

  const updatedItems = items.map((item) =>
    item.id === payload.itemId ? { ...item, completed: !item.completed } : item,
  );
  await storage.set(storageKey, updatedItems);

  return updatedItems;
});

//Delete a checklist item
resolver.define("deleteItem", async ({ payload, context }) => {
  const issueKey = context.extension.issue.key;
  const storageKey = getStorageKey(issueKey);
  const items = (await storage.get(storageKey)) || [];

  const updatedItems = items.filter((item) => item.id !== payload.itemId);
  await storage.set(storageKey, updatedItems);

  return updatedItems;
});

// Save credentials
resolver.define("saveCredentials", async ({ payload }) => {
  await storage.set("app-credentials", {
    apiUrl: payload.apiUrl,
    apiKey: payload.apiKey,
  });
  return { success: true };
});

// Get credentials
resolver.define("getCredentials", async () => {
  const credentials = await storage.get("app-credentials");
  return credentials || { apiUrl: "", apiKey: "" };
});

// Fetching external data
resolver.define("fetchExternalData", async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();
  return data;
});

export const handler = resolver.getDefinitions();
