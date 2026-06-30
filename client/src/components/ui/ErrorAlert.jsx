// ErrorAlert.jsx — inline error banner used below form headers.
// Returns nothing when message is empty so callers don't need
// to conditionally render it themselves.

function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs p-2.5 rounded-lg w-full mb-4 text-left border border-red-200 dark:border-red-800/50 font-normal">
      {message}
    </div>
  );
}

export default ErrorAlert;
