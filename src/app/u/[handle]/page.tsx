import Profile from "@/views/profile-handle/profile-handle";

type PageProps = {
  params: Promise<{ handle: string }>;
};

export default function page({ params }: PageProps) {
  return (
    <div>
      <Profile params={params} />
    </div>
  );
}
