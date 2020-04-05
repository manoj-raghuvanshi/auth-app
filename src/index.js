import jwt from 'jsonwebtoken';
import AuthController from './authController';

const defaultConfig = {
    baseUrl: '',
    grant_type: 'password',
    client_secret: '',
    client_id: '',
    appName: 'app-user',
};

export default class AuthHandler {
    constructor(app, options) {
        if (!(app && options)) {
            throw new Error('app and config required');
        }
        global.authConfig = defaultConfig;
        if (options && typeof options === 'object') {
            const requiredKeys = [];
            Object.keys(defaultConfig).forEach((key) => {
                if (!options[key]) {
                    requiredKeys.push(key);
                }
            });
            if (requiredKeys.length) {
                throw new Error(
                    `pass the required keys:  ${requiredKeys.join(', ')}`
                );
            }
            global.authConfig = { ...defaultConfig, ...options };
        }
        app.use('/auth', AuthController());
    }

    // eslint-disable-next-line class-methods-use-this
    checkAuth(req, res, next) {
        let token = req.headers['x-access-token'] || req.headers.authorization;
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
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
        } else {
            return res.status(400).json({
                success: false,
                message: 'Auth token is not supplied',
            });
        }
    }
}
