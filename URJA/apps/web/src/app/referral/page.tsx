"use client";

import React from "react";
import { ReferralModal } from "../../components/ReferralModal";

export default function ReferralPage() {
  return <ReferralModal flags={["care_check_flagged"]} />;
}
