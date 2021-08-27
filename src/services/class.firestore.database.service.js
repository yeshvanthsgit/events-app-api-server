// bring in firestore

const Firestore = require("@google-cloud/firestore/build/src");

class FirestoreDatabaseService {
    constructor() {
        this.firestore = new Firestore(
            {
                projectId: process.env.GOOGLE_CLOUD_PROJECT,
                keyFilename: process.env.KEY_FILE_NAME
            }
        );
    }

    /**
     * Gets all events and sorts them in descending order (newest to oldest)
     * @returns {Promise<{events: []}>}
     */
    async getEvents(){
        const ret = { events: [] };
        try {
            const snapshot = await this.firestore.collection('Events').orderBy('sortDate', 'desc').get();
            if (!snapshot.empty) {
                snapshot.docs.forEach(doc => {
                    // console.log('getEvents - doc: ', doc);
                    //get data
                    const event = doc.data();
                    //get internal firestore id
                    event.id = doc.id;
                    //add object to array
                    ret.events.push(event);
                }, this);
            }
            return ret;
        } catch (e) {
            console.log('getEvents - Error: ', e.message);
            throw new Error(`getEvents - Error: ${e.message}`);
        }
    }


    /**
     * Add a new event if the date is not specified today's date is used
     * @param event
     * @param returnEvents
     * @returns {Promise<{date}|*|{events: *[]}>}
     */
    async addEvent(event, returnEvents = true){
        event.likes = 0;
        event.dislikes = 0;
        try {
            // console.log('empty date: ', event.date);
            if(!event.date) {
                event.date = this.padDate(new Date().toLocaleString().split(',')[0]);
            } else {
                event.date = this.padDate(event.date);
            }
            event.sortDate = this.createSortDate(event.date);
            const response = await this.firestore.collection('Events').add(event);
            // console.log('addEvent - id: ', response.id);
            if(returnEvents) {
                try {
                    return await this.getEvents();
                } catch (e) {
                    throw new Error(`addEvent - getEvents - error: ${e.message}`);
                }

            } else {
                event.id = response.id;
                return event;
            }
        } catch (e) {
            console.log('addEvent - Error: ', e.message);
            throw new Error(`addEvent - Error: ${e.message}`);
        }
    }

    /**
     * Get an event by its Unique ID
     * @param id
     * @returns {Promise<{event: null}|{event: FirebaseFirestore.DocumentData}>}
     */
    async getEventById(id){
        try {
            const snapshot = await this.firestore.collection('Events').doc(id).get();
            if(!snapshot.empty) {
                const doc = snapshot.data();
                console.log('getEventById - doc: ', doc);
                return {event: doc};
            } else {
                return {event: null}
            }
        } catch (e) {
            console.log('Error - getEventById: ', e.message);
            throw new Error(`getEventById - Error: ${e.message}`);
        }
    }

    /**
     * Get events by title (could be more than one)
     * @param title
     * @returns {Promise<{events: []}>}
     */
    async getEventsByTitle(title){
        const ret = { events: [] };
        try {
            const snapshot = await this.firestore.collection('Events').where('title', '==', title).get();
            if (!snapshot.empty) {
                snapshot.docs.forEach(doc => {
                    // console.log('getEvents - doc: ', doc);
                    //get data
                    const event = doc.data();
                    //get internal firestore id
                    event.id = doc.id;
                    //add object to array
                    ret.events.push(event);
                }, this);
            }
            return ret;
        } catch (e) {
            console.log('Error - getEventsByTitle: ', e.message);
            throw new Error(`getEventsByTitle - Error: ${e.message}`);
        }
    }

    /**
     * Updates an event by ID
     * @param id
     * @param event
     * @param returnEvents
     * @returns {Promise<{events: []}>}
     */
    async updateEvent(id, event, returnEvents = true){
        try {
            if(!!event.date) {
                event.date = this.padDate(event.date);
                event.sortDate = this.createSortDate(event.date);
            }
            const snapshot = await this.firestore.collection('Events').doc(id).update(event);
            console.log('updateEvent - snapshot.docs: ', snapshot);
            if(returnEvents) {
                return this.getEvents();
            } else {
                return {events: []};
            }
        } catch (e) {
            console.log('Error - updateEvent: ', e.message);
            throw new Error(`updateEvent - Error: ${e.message}`);
        }
    }

    async deleteEvent(id, returnEvents = true){
        try {
            const snapshot = await this.firestore.collection('Events').doc(id).delete();
            console.log('deleteEvent - snapshot.docs: ', snapshot.docs);
        } catch (e) {
            console.log('Error - deleteEvent: ', e.message);
            throw new Error(`deleteEvent - Error: ${e.message}`);
        }
    }

    async getEventsCount(includeNull = true){ return null;}
    async deleteLastEntry(){ return null;}

    changeReaction(id, type, increment=true) {
        if(type === 'likes' || type === 'dislikes') {
            // return the existing object
            this.firestore.collection("Events").doc(id).get()
                .then((snapshot) => {
                    const el = snapshot.data();
                    // if you have elements in firestore with no likes property
                    if (!el[type]) {
                        el[type] = 0;
                    }
                    // increment the likes
                    if (increment) {
                        el[type]++;
                    }
                    else {
                        el[type]--;
                    }
                    // do the update
                    this.firestore.collection("Events")
                        .doc(id).update(el).then((ret) => {
                        // return events using shared method that adds __id
                        return this.getEvents();
                    });
                })
                .catch(err => { console.log(err) });
        } else {
            return this.getEvents();
        }
    }

    async incLikes(id){
        return this.changeReaction(id,'likes')
    }

    async incDisLikes(id){
        return this.changeReaction(id, 'dislikes');
    }

    createSortDate(eventDate){
        const dateParts = eventDate.split('/');
        return `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
    }

    padDate(date){
        const dateParts = date.split('/');
        return `${dateParts[0].padStart(2, '0')}/${dateParts[1].padStart(2, '0')}/${dateParts[2]}`;
    }
}

module.exports = FirestoreDatabaseService;
