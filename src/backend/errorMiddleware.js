// Global Error Handler Middleware
const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Terjadi kesalahan internal pada server";

    // Log error di console server untuk kebutuhan debugging
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.url} - Error: ${message}`);
    
    if (statusCode === 500) {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        // Stack trace hanya muncul jika environment bukan production
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

export default errorMiddleware;