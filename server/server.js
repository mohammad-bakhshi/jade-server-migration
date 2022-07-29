
const http = require("http");
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');
const createError = require('http-errors');
const dotenv = require('dotenv')
const config = dotenv.config({ path: path.join(__dirname, './config.env') });
if (config.error) console.log('[-] dotenv config > ' + config.error.message);

const User = require('./models/user.model');
require('./connection').makeConnection(process.env.MONGODB_URL);
const { cktsim } = require('./utils/cktsim-server');
const { signAccessToken, signRefreshToken, verifyRefreshToken, redisClient } = require('./utils/jwt_helper');
const { verifyAccessToken } = require('./utils/authorization');

const PORT = process.env.PORT || 7000;

const server = http.createServer(async function (req, res) {

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
                        const user = await User.findOne({ username: newUser.userName }, { username: 1, _id: 0 }).exec();
                        if (true) {
                            const salt = await bcrypt.genSalt(10);
                            newUser.passWord = await bcrypt.hash(newUser.passWord, salt);
                            const created_user = await User.create(newUser);
                            const accessToken = await signAccessToken(created_user._id.toString());
                            const refreshToken = await signRefreshToken(created_user._id.toString());
                            res.statusCode = 201;
                            return res.end(JSON.stringify({ message: "User was created successfully.", accessToken, refreshToken }));
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
                                const accessToken = await signAccessToken(user._id.toString());
                                const refreshToken = await signRefreshToken(user._id.toString());
                                res.statusCode = 200;
                                return res.end(JSON.stringify({ message: "You are logged in.", accessToken, refreshToken }));
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
        case '/refreshtoken':
            {
                if (method === 'POST') {
                    let body = "";
                    req.on("data", function (chunk) {
                        body += chunk;
                    });
                    req.on("end", async function () {
                        res.setHeader("Content-Type", "text/json");
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        const data = JSON.parse(body);
                        try {
                            const { refreshToken } = data;
                            if (!refreshToken) {
                                res.statusCode = 400;
                                return res.end(JSON.stringify({ message: 'Refresh token is required.' }));
                            };
                            const userId = await verifyRefreshToken(refreshToken);

                            const accessToken = await signAccessToken(userId);
                            const refToken = await signRefreshToken(userId);
                            res.statusCode = 200;
                            return res.end(JSON.stringify({ accessToken, refreshToken: refToken }));
                        } catch (error) {
                            res.statusCode = error.statusCode;
                            return res.end(JSON.stringify({ message: 'Unauthorized' }));
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
                if (method === 'POST') {
                    res.setHeader("Content-Type", "text/json");
                    res.setHeader("Access-Control-Allow-Origin", "*");
                    // const verify = await verifyAccessToken(req);
                    // if (verify) {
                    let jade = '';
                    req.on('data', chunk => {
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
                    // }
                    // else {
                    //     res.statusCode = 401;
                    //     res.end(JSON.stringify({ message: 'Unauthorized' }))
                    // }
                }
                else {
                    res.statusCode = 404;
                    res.end('Not Found');
                }
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


