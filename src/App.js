import './App.css';
import React, { useState, useRef } from 'react';
import { FiSend } from "react-icons/fi";

// Import Firebase modules
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgTulJPE6rBX_8kB1oKVPQXK-xGNFIy54",
  authDomain: "chatroom-1d99f.firebaseapp.com",
  projectId: "chatroom-1d99f",
  storageBucket: "chatroom-1d99f.appspot.com",
  messagingSenderId: "558432052380",
  appId: "1:558432052380:web:6954c7bea48966a4b93959"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider);
  };

  return (
    <button className="btn btn-success mt-[45%]" onClick={signInWithGoogle}>Sign in with Google</button>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button className="btn btn-error" onClick={() => auth.signOut()}>SignOut</button>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL } = message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className="flex w-full mt-2 mb-3 justify-start">
      <div className="avatar">
        <div className="w-12 rounded-full">
          <img className="w-[12.5px] h-[12.5px]"  src={photoURL} alt="" />
        </div>
      </div>
      <p className="chat-bubble ml-3" >{text}</p>
    </div>
  );
}

function ChatRoom() {
  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [formValue, setFormValue] = useState('');
  const [messages] = useCollectionData(query, { idField: 'id' });

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full h-full">
      <div className="mt-4 ">
        <SignOut />
      </div>
      <div className="ml-5">
        {messages && messages.slice().map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </div>
      <form onSubmit={sendMessage} className="flex ml-[15%] mb-[2%] relative bottom-0 left-0 right-0 p-4 w-full">
        <input 
          type="text" 
          placeholder="Type here" 
          className="input input-bordered w-[70%]" 
          value={formValue} 
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button className="ml-3 text-[28px]" type="submit"><FiSend /></button>
      </form>
    </div>
  );
}

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        {user ? <><ChatRoom /></> : <SignIn />}
      </header>
    </div>
  );
}

export default App;
