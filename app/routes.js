

module.exports = function (app) {


    // application -------------------------------------------------------------
    app.get('/simplelist', function (req, res) {
        res.sendFile(__dirname + '/demos/simplelist/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    app.get('/helloworld', function (req, res) {
        res.sendFile(__dirname + '/demos/helloworld/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
