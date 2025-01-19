import { defineStore } from "pinia";

interface UserState {
  token: string | null;
  userInfo: {
    phone: string;
    name: string;
    school: string;
    userId: number;
    studentId: number;
    gender: string;
    schoolId: number;
  } | null;
  isDarkMode: boolean;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    token: localStorage.getItem("token"),
    userInfo: JSON.parse(localStorage.getItem("userData") || "null"),
    isDarkMode: localStorage.getItem("isDarkMode") === "true" || false,
  }),

  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem("token", token);
    },

    setUserInfo(userInfo: UserState["userInfo"]) {
      this.userInfo = userInfo;
      if (userInfo) {
        localStorage.setItem("userData", JSON.stringify(userInfo));
      }
    },

    logout() {
      this.token = null;
      this.userInfo = null;
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("activityData");
      localStorage.removeItem("runInfoData");
      localStorage.removeItem("runStandardData");
    },

    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      document.documentElement.classList.toggle("dark", this.isDarkMode);
      localStorage.setItem("isDarkMode", String(this.isDarkMode));
    },

    initDarkMode() {
      if (localStorage.getItem("isDarkMode") === null) {
        this.isDarkMode = false;
        localStorage.setItem("isDarkMode", "false");
      }

      if (this.isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
  },
});
