import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { database } from './firebase';
import { ref, onValue } from 'firebase/database';
import {
    getAuth,
    signInWithPopup,
    signOut,
    GoogleAuthProvider
} from 'firebase/auth';
import Calendar from './components/Calendar';
import List from './components/List';
import CreateBirthday from './components/CreateBirthday';
import { FcGoogle } from 'react-icons/fc';

function App() {
    const [user, setUser] = useState('');
    const [userUid, setUserUid] = useState('');

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
                setCalendarEvents(birthdaysToEvents(filteredBirthdays));
            } else {
                setCalendarEvents([]);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [userUid, birthdaysToEvents]);

    return (
        <div className="min-h-screen bg-gray-100">
            {!user && (
                <div className="grid w-full h-screen place-content-center">
                    <div className="flex flex-wrap h-min">
                        <h1 className="mb-5 text-2xl font-extrabold text-center msm:text-[80px] w-full">
                            Birthday tracker
                        </h1>
                        <button
                            onClick={handleSignIn}
                            className="flex p-3 duration-300 scale-[90%] bg-white rounded-md hover:bg-gray-700 group border-2 w-[300px] mx-auto sm:mt-10">
                            {' '}
                            <FcGoogle className="w-[24px] h-[24px]" />
                            <p className="mx-6 font-semibold text-gray-500 group-hover:text-white ">
                                Continue with Google
                            </p>
                        </button>
                    </div>
                </div>
            )}
            {user && (
                <>
                    <div className="w-[1000px] py-10 mx-auto h-[160px] ">
                        <div className="relative grid w-full h-full px-6 place-content-center">
                            <img
                                src={`https://api.allorigins.win/raw?url=${user.photoURL}`}
                                alt={`${user.displayName}'s profile`}
                                className="absolute left-0 w-20 h-20 rounded-full"
                            />
                            <h1 className="text-3xl font-bold">
                                Birthday Tracker
                            </h1>
                            <button
                                className="bg-gray-600 text-white px-3 rounded-[4px] absolute right-0 top-1/2 -mt-[10px] hover:bg-[#3788D8]"
                                onClick={handleSignOut}>
                                Log out
                            </button>
                        </div>
                    </div>
                    <div className="flex h-screen px-6 mx-auto w-min">
                        <CreateBirthday />
                        <div className=" ml-7">
                            <List userUid={userUid} />
                            <Calendar calendarEvents={calendarEvents} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
