
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


export const firebaseConfig = {
  apiKey: "AIzaSyCvMI94ET_YcgJzEEIt-m4WI8icrjUEuzo",
  authDomain: "trazabilidad-3f41e.firebaseapp.com",
  projectId: "trazabilidad-3f41e",
  storageBucket: "trazabilidad-3f41e.appspot.com",
  messagingSenderId: "135225632086",
  appId: "1:135225632086:web:8388097f72d90a5ab222f7",
  measurementId: "G-XDLB034BNN"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
