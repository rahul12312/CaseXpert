$docsDir = "c:\Users\tipte\Downloads\CaseXpert-main (3)\CaseXpert-main\frontend\public\documents"
if (!(Test-Path -Path $docsDir)) {
    New-Item -ItemType Directory -Path $docsDir | Out-Null
}

$url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
$files = @(
    "Bar_Council_ID_Rahul.pdf",
    "LLB_Degree_Certificate.pdf",
    "Practice_License_2023.pdf",
    "Tax_Registration_Card.pdf",
    "Address_Proof_Utility.pdf"
)

foreach ($file in $files) {
    $filePath = Join-Path -Path $docsDir -ChildPath $file
    Invoke-WebRequest -Uri $url -OutFile $filePath
    Write-Host "Downloaded: $file"
}
