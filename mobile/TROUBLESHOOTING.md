# Expo QR Code Troubleshooting Guide

If Expo Go spins/fails to load when scanning the QR code, try these solutions:

## Quick Fixes

### 1. Check Network Connection
- **Ensure phone and computer are on the SAME Wi-Fi network**
- Disable mobile data on your phone (force Wi-Fi only)
- Try disconnecting and reconnecting to Wi-Fi on both devices

### 2. Use Tunnel Mode
If you're on different networks or having connection issues:

```bash
cd mobile
expo start --tunnel
```

This uses Expo's tunnel service to connect through the internet (slower but more reliable).

### 3. Use LAN Mode Explicitly
```bash
cd mobile
expo start --lan
```

### 4. Clear Cache and Restart
```bash
cd mobile
expo start -c
```

The `-c` flag clears the Metro bundler cache.

### 5. Check Firewall Settings
- Windows Firewall may be blocking the connection
- Allow Node.js and Expo through the firewall
- Temporarily disable firewall to test

### 6. Verify Metro Bundler is Running
After running `npm start` or `expo start`, you should see:
- Metro bundler starting
- QR code displayed in terminal
- Network URL shown (e.g., `exp://192.168.1.100:8081`)

### 7. Manual Connection
If QR code doesn't work:
1. Note the URL shown in terminal (e.g., `exp://192.168.1.100:8081`)
2. Open Expo Go app manually
3. Enter the URL manually in Expo Go

### 8. Check Expo Go App Version
- Update Expo Go to the latest version
- Ensure it's compatible with Expo SDK 49

### 9. Restart Everything
```bash
# Stop the current process (Ctrl+C)
# Then:
cd mobile
rm -rf node_modules/.cache
npm start
```

### 10. Check for Error Messages
Look for error messages in:
- Terminal where `expo start` is running
- Expo Go app (shake device to open developer menu)
- Check Metro bundler logs

## Common Error Messages

### "Unable to connect to Metro bundler"
- Check firewall settings
- Verify both devices on same network
- Try tunnel mode: `expo start --tunnel`

### "Network response timed out"
- Network connectivity issue
- Try tunnel mode or check Wi-Fi

### "Unable to resolve module"
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Alternative: Use Development Build

If Expo Go continues to have issues, consider creating a development build:

```bash
cd mobile
npx expo install expo-dev-client
expo run:android  # or expo run:ios
```

## Still Not Working?

1. Check Expo status: https://status.expo.dev
2. Verify your Expo CLI version: `npx expo --version`
3. Try using Expo Dev Tools: `expo start --dev-client`
4. Check if port 8081 is available (Metro bundler default port)




