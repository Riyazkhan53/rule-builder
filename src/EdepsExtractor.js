import React, { useState } from "react";
import axios from "axios";

const EdepsExtractor = () => {
  const [option, setOption] = useState("pasteJson");
  const [jsonInput, setJsonInput] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [output, setOutput] = useState(null);

  const extractEdeps = (data) => {
    try {
      const parsedJson = JSON.parse(data);
      const edepsMap = {};

      parsedJson.forEach((item) => {
        if (item.edeps) {
          item.edeps.forEach((dep) => {
            const [res, data] = dep.split(".");
            if (!edepsMap[res]) {
              edepsMap[res] = new Set();
            }
            if (data) {
              edepsMap[res].add(data);
            }
          });
        }
      });

      const formattedResult = Object.entries(edepsMap).map(([res, data]) => ({
        res,
        ...(data.size > 0 ? { data: Array.from(data).join(",") } : {}),
      }));

      setOutput(JSON.stringify(formattedResult, null, 2));
    } catch (error) {
      alert("Invalid JSON format. Please check your input.");
    }
  };

  const handleExtract = async () => {debugger;
    if (option === "pasteJson") {
      extractEdeps(jsonInput);
    } else if (option === "mongoDb") {
      try {
        const response = await axios.post("http://localhost:5000/fetch-template", {
          uri: "mongodb://192.168.2.150:27017",
          databaseName: "working-cdp-plt-ds",
          collectionName: "knd_templates",
          templateId,
        });
        const extractedJson = response.data.co.co;
        extractEdeps(JSON.stringify(extractedJson));
      } catch (error) {
        alert("Error fetching data from MongoDB. Please check the template ID and try again.");
      }
    }
  };

  return (
    <div>
      <h2>Edeps Extractor</h2>
      <label>
        <strong>Select Input Method:</strong>
      </label>
      <select value={option} onChange={(e) => setOption(e.target.value)}>
        <option value="pasteJson">Paste JSON</option>
        <option value="mongoDb">MongoDB Connection</option>
      </select>
      <br />

      {option === "pasteJson" && (
        <textarea
          rows="10"
          cols="80"
          placeholder="Paste JSON here..."
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        ></textarea>
      )}

      {option === "mongoDb" && (
        <input
          type="text"
          placeholder="Enter Template ID"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        />
      )}

      <br />
      <button onClick={handleExtract}>Extract</button>

      <h3>Extracted Edeps:</h3>
      <pre>{output}</pre>
    </div>
  );
};

export default EdepsExtractor;