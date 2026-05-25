// src/components/ui/ErrorAlert.jsx
function ErrorAlert({ message }) {
  if (!message) return null;
  
  return (
    <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-lg w-full mb-4 text-left border border-red-200 font-normal">
      {message}
    </div>
  );
}

export default ErrorAlert;