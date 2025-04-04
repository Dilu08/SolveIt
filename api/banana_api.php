<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$api_url = "http://marcconrad.com/uob/banana/api.php";
$response = @file_get_contents($api_url);

if ($response === FALSE) {
    error_log("Error: Unable to fetch data from Banana API");
    echo json_encode(["error" => "Failed to retrieve data from the Banana API"]);
    exit;
}

$json_data = json_decode($response, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("Error: Invalid JSON received from Banana API");
    echo json_encode(["error" => "Invalid JSON received from the Banana API"]);
    exit;
}

echo $response;
?>