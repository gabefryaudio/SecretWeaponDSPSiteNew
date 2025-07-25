@echo off
echo ========================================
echo Setting up Git and pushing to GitHub
echo ========================================
echo.

REM Initialize git repository
echo Step 1: Initializing Git repository...
git init
echo.

REM Add all files
echo Step 2: Adding all files...
git add .
echo.

REM Create first commit
echo Step 3: Creating commit...
git commit -m "Initial commit of new Secret Weapon DSP website"
echo.

REM Add GitHub remote
echo Step 4: Connecting to GitHub...
git remote add origin https://github.com/gabefryaudio/SecretWeaponDSPSiteNew.git
echo.

REM Push to GitHub
echo Step 5: Pushing to GitHub (you may need to enter your GitHub credentials)...
git push -u origin main

REM If main branch doesn't exist, try master
if errorlevel 1 (
    echo.
    echo Trying with master branch instead...
    git push -u origin master
)

echo.
echo ========================================
echo Done! Your code should now be on GitHub.
echo ========================================
echo.
echo Next steps:
echo 1. Go back to your Vercel terminal
echo 2. Select "Continue with GitHub"
echo 3. Follow the prompts to import your repository
echo.
pause