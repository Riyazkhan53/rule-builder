import React, { useState } from "react";
import { Button, TextField, Typography, Grid, MenuItem } from "@mui/material";
import axios from "axios";

const TemplateQueryGenerator = () => {
    const [option, setOption] = useState("json"); // Toggle between JSON input and MongoDB fetch
    const [inputJSON, setInputJSON] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [outputQuery, setOutputQuery] = useState("");

    // Function to convert JSON to MongoDB Update Query
    const generateQuery = (jsonData) => {
        try {
            const parsedData = JSON.parse(jsonData);

            const formatValues = (obj) => {
                for (let key in obj) {
                    if (typeof obj[key] === "number") {
                        obj[key] = `NumberInt(${obj[key]})`; // Convert numbers to NumberInt()
                    } else if (typeof obj[key] === "string" && obj[key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                        obj[key] = `ISODate("${obj[key]}")`; // Convert date strings to ISODate()
                    } else if (typeof obj[key] === "object" && obj[key] !== null) {
                        formatValues(obj[key]); // Recursively format nested objects
                    }
                }
            };

            formatValues(parsedData);

            const updateQuery = `db.knd_templates.update(
            { "_id": ObjectId("${parsedData._id}") },
            { $set: ${JSON.stringify(parsedData, null, 2).replace(/"NumberInt\((.*?)\)"/g, 'NumberInt($1)').replace(/"ISODate\((.*?)\)"/g, 'ISODate($1)')} },
            { upsert: true }
        )`;

            setOutputQuery(updateQuery);
        } catch (error) {
            alert("Invalid JSON format.");
        }
    };


    // Function to fetch template from MongoDB
    const fetchTemplateFromMongo = async () => {
        try {
            const response = await axios.post("http://localhost:5000/fetch-template", {
                uri: "mongodb://192.168.2.150:27017",
                databaseName: "working-cdp-plt-ds",
                collectionName: "knd_templates",
                templateId,
            });
            generateQuery(JSON.stringify(response.data.co));
        } catch (error) {
            alert("Error fetching template from MongoDB. Please check the template ID and try again.");
        }
    };

    // Function to copy output query
    const copyToClipboard = () => {
        navigator.clipboard.writeText(outputQuery);
        alert("Copied to clipboard!");
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h5">Template Query Generator</Typography>
            </Grid>

            {/* Select Input Type */}
            <Grid item xs={12}>
                <TextField
                    select
                    label="Input Type"
                    fullWidth
                    value={option}
                    onChange={(e) => setOption(e.target.value)}
                >
                    <MenuItem value="json">Paste JSON</MenuItem>
                    <MenuItem value="mongo">Fetch from MongoDB</MenuItem>
                </TextField>
            </Grid>

            {/* JSON Input Field */}
            {option === "json" && (
                <Grid item xs={12}>
                    <TextField
                        label="Paste JSON"
                        multiline
                        rows={6}
                        fullWidth
                        variant="outlined"
                        value={inputJSON}
                        onChange={(e) => setInputJSON(e.target.value)}
                    />
                </Grid>
            )}

            {/* MongoDB Input Field */}
            {option === "mongo" && (
                <Grid item xs={12}>
                    <TextField
                        label="Enter Template ID"
                        fullWidth
                        variant="outlined"
                        value={templateId}
                        onChange={(e) => setTemplateId(e.target.value)}
                    />
                </Grid>
            )}

            {/* Generate & Fetch Button */}
            <Grid item xs={12}>
                {option === "json" ? (
                    <Button variant="contained" onClick={() => generateQuery(inputJSON)}>
                        Generate Query
                    </Button>
                ) : (
                    <Button variant="contained" onClick={fetchTemplateFromMongo}>
                        Fetch & Generate
                    </Button>
                )}
            </Grid>

            {/* Output Query */}
            {outputQuery && (
                <Grid item xs={12}>
                    <Typography variant="h6">Generated MongoDB Query:</Typography>
                    <pre style={{ background: "#f4f4f4", padding: "10px", border: "1px solid #ddd" }}>
                        {outputQuery}
                    </pre>
                    <Button variant="contained" color="primary" onClick={copyToClipboard}>
                        Copy Query
                    </Button>
                </Grid>
            )}
        </Grid>
    );
};

export default TemplateQueryGenerator;