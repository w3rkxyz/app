import lighthouse from "@lighthouse-web3/sdk";

//Uploads File to IPFS
const uploadFileToIPFS = async (file: any) => {
  const output = await lighthouse.upload(
    file,
    process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY as string
  );
  const link = "https://gateway.lighthouse.storage/ipfs/" + output.data.Hash;
  return link;
};

const uploadJsonToIPFS = async (Json: any) => {
  const serialized = JSON.stringify(Json);
  const response = await lighthouse.uploadText(
    serialized,
    process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY as string
  );
  const link = "https://gateway.lighthouse.storage/ipfs/" + response.data.Hash;
  return link;
};

export { uploadFileToIPFS, uploadJsonToIPFS };
