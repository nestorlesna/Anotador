# Apuntador 🎯

App para anotar puntos de juegos de cartas y dados (Generala, Truco, UNO). Desarrollada en React + Vite + TypeScript, compilada con Capacitor para Android.

---

## 🎮 Juegos disponibles

| Juego | Puntos | Descripción |
|-------|--------|-------------|
| Generala | - | Clásico juego de dados |
| Truco | 30 o 40 | Truco разделенный en Malas/Buenas |
| UNO | 250 o 500 | Con historial de últimas 5 rondas |

---

## 🚀 Desarrollo

### Instalar dependencias
```bash
npm install
```

### Ejecutar en navegador
```bash
npm run dev
```

### Verificar errores TypeScript
```bash
npm run build
```

---

## 📱 Generar APK

### 1. Cambiar versión (manual)

Editar `package.json`:
```json
{
  "name": "apuntador",
  "version": "1.0.1",    ← CAMBIAR ESTO (siguiente versión)
  ...
}
```

**Importante:** Mantener el formato `1.0.X` para que el sistema de actualizaciones funcione.

### 2. Build web
```bash
npm run build
```
Esto genera la carpeta `dist/` con los archivos web.

### 3. Sincronizar con Android
```bash
npx cap sync
```
Este paso copia los archivos de `dist/` a la carpeta del proyecto Android.

### 4. Build Android (automático)
```bash
cd android
./gradlew assembleDebug
```
O usando el script de npm:
```bash
npm run build:debug
```

El APK se genera en:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 4. Renombrar APK (recomendado)
Renombrar a: `apuntador-v1.0.1.apk` (donde `1.0.1` es la versión del `package.json`)

---

## 📦 Crear Release en GitHub

### Primera vez

1. Ir a: https://github.com/nestorlesna/Anotador/releases
2. Click **"Create a new release"**
3. Completar:

| Campo | Valor |
|-------|-------|
| Tag | `v1.0.0` (debe empezar con `v`) |
| Title | `v1.0.0 - APK` |
| Description | Ver ejemplo abajo |
| Attach files | Arrastrar el APK |

**Descripción recomendada:**
```markdown
versionCode: 1

🃏 Apuntador - Primera versión

Juegos incluidos:
• Generala - Juego de dados
• Truco - 30 o 40 puntos (Malas/Buenas)  
• UNO - 250 o 500 puntos

Para instalar: descargar el APK y abrirlo en el Android.
```

4. Click **"Publish release"**

### Versiones siguientes

1. Editar `package.json` → cambiar `version` (ej: `1.0.0` → `1.0.1`)
2. Ejecutar build:
   ```bash
   npm run build
   cd android
   ./gradlew assembleDebug
   ```
3. Copiar APK de `android/app/build/outputs/apk/debug/app-debug.apk`
4. Renombrar a `apuntador-v1.0.1.apk`
5. Ir a https://github.com/nestorlesna/Anotador/releases
6. Click **"Create a new release"**
7. Tag: `v1.0.1`, Title: `v1.0.1 - APK`, Description con el `versionCode` correspondiente
8. Subir el APK

---

## 🔄 Sistema de actualizaciones

La app consulta automáticamente GitHub Releases al iniciar. Si hay una versión más nueva disponible, muestra una alerta al usuario.

**No es necesario configurar la URL del APK** - el código ya extrae automáticamente la URL del archivo `.apk` del release.

### Cómo funciona:
1. Al abrir la app, después de 2 segundos consulta `https://api.github.com/repos/nestorlesna/Anotador/releases/latest`
2. Compara la versión del tag con la versión en `src/components/VersionChecker.tsx`
3. Si hay actualización, muestra alerta para descargar

---

## 📁 Estructura importante

| Archivo/Carpeta | Descripción |
|----------------|-------------|
| `package.json` | Versión de la app (`version`) |
| `src/components/VersionChecker.tsx` | Lógica de actualizaciones |
| `src/data/games.ts` | Configuración de juegos |
| `src/context/GameContext.tsx` | Estado global de la app |
| `src/pages/` | Pantallas de cada juego |
| `android/` | Proyecto Android (Capacitor) |
| `dist/` | Build web generado |

---

## ⚠️ Notas

- El APK generado es **debug** (no firmado). Para producción se recomienda configurar firma.
- La carpeta `android/` se regenera en cada build, pero no debe incluirse en `.gitignore`.
- El sistema de actualizaciones solo funciona en la app compilada, no en el servidor de desarrollo (`npm run dev`).