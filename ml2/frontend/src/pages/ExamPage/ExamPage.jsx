// components/ExamPage/ExamPage.jsx
import React, {useState, useEffect, useContext, useCallback} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {AuthContext} from "../../App";
import Spinner from "../Spinner/Spinner";
import Editor from "@monaco-editor/react";
import {v4 as uuidv4} from "uuid";
import ReactMarkdown from "react-markdown";
import UserProfileModal from "../../components/UserProfileModal/UserProfileModal";
import userpng from "../../assets/userPS.png";

// --- AlertCard Component (New) ---
const AlertCard = ({message, onConfirm, onCancel, showCancel = false}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel || onConfirm} // Close if clicking outside for simple alerts
    >
      <div
        className="bg-white rounded-lg shadow-xl p-8 max-w-sm mx-auto text-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
      >
        <p className="text-lg font-semibold text-gray-800 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          {showCancel && (
            <button
              className="px-6 py-2 rounded-md font-semibold text-gray-700 bg-gray-200 "
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            className="px-6 py-2 rounded-md font-semibold text-white bg-[#7D53F6] "
            onClick={onConfirm}
          >
            {showCancel ? "Continue" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- CodeCell Component (Modified for new layout and height control) ---
const CodeCell = ({
  question,
  subject,
  level,
  cellCode,
  onCodeChange,
  onRun,
  onValidate,
  cellResult,
  isExecuting,
  isValidated,
  customInput,
  onCustomInputChange,
  isCustomInputEnabled,
  onToggleCustomInput,
  showValidationResults = false,
}) => {
  const firstTestCase = question.test_cases?.[0] || {
    input: "",
    expected_output: "",
  };

  const showExampleTestCase = !(
    (subject === "ml" && level === "1") ||
    (subject === "ds" && level === "2") ||
    (subject === "Speech Recognition" && level === "1")
  );

  return (
    <div className="flex flex-col md:flex-row h-full w-full p-4 overflow-hidden">
      {/* Left Pane: Question Description, Example, and Validation Results */}
      <div className="flex-1 bg-white rounded-lg p-6 mr-4 mb-4 md:mb-0 border border-gray-200 overflow-y-auto">
        {isValidated && (
          <span
            className="float-right text-2xl -mt-2 -mr-2 text-green-500"
            title="All test cases passed"
          >
            &#10003;
          </span>
        )}
        <div className="prose prose-slate max-w-none text-gray-800 leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {question.title}
          </h2>
          <ReactMarkdown>{question.description || ""}</ReactMarkdown>
        </div>

        {showExampleTestCase && (
          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h4 className="font-semibold text-slate-800 text-lg mb-3">
              Example
            </h4>
            <p className="font-medium text-slate-700 mb-2">Input:</p>
            <pre className="bg-white rounded-md p-3 text-sm font-mono whitespace-pre-wrap break-words border border-slate-300">
              {firstTestCase.input || "(No Input)"}
            </pre>
            <p className="mt-4 font-medium text-slate-700 mb-2">
              Expected Output:
            </p>
            <pre className="bg-white rounded-md p-3 text-sm font-mono whitespace-pre-wrap break-words border border-slate-300">
              {firstTestCase.output || "(No Expected Output)"}
            </pre>
          </div>
        )}

        {/* Always show Validation Results if showValidationResults is true */}
        {showValidationResults && (
          <div className="mt-8 font-medium">
            <h4 className="text-slate-800 text-lg mb-3">
              Hidden Test Cases
              {cellResult?.test_results && cellResult.test_results.length > 0
                ? ` (${cellResult.test_results.filter(Boolean).length}/${
                    cellResult.test_results.length
                  } passed)`
                : ""}
            </h4>
            {cellResult?.test_results && cellResult.test_results.length > 0 ? (
              cellResult.test_results.map((passed, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 mb-3 rounded-lg border text-base ${
                    passed
                      ? "bg-green-50 text-green-700 border-green-300"
                      : "bg-red-50 text-red-700 border-red-300"
                  }`}
                >
                  {`Test Case ${i + 1}: ${passed ? "Passed ✔" : "Failed ❌"}`}
                </div>
              ))
            ) : cellResult?.test_results ? (
              // If test_results exists but is empty (e.g., validation failed early)
              <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-lg border bg-yellow-50 text-yellow-700 border-yellow-300 text-base">
                No specific validation tests run for this submission.
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-lg border bg-gray-50 text-gray-700 border-gray-300 text-base">
                Please submit your code
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Pane: Code Editor, Controls, and Output */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden">
        {/* Code Editor */}
        <div className="flex-grow min-h-[200px] max-h-[70%]">
          {" "}
          {/* Added min-h and max-h for editor */}
          <Editor
            height="100%" // Ensure editor takes full available height
            language="python"
            theme="vs-dark"
            value={cellCode}
            onChange={(value) => onCodeChange(value || "")} // Directly pass value
            options={{
              minimap: {enabled: false},
              fontSize: 14,
              scrollBeyondLastLine: false,
              wordWrap: "on",
              padding: {top: 15},
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-start items-center flex-wrap gap-4 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            className="px-6 py-2 rounded-md font-semibold text-white bg-[#7D53F6]"
            onClick={onRun}
            disabled={isExecuting}
          >
            {isExecuting ? "Running..." : "Run Code"}
          </button>
          <button
            className="px-6 py-2 rounded-md font-semibold text-[#7D53F6] border border-[#7D53F6] bg-white"
            onClick={onValidate}
            disabled={isExecuting}
          >
            {isExecuting ? "Submitting..." : "Submit"}
          </button>
        </div>

        {/* Custom Input Toggle and Area */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white">
          <label className="flex items-center gap-2 text-slate-700 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={isCustomInputEnabled || false}
              onChange={onToggleCustomInput}
              className="form-checkbox h-4 w-4 text-indigo-600 rounded  transition duration-150 ease-in-out"
            />
            Test with Custom Input
          </label>
          {/* Custom Input Textarea - Height controlled by CSS and conditional classes */}
          <textarea
            className={`w-full mt-3 p-3 border border-slate-300 rounded-md bg-white font-mono text-slate-700 text-sm resize-y min-h-[50px]
            focus:outline-none transition-all duration-200 ease-in-out
            ${
              isCustomInputEnabled
                ? "max-h-[150px] opacity-100"
                : "max-h-[0px] p-0 border-none opacity-0 invisible"
            }`} // Shrink/hide when disabled
            value={customInput}
            onChange={(e) => onCustomInputChange(e.target.value)} // Directly pass value
            placeholder="Enter your custom input here, one line per input() call."
            rows={isCustomInputEnabled ? 4 : 0} // Only suggest rows when enabled
            aria-hidden={!isCustomInputEnabled}
            tabIndex={isCustomInputEnabled ? 0 : -1}
          />
        </div>

        {/* Output/Error Display */}
        {cellResult &&
          (cellResult.stdout !== undefined ||
            cellResult.stderr !== undefined) && (
            <div className="px-6 py-4 bg-white border-t border-slate-200">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-sm max-h-48 overflow-auto">
                {cellResult.stdout && (
                  <>
                    <p className="font-semibold text-slate-800 mb-2">Output:</p>
                    <pre className=" text-slate-800 rounded p-3 font-mono whitespace-pre-wrap break-words border border-indigo-200">
                      {cellResult.stdout}
                    </pre>
                  </>
                )}
                {cellResult.stderr && (
                  <>
                    <p className="font-semibold text-red-600 mt-3 mb-2">
                      Error:
                    </p>
                    <pre className="bg-red-50 text-red-600 rounded p-3 font-mono whitespace-pre-wrap break-words border border-red-200">
                      {cellResult.stderr}
                    </pre>
                  </>
                )}
                {cellResult.stdout === "" && !cellResult.stderr && (
                  <pre className="text-slate-600">No output produced.</pre>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

// --- Main ExamPage Component ---
const ExamPage = () => {
  const {subject, level} = useParams();
  const navigate = useNavigate();
  const {user, updateUserSession} = useContext(AuthContext);

  const [questions, setQuestions] = useState([]);
  const [mainTask, setMainTask] = useState(null);
  const [allCode, setAllCode] = useState({});
  const [cellResults, setCellResults] = useState({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationStatus, setValidationStatus] = useState({}); // true for all passed, false for some failed, undefined/null for not validated
  const [sessionId, setSessionId] = useState(null);
  const [customInputs, setCustomInputs] = useState({});
  const [isCustomInputEnabled, setIsCustomInputEnabled] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // New state for current question

  // Alert State
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info"); // 'info', 'confirm'
  const [alertOnConfirm, setAlertOnConfirm] = useState(() => () => {});
  const [alertOnCancel, setAlertOnCancel] = useState(() => () => {});
  const [isOpen, setIsOpen] = useState(false);
  // Function to show custom alerts
  const displayAlert = useCallback(
    (message, type = "info", onConfirm = () => {}, onCancel = () => {}) => {
      setAlertMessage(message);
      setAlertType(type);
      setAlertOnConfirm(() => {
        return () => {
          setShowAlert(false);
          onConfirm();
        };
      });
      setAlertOnCancel(() => {
        return () => {
          setShowAlert(false);
          onCancel();
        };
      });
      setShowAlert(true);
    },
    []
  );

  // Initialize session
  useEffect(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    const startUserSession = async () => {
      try {
        await fetch("http://localhost:3001/api/evaluate/session/start", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({sessionId: newSessionId}),
        });
        // console.log("Kernel session started:", newSessionId);
      } catch (error) {
        console.error("Failed to start kernel session:", error);
        displayAlert(
          "Error: Could not connect to the code execution server. Please refresh the page.",
          "info"
        );
      }
    };
    startUserSession();
  }, [displayAlert]);

  // Fetch questions
  useEffect(() => {
    if (!sessionId) return;
    const fetchAndPrepareQuestions = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/questions/${subject}/${level}`
        );
        let data = await res.json();

        if (!Array.isArray(data)) data = [data];

        // Specific handling for 'ds' level 1 for now, adjust as per your backend logic
        if (subject === "ds" && level === "1") {
          setQuestions(data);
          const initialCode = {};
          data.forEach((q) => {
            initialCode[q.id] = q.starter_code || "";
          });
          setAllCode(initialCode);
        } else {
          // General handling for multi-part questions or single questions
          const shuffled = data.sort(() => 0.5 - Math.random()); // Shuffling is kept, consider if needed for multi-part exams
          let selectedQuestions = [];
          const task = shuffled[0]; // Assuming the first item is the main task

          const descriptionSections = (task.description || "").split(
            /\n\n---\n\n/
          );
          const introDescription = descriptionSections.shift() || "";

          setMainTask({...task, description: introDescription});

          if (task.parts && Array.isArray(task.parts)) {
            selectedQuestions = task.parts.map((part, index) => ({
              id: `${task.id}_${part.part_id}`, // Unique ID for each part
              taskId: task.id, // Reference to main task ID
              partId: part.part_id, // Specific part ID
              title: `Part ${part.part_id.replace(/_/g, " ")}`,
              ...part,
              description: descriptionSections[index] || part.description,
              test_cases: part.test_cases,
              starter_code: part.starter_code,
            }));
          } else {
            selectedQuestions = [task]; // If no parts, it's a single question exam
          }

          setQuestions(selectedQuestions);

          const initialCode = {};
          selectedQuestions.forEach((q) => {
            initialCode[q.id] = q.starter_code || "";
          });
          setAllCode(initialCode);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        displayAlert(
          "Failed to load exam questions. Please try again.",
          "info"
        );
      }
    };

    fetchAndPrepareQuestions();
  }, [subject, level, sessionId, displayAlert]);

  // Handlers
  const handleCodeChange = (questionId, newCode) => {
    setAllCode((prev) => ({...prev, [questionId]: newCode}));
    // When code changes, invalidate previous validation status
    setValidationStatus((prev) => ({...prev, [questionId]: undefined}));
    setCellResults((prev) => ({...prev, [questionId]: null})); // Clear results on code change
  };

  const handleCustomInputChange = (questionId, value) => {
    setCustomInputs((prev) => ({...prev, [questionId]: value}));
  };

  const handleToggleCustomInput = (questionId) => {
    setIsCustomInputEnabled((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleRunCell = async (questionId) => {
    if (!sessionId) {
      displayAlert(
        "Session is not initialized. Please refresh the page.",
        "info"
      );
      return;
    }
    if (!user || !user.username) {
      displayAlert("User information not found. Please log in again.", "info");
      return;
    }

    setIsExecuting(true);
    setCellResults((prev) => ({...prev, [questionId]: null})); // Clear previous results

    const question = questions.find((q) => q.id === questionId);
    const cellCode = allCode[questionId] || "pass";

    const useDefaultInput = !isCustomInputEnabled[questionId];
    const userInput = useDefaultInput
      ? question.test_cases?.[0]?.input || ""
      : customInputs[questionId] || "";

    try {
      const res = await fetch("http://localhost:3001/api/evaluate/run", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          sessionId,
          cellCode,
          userInput,
          username: user.username,
          subject,
          level,
          questionId: question.taskId || question.id,
          partId: question.partId || null,
        }),
      });
      const result = await res.json();
      setCellResults((prev) => ({
        ...prev,
        [questionId]: {
          stdout: result.stdout,
          stderr: result.stderr,
          test_results: null, // Clear test results when running
        },
      }));
      // If run is successful, it's 'attended', but not necessarily passed all tests
      if (!result.stderr && validationStatus[questionId] === undefined) {
        setValidationStatus((prev) => ({
          ...prev,
          [questionId]: false, // Mark as attempted but not all passed
        }));
      }
    } catch (error) {
      console.error("Run Code Error:", error);
      setCellResults((prev) => ({
        ...prev,
        [questionId]: {
          stderr: "Failed to connect to the execution server or server error.",
          test_results: null,
        },
      }));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleValidateCell = async (questionId) => {
    if (!sessionId) {
      displayAlert(
        "Session is not initialized. Please refresh the page.",
        "info"
      );
      return;
    }
    if (!user || !user.username) {
      displayAlert("User information not found. Please log in again.", "info");
      return;
    }

    setIsExecuting(true);
    setCellResults((prev) => ({...prev, [questionId]: null})); // Clear previous results

    const cellCode = allCode[questionId] || "pass";

    try {
      const question = questions.find((q) => q.id === questionId);

      const res = await fetch("http://localhost:3001/api/evaluate/validate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          sessionId,
          username: user.username,
          subject,
          level,
          questionId: question.taskId || question.id,
          partId: question.partId || null,
          cellCode,
        }),
      });

      const data = await res.json();
      setCellResults((prev) => ({
        ...prev,
        [questionId]: {
          test_results: data.test_results,
          stdout: data.stdout,
          stderr: data.stderr,
        }, // Store all results
      }));

      if (data.test_results && data.test_results.length > 0) {
        const allPassed = data.test_results.every((p) => p === true);
        setValidationStatus((prev) => ({...prev, [questionId]: allPassed}));
      } else {
        // If no test results or validation explicitly fails, it's not all passed
        setValidationStatus((prev) => ({...prev, [questionId]: false}));
      }
    } catch (error) {
      console.error("Submission Error:", error);
      setCellResults((prev) => ({
        ...prev,
        [questionId]: {
          stderr: "Submission failed to connect to the server or server error.",
          test_results: null,
        },
      }));
      setValidationStatus((prev) => ({...prev, [questionId]: false})); // Mark as failed on error
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitExam = useCallback(async () => {
    setIsSubmitting(true);
    console.log("Submitting exam...");
    const allQuestionsPassed =
      questions.length > 0 && questions.every((q) => validationStatus[q.id]);
    const answers = questions.map((q) => ({
      questionId: q.taskId || q.id, // Use taskId for main questions, or id for individual parts
      partId: q.partId || null,
      code: allCode[q.id] || "",
      passed: !!validationStatus[q.id],
    }));

    try {
      const res = await fetch("http://localhost:3001/api/evaluate/submit", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          sessionId,
          username: user.username,
          subject,
          level,
          answers,
          allPassed: allQuestionsPassed,
        }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.updatedUser) {
          updateUserSession(data.updatedUser);
          displayAlert(
            "Congratulations! You passed the level. The next level is unlocked.",
            "info",
            () => navigate(`/dashboard`)
          );
        } else {
          displayAlert(
            "Submission received. You did not pass all questions, so the next level remains locked. You can review your submissions on the dashboard.",
            "info",
            () => navigate(`/dashboard`)
          );
        }
      } else {
        throw new Error(data.message || "Submission failed.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      displayAlert(
        `An error occurred during submission: ${error.message}`,
        "info"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    questions,
    allCode,
    user,
    subject,
    level,
    navigate,
    updateUserSession,
    sessionId,
    validationStatus,
    displayAlert,
  ]);

  const attemptSubmit = () => {
    const confirmationMessage =
      "You are about to submit your final answers for this exam. This action cannot be undone. Do you want to continue?";

    displayAlert(
      confirmationMessage,
      "confirm",
      handleSubmitExam
      // () => console.log("Submission cancelled.") // Optional: log cancellation
    );
  };

  if (!questions.length && !mainTask) return <Spinner />;

  const currentQuestion = questions[currentQuestionIndex];
  // const totalQuestions = questions.length; // Not directly used but good for context

  const getQuestionBoxColor = (questionId, index) => {
    const validated = validationStatus[questionId]; // true for all passed, false for some failed, undefined for not validated
    const codePresent = !!allCode[questionId];

    let baseColor = "bg-gray-400"; // Default: Not attended (no code, no validation)

    if (validated === true) {
      baseColor = "bg-green-500"; // All test cases passed - GREEN
    } else if (
      validated === false ||
      (codePresent && validated === undefined)
    ) {
      baseColor = "bg-blue-500"; // Attended but not all passed, or code present but not yet validated - BLUE
    }

    if (index === currentQuestionIndex) {
      return "bg-[#6A42E0] text-white"; // Current question - PURPLE
    }

    return baseColor;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="flex sticky top-0 z-10 items-center min-h-[70px] px-4 bg-white border-b border-gray-200">
        <div className="ml-2 px-2 mr-2 items-center content-center rounded-md bg-gray-100 h-[55px]">
          <h4 className="font-bold text-lg text-slate-800">
            {subject.charAt(0).toUpperCase() + subject.slice(1)} Exam - Level{" "}
            {level}
          </h4>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="lg:w-[250px] mt-1 w-[50px] sm:w-20 mr-4 h-[55px] justify-start rounded-md flex items-center gap-3 bg-gray-100"
        >
          {/* Avatar */}
          <div className="flex justify-center items-center w-full lg:w-[50px] h-full">
            <img
              src={userpng}
              alt="user"
              className="w-10 h-10 rounded-full object-cover items-center"
            />
          </div>

          {/* ID + Name (hidden on small screens) */}
          <div className="hidden lg:flex py-4 flex-col text-left">
            <span className="text-[13px] mb-0.5 font-medium text-gray-800">
              {user?.rollno ? user.rollno : "-----------"}
            </span>
            <span className="text-[16px] font-semibold text-gray-900">
              {user?.username?.toUpperCase()}
            </span>
          </div>
        </button>
        <div className="flex-grow"></div> {/* Spacer to push button to right */}
        <button
          className="px-8 py-2 rounded-lg font-semibold text-white bg-red-500 
                      disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
          onClick={attemptSubmit}
          disabled={isSubmitting}
          title="Submit your final answers for grading"
        >
          Finish Now
        </button>
      </header>

      <div className="flex flex-grow min-h-0">
        {/* Left Sidebar for Question Navigation */}
        <div className="w-[180px] flex-shrink-0 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h3 className="text-xl font-bold mb-5 text-slate-800">Questions</h3>
          <div className="grid grid-cols-2 gap-3">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`flex items-center justify-center w-16 h-16 rounded-lg text-white font-bold text-xl 
                  ${getQuestionBoxColor(q.id, index)}
                  transform `}
                title={`Question ${index + 1}: ${q.title || "Untitled"}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="bg-white min-h-0 max-w-[200px] mt-8 p-4 rounded-2xl shadow-lg border border-gray-100">
            <div className="space-y-2">
              {/* Current Question */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-[#7D53F6] rounded-sm flex-shrink-0 shadow-sm"></div>
                <span className="text-xs font-semibold text-gray-800 leading-tight">
                  Current Question
                </span>
              </div>

              {/* Attended */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-emerald-500 rounded-sm flex-shrink-0 shadow-sm"></div>
                <span className="text-xs font-semibold text-gray-800 leading-tight">
                  Attended All Cases Passed
                </span>
              </div>

              {/* Attended Not Passed */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-sky-400 rounded-sm flex-shrink-0 shadow-sm"></div>
                <span className="text-xs font-semibold text-gray-800 leading-tight">
                  Attended Not Passed
                </span>
              </div>

              {/* Not Attended */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-slate-400 rounded-sm flex-shrink-0 shadow-sm"></div>
                <span className="text-xs font-semibold text-gray-800 leading-tight">
                  Not Attended
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Split into two panes for question and code */}
        <main className="flex-grow flex flex-col min-h-0 bg-gray-50 overflow-auto">
          {currentQuestion ? (
            <div className="flex flex-grow w-full">
              {" "}
              {/* This div wraps CodeCell */}
              <CodeCell
                key={currentQuestion.id} // Ensure key changes when question changes for full re-render if needed
                question={currentQuestion}
                subject={subject}
                level={level}
                cellCode={allCode[currentQuestion.id] || ""}
                onCodeChange={(value) =>
                  handleCodeChange(currentQuestion.id, value)
                }
                onRun={() => handleRunCell(currentQuestion.id)}
                onValidate={() => handleValidateCell(currentQuestion.id)}
                cellResult={cellResults[currentQuestion.id]}
                isExecuting={isExecuting || isSubmitting}
                isValidated={validationStatus[currentQuestion.id]}
                customInput={customInputs[currentQuestion.id] || ""}
                onCustomInputChange={(value) =>
                  handleCustomInputChange(currentQuestion.id, value)
                }
                isCustomInputEnabled={
                  !!isCustomInputEnabled[currentQuestion.id]
                }
                onToggleCustomInput={() =>
                  handleToggleCustomInput(currentQuestion.id)
                }
                showValidationResults={true} // Always show validation results
              />
            </div>
          ) : (
            <div className="flex flex-grow items-center justify-center">
              <Spinner />
            </div>
          )}
        </main>
      </div>
      <UserProfileModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
      />

      {/* Alert Card Render */}
      {showAlert && (
        <AlertCard
          message={alertMessage}
          onConfirm={alertOnConfirm}
          onCancel={alertOnCancel}
          showCancel={alertType === "confirm"}
        />
      )}
    </div>
  );
};

export default ExamPage;
