# Guía de Integración Backend Caribe Express con Flutter

Esta guía técnica está diseñada para el equipo de desarrollo móvil en **Flutter**, permitiendo conectar de forma inmediata y segura la app móvil con la API de **Caribe Express** (FastAPI + MongoDB `localhost:27017`).

---

## 1. Configuración de Conectividad y Base URL

En Flutter, la dirección IP para comunicarse con el backend local depende del entorno donde corre la app:

| Entorno de Ejecución Flutter | Host / Base URL Backend |
|---|---|
| **Emulador Android Oficial** | `http://10.0.2.2:8000/api/v1` |
| **Simulador iOS** | `http://localhost:8000/api/v1` |
| **Dispositivo Físico (WiFi)** | `http://192.168.X.X:8000/api/v1` (IP local de la PC) |
| **Flutter Web** | `http://localhost:8000/api/v1` |
| **Producción** | `https://api.caribeexpress.co/api/v1` |

### Constante recomendada en Dart:
```dart
import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:8000/api/v1';
    if (Platform.isAndroid) return 'http://10.0.2.2:8000/api/v1';
    return 'http://localhost:8000/api/v1';
  }
}
```

---

## 2. Dependencias de Flutter Recomendadas

Agrega en tu `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  dio: ^5.7.0                     # Cliente HTTP robusto con interceptores
  flutter_secure_storage: ^9.2.2   # Almacenamiento seguro de tokens JWT (Keystore / Keychain)
```

---

## 3. Flujo de Autenticación y Seguridad (JWT Access + Refresh)

El backend de Caribe Express implementa el estándar OAuth2 con dos niveles de tokens:
1. **`access_token`**: Token de corta duración para autorizar cada petición HTTP en la cabecera `Authorization: Bearer <access_token>`.
2. **`refresh_token`**: Token de larga duración (30 días) para renovar el `access_token` en segundo plano sin pedirle de nuevo la contraseña al usuario en la app móvil.

### 3.1. Modelo Dart (`auth_models.dart`)
```dart
class UserModel {
  final String id;
  final String email;
  final String fullName;
  final String? phone;
  final String role; // 'cliente', 'transportista', 'admin'
  final bool isActive;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    this.phone,
    required this.role,
    required this.isActive,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['full_name'] ?? '',
      phone: json['phone'],
      role: json['role'] ?? 'cliente',
      isActive: json['is_active'] ?? true,
    );
  }
}

class AuthResponse {
  final String accessToken;
  final String? refreshToken;
  final String tokenType;
  final int? expiresIn;
  final UserModel user;

  AuthResponse({
    required this.accessToken,
    this.refreshToken,
    required this.tokenType,
    this.expiresIn,
    required this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['access_token'],
      refreshToken: json['refresh_token'],
      tokenType: json['token_type'] ?? 'bearer',
      expiresIn: json['expires_in'],
      user: UserModel.fromJson(json['user']),
    );
  }
}
```

---

### 3.2. Servicio de Autenticación Flutter (`auth_service.dart`)

```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'auth_models.dart';
import 'api_config.dart';

class AuthService {
  final Dio _dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  AuthService() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'access_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          // Si el token expira (401), renovar automáticamente con refresh_token
          if (error.response?.statusCode == 401) {
            final refreshed = await _refreshToken();
            if (refreshed) {
              final opts = error.requestOptions;
              final newToken = await _storage.read(key: 'access_token');
              opts.headers['Authorization'] = 'Bearer $newToken';
              final response = await _dio.fetch(opts);
              return handler.resolve(response);
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  /// Iniciar Sesión en la app
  Future<AuthResponse> login(String email, String password) async {
    try {
      final res = await _dio.post(
        '/auth/login',
        data: {'email': email.trim(), 'password': password},
      );
      final auth = AuthResponse.fromJson(res.data);
      await _storage.write(key: 'access_token', value: auth.accessToken);
      if (auth.refreshToken != null) {
        await _storage.write(key: 'refresh_token', value: auth.refreshToken);
      }
      return auth;
    } catch (e) {
      rethrow;
    }
  }

  /// Registro de nuevo cliente o transportista
  Future<AuthResponse> register({
    required String email,
    required String password,
    required String fullName,
    String? phone,
    String role = 'cliente',
  }) async {
    final res = await _dio.post(
      '/auth/register',
      data: {
        'email': email.trim(),
        'password': password,
        'full_name': fullName.trim(),
        'phone': phone,
        'role': role,
      },
    );
    final auth = AuthResponse.fromJson(res.data);
    await _storage.write(key: 'access_token', value: auth.accessToken);
    if (auth.refreshToken != null) {
      await _storage.write(key: 'refresh_token', value: auth.refreshToken);
    }
    return auth;
  }

  /// Renovar Access Token usando Refresh Token
  Future<bool> _refreshToken() async {
    try {
      final refresh = await _storage.read(key: 'refresh_token');
      if (refresh == null) return false;

      final res = await Dio(BaseOptions(baseUrl: ApiConfig.baseUrl)).post(
        '/auth/refresh',
        data: {'refresh_token': refresh},
      );
      final auth = AuthResponse.fromJson(res.data);
      await _storage.write(key: 'access_token', value: auth.accessToken);
      if (auth.refreshToken != null) {
        await _storage.write(key: 'refresh_token', value: auth.refreshToken);
      }
      return true;
    } catch (_) {
      await _storage.deleteAll();
      return false;
    }
  }

  /// Obtener perfil actual del usuario autenticado
  Future<UserModel> getMe() async {
    final res = await _dio.get('/auth/me');
    return UserModel.fromJson(res.data);
  }

  /// Cerrar Sesión
  Future<void> logout() async {
    await _storage.deleteAll();
  }
}
```

---

## 4. Endpoints Principales Disponibles para Flutter

### Autenticación y Seguridad
- `POST /api/v1/auth/login`: Autentica y entrega Access Token + Refresh Token (rate limit: 10/minuto).
- `POST /api/v1/auth/register`: Registro de clientes o transportistas.
- `POST /api/v1/auth/refresh`: Renovación silenciosa de token expirado.
- `GET /api/v1/auth/me`: Perfil completo del usuario activo.
- `PUT /api/v1/auth/profile`: Actualizar nombre o teléfono.
- `POST /api/v1/auth/change-password`: Cambio seguro de contraseña.

### Cotizador y Rutas (Algorítmico + Google Maps)
- `POST /api/v1/quotes/calculate`: Envía ciudades, inventario de enseres y pisos para recibir desglose exacto de precio en COP.
- `GET /api/v1/maps/places/autocomplete?query=...&city=Barranquilla`: Autocompletado de direcciones.
- `GET /api/v1/maps/directions?origin=...&destination=...`: Distancia en km, peajes y tiempo de viaje con tráfico.

### Marketplace y Mudanzas
- `GET /api/v1/carriers`: Lista de transportistas con filtros (`city`, `vehicleType`, `onlyVerified`).
- `GET /api/v1/orders`: Listado de órdenes de mudanza.
- `GET /api/v1/orders/{tracking_code}`: Rastrear mudanza y consultar línea de tiempo de estados (`cargando`, `en_ruta`, `descargando`, `completado`).
- `POST /api/v1/orders`: Generar nueva orden de mudanza.

### Habeas Data y Cumplimiento
- `GET /api/v1/privacy/policy`: Resumen legal bajo Ley 1581 de 2012 / GDPR.
- `POST /api/v1/privacy/consent`: Registrar aceptación de términos y tratamiento de datos personales.

---

## 5. Cuentas Demo Disponibles para Pruebas en Flutter

| Rol | Correo Electrónico | Contraseña |
|---|---|---|
| **Administrador** | `admin@caribeexpress.co` | `AdminCaribe2026!` |
| **Transportista Verificado** | `operaciones@transportesdelcaribe.com.co` | `Carrier2026!` |
| **Transportista 2** | `contacto@mudanzaslaheroica.com` | `Heroica2026!` |
| **Cliente** | `cliente@caribeexpress.co` | `Cliente2026!` |

---

## 6. Documentación Interactiva Swagger
Al iniciar el backend (`uvicorn backend.main:app --port 8000`), puedes ver e interactuar con toda la documentación OpenAPI en:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

