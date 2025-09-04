// SharedComponents.js
// These are reusable components used across multiple tabs. Import them where needed.

import React from "react";

// Enhanced Spinner component
export const Spinner = () => (
  <div className="flex justify-center items-center p-12">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
    </div>
  </div>
);

// Enhanced Select Component (Modified UI: Changed arrow color to purple, increased padding, added subtle background gradient for better look, improved disabled state visibility)
export const SelectInput = ({
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
          className="w-full p-4 pr-12 border border-slate-300 rounded-xl text-base bg-gradient-to-b from-white to-slate-50 text-slate-800
            transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400
            disabled:opacity-50 disabled:cursor-not-allowed appearance-none shadow-md hover:shadow-lg"
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
            className="w-6 h-6 text-purple-500 transition-colors duration-200 group-hover:text-purple-600"
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
export const TextInput = ({
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
export const TextareaInput = ({
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
export const Button = ({
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
export const Alert = ({type, message, className = ""}) => {
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
export const Card = ({title, children, className = ""}) => {
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
export const CSVUploader = ({
  title,
  endpoint,
  templateName,
  onUploadComplete,
}) => {
  const [file, setFile] = React.useState(null);
  const [message, setMessage] = React.useState({type: "", text: ""});
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);

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
