import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ResponseWrapperInterceptor } from "./common/response-wrapper";
import { HttpExceptionFilter } from "./common/response-wrapper";

const isProduction = process.env.NODE_ENV === "production";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin:
      process.env.FRONTEND_URL ||
      (isProduction
        ? "https://smm-league.lovable.app"
        : "http://localhost:3000"),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Rate limiting for login endpoint only
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 5 : 100, // keep strict in prod, relaxed in local dev
    skipSuccessfulRequests: true,
    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many login attempts, please try again after 15 minutes",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Global validation pipe with better error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Global response wrapper interceptor
  app.useGlobalInterceptors(new ResponseWrapperInterceptor());

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Apply rate limiter only to login
  app.use("/auth/login", loginLimiter);

  // Basic service routes for browser/API smoke checks
  expressApp.get("/", (_req, res) => {
    res.json({
      success: true,
      data: {
        name: "SMM League API",
        status: "ok",
        docs: "Use module routes like /auth/login, /campaigns, /deals",
      },
      timestamp: new Date().toISOString(),
    });
  });

  expressApp.get("/health", (_req, res) => {
    res.json({
      success: true,
      data: { status: "healthy" },
      timestamp: new Date().toISOString(),
    });
  });

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
}

bootstrap();
