Add-Type -AssemblyName System.Drawing

$src  = "C:\Users\Spark\Downloads\Omnia_Gamal_Frontend\screenshots\screenshots"
$out  = "C:\Users\Spark\Downloads\Omnia_Gamal_Frontend\portfolio\assets\img"

# folder name -> project slug
$slugMap = @{
  "elgarage"     = "elgarage"
  "G1 landscape" = "g1-landscape"
  "mobdra"       = "mobdra"
  "sela"         = "sela"
  "sellicon"     = "sellicon"
  "Tree-systems" = "tree-systems"
}

# caption typo/label fixes (by lowercased raw filename, no ext)
$capFix = @{
  "home-pge"                = "Home Page"
  "our-prtofilio"           = "Our Portfolio"
  "bulid-details"           = "Build Details"
  "maintainance"            = "Maintenance"
  "partnerships,jvs & mous" = "Partnerships, JVs & MOUs"
  "our-products&solutions"  = "Products & Solutions"
  "searchforcode"           = "Search by Code"
  "filteration"             = "Filtering"
  "addtocart"               = "Add to Cart"
  "services-details"        = "Service Details"
  "service-details"         = "Service Details"
  "internal-operation"      = "Internal Operation"
  "service-operation"       = "Service Operation"
  "venue-operation"         = "Venue Operation"
  "sela-wall"               = "Sela Wall"
  "strategy-fit"            = "Strategy Fit"
}

function Get-Slug([string]$s){
  $s = $s.ToLower()
  $s = [System.Text.RegularExpressions.Regex]::Replace($s, "[^a-z0-9]+", "-")
  return $s.Trim("-")
}
function Get-Caption([string]$raw){
  $k = $raw.ToLower()
  if($capFix.ContainsKey($k)){ return $capFix[$k] }
  $t = [System.Text.RegularExpressions.Regex]::Replace($raw, "[-_]+", " ")
  $ti = (Get-Culture).TextInfo
  return $ti.ToTitleCase($t.ToLower())
}

# JPEG encoder
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
function Save-Jpeg([System.Drawing.Bitmap]$bmp, [string]$path, [int]$quality){
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
  $bmp.Save($path, $jpegCodec, $ep)
  $ep.Dispose()
}
function Resize-Save([System.Drawing.Image]$img, [int]$maxW, [string]$path, [int]$q){
  $w = $img.Width; $h = $img.Height
  $scale = if($w -gt $maxW){ $maxW / $w } else { 1.0 }
  $nw = [int]([Math]::Round($w * $scale)); $nh = [int]([Math]::Round($h * $scale))
  $bmp = New-Object System.Drawing.Bitmap($nw, $nh)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $nw, $nh)
  Save-Jpeg $bmp $path $q
  $g.Dispose(); $bmp.Dispose()
}

$manifest = [System.Collections.Specialized.OrderedDictionary]::new()

Get-ChildItem $src -Directory | ForEach-Object {
  $folder = $_.Name
  if(-not $slugMap.ContainsKey($folder)){ Write-Host "skip $folder"; return }
  $slug = $slugMap[$folder]
  $dstFull  = Join-Path $out $slug
  $dstThumb = Join-Path $dstFull "thumb"
  New-Item -ItemType Directory -Force -Path $dstThumb | Out-Null
  $list = New-Object System.Collections.ArrayList

  Get-ChildItem $_.FullName -Filter *.png | Sort-Object Name | ForEach-Object {
    $raw = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
    $nslug = Get-Slug $raw
    $cap = Get-Caption $raw
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    $fullPath  = Join-Path $dstFull  "$nslug.jpg"
    $thumbPath = Join-Path $dstThumb "$nslug.jpg"
    Resize-Save $img 1600 $fullPath  86
    Resize-Save $img 780  $thumbPath 80
    $img.Dispose()
    [void]$list.Add([PSCustomObject]@{
      full    = "assets/img/$slug/$nslug.jpg"
      thumb   = "assets/img/$slug/thumb/$nslug.jpg"
      caption = $cap
      slug    = $nslug
    })
    Write-Host "  $slug/$nslug.jpg"
  }
  $manifest[$slug] = $list
}

# emit JS manifest
$json = $manifest | ConvertTo-Json -Depth 6
$jsPath = "C:\Users\Spark\Downloads\Omnia_Gamal_Frontend\portfolio\assets\img-manifest.js"
"window.PORTFOLIO_IMAGES = $json;" | Out-File -FilePath $jsPath -Encoding utf8
Write-Host "manifest -> $jsPath"
Write-Host "DONE"
