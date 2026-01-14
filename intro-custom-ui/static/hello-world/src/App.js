import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import Button from "@atlaskit/button/new";
import { Checkbox } from "@atlaskit/checkbox";
import Spinner from "@atlaskit/spinner";
import "./App.css";

function App() {
  const [items, setItems] = useState([]);
  const [newItemText, setNewItemText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Render all items
  useEffect(() => {
    invoke("getItems")
      .then((data) => {
        setItems(data || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;
    const items = await invoke("addItem", { text: newItemText });
    setItems(items);
    setNewItemText("");
  };

  const handleToggle = async (itemId) => {
    const items = await invoke("toggleItem", { itemId });
    setItems(items);
  };

  const handleDelete = async (itemId) => {
    const items = await invoke("deleteItem", { itemId });
    setItems(items);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spinner size="medium" />
      </div>
    );
  }

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="app-container">
      <div className="add-form">
        <input
          type="text"
          className="add-input"
          placeholder="Add new item..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
        />
        <Button appearance="primary" onClick={handleAddItem}>
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>No items yet. Add your first task above.</p>
        </div>
      ) : (
        <div>
          <div className="tasks-header">
            <span className="tasks-counter">
              Tasks ({completedCount}/{items.length})
            </span>
          </div>
          {items.map((item) => (
            <div
              key={item.id}
              className={`task-item ${item.completed ? "completed" : ""}`}
            >
              <Checkbox
                isChecked={item.completed}
                onChange={() => handleToggle(item.id)}
                label=""
              />
              <span
                className={`task-text ${item.completed ? "completed" : ""}`}
              >
                {item.text}
              </span>
              <button
                className="delete-button"
                onClick={() => handleDelete(item.id)}
                title="Delete item"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
