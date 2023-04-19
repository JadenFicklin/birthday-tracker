import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { database } from './firebase';
import { set, ref, onValue, push, remove } from 'firebase/database';
import {
    getAuth,
    signInWithPopup,
    signOut,
    GoogleAuthProvider
} from 'firebase/auth';
import Calendar from './components/Calendar';

function App() {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [user, setUser] = useState('');
    const [userUid, setUserUid] = useState('');

    const [arrayOfBirthdays, setArrayOfBirthdays] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);

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

    //write
    const writeToDatabase = (e) => {
        e.preventDefault();
        const newBirthdayRef = push(ref(database));
        set(newBirthdayRef, {
            name,
            date,
            uuid: newBirthdayRef.key,
            userUid
        });
    };

    //delete
    const handleDelete = (input) => {
        remove(ref(database, `/${input.uuid}`));
    };

    function calculateAge(birthdayString) {
        const birthday = new Date(birthdayString);
        const today = new Date();
        const age = today.getFullYear() - birthday.getFullYear();
        const monthDifference = today.getMonth() - birthday.getMonth();
        if (
            monthDifference < 0 ||
            (monthDifference === 0 && today.getDate() < birthday.getDate())
        ) {
            return age - 1;
        }
        return age;
    }

    const birthdaysToEvents = useCallback((birthdays) => {
        const currentYear = new Date().getFullYear();
        return birthdays.map((birthday) => {
            const eventDate = new Date(birthday.date);
            eventDate.setFullYear(currentYear);
            return {
                title: birthday.name + ` ${calculateAge(birthday.date)}`,
                date: eventDate.toISOString().slice(0, 10),
                id: birthday.uuid
            };
        });
    }, []);

    useEffect(() => {
        const unsubscribe = onValue(ref(database), (snapshot) => {
            const data = snapshot.val();
            if (data !== null) {
                const holdBirthdays = Object.values(data);
                const filteredBirthdays = holdBirthdays.filter(
                    (item) => item.userUid === userUid
                );
                setArrayOfBirthdays(filteredBirthdays);
                setCalendarEvents(birthdaysToEvents(filteredBirthdays));
            } else {
                setArrayOfBirthdays([]);
                setCalendarEvents([]);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [userUid, birthdaysToEvents]);

    return (
        <div className="min-h-screen bg-gray-100">
            <h1>Birthday tracker</h1>
            {user ? (
                <>
                    <h2>Logged in as {user.displayName}</h2>
                    <img
                        src={`https://api.allorigins.win/raw?url=${user.photoURL}`}
                        alt={`${user.displayName}'s profile`}
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

                        <input type="submit" />
                    </form>
                    <br />
                    {arrayOfBirthdays.map((item, key) => (
                        <div
                            key={key}
                            className="w-32 p-3 m-3 bg-white rounded-md shadow-xl">
                            <button onClick={() => handleDelete(item)}>
                                X
                            </button>

                            <p>{item.name}</p>
                            <p>{item.date}</p>
                            <p>Age: {calculateAge(item.date)}</p>
                        </div>
                    ))}
                    <Calendar calendarEvents={calendarEvents} />
                </>
            )}
        </div>
    );
}

export default App;
