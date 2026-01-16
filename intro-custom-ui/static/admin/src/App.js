import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import Textfield from "@atlaskit/textfield";
import Button from "@atlaskit/button/new";
import Spinner from "@atlaskit/spinner";
import "./App.css";

function App() {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [externalData, setExternalData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    invoke("getCredentials")
      .then((data) => {
        if (data) {
          setApiUrl(data.apiUrl || "");
          setApiKey(data.apiKey || "");
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      await invoke("saveCredentials", { apiUrl, apiKey });
      setMessage("Credentials saved successfully!");
    } catch (error) {
      setMessage("Error saving credentials.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFetchExternal = async () => {
    setIsFetching(true);
    setExternalData(null);
    try {
      const data = await invoke("fetchExternalData");
      setExternalData(data);
    } catch (error) {
      console.error(error);
      setExternalData({ error: error.message });
    } finally {
      setIsFetching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spinner size="medium" />
      </div>
    );
  }

  return (
    <div className="app-container">
      <h2>API Configuration</h2>

      <div className="form-field">
        <label htmlFor="apiUrl">API URL</label>
        <Textfield
          id="apiUrl"
          placeholder="https://api.example.com"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="apiKey">API Key</label>
        <Textfield
          id="apiKey"
          placeholder="Enter your API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>

      <Button appearance="primary" onClick={handleSave} isLoading={isSaving}>
        Save
      </Button>

      {message && <p className="message">{message}</p>}

      <div className="test-section">
        <h3>Test External API</h3>
        <Button onClick={handleFetchExternal} isLoading={isFetching}>
          Fetch from JSONPlaceholder
        </Button>
        {externalData && (
          <div className="external-result">
            {externalData.error ? (
              <p className="error">{externalData.error}</p>
            ) : (
              <>
                <strong>{externalData.title}</strong>
                <p>{externalData.body}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
