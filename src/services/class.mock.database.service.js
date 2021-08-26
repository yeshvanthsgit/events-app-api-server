class MockDatabaseService {
    mockData = {events: []};

    constructor() {
        this.addEvent({
            id: 1,
            title: 'an event',
            description: 'something really cool',
            location:  'Somewhere',
            eventDate: '01/01/2021'
        }).then(r => {});
        this.addEvent({
            id: 2,
            title: 'another event',
            description: 'something even cooler',
            location:  'Somewhere Else',
            eventDate: '02/01/2021'
        }).then(r => {});
    }

    /**
     * Add a New Event
     * @param event
     * @param returnEvents
     * @returns {Promise<{event: {dislikes: number, id: number, likes: number}}|{events: []}>}
     */
    async addEvent(event, returnEvents = true) {
        const {count} = await this.getEventsCount();
        const id = count + 1;
        if(!event.date) {
            // If no date specified default to today's date
            event.date = this.padDate(new Date().toLocaleString().split(',')[0]);
        } else {
            event.date = this.padDate(event.date);
        }
        event.sortDate = this.createSortDate(event.date);
        const newEvent = {id, likes: 0, dislikes: 0, ...event};
        this.mockData.events.push(newEvent);
        if(returnEvents) {
            return await this.getEvents();
        } else {
            return {event: newEvent};
        }
    }

    /**
     * Get all events sorted by sortdate descending (newest to oldest)
     * @param includeNulls
     * @returns {Promise<{events: []}>}
     */
    async getEvents (includeNulls = false) {
        let events = [];
        if (includeNulls) {
            events = this.mockData.events;
        } else {
            this.mockData.events.forEach(ev => {if(!!ev) {events.push(ev)}});
        }
        events.sort((a, b) => {
            return a.sortDate === b.sortDate ? 0 : (a.sortDate < b.sortDate ? 1 : -1);
        })
        return {events: events};
    }

    /**
     * Get one event by unique ID
     * @param id
     * @returns {Promise<{event: null}|{event: *}>}
     */
    async getEventById (id){
        const index = this.mockData.events.findIndex((obj => obj && obj.id === parseInt(id)));
        if (index !== -1) {
            return {event: this.mockData.events[index]};
        } else {
            return {event: null};
        }
    }

    /**
     * Get events by title
     * @param title
     * @returns {Promise<{events: *[]}>}
     */
    async getEventsByTitle(title){
        const events = this.mockData.events.filter((obj => obj && obj.title.toLowerCase() === title.toLowerCase()));
        return {events};
    }

    /**
     * Update event by ID
     * @param id
     * @param event
     * @param returnEvents
     * @returns {Promise<{event: *}|{events: *[]}>}
     */
    async updateEvent(id, event, returnEvents = true){
        const index = this.mockData.events.findIndex((obj => obj && obj.id === parseInt(id)));
        this.mockData.events[index] = {...this.mockData.events[index], ...event};
        const updatedEvent = this.mockData.events[index];
        if(returnEvents) {
            return this.getEvents();
        } else {
            return {event: updatedEvent};
        }
    }

    /**
     * Delete event by ID
     * @param id
     * @param returnEvents
     * @returns {Promise<{deletedEvent: *}|{events: *[]}>}
     */
    async deleteEvent(id, returnEvents = true){
        const index = this.mockData.events.findIndex((obj => obj && obj.id === parseInt(id)));
        const event = this.mockData.events[index];
        delete this.mockData.events[index]; // sets the entry to null, maintains array length
        if(returnEvents) {
            return this.getEvents();
        } else {
            return {deletedEvent: event};
        }
    }

    /**
     * Get count of events in Array
     * Important: Needed to generate sequential ID
     * @param includeNull
     * @returns {Promise<{count: number}>}
     */
    async getEventsCount(includeNull = true){
        if(includeNull) {
            return {count: this.mockData.events.length};
        } else {
            const events = [];
            this.mockData.events.forEach(ev => {if(!!ev) {events.push(ev)}});
            return {count: events.length};
        }
    }

    /**
     * Remove last entry from Array
     * Used during Unit Tests
     * @returns {Promise<void>}
     */
    async deleteLastEntry(){
        this.mockData.events.pop();
    }

    /**
     * Make the sortDate yyyy-mm-dd
     * @param eventDate
     * @returns {string}
     */
    createSortDate(eventDate){
        const dateParts = eventDate.split('/');
        return `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
    }

    /**
     * Pad the event date by adding a leading zero where needed
     * @param date
     * @returns {string}
     */
    padDate(date){
        const dateParts = date.split('/');
        return `${dateParts[0].padStart(2, '0')}/${dateParts[1].padStart(2, '0')}/${dateParts[2]}`;
    }
}

module.exports = MockDatabaseService;
