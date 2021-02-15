import firebase from 'firebase/app';
import "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: "react-drop-and-crop-image.firebaseapp.com",
    projectId: "react-drop-and-crop-image",
    storageBucket: "react-drop-and-crop-image.appspot.com",
    messagingSenderId: process.env.REACT_APP_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
};


firebase.initializeApp(firebaseConfig);
// firebase.analytics();
const storage = firebase.storage();
export { storage, firebase as default };