import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAg7Nj5Bdoa8_54e9GvsiuCoqOh441aEYo",
  authDomain: "personal-finance-tracker-612b7.firebaseapp.com",
  projectId: "personal-finance-tracker-612b7",
  appId: "1:530178737437:web:11c2881cb9a9955e024df4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();