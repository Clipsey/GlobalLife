const firebaseConfig = {
  apiKey: "AIzaSyCyt1RoykgVtWr9snTxgsq9Pag3Yl1ArYg",
  authDomain: "d3-global-a1686.firebaseapp.com",
  databaseURL: "https://d3-global-a1686.firebaseio.com",
  projectId: "d3-global-a1686",
  storageBucket: "d3-global-a1686.appspot.com",
  messagingSenderId: "828248675977",
  appId: "1:828248675977:web:7852d630e96b8891765858",
  measurementId: "G-WLXJ49ZKFG"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({});