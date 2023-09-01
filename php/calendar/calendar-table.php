<?php 
$m = $_GET['date'];
$y = date("Y");
if ($m > 12) $m -= 12;
$lastDay = date("t", strtotime(date("Y-$m-1")));
$currentMonth = date("m");
$currentYear = date("Y") + $_GET['year'];
$currentDay = date("d");
$response = "<tr>";

for ($i = 1; $i <= $lastDay; $i++) {
    $weekDay = date('l', strtotime(date("$currentYear-$m-$i")));
    
    if($i == 1 && $weekDay != "Monday") {
        switch ($weekDay) {
            case "Tuesday":
                $response .= "<td><div class='filler'></div></td>";
                break;
            case "Wednesday":
                $response .= "<td><div class='filler'></div></td><td><div class='filler'></div></td>";
                break;
            case "Thursday":
                $response .= "<td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td>";
                break;
            case "Friday":
                $response .= "<td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td>";
                break;
        }
    }
    
    if ($weekDay != "Saturday" && $weekDay != "Sunday") {
        if ($i == $currentDay && $m == $currentMonth && $y == $currentYear) {
            $response .= "<td><div class='day-wrapper'><div class='day current-day'>$i</div></div></td>";
        } else {
            $response .= "<td><div class='day-wrapper'><div class='day'>$i</div></div></td>";
        }
    }
    
    if ($weekDay == "Friday") {
        $response .= "</tr><tr>";
    }
}

echo $response . "</tr>";
