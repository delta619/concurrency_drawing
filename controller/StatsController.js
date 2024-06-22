const catchAsync = require('../utils/catchAsync');
const { v4 } = require('uuid');
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
const listeners = { "ash": [] };
const node_listener = {};
ephermal_db["ash"] = new Queue();
redis_db = { "ash": [] }

exports.create_screen = catchAsync(async (req, res) => {
    let new_screen = v4();

    ephermal_db[new_screen] = new Queue();

    await ScreenModel.create({
        screen_id: new_screen
    });

    return res.status(200).json({ screen_id: new_screen });
});

exports.get_screen = catchAsync(async (req, res) => {
    let screen_id = req.body.screen_id;

    if (ephermal_db[screen_id] === undefined) {
        ephermal_db[screen_id] = new Queue();
    }

    let screen = await ScreenModel.findOne({ screen_id });
    if (screen && screen.data) {
        let initialData = JSON.parse(screen.data);
        initialData.forEach(action => ephermal_db[screen_id].enqueue(action));
    }

    return res.status(200).json({
        message: "screen retrieved",
        data: ephermal_db[screen_id]
    });
});

exports.update_screen = catchAsync(async (req, res) => {
    let screen_id = "ash";
    let username = req.body.username;
    let actions = req.body.actions;

    console.log(actions);

    ephermal_db[screen_id].enqueue({ username, actions });

    return res.status(200).json({
        message: "OK",
    });
});

exports.wait = (req, res) => {
    let screenID = "ash";
    let username = req.body.username;

    if (req.body.initial) {
        ScreenModel.findOne({ screenID: screenID }).then(doc => {
            return res.status(200).json({
                message: "initial screen updated",
                actions: JSON.parse(doc.data)
            });

        })
        return;
    }

    console.log("Added ", username, " to the listener list");

    listeners[screenID].push(username);
    node_listener[username] = res;
};

exports.clear = catchAsync(async (req, res) => {

    let screenID = "ash";
    await ScreenModel.updateOne({ screenID }, { data: "[]" });
    redis_db[screenID] = [];
    ephermal_db[screenID] = new Queue();
    listeners[screenID] = [];


    return res.status(200).json({
        message: "screen cleared"
    })

});

exports.snapshot = catchAsync(async (req, res) => {


    //     let goes_to_db = [];
    //     for (let event of redis_db["ash"]) {
    //         console.log(event);
    //         let datapoints = event[0].actions;
    //     for (let j = 0; j < datapoints.length; j++) {
    //         goes_to_db.push({ x: datapoints[j].x, y: datapoints[j].y });
    //     }
    //   }

    //   let doc = await ScreenModel.findOne({ screenID: "ash" });
    //   // parse the doc
    //     let parsed_doc = JSON.parse(doc.data);
    //     // add the new data
    //     goes_to_db.forEach(point => {
    //         parsed_doc.push(point);
    //     });
    //     // update the doc
    //     await ScreenModel.updateOne({ screenID: "ash" }, { data: JSON.stringify(parsed_doc) });



    //     return res.status(200).json({
    //         message: "snapshot taken",
    //         data: parsed_doc
    //     });


});


setInterval(async () => {
    if (redis_db["ash"].length == 0) {
        return
    }
    let goes_to_db = [];
    for (let event of redis_db["ash"]) {
        console.log(event);
        let datapoints = event[0].actions;
        for (let j = 0; j < datapoints.length; j++) {
            goes_to_db.push({ x: datapoints[j].x, y: datapoints[j].y });
        }
    }

    let doc = await ScreenModel.findOne({ screenID: "ash" });
    // parse the doc
    let parsed_doc = JSON.parse(doc.data);
    // add the new data
    goes_to_db.forEach(point => {
        parsed_doc.push(point);
    });
    // update the doc
    await ScreenModel.updateOne({ screenID: "ash" }, { data: JSON.stringify(parsed_doc) });

    redis_db["ash"] = [];


}, 3000);

setInterval(() => {
    if (ephermal_db["ash"].isEmpty()) {
        // console.log("No event for screen ash");
        return;
    }

    let currentListeners = [...listeners["ash"]];

    currentListeners.forEach(username => {
        if (node_listener[username]) {
            console.log("Sending response to ", username);

            let next_wait_response = node_listener[username];
            delete node_listener[username];
            next_wait_response.status(200).json({
                message: "screen updated",
                actions: ephermal_db["ash"].getDetails()
            });
        } else {
            console.log(`Listener ${username} not found`);
        }
    });

    redis_db["ash"].push(ephermal_db["ash"].getDetails());
    listeners["ash"] = [];
    ephermal_db["ash"] = new Queue();
}, 100);


