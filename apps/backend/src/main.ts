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

  // Rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
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

  // Apply rate limiter to auth routes
  app.use('/auth', authLimiter);

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
}

bootstrap();
