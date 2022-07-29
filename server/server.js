
const http = require("http");
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/user.model');
require('./connection').makeConnection('mongodb://localhost:27017/jade');
const { registerValidation } = require('./middleware/validation');
const { cktsim } = require('./utils/cktsim-server');

const PORT = process.env.PORT || 7000;

const server = http.createServer(function (req, res) {

    const path = req.url;
    const method = req.method;

    switch (path) {
        case '/signup':
            {
                if (method === 'POST') {
                    let body = "";
                    req.on("data", function (chunk) {
                        body += chunk;
                    });

                    req.on("end", async function () {
                        const data = JSON.parse(body);
                        const newUser = {};
                        res.setHeader("Content-Type", "text/json");
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        if (data.firstName) newUser.firstName = data.firstName
                        else {
                            res.statusCode = 400;
                            return res.end(JSON.stringify({ error: 'First name is required' }));
                        }
                        if (data.lastName) newUser.lastName = data.lastName
                        else {
                            res.statusCode = 400;
                            return res.end(JSON.stringify({ error: 'Last name is required' }));
                        }
                        if (data.userName) newUser.userName = data.userName
                        else {
                            res.statusCode = 400;
                            return res.end(JSON.stringify({ error: 'user name is required' }));
                        }
                        if (data.passWord) newUser.passWord = data.passWord
                        else {
                            res.statusCode = 400;
                            return res.end(JSON.stringify({ error: 'Pass word is required' }));
                        }
                        const user = await User.findOne({ username: newUser.userName }, { username: 1, _id: 0 });
                        if (!user) {
                            const salt = await bcrypt.genSalt(10);
                            newUser.passWord = await bcrypt.hash(newUser.passWord, salt);
                            await User.create(newUser);
                            res.statusCode = 201;
                            return res.end(JSON.stringify({ message: "User was created successfully." }));
                        } else {
                            res.statusCode = 422;
                            return res.end(JSON.stringify({ message: "Username already exists." }));
                        }
                    });
                }
                else {
                    res.statusCode = 404;
                    return res.end('Not Found');
                }
            }
            break;
        case '/login':
            {
                if (method === 'POST') {
                    let body = "";
                    req.on("data", function (chunk) {
                        body += chunk;
                    });
                    req.on("end", async function () {
                        const data = JSON.parse(body);
                        const newUser = {};
                        res.setHeader("Content-Type", "text/json");
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        if (data.userName) newUser.userName = data.userName
                        else {
                            res.statusCode = 400;
                            return res.end(JSON.stringify({ error: 'user name is required' }));
                        }
                        if (data.passWord) newUser.passWord = data.passWord
                        else {
                            res.statusCode = 400;
                            return res.end(JSON.stringify({ error: 'Pass word is required' }));
                        }
                        const user = await User.findOne({ userName: newUser.userName });
                        if (!user) {
                            res.statusCode = 422;
                            return res.end(JSON.stringify({ message: "User not found" }));
                        } else {
                            const validPassword = await bcrypt.compare(newUser.passWord, user.passWord);
                            if (validPassword) {
                                // req.session.blogger = blogger;
                                res.statusCode = 200;
                                return res.end(JSON.stringify({ message: "You are logged in." }));
                            }
                            else {
                                res.statusCode = 422;
                                return res.end(JSON.stringify({ message: "Password was not correct." }));
                            }
                        }
                    });
                }
                else {
                    res.statusCode = 404;
                    res.end('Not Found');
                }
            }
            break;
        case '/':
            {
                let jade = '';
                req.on('data', chunk => {
                    console.log(`chunk of data${chunk}`);
                    jade += chunk;
                })
                req.on('end', () => {
                    if (jade != null && jade != "" && req.method == "POST") {
                        const result = cktsim(jade);
                        const finally_result = result.substr(27, result.length - 35);
                        res.setHeader("Content-Type", "text/json");
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.end(JSON.stringify(finally_result));
                    }
                    else {
                        res.setHeader("Content-Type", "text/json");
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.end('starting');
                    }
                })
            }
            break;
        default:
            {
                res.end('not found')
            }
            break;
    }

});
server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));


