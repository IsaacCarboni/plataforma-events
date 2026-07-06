import bcrypt from 'bcrypt';

export const createHash = async (password) => {
    const salts = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salts);
};

export const isValidPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};