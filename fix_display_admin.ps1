# Script de reparación de pantalla integrada con permisos de Administrador
try {
    Write-Host "1. Habilitando la pantalla integrada (CMN1521)..." -ForegroundColor Yellow
    Get-PnpDevice -InstanceId 'DISPLAY\CMN1521\4&31E53192&1&UID8388688' | Enable-PnpDevice -Confirm:$false -ErrorAction SilentlyContinue

    Write-Host "2. Reiniciando controlador de gráficos Intel Iris Xe..." -ForegroundColor Yellow
    $intelGpu = Get-PnpDevice -Class Display | Where-Object { $_.FriendlyName -like '*Intel*' }
    if ($intelGpu) {
        Disable-PnpDevice -InstanceId $intelGpu.InstanceId -Confirm:$false
        Start-Sleep -Seconds 2
        Enable-PnpDevice -InstanceId $intelGpu.InstanceId -Confirm:$false
        Write-Host "Controlador Intel reiniciado correctamente." -ForegroundColor Green
    }

    Write-Host "3. Forzando detección de pantallas (PnP)..." -ForegroundColor Yellow
    pnputil /scan-devices

    Write-Host "4. Cambiando modo de proyección a Duplicado/Interno..." -ForegroundColor Yellow
    DisplaySwitch.exe /clone
    Start-Sleep -Seconds 1
    DisplaySwitch.exe /internal

    Write-Host "¡Proceso de reparación completado con éxito!" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Read-Host -Prompt "Presiona ENTER para salir..."
