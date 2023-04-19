import { push, ref, set } from 'firebase/database';
import React, { useState } from 'react';
import { database } from '../firebase';

function CreateBirthday() {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [userUid] = useState('');

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

    return (
        <div>
            <form onSubmit={writeToDatabase}>
                <input
                    type="text"
                    placeholder="name"
                    onChange={(e) => setName(e.target.value)}
                />
                <input type="date" onChange={(e) => setDate(e.target.value)} />

                <input type="submit" />
            </form>
        </div>
    );
}

export default CreateBirthday;
