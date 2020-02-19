const express = require('express');
const db = require('./data/dbConfig.js');
const server = express();

server.use(express.json());

server.get('/', (req, res) => {
    db('accounts')
        .then(accounts => {
            res.status(200).json(accounts)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'failed to get the list of accounts' })
        })
});
server.get('/:id', validateAccountId, (req, res) => {
    const { id } = req.params;
    db('accounts').where({id})
        .first()
        .then(account => {
            res.status(200).json(account)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'failed to get the account' })
        })
});
server.post('/', validateAccountBody, (req, res) => {
    const newAcct = req.body;
    db('accounts')
        .insert(newAcct, 'id')
        .then(id => {
            db('accounts').where({id})
                .then(account => {
                    res.status(200).json(account[0])
                })
                .catch(err => {
                    console.log(err);
                    res.json(500).json({ error: "could not retrieve posted account"})
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'failed to get the the new accounts' })
        })
});
server.put('/:id', validateAccountBody, (req, res) => {
    const { id } = req.params;
    const changes = req.body;
    db('accounts').where({id})
        .update(changes)
        .then(count => {
            res.status(200).json(count);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'failed to update the account' })
        })
});
server.delete('/:id', validateAccountId, (req, res) => {
    const { id } = req.params;
    db('accounts').where({id})
        .del()
        .then(count => {
            res.status(200).json(count)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'failed to delete the account' })
        })
});

module.exports = server;

function validateAccountBody(req, res, next){
    const account = req.body;
    if(account.name && account.budget){
        next();
    } else {
        res.status(400).json({ error: "please input a valid Name and Budget Number!"})
    }
};
function validateAccountId(req, res, next){
    const { id } = req.params;
    db('accounts').where({id})
        .then(account => {
            console.log(account)
            if(account.length > 0){
                next();
            } else {
                res.status(404).json({ error: "Could not find an account with this ID"})
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Could not retrieve the account with this ID' })
        })
};