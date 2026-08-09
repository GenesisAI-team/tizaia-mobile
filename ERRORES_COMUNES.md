# Errores comunes y diagnóstico operativo

Esta guía recoge incidencias frecuentes del entorno de desarrollo. Debe consultarse antes de abrir una incidencia de herramientas o de atribuir un fallo a una dependencia.

## 1. Context7 y documentación técnica

### Síntoma

No se encuentra documentación actualizada, una API parece distinta a la esperada o se intenta consultar `ALL_TOOLS` desde una terminal.

### Diagnóstico y procedimiento

1. Usa las herramientas MCP de Context7 del runtime del agente:
   - `resolve_library_id` para obtener el identificador exacto de la biblioteca.
   - `query_docs` para consultar la documentación de una biblioteca y una pregunta concreta.
2. No ejecutes `ALL_TOOLS` desde PowerShell ni desde otra shell. `ALL_TOOLS` es un inventario disponible al runtime del agente, no una variable de entorno ni un comando del sistema.
3. Registra siempre:
   - Biblioteca y versión consultada.
   - Identificador resuelto por Context7.
   - Consulta realizada.
   - Decisión técnica tomada a partir de la consulta.
4. Si Context7 no está disponible, usa como fallback únicamente documentación web oficial. Registra explícitamente que se aplicó el fallback, la URL consultada y el motivo.

### Registro mínimo

```text
Biblioteca/versión:
Context7 library ID:
Consulta:
Decisión:
Fallback web oficial (si aplica):
Motivo del fallback:
```

### Registro de la consulta realizada para esta guia

| Campo | Registro |
| --- | --- |
| Biblioteca | Gradle |
| Library ID | `/gradle/gradle` |
| Version consultada | El wrapper local declara Gradle `9.3.1`; Context7 devolvio referencias `v8.14.3`, `v9_1_0_rc1` y `v9_0_0`, sin fijar una version de consulta solicitada. |
| Consulta | Seleccion de JVM de Gradle: `JAVA_HOME`, `org.gradle.java.home`, `--version`, parada de daemons y diagnostico de incompatibilidades. |
| Decision | Usar la salida del wrapper y la JVM del daemon como evidencia, preferir JDK 17 para este proyecto y mantener la configuracion desacoplada de rutas locales. |
| Fuentes devueltas | [Gradle wrapper](https://github.com/gradle/gradle/blob/master/gradlew), [daemon](https://github.com/gradle/gradle/blob/master/platforms/documentation/docs/src/docs/userguide/reference/runtime-configuration/gradle_daemon.adoc) y [build environment](https://github.com/gradle/gradle/blob/master/platforms/documentation/docs/src/docs/userguide/reference/runtime-configuration/build_environment.adoc). |

Si Context7 no esta disponible, el fallback permitido es consultar directamente la documentacion oficial enlazada y registrar la URL y el motivo. No se sustituyen las fuentes oficiales por resultados no verificados ni se inventan APIs.

## 2. Gradle, JDK y Android

### Diagnóstico inicial

Ejecuta desde `mobile/`:

```powershell
java -version
where.exe java
mobile/android/gradlew.bat --version
```

Si ya estás dentro de `mobile/`, usa `android/gradlew.bat --version`.

Compara la JVM del proceso con la que reporta Gradle. La salida de `gradlew.bat --version` es la referencia efectiva para el build, especialmente `Launcher JVM` y `Daemon JVM`.

### Fuentes de configuración

Revisa, en este orden:

1. `JAVA_HOME` y el primer `java.exe` encontrado por `where.exe java`.
2. `org.gradle.java.home` en `mobile/android/gradle.properties`, si existe.
3. El Gradle JDK configurado en Android Studio: `Settings > Build, Execution, Deployment > Build Tools > Gradle > Gradle JDK`.
4. Daemons Gradle ya iniciados, que pueden conservar una JVM anterior.

Después de cambiar de JVM, detén los daemons:

```powershell
cd mobile/android
./gradlew.bat --stop
```

En PowerShell también puede usarse `gradlew.bat --stop` desde `mobile/android`.

### Solución temporal

Para una comprobación puntual, define `JAVA_HOME` solo para el proceso actual usando una instalación local de JDK 17:

```powershell
$env:JAVA_HOME = 'C:\ruta\local\al\jdk-17'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java -version
cd mobile/android
./gradlew.bat --stop
./gradlew.bat assembleDebug
```

No se deben versionar rutas locales, configuraciones de usuario, JDK embebidos ni secretos. Si el build falla después de confirmar JDK 17, registra el nuevo error de Gradle/CMake/NDK por separado; no lo atribuyas a Java sin evidencia de la salida de `gradlew.bat --version`.

## Plantilla para nuevos errores

```markdown
## [Herramienta] Mensaje o síntoma

### Contexto

- Rama/commit:
- Sistema operativo:
- Comando:

### Diagnóstico

- Salida relevante:
- Causa confirmada o hipótesis:
- Cómo se descartaron causas alternativas:

### Solución o workaround

- Pasos ejecutados:
- ¿Es temporal o permanente?:
- ¿Se modificó algún archivo versionado?:

### Validación

- Comandos:
- Resultado:

### Riesgos y seguimiento

- Incidencia/PR:
- Próxima acción:
```
