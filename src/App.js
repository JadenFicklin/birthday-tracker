import { useEffect, useState } from 'react';
import './App.css';
import { database } from './firebase';
import { set, ref, onValue, push, remove } from 'firebase/database';
import { uid } from 'uid';
import {
    getAuth,
    signInWithPopup,
    signOut,
    GoogleAuthProvider
} from 'firebase/auth';
import Fullcalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function App() {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [priority, setPriority] = useState('');
    const [user, setUser] = useState('');
    const [userAge, setUserAge] = useState(0);
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
            priority,
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

        // If the current month is before the birth month, or
        // if the current month is the birth month and the current day is before the birth day,
        // subtract 1 from the age.
        if (
            monthDifference < 0 ||
            (monthDifference === 0 && today.getDate() < birthday.getDate())
        ) {
            return age - 1;
        }
        return age;
    }

    function birthdaysToEvents(birthdays) {
        const currentYear = new Date().getFullYear();

        return birthdays.map((birthday) => {
            const eventDate = new Date(birthday.date);
            eventDate.setFullYear(currentYear);

            return {
                title: birthday.name,
                date: eventDate.toISOString().slice(0, 10),
                color: birthday.priority,
                id: birthday.uuid
            };
        });
    }

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
    }, [userUid]);

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
                    {arrayOfBirthdays.map((item, key) => (
                        <div
                            key={key}
                            style={{ background: `${item.priority}` }}
                            className="w-32 p-3 m-3 bg-white rounded-md shadow-xl">
                            <button onClick={() => handleDelete(item)}>
                                X
                            </button>

                            <p>{item.name}</p>
                            <p>{item.date}</p>
                            <p>Age: {calculateAge(item.date)}</p>
                        </div>
                    ))}
                </>
            )}

            <Fullcalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={'dayGridMonth'}
                headerToolbar={{
                    start: 'today prev,next',
                    center: 'title',
                    end: 'timeGridDay,timeGridWeek,dayGridMonth'
                }}
                events={calendarEvents}
            />
        </div>
    );
}

export default App;
