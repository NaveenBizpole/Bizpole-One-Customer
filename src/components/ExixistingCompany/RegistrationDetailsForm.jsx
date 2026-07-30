import React, { useState, useEffect } from "react";
import { getAllStates } from "../../api/States";

// Business type constants
const BUSINESS_TYPES = {
  PRIVATE_LIMITED: "private limited",
  LLP: "llp",
  OPC: "opc",
  PARTNERSHIP: "partnership",
  PROPRIETORSHIP: "sole proprietorship"
};

const RegistrationDetailsForm = ({ onNext, onBack, initialData }) => {
  // Controlled state for all fields in this step
  const [form, setForm] = useState({
    entityType: "",
    pan: "",
    tan: "",
    cin: "",
    llpin: "",
    din: "",
    gstEnabled: "",
    gstNumber: "",
    gstDate: "",
    gstType: "Regular",
    iec: "",
    iecEnabled: "",
    udyam: "",
    stateId: "",
    fssaiEnabled: "",
    fssaiNumber: "",
    fssaiDate: "",
    fssaiType: "",
    esiEnabled: "",
    esiNumber: "",
    esiDate: "",
    pfEnabled: "",
    pfNumber: "",
    pfDate: "",
    professionalTaxEnabled: "",
    ptNumber: "",
    ptDate: "",
    tdsEnabled: "",
    turnover: "",
    employees: "",
    ...initialData,
  });

  // Prefill form from localStorage if available
  useEffect(() => {
    try {
      const companyInfoRaw = window.localStorage.getItem("companyInfo");
      if (companyInfoRaw) {
        const companyInfo = JSON.parse(companyInfoRaw);
        setForm(prev => ({
          ...prev,
          entityType: prev.entityType || companyInfo.ConstitutionCategory || "",
          pan: prev.pan || companyInfo.CompanyPAN || "",
          cin: prev.cin || companyInfo.CIN || "",
          llpin: prev.llpin || (companyInfo.CIN && companyInfo.ConstitutionCategory === BUSINESS_TYPES.LLP ? companyInfo.CIN : ""),
          gstEnabled: prev.gstEnabled || (companyInfo.GSTNumber ? "yes" : ""),
          gstNumber: prev.gstNumber || companyInfo.GSTNumber || "",
          stateId: prev.stateId || companyInfo.State || "",
          turnover: prev.turnover || companyInfo.Turnover || "",
        }));
      }
    } catch (err) {
      console.error("Error pre-filling form from localStorage:", err);
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [states, setStates] = useState([]);
  const [touched, setTouched] = useState({});

  // Entity type options
  const entityTypes = [
    { label: "Select Entity", value: "" },
    { label: BUSINESS_TYPES.PRIVATE_LIMITED, value: BUSINESS_TYPES.PRIVATE_LIMITED },
    { label: BUSINESS_TYPES.LLP, value: BUSINESS_TYPES.LLP },
    { label: BUSINESS_TYPES.OPC, value: BUSINESS_TYPES.OPC },
    { label: BUSINESS_TYPES.PARTNERSHIP, value: BUSINESS_TYPES.PARTNERSHIP },
    { label: BUSINESS_TYPES.PROPRIETORSHIP, value: BUSINESS_TYPES.PROPRIETORSHIP },
  ];

  // Load states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const data = await getAllStates();
        setStates(data || []);
      } catch (err) {
        console.error("Error fetching states:", err);
        setStates([]);
      }
    };
    fetchStates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  // Validation helper
  const hasError = (fieldName) => {
    return touched[fieldName] && !form[fieldName]?.trim();
  };

  const validateForm = () => {
    const errors = [];

    if (!form.entityType) {
      errors.push("Entity Type is required");
    }

    if (form.gstEnabled === "yes") {
      if (!form.gstNumber) errors.push("GST Number is required when GST is enabled");
      if (!form.gstDate) errors.push("GST Registration Date is required");
    }

    if (form.fssaiEnabled === "yes") {
      if (!form.fssaiNumber) errors.push("FSSAI Number is required when FSSAI is enabled");
      if (!form.fssaiDate) errors.push("FSSAI Registration Date is required");
    }

    if (form.esiEnabled === "yes") {
      if (!form.esiNumber) errors.push("ESI Number is required when ESI is enabled");
      if (!form.esiDate) errors.push("ESI Registration Date is required");
    }

    if (form.pfEnabled === "yes") {
      if (!form.pfNumber) errors.push("PF Number is required when PF is enabled");
      if (!form.pfDate) errors.push("PF Registration Date is required");
    }

    if (form.professionalTaxEnabled === "yes") {
      if (!form.ptNumber) errors.push("Professional Tax Number is required when PT is enabled");
      if (!form.ptDate) errors.push("PT Registration Date is required");
    }

    return errors;
  };

  const handleNext = (e) => {
    e.preventDefault();

    const newTouched = {};
    Object.keys(form).forEach(key => { newTouched[key] = true; });
    setTouched(newTouched);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    setError("");
    setLoading(true);

    // Clean up empty conditional values before handing off to the next step
    const registrationDetails = {
      ...form,
      gstNumber: form.gstEnabled === "yes" ? form.gstNumber : "",
      gstDate: form.gstEnabled === "yes" ? form.gstDate : "",
      fssaiNumber: form.fssaiEnabled === "yes" ? form.fssaiNumber : "",
      fssaiDate: form.fssaiEnabled === "yes" ? form.fssaiDate : "",
      esiNumber: form.esiEnabled === "yes" ? form.esiNumber : "",
      esiDate: form.esiEnabled === "yes" ? form.esiDate : "",
      pfNumber: form.pfEnabled === "yes" ? form.pfNumber : "",
      pfDate: form.pfEnabled === "yes" ? form.pfDate : "",
      ptNumber: form.professionalTaxEnabled === "yes" ? form.ptNumber : "",
      ptDate: form.professionalTaxEnabled === "yes" ? form.ptDate : "",
      iec: form.iecEnabled === "yes" ? form.iec : "",
    };

    setLoading(false);
    if (onNext) onNext(registrationDetails);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Header with Logo - Mobile/Tablet */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Registration Status</h1>
        <img src="/Images/logo.webp" alt="Bizpole Logo" className="h-12 md:h-14 lg:h-14" />
      </div>

      {/* Left Section */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header with Logo - Desktop */}
          <div className="hidden lg:flex justify-between items-center mb-6">
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
          <div className="lg:hidden mb-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 bg-yellow-400 rounded-full"></div>
              <span className="text-xs text-gray-500">Step 3 of 4</span>
            </div>
          </div>

          {/* Main Form */}
          <div className="space-y-6" style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto", paddingRight: "8px" }}>
            {/* ================= BASIC COMPANY INFO ================= */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h4 className="font-semibold text-base mb-4 border-b border-gray-100 pb-2 text-gray-700">
                Basic Company Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Entity Type */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">
                    Entity Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="entityType"
                    value={form.entityType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all ${
                      hasError("entityType") ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-yellow-200'
                    }`}
                  >
                    {entityTypes.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* PAN Number */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">PAN Number</label>
                  <input
                    type="text"
                    name="pan"
                    value={form.pan}
                    onChange={handleChange}
                    placeholder="e.g. ABCDE1234F"
                    maxLength="10"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  />
                </div>

                {/* TAN Number */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">TAN Number</label>
                  <input
                    type="text"
                    name="tan"
                    value={form.tan}
                    onChange={handleChange}
                    placeholder="e.g. ABC12345D"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  />
                </div>

                {/* CIN - Conditional */}
                {(form.entityType === BUSINESS_TYPES.PRIVATE_LIMITED || form.entityType === BUSINESS_TYPES.OPC) && (
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-600">CIN Number</label>
                    <input
                      type="text"
                      name="cin"
                      value={form.cin}
                      onChange={handleChange}
                      placeholder="e.g. U72900MH2023PTC123456"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                    />
                  </div>
                )}

                {/* LLPIN - Conditional */}
                {form.entityType === BUSINESS_TYPES.LLP && (
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-600">LLPIN Number</label>
                    <input
                      type="text"
                      name="llpin"
                      value={form.llpin}
                      onChange={handleChange}
                      placeholder="e.g. LLP12345"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                    />
                  </div>
                )}

                {/* DIN Number */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">DIN Number</label>
                  <input
                    type="text"
                    name="din"
                    value={form.din}
                    onChange={handleChange}
                    placeholder="e.g. 12345678"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* ================= TAX REGISTRATION ================= */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h4 className="font-semibold text-base mb-4 border-b border-gray-100 pb-2 text-gray-700">
                Tax Registration Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* GST Registered? */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">GST Registered?</label>
                  <select
                    name="gstEnabled"
                    value={form.gstEnabled}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  >
                    <option value="">Select Option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* GST Number - Conditional */}
                {form.gstEnabled === "yes" && (
                  <>
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-600">
                        GST Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={form.gstNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 07AABCU9603R1ZM"
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all ${
                          touched.gstNumber && !form.gstNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-yellow-200'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-600">
                        GST Registration Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="gstDate"
                        value={form.gstDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all ${
                          touched.gstDate && !form.gstDate ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-yellow-200'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-600">GST Registration Type</label>
                      <select
                        name="gstType"
                        value={form.gstType}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                      >
                        <option value="Regular">Regular</option>
                        <option value="Composition">Composition</option>
                        <option value="Regular + SEZ">Regular + SEZ</option>
                      </select>
                    </div>
                  </>
                )}

                {/* IE Code Registered? */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">Do you have IE Code?</label>
                  <select
                    name="iecEnabled"
                    value={form.iecEnabled}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  >
                    <option value="">Select Option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* IEC Number - Conditional */}
                {form.iecEnabled === "yes" && (
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-600">Import Export Code (IEC)</label>
                    <input
                      type="text"
                      name="iec"
                      value={form.iec}
                      onChange={handleChange}
                      placeholder="e.g. IEC123456789"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                    />
                  </div>
                )}

                {/* TDS Returns */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">Do you file TDS returns?</label>
                  <select
                    name="tdsEnabled"
                    value={form.tdsEnabled}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  >
                    <option value="">Select Option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* Udyam */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">Udyam Registration Number</label>
                  <input
                    type="text"
                    name="udyam"
                    value={form.udyam}
                    onChange={handleChange}
                    placeholder="e.g. UDYAM-XX-00-0000000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">State</label>
                  <select
                    name="stateId"
                    value={form.stateId}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state._id || state.id || state.state_name} value={state.state_name}>
                        {state.state_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ================= FSSAI ================= */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h4 className="font-semibold text-base mb-4 border-b border-gray-100 pb-2 text-gray-700">
                Food & Safety Compliance (FSSAI)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* FSSAI Registered? */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">FSSAI Registered?</label>
                  <select
                    name="fssaiEnabled"
                    value={form.fssaiEnabled}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  >
                    <option value="">Select Option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* FSSAI Number - Conditional */}
                {form.fssaiEnabled === "yes" && (
                  <>
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-600">
                        FSSAI Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fssaiNumber"
                        value={form.fssaiNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 12345678901234"
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all ${
                          touched.fssaiNumber && !form.fssaiNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-yellow-200'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-600">
                        FSSAI Registration Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="fssaiDate"
                        value={form.fssaiDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all ${
                          touched.fssaiDate && !form.fssaiDate ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-yellow-200'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-600">FSSAI Type</label>
                      <select
                        name="fssaiType"
                        value={form.fssaiType}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                      >
                        <option value="">Select Type</option>
                        <option value="basic">Basic</option>
                        <option value="state">State</option>
                        <option value="central">Central</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ================= LABOUR COMPLIANCE ================= */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h4 className="font-semibold text-base mb-4 border-b border-gray-100 pb-2 text-gray-700">
                Labour Compliance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* ESI */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">ESI Registered?</label>
                  <select
                    name="esiEnabled"
                    value={form.esiEnabled}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  >
                    <option value="">Select Option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {form.esiEnabled === "yes" && (
                  <>
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-600">
                        ESI Registration Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="esiNumber"
                        value={form.esiNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. ESI12345678"
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all ${
                          touched.esiNumber && !form.esiNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-yellow-200'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-600">
                        ESI Registration Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="esiDate"
                        value={form.esiDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all ${
                          touched.esiDate && !form.esiDate ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-yellow-200'
                        }`}
                      />
                    </div>
                  </>
                )}

                {/* PF */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">PF Registered?</label>
                  <select
                    name="pfEnabled"
                    value={form.pfEnabled}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  >
                    <option value="">Select Option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {form.pfEnabled === "yes" && (
                  <>
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-600">
                        PF Registration Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="pfNumber"
                        value={form.pfNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. PF12345678"
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all ${
                          touched.pfNumber && !form.pfNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-yellow-200'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-600">
                        PF Registration Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="pfDate"
                        value={form.pfDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all ${
                          touched.pfDate && !form.pfDate ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-yellow-200'
                        }`}
                      />
                    </div>
                  </>
                )}

                {/* Professional Tax */}
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">Professional Tax Registered?</label>
                  <select
                    name="professionalTaxEnabled"
                    value={form.professionalTaxEnabled}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  >
                    <option value="">Select Option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {form.professionalTaxEnabled === "yes" && (
                  <>
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-600">
                        PT Registration Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="ptNumber"
                        value={form.ptNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. PT12345678"
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all ${
                          touched.ptNumber && !form.ptNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-yellow-200'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-600">
                        PT Registration Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="ptDate"
                        value={form.ptDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all ${
                          touched.ptDate && !form.ptDate ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-yellow-200'
                        }`}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ================= BUSINESS DETAILS ================= */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h4 className="font-semibold text-base mb-4 border-b border-gray-100 pb-2 text-gray-700">
                Business Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">Annual Turnover (₹)</label>
                  <input
                    type="number"
                    name="turnover"
                    value={form.turnover}
                    onChange={handleChange}
                    placeholder="e.g. 5000000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-600">Number of Employees</label>
                  <input
                    type="number"
                    name="employees"
                    value={form.employees}
                    onChange={handleChange}
                    placeholder="e.g. 50"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:border-yellow-200 transition-all"
                  />
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
                onClick={handleNext}
                title="Next"
                disabled={loading}
              >
                Next
                <span className="text-lg">→</span>
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
