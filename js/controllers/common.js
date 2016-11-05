(function (testthis) {
    var privateTest = function () {
        console.log('Test this');
    };

    testthis.helloworld = function () {
        console.log('Hello World');
    };

} (testthis));