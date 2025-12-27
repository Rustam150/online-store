const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Bascket } = require('../models/models'); 

const generateJwt = (id, email, role) => {
    return jwt.sign(
        {id, email, role},
        process.env.SECRET_KEY || 'default-secret-key', 
        {expiresIn: '24h'}
    )
}

class UserController {
    async registration(req, res, next) {
        try {
            console.log('Registration request:', req.body);
            
            const {email, password, role} = req.body;
            
            if (!email || !password) {
                return next(ApiError.badRequest('Некорректный email или пароль'));
            }
            
            const candidate = await User.findOne({ where: { email } });
            if (candidate) {
                return next(ApiError.badRequest('Пользователь с таким email уже существует'));
            }
            
            const hashPassword = await bcrypt.hash(password, 5);
            console.log('Hash created, creating user...');
            
            const user = await User.create({ 
                email, 
                role: role || 'USER', 
                password: hashPassword
            });
            
            console.log('User created, creating basket...');
            const basket = await Bascket.create({ userId: user.id }); 
            console.log('Basket created');
            
            const token = generateJwt(user.id, user.email, user.role);
            
            return res.json({ 
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            });
            
        } catch (error) {
            console.error('Registration error:', error);
            return next(ApiError.internal(error.message));
        }
    }

    async login(req, res, next) {
        try {
            const {email, password } = req.body;
            const user = await User.findOne({where: {email}});
            
            if (!user) {
                return next(ApiError.internal('Пользователь не найден'));
            }
            
            let comparePassword = bcrypt.compareSync(password, user.password);
            if (!comparePassword) {
                return next(ApiError.internal('Указан неверный пароль'));
            }
            
            const token = generateJwt(user.id, user.email, user.role);
            return res.json({ 
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            return next(ApiError.internal(error.message));
        }
    }
    
    async check(req, res, next) {
        try {
            if (!req.user) {
                return res.json({ message: 'No auth middleware, check endpoint works' });
            }
            
            const token = generateJwt(req.user.id, req.user.email, req.user.role);
            return res.json({ 
                token,
                user: req.user
            });
        } catch (error) {
            return next(ApiError.internal(error.message));
        }
    }
}

module.exports = new UserController();