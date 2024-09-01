"use client";

import { Suspense } from "react";
import MyMessageOpenChat from "@/views/my-massage/my-Massage";
import React from "react";

export default function Messages() {
  return (
    <Suspense fallback={<div></div>}>
      <>
        <MyMessageOpenChat />
      </>
    </Suspense>
  );
}
