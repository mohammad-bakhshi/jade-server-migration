const registerValidation = (req, res, next) => {
    console.log(req.body);
    const { firstName, lastName, userName, passWord } = req.body;
    const user = {};
    if (firstName) user.firstName = firstName
    else {
        res.statusCode = 400;
        res.end('First name is required');
        next();
    }
    if (lastName) user.lastName = lastName
    else {
        res.statusCode = 400;
        res.end('Last name is required');
        next();
    }
    if (userName) user.userName = userName
    else {
        res.statusCode = 400;
        res.end('user name is required');
        next();
    }
    if (passWord) user.passWord = passWord
    else {
        res.statusCode = 400;
        res.end('Pass word is required');
        next();
    }
    next(user);
};


const loginValidation = (req, res, next) => {

};

module.exports = { registerValidation, loginValidation };