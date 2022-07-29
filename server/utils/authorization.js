const JWT = require('jsonwebtoken');
const verifyAccessToken = async (req) => {
    try {
        if (!req.headers['authorization']) {
            return false;
        }
        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader.split(' ');
        const token = bearerToken[1];
        const result = await JWT.verify(token, process.env.ACCESS_TOKEN_SECRET)
        return result;
    } catch (error) {
        return false;
    }
}


module.exports = {
    verifyAccessToken
}