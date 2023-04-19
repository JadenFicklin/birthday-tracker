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
        <div className="bg-white h-min w-min">
            <h2 className="grid text-white bg-gray-600 place-content-center h-7">
                Create new Birthday
            </h2>
            <form onSubmit={(e) => writeToDatabase(e)} className="p-3">
                <div className="flex w-full my-2">
                    <p>Name: </p>
                    <input
                        type="text"
                        placeholder="name"
                        onChange={(e) => setName(e.target.value)}
                        className="ml-3 text-[#3788D8] border-b-2 outline-none"
                    />
                </div>
                <div className="flex w-full my-2">
                    <p>Birthday: </p>
                    <input
                        type="date"
                        onChange={(e) => setDate(e.target.value)}
                        className="ml-3 text-[#3788D8] border-b-2 outline-none cursor-pointer"
                    />
                </div>

                <input
                    type="submit"
                    className="grid px-2 text-white bg-gray-600 rounded-[4px] cursor-pointer place-content-center mt-6 hover:bg-[#3788D8]  "
                />
            </form>
        </div>
    );
}

export default CreateBirthday;
