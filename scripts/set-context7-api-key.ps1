# Ejecutar desde la raiz del repositorio:
# powershell -ExecutionPolicy Bypass -File .\scripts\set-context7-api-key.ps1
#
# El API key se solicita de forma oculta y se guarda como variable de usuario.
# No se muestra ni se escribe en el repositorio.

$ErrorActionPreference = "Stop"
$secureApiKey = Read-Host "Pega CONTEXT7_API_KEY" -AsSecureString
$pointer = [IntPtr]::Zero

try {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureApiKey)
    $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)

    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        throw "El API key no puede estar vacio."
    }

    [Environment]::SetEnvironmentVariable(
        "CONTEXT7_API_KEY",
        $apiKey,
        "User"
    )

    Write-Host "CONTEXT7_API_KEY configurado para tu usuario."
    Write-Host "Cierra y abre una terminal nueva antes de ejecutar OpenCode."
}
finally {
    if ($pointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }

    Remove-Variable -Name apiKey -ErrorAction SilentlyContinue
}
