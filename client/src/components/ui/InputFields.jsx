import React from "react";

function InputField({ label, id, name, type = "text", placeholder, value, onChange, Icon, children }) {
  return (
    <div className="flex flex-col items-start mt-2 w-full">
      <label htmlFor={id} className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
        {label}
      </label>

      <div className="relative flex items-center w-full">
        {Icon && <Icon size={14} className="absolute left-3 text-gray-400 dark:text-slate-500" />}

        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          className="border border-gray-300 dark:border-slate-600 rounded-lg py-2 pl-9 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-all text-xs leading-none"
        />

        {children}
      </div>
    </div>
  );
}

export default InputField;
