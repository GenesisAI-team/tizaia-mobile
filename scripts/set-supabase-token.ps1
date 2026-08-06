# Ejecutar desde la raiz del repositorio:
# powershell -ExecutionPolicy Bypass -File .\scripts\set-supabase-token.ps1
#
# El token se solicita de forma oculta y se guarda como variable de usuario.
# No se muestra ni se escribe en el repositorio.

$ErrorActionPreference = "Stop"
$secureToken = Read-Host "Pega SUPABASE_ACCESS_TOKEN" -AsSecureString
$pointer = [IntPtr]::Zero

try {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
    $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)

    if ([string]::IsNullOrWhiteSpace($token)) {
        throw "El token no puede estar vacio."
    }

    [Environment]::SetEnvironmentVariable(
        "SUPABASE_ACCESS_TOKEN",
        $token,
        "User"
    )

    Write-Host "SUPABASE_ACCESS_TOKEN configurado para tu usuario."
    Write-Host "Cierra y abre una terminal nueva antes de ejecutar OpenCode."
}
finally {
    if ($pointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }

    Remove-Variable -Name token -ErrorAction SilentlyContinue
}