function InputField({ label, id, name, type = "text", placeholder, value, onChange, Icon, children }) {
  return (
    <div className="flex flex-col items-start mt-2 w-full">
      <label htmlFor={id} className="text-xs mb-1">{label}</label>
      <div className="relative w-full">
        {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1 text-gray-400" />}
        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          className="border border-gray-300 rounded-lg py-1.5 pl-9 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
        />
        {/* children allows us to cleanly inject the custom show/hide password toggle button if needed */}
        {children}
      </div>
    </div>
  );
}

export default InputField;