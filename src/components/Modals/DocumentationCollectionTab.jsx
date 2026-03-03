import React, { useState, useEffect } from 'react';
import {
    FileStack, Loader2, ChevronDown, ChevronUp,
    CheckCircle2, AlertCircle, Save, Plus, Trash2, RotateCcw
} from 'lucide-react';

// ─── Mock API Data (replace with real API call) ──────────────────────────────
const MOCK_FORM_DATA = {
    data: [
        {
            Id: 413,
            ServiceId: 299,
            FormId: 350,
            SubFormId: 1,
            Section: "PAN Details",
            IsMultiple: 1,
            FormMaster: null,
            SubFormMaster: {
                SubFormID: 1,
                FormID: 1,
                SubFormName: "Bank Account"
            },
            Sections: [
                {
                    SectionID: 232,
                    SubFormID: 1,
                    SectionName: "Axis Bank",
                    Fields: [
                        { FieldID: 372, SectionID: 232, FieldName: "Account No", FieldType: "Number", IsMandatory: 0, Permanent: 0 },
                        { FieldID: 373, SectionID: 232, FieldName: "IFSC", FieldType: "Text", IsMandatory: 0, Permanent: 0 },
                        { FieldID: 374, SectionID: 232, FieldName: "Branch Name", FieldType: "Text", IsMandatory: 0, Permanent: 0 }
                    ]
                }
            ]
        },
        {
            Id: 414,
            ServiceId: 299,
            FormId: 351,
            SubFormId: 2,
            Section: "Director Details",
            IsMultiple: 0,
            FormMaster: null,
            SubFormMaster: {
                SubFormID: 2,
                FormID: 2,
                SubFormName: "Personal Info"
            },
            Sections: [
                {
                    SectionID: 233,
                    SubFormID: 2,
                    SectionName: "Identity",
                    Fields: [
                        { FieldID: 375, SectionID: 233, FieldName: "Full Name", FieldType: "Text", IsMandatory: 1, Permanent: 0 },
                        { FieldID: 376, SectionID: 233, FieldName: "PAN Number", FieldType: "Text", IsMandatory: 1, Permanent: 0 },
                        { FieldID: 377, SectionID: 233, FieldName: "Date of Birth", FieldType: "Date", IsMandatory: 0, Permanent: 0 },
                        { FieldID: 378, SectionID: 233, FieldName: "Upload Aadhaar", FieldType: "File", IsMandatory: 0, Permanent: 0 }
                    ]
                }
            ]
        }
    ]
};

// ─── Field Component ──────────────────────────────────────────────────────────
const FormField = ({ field, value, onChange, error }) => {
    const inputBase =
        "w-full px-3.5 py-2.5 text-[12px] font-medium text-slate-700 bg-slate-50 border rounded-xl transition-all outline-none focus:ring-2 focus:ring-[#4b49ac]/20 focus:border-[#4b49ac] focus:bg-white placeholder:text-slate-300";
    const errorClass = error ? "border-red-300 bg-red-50/30" : "border-slate-200";

    const type = (field.FieldType || "Text").toLowerCase();

    if (type === "file") {
        return (
            <div>
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-xl cursor-pointer transition-all
                    border-slate-200 bg-slate-50 hover:border-[#4b49ac]/40 hover:bg-[#4b49ac]/5">
                    <div className="flex flex-col items-center gap-1">
                        <Plus className="w-4 h-4 text-slate-300" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {value ? value.name : "Click to upload"}
                        </p>
                    </div>
                    <input type="file" className="hidden" onChange={(e) => onChange(e.target.files[0])} />
                </label>
                {error && <p className="mt-1 text-[10px] text-red-500 font-bold">{error}</p>}
            </div>
        );
    }

    return (
        <div>
            <input
                type={type === "number" ? "number" : type === "date" ? "date" : "text"}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter ${field.FieldName}`}
                className={`${inputBase} ${errorClass}`}
            />
            {error && <p className="mt-1 text-[10px] text-red-500 font-bold">{error}</p>}
        </div>
    );
};

// ─── Section Form (single or multiple instances) ──────────────────────────────
const SectionForm = ({ section, isMultiple, formEntry, onUpdate, onAddInstance, onRemoveInstance }) => {
    const instances = formEntry?.instances || [{}];

    return (
        <div className="space-y-4">
            {instances.map((instance, instIdx) => (
                <div key={instIdx} className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                    {isMultiple && (
                        <div className="flex items-center justify-between px-5 py-3 bg-slate-50/60 border-b border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Entry #{instIdx + 1}
                            </p>
                            {instIdx > 0 && (
                                <button
                                    onClick={() => onRemoveInstance(instIdx)}
                                    className="flex items-center gap-1 text-[10px] text-red-400 font-bold hover:text-red-600 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" /> Remove
                                </button>
                            )}
                        </div>
                    )}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {section.Fields.map((field) => (
                            <div key={field.FieldID} className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                    {field.FieldName}
                                    {field.IsMandatory === 1 && (
                                        <span className="text-red-400">*</span>
                                    )}
                                </label>
                                <FormField
                                    field={field}
                                    value={instance[field.FieldID] || ""}
                                    onChange={(val) => onUpdate(instIdx, field.FieldID, val)}
                                    error={instance[`err_${field.FieldID}`]}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {isMultiple && (
                <button
                    onClick={onAddInstance}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#4b49ac]/30 text-[11px] font-black text-[#4b49ac]/70
                        hover:border-[#4b49ac]/60 hover:text-[#4b49ac] hover:bg-[#4b49ac]/5 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-3.5 h-3.5" /> Add Another Entry
                </button>
            )}
        </div>
    );
};

// ─── Form Group (one item from data[]) ───────────────────────────────────────
const FormGroup = ({ item, formData, onFormDataChange }) => {
    const [expanded, setExpanded] = useState(true);
    const [saved, setSaved] = useState(false);

    const handleUpdate = (sectionID, instIdx, fieldID, val) => {
        const key = `${item.Id}_${sectionID}`;
        const existing = formData[key] || { instances: [{}] };
        const newInstances = [...existing.instances];
        newInstances[instIdx] = { ...newInstances[instIdx], [fieldID]: val, [`err_${fieldID}`]: undefined };
        onFormDataChange(key, { instances: newInstances });
        setSaved(false);
    };

    const handleAddInstance = (sectionID) => {
        const key = `${item.Id}_${sectionID}`;
        const existing = formData[key] || { instances: [{}] };
        onFormDataChange(key, { instances: [...existing.instances, {}] });
    };

    const handleRemoveInstance = (sectionID, instIdx) => {
        const key = `${item.Id}_${sectionID}`;
        const existing = formData[key] || { instances: [{}] };
        const newInstances = existing.instances.filter((_, i) => i !== instIdx);
        onFormDataChange(key, { instances: newInstances });
    };

    const handleSave = () => {
        // Validate mandatory fields
        let hasError = false;
        item.Sections.forEach((section) => {
            const key = `${item.Id}_${section.SectionID}`;
            const entry = formData[key] || { instances: [{}] };
            const newInstances = entry.instances.map((inst) => {
                const updated = { ...inst };
                section.Fields.forEach((field) => {
                    if (field.IsMandatory === 1 && !inst[field.FieldID]) {
                        updated[`err_${field.FieldID}`] = "This field is required";
                        hasError = true;
                    }
                });
                return updated;
            });
            onFormDataChange(key, { instances: newInstances });
        });

        if (!hasError) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const handleReset = () => {
        item.Sections.forEach((section) => {
            const key = `${item.Id}_${section.SectionID}`;
            onFormDataChange(key, { instances: [{}] });
        });
        setSaved(false);
    };

    return (
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Group Header */}
            <button
                onClick={() => setExpanded((p) => !p)}
                className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#4b49ac]/5 to-amber-50/50 border-b border-slate-100 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#4b49ac]/10 flex items-center justify-center">
                        <FileStack className="w-3.5 h-3.5 text-[#4b49ac]" />
                    </div>
                    <div>
                        <p className="text-[13px] font-black text-slate-800">{item.SubFormMaster?.SubFormName || 'Form'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.Section}</p>
                    </div>
                    {item.IsMultiple === 1 && (
                        <span className="ml-2 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-700 uppercase tracking-wider border border-amber-200">
                            Multiple Entries
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {saved && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                        </span>
                    )}
                    {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </button>

            {expanded && (
                <div className="p-6 space-y-6 bg-white">
                    {item.Sections.map((section) => {
                        const key = `${item.Id}_${section.SectionID}`;
                        return (
                            <div key={section.SectionID}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1 h-4 rounded-full bg-[#4b49ac]/40" />
                                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{section.SectionName}</p>
                                </div>
                                <SectionForm
                                    section={section}
                                    isMultiple={item.IsMultiple === 1}
                                    formEntry={formData[key]}
                                    onUpdate={(instIdx, fieldID, val) => handleUpdate(section.SectionID, instIdx, fieldID, val)}
                                    onAddInstance={() => handleAddInstance(section.SectionID)}
                                    onRemoveInstance={(instIdx) => handleRemoveInstance(section.SectionID, instIdx)}
                                />
                            </div>
                        );
                    })}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black text-slate-500 hover:text-slate-700
                                bg-slate-100 hover:bg-slate-200 transition-all"
                        >
                            <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[11px] font-black text-white
                                bg-[#4b49ac] hover:bg-[#3d3c8f] transition-all shadow-sm hover:shadow-md"
                        >
                            <Save className="w-3 h-3" /> Save Section
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Document Collection Tab ────────────────────────────────────────────
const DocumentCollectionTab = ({ serviceId }) => {
    const [formConfig, setFormConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        // Simulate API fetch — replace with: await serviceFormMapping(serviceId)
        setTimeout(() => {
            setFormConfig(MOCK_FORM_DATA);
            setLoading(false);
        }, 800);
    }, [serviceId]);

    const handleFormDataChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-[#4b49ac]" />
                <p className="text-slate-500 font-medium text-sm tracking-tight">Loading document forms...</p>
            </div>
        );
    }

    if (!formConfig || !formConfig.data || formConfig.data.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center gap-3">
                <FileStack className="w-12 h-12 text-slate-100" />
                <p className="text-slate-400 font-medium">No document forms configured for this service.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-500 overflow-hidden">
            {/* Tab Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-[#4b49ac]/5 to-amber-50/30">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Document Collection</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Fill in the required forms for this service — {formConfig.data.length} form{formConfig.data.length > 1 ? 's' : ''} to complete
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">In Progress</p>
                    </div>
                </div>
            </div>

            {/* Forms */}
            <div className="p-6 space-y-4">
                {formConfig.data.map((item) => (
                    <FormGroup
                        key={item.Id}
                        item={item}
                        formData={formData}
                        onFormDataChange={handleFormDataChange}
                    />
                ))}
            </div>

            {/* Footer note */}
            <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
                <p className="text-[10px] text-slate-400 font-bold">Fields marked with * are mandatory</p>
            </div>
        </div>
    );
};

export default DocumentCollectionTab;