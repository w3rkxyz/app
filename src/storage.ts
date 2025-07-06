import { IStorageProvider } from "@lens-protocol/client";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

const MAX_AGE = 30 * 24 * 60 * 60;

export const cookieStorage: IStorageProvider = {
  async getItem(key: string) {
    const { cookies } = await import("next/headers");
    const value = await getCookie(key, { cookies });

    return value ?? null;
  },
  setItem(key: string, value: string) {
    setCookie(key, value);
  },

  removeItem(key: string) {
    deleteCookie(key);
  },
};

export const clientCookieStorage: IStorageProvider = {
  async getItem(key: string) {
    const value = await getCookie(key);

    return value ?? null;
  },
  setItem(key: string, value: string) {
    setCookie(key, value);
  },

  removeItem(key: string) {
    deleteCookie(key);
  },
};
