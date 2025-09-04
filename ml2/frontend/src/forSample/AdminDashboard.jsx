import React, {useState, useEffect, useRef} from "react";

// Enhanced Spinner component
const Spinner = () => (
  <div className="flex justify-center items-center p-12">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
    </div>
  </div>
);

// Enhanced Select Component
const SelectInput = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = "Select an option",
}) => {
  const hasOptions = options && options.length > 0;

  return (
    <div className="relative">
      <label className="block font-medium mb-2 text-slate-700 text-sm">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled || !hasOptions}
          className="w-full p-3.5 pr-12 border border-slate-300 rounded-lg text-base bg-white text-slate-800
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-slate-400
            disabled:opacity-60 disabled:cursor-not-allowed appearance-none shadow-sm"
        >
          <option value="">
            {hasOptions ? placeholder : "No options available"}
          </option>
          {hasOptions &&
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
      {!hasOptions && (
        <p className="mt-1 text-xs text-slate-500">No options available</p>
      )}
    </div>
  );
};

// Enhanced Input Component
const TextInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
}) => {
  return (
    <div className={className}>
      <label className="block font-medium mb-2 text-slate-700 text-sm">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full p-3.5 border border-slate-300 rounded-lg text-base bg-white text-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-slate-400 shadow-sm"
      />
    </div>
  );
};

// Enhanced Textarea Component
const TextareaInput = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
}) => {
  return (
    <div>
      <label className="block font-medium mb-2 text-slate-700 text-sm">
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full p-3.5 border border-slate-300 rounded-lg text-base bg-white text-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-slate-400 shadow-sm resize-y"
      />
    </div>
  );
};

// Enhanced Button Component
const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}) => {
  const baseClasses =
    "font-medium cursor-pointer transition-all duration-200 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
    secondary:
      "bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
    outline:
      "border border-purple-600 text-purple-600 bg-white hover:bg-purple-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-5 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// Enhanced Alert Component
const Alert = ({type, message, className = ""}) => {
  const types = {
    success: "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500",
    error: "bg-red-50 text-red-800 border-l-4 border-red-500",
    info: "bg-blue-50 text-blue-800 border-l-4 border-blue-500",
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg font-medium ${types[type]} ${className}`}
    >
      {message}
    </div>
  );
};

// Enhanced Card Component
const Card = ({title, children, className = ""}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

// --- Reusable CSVUploader Component (Enhanced) ---
const CSVUploader = ({title, endpoint, templateName, onUploadComplete}) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({type: "", text: ""});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage({type: "", text: ""});
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({type: "error", text: "Please select a file first."});
      return;
    }
    setIsUploading(true);
    setMessage({type: "", text: ""});
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`http://localhost:3001/api/admin${endpoint}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({type: "success", text: data.message});
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      setMessage({type: "error", text: error.message || "Upload failed."});
    } finally {
      setIsUploading(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <h4 className="text-slate-800 text-lg font-semibold">{title}</h4>
      </div>

      <p className="text-slate-600 mb-5 text-sm">
        Upload a CSV file following the required format.{" "}
        <a
          href={`/templates/${templateName}`}
          download
          className="text-purple-600 font-medium hover:text-purple-700 hover:underline transition-colors duration-200 inline-flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download Template
        </a>
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <Button
          onClick={handleUpload}
          disabled={isUploading || !file}
          variant="secondary"
          className="whitespace-nowrap"
        >
          {isUploading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Uploading...
            </span>
          ) : (
            "Upload File"
          )}
        </Button>
      </div>

      {message.text && (
        <Alert type={message.type} message={message.text} className="mt-4" />
      )}
    </div>
  );
};

// --- User Management Tab Content (Enhanced) ---
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/users");
      if (res.ok) setUsers(await res.json());
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CSVUploader
          title="Upload New Users via CSV"
          endpoint="/upload-users"
          templateName="users_template.csv"
          onUploadComplete={fetchUsers}
        />
      </Card>

      <Card title={`All Users (${users.length})`}>
        {isLoading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <svg
              className="w-16 h-16 mx-auto text-slate-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm">Upload a CSV file to add users</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full border-collapse bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-slate-700 text-sm uppercase tracking-wider border-b border-slate-200">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-slate-700 text-sm uppercase tracking-wider border-b border-slate-200">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user, index) => (
                  <tr
                    key={user.username}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {user.username}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// --- Question Management Tab Content (Enhanced) ---
const QuestionManagement = () => {
  const [subjectsData, setSubjectsData] = useState({});
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [testCases, setTestCases] = useState([
    {input: "", expected_output: ""},
  ]);
  const [message, setMessage] = useState({type: "", text: ""});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/questions");
      const data = await res.json();
      setSubjectsData(data);
      if (Object.keys(data).length > 0) {
        const firstSubject = Object.keys(data)[0];
        setSubject(firstSubject);
        if (data[firstSubject]?.[0])
          setLevel(data[firstSubject][0].replace("level", ""));
      }
    } catch (error) {
      console.error("Failed to fetch subjects structure:", error);
      setMessage({type: "error", text: "Could not load subjects."});
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const addTestCase = () => {
    if (testCases.length < 5) {
      setTestCases([...testCases, {input: "", expected_output: ""}]);
    }
  };

  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({type: "", text: ""});

    const newQuestion = {
      id,
      title,
      description,
      test_cases: testCases.filter(
        (tc) => tc.input.trim() !== "" && tc.expected_output.trim() !== ""
      ),
    };

    const payload = {
      subject,
      level,
      question: newQuestion,
    };

    try {
      const res = await fetch("http://localhost:3001/api/questions", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({type: "success", text: data.message});
      setId("");
      setTitle("");
      setDescription("");
      setTestCases([{input: "", expected_output: ""}]);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "An error occurred while adding the question.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectOptions = Object.keys(subjectsData).map((s) => ({
    value: s,
    label: s.toUpperCase(),
  }));

  const levelOptions = (subjectsData[subject] || []).map((l) => ({
    value: l.replace("level", ""),
    label: l.replace("level", ""),
  }));

  return (
    <div className="space-y-6">
      <Card title="Add Single Question">
        <form onSubmit={handleAddQuestion} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              options={subjectOptions}
              placeholder="Select a subject"
            />
            <SelectInput
              label="Level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              options={levelOptions}
              disabled={!subject}
              placeholder="Select a level"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Question ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g., q3, find_average"
              required
            />
            <TextInput
              label="Question Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter question title"
              required
            />
          </div>

          <TextareaInput
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter question description..."
            required
            rows={5}
          />

          <div>
            <label className="block font-medium mb-3 text-slate-700 text-sm">
              Test Cases (Max 5)
            </label>
            <div className="space-y-3">
              {testCases.map((tc, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 lg:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Test Input {index + 1}
                    </label>
                    <textarea
                      className="w-full p-2.5 border border-slate-300 rounded-md text-sm bg-white text-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-y"
                      value={tc.input}
                      onChange={(e) =>
                        handleTestCaseChange(index, "input", e.target.value)
                      }
                      placeholder="5\n10"
                      rows="2"
                      required
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Expected Output {index + 1}
                    </label>
                    <textarea
                      className="w-full p-2.5 border border-slate-300 rounded-md text-sm bg-white text-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-y"
                      value={tc.expected_output}
                      onChange={(e) =>
                        handleTestCaseChange(
                          index,
                          "expected_output",
                          e.target.value
                        )
                      }
                      placeholder="15.0"
                      rows="2"
                      required
                    />
                  </div>
                  {testCases.length > 1 && (
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeTestCase(index)}
                        className="w-full"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {testCases.length < 5 && (
              <Button
                type="button"
                variant="secondary"
                onClick={addTestCase}
                className="mt-3"
              >
                + Add Test Case
              </Button>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="w-full">
            {isSubmitting ? "Adding Question..." : "Add Question"}
          </Button>
        </form>
        {message.text && (
          <Alert type={message.type} message={message.text} className="mt-4" />
        )}
      </Card>
      <Card>
        <CSVUploader
          title="Upload Questions via CSV"
          endpoint="/upload-questions"
          templateName="questions_template.csv"
          onUploadComplete={fetchSubjects}
        />
      </Card>
    </div>
  );
};
// --- Subject Management Tab Content (Enhanced) ---
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
// --- Enhanced Student Submission Detail Component ---
const StudentSubmissionDetail = ({username, submissions}) => {
  const summary = submissions.reduce((acc, sub) => {
    if (!acc[sub.subject]) {
      acc[sub.subject] = {completed: 0, failed: 0, attempts: 0};
    }
    acc[sub.subject].attempts++;
    if (sub.status === "completed") {
      const completedLevelsForSubject = submissions
        .filter((s) => s.subject === sub.subject && s.status === "completed")
        .map((s) => s.level);
      acc[sub.subject].completed = new Set(completedLevelsForSubject).size;
    }
    if (sub.status === "failed") {
      acc[sub.subject].failed++;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
            <svg
              className="w-4 h-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          Progress Summary for {username}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(summary).map(([subject, data]) => (
            <div
              key={subject}
              className="bg-white p-4 rounded-lg shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-slate-800">
                  {subject.toUpperCase()}
                </h5>
                <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">
                    Completed Levels
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium text-xs">
                    {data.completed}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Total Attempts</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium text-xs">
                    {data.attempts}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          Full Submission History ({submissions.length})
        </h4>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full border-collapse bg-white">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700 text-sm uppercase tracking-wider border-b border-slate-200">
                  Subject
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700 text-sm uppercase tracking-wider border-b border-slate-200">
                  Level
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700 text-sm uppercase tracking-wider border-b border-slate-200">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700 text-sm uppercase tracking-wider border-b border-slate-200">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {submissions.map((sub, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-slate-700 font-medium">
                    {sub.subject}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{sub.level}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full font-medium text-xs uppercase tracking-wide ${
                        sub.status === "passed" || sub.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {new Date(sub.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
const SubmissionsViewer = () => {
  const [view, setView] = useState("aggregate");
  const [submissions, setSubmissions] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [isAggLoading, setIsAggLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [isStudentLoading, setIsStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState("");
  useEffect(() => {
    if (view === "aggregate") {
      const fetchAggregateSubmissions = async () => {
        setIsAggLoading(true);
        try {
          const res = await fetch("http://localhost:3001/api/submissions");
          if (!res.ok) throw new Error("Failed to fetch submission data.");
          const data = await res.json();
          setSubmissions(data);
          const availableSubjects = Object.keys(data);
          setSubjects(availableSubjects);
          if (availableSubjects.length > 0) {
            setSelectedSubject(availableSubjects[0]);
          }
        } catch (error) {
          console.error("Error fetching aggregate submissions", error);
        } finally {
          setIsAggLoading(false);
        }
      };
      fetchAggregateSubmissions();
    }
  }, [view]);

  const handleStudentSearch = async (e) => {
    e.preventDefault();
    if (!searchUsername) return;
    setIsStudentLoading(true);
    setStudentError("");
    setStudentData(null);
    try {
      const res = await fetch(
        `http://localhost:3001/api/submissions/${searchUsername}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Student not found.");
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setStudentData(data);
    } catch (error) {
      setStudentError(error.message);
    } finally {
      setIsStudentLoading(false);
    }
  };

  const subjectOptions = subjects.map((s) => ({
    value: s,
    label: s.toUpperCase(),
  }));

  const levelsForSubject = selectedSubject
    ? Object.keys(submissions[selectedSubject] || {})
    : [];

  const levelOptions = levelsForSubject.map((l) => ({
    value: l,
    label: l,
  }));

  const displayedSubmissions =
    (selectedSubject &&
      selectedLevel &&
      submissions[selectedSubject]?.[selectedLevel]) ||
    [];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setView("aggregate")}
            variant={view === "aggregate" ? "primary" : "outline"}
            className="flex-1 sm:flex-none"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Aggregate View
          </Button>
          <Button
            onClick={() => setView("student")}
            variant={view === "student" ? "primary" : "outline"}
            className="flex-1 sm:flex-none"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Student View
          </Button>
        </div>

        {view === "aggregate" && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              View All Submissions
            </h3>
            {isAggLoading ? (
              <Spinner />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <SelectInput
                    label="Select Subject"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    options={subjectOptions}
                    placeholder="Choose a subject"
                  />
                  <SelectInput
                    label="Select Level"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    options={levelOptions}
                    disabled={!selectedSubject}
                    placeholder="Choose a level"
                  />
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full border-collapse bg-white">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-700 text-sm uppercase tracking-wider border-b border-slate-200">
                          Username
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-700 text-sm uppercase tracking-wider border-b border-slate-200">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-700 text-sm uppercase tracking-wider border-b border-slate-200">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {displayedSubmissions.length > 0 ? (
                        displayedSubmissions.map((sub, index) => (
                          <tr
                            key={index}
                            className="hover:bg-slate-50 transition-colors duration-150"
                          >
                            <td className="px-4 py-3 text-slate-700 font-medium">
                              {sub.username}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2.5 py-1 rounded-full font-medium text-xs uppercase tracking-wide ${
                                  sub.status === "passed" ||
                                  sub.status === "completed"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {sub.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-sm">
                              {new Date(sub.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-4 py-8 text-center text-slate-500"
                          >
                            <div className="flex flex-col items-center">
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                <svg
                                  className="w-6 h-6 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7"
                                  />
                                </svg>
                              </div>
                              <p className="font-medium">
                                No submissions found
                              </p>
                              <p className="text-sm mt-1">
                                Try selecting a different subject and level
                                combination.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
        {view === "student" && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              View Student Progress
            </h3>
            <form
              onSubmit={handleStudentSearch}
              className="flex flex-col sm:flex-row gap-3 items-end mb-6">
              <div className="flex-1 w-full">
                <TextInput
                  label="Enter Student Username"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  placeholder="e.g., student1"
                />
              </div>
              <Button
                type="submit"
                disabled={isStudentLoading || !searchUsername}
                variant="primary"
                className="whitespace-nowrap py-3.5"
              >
                {isStudentLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Search
                  </span>
                )}
              </Button>
            </form>
            {studentError && (
              <Alert type="error" message={studentError} className="mb-4" />
            )}
            {isStudentLoading && <Spinner />}
            {studentData && (
              <StudentSubmissionDetail
                username={searchUsername}
                submissions={studentData}
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const tabs = {
    users: {
      label: "User Management",
      component: <UserManagement />,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
    },
    questions: {
      label: "Question Management",
      component: <QuestionManagement />,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    subjects: {
      label: "Subject Management",
      component: <SubjectManagement />,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    submissions: {
      label: "Submissions",
      component: <SubmissionsViewer />,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">
            Manage users, questions, subjects, and view submissions
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg p-1 shadow-sm border border-slate-200 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {Object.entries(tabs).map(([key, {label, icon}]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === key
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300 ease-in-out">
          {tabs[activeTab].component}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
