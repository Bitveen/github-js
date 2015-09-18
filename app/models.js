var Users = (function() {
    /* Закрытые методы и свойства */

    return {
        find: function(query, callback) {
            var xhr = new XMLHttpRequest();

            xhr.open('GET', 'https://api.github.com/search/users?q=' + query, true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                }

            }, false);

        },
        getInfo: function(login, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/users/' + login, true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                }

            }, false);

        },
        getRepositories: function(login, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/users/' + login + '/repos', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                }
            }, false);

        },
        getFollowers: function(login, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/users/' + login + '/followers', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                }
            }, false);

        },
        getFollowings: function(login, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/users/' + login + '/following', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                }
            }, false);

        }
    };
})();