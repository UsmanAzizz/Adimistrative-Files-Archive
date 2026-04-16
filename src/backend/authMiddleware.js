export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            message: "Akses ditolak: Hanya Admin yang diizinkan." 
        });
    }
};