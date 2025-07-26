@echo off
echo Updating all links to use clean URLs (no .html)...

REM Update all HTML files to use clean URLs
powershell -Command "(Get-Content 'home.html') -replace 'home.html', '/' -replace 'plugins-overview.html', '/plugins' -replace 'support-page.html', '/support' -replace 'contact-page.html', '/contact' -replace 'canvas-compressor-page.html', '/canvas-comp' -replace 'quantum-eq-page.html', '/quantum-eq' | Set-Content 'home.html'"

powershell -Command "(Get-Content 'canvas-compressor-page.html') -replace 'home.html', '/' -replace 'plugins-overview.html', '/plugins' -replace 'support-page.html', '/support' -replace 'contact-page.html', '/contact' | Set-Content 'canvas-compressor-page.html'"

powershell -Command "(Get-Content 'quantum-eq-page.html') -replace 'home.html', '/' -replace 'plugins-overview.html', '/plugins' -replace 'support-page.html', '/support' -replace 'contact-page.html', '/contact' | Set-Content 'quantum-eq-page.html'"

powershell -Command "(Get-Content 'plugins-overview.html') -replace 'home.html', '/' -replace 'plugins-overview.html', '/plugins' -replace 'support-page.html', '/support' -replace 'contact-page.html', '/contact' -replace 'canvas-compressor-page.html', '/canvas-comp' -replace 'quantum-eq-page.html', '/quantum-eq' | Set-Content 'plugins-overview.html'"

powershell -Command "(Get-Content 'contact-page.html') -replace 'home.html', '/' -replace 'plugins-overview.html', '/plugins' -replace 'support-page.html', '/support' -replace 'contact-page.html', '/contact' | Set-Content 'contact-page.html'"

powershell -Command "(Get-Content 'support-page.html') -replace 'home.html', '/' -replace 'plugins-overview.html', '/plugins' -replace 'support-page.html', '/support' -replace 'contact-page.html', '/contact' -replace 'canvas-compressor-page.html', '/canvas-comp' -replace 'quantum-eq-page.html', '/quantum-eq' | Set-Content 'support-page.html'"

echo Done! All links now use clean URLs.
echo.
echo Deploying changes to Vercel...
git add -A
git commit -m "Implement clean URLs without .html extensions"
git push
vercel --prod
pause