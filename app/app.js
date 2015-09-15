var Users = (function() {

    return {

        find: function(query, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/search/users?q=' + query, true);
            xhr.send(null);
            xhr.addEventListener('load', function(event) {
                callback(JSON.parse(event.target.responseText));
            }, false);


        },
        get: function(login, callback) {

            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/users/' + login, true);
            xhr.send(null);
            xhr.addEventListener('load', function(event) {
                callback(JSON.parse(event.target.responseText));
            }, false);


        }

    };


})();


var searchArea = document.getElementById('searchArea');
var searchInput = document.getElementById('searchInput');

searchArea.addEventListener('click', function(event) {
    if (event.target.nodeName.toLowerCase() === 'li') {

        Users.get(event.target.dataset.login, function(data) {

            console.log(data);

        });


        /*var xhr = new XMLHttpRequest();
        xhr.open('GET', '/templates/profile.html', true);
        xhr.send(null);
        xhr.addEventListener('load', function(event) {

            console.log(event.target.responseText);

        }, false);*/


    }

}, false);


searchInput.addEventListener('keyup', function(event) {
    var _self = this;

    if (_self.value.length >= 3) {
        setTimeout(function() {

            Users.find(_self.value, function(data) {
                var userList = document.createDocumentFragment();
                var ul = document.createElement('ul');
                var li = null;
                ul.className = "search-results__result";

                data.items.forEach(function(item) {
                    li = document.createElement('li');
                    li.className = "search-results__item";
                    li.dataset.login = item.login;
                    li.appendChild(document.createTextNode(item.login));
                    userList.appendChild(li);

                });

                ul.appendChild(userList);
                searchArea.replaceChild(ul, searchArea.firstElementChild);

            });

        }, 500);

    }

}, false);





