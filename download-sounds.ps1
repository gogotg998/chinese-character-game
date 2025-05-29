# 创建sounds目录
$soundsDir = "public/sounds"
if (-not (Test-Path $soundsDir)) {
    New-Item -ItemType Directory -Path $soundsDir
}

# 音效文件URL
$soundUrls = @{
    "correct.mp3" = "https://assets.mixkit.co/sfx/download/mixkit-correct-answer-tone-2870.wav"
    "wrong.mp3" = "https://assets.mixkit.co/sfx/download/mixkit-wrong-answer-fail-notification-946.wav"
    "complete.mp3" = "https://assets.mixkit.co/sfx/download/mixkit-achievement-bell-600.wav"
}

# 下载每个音效文件
foreach ($file in $soundUrls.Keys) {
    $url = $soundUrls[$file]
    $outputPath = Join-Path $soundsDir $file
    
    Write-Host "正在下载 $file..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $outputPath
        Write-Host "成功下载 $file" -ForegroundColor Green
    }
    catch {
        Write-Host "下载 $file 失败: $_" -ForegroundColor Red
    }
}

Write-Host "`n所有音效文件下载完成！" -ForegroundColor Green
Write-Host "文件保存在: $soundsDir" 