<#
reads ids from file
returns csv of results for each spreadsheet
honestly not amazing but pretty ok for my first .ps1
#>

Write-Host "hello world its me, a tired intern"
$ids = Get-Content -Path "./search_ids.txt"
#Write-Host $ids
$idarray = $ids -split " "


for($i = 0; $i -lt $idarray.Length; $i++)
{
   $currentID = $idarray[$i]
   Write-Host Getting proposals using $currentID...
   #node sdg1.js $currentID | Out-File -FilePath ".\$currentID.html"
   #node sdg1.js $currentID -match '<a .*class="usa-link.*href.*<\/a>' | Out-File -FilePath ".\matchesFor$currentID.html"
   node sdg_ptl.js $currentID | Out-File -FilePath ".\$currentID.html"

   #making hrefarray an array lol
   $hrefarray = Get-Content -Path ".\$currentID.html"
   $hrefarray = $hrefarray -split "\n"

   #make a file based on the id name also, pass that to the js to write to
   $csvtitle = -join($currentID, "_", $(Get-Date -Format "MMddyy"), "_", $(Get-Date -Format "HHmm"))
   New-Item -Name "$csvtitle.csv"
   
   # #call next script to get info for csv (beginning of the end!!!)
   for($j = 0; $j -lt $hrefarray.Length; $j++)
   {
      Write-Host "Adding $j/$($hrefarray.Length)"
      node sdg_ltcsv.js $hrefarray[$j] | Out-File -Append -FilePath "./results/$csvtitle.csv"
   }
}