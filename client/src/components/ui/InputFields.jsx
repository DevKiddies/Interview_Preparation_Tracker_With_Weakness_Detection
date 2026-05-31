function InputField({ label, id, name, type = "text", placeholder, value, onChange, Icon, children }) {
  return (
    <div className="flex flex-col items-start mt-2 w-full">
      <label htmlFor={id} className="text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <div className="relative flex items-center w-full">
        {Icon && <Icon size={14} className="absolute left-3 text-gray-400" />}
        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          className="border border-gray-300 rounded-lg py-2 pl-9 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs leading-none"
        />
        {/* children allows us to cleanly inject the custom show/hide password toggle button if needed */}
        {children}
      </div>
    </div>
  );
}

export default InputField;