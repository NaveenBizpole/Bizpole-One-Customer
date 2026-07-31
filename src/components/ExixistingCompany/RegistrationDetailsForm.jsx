import React, { useState } from "react";

const QUESTIONS = [
  { name: "iecEnabled", label: "DO YOU HAVE IE CODE?" },
  { name: "fssaiEnabled", label: "DO YOU HAVE FSSAI?" },
  { name: "esiEnabled", label: "DO YOU HAVE ESI REGISTRATION?" },
  { name: "pfEnabled", label: "DO YOU HAVE EPF REGISTRATION?" },
  { name: "tdsEnabled", label: "DO YOU FILE TDS RETURNS?" },
];

const RegistrationDetailsForm = ({ onNext, onBack, initialData }) => {
  // Controlled state for this step's fields - all optional, nothing mandatory
  const [form, setForm] = useState({
    iecEnabled: "",
    fssaiEnabled: "",
    esiEnabled: "",
    pfEnabled: "",
    tdsEnabled: "",
    ...initialData,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (onNext) onNext(form);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Header with Logo - Mobile/Tablet */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Registration Status</h1>
        <img src="/Images/logo.webp" alt="Bizpole Logo" className="h-12 md:h-14 lg:h-14" />
      </div>

      {/* Left Section */}
      <div className="flex-1 p-4 sm:p-8 md:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header with Logo - Desktop */}
          <div className="hidden lg:flex justify-between items-center mb-10">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Registration Status (For Compliance Calendar)</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-20 bg-yellow-400 rounded-full"></div>
                <span className="text-xs text-gray-500">Step 3 of 4</span>
              </div>
            </div>
            <img src="/Images/logo.webp" alt="Bizpole Logo" className="h-12 md:h-14 lg:h-14" />
          </div>

          {/* Mobile Header Progress */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 bg-yellow-400 rounded-full"></div>
              <span className="text-xs text-gray-500">Step 3 of 4</span>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-8">
            {QUESTIONS.map((q) => (
              <div key={q.name}>
                <label className="block mb-2 text-sm font-bold text-gray-700 tracking-wide">
                  {q.label}
                </label>
                <select
                  name={q.name}
                  value={form[q.name]}
                  onChange={handleChange}
                  className="w-full border-2 border-yellow-400 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            ))}
          </div>

          {/* Bottom Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center border-2 border-yellow-400 rounded-full text-yellow-500 hover:bg-yellow-50 transition-all"
              title="Back"
              type="button"
            >
              ←
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 accent-yellow-400" />
                <span className="text-xs text-gray-600">Remind me later!</span>
              </label>

              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-3 rounded-full flex items-center gap-1.5 transition-all shadow-sm hover:shadow text-sm"
                onClick={handleNext}
                title="Next"
                type="button"
              >
                Next »
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Timeline Stepper */}
      <div className="hidden lg:block w-80 bg-gradient-to-b from-yellow-400 to-yellow-500 text-white p-6 rounded-tl-3xl rounded-bl-3xl">
        <div className="sticky top-6">
          <h2 className="font-bold text-lg mb-1 text-center">Quick Setup</h2>
          <p className="text-yellow-100 text-xs mb-8 text-center">Complete these 4 steps</p>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-yellow-300"></div>

            {/* Step 1 - Completed */}
            <div className="relative flex items-center gap-3 mb-8">
              <div className="w-6 h-6 bg-white text-yellow-500 rounded-full flex items-center justify-center font-bold text-xs z-10 shadow flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Company Information</h3>
                <p className="text-yellow-100 text-xs">Completed</p>
              </div>
            </div>

            {/* Step 2 - Completed */}
            <div className="relative flex items-center gap-3 mb-8">
              <div className="w-6 h-6 bg-white text-yellow-500 rounded-full flex items-center justify-center font-bold text-xs z-10 shadow flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Director/Promoter Details</h3>
                <p className="text-yellow-100 text-xs">Completed</p>
              </div>
            </div>

            {/* Step 3 - Current */}
            <div className="relative flex items-center gap-3 mb-8">
              <div className="w-6 h-6 bg-white text-yellow-500 rounded-full flex items-center justify-center font-bold text-xs z-10 shadow flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-sm text-white">Registration Status</h3>
                <p className="text-yellow-100 text-xs">Company & tax registrations</p>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full mt-0.5 inline-block">Current</span>
              </div>
            </div>

            {/* Step 4 - Upcoming */}
            <div className="relative flex items-center gap-3">
              <div className="w-6 h-6 bg-white/30 text-white rounded-full flex items-center justify-center font-bold text-xs z-10 shadow flex-shrink-0">4</div>
              <div>
                <h3 className="font-semibold text-sm text-white/80">Compliance</h3>
                <p className="text-yellow-100/80 text-xs">Final verification & documents</p>
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="mt-10 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex justify-between mb-1 text-xs text-white">
              <span>Overall Progress</span>
              <span className="font-bold">75%</span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-white rounded-full"></div>
            </div>
            <p className="text-xs text-yellow-100 mt-2 text-center">One more step to finish.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDetailsForm;
