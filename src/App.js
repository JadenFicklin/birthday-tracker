import { useEffect, useState } from 'react';
import './App.css';
import { database } from './firebase';
import { set, ref, onValue, push } from 'firebase/database';
import { uid } from 'uid';
import {
    getAuth,
    signInWithPopup,
    signOut,
    GoogleAuthProvider
} from 'firebase/auth';

function App() {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [priority, setPriority] = useState('');
    const [user, setUser] = useState('');
    const [userUid, setUserUid] = useState('');

    const [arrayOfBirthdays, setArrayOfBirthdays] = useState([]);

    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    const handleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            setUserUid(user.uid);
            setUser(user);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            console.log('Signed out');
            setUser(null);
        } catch (error) {
            console.log(error, 'error');
        }
    };

    const writeToDatabase = (e) => {
        e.preventDefault();
        const uuid = uid();
        const newBirthdayRef = push(ref(database));
        set(newBirthdayRef, {
            name,
            date,
            priority,
            uuid,
            userUid
        });
    };

    useEffect(() => {
        onValue(ref(database), (snapshot) => {
            const data = snapshot.val();
            setArrayOfBirthdays([]);
            if (data !== null) {
                setArrayOfBirthdays(Object.values(data));
            }
        });
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <h1>Birthday tracker</h1>
            {user ? (
                <>
                    <h2>Logged in as {user.displayName}</h2>
                    <img
                        src={`https://api.allorigins.win/raw?url=${user.photoURL}`}
                        alt=""
                        className="w-20 h-20 rounded-full"
                    />
                </>
            ) : (
                <h2>not logged in</h2>
            )}
            {!user ? (
                <button onClick={handleSignIn}>Log in</button>
            ) : (
                <button onClick={handleSignOut}>Log out</button>
            )}
            {user && (
                <>
                    {' '}
                    <form onSubmit={writeToDatabase}>
                        <input
                            type="text"
                            placeholder="name"
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="date"
                            onChange={(e) => setDate(e.target.value)}
                        />
                        <select
                            value=""
                            onChange={(e) => setPriority(e.target.value)}>
                            <option value="" disabled>
                                Select a priority color
                            </option>
                            <option>Red</option>
                            <option>Yellow</option>
                            <option>Green</option>
                        </select>
                        <input type="submit" />
                    </form>
                    <br />
                    {arrayOfBirthdays
                        .filter((item) => item.userUid === userUid)
                        .map((item, key) => (
                            <div
                                key={key}
                                style={{ background: `${item.priority}` }}
                                className="w-32 p-3 m-3 bg-white rounded-md shadow-xl">
                                <p>{item.name}</p>
                                <p>{item.date}</p>
                            </div>
                        ))}
                </>
            )}
        </div>
    );
}

export default App;
