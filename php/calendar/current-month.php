<?php
$m = $_GET['date'];
if ($m > 12) $m -= 12;
$monthNumber = intval(date("$m"));
$year = date("Y") + $_GET['year'];

$monthName = array(
    1 => "Janeiro",
    2 => "Fevereiro",
    3 => "Março",
    4 => "Abril",
    5 => "Maio",
    6 => "Junho",
    7 => "Julho",
    8 => "Agosto",
    9 => "Setembro",
    10 => "Outubro",
    11 => "Novembro",
    12 => "Dezembro"
);

$currentMonth = $monthName[$monthNumber];

echo $currentMonth . "/" . $year;

?>
