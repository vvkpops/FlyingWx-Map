src/index.html:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aviation Weather Navigational Data</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Aviation Weather Navigational Data</h1>
        <nav>
            <button id="load-airports">Load Airports</button>
            <button id="load-navaids">Load Navigational Aids</button>
            <button id="load-fixes">Load Fixes</button>
        </nav>
    </header>
    <main>
        <div id="map" style="height: 600px;"></div>
    </main>
    <script src="api.js"></script>
    <script src="map.js"></script>
    <script src="app.js"></script>
</body>
</html>