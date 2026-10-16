import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

interface CheckResult {
    category: string;
    item: string;
    status: "PASS" | "WARN" | "FAIL";
    message: string;
}

const results: CheckResult[] = [];

const addCheck = (category: string, item: string, status: "PASS" | "WARN" | "FAIL", message: string) => {
    results.push({ category, item, status, message });
};

const runPreFlightCheck = async () => {
    console.log("=================================================");
    console.log("   KalTech E-Commerce - Verificacion Pre-Vuelo   ");
    console.log("=================================================\n");

    // 1. Entorno de Ejecucion
    const nodeEnv = process.env.NODE_ENV || "development";
    if (nodeEnv === "production") {
        addCheck("Entorno", "NODE_ENV", "PASS", "Configurado en 'production'");
    } else {
        addCheck("Entorno", "NODE_ENV", "WARN", `Configurado en '${nodeEnv}'. Para despliegues se recomienda 'production'`);
    }

    // 2. Base de Datos MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        addCheck("Base de Datos", "MONGO_URI", "FAIL", "Variable MONGO_URI no definida");
    } else if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
        addCheck("Base de Datos", "MONGO_URI", "FAIL", "MONGO_URI debe comenzar con mongodb:// o mongodb+srv://");
    } else {
        try {
            console.log("Probando conexion con MongoDB...");
            const start = Date.now();
            await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
            const elapsed = Date.now() - start;
            addCheck("Base de Datos", "Conectividad", "PASS", `Conexion exitosa con MongoDB (${elapsed}ms)`);
            await mongoose.disconnect();
        } catch (error) {
            addCheck("Base de Datos", "Conectividad", "FAIL", `Fallo al conectar con MongoDB: ${(error as Error).message}`);
        }
    }

    // 3. Seguridad JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        addCheck("Seguridad", "JWT_SECRET", "FAIL", "Variable JWT_SECRET no definida");
    } else if (jwtSecret.length < 32) {
        const severity = nodeEnv === "production" ? "FAIL" : "WARN";
        addCheck("Seguridad", "JWT_SECRET", severity, `JWT_SECRET tiene ${jwtSecret.length} caracteres. Para produccion debe tener al menos 32 caracteres`);
    } else if (jwtSecret.toLowerCase().includes("secret") || jwtSecret.toLowerCase().includes("changeme") || jwtSecret.toLowerCase().includes("test")) {
        addCheck("Seguridad", "JWT_SECRET", "WARN", "JWT_SECRET parece contener palabras genericas. Usa una clave criptografica segura");
    } else {
        addCheck("Seguridad", "JWT_SECRET", "PASS", `Clave valida (${jwtSecret.length} caracteres)`);
    }

    // 4. Almacenamiento Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (cloudName && apiKey && apiSecret) {
        addCheck("Almacenamiento", "Cloudinary", "PASS", `Configurado correctamente para el cloud '${cloudName}'`);
    } else {
        addCheck("Almacenamiento", "Cloudinary", "WARN", "Credenciales de Cloudinary incompletas. La subida de imagenes requerira esta configuracion");
    }

    // 5. Correo Electronico SMTP
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    if (smtpHost && smtpUser) {
        addCheck("Notificaciones", "SMTP", "PASS", `Servidor SMTP configurado: ${smtpHost}`);
    } else {
        addCheck("Notificaciones", "SMTP", "WARN", "Sin servidor SMTP. Los correos se registraran en consola (modo sandbox local)");
    }

    // 6. Pasarelas de Pago
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const paypalId = process.env.PAYPAL_CLIENT_ID;
    if (stripeKey && !stripeKey.startsWith("sk_test_")) {
        addCheck("Pagos", "Stripe", "PASS", "Stripe configurado en modo PRODUCCION (live key)");
    } else if (stripeKey) {
        addCheck("Pagos", "Stripe", "PASS", "Stripe configurado en modo SANDBOX / TEST");
    } else {
        addCheck("Pagos", "Stripe", "WARN", "Stripe no configurado (se utilizara simulador de pagos)");
    }

    if (paypalId) {
        const mode = process.env.PAYPAL_MODE || "sandbox";
        addCheck("Pagos", "PayPal", "PASS", `PayPal configurado en modo '${mode}'`);
    } else {
        addCheck("Pagos", "PayPal", "WARN", "PayPal no configurado");
    }

    // 7. Autenticacion Social
    const googleId = process.env.GOOGLE_CLIENT_ID;
    const fbAppId = process.env.FACEBOOK_APP_ID;
    if (googleId) {
        addCheck("Social Auth", "Google", "PASS", "Google Client ID configurado");
    } else {
        addCheck("Social Auth", "Google", "WARN", "Google Client ID no configurado (opcional)");
    }
    if (fbAppId) {
        addCheck("Social Auth", "Facebook", "PASS", "Facebook App ID configurado");
    } else {
        addCheck("Social Auth", "Facebook", "WARN", "Facebook App ID no configurado (opcional)");
    }

    // 8. Cuenta de Administrador
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
        addCheck("Administrador", "Admin Seed", "PASS", `Configurado para '${adminEmail}' (listo para npm run seed:admin)`);
    } else {
        addCheck("Administrador", "Admin Seed", "WARN", "Credenciales de seed de admin usando valores por defecto");
    }

    // Impresion de Resultados
    console.log("\n-------------------------------------------------");
    console.log("              RESULTADOS DEL ANALISIS            ");
    console.log("-------------------------------------------------");

    let hasFail = false;
    let hasWarn = false;

    for (const res of results) {
        const tag = res.status === "PASS"
            ? "[OK]  "
            : res.status === "WARN"
            ? "[WARN]"
            : "[FAIL]";
        console.log(`${tag} [${res.category}] ${res.item}: ${res.message}`);
        if (res.status === "FAIL") hasFail = true;
        if (res.status === "WARN") hasWarn = true;
    }

    console.log("-------------------------------------------------");
    if (hasFail) {
        console.error("\n[X] ATENCION: Existen errores criticos que impiden el despliegue a produccion. Corrige las variables marcadas con [FAIL].\n");
        process.exit(1);
    } else if (hasWarn) {
        console.log("\n[!] AVISO: El servidor esta listo para funcionar, pero revisa las advertencias [WARN] para funciones opcionales antes de produccion.\n");
        process.exit(0);
    } else {
        console.log("\n[V] EXCELENTE: Todas las comprobaciones de produccion estan en verde. Listo para despliegue.\n");
        process.exit(0);
    }
};

runPreFlightCheck().catch((error) => {
    console.error("Error durante el chequeo pre-vuelo:", error);
    process.exit(1);
});
