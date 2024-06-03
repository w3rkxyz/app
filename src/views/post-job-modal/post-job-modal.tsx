import React from "react";
import PostListModal from "@/components/reusable/PostListModal/PostListModal";

type Props = {
  closeModal: () => void;
};
const PostJobModal = ({ closeModal }: Props) => {
  return (
    <>
      <PostListModal
        title="Post A Job"
        nameLabel="Job Name"
        descriptionLabel="Job Description"
        descriptionPlaceholder="[Job Description]"
        priceLabel="Contract Type"
        pricePlaceholder="[Permanent/Task]"
        acceptedTokensLabel="Payment"
        acceptedTokensPlaceholder="[amount in USD]"
        tagsLabel="Paid in"
        tagsPlaceholder="[select token]"
        portfolioLabel="Tags"
        portfolioPlaceholder="[select 3 tags minimum]"
        buttonText="Post"
        closeModal={closeModal}
      />
    </>
  );
};

export default PostJobModal;
