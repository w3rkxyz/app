"use client";

import { Suspense } from "react";
import OtherUserFollow from "@/views/other-user-follow/other-user-follow";
import React from "react";
import ProfileSkeleton from "@/components/reusable/profileSkeleton";

export default function OtherUserFollowPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <div>
        <OtherUserFollow />
      </div>
    </Suspense>
  );
}
