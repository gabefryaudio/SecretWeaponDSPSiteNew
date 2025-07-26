@echo off
echo ========================================
echo Deploying clean URL structure
echo ========================================
echo.

REM First run the link update script
echo Step 1: Updating all internal links...
call update-homepage-links.bat

echo.
echo Step 2: Adding changes to git...
git add -A

echo.
echo Step 3: Committing changes...
git commit -m "Implement clean URL structure with /home as homepage"

echo.
echo Step 4: Pushing to GitHub...
git push

echo.
echo Step 5: Deploying to Vercel...
vercel --prod

echo.
echo ========================================
echo Done! Your site now has clean URLs:
echo - secretweapondsp.com/home
echo - secretweapondsp.com/plugins
echo - secretweapondsp.com/contact
echo - etc.
echo ========================================
pause