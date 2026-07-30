import React, { useState } from "react";
import { upsertRegistrationStatus } from "../../api/CompanyApi";
import { useNavigate } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const ComplianceStatusCheck = ({ onBack, registrationDetails }) => {
  const navigate = useNavigate();

  // Speech recognition hook
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // Controlled state for this step's fields
  const [form, setForm] = useState({
    businessUnderstanding: "",
    expectations: "",
    gstReturnsUpToDate: "",
    gstReturnsDetails: "",
    rocFilingYear: "",
    itReturnYear: "",
    booksUpToDate: "",
    hasAuditor: "",
  });

  const [activeField, setActiveField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Speech recognition handlers
  const handleMicClick = (field) => {
    setActiveField(field);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
  };

  const handleStop = () => {
    SpeechRecognition.stopListening();
    if (activeField === "business") {
      setForm((prev) => ({
        ...prev,
        businessUnderstanding: prev.businessUnderstanding + (prev.businessUnderstanding ? " " : "") + transcript
      }));
    } else if (activeField === "expectation") {
      setForm((prev) => ({
        ...prev,
        expectations: prev.expectations + (prev.expectations ? " " : "") + transcript
      }));
    }
    setActiveField(null);
  };

  const handleFinish = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const complianceData = {
        ...form,
        gstReturnsDetails: form.gstReturnsUpToDate === "yes" ? form.gstReturnsDetails : "",
      };

      // Merge Step 3's registration details with this step's compliance data
      const mergedStatus = {
        ...(registrationDetails || {}),
        ...complianceData
      };

      // Get CompanyID from secureStorage/localStorage and ensure it's a number
      let CompanyID = null;
      try {
        CompanyID = window.localStorage.getItem("CompanyId");
      } catch (err) {
        console.log("❌ Error getting CompanyID from localStorage", err);
      }
      if (!CompanyID && typeof window !== "undefined") {
        try {
          CompanyID = window.sessionStorage.getItem("CompanyId");
        } catch (err) {
          console.log("❌ Error getting CompanyID from sessionStorage", err);
        }
      }
      if (CompanyID) {
        CompanyID = Number(CompanyID);
      }

      const payload = {
        CompanyID,
        registrationStatus: mergedStatus
      };

      const response = await upsertRegistrationStatus(payload);
      console.log("✅ Registration & compliance status saved successfully:", response);

      // ✅ Navigate to dashboard after successful submission
      navigate("/", { state: { openSigninModal: true } });
    } catch (err) {
      console.error("❌ Error saving registration status:", err);
      setError(err.response?.data?.message || "Failed to save compliance information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">Your browser does not support Speech Recognition.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Header with Logo - Mobile/Tablet */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Compliance Status</h1>
        <img
          src="/Images/logo.webp"
          alt="Bizpole Logo"
          className="h-12 md:h-14 lg:h-14"
        />
      </div>

      {/* Left Section */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header with Logo - Desktop */}
          <div className="hidden lg:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Compliance Status Check</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-20 bg-yellow-400 rounded-full"></div>
                <span className="text-xs text-gray-500">Step 4 of 4</span>
              </div>
            </div>
            <img
              src="/Images/logo.webp"
              alt="Bizpole Logo"
              className="h-12 md:h-14 lg:h-14"
            />
          </div>

          {/* Mobile Header Progress */}
          <div className="lg:hidden mb-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 bg-yellow-400 rounded-full"></div>
              <span className="text-xs text-gray-500">Step 4 of 4</span>
            </div>
          </div>

          {/* Main Form */}
          <div className="space-y-6" style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto", paddingRight: "8px" }}>
            {/* ================= FILING & RETURN STATUS ================= */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h4 className="font-semibold text-base mb-4 border-b border-gray-100 pb-2 text-gray-700">
                Filing & Return Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* GST Returns Up to Date */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">
                    Are GST returns up to date?
                  </label>
                  <select
                    name="gstReturnsUpToDate"
                    value={form.gstReturnsUpToDate}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  >
                    <option value="">Select Option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="na">NA</option>
                  </select>
                </div>

                {/* GST Returns Details - Conditional */}
                {form.gstReturnsUpToDate === "yes" && (
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-600">
                      GST Return Details
                    </label>
                    <input
                      type="text"
                      name="gstReturnsDetails"
                      value={form.gstReturnsDetails}
                      onChange={handleChange}
                      placeholder="e.g. Filed up to June 2026"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                    />
                  </div>
                )}

                {/* ROC Filing */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">
                    Is ROC filing current?
                  </label>
                  <input
                    type="text"
                    name="rocFilingYear"
                    value={form.rocFilingYear}
                    onChange={handleChange}
                    placeholder="Financial year of last ROC return"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  />
                </div>

                {/* IT Return */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">
                    Is IT return up to date?
                  </label>
                  <input
                    type="text"
                    name="itReturnYear"
                    value={form.itReturnYear}
                    onChange={handleChange}
                    placeholder="Financial year of last IT return"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  />
                </div>

                {/* Books of Accounts */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">
                    Books of accounts up to date?
                  </label>
                  <select
                    name="booksUpToDate"
                    value={form.booksUpToDate}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  >
                    <option value="">Select Option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="na">NA</option>
                  </select>
                </div>

                {/* Auditor */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">
                    Do you have an auditor?
                  </label>
                  <select
                    name="hasAuditor"
                    value={form.hasAuditor}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  >
                    <option value="">Select Option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="na">NA</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ================= BUSINESS UNDERSTANDING ================= */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h4 className="font-semibold text-base mb-4 border-b border-gray-100 pb-2 text-gray-700">
                Business Understanding
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tell Us More */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">
                    Tell us more about your business
                  </label>
                  <div className="relative">
                    <textarea
                      rows={4}
                      name="businessUnderstanding"
                      value={form.businessUnderstanding}
                      onChange={handleChange}
                      placeholder="Describe your business..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                    ></textarea>
                    <button
                      type="button"
                      onClick={
                        listening && activeField === "business"
                          ? handleStop
                          : () => handleMicClick("business")
                      }
                      className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition ${
                        listening && activeField === "business"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-yellow-400 hover:bg-yellow-500"
                      }`}
                      title={
                        listening && activeField === "business"
                          ? "Stop Recording"
                          : "Start Recording"
                      }
                    >
                      🎤
                    </button>
                  </div>
                  {listening && activeField === "business" && (
                    <p className="text-xs text-green-600 mt-1">Listening... {transcript}</p>
                  )}
                </div>

                {/* Expectation */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">
                    What is your expectation from Bizpole?
                  </label>
                  <div className="relative">
                    <textarea
                      rows={4}
                      name="expectations"
                      value={form.expectations}
                      onChange={handleChange}
                      placeholder="Tell us what you expect..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                    ></textarea>
                    <button
                      type="button"
                      onClick={
                        listening && activeField === "expectation"
                          ? handleStop
                          : () => handleMicClick("expectation")
                      }
                      className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition ${
                        listening && activeField === "expectation"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-yellow-400 hover:bg-yellow-500"
                      }`}
                      title={
                        listening && activeField === "expectation"
                          ? "Stop Recording"
                          : "Start Recording"
                      }
                    >
                      🎤
                    </button>
                  </div>
                  {listening && activeField === "expectation" && (
                    <p className="text-xs text-green-600 mt-1">Listening... {transcript}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-all disabled:opacity-50"
              title="Back"
              disabled={loading}
            >
              ←
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 accent-yellow-400" />
                <span className="text-xs text-gray-600">Save & continue later</span>
              </label>

              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-2.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm hover:shadow text-sm disabled:opacity-50"
                onClick={handleFinish}
                title="Finish"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    Finish & Go to Dashboard
                    <span className="text-lg">→</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <span className="text-red-600 text-sm">❌</span>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
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

            {/* Step 3 - Completed */}
            <div className="relative flex items-center gap-3 mb-8">
              <div className="w-6 h-6 bg-white text-yellow-500 rounded-full flex items-center justify-center font-bold text-xs z-10 shadow flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Registration Status</h3>
                <p className="text-yellow-100 text-xs">Completed</p>
              </div>
            </div>

            {/* Step 4 - Current */}
            <div className="relative flex items-center gap-3">
              <div className="w-6 h-6 bg-white text-yellow-500 rounded-full flex items-center justify-center font-bold text-xs z-10 shadow flex-shrink-0">4</div>
              <div>
                <h3 className="font-semibold text-sm text-white">Compliance</h3>
                <p className="text-yellow-100 text-xs">Final verification & documents</p>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full mt-0.5 inline-block">Current</span>
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="mt-10 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex justify-between mb-1 text-xs text-white">
              <span>Overall Progress</span>
              <span className="font-bold">100%</span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="w-full h-full bg-white rounded-full"></div>
            </div>
            <p className="text-xs text-yellow-100 mt-2 text-center">Almost done! Complete compliance to finish.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceStatusCheck;
