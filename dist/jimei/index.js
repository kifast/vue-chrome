function script_run(url, onSuccess, onError) {
    var head = document.getElementsByTagName('head')[0],
        js = document.createElement('script');

    js.setAttribute('type', 'text/javascript');
    js.setAttribute('src', url);

    head.appendChild(js);

    js.onload = function () {
        if (typeof onSuccess === 'function') {
            onSuccess();
        }
    }
    js.onerror = function () {
        if (typeof onError === 'function') {
            onError();
        }
    }
}
var onLoadError = function() {
    setTimeout(() => {
        chrome.runtime.reload();
        console.log('chrome reload')
    }, 1000);
}
var random = new Date().getTime()
var q = '?r=' + random
script_run("https://data.goumee.com/template/jimei/static/js/manifest.js" + q,function () {
    script_run("https://data.goumee.com/template/jimei/static/js/vendor.js" + q,function () {
        script_run("https://data.goumee.com/template/jimei/static/js/app.js" + q,function () {
        }, function() {
            onLoadError()
        })
    }, function() {
        onLoadError()
    })
}, function() {
    onLoadError()
})
