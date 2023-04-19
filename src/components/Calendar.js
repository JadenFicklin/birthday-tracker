import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function Calendar({ calendarEvents }) {
    return (
        <div className=" w-[600px] height-[700px]">
            <FullCalendar
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

export default Calendar;
