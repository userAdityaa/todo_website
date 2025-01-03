const DateSelectionModal = ({
    isOpen,
    onClose,
    onSave,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: "today" | "tomorrow" | "thisWeek") => void;
  }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-4 rounded-lg w-80">
          <h2 className="text-lg font-semibold mb-4">Select Due Date</h2>
          <div className="flex flex-col space-y-3">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => onSave("today")}
            >
              Today
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => onSave("tomorrow")}
            >
              Tomorrow
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => onSave("thisWeek")}
            >
              This Week
            </button>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-gray-300 text-black rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  export default DateSelectionModal;