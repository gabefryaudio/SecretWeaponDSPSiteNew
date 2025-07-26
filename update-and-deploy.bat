@echo off
echo ========================================
echo Updating and deploying to Vercel
echo ========================================
echo.

REM Add the updated index.html
echo Step 1: Adding updated files...
git add index.html
echo.

REM Commit the change
echo Step 2: Committing changes...
git commit -m "Fix: Redirect index.html to homepage"
echo.

REM Push to GitHub
echo Step 3: Pushing to GitHub...
git push
echo.

REM Deploy to Vercel production
echo Step 4: Deploying to Vercel production...
vercel --prod
echo.

echo ========================================
echo Done! Your site should be updated.
echo ========================================
echo.
echo Your homepage should now be the default page!
echo.
pause