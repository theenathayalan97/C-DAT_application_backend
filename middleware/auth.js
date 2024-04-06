// auth.js

const jwt = require('jsonwebtoken');
let database = require('../Connections/postgres')

let user = database.users

async function authorization(req, res, next) {
    let auth = req.headers.authorization
    if (!auth) {
        return res.status(400).json({ message: "cannot read the token" })
    }
    let token = auth.split(' ')

    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    try {
        let verify = jwt.verify(token[1], jwtSecretKey);

        if (verify) {
            req.role = verify.role;
            req.id = verify.uuid;
            if (req.role == 'superAdmin') {
                next();
            } else {
                req.organization_id = verify.organization_id
                let organizationCheck = await user.findOne({
                    where: { uuid: req.id, organization_id: req.organization_id }
                })
                if (!organizationCheck) {
                    return res.status(400).json({ message: "Access Denied for the organization" })
                } else {
                    next();
                }
            }
        } else {
            return res.status(404).json({ message: "user not found" });
        }

    } catch (error) {
        if((error.message).includes("invalid signature")){
            return res.status(400).json({ error: "Invalid token" });
        }
        console.error("Error verifying token:", error.message);
        return res.status(400).json({ error: "something went wrong", result: error.message });
    }
}

function authentication(permission, isSuperAdmin) {
    return async function (req, res, next) {
        try {
            let data = req.role;
            let value = []
            for (let i = 0; i < permission.length; i++) {
                if (data == permission[i]) {
                    value.push(1)
                    next();
                }
            }
            if (value.length == 0) {
                return res.status(403).json({ error: 'access denied' });
            }

        } catch (error) {
            console.error("Error verifying token:", error.message);
            res.status(400).json({ error: "something went wrong", result: error.message });
        }
    }
}

module.exports = { authorization, authentication };
