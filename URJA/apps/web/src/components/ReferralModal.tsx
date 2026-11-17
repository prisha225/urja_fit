"use client";

import React, { useState } from "react";
import { ShieldAlert, Printer, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

interface ReferralModalProps {
  flags: string[];
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ flags }) => {
  const [showDoctorNote, setShowDoctorNote] = useState(false);

  return (
    <div className="min-h-screen bg-mist flex flex-col items-center justify-center p-6 text-aubergine">
      <div className="w-full max-w-md bg-white rounded-hero p-8 border border-ink-12 shadow-sm text-center">
        {/* Soft Hibiscus Alert Icon */}
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-hibiscus/10 text-hibiscus flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h1 className="font-display text-2xl text-aubergine mb-3">
          Please talk to a doctor before starting
        </h1>

        <p className="text-sm text-ink-70 mb-6 leading-relaxed">
          A short check first keeps you safe. Based on your screening answers, we recommend speaking with your doctor or healthcare provider before beginning any new exercise routine.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowDoctorNote(true)}
            className="w-full py-3.5 px-4 rounded-chip border border-aubergine text-aubergine font-semibold text-sm hover:bg-mist flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Note for your doctor</span>
          </button>

          <Link
            href="/"
            className="w-full py-3.5 px-4 rounded-chip text-ink-70 hover:text-aubergine font-medium text-sm flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to home</span>
          </Link>
        </div>

        <div className="mt-8 pt-4 border-t border-ink-12 text-[11px] text-ink-70">
          Sakhi is for general wellness guidance. It does not provide medical diagnoses or treatment.
        </div>
      </div>

      {/* Printable Doctor Note Modal */}
      {showDoctorNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-hero p-6 border border-ink-12 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-ink-12 mb-4">
              <h2 className="font-display text-lg text-aubergine">Activity Summary for Physician Review</h2>
              <button
                type="button"
                onClick={() => setShowDoctorNote(false)}
                className="text-xs text-ink-70 hover:text-aubergine"
              >
                Close
              </button>
            </div>

            <div className="text-xs text-aubergine space-y-3 leading-relaxed">
              <p>
                <strong>Patient Intended Activity:</strong> Low-to-moderate intensity home movement program (chair squats, wall push-ups, gentle mobility, relaxation stretches).
              </p>
              <p>
                <strong>Planned Duration:</strong> 15–20 minutes per day, with rest intervals and no heavy loads.
              </p>
              <p>
                <strong>Reason for Referral:</strong> The individual reported health screening factors (such as recent recovery, dizziness, chest discomfort, or doctor precautions) requiring clearance.
              </p>
              <p className="bg-mist p-3 rounded-field text-ink-70">
                <em>Doctor's Assessment & Recommendations:</em>
                <br /><br />
                Cleared for light activity [ &nbsp; ] &nbsp;&nbsp;&nbsp;&nbsp; Not cleared at this time [ &nbsp; ]
                <br /><br />
                Signature: __________________________ &nbsp;&nbsp; Date: ___________
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2 px-4 rounded-chip bg-aubergine text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
