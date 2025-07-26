@echo off
echo Updating all links to use home.html instead of secretweapon-homepage.html...

powershell -Command "(Get-Content 'home.html') -replace 'secretweapon-homepage.html', 'home.html' | Set-Content 'home.html'"
powershell -Command "(Get-Content 'canvas-compressor-page.html') -replace 'secretweapon-homepage.html', 'home.html' | Set-Content 'canvas-compressor-page.html'"
powershell -Command "(Get-Content 'quantum-eq-page.html') -replace 'secretweapon-homepage.html', 'home.html' | Set-Content 'quantum-eq-page.html'"
powershell -Command "(Get-Content 'plugins-overview.html') -replace 'secretweapon-homepage.html', 'home.html' | Set-Content 'plugins-overview.html'"
powershell -Command "(Get-Content 'contact-page.html') -replace 'secretweapon-homepage.html', 'home.html' | Set-Content 'contact-page.html'"
powershell -Command "(Get-Content 'support-page.html') -replace 'secretweapon-homepage.html', 'home.html' | Set-Content 'support-page.html'"

echo Done! All links updated.
pause