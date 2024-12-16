import MyContracts from "@/views/my-contract/contracts";
import React from "react";
import { Suspense } from "react";

export default function ContractsPage() {
  return (
    <Suspense fallback={<div></div>}>
      <div>
        <MyContracts />
      </div>
    </Suspense>
  );
}
