@echo off
echo ========================================
echo Fixing Git setup and pushing to GitHub
echo ========================================
echo.

REM Set up Git identity
echo Step 1: Setting up your Git identity...
git config --global user.email "gabefry@gmail.com"
git config --global user.name "gabefryaudio"
echo Git identity configured!
echo.

REM Remove existing remote if it exists
echo Step 2: Cleaning up existing remote...
git remote remove origin 2>nul
echo.

REM Add GitHub remote fresh
echo Step 3: Adding GitHub repository...
git remote add origin https://github.com/gabefryaudio/SecretWeaponDSPSiteNew.git
echo.

REM Add all files
echo Step 4: Adding all files...
git add .
echo.

REM Create commit
echo Step 5: Creating commit...
git commit -m "Initial commit of new Secret Weapon DSP website"
echo.

REM Create main branch and push
echo Step 6: Creating main branch and pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo Success! Your code should now be on GitHub.
echo ========================================
echo.
echo You can check it at: https://github.com/gabefryaudio/SecretWeaponDSPSiteNew
echo.
echo Next steps:
echo 1. Go back to your Vercel terminal
echo 2. Select "Continue with GitHub"
echo 3. Authorize Vercel to access your GitHub
echo 4. Select your repository: SecretWeaponDSPSiteNew
echo.
pause