'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SectionHeading, Paper, Money, Badge, Button } from '@/components/primitives';
import { ImpactMetrics } from '@/components/shared/ImpactMetrics';
import { settlementRaju, policyRaju, billRaju } from '@/lib/fixtures';
import {
  calculateForecast,
  auditSettlement,
  generateAppeal,
  SettlementAudit,
  GrievanceAppeal,
} from '@claimlens/engine';
import { cn } from '@/lib/utils';
import {
  FileCheck,
  Scale,
  Copy,
  Printer,
  Download,
  Check,
  Building,
  Mail,
  MapPin,
  Clock,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface OmbudsmanCenter {
  city: string;
  stateJurisdiction: string;
  email: string;
  address: string;
  phone: string;
}

const OMBUDSMAN_CENTERS: OmbudsmanCenter[] = [
  {
    city: 'Bengaluru',
    stateJurisdiction: 'Karnataka',
    email: 'bimalokpal.bengaluru@cioins.co.in',
    address: 'Office of the Insurance Ombudsman, 19/19, Jeevan Soudha Building, Ground Floor, Asoka Pillar Road, 1st Block, Jayanagar, Bengaluru - 560 011.',
    phone: '080 - 26601614',
  },
  {
    city: 'Mumbai',
    stateJurisdiction: 'Goa, Mumbai Metropolitan Region (excluding Navi Mumbai & Thane)',
    email: 'bimalokpal.mumbai@cioins.co.in',
    address: 'Office of the Insurance Ombudsman, 3rd Floor, Jeevan Seva Annexe, S. V. Road, Santacruz (W), Mumbai - 400 054.',
    phone: '022 - 69038821',
  },
  {
    city: 'Delhi',
    stateJurisdiction: 'NCT of Delhi & adjacent NCR districts',
    email: 'bimalokpal.delhi@cioins.co.in',
    address: 'Office of the Insurance Ombudsman, 2/2 A, Universal Insurance Building, Asaf Ali Road, New Delhi - 110 002.',
    phone: '011 - 23232481',
  },
  {
    city: 'Chennai',
    stateJurisdiction: 'Tamil Nadu, Puducherry UT',
    email: 'bimalokpal.chennai@cioins.co.in',
    address: 'Office of the Insurance Ombudsman, Fatima Akhtar Court, 4th Floor, 453, Anna Salai, Teynampet, Chennai - 600 018.',
    phone: '044 - 24333668',
  },
  {
    city: 'Kolkata',
    stateJurisdiction: 'West Bengal, Sikkim, Andaman & Nicobar Islands',
    email: 'bimalokpal.kolkata@cioins.co.in',
    address: 'Office of the Insurance Ombudsman, Hindustan Bldg. Annexe, 7th Floor, 4, C.R. Avenue, Kolkata - 700 072.',
    phone: '033 - 22124339',
  },
  {
    city: 'Hyderabad',
    stateJurisdiction: 'Telangana, Andhra Pradesh (Yanam)',
    email: 'bimalokpal.hyderabad@cioins.co.in',
    address: 'Office of the Insurance Ombudsman, 6-2-46, 1st Floor, "Moin Court", Lane Opp. Saleem Function Palace, A. C. Guards, Lakdi-Ka-Pool, Hyderabad - 500 004.',
    phone: '040 - 23312122',
  },
  {
    city: 'Ahmedabad',
    stateJurisdiction: 'Gujarat, Dadra & Nagar Haveli, Daman and Diu',
    email: 'bimalokpal.ahmedabad@cioins.co.in',
    address: 'Office of the Insurance Ombudsman, Jeevan Prakash Building, 6th floor, Tilak Marg, Relief Road, Ahmedabad - 380 001.',
    phone: '079 - 25501201',
  },
  {
    city: 'Pune',
    stateJurisdiction: 'Maharashtra (excluding Mumbai Metropolitan Region)',
    email: 'bimalokpal.pune@cioins.co.in',
    address: 'Office of the Insurance Ombudsman, Jeevan Darshan Bldg., 3rd Floor, C.T.S. No.s. 195 to 198, N.C. Kelkar Road, Narayan Peth, Pune - 411 030.',
    phone: '020 - 41312555',
  },
  {
    city: 'Kochi (Ernakulam)',
    stateJurisdiction: 'Kerala, Lakshadweep UT',
    email: 'bimalokpal.ernakulam@cioins.co.in',
    address: 'Office of the Insurance Ombudsman, 10th Floor, Jeevan Prakash, LIC Building, Opp. Maharaja’s College Ground, M.G. Road, Kochi - 682 011.',
    phone: '0484 - 2358759',
  },
  {
    city: 'Chandigarh',
    stateJurisdiction: 'Punjab, Haryana, Himachal Pradesh, Jammu & Kashmir, Ladakh, Chandigarh UT',
    email: 'bimalokpal.chandigarh@cioins.co.in',
    address: 'Office of the Insurance Ombudsman, S.C.O. No. 101, 102 & 103, 2nd Floor, Batra Building, Sector 17 – D, Chandigarh - 160 017.',
    phone: '0172 - 2706196',
  },
  {
    city: 'Lucknow',
    stateJurisdiction: 'Uttar Pradesh (Central & Eastern districts)',
    email: 'bimalokpal.lucknow@cioins.co.in',
    address: 'Office of the Insurance Ombudsman, 6th Floor, Jeevan Bhawan, Phase-II, Nawal Kishore Road, Hazratganj, Lucknow - 226 001.',
    phone: '0522 - 2231330',
  },
  {
    city: 'Jaipur',
    stateJurisdiction: 'Rajasthan',
    email: 'bimalokpal.jaipur@cioins.co.in',
    address: 'Office of the Insurance Ombudsman, Jeevan Nidhi – II Bldg., Ground Floor, Bhawani Singh Marg, Ambedkar Circle, Jaipur - 302 005.',
    phone: '0141 - 2740363',
  },
];

export function Scene7AppealArchitect() {
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [copied, setCopied] = useState<boolean>(false);
  const [isTypewriter, setIsTypewriter] = useState<boolean>(false);
  const [displayText, setDisplayText] = useState<string>('');

  // 1. Calculate baseline deterministic forecast
  const forecastResult = useMemo(() => {
    return calculateForecast(policyRaju, billRaju);
  }, []);

  // 2. Audit insurer settlement statement to identify discrepancies
  const auditResult: SettlementAudit = useMemo(() => {
    return auditSettlement(forecastResult, settlementRaju);
  }, [forecastResult]);

  // 3. Generate formal legal grievance letter with IRDAI statutory citations
  const grievanceAppeal: GrievanceAppeal = useMemo(() => {
    return generateAppeal(settlementRaju, auditResult);
  }, [auditResult]);

  const selectedOmbudsman = useMemo(() => {
    return OMBUDSMAN_CENTERS.find((c) => c.city === selectedCity) || OMBUDSMAN_CENTERS[0];
  }, [selectedCity]);

  // English Letter Text
  const englishLetter = useMemo(() => {
    return `To: The Grievance Redressal Officer, Demo Assure
Subject: Formal Grievance: Illegal Over-Deduction of ₹${auditResult.totalDiscrepancyAmount.toLocaleString(
      'en-IN'
    )} on Claim Ref ${settlementRaju.claimRef}

Dear Sir / Madam,

Re: Dispute on Claim Settlement Adjudication for Raju's Mother (Claim Ref: ${settlementRaju.claimRef})
Policy: SafeCare Plus (Demo) · Policy No: demo-001

I am writing to formally contest an unauthorized and unlawful deduction of ₹${auditResult.totalDiscrepancyAmount.toLocaleString(
      'en-IN'
    )} applied against the hospital settlement for the above claim.

1. SPECIFIC DISPUTED DEDUCTION:
Under settlement advice CLM-DEMO-001, your claims department applied a proportionate room-rent haircut of 37.5% across:
• Pharmacy & Medicines: Billed ₹22,000 → Deducted ₹8,250 contrary to contract.
• Essential Clinical Consumables: Deducted an extra ₹1,500 over Annexure A exclusions.
Total Illegal Haircut: ₹9,750.

2. STATUTORY & POLICY GROUNDS:
• Policy Clause SP-3.3 ("Exempt Expenses") [1]: Explicitly mandates that proportionate room rent deductions in Clause SP-3.2 DO NOT apply to pharmacy, medicines, and diagnostic investigations.
• IRDAI Master Circular (Ref: IRDAI/HLT/CIR/GDL/61/04/2020) Section 5, Clause 19 [2]: Strictly prohibits insurers and TPAs from applying proportionate room-rent deductions to pharmacy, diagnostic investigations, and surgical implants.
• Regulation 12 of IRDAI (Health Insurance) Regulations, 2016: Requires precise itemized clause justification.

3. FORMAL RELIEF REQUESTED:
Please immediately review and reimburse the unlawfully withheld amount of ₹9,750 within 30 days of this notice.

4. NOTICE OF STATUTORY ESCALATION:
Should this grievance not be rectified within 30 days pursuant to IRDAI guidelines, please take notice that a formal complaint will be escalated directly to the Insurance Ombudsman at ${selectedOmbudsman.city} under Rule 13 of the Insurance Ombudsman Rules, 2017 [3].

Sincerely,
Raju Verma (for Policyholder)
Bengaluru, Karnataka

───────────────────────────────────────────────
Statutory Citations:
[1] Policy Clause SP-3.3, Page 1: "Clause 3.2 does not apply to pharmacy, medicines and diagnostic investigations."
[2] IRDAI Master Circular 2020 §5 Cl. 19: Prohibition of proportionate deduction on pharmacy and diagnostics.
[3] Insurance Ombudsman Rules 2017 Rule 13: Free statutory arbitration for claims disputes.

Prepared with ClaimLens · Informational audit, not legal advice.`;
  }, [auditResult, selectedOmbudsman]);

  // Authentic Hindi Legal Translation
  const hindiLetter = useMemo(() => {
    return `सेवा में: शिकायत निवारण अधिकारी (Grievance Redressal Officer), डेमो एश्योर
विषय: दावा संख्या ${settlementRaju.claimRef} पर ₹${auditResult.totalDiscrepancyAmount.toLocaleString(
      'en-IN'
    )} की अवैध कटौती के संबंध में औपचारिक शिकायत

महोदय / महोदया,

संदर्भ: राजू की माताजी के बीमा दावे का निपटान (दावा संदर्भ: ${settlementRaju.claimRef})
पॉलिसी: सेफकेयर प्लस (डेमो) · पॉलिसी संख्या: demo-001

मैं अस्पताल के बिल निपटान में आपके दावों विभाग द्वारा की गई ₹${auditResult.totalDiscrepancyAmount.toLocaleString(
      'en-IN'
    )} की अनधिकृत व गैर-कानूनी कटौती के विरोध में यह औपचारिक शिकायत दर्ज कर रहा हूँ।

1. विवादित कटौती का विवरण:
निपटान पत्र के अनुसार, आपके विभाग ने कमरे के किराए की आनुपातिक कटौती (37.5%) को दवाओं और फार्मेसी पर लागू किया:
• दवाएं एवं फार्मेसी: ₹22,000 बिल → ₹8,250 की गैर-कानूनी कटौती।
• आवश्यक उपभोग्य वस्तुएं: अनुलग्नक A से अधिक ₹1,500 की अतिरिक्त कटौती।
कुल अवैध कटौती: ₹9,750।

2. अनुबंध एवं विनियामक वैधानिक आधार:
• पॉलिसी क्लॉज SP-3.3 ("छूट प्राप्त व्यय") [1]: स्पष्ट रूप से निर्देश देता है कि कमरे के किराए की आनुपातिक कटौती दवाओं और जांच पर लागू नहीं होगी।
• इरडा (IRDAI) मास्टर सर्कुलर 2020 (धारा 5, क्लॉज 19) [2]: स्पष्ट रूप से बीमाकर्ताओं को फार्मेसी और जांच पर आनुपातिक कटौती लगाने से रोकता है।
• इरडा स्वास्थ्य बीमा विनियम 2016, नियम 12: कटौती के सटीक कानूनी कारण प्रदान करना अनिवार्य है।

3. अपेक्षित समाधान:
कृपया इस शिकायत के प्राप्त होने के 30 दिनों के भीतर रोकी गई राशि ₹9,750 का पुनर्भुगतान करने की कृपा करें।

4. बीमा लोकपाल (Insurance Ombudsman) को शिकायत की पूर्व-सूचना:
यदि 30 दिनों में इस त्रुटि का समाधान नहीं होता है, तो बीमा लोकपाल नियम, 2017 के नियम 13 [3] के तहत यह मामला सीधे बीमा लोकपाल (${selectedOmbudsman.city}) के समक्ष प्रस्तुत किया जाएगा।

भवदीय,
राजू वर्मा (पॉलिसीधारक हेतु)
बेंगलुरु, कर्नाटक

───────────────────────────────────────────────
वैधानिक उद्धरण (Statutory Citations):
[1] पॉलिसी क्लॉज SP-3.3: "क्लॉज 3.2 दवाओं और जांच पर लागू नहीं होता।"
[2] IRDAI मास्टर सर्कुलर 2020 धारा 5 क्लॉज 19: दवाओं पर आनुपातिक कटौती पर पूर्ण प्रतिबंध।
[3] बीमा लोकपाल नियम 2017 नियम 13: उपभोक्ता शिकायत व मध्यस्थता।

क्लेमलेंस (ClaimLens) द्वारा तैयार · सूचनात्मक ऑडिट, कानूनी सलाह नहीं।`;
  }, [auditResult, selectedOmbudsman]);

  const currentLetterText = language === 'EN' ? englishLetter : hindiLetter;

  // Handle Copy to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(currentLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Handle Print Letter
  const handlePrint = () => {
    window.print();
  };

  // Handle Download Grievance Text File
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([currentLetterText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `ClaimLens_Grievance_${settlementRaju.claimRef}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const openClause = (clauseId: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('claimlens:open-clause', {
          detail: { clauseId },
        })
      );
    }
  };

  return (
    <section
      id="scene-7"
      className="relative scroll-mt-20 py-8 md:py-16 space-y-12"
      aria-label="Scene 7: Appeal Architect & Legal Grievance Generator"
    >
      <SectionHeading
        sceneNumber="07"
        badge="STATUTORY GRIEVANCE & OMBUDSMAN ROUTING"
        title="When insurers overstep, the receipt fights back"
        subtitle="1-click legal grievance letter generator with IRDAI statutory citations and territorial Insurance Ombudsman escalation routing."
        align="left"
      />

      {/* Discrepancy Alert Banner */}
      <div className="bg-red-soft/40 border-2 border-red/40 rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-red shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red">
                Unauthorized Over-Deduction Detected (FR-15)
              </span>
              <Badge variant="danger" className="text-[11px] font-mono">
                Recoverable ₹9,750
              </Badge>
            </div>
            <h3 className="font-serif font-bold text-lg text-ink">
              Insurer Illegally Applied Proportionate Room Cut to Medicines
            </h3>
            <p className="text-xs text-ink-2 leading-relaxed max-w-3xl">
              Demo Assure deducted ₹8,250 on pharmacy lines and ₹1,500 on consumables. This directly violates Policy Clause SP-3.3 and IRDAI Master Circular 2020 §5 Cl. 19.
            </p>
          </div>
        </div>

        <div className="bg-paper p-3.5 rounded-lg border border-rule font-mono text-xs shrink-0 text-center sm:text-right">
          <span className="text-ink-2 uppercase block text-[10px]">Over-Deducted Balance</span>
          <span className="text-xl font-bold text-red">
            <Money amount={auditResult.totalDiscrepancyAmount} />
          </span>
          <span className="block text-[11px] text-green font-semibold mt-0.5">
            100% Legally Contestable
          </span>
        </div>
      </div>

      {/* Main Grid: Letter Generator & Ombudsman Routing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Formal Grievance Letter */}
        <div className="lg:col-span-8 space-y-4">
          <Paper className="p-6 md:p-8 bg-paper border-rule space-y-5 shadow-md">
            {/* Toolbar: Language toggle & actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-ink" />
                <h4 className="font-serif font-bold text-lg text-ink">
                  Formal Grievance Letter
                </h4>
                <div className="flex items-center ml-2 border border-rule rounded-md overflow-hidden text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setLanguage('EN')}
                    className={cn(
                      'px-2.5 py-1 transition-colors min-h-[36px] sm:min-h-[28px] cursor-pointer',
                      language === 'EN' ? 'bg-ink text-paper font-bold' : 'bg-paper-2 text-ink-2'
                    )}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('HI')}
                    className={cn(
                      'px-2.5 py-1 transition-colors min-h-[36px] sm:min-h-[28px] cursor-pointer',
                      language === 'HI' ? 'bg-ink text-paper font-bold' : 'bg-paper-2 text-ink-2'
                    )}
                  >
                    हिंदी (Hindi)
                  </button>
                </div>
              </div>

              {/* Action Buttons: Copy, Print, Download */}
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  className="min-h-[44px] sm:min-h-[34px]"
                  title="Copy letter to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green mr-1.5" />
                      <span className="text-green font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrint}
                  className="min-h-[44px] sm:min-h-[34px]"
                  title="Print grievance letter"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  <span>Print</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownload}
                  className="min-h-[44px] sm:min-h-[34px]"
                  title="Download as text file"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  <span>Download</span>
                </Button>
              </div>
            </div>

            {/* Letter Document Display */}
            <div className="relative bg-paper-2/60 border border-rule rounded-lg p-5 font-mono text-xs sm:text-[13px] leading-relaxed text-ink select-text whitespace-pre-wrap max-h-[520px] overflow-y-auto">
              {currentLetterText}
            </div>

            {/* Interactive Citations Links Bar */}
            <div className="pt-2 border-t border-rule flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-ink-2 uppercase font-semibold">Quick Clause Verification:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openClause('SP-3.3')}
                  className="px-2 py-1 rounded bg-paper border border-rule hover:border-ink text-ink text-[11px] font-bold cursor-pointer"
                >
                  [1] Verify Clause SP-3.3
                </button>
                <button
                  type="button"
                  onClick={() => openClause('SP-3.2')}
                  className="px-2 py-1 rounded bg-paper border border-rule hover:border-ink text-ink text-[11px] font-bold cursor-pointer"
                >
                  [2] Verify Clause SP-3.2
                </button>
              </div>
            </div>
          </Paper>
        </div>

        {/* Right Column (4 cols): Insurance Ombudsman Jurisdiction Routing */}
        <div className="lg:col-span-4 space-y-6">
          <Paper className="p-6 bg-paper-2/40 border-rule space-y-5">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-ink" />
                <h4 className="font-serif font-bold text-base text-ink">
                  Ombudsman Routing
                </h4>
              </div>
              <Badge variant="neutral" className="text-[10px] font-mono">
                Rule 13
              </Badge>
            </div>

            {/* Jurisdiction Dropdown Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-ink font-bold block">
                Select Your State / City:
              </label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-paper border border-rule rounded-lg px-3 py-2.5 text-xs font-mono text-ink appearance-none pr-8 cursor-pointer min-h-[44px] focus:outline-2 focus:outline-ink"
                  aria-label="Insurance Ombudsman center selector"
                >
                  {OMBUDSMAN_CENTERS.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city} — {c.stateJurisdiction}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-ink-2 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Selected Center Routing Card */}
            <div className="bg-paper p-4 rounded-lg border border-rule space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-ink font-bold border-b border-rule pb-2">
                <MapPin className="w-3.5 h-3.5 text-red shrink-0" />
                <span>Office of the Insurance Ombudsman, {selectedOmbudsman.city}</span>
              </div>

              <div className="space-y-1.5 text-ink-2">
                <div>
                  <span className="text-[10px] uppercase block opacity-60">Jurisdiction</span>
                  <span className="text-ink font-semibold">{selectedOmbudsman.stateJurisdiction}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase block opacity-60">Official Grievance Email</span>
                  <a
                    href={`mailto:${selectedOmbudsman.email}`}
                    className="text-ink font-semibold hover:underline flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3 text-ink-2" />
                    <span>{selectedOmbudsman.email}</span>
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase block opacity-60">Physical Address</span>
                  <span className="text-[11px] leading-snug block text-ink">{selectedOmbudsman.address}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase block opacity-60">Direct Helpline</span>
                  <span className="text-ink font-semibold">{selectedOmbudsman.phone}</span>
                </div>
              </div>
            </div>

            {/* Statutory Escalation Timeline Box */}
            <div className="bg-paper-2 p-3.5 rounded-lg border border-rule/80 text-xs font-mono space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-ink">
                <Clock className="w-3.5 h-3.5 text-ink" />
                <span>Statutory Dispute Timeline:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-ink-2 list-disc list-inside">
                <li>Insurer turnaround window: <strong>30 calendar days</strong>.</li>
                <li>Ombudsman filing eligibility: Day 31 after insurer inaction.</li>
                <li>Free arbitration: No legal fees, binding on the insurer.</li>
              </ul>
            </div>
          </Paper>
        </div>
      </div>

      {/* Embedded Macro Impact Metrics */}
      <div className="pt-8">
        <ImpactMetrics />
      </div>
    </section>
  );
}
