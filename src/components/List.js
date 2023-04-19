import React, { useEffect, useState } from 'react';
import { database } from '../firebase';
import { onValue, ref, remove } from 'firebase/database';
import c from 'classnames';

function List(userUid) {
    const [arrayOfBirthdays, setArrayOfBirthdays] = useState([]);
    const [opened, setOpened] = useState(true);

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

    useEffect(() => {
        const unsubscribe = onValue(ref(database), (snapshot) => {
            const data = snapshot.val();
            if (data !== null) {
                const holdBirthdays = Object.values(data);
                const filteredBirthdays = holdBirthdays.filter(
                    (item) => item.userUid === userUid.userUid
                );
                console.log(userUid);
                console.log('success');
                setArrayOfBirthdays(filteredBirthdays);
            } else {
                setArrayOfBirthdays([]);
                console.log('error');
            }
        });

        return () => {
            unsubscribe();
        };
    }, [userUid]);

    return (
        <div
            className={c(
                'w-[680px]  overflow-hidden duration-300 select-none',
                opened ? 'h-min' : ' h-7'
            )}>
            <div
                className="relative grid w-full text-white bg-gray-600 cursor-pointer h-7 place-content-center"
                onClick={() => setOpened(!opened)}>
                List of Birthdays
                {opened ? (
                    <p className="absolute right-4 top-[2px]">Close</p>
                ) : (
                    <p className="absolute right-4 top-[2px]">Open</p>
                )}
            </div>
            <div className={c('duration-300', opened ? '' : '')}>
                {arrayOfBirthdays.map((item, key) => (
                    <div
                        key={key}
                        className="relative grid w-full grid-cols-3 pl-5 bg-white border-b-2">
                        <p>Name: {item.name}</p>
                        <p>Birth day: {item.date}</p>
                        <p>Age: {calculateAge(item.date)}</p>
                        <button
                            onClick={() => handleDelete(item)}
                            className="absolute w-4 h-4 text-xs text-white bg-red-500 rounded-full right-4 top-1">
                            X
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default List;
