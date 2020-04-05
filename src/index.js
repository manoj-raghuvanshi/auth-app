import jwt from 'jsonwebtoken';
import AuthController from './authController';

const defaultConfig = {
    authUrl: 'https://tesseract.medlife.com',
    grant_type: 'password',
    client_secret: '1730590677b2d99a706dc2dc3cde399e76089ee5422168da',
    client_id: '6987025429870713',
    appName: 'app-user',
};

export default class AuthHandler {
    constructor(app, options) {
        if (!app) {
            throw new Error('an express app is required');
        }
        if (options && typeof options === 'object') {
            global.authConfig = { ...defaultConfig, ...options };
        }
        app.use('auth', AuthController());
    }

    // eslint-disable-next-line class-methods-use-this
    checkAuth(req, res, next) {
        let token = req.headers['x-access-token'] || req.headers.authorization;
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }

        if (token) {
            jwt.verify(
                token,
                global.authConfig.client_secret,
                (err, decoded) => {
                    if (err) {
                        return res.send(401);
                    }
                    req.decoded = decoded;
                    next();
                }
            );
        }
        return res.status(400).json({
            success: false,
            message: 'Auth token is not supplied',
        });
    }
}
