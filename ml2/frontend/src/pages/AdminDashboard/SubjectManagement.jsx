// SubjectManagement.js

import React, { useState } from "react";
import { TextInput, Button, Alert, Card } from "./SharedComponents"; // Import shared components

const SubjectManagement = () => {
  const [subjectName, setSubjectName] = useState("");
  const [numLevels, setNumLevels] = useState(3);
  const [message, setMessage] = useState({type: "", text: ""});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({type: "", text: ""});
    try {
      const res = await fetch(
        "http://localhost:3001/api/admin/create-subject",
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({subjectName, numLevels: parseInt(numLevels)}),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({type: "success", text: data.message});
      setSubjectName("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to create subject.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Card title="Create New Subject">
      <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-blue-800 font-medium text-sm">Important</p>
            <p className="text-blue-700 text-sm mt-1">
              This will create the necessary folder structure and update all
              existing users with access to the new subject.
            </p>
          </div>
        </div>
      </div>
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Subject Name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="e.g., dsa, web_dev"
            required
          />
          <TextInput
            label="Number of Levels"
            type="number"
            value={numLevels}
            onChange={(e) => setNumLevels(e.target.value)}
            placeholder="3"
            required
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Creating Subject..." : "Create Subject"}
        </Button>
      </form>

      {message.text && (
        <Alert type={message.type} message={message.text} className="mt-4" />
      )}
    </Card>
  );
};

export default SubjectManagement;