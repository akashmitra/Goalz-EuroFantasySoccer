app.config(function(localStorageServiceProvider) {
    localStorageServiceProvider
        .setNotify(true, true)
});

app.config(['KeepaliveProvider', 'IdleProvider', function(KeepaliveProvider, IdleProvider) {
  IdleProvider.idle(600);
  IdleProvider.timeout(5);
  KeepaliveProvider.interval(300);
}]);
