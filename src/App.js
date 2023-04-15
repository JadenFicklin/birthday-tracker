import { useEffect, useState } from 'react';
import './App.css';
import { database } from './firebase';
import { set, ref, onValue, push } from 'firebase/database';
import { uid } from 'uid';

function App() {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [priority, setPriority] = useState('');

    const [arrayOfBirthdays, setArrayOfBirthdays] = useState([]);

    const writeToDatabase = (e) => {
        e.preventDefault();
        const uuid = uid();
        const newBirthdayRef = push(ref(database));
        set(newBirthdayRef, {
            name,
            date,
            priority,
            uuid
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
        <div className="bg-gray-100 min-h-screen">
            <h1>Birthday tracker</h1>
            <form onSubmit={writeToDatabase}>
                <input
                    type="text"
                    placeholder="name"
                    onChange={(e) => setName(e.target.value)}
                />
                <input type="date" onChange={(e) => setDate(e.target.value)} />
                <select onChange={(e) => setPriority(e.target.value)}>
                    <option selected disabled>
                        Select a priority color
                    </option>
                    <option>Red</option>
                    <option>Yellow</option>
                    <option>Green</option>
                </select>
                <input type="submit" />
            </form>
            <br />
            <p>{JSON.stringify(arrayOfBirthdays)}</p>
            {arrayOfBirthdays.map((item, key) => (
                <div
                    key={key}
                    className="p-3 rounded-md shadow-xl m-3 w-32 bg-white">
                    <p>{item.name}</p>
                    <p>{item.date}</p>
                    <p>{item.priority}</p>
                    <p>{item.uuid}</p>
                </div>
            ))}
        </div>
    );
}

export default App;
