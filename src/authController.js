import { Router } from 'express';
import jwt from 'jsonwebtoken';

import { getUserProfile, getToken } from './authService';

function AuthController() {
    const router = new Router();

    router.post('/login', async (req, res, next) => {
        const payload = {
            grant_type: global.authConfig.grant_type,
            client_id: global.authConfig.client_id,
            client_secret: global.authConfig.client_secret,
        };
        payload.username = req.body.username;
        payload.password = req.body.password;
        try {
            const response = await getToken(payload);
            const profile = await getUserProfile(response.data.access_token);
            const userObj = {
                ...response.data,
                access_token: jwt.sign(
                    { ...response.data },
                    global.authConfig.client_secret
                ),
                user: profile.data,
            };
            console.log(userObj);

            // const expireTs = Date.now() + userObj.expires_in * 1000;
            // res.cookie('session', JSON.stringify(response.data), {
            //     expires: expireTs,
            //     secure: false,
            //     httpOnly: true,
            // });
            userObj.createdTs = Date.now();
            console.log('===start===');
            console.log(userObj);
            console.log('===end===');
            res.send(userObj);
            next();
        } catch (error) {
            if (
                error.response &&
                error.response.status &&
                error.response.data
            ) {
                res.status(error.response.status).send(error.response.data);
            } else {
                res.status(500).send({ message: 'error occurred' });
            }
        }
    });

    router.post('/refresh', async (req, res, next) => {
        const payload = {
            grant_type: 'refresh_token',
            client_id: global.authConfig.client_id,
            client_secret: global.authConfig.client_secret,
        };
        payload.refresh_token = req.body.refresh_token;
        try {
            const response = await getToken(payload);
            const expireTs = Date.now() + response.data.expires_in * 1000;
            response.data.createdTs = Date.now();

            res.cookie('session', JSON.stringify(response.data), {
                expires: expireTs,
                secure: false,
                httpOnly: true,
            });
            res.send(response.data);
            next();
        } catch (error) {
            res.status(500).send(error.response.data);
        }
    });

    router.get('/logout', async (req, res, next) => {
        // TODO implement
    });

    return router;
}

export default AuthController;
