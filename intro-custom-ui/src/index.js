import { storage } from "@forge/api";
import Resolver from "@forge/resolver";

const resolver = new Resolver();

const getStorageKey = (issueKey) => `checklist-${issueKey}`;

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

export const handler = resolver.getDefinitions();
