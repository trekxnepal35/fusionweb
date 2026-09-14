"use client";

import { useEffect, useMemo, useState,Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import EnquiryContent from "./EnquiryContent";

export default function EnquiryPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
              <p className="text-gray-600">
                Loading enquiry information...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <EnquiryContent />
    </Suspense>
  );
}

