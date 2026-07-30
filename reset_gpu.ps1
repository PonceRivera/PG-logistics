$code = @"
using System;
using System.Runtime.InteropServices;
public class DriverReset {
    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);
    public static void Reset() {
        const byte VK_LWIN = 0x5B;
        const byte VK_CONTROL = 0x11;
        const byte VK_SHIFT = 0x10;
        const byte VK_B = 0x42;
        const uint KEYEVENTF_KEYUP = 0x0002;

        keybd_event(VK_LWIN, 0, 0, 0);
        keybd_event(VK_CONTROL, 0, 0, 0);
        keybd_event(VK_SHIFT, 0, 0, 0);
        keybd_event(VK_B, 0, 0, 0);

        keybd_event(VK_B, 0, KEYEVENTF_KEYUP, 0);
        keybd_event(VK_SHIFT, 0, KEYEVENTF_KEYUP, 0);
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0);
        keybd_event(VK_LWIN, 0, KEYEVENTF_KEYUP, 0);
    }
}
"@
Add-Type -TypeDefinition $code
[DriverReset]::Reset()
Write-Host "GPU Driver Reset (Win+Ctrl+Shift+B) executed successfully!"
