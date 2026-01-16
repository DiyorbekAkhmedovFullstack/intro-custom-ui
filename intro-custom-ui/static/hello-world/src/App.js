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
  const [issueInfo, setIssueInfo] = useState({ labels: [], commentCount: 0 });

  useEffect(() => {
    invoke("getItems").then((data) => {
      setItems(data || []);
    });
    invoke("getIssueInfo")
      .then((data) => {
        setIssueInfo(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleAddItem = async (itemId) => {
    const items = await invoke("addItem", { text: newItemText });
    setItems(items);
    setNewItemText("");
  };

  const handleToggleItem = async (itemId) => {
    const items = await invoke("toggleItem", { itemId });
    setItems(items);
  };

  const handleDeleteItem = async (itemId) => {
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
          placeholder="Add new item"
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
          <p> No items yet. Add your first task.</p>
        </div>
      ) : (
        <div>
          <div className="tasks-header">
            <span className="tasks-counter">
              Tasks ({completedCount}/{items.length})
            </span>
          </div>

          <div className="issue-info">
            <span>Comments: {issueInfo.commentCount}</span>
            <div className="labels">
              {issueInfo.labels.map((label) => (
                <span key={label} className="label-tag">
                  {label}
                </span>
              ))}
            </div>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className={`task-item ${item.completed ? "completed" : ""}`}
            >
              <Checkbox
                isChecked={item.completed}
                onChange={() => handleToggleItem(item.id)}
                label=""
              />
              <span
                className={`task-text ${item.completed ? "completed" : ""}`}
              >
                {item.text}
              </span>
              <button
                className="delete-button"
                onClick={() => handleDeleteItem(item.id)}
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
