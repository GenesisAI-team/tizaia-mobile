# Ejecutar desde la raiz del repositorio:
# powershell -ExecutionPolicy Bypass -File .\scripts\set-supabase-project-ref.ps1
#
# El project ref se solicita y se guarda como variable de usuario.
# No se muestra ni se escribe en el repositorio.

$ErrorActionPreference = "Stop"
$projectRef = Read-Host "Pega SUPABASE_PROJECT_REF"

if ([string]::IsNullOrWhiteSpace($projectRef)) {
    throw "El project ref no puede estar vacio."
}

[Environment]::SetEnvironmentVariable(
    "SUPABASE_PROJECT_REF",
    $projectRef.Trim(),
    "User"
)

Write-Host "SUPABASE_PROJECT_REF configurado para tu usuario."
Write-Host "Cierra y abre una terminal nueva antes de ejecutar OpenCode."

Remove-Variable -Name projectRef -ErrorAction SilentlyContinue
