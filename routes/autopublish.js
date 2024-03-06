const express = require("express");
const router = express.Router();
const database = require("../database");
const { raw } = require("mysql2");

async function newChannel(channel) {
    return new Promise((resolve, reject) => {
        database.query("INSERT INTO `auto_publist_list`(`channel_id`) VALUES (?)", [channel], (err, results) => {
            if (err) {
                console.error('Error executing MySQL query:', err);
                reject(err);
            } else {
                resolve(results);
            }
        })
    });
};

async function getChannel() {
    return new Promise((resolve, reject) => {
        database.query("SELECT * FROM `auto_publist_list`", [], (err, results) => {
            if (err) {
                console.error('Error executing MySQL query:', err);
                reject(err);
            } else {
                resolve(results);
            }
        })
    });
};

async function deleteChannel(channel) {
    return new Promise((resolve, reject) => {
        database.query("DELETE FROM `auto_publist_list` WHERE `channel_id` = ?", [channel], (err, results) => {
            if (err) {
                console.error('Error executing MySQL query:', err);
                reject(err);
            } else {
                resolve(results);
            }
        })
    });
};

router.post('/new', async (req, res) => {
    const { channel } = req.body;
    if (!channel) return res.status(400).json({ status: 1, message: "Invalid channel" })

    const data = await newChannel(channel);

    if (!data) return res.status(500).json({
        status: 1,
        message: "Internal Server Error"
    });

    return res.status(200).json({
        status: 0,
        success: true,
        message: `Create new ${channel}`
    })
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ status: 1, message: "Invalid id" })

    const data = await deleteChannel(id);

    if (!data) return res.status(500).json({
        status: 1,
        message: "Internal Server Error"
    });

    return res.status(200).json({
        status: 0,
        success: true,
        message: `Deleted ${id}`
    })
});

router.get('/list', async (req, res) => {
    const data = await getChannel();

    if (!data) return res.status(500).json({
        status: 1,
        message: "Internal Server Error"
    });

    const channels = [];

    data.forEach(raw => {
        channels.push(raw.channel_id);
    });

    return res.status(200).json({
        status: 0,
        channels: channels
    });
});


module.exports = router