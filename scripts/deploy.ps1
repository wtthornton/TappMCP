# Smart MCP Production Deployment Script for Windows
param(
    [string]$Tag = "latest",
    [string]$Port = "3000"
)

# Configuration
$ImageName = "smart-mcp"
$ContainerName = "smart-mcp-prod"

Write-Host "🚀 Starting Smart MCP Production Deployment" -ForegroundColor Green
Write-Host "Image: ${ImageName}:${Tag}" -ForegroundColor Cyan
Write-Host "Container: ${ContainerName}" -ForegroundColor Cyan
Write-Host "Port: ${Port}" -ForegroundColor Cyan

# Build the Docker image
Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
docker build -t "${ImageName}:${Tag}" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

# Stop and remove existing container if it exists
Write-Host "🛑 Stopping existing container..." -ForegroundColor Yellow
docker stop $ContainerName 2>$null
docker rm $ContainerName 2>$null

# Run the new container
Write-Host "🚀 Starting new container..." -ForegroundColor Yellow
docker run -d `
  --name $ContainerName `
  --restart unless-stopped `
  -p "${Port}:3000" `
  -e NODE_ENV=production `
  -e PORT=3000 `
  -v smart-mcp-data:/app/data `
  "${ImageName}:${Tag}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start container!" -ForegroundColor Red
    exit 1
}

# Wait for container to start
Write-Host "⏳ Waiting for container to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Health check
Write-Host "🏥 Performing health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:${Port}/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed! Deployment successful." -ForegroundColor Green
        Write-Host "🌐 Application is running at http://localhost:${Port}" -ForegroundColor Cyan
        Write-Host "🏥 Health endpoint: http://localhost:${Port}/health" -ForegroundColor Cyan
    } else {
        throw "Health check failed with status code: $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Health check failed! Deployment unsuccessful." -ForegroundColor Red
    Write-Host "📋 Container logs:" -ForegroundColor Yellow
    docker logs $ContainerName
    exit 1
}

Write-Host "🎉 Smart MCP Production Deployment Complete!" -ForegroundColor Green
