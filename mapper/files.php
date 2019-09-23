<?php

if (isset($_POST['list'])) {
    $dir = "../maps/";
    $a = scandir($dir);
    $b = count($a);
    $res = array();


    for ($x=0; $x<$b; $x++) {
        if (strpos($a[$x], "json") === false)
            continue;
        $res[] = $a[$x];
    }

    echo json_encode($res);
} else if(isset($_POST['file'])) {
    $fn = '../maps/' . $_POST['file'];
    $data = $_POST['data'];
    $v = file_put_contents($fn, $data);
}
?>
