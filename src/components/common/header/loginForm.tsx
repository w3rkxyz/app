import { profileId, useLogin, useProfiles } from "@lens-protocol/react-web";
import { toast } from "react-hot-toast";
import style from "./form.module.css";
import { formatProfileIdentifier } from "../../../utils/formatProfileIdentifier";
import { useEffect } from "react";

export function LoginForm({
  owner,
  setProfile,
  onClose,
}: {
  owner: string;
  setProfile?: any;
  onClose: () => void;
}) {
  const { execute: login, loading: isLoginPending } = useLogin();
  const { data: profiles, loading: loadingProfiles } = useProfiles({
    where: {
      ownedBy: [owner],
    },
  });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const id = profileId(formData.get("id") as string);

    const result = await login({
      address: owner,
      profileId: id,
    });

    if (result.isSuccess()) {
      toast.success(
        `Welcome ${String(
          result.value && formatProfileIdentifier(result.value)
        )}`
      );

      profiles?.map((profile: any) => {
        if (profile.id === id) {
          localStorage.setItem("activeHandle", profile.handle?.fullHandle);
          setProfile(profile);
          onClose();
        }
      });
    }
  };

  // While Loading Profiles
  if (loadingProfiles) {
    return (
      <div
        className={style.form}
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(128, 128, 128, 0.5)",
        }}
      >
        {" "}
        <p
          style={{
            backgroundColor: "white",
            padding: "15px 60px",
            borderRadius: "5px",
          }}
        >
          Loading...
        </p>
      </div>
    );
  }

  // If there are no Profiles associated with the connected wallet
  if (profiles?.length === 0) {
    return (
      <div
        className={style.form}
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(128, 128, 128, 0.5)",
        }}
      >
        <p className="bg-[#FF8484] rounded-[16px] text-[18px] px-[46px] py-[33px] font-medium">
          No Lens Handle Found
        </p>
      </div>
    );
  }

  // Shows list of available profiles associated with the connected wallet
  return (
    <div
      className={style.form}
      style={{
        position: "absolute",
        width: "100vw",
        height: "100vh",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(128, 128, 128, 0.5)",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "5px",
        }}
      >
        <fieldset style={{ gap: "20px" }}>
          <legend>Which Profile you want to log-in with?</legend>

          {profiles?.map((profile, idx) => (
            <label key={profile.id}>
              <input
                disabled={isLoginPending}
                type="radio"
                defaultChecked={idx === 0}
                name="id"
                value={profile.id}
              />
              {formatProfileIdentifier(profile)}
            </label>
          ))}

          <div>
            <button disabled={isLoginPending} type="submit">
              Continue
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
