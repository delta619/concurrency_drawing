const catchAsync = require('../utils/catchAsync');
const ScreenModel = require('./../models/screenModel');

class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(element) {
        this.items.push(element);
    }

    dequeue() {
        if (this.isEmpty()) {
            return "Queue is empty";
        }
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }

    front() {
        if (this.isEmpty()) {
            return "Queue is empty";
        }
        return this.items[0];
    }

    size() {
        return this.items.length;
    }

    printQueue() {
        return this.items.join(", ");
    }

    getDetails() {
        return this.items;
    }
}

const ephermal_db = {};
const redis_db = {};
const listeners = {};
const node_listener = {};

function init_screen(screenID) {
    listeners[screenID] = [];
    ephermal_db[screenID] = new Queue();
    redis_db[screenID] = [];
}

function create_random_screenID() {
    let chars= "0123456789abcdefghiklmnopqrstuvwxyz";
    let screenID = "";

    for (let i = 0; i < 6; i++) {
        let rnum = Math.floor(Math.random() * chars.length);
        screenID += chars.substring(rnum, rnum + 1);
    }
    return screenID;
}

exports.create_screen = catchAsync(async (req, res) => {
    let new_screen
    while(true){
        new_screen = create_random_screenID();
        if(ephermal_db[new_screen] === undefined){
            break;
        }
    }


    return res.status(200).json({ screenID: new_screen });
});

exports.get_screen = catchAsync(async (req, res) => {
    return res.status(200).json({
        message: "screen retrieved",
        data: ephermal_db["dummy"].getDetails()
    });
});

exports.update_screen = catchAsync(async (req, res) => {
    const { screenID, username, actions } = req.body;

    if (!ephermal_db[screenID]) {
        return res.status(404).json({ message: "Screen not found" });
    }

    ephermal_db[screenID].enqueue({ username, actions });

    // Optionally update the persistent database if needed here

    return res.status(200).json({
        message: "OK",
    });
});

exports.wait = catchAsync(async (req, res) => {
    const { screenID, username, initial } = req.body;

    if (!screenID || !username) {
        return res.status(400).json({ message: "screenID and username are required" });
    }

    if (ephermal_db[screenID] === undefined) {
        init_screen(screenID);
    }

    if (initial) {
        const doc = await ScreenModel.findOneAndUpdate(
            { screenID: screenID },
            { $setOnInsert: { data: JSON.stringify([]) } },
            { upsert: true, new: true }
        );
        return res.status(200).json({
            message: "initial screen updated",
            actions: JSON.parse(doc.data)
        });
    }

    console.log("Added ", username, " to the listener list");

    if (!listeners[screenID]) {
        listeners[screenID] = [];
    }
    listeners[screenID].push(username);
    node_listener[username] = res;
});

exports.clear = catchAsync(async (req, res) => {
    const { screenID } = req.body;

    if (!screenID) {
        return res.status(400).json({ message: "screenID is required" });
    }

    await ScreenModel.updateOne({ screenID: screenID }, { data: "[]" });
    redis_db[screenID] = [];
    ephermal_db[screenID] = new Queue();
    listeners[screenID] = [];

    return res.status(200).json({
        message: "screen cleared"
    });
});

exports.snapshot = catchAsync(async (req, res) => {
    // Implementation for snapshot
});

setInterval(async () => {
    for (const screenID of Object.keys(redis_db)) {
        if (redis_db[screenID].length === 0) {
            continue;
        }

        const goes_to_db = [];
        for (const event of redis_db[screenID]) {
            const datapoints = event[0].actions;
            for (const datapoint of datapoints) {
                goes_to_db.push({ x: datapoint.x, y: datapoint.y });
            }
        }

        const doc = await ScreenModel.findOne({ screenID: screenID });
        const parsed_doc = JSON.parse(doc.data || "[]");
        goes_to_db.forEach(point => {
            parsed_doc.push(point);
        });
        await ScreenModel.updateOne({ screenID: screenID }, { data: JSON.stringify(parsed_doc) });

        redis_db[screenID] = [];
    }
}, 3000);

setInterval(() => {
    for (const screenID of Object.keys(ephermal_db)) {
        if (ephermal_db[screenID] === undefined || ephermal_db[screenID].isEmpty()) {
            continue;
        }

        const currentListeners = [...listeners[screenID]];

        currentListeners.forEach(username => {
            if (node_listener[username]) {
                console.log("Sending response to ", username);

                const next_wait_response = node_listener[username];
                delete node_listener[username];
                next_wait_response.status(200).json({
                    message: "screen updated",
                    actions: ephermal_db[screenID].getDetails()
                });
            } else {
                console.log(`Listener ${username} not found`);
            }
        });

        redis_db[screenID].push(ephermal_db[screenID].getDetails());
        listeners[screenID] = [];
        ephermal_db[screenID] = new Queue();
    }
}, 100);
