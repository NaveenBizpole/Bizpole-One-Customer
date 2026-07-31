import React, { useState } from 'react';

import DirectorPromoterForm from '../components/ExixistingCompany/DirectorPromoterForm';
import RegistrationDetailsForm from '../components/ExixistingCompany/RegistrationDetailsForm';
import ComplianceStatusCheck from '../components/ExixistingCompany/ComplianceStatusCheck';
import { setSecureItem, getSecureItem } from "../utils/secureStorage";
import CompanyInformationForm from '../components/ExixistingCompany/CompanyInformationForm';

const ExisitingCompanies = () => {
  // Persist step in localStorage
  const getInitialStep = () => {
    const saved = getSecureItem("onboardingStep");
    return saved ? Number(saved) : 1;
  };
  const [step, setStep] = useState(getInitialStep());
  // Each step's data is kept here so going back and forth between steps
  // doesn't wipe out what was already typed.
  const [companyInfoDraft, setCompanyInfoDraft] = useState(null);
  const [directorsDraft, setDirectorsDraft] = useState(null);
  // Registration details collected in step 3, merged with compliance data in step 4
  const [registrationDetails, setRegistrationDetails] = useState(null);

  // Update localStorage when step changes
  React.useEffect(() => {
    setSecureItem("onboardingStep", step);
  }, [step]);

  return (
    <div className="min-h-screen bg-gray-50">

  {step === 1 && (
    <CompanyInformationForm
      initialData={companyInfoDraft}
      onNext={(data) => { setCompanyInfoDraft(data); setStep(2); }}
    />
  )}
  {step === 2 && (
    <DirectorPromoterForm
      initialData={directorsDraft}
      onNext={(data) => { setDirectorsDraft(data); setStep(3); }}
      onBack={() => setStep(1)}
    />
  )}
  {step === 3 && (
    <RegistrationDetailsForm
      initialData={registrationDetails}
      onNext={(data) => { setRegistrationDetails(data); setStep(4); }}
      onBack={() => setStep(2)}
    />
  )}
  {step === 4 && (
    <ComplianceStatusCheck
      registrationDetails={registrationDetails}
      onBack={() => setStep(3)}
    />
  )}
    </div>
  );
}

export default ExisitingCompanies;