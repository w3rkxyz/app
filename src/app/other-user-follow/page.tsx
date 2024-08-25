"use client";

import { Suspense } from "react";
import OtherUserFollow from "@/views/other-user-follow/other-user-follow";
import React from "react";

export default function OtherUserFollowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <OtherUserFollow />
      </div>
    </Suspense>
  );
}
